import pc from "picocolors";
import {
  isLogedIn,
  readConfigFile,
  writeProjectConfig,
  readEnvFile,
  decryptEnvValues,
  getConfiguredClient,
} from "@nvii/env-helpers";
import { login } from "./auth/login";
import { readFileSync, promises as fs } from "fs";
import path, { join } from "path";
import { Project } from "@nvii/db";
import inquirer from "inquirer";
import { argv } from "process";

const DOT_ENV_FILE = ".env";

export async function pullRemoteChanges() {
  // NOTE: Change later to work with args for the pull command
  // if (argv) {
  //   console.log({ argv }, argv[3], argv[4]);
  //   return;
  // }
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to pull a project."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();
    if (!userConfig?.userId) {
      console.log(pc.red("No user ID found. Please log in again."));
      return;
    }

    // TODO: Complete this one
    // const { selectedProjectBranch } = await inquirer.prompt([
    //   {
    //     type: "list",
    //     name: "selectedProjectBranch",
    //     message: "Select a project branch to pull from:",
    //     choices: versions.map((version) => ({
    //       branch: version.branch,
    //       name: version.Project.name,
    //     })),
    //   },
    // ]);

    const cwd = process.cwd();
    const projectPath = join(cwd, ".envi/envi.json");

    const content = readFileSync(projectPath, "utf-8");

    const projectId = (JSON.parse(content) as { projectId: string }[])[0]
      .projectId;

    if (!projectId) {
      console.error(
        pc.red(
          "❌ Project not linked. Please run 'nvii link' to link your project first.",
        ),
      );
      process.exit(1);
    }

    const client = await getConfiguredClient();
    const response = await client.get(
      `/projects/${userConfig.userId}/${projectId}`,
    );
    const project = response.data as Project;

    if (!project) {
      console.log(pc.yellow("No project found for this user or repository."));
      process.exit(1);
    }

    if (!project.content) {
      console.log(pc.yellow("No content found for this project envs."));
      process.exit(1);
    }
    const envFilePath = path.join(cwd, DOT_ENV_FILE);
    const existingEnv = await readEnvFile();

    const finalEnv: Record<string, string> = { ...existingEnv };
    let commentedLines = "";
    // keep track of changes
    const changedEnvs: Record<string, string>[] = [];

    // decrypt envs before comparing
    const decryptedEnv = decryptEnvValues(
      project?.content as Record<string, string>,
      userConfig.userId,
    );

    for (const [key, value] of Object.entries(decryptedEnv)) {
      const normalizedExisting = existingEnv[key]?.replace(/^"|"$/g, "") || "";
      const normalizedNew = String(value).replace(/^"|"$/g, "") || "";

      if (
        existingEnv[key] !== undefined &&
        normalizedExisting === normalizedNew
      ) {
        const { overwrite } = await inquirer.prompt([
          {
            type: "confirm",
            name: "overwrite",
            message: `${pc.yellowBright("Warning")}: ${key} exists in local .env. Overwrite? Current: "${normalizedExisting}" New: "${normalizedNew}"`,
            default: false,
          },
        ]);
        if (overwrite) {
          finalEnv[key] = value;
          changedEnvs.push({
            key,
            value,
            original: normalizedExisting,
          });
        } else {
          commentedLines += `# ${key}=${value}\n`;
        }
      } else {
        finalEnv[key] = value;
      }
    }

    const finalEnvContent =
      Object.entries(finalEnv)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n") +
      "\n" +
      commentedLines;

    await fs.writeFile(envFilePath, finalEnvContent);
    // log change summary
    if (changedEnvs.length > 0) {
      console.log(
        pc.bold(
          `\n📜 Change summary for project: ${pc.cyan(`${project.name} - ${project.id}`)}`,
        ),
      );

      console.log(pc.dim("--------------------------------------------------"));
      changedEnvs.forEach((change) => {
        console.log(
          `${pc.yellow(`${change.key}:`)} changed from ${change.original} to ${change.value})}`,
        );
        console.log(`Date:    ${new Date(Date.now()).toLocaleString()}`);
        console.log(
          pc.dim("--------------------------------------------------"),
        );
      });
    }
    console.log("\n");
    await writeProjectConfig(project.id);
    console.log(pc.green(".env file updated successfully!"));
  } catch (error: Error | any) {
    console.error(pc.red("\nError linking project:"), error.message);
    process.exit(1);
  }
}

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

const DOT_ENV_FILE = ".env";

export async function pullRemoteChanges() {
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to link a project."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();
    if (!userConfig?.userId) {
      console.log(pc.red("No user ID found. Please log in again."));
      return;
    }

    const cwd = process.cwd();
    const projectPath = join(cwd, ".envi/envi.json");

    const content = readFileSync(projectPath, "utf-8");
    const projectId = JSON.parse(content).projectId;

    const client = await getConfiguredClient();
    const response = await client.get(
      `/projects/${userConfig.userId}/${projectId}`,
    );
    const project = response.data as Project;

    if (!project) {
      console.log(pc.yellow("No project found for this user or repository."));
      return;
    }

    if (!project.content) {
      console.log(pc.yellow("No content found for this project envs."));
      return;
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

    if (changedEnvs.length > 0) {
      // log change summary
      console.log(pc.bold("\nChange summary:"));
      changedEnvs.map((item) => {
        console.log(
          `${item.key}: changed from ${item.original} to ${item.value}`,
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

import { Project } from "@nvii/db";
import {
  decryptEnvValues,
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readEnvFile,
  writeProjectConfig,
} from "@nvii/env-helpers";
import { promises as fs } from "fs";
import inquirer from "inquirer";
import path from "path";
import pc from "picocolors";
import { login } from "./auth/login";

const DOT_ENV_FILE = ".env";

export async function linkProject() {
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

    const client = await getConfiguredClient();
    const response = await client.get(`/projects/${userConfig.userId}`);
    if (response.data) {
      console.log({ data: response.data });
      return;
    }
    const projects = response.data as Project[];

    if (!projects.length) {
      console.log(pc.yellow("No projects found for this user."));
      return;
    }
    console.log({ response });
    const { selectedProjectId } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedProjectId",
        message: "Select a project to link:",
        choices: projects.map((proj) => ({
          name: proj.name,
          value: proj.id,
        })),
      },
    ]);

    const selectedProject = projects.find(
      (proj) => proj.id === selectedProjectId,
    );

    if (!selectedProject) {
      console.log(pc.red("Selected project not found."));
      return;
    }

    const currentDir = process.cwd();

    if (!selectedProject.content) {
      return;
    }

    const { createEnvFile } = await inquirer.prompt([
      {
        type: "confirm",
        name: "createEnvFile",
        message:
          "This project contains a .env file. Do you want to populate its values?",
        default: false,
      },
    ]);

    if (!createEnvFile) {
      console.log(pc.yellow("Skipping .env file creation."));
      return;
    }

    const envFilePath = path.join(currentDir, DOT_ENV_FILE);
    let existingEnv = await readEnvFile();

    const finalEnv: Record<string, string> = { ...existingEnv };
    let commentedLines = "";

    for (const [key, value] of Object.entries(selectedProject.content)) {
      const normalizedExisting = existingEnv[key]?.replace(/^"|"$/g, "") || "";
      const normalizedNew = String(value).replace(/^"|"$/g, "") || "";

      console.log({ normalizedNew, normalizedExisting });
      if (
        existingEnv[key] !== undefined &&
        normalizedExisting === normalizedNew
      ) {
        const { overwrite } = await inquirer.prompt([
          {
            type: "confirm",
            name: "overwrite",
            message: `Conflict: ${key} exists. Overwrite? Current: "${normalizedExisting}" New: "${normalizedNew}"`,
            default: false,
          },
        ]);
        if (overwrite) {
          finalEnv[key] = value;
        } else {
          commentedLines += `# ${key}=${value}\n`;
        }
      } else {
        finalEnv[key] = value;
      }
    }

    const decryptedEnv = decryptEnvValues(finalEnv, userConfig.userId);

    const finalEnvContent =
      Object.entries(decryptedEnv)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n") +
      "\n" +
      commentedLines;

    await fs.writeFile(envFilePath, finalEnvContent);
    await writeProjectConfig(selectedProject.id);
    console.log(pc.green(".env file updated successfully!"));
  } catch (error) {
    console.error(pc.red("Error linking project:"), error);
  }
}

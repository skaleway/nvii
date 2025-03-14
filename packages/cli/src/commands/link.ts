import { prisma } from "@repo/database";
import { promises as fs } from "fs";
import inquirer from "inquirer";
import path from "path";
import pc from "picocolors";
import { isLogedIn, readConfigFile, readEnvFile } from "../helpers";
import { login } from "./login";

const ENV_FILE = ".envi";
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

    const projects = await prisma.project.findMany({
      where: { userId: userConfig.userId },
      select: { id: true, name: true, content: true },
    });

    if (!projects.length) {
      console.log(pc.yellow("No projects found for this user."));
      return;
    }

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
    const enviFilePath = path.join(currentDir, ENV_FILE);
    await fs.writeFile(
      enviFilePath,
      JSON.stringify({ projectId: selectedProject.id }, null, 2),
    );
    console.log(pc.green(`Project linked successfully!`));

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
      console.log({ key, value });
      if (existingEnv[key] !== undefined && existingEnv[key] !== value) {
        const { overwrite } = await inquirer.prompt([
          {
            type: "confirm",
            name: "overwrite",
            message: `Conflict: ${key} exists. Overwrite?`,
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

    const finalEnvContent =
      Object.entries(finalEnv)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n") +
      "\n" +
      commentedLines;

    await fs.writeFile(envFilePath, finalEnvContent);
    console.log(pc.green(".env file updated successfully!"));
  } catch (error) {
    console.error(pc.red("Error linking project:"), error);
  }
}

import { prisma } from "@repo/database";
import { promises as fs } from "fs";
import inquirer from "inquirer";
import path from "path";
import pc from "picocolors";
import {
  encryptEnvValues,
  isLogedIn,
  readConfigFile,
  readEnvFile,
} from "../helpers";
import { login } from "./login";

const ENV_FILE = ".envi";

/**
 * Prompts the user with a question using inquirer.
 * @param message - The message to display to the user.
 * @returns A promise resolving to the user input.
 */
async function promptUser(message: string): Promise<string> {
  const response = await inquirer.prompt([
    {
      type: "input",
      name: "answer",
      message: pc.cyan(message),
    },
  ]);
  return response.answer.trim();
}

/**
 * Creates a new project after verifying user authentication.
 */
export async function createProject() {
  try {
    // Ensure user is logged in
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to create a new project."));
      await login();
    }

    const projectName = await promptUser("Enter your project name:");
    if (!projectName) {
      console.error(pc.red("❌ Project name cannot be empty."));
      process.exit(1);
    }

    const userConfig = await readConfigFile();
    if (!userConfig?.userId || !userConfig?.deviceId) {
      console.error(
        pc.red("❌ Invalid user credentials. Please log in again."),
      );
      await login();
      return;
    }

    const currentDir = process.cwd();
    const filePath = path.join(currentDir, ENV_FILE);
    const envs = await readEnvFile();

    const encryptedEnvs = encryptEnvValues(envs);

    // Create project in database without .env content initially
    const project = await prisma.project.create({
      data: {
        userId: userConfig.userId,
        deviceId: userConfig.deviceId,
        name: projectName,
        content: "", // Initially set to empty
      },
    });

    console.log(pc.green(`✅ Project created successfully!`));
    console.log(pc.blue(`🆔 Project ID: ${pc.bold(project.id)}`));

    // Ask user if they want to save the .env content
    const { saveEnv } = await inquirer.prompt([
      {
        type: "confirm",
        name: "saveEnv",
        message:
          "This root project contains a .env file. Do you want to save it?",
        default: false,
      },
    ]);

    if (saveEnv) {
      await prisma.project.update({
        where: { id: project.id },
        data: { content: encryptedEnvs },
      });
      console.log(pc.magenta("🔍 Stored .env variables:"));
    } else {
      console.log(pc.yellow("⚠️ Skipped saving .env variables."));
    }

    // Save project data to .envi file
    const projectData = {
      projectId: project.id,
    };

    await fs.writeFile(filePath, JSON.stringify(projectData, null, 2));
    console.log(pc.dim(`📄 .envi file saved at: ${filePath}`));
  } catch (error) {
    console.error(pc.red("❌ Error creating project:"), error);
  }
}

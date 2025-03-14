import { prisma } from "@repo/database";
import { promises as fs } from "fs";
import path from "path";
import pc from "picocolors";
import readline from "readline";
import { isLogedIn, readConfigFile } from "../helpers";
import { login } from "./login";

const ENV_FILE = ".envi";

/**
 * Prompts the user with a question and returns the input.
 * @param question - The question to ask the user.
 * @returns A promise resolving to the user input.
 */
async function promptUser(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(pc.cyan(question), (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Reads and parses the root `.env` file into a JSON object.
 * @returns A parsed object containing key-value pairs from the `.env` file.
 */
async function readEnvFile(): Promise<Record<string, string>> {
  try {
    const envPath = path.join(process.cwd(), ".env");
    const envContent = await fs.readFile(envPath, "utf-8");

    return envContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#")) // Ignore empty lines and comments
      .reduce(
        (acc, line) => {
          const [key, value] = line.split("=");
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        },
        {} as Record<string, string>,
      );
  } catch (error) {
    console.error(pc.yellow("⚠️ No .env file found or unable to read it."));
    return {}; // Return an empty object if the file doesn't exist
  }
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

    const projectName = await promptUser("Enter your project name: ");
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

    // Read and parse the .env file
    const envVars = await readEnvFile();

    // Create project in database
    const project = await prisma.project.create({
      data: {
        userId: userConfig.userId,
        deviceId: userConfig.deviceId,
        name: projectName,
        content: envVars,
      },
    });

    // Save project data along with .env variables
    const projectData = {
      projectId: project.id,
    };

    await fs.writeFile(filePath, JSON.stringify(projectData, null, 2));

    console.log(pc.green(`✅ Project created successfully!`));
    console.log(pc.blue(`🆔 Project ID: ${pc.bold(project.id)}`));
    console.log(pc.dim(`📄 .envi file saved at: ${filePath}`));
    console.log(pc.magenta("🔍 Stored .env variables:"), envVars);
  } catch (error) {
    console.error(pc.red("❌ Error creating project:"), error);
  }
}

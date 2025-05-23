import {
  encryptEnvValues,
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readEnvFile,
  writeProjectConfig,
} from "@workspace/env-helpers";
import inquirer from "inquirer";
import pc from "picocolors";
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
        pc.red("❌ Invalid user credentials. Please log in again.")
      );
      await login();
      return;
    }

    const envs = await readEnvFile();

    const encryptedEnvs = encryptEnvValues(envs, userConfig.userId);

    const client = await getConfiguredClient();

    const response = await client.post(`/projects/${userConfig.userId}`, {
      name: projectName,
      content: encryptedEnvs,
      deviceId: userConfig.deviceId,
    });

    const projectId = response.data.data.id;
    await writeProjectConfig(projectId);
  } catch (error) {
    console.error(pc.red("❌ Error creating project:"), error);
  }
}

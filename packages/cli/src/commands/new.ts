import {
  encryptEnvValues,
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readEnvFile,
  readProjectConfig,
  writeProjectConfig,
} from "@nvii/env-helpers";
import inquirer from "inquirer";
import pc from "picocolors";
import { login } from "./auth/login";
import { unlinkProject } from "./unlink";

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

    const envs = await readEnvFile();

    const encryptedEnvs = encryptEnvValues(envs, userConfig.userId);

    const projectConfig = await readProjectConfig();
    if (projectConfig && projectConfig.projectId) {
      const { createNewProject } = await inquirer.prompt([
        {
          type: "confirm",
          name: "createNewProject",
          message: `Are you sure you really want to delete current project this workspace is linked to and create another one?`,
          default: false,
        },
      ]);

      if (!createNewProject) {
        console.log(pc.yellow("Skipping .envi directory clean up."));
        return;
      }
    }

    // unlink from the existing project and delete it from the db
    await unlinkProject();

    // contact the api
    const client = await getConfiguredClient();
    const response = await client.post(`/projects/${userConfig.userId}`, {
      name: projectName,
      content: encryptedEnvs,
      deviceId: userConfig.deviceId,
    });

    const projectId = response.data.data.id;
    await writeProjectConfig(projectId);
  } catch (error: Error | any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error(
        pc.red("❌ Error creating project:"),
        error.response.data.message,
      );
      process.exit(1);
    }
    console.error(pc.red("❌ Error creating project:"), error.message);
    process.exit(1);
  }
}

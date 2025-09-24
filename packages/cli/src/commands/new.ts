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
import { Project, VersionBranch } from "@nvii/db";

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

    const projectDescription = await promptUser(
      "Enter project description (optional):"
    );

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

    // unlink from the existing project and delete it from the db
    await unlinkProject(false);

    // contact the api
    const client = await getConfiguredClient();
    const response = await client.post<{
      data: Project & { branches: VersionBranch[] };
    }>(`/projects/${userConfig.userId}`, {
      name: projectName,
      content: encryptedEnvs,
      deviceId: userConfig.deviceId,
      description: projectDescription,
    });

    const projectId = response.data.data.id;
    const branchName = "main";
    await writeProjectConfig(projectId, branchName);
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.yellow(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellow("\nProject create cancelled."));
      return;
    }
    console.error(pc.red("❌ Error creating project:"), error.message);
    process.exit(1);
  }
}

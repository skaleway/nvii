import { Project, VersionBranch } from "@nvii/db";
import {
  encryptEnvValues,
  getConfiguredClient,
  getProjectInfoFromPackageJson,
  isLogedIn,
  readConfigFile,
  readEnvFile,
  writeProjectConfig,
} from "@nvii/env-helpers";
import inquirer from "inquirer";
import pc from "picocolors";
import { login } from "./auth/login";
import { unlinkProject } from "./unlink";

/**
 * Prompts the user with a question using inquirer.
 * @param message - The message to display to the user.
 * @returns A promise resolving to the user input.
 */
async function promptUser(
  message: string,
  defaultValue?: string
): Promise<string> {
  const response = await inquirer.prompt([
    {
      type: "input",
      name: "answer",
      message: pc.cyan(message),
      default: defaultValue || "",
    },
  ]);
  return response.answer.trim();
}

/**
 * Creates a new project after verifying user authentication.
 */
export async function createProject() {
  const ora = (await import("ora")).default;
  const spinner = ora({ text: pc.cyan("Creating project..."), color: "cyan" });

  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to create a new project."));
      await login();
    }

    const { name, description } = getProjectInfoFromPackageJson(process.cwd());
    const projectName = await promptUser("Enter your project name:", name);

    if (!projectName) {
      spinner.fail(pc.red("Project name cannot be empty."));
      spinner.stop();
      return;
    }

    const projectDescription = await promptUser(
      "Enter project description (optional):",
      description
    );

    const userConfig = await readConfigFile();
    if (!userConfig?.userId || !userConfig?.deviceId) {
      spinner.fail(pc.red("Invalid user credentials. Please log in again."));
      spinner.stop();
      await login();
      return;
    }

    const envs = await readEnvFile();
    const encryptedEnvs = encryptEnvValues(envs, userConfig.userId);

    await unlinkProject(false);

    spinner.start();

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

    spinner.succeed(pc.green("Project created and configuration saved!"));
  } catch (error: Error | any) {
    if (error.response) {
      spinner.fail(pc.yellow(`\n${error.response.data.error}`));
      spinner.stop();
      return;
    }
    if (
      error.message &&
      error.message.includes("User force closed the prompt with SIGINT")
    ) {
      spinner.stop();
      spinner.fail(pc.yellow("\nProject create cancelled."));
      return;
    }
    spinner.fail(pc.red("Error creating project:"));
    spinner.stop();
    process.exit(1);
  }
}

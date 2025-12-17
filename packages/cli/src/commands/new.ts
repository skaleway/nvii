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
import ora from "ora";
import chalk from "chalk";

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
      message: message,
      default: defaultValue || "",
    },
  ]);
  return response.answer.trim();
}

/**
 * Creates a new project after verifying user authentication.
 */
export async function createProject() {
  const spinner = ora();

  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to create a new project."));
      await login();
    }

    const { name, description } = getProjectInfoFromPackageJson(process.cwd());
    const projectName = await promptUser("Enter your project name:", name);

    if (!projectName) {
      console.log(pc.red("Project name cannot be empty."));
      return;
    }

    const projectDescription = await promptUser(
      "Enter project description (optional):",
      description
    );

    const userConfig = await readConfigFile();
    if (!userConfig?.userId || !userConfig?.deviceId) {
      console.log(pc.red("Invalid auth credentials."));
      await login();
      return;
    }
    const envs = await readEnvFile();

    spinner.text = "Encrypting variables...";
    spinner.start();
    const encryptedEnvs = encryptEnvValues(envs, userConfig.userId);
    spinner.succeed("Encrypting variables...");

    await unlinkProject(false);

    spinner.text = "Creating project...";
    spinner.color = "cyan";
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
    spinner.succeed("Creating project...");

    // TODO: Update these lines to display real data.
    console.log("\n" + chalk.white("Version created: v1.0.0"));
    console.log(chalk.white(`Added: 0 | Modified: 0 | Removed: 0`));
  } catch (error: Error | any) {
    if (error.response) {
      spinner.stop();
      spinner.fail(pc.redBright(`${error.response.data.error}`));
      process.exit(1);
    }
    if (
      error.message &&
      error.message.includes("User force closed the prompt with SIGINT")
    ) {
      spinner.stop();
      spinner.fail(pc.gray("Project creation cancelled."));
      return;
    }
    spinner.stop();
    spinner.fail(pc.red("Error creating project:"));
    process.exit(1);
  }
}

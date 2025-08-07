import {
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readProjectConfig,
  writeEnvFile,
} from "@nvii/env-helpers";
import { EnvVersion, User } from "@nvii/db";
import pc from "picocolors";
import inquirer from "inquirer";
import { login } from "./auth/login";

type VersionWithUser = EnvVersion & { user: Pick<User, "name" | "email"> };

const skipConfirmationPrompt = async (
  skipConfirmation: boolean,
  description: string,
  id: string,
) => {
  if (!skipConfirmation) {
    const { confirmRollback } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmRollback",
        message: `Are you sure you want to rollback to <${pc.dim(`${description} - id: ${id}`)}>?`,
      },
    ]);

    if (!confirmRollback) {
      console.log(pc.cyan("Skipping rollback..."));
      process.exit(0);
    }
  }
};

export async function rollback(args?: { version: string; force: boolean }) {
  let versionId = "";
  let skipConfirmation = false;
  if (args) {
    if (args.version) {
      versionId = args.version;
    }
    if (args.force) {
      skipConfirmation = true;
    }
  }
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to roll back."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();

    const config = await readProjectConfig();
    if (!config) {
      console.log(
        pc.red("Cannot read local .nvii folder currently. Try again."),
      );
      process.exit(1);
    }

    const projectId = config.projectId;

    if (!userConfig?.userId || !projectId) {
      console.error(
        pc.red(
          "Project not linked or user not configured. Please run 'nvii link'.",
        ),
      );
      process.exit(1);
    }

    const client = await getConfiguredClient();

    if (versionId && versionId.trim() !== "") {
      const response = await client.get(
        `/projects/${userConfig.userId}/${projectId}/versions/${versionId}`,
      );
      const version = response.data as EnvVersion;

      if (!version) {
        console.log(pc.red(`Version with id <${versionId}> not found.`));
        return;
      }

      await skipConfirmationPrompt(
        skipConfirmation,
        version.description as string,
        version.id,
      );

      // 4. Update local .env file
      console.log(pc.cyan("Updating local .env file..."));

      const values = await writeEnvFile(
        version?.content as Record<string, string>,
      );
      if (!values) {
        console.error(pc.red("\nOops an unexpected error occurred."));
        process.exit(1);
      }
      console.log(
        pc.green(
          "✅ Local .env file has been updated to match the rollback version.",
        ),
      );
      return;
    }

    // 1. Fetch version history
    const versionsResponse = await client.get(
      `/projects/${userConfig.userId}/${projectId}/versions?limit=20`,
    );
    const versions = versionsResponse.data as VersionWithUser[];

    if (versions.length < 2) {
      console.log(pc.yellow("Not enough versions to roll back."));
      return;
    }

    // 2. Prompt user to select a version (excluding the latest one)
    const { versionIdToRollback } = await inquirer.prompt([
      {
        type: "list",
        name: "versionIdToRollback",
        message: "Select a version to roll back to:",
        choices: versions.slice(1).map((version) => ({
          name: `${new Date(version.createdAt).toLocaleString()} - ${version.description} (by ${version.user.name})`,
          value: version.id,
        })),
      },
    ]);

    // 3. Fetch the content of the selected version
    const response = await client.get(
      `/projects/${userConfig.userId}/${projectId}/versions/${versionIdToRollback}`,
    );
    const versionToRollback = response.data as EnvVersion;

    if (!versionToRollback.content) {
      console.error(
        pc.red("Selected version has no content. Cannot roll back."),
      );
      return;
    }

    await skipConfirmationPrompt(
      skipConfirmation,
      versionToRollback.description as string,
      versionToRollback.id,
    );

    // 4. Update local .env file
    console.log(pc.cyan("Updating local .env file..."));

    const values = await writeEnvFile(
      versionToRollback?.content as Record<string, string>,
    );
    if (!values) {
      console.error(pc.red("\nOops an unexpected error occurred."));
      process.exit(1);
    }
    console.log(
      pc.green(
        "✅ Local .env file has been updated to match the rollback version.",
      ),
    );
  } catch (error: any) {
    if (error.response) {
      console.error(pc.yellow(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellow("\nRollback cancelled."));
      return;
    }
    console.error(pc.red("\nError during rollback:"), error.message);
    process.exit(1);
  }
}

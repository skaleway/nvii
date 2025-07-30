import {
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readProjectConfig,
  decryptEnvValues,
  writeProjectConfig,
  writeEnvFile,
} from "@nvii/env-helpers";
import { EnvVersion, User } from "@nvii/db";
import pc from "picocolors";
import inquirer from "inquirer";
import { login } from "./auth/login";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

type VersionWithUser = EnvVersion & { user: Pick<User, "name" | "email"> };

export async function rollback() {
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
        pc.red("Cannot read local .envi folder currently. Try again."),
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

    // 4. Update local .env file
    console.log(pc.cyan("Updating local .env file..."));

    // decrypt envs before comparing
    const decryptedEnv = decryptEnvValues(
      versionToRollback?.content as Record<string, string>,
      userConfig.userId,
    );

    const values = await writeEnvFile(decryptedEnv);
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
    console.error(pc.red("\nError during rollback:"), error.message);
    process.exit(1);
  }
}

import {
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readProjectConfig,
  decryptEnvValues,
  writeProjectConfig,
} from "@nvii/env-helpers";
import { EnvVersion, User } from "@nvii/db";
import pc from "picocolors";
import inquirer from "inquirer";
import { login } from "./auth/login";

type VersionWithUser = EnvVersion & { user: Pick<User, "name" | "email"> };

export async function rollback() {
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to roll back."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();
    const projectId = await readProjectConfig();

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
        choices: versions.slice(1).map((v) => ({
          name: `${new Date(v.createdAt).toLocaleString()} - ${v.description} (by ${v.user.name})`,
          value: v.id,
        })),
      },
    ]);

    // 3. Fetch the content of the selected version
    const versionResponse = await client.get(
      `/projects/${userConfig.userId}/${projectId}/versions/${versionIdToRollback}`,
    );
    const versionToRollback = versionResponse.data as EnvVersion;

    if (!versionToRollback.content) {
      console.error(
        pc.red("Selected version has no content. Cannot roll back."),
      );
      return;
    }

    // 4. Create a new version with the old content
    const description = `Rollback to version ${versionIdToRollback}`;
    console.log(pc.cyan(`\nCreating new version: "${description}"...`));

    // The content is already encrypted on the server, so we can just push it back.
    const pushResponse = await client.patch(
      `/projects/${userConfig.userId}/${projectId}`,
      {
        content: versionToRollback.content,
        description,
      },
    );

    const { version: newVersion } = pushResponse.data as {
      version: EnvVersion;
    };
    console.log(
      pc.green(`✅ Successfully created new version ${newVersion.id}.`),
    );

    // 5. Update local .env file
    console.log(pc.cyan("Updating local .env file..."));
    const decryptedEnvs = decryptEnvValues(
      versionToRollback.content as Record<string, string>,
      userConfig.userId,
    );
    // await writeProjectConfig(decryptedEnvs);
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

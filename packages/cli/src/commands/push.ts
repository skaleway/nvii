import {
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readEnvFile,
  readProjectConfig,
} from "@nvii/env-helpers";
import pc from "picocolors";
import { login } from "./auth/login";
import { EnvVersion } from "@nvii/db";
import inquirer from "inquirer";

export async function pushLatestChanges() {
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to push changes."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();
    if (!userConfig?.userId) {
      console.log(pc.red("No user ID found. Please log in again.")); // Should not happen if logged in, but good practice
      return;
    }
    const config = await readProjectConfig();
    if (!config) {
      console.log(
        pc.red("Cannot read local .envi folder currently. Try again."),
      );
      process.exit(1);
    }

    const projectId = config.projectId;
    if (!projectId) {
      console.error(
        pc.red(
          "❌ Project not linked. Please run 'nvii link' to link your project first.",
        ),
      );
      process.exit(1);
    }

    const localEnvs = await readEnvFile();
    if (Object.keys(localEnvs).length === 0) {
      console.log(pc.yellow("Local .env file is empty. Nothing to push."));
      return;
    }

    const { description } = await inquirer.prompt([
      {
        type: "input",
        name: "description",
        message: "Enter a short description for this version:",
        default: "Pushed from CLI",
      },
    ]);

    const client = await getConfiguredClient();
    const response = await client.patch(
      `/projects/${userConfig.userId}/${projectId}`,
      {
        content: localEnvs,
        description,
      },
    );

    const { version } = response.data as {
      version: EnvVersion & { changes: any };
    };

    console.log(
      pc.green("\n✅ Successfully pushed changes and created a new version."),
    );

    if (version.changes) {
      console.log(pc.bold("Change summary:"));
      // console.log({ cha: version.changes });
      const { added, modified, deleted } = version.changes;
      if (added?.length > 0) {
        console.log(pc.green(`  Added:   ${added.join(", ")}`));
      }
      if (modified?.length > 0) {
        console.log(pc.yellow(`  Updated: ${modified.join(", ")}`));
      }
      if (deleted?.length > 0) {
        console.log(pc.red(`  Removed: ${deleted.join(", ")}`));
      }
    }
  } catch (error: Error | any) {
    console.error(pc.red("\nError pushing local changes:"), error.message);
    process.exit(1);
  }
}

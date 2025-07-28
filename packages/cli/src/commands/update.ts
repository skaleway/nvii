import pc from "picocolors";
import {
  encryptEnvValues,
  isLogedIn,
  readConfigFile,
  readEnvFile,
  readProjectConfig,
  getConfiguredClient,
} from "@nvii/env-helpers";
import { login } from "./auth/login";

export async function updateProject() {
  try {
    const userData = await readConfigFile();
    // Ensure user is logged in
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to update a project."));
      await login();
    }

    if (!userData) {
      console.log(pc.red("You must be logged in to update a project."));
      await login();
    }

    // Check for project configuration
    const projectConfig = await readProjectConfig();
    if (!projectConfig) {
      console.error(
        pc.red(
          "❌ Project not linked. Please run 'nvii link' to link your project first.",
        ),
      );
      process.exit(1);
    }

    const envVars = await readEnvFile();
    const encryptedEnv = encryptEnvValues(envVars, userData!.userId);

    const client = await getConfiguredClient();

    const project = await client.patch(
      `/projects/${userData!.userId}/${projectConfig}`, // TODO: Remove all of this later
      {
        content: encryptedEnv,
      },
    );

    console.log(pc.cyan("Updated environment variables:"));

    console.log(
      pc.green("✅ Project updated successfully with new .env variables."),
    );
  } catch (error: Error | any) {
    console.error(pc.red("❌ Error updating project:"), error.message);
    process.exit(1);
  }
}

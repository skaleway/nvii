import pc from "picocolors";
import {
  encryptEnvValues,
  isLogedIn,
  readConfigFile,
  readEnvFile,
  readProjectConfig,
  getConfiguredClient,
} from "@workspace/env-helpers";
import { login } from "./login";
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
          "❌ Project not linked. Please run 'envi link' to link your project first."
        )
      );
      process.exit(1);
    }

    const envVars = await readEnvFile();
    const encryptedEnv = encryptEnvValues(envVars, userData!.userId);

    const client = await getConfiguredClient();

    const project = await client.patch(
      `/projects/${userData!.userId}/${projectConfig.projectId}`,
      {
        content: encryptedEnv,
      }
    );

    console.log(pc.cyan("Updated environment variables:"));
    console.log(project.data.data.content);

    console.log(
      pc.green("✅ Project updated successfully with new .env variables.")
    );
  } catch (error) {
    console.error(pc.red("❌ Error updating project:"), error);
    process.exit(1);
  }
}

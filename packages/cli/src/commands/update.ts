import pc from "picocolors";
import {
  encryptEnvValues,
  isLogedIn,
  readConfigFile,
  readEnvFile,
  readProjectConfig,
  getConfiguredClient,
  writeEnvFile,
  decryptEnvValues,
} from "@nvii/env-helpers";
import { login } from "./auth/login";
import { EnvVersion } from "@nvii/db";

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

    const config = await readProjectConfig();
    if (!config) {
      console.log(
        pc.red("Cannot read local .nvii folder currently. Try again."),
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

    const envVars = await readEnvFile();
    const encryptedEnv = encryptEnvValues(envVars, userData!.userId);

    const client = await getConfiguredClient();

    const versions = await client.get<EnvVersion[]>(
      `/projects/${userData!.userId}/${projectId}/versions/latest`,
    );

    if (!versions || !versions.data) {
      console.error(pc.red("❌ Project not found or no data available."));
      process.exit(1);
    }

    const versionToUpdateTo = versions.data[0];

    if (!versionToUpdateTo.content) {
      console.error(pc.red("❌ No content found for this project envs."));
      process.exit(1);
    }

    // decrypt envs before comparing
    const decryptedEnv = decryptEnvValues(
      versionToUpdateTo?.content as Record<string, string>,
      userData?.userId as string,
    );
    const data = await writeEnvFile(decryptedEnv);

    if (!data) {
      console.error(
        pc.red("❌ Failed to write environment variables to .env file."),
      );
      process.exit(1);
    }

    console.log(pc.cyan("Updated environment variables:"));

    console.log(
      pc.green("✅ Project updated successfully with new .env variables."),
    );
  } catch (error: Error | any) {
    console.error(pc.red("❌ Error updating project:"), error.message);
    process.exit(1);
  }
}

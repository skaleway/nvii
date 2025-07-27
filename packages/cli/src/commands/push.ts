import {
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
} from "@nvii/env-helpers";
import pc from "picocolors";
import { login } from "./auth/login";
import { join } from "path";
import { readFileSync } from "fs";

export async function pushLatestChanges() {
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to link a project."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();
    if (!userConfig?.userId) {
      console.log(pc.red("No user ID found. Please log in again."));
      return;
    }

    const cwd = process.cwd();
    const projectPath = join(cwd, ".envi/envi.json");

    const content = readFileSync(projectPath, "utf-8");
    const projectId = JSON.parse(content).projectId;

    const client = await getConfiguredClient();
  } catch (error: Error | any) {
    console.error(pc.red("\nError pushing local changes:"), error.message);
    process.exit(1);
  }
}

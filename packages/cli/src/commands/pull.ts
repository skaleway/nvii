import pc from "picocolors";
import {
  encryptEnvValues,
  isLogedIn,
  readConfigFile,
  convertEnvJsonToString,
  readProjectConfig,
  writeProjectConfig,
  readEnvFile,
  decryptEnvValues,
  getConfiguredClient,
} from "@nvii/env-helpers";
import { login } from "./auth/login";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Project } from "@nvii/db";
import axios from "axios";

const DOT_ENV_FILE = ".env";

const getRemoteEnvVariables = async (
  projectId: string,
  userId: string,
): Promise<Project | null> => {
  try {
    const res = await axios.get<Project>(
      `${process.env.CLIENT_URL}/api/projects/${userId}/${projectId}`,
    );
    const project = res.data;

    if (!project) {
      throw new Error("An unexpected error occurred pulling remote changes.");
    }

    return project;
  } catch (error) {
    throw new Error(error as string);
  }
};

export async function pullRemoteChanges() {
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

    const client = await getConfiguredClient();
    const response = await client.get(`/projects/${userConfig.userId}`);
    const projects = response.data as Project[];

    if (!projects.length) {
      console.log(pc.yellow("No projects found for this user."));
      return;
    }

    const cwd = process.cwd();

    const envs = await readEnvFile();

    const projectPath = join(cwd, ".envi/envi.json");

    const content = readFileSync(projectPath, "utf-8");
    const projectId = JSON.parse(content).projectId;

    // TODO: fix database access error. To retrieve remote envs
    const remoteEnvs = await getRemoteEnvVariables(
      projectId,
      userConfig?.userId as string,
    );

    const decryptedContent = [];
    (remoteEnvs?.content as Record<string, string>[]).map((item) => {
      const decrypted = decryptEnvValues(item, userConfig?.userId as string);
      decryptedContent.push(decrypted);
    });
  } catch (error) {
    console.error(pc.red("❌ Error updating project:"), error);
    process.exit(1);
  }
}

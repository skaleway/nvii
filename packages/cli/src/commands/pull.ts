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
} from "@nvii/env-helpers";
import { login } from "./auth/login";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Project } from "@nvii/db";
import axios from "axios";

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

    const cwd = process.cwd();

    const envs = await readEnvFile();

    const projectPath = join(cwd, ".envi/envi.json");

    const content = readFileSync(projectPath, "utf-8");
    const projectId = JSON.parse(content).projectId;

    // TODO: fix database access error. To retrieve remote envs
    const remoteEnvs = await getRemoteEnvVariables(
      projectId,
      userData?.userId as string,
    );

    const decryptedContent = [];
    (remoteEnvs?.content as Record<string, string>[]).map((item) => {
      const decrypted = decryptEnvValues(item, userData?.userId as string);
      decryptedContent.push(decrypted);
    });
  } catch (error) {
    console.error(pc.red("❌ Error updating project:"), error);
    process.exit(1);
  }
}

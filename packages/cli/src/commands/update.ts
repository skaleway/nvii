import { prisma } from "@repo/database";
import fs from "fs";
import path from "path";
import pc from "picocolors";
import {
  encryptEnvValues,
  isLogedIn,
  readConfigFile,
  readEnvFile,
} from "../helpers";
import { login } from "./login";

const ENV_FILE = ".envi";

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

    const currentDir = process.cwd();
    const filePath = path.join(currentDir, ENV_FILE);

    if (!fs.existsSync(filePath)) {
      console.error(pc.red("❌ No .envi file found in the project root."));
      process.exit(1);
    }

    const projectData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const projectId = projectData.projectId;

    if (!projectId) {
      console.error(pc.red("❌ Invalid .envi file format."));
      process.exit(1);
    }

    const envVars = await readEnvFile();
    const encryptedEnv = encryptEnvValues(envVars);

    const project = await prisma.project.update({
      where: { id: projectId, userId: userData!.userId },
      data: { content: encryptedEnv },
    });

    console.log(project.content);

    console.log(
      pc.green("✅ Project updated successfully with new .env variables."),
    );
  } catch (error) {
    console.error(pc.red("❌ Error updating project:"), error);
  }
}

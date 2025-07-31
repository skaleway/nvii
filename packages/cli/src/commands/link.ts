import { Project } from "@nvii/db";
import {
  decryptEnvValues,
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readEnvFile,
  writeProjectConfig,
} from "@nvii/env-helpers";
import { existsSync, promises as fs, mkdirSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import path from "path";
import pc from "picocolors";
import { login } from "./auth/login";

export async function linkProject() {
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
      console.log(
        pc.yellow("No projects found for this directory. Run 'nvii new'."),
      );
      return;
    }
    const { selectedProjectId } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedProjectId",
        message: "Select a project to link:",
        choices: projects.map((proj) => ({
          name: proj.name,
          value: proj.id,
        })),
      },
    ]);

    const selectedProject = projects.find(
      (proj) => proj.id === selectedProjectId,
    );

    if (!selectedProject) {
      console.log(pc.red("Selected project not found."));
      return;
    }

    const currentDir = process.cwd();
    const enviDirPath = path.join(currentDir, ".envi");
    const enviFilePath = path.join(enviDirPath, "envi.json");

    // create project config file path and .env if they don't exist
    if (!existsSync(enviDirPath)) {
      mkdirSync(enviDirPath);

      if (!existsSync(enviFilePath)) {
        writeFileSync(enviFilePath, "", { encoding: "utf-8" });
      }
    }
    console.log("\n");
    await writeProjectConfig(selectedProject.id);
    console.log(pc.green("Project linked successfully!"));
  } catch (error: Error | any) {
    console.error(pc.red("\nError linking project:"), error.message);
    process.exit(1);
  }
}

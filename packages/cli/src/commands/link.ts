import { Project } from "@nvii/db";
import {
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  writeProjectConfig,
} from "@nvii/env-helpers";
import { existsSync, promises as fs, mkdirSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import path from "path";
import pc from "picocolors";
import { login } from "./auth/login";

const createEnvFiles = (enviDirPath: string, enviFilePath: string) => {
  // create project config file path and .env if they don't exist
  if (!existsSync(enviDirPath)) {
    mkdirSync(enviDirPath);

    if (!existsSync(enviFilePath)) {
      writeFileSync(enviFilePath, "", { encoding: "utf-8" });
    }
  }
  console.log("\n");
};

export async function linkProject(args?: { token: string }) {
  let projectId = "";
  if (args) {
    if (args.token) {
      projectId = args.token;
    }
  }
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
    const currentDir = process.cwd();
    const enviDirPath = path.join(currentDir, ".nvii");
    const enviFilePath = path.join(enviDirPath, "nvii.json");

    if (projectId && projectId.trim() !== "") {
      const response = await client.get(
        `/projects/${userConfig.userId}/${projectId}`,
      );
      const project = response.data as Project;

      if (!project) {
        console.log(pc.red(`Project with id <${projectId}> not found.`));
        return;
      }

      createEnvFiles(enviDirPath, enviFilePath);
      await writeProjectConfig(project.id);
      console.log(pc.green("Project linked successfully!"));
      return;
    }
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

    createEnvFiles(enviDirPath, enviFilePath);
    await writeProjectConfig(selectedProject.id, "main");
    console.log(pc.green("Project linked successfully!"));
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.yellow(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellow("\nLink process cancelled."));
      return;
    }
    console.error(pc.red("\nError linking project:"), error.message);
    process.exit(1);
  }
}

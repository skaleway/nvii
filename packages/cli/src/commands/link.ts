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

    let projectId = args?.token;
    let projects: Project[] = [];

    if (!projectId) {
      // Request a single page explicitly so a large account never streams
      // thousands of rows into the picker. The response shape is
      // { items, total, limit, offset }; the empty state branches on total.
      const response = await client.get<{
        items: Project[];
        total: number;
      }>(`/projects/${userConfig.userId}?limit=100`);
      projects = response.data.items;

      if (response.data.total === 0) {
        console.log(
          pc.yellowBright("No projects found for this directory. Run 'nvii new'.")
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

      projectId = selectedProjectId;
    }

    createEnvFiles(enviDirPath, enviFilePath);
    // update current env version in the db
    // const updateResponse = await client.patch(`/projects/${userConfig.userId}/${projectId}/versions/${versionId}`);
    await writeProjectConfig(projectId!, "main");
    console.log(pc.green("Project linked successfully!"));
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.yellowBright(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellowBright("\nLink process cancelled."));
      return;
    }
    console.error(pc.red("\nError linking project:"), error.message);
    process.exit(1);
  }
}

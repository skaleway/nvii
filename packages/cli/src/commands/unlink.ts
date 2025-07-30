import { Project } from "@nvii/db";
import {
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  unlinkProjectConfig,
} from "@nvii/env-helpers";
import inquirer from "inquirer";
import pc from "picocolors";
import { login } from "./auth/login";

export async function unlinkProject() {
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
        message: "Select a project to unlink:",
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

    if (!selectedProject.content) {
      return;
    }

    const { deleteProject } = await inquirer.prompt([
      {
        type: "confirm",
        name: "deleteProject",
        message: `Are you sure you really want to delete this project? '${selectedProject.name}'`,
        default: false,
      },
    ]);

    if (!deleteProject) {
      console.log(pc.yellow("Skipping .envi directory deletion."));
      return;
    }

    // Delete the project from db
    const res = await client.delete<{ message: string; name: string }>(
      `/projects/${userConfig.userId}/${selectedProjectId}`,
    );

    if (!res.data) {
      console.log(
        pc.yellow(
          "Oops. An error occurred unlinking project. Check your internet access and try again later.",
        ),
      );
      process.exit(1);
    }
    const { message } = res.data;

    console.log("\n");
    const result = await unlinkProjectConfig(selectedProject.id);
    if (!result) {
      console.log(
        pc.yellow(
          "Oops. An error occurred deleting the local .envi directory. You can delete it manually.",
        ),
      );
      process.exit(1);
    }
    console.log(pc.green(`${message} successfully!`));
  } catch (error: Error | any) {
    console.error(pc.red("\nError linking project:"), error.message);
    process.exit(1);
  }
}

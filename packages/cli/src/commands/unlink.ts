import { Project } from "@nvii/db";
import {
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readProjectConfig,
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

    const projectConfig = await readProjectConfig();

    const client = await getConfiguredClient();
    const response = await client.get(`/projects/${userConfig.userId}`);
    const projects = response.data as Project[];

    if (!projects.length) {
      console.log(
        pc.yellow("No projects found for current user. Run 'nvii new'."),
      );
      return;
    }

    const project = projects.find(
      (item) => item.id === projectConfig?.projectId,
    );
    if (!project) {
      console.log(pc.red("Project not linked remote project yet."));
      return;
    }
    const { unLinkProject } = await inquirer.prompt([
      {
        type: "confirm",
        name: "unLinkProject",
        message: `Are you sure you want to unlink from ${pc.dim(project?.name)}`,
      },
    ]);

    if (!unLinkProject) {
      console.log("Skipping project unlink.");
      return;
    }

    console.log("\n");
    const result = await unlinkProjectConfig(project.id);
    if (!result) {
      console.log(
        pc.yellow(
          "Oops. An error occurred deleting the local .nvii directory. You can delete it manually.",
        ),
      );
      process.exit(1);
    }
    console.log(pc.green(`Project unlinked successfully!`));
  } catch (error: Error | any) {
    console.error(pc.red("\nError linking project:"), error.message);
    process.exit(1);
  }
}

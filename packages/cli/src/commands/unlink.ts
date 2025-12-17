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

export async function unlinkProject(checkProjects = true) {
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

    if (checkProjects && !projects.length) {
      console.log(
        pc.yellowBright("No projects found for current user. Run 'nvii new'.")
      );
      return;
    }

    const project = projects.find(
      (item) => item.id === projectConfig?.projectId
    );
    if (checkProjects) {
      if (!project) {
        console.log(pc.red("Project is not linked to a remote project yet."));
        return;
      }
    }

    // Fall back when theres is not project found to unlink from
    if (!project) {
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
        pc.yellowBright(
          "Oops. An error occurred deleting the local .nvii directory. You can delete it manually."
        )
      );
      process.exit(1);
    }
    console.log(pc.green(`Project unlinked successfully!`));
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.yellowBright(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellowBright("\nUnlink cancelled."));
      return;
    }
    console.error(pc.red("\nError linking project:"), error.message);
    process.exit(1);
  }
}

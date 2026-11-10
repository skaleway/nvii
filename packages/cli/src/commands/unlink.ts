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

    let project: { id: string; name: string } | null = null;

    if (projectConfig?.projectId) {
      try {
        const response = await client.get<{
          project: { id: string; name: string };
        }>(`/projects/${userConfig.userId}/${projectConfig.projectId}?summary=1`);
        project = response.data.project;
      } catch (error: Error | any) {
        if (error.response?.status === 404) {
          console.log(
            pc.red("Project is not linked to a remote project yet.")
          );
          return;
        }
        throw error;
      }
    }

    if (checkProjects && !project) {
      console.log(pc.red("Project is not linked to a remote project yet."));
      return;
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
      console.log("Skipping project unlink.\n");
      return;
    }

    const result = await unlinkProjectConfig(project.id);
    if (!result) {
      console.log(
        pc.yellow(
          "Failed to delete local .nvii directory. You can delete it manually.\n"
        )
      );
      process.exit(1);
    }
    console.log(pc.yellowBright(`Project unlinked successfully!`));
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.redBright(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.gray("\nUnlink cancelled."));
      return;
    }
    console.error(pc.red("\nError unlinking project:"), error.message);
    process.exit(1);
  }
}

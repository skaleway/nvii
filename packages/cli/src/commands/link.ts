import { prisma } from "@repo/database";
import { promises as fs } from "fs";
import inquirer from "inquirer";
import path from "path";
import pc from "picocolors";
import { isLogedIn, readConfigFile } from "../helpers";
import { login } from "./login";

const ENV_FILE = ".envi";

export async function linkProject() {
  try {
    // Ensure user is logged in
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to link a project."));
      await login();
      return;
    }

    // Fetch user details from config
    const userConfig = await readConfigFile();
    if (!userConfig?.userId) {
      console.log(pc.red("No user ID found. Please log in again."));
      return;
    }

    // Fetch all projects associated with the user
    const projects = await prisma.project.findMany({
      where: { userId: userConfig.userId },
      select: { id: true, name: true },
    });

    if (!projects.length) {
      console.log(pc.yellow("No projects found for this user."));
      return;
    }

    // Prompt user to select a project
    const { selectedProject } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedProject",
        message: "Select a project to link:",
        choices: projects.map((proj) => ({
          name: proj.name,
          value: proj.id,
        })),
      },
    ]);

    // Write to .envi file
    const currentDir = process.cwd();
    const filePath = path.join(currentDir, ENV_FILE);
    await fs.writeFile(
      filePath,
      JSON.stringify({ projectId: selectedProject }, null, 2),
    );

    console.log(pc.green(`Project linked successfully!`));
    console.log(pc.blue(`Project ID: ${pc.bold(selectedProject)}`));
    console.log(pc.dim(`.envi file saved at: ${filePath}`));
  } catch (error) {
    console.error(pc.red("Error linking project:"), error);
  }
}

//when I'm done with the linking, it should create an .env file and parse the selectedProject.content to it's original form

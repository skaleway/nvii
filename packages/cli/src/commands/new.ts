import { prisma } from "@repo/database";
import { promises as fs } from "fs";
import path from "path";
import pc from "picocolors";
import readline from "readline";
import { isLogedIn, readConfigFile } from "../helpers";
import { login } from "./login";

const ENV_FILE = ".envi";

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function createProject() {
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to create a new project."));
      login();
    }

    const projectName = await promptUser("Enter your project name: ");
    if (!projectName) {
      console.error("Project name cannot be empty.");
      process.exit(1);
    }

    const userConfig = await readConfigFile();

    const currentDir = process.cwd();
    const filePath = path.join(currentDir, ENV_FILE);

    const project = await prisma.project.create({
      data: {
        userId: userConfig?.userId ?? "",
        deviceId: userConfig?.deviceId ?? "",
        name: projectName,
      },
    });

    await fs.writeFile(filePath, JSON.stringify(project, null, 2));

    console.log(pc.green(`Project created successfully!`));
    console.log(pc.blue(`Project ID: ${pc.bold(project.id)}`));
    console.log(pc.dim(`.envi file saved at: ${filePath}`));
  } catch (error) {
    console.error(pc.red("Error creating project:"), error);
  }
}

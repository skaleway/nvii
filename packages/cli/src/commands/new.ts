import { prisma } from "@repo/database";
import { promises as fs } from "fs";
import path from "path";
import pc from "picocolors";
import { isLogedIn, readConfigFile } from "../helpers";
import { login } from "./login";

const ENV_FILE = ".envi";

export async function createProject() {
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to create a new project."));
      login();
    }

    const userConfig = await readConfigFile();

    const currentDir = process.cwd();
    const filePath = path.join(currentDir, ENV_FILE);

    const project = await prisma.project.create({
      data: {
        userId: userConfig?.userId ?? "",
        deviceId: userConfig?.deviceId ?? "",
        name: "Nothing",
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

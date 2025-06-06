import { FILENAME, readConfigFile } from "@workspace/env-helpers";
import inquirer from "inquirer";
import os from "os";
import path from "path";
import pc from "picocolors";
import fs from "fs";

export async function logout() {
  try {
    // Read current config
    const config = await readConfigFile();
    if (!config) {
      console.log(pc.yellow("You are not logged in."));
      return;
    }

    console.log({ config });

    // Ask for user ID confirmation
    const { userId } = await inquirer.prompt([
      {
        type: "input",
        name: "userId",
        message: "Please enter your User ID to confirm logout:",
        validate: (input) => {
          if (input === config.userId) {
            return true;
          }
          return "User ID does not match. Please try again.";
        },
      },
    ]);

    // Double-check with user
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message:
          "Are you sure you want to logout? This will remove all your local credentials.",
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(pc.yellow("Logout cancelled."));
      return;
    }

    // Remove the config file
    const homeDir = os.homedir();
    const filePath = path.join(homeDir, FILENAME);
    fs.unlinkSync(filePath);

    console.log(pc.green("Successfully logged out!"));
  } catch (error) {
    console.error(pc.red("Error during logout:"), error);
    process.exit(1);
  }
}

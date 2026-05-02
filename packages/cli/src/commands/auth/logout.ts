import { FILENAME, readConfigFile } from "@nvii/env-helpers";
import inquirer from "inquirer";
import os from "os";
import path from "path";
import pc from "picocolors";
import fs from "fs";

export async function logout(args?: { username: string; email: string }) {
  let username = "";
  let email = "";
  if (args) {
    // validate user Input
    if (args.username && args.email) {
      console.log(
        pc.yellowBright(
          "Unexpected input. Ether provide your email or username to logout. NOT BOTH"
        )
      );
      process.exit(0);
    }
    if (args.username) {
      username = args.username;
    }
    if (args.email) {
      email = args.email;
    }
  }
  try {
    // Read current config
    const config = await readConfigFile();
    if (!config) {
      console.log(
        pc.gray(
          `You are not logged in. ${pc.yellow("Run 'nvii login' first")} \n`
        )
      );
      return;
    }

    // Ask for user ID confirmation
    if (!username && !email) {
      let isUsername = true;
      const { userId } = await inquirer.prompt([
        {
          type: "input",
          name: "userId",
          message: `Enter your username or email to confirm logout: `,
          validate: (input) => {
            if (input === config.username) {
              return true;
            }
            if (input === config.email) {
              isUsername = false;
              return true;
            }
            return "Invalid username or email.";
          },
        },
      ]);

      if (isUsername) username = userId;
      else email = userId;
    }

    // Remove the config file
    const homeDir = os.homedir();
    const filePath = path.join(homeDir, FILENAME);

    // validate username || email before login out
    if (email) {
      if (config.email !== email) {
        console.log(
          pc.redBright("\nInvalid email. Check your email and try again.")
        );
        process.exit(1);
      }
    }

    if (username) {
      if (config.username !== username) {
        console.log(
          pc.redBright("Invalid username. Check your username and try again.")
        );
        process.exit(1);
      }
    }

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
      console.log(pc.yellowBright("\nLogout cancelled."));
      return;
    }

    fs.unlinkSync(filePath);

    console.log(pc.yellowBright("\nSuccessfully logged out!\n"));
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.gray(`\n${error.response.data.error}\n`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.gray("\nLogout cancelled.\n"));
      return;
    }
    console.error(pc.red("\nError during logout:"), error.message, "\n");
    process.exit(1);
  }
}

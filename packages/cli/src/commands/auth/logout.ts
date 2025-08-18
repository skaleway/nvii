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
        pc.yellow(
          "Unexpected input. Ether provide your email or username to logout. NOT BOTH",
        ),
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
      console.log(pc.yellow("You are not logged in."));
      return;
    }

    // Ask for user ID confirmation
    if (!username && !email) {
      const { userId } = await inquirer.prompt([
        {
          type: "input",
          name: "userId",
          message: `Please enter your username to confirm logout: `,
          validate: (input) => {
            if (input === config.username) {
              return true;
            }
            return "Username does not match. Please try again.";
          },
        },
      ]);

      username = userId;
    }

    if (!email && !username) {
      const { userId } = await inquirer.prompt([
        {
          type: "input",
          name: "userId",
          message: `Please enter your username to confirm logout: `,
          validate: (input) => {
            if (input === config.email) {
              return true;
            }
            return "Username does not match. Please try again.";
          },
        },
      ]);

      email = userId;
    }

    // Remove the config file
    const homeDir = os.homedir();
    const filePath = path.join(homeDir, FILENAME);

    // validate username || email before login out
    if (email) {
      if (config.email !== email) {
        console.log(
          pc.redBright("Oops, Invalid email. Check your email and try again."),
        );
        process.exit(1);
      }
    }

    if (username) {
      if (config.username !== username) {
        console.log(
          pc.redBright(
            "Oops, Invalid username. Check your username and try again.",
          ),
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
      console.log(pc.yellow("Logout cancelled."));
      return;
    }

    fs.unlinkSync(filePath);

    console.log(pc.green("Successfully logged out!"));
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.yellow(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellow("\nLogout cancelled."));
      return;
    }
    console.error(pc.red("Error during logout:"), error.message);
    process.exit(1);
  }
}

#!/usr/bin/env node

import { Command } from "commander";
import {
  testencryption,
  generateExample,
  linkProject,
  login,
  createProject,
  updateProject,
} from "./commands";
import { readConfigFile } from "@workspace/env-helpers";

const program = new Command();

program
  .command("login")
  .description("Authenticate with your service via the CLI")
  .action(login);

program
  .command("whoami")
  .description("Show the current user")
  .action(async () => {
    try {
      const file = await readConfigFile();
      console.log(file);
    } catch (error) {
      console.error("Error reading config:", error);
    }
  });

program
  .command("new")
  .description("Create a new project")
  .action(() => {
    createProject();
  });

program
  .command("link")
  .description("Link an existing project to the current directory")
  .action(linkProject);

program
  .command("test")
  .description("Test to see if the encryption and decryption works")
  .action(testencryption);

program
  .command("update")
  .description("Update the existing env file")
  .action(updateProject);

program
  .command("generate")
  .description("Generate a .env.example file from your .env file")
  .action(generateExample);

program.parse(process.argv);

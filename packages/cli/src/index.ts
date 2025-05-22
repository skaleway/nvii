#!/usr/bin/env node

import { Command } from "commander";
import { testencryption } from "./commands/crypt";
import { linkProject } from "./commands/link";
import { login } from "./commands/login";
import { createProject } from "./commands/new";
import { updateProject } from "./commands/update";
import { readConfigFile } from "./helpers";

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

program.parse(process.argv);

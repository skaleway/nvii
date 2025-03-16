#!/usr/bin/env node

import { Command } from "commander";
import { testencryption } from "./commands/crypt";
import { linkProject } from "./commands/link";
import { login } from "./commands/login";
import { createProject } from "./commands/new";
import { getVersion, readConfigFile } from "./helpers";

const program = new Command();
const version = getVersion();

program
  .name("envincible-cli")
  .description("Example CLI application with envincible auth")
  .version(version);

program
  .command("login")
  .description("Authenticate with your service via the CLI")
  .action(login);

program
  .command("show-config")
  .description("Show configuration file")
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

program.parse(process.argv);

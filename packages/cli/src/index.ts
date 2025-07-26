#!/usr/bin/env node

import { Command } from "commander";
import {
  testencryption,
  generateExample,
  linkProject,
  login,
  createProject,
  updateProject,
  logout,
  pullRemoteChanges,
  whoami,
} from "./commands";

const program = new Command();

program
  .command("login")
  .description("Authenticate with your service via the CLI")
  .action(login);

program
  .command("logout")
  .description("Logout from your service via the CLI")
  .action(logout);

program.command("whoami").description("Show the current user").action(whoami);

program
  .command("new")
  .description("Create a new project")
  .action(createProject);

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
  .command("pull")
  .description("Pull latest remote changes.")
  .action(pullRemoteChanges);

program
  .command("generate")
  .description("Generate a .env.example file from your .env file")
  .action(generateExample);

program.parse(process.argv);

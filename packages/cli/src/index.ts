#!/usr/bin/env node

import { Command } from "commander";
import {
  testEncryption,
  generateExample,
  linkProject,
  login,
  createProject,
  updateProject,
  logout,
  pullRemoteChanges,
  whoami,
  some,
  unlinkProject,
} from "./commands";
import { pushLatestChanges } from "./commands/push";

const program = new Command();

// program.usage("Usage: nvii [options] [command]");

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
  .command("unlink")
  .description(
    "Unlink the current directory from a remote project. This deletes the existing remote project.",
  )
  .action(unlinkProject);

program
  .command("test")
  .description("Test to see if the encryption and decryption works")
  .action(testEncryption);

program
  .command("update")
  .description(
    "Update the existing env file with changes from the main branch (version).",
  )
  .action(updateProject);

program
  .command("pull")
  .description("Pull latest remote changes.")
  .action(pullRemoteChanges);

program
  .command("push")
  .description(
    "Push latest local changes and create a new remote branch (version).",
  )
  .action(pushLatestChanges);

program
  .command("some")
  .description(
    "Merge all available remote and local env branches (versions) to main branch.",
  )
  .action(some);

program
  .command("crypt")
  .description("Test env encryption.")
  .action(testEncryption);

program
  .command("generate")
  .description("Generate a .env.example file from your .env file")
  .action(generateExample);

program.parse(process.argv);

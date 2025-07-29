#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const commands_1 = require("./commands");
const program = new commander_1.Command();
program
    .command("login")
    .description("Authenticate with your service via the CLI")
    .action(commands_1.login);
program
    .command("logout")
    .description("Logout from your service via the CLI")
    .action(commands_1.logout);
program.command("whoami").description("Show the current user").action(commands_1.whoami);
program
    .command("new")
    .description("Create a new project")
    .action(commands_1.createProject);
program
    .command("link")
    .description("Link an existing project to the current directory")
    .action(commands_1.linkProject);
program
    .command("unlink")
    .description("Unlink the current directory from a remote project. This deletes the existing remote project.")
    .action(commands_1.unlinkProject);
program
    .command("test")
    .description("Test to see if the encryption and decryption works")
    .action(commands_1.testEncryption);
program
    .command("update")
    .description("Update the existing env file with changes from the main branch (version).")
    .action(commands_1.updateProject);
program
    .command("pull")
    .description("Pull latest remote changes from a specified branch (version).")
    .action(commands_1.pullRemoteChanges);
// .usage("Usage nvii pull [branch] [options]");
program
    .command("push")
    .description("Push latest local changes and create a new remote branch (version).")
    .action(commands_1.pushLatestChanges);
program
    .command("log")
    .description("Get the history of changes made to the project.")
    .action(commands_1.getHistory);
program
    .command("some")
    .description("Merge all available remote and local env branches (versions) to main branch.")
    .action(commands_1.some);
program
    .command("generate")
    .description("Generate a .env.example file from your .env file")
    .action(commands_1.generateExample);
program.parse(process.argv);

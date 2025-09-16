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
  pushLatestChanges,
  getHistory,
} from "./commands";
import { createTag, listTags } from "./commands/tag";
import { createBranch, listBranches, switchBranch } from "./commands/branch";
import { rollback } from "./commands/rollback";

const program = new Command();

// Set program information
program
  .name("nvii")
  .description(
    "Secure environment variable management for modern development teams",
  )
  .version("1.0.0")
  // .option("-v, --verbose", "Enable verbose output")
  // .option("-q, --quiet", "Suppress non-essential output")
  // .option("--config <path>", "Path to configuration file")
  // .option("--no-color", "Disable colored output")
  .configureHelp({
    sortSubcommands: true,
    showGlobalOptions: true,
  })
  .addHelpText(
    "before",
    `
🔐 Nvii - Secure Environment Variable Manager\n`,
  );
//   .addHelpText('after', `
// 📖 Examples:
//   $ nvii login                    # Authenticate with Nvii
//   $ nvii new                      # Create a new project
//   $ nvii link                     # Link to existing project
//   $ nvii pull --dry-run           # Preview changes
//   $ nvii push -m "Update API keys" # Upload with message
//   $ nvii log --oneline            # Compact history view
//   $ nvii generate --format json   # Generate JSON template

// 🌐 Resources:
//   Documentation: https://nvii.dev/docs
//   Support:       https://nvii.dev/support
//   GitHub:        https://github.com/nvii/nvii
// `);

// Handle no command provided
if (process.argv.length <= 2) {
  program.help();
}

// Authentication Commands
program
  .command("login")
  // .alias("auth")
  .description("Authenticate and establish a secure session with Nvii")
  .action(login);

program
  .command("logout")
  .option(
    "-u, --username <username>",
    "The username of the account to logout from.",
  )
  .option(
    "-id, --email <email>",
    "The email of the user account to logout from.",
  )
  .description(
    "Terminate your current session and clear authentication credentials",
  )
  .action(logout);

program
  .command("whoami")
  // .alias("me")
  .description("Display information about the currently authenticated user")
  .action(whoami);

// Project Management Commands
program
  .command("new")
  // .alias("init")
  .description(
    "Initialize a new project and configure environment variable management",
  )
  .action(createProject);

program
  .command("link")
  // .alias("connect")
  .description("Connect the current directory to an existing remote project")
  .option("-t, --token <id>", "Specific project token or id to connect to.")
  .action(linkProject);

program
  .command("unlink")
  // .alias("disconnect")
  .description(
    "Disconnect the current directory from its linked remote project",
  )
  .action(unlinkProject);

// Environment Variable Operations
program
  .command("pull")
  .description(
    "Fetch and merge environment variables from the remote repository",
  )
  .option("-f, --force", "Force pull without conflict resolution prompts")
  .option("-b, --branch <branch>", "Pull from specific branch (default: main)")
  .option("-dry, --dry-run", "Preview changes without applying them")
  .action(pullRemoteChanges);

program
  .command("push")
  .description(
    "Upload local environment variable changes and create a new version",
  )
  .option("-m, --message <message>", "Version description message")
  .option("-b, --branch <branch>", "Push to specific branch (default: main)")
  .option("-dry, --dry-run", "Preview changes without uploading")
  .action(pushLatestChanges);

program
  .command("update")
  // .alias("sync")
  .description(
    "Synchronize local environment file with the latest remote version",
  )
  .action(updateProject);

// Version Control Commands
program
  .command("log")
  // .alias("history")
  .description("Display version history and change log for the current project")
  .option("-n, --limit <number>", "Limit number of versions to display", "10")
  .option("--oneline", "Show condensed one-line format")
  .option("--author <email>", "Filter by author email")
  .action(getHistory);

program
  .command("rollback")
  // .alias("revert")
  .description("Restore environment variables to a previous version state")
  .option("-v, --version <id>", "Specific version ID to rollback to")
  .option("-f, --force", "Skip confirmation prompts")
  .action(rollback);

program
  .command("merge")
  .description(
    "Consolidate multiple environment variable versions into the main branch",
  )
  .option("-s, --source <branch>", "Source branch to merge from")
  .option(
    "-t, --target <branch>",
    "Target branch to merge into (default: main)",
  )
  .action(some);

// Utility Commands
program
  .command("generate")
  .alias("gen")
  .description(
    "Create a template .env.x file from your current environment variables",
  )
  .option("-o, --output <file>", "Output file path (default: .env.example)")
  .option("--format <type>", "Output format: env, json, yaml", "env")
  .action(generateExample);

program
  .command("test")
  // .alias("verify")
  .description("Verify encryption and decryption functionality")
  .action(testEncryption);

// Branch Management Commands
program
  .command("branch")
  .description("Create a new branch from the current or specified version")
  .option("-n, --name <name>", "Branch name")
  .action(createBranch);

program
  .command("branches")
  .description("List all branches for the current project")
  .action(listBranches);

program
  .command("checkout")
  .description("Switch to a different branch")
  .option("-n, --name <name>", "Branch name to switch to")
  .action(switchBranch);

// Version Tagging Commands
program
  .command("tag")
  .description("Create a new tag for the current or specified version")
  .option("-n, --name <name>", "Tag name to use.")
  .action(createTag);

program
  .command("tags")
  .description("List all tags for the current project")
  .action(listTags);

program.parse(process.argv);

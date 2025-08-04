import pc from "picocolors";
import {
  isLogedIn,
  readConfigFile,
  writeProjectConfig,
  readEnvFile,
  decryptEnvValues,
  getConfiguredClient,
  readProjectConfig,
  writeEnvFile,
} from "@nvii/env-helpers";
import { login } from "./auth/login";
import { readFileSync, promises as fs } from "fs";
import path, { join } from "path";
import { Project } from "@nvii/db";
import inquirer from "inquirer";
import { argv } from "process";
import { detectConflicts, promptConflictResolution, resolveConflicts, mergeEnvironments } from "../lib/conflict";
import { generateDiff, DiffResult } from "@nvii/env-helpers";
import { fetchVersions, VersionWithUser } from "@nvii/env-helpers";

const DOT_ENV_FILE = ".env";

export async function pullRemoteChanges() {
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to pull a project."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();
    if (!userConfig?.userId) {
      console.log(pc.red("No user ID found. Please log in again."));
      return;
    }

    // TODO: Complete this one
    // const { selectedProjectBranch } = await inquirer.prompt([
    //   {
    //     type: "list",
    //     name: "selectedProjectBranch",
    //     message: "Select a project branch to pull from:",
    //     choices: versions.map((version) => ({
    //       branch: version.branch,
    //       name: version.Project.name,
    //     })),
    //   },
    // ]);

    const cwd = process.cwd();

    const config = await readProjectConfig();
    if (!config) {
      console.log(
        pc.red("Cannot read local .envi folder currently. Try again."),
      );
      process.exit(1);
    }

    const projectId = config.projectId;

    if (!projectId) {
      console.error(
        pc.red(
          "❌ Project not linked. Please run 'nvii link' to link your project first.",
        ),
      );
      process.exit(1);
    }

    const client = await getConfiguredClient();
    const response = await client.get(
      `/projects/${userConfig.userId}/${projectId}`,
    );
    const project = response.data as Project;

    if (!project) {
      console.log(pc.yellow("No project found for this user or repository."));
      process.exit(1);
    }

    if (!project.content) {
      console.log(pc.yellow("No content found for this project envs."));
      process.exit(1);
    }
    const envFilePath = path.join(cwd, DOT_ENV_FILE);
    const existingEnv = await readEnvFile();

    const finalEnv: Record<string, string> = { ...existingEnv };
    let commentedLines = "";
    // keep track of changes
    const changedEnvs: Record<string, string>[] = [];

    // decrypt envs before comparing
    const decryptedEnv = decryptEnvValues(
      project?.content as Record<string, string>,
      userConfig.userId,
    );

    // Detect conflicts and handle them
    const conflicts = detectConflicts(existingEnv, decryptedEnv);
    let finalContent = decryptedEnv;
    
    if (conflicts.length > 0) {
      console.log(pc.yellow(`\n⚠️  Found ${conflicts.length} conflict(s) between local and remote versions.`));
      const resolution = await promptConflictResolution(conflicts);
      finalContent = resolveConflicts(existingEnv, decryptedEnv, resolution);
    } else {
      finalContent = mergeEnvironments(existingEnv, decryptedEnv);
    }

    // Calculate diff for change summary
    const diff = generateDiff(existingEnv, finalContent);
    const changesSummary = {
      added: diff.added,
      modified: diff.updated.map(([key, { old, new: newValue }]) => ({ key, original: old, value: newValue })),
      removed: diff.removed
    };

    const values = await writeEnvFile(finalContent);
    if (!values) {
      console.error(pc.red("\nOops an unexpected error occurred."));
      process.exit(1);
    }
    
    // log change summary
    if (changesSummary.added.length > 0 || changesSummary.modified.length > 0 || changesSummary.removed.length > 0) {
      console.log(
        pc.bold(
          `\n📜 Change summary for project: ${pc.cyan(`${project.name} - ${project.id}`)}`,
        ),
      );

      console.log(pc.dim("--------------------------------------------------"));
      changedEnvs.forEach((change) => {
        console.log(
          `${pc.yellow(`${change.key}:`)} changed from ${change.original} to ${change.value})}`,
        );
        console.log(`Date:    ${new Date(Date.now()).toLocaleString()}`);
        console.log(
          pc.dim("--------------------------------------------------"),
        );
      });
    }
    console.log("\n");
    await writeProjectConfig(project.id);
    console.log(pc.green(".env file updated successfully!"));
  } catch (error: Error | any) {
    console.error(pc.red("\nError linking project:"), error.message);
    process.exit(1);
  }
}

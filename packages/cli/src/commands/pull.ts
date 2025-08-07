import pc from "picocolors";
import {
  isLogedIn,
  readConfigFile,
  readEnvFile,
  getConfiguredClient,
  readProjectConfig,
  writeEnvFile,
} from "@nvii/env-helpers";
import { login } from "./auth/login";
import { EnvVersion, Project } from "@nvii/db";
import {
  detectConflicts,
  promptConflictResolution,
  resolveConflicts,
  mergeEnvironments,
} from "../lib/conflict";
import { generateDiff } from "@nvii/env-helpers";

const handleSummary = ({
  projectId,
  localEnvs,
  prevVersion,
}: {
  projectId: string;
  localEnvs: Record<string, string>;
  prevVersion: Record<string, string>;
}) => {
  const diff = generateDiff(prevVersion, localEnvs);
  const changesSummary = {
    added: diff.added,
    modified: diff.updated.map(([key, { old, new: newValue }]) => ({
      key,
      original: old,
      value: newValue,
    })),
    removed: diff.removed,
  };
  // log change summary
  if (
    changesSummary.added.length > 0 ||
    changesSummary.modified.length > 0 ||
    changesSummary.removed.length > 0
  ) {
    console.log(
      pc.bold(`\n📜 Change summary for project: ${pc.cyan(`${projectId}`)}`),
    );

    console.log(pc.dim("--------------------------------------------------"));
    changesSummary.added.forEach((key) => {
      console.log(
        `${pc.yellow(`${key}:`)} added with value: ${localEnvs[key]}`,
      );
      console.log(`Date:    ${new Date(Date.now()).toLocaleString()}`);
      console.log(pc.dim("--------------------------------------------------"));
    });
    changesSummary.modified.forEach((change) => {
      console.log(
        `${pc.yellow(`${change.key}:`)} changed from ${change.value} (local) to ${change.original} (remote)`,
      );
      console.log(`Date:    ${new Date(Date.now()).toLocaleString()}`);
      console.log(pc.dim("--------------------------------------------------"));
    });
    changesSummary.removed.forEach((key) => {
      console.log(
        `${pc.yellow(`${key}:`)} deleted with prev value: ${prevVersion[key]}`,
      );
      console.log(`Date:    ${new Date(Date.now()).toLocaleString()}`);
      console.log(pc.dim("--------------------------------------------------"));
    });
  } else {
    console.log(
      pc.bold(`\nNo changes detected for project: ${pc.cyan(`${projectId}`)}`),
    );
  }
};
export async function pullRemoteChanges() {
  let skipResolve = false;
  let branch = "";
  let dryRun = false;
  if (process.argv) {
    const args = process.argv;

    if (args.includes("-f") || args.includes("--force")) {
      const index = args.indexOf("-f") || args.indexOf("--force");
      skipResolve = true;
    }
    if (args.includes("-b") || args.includes("--branch")) {
      const index = args.indexOf("-b") || args.indexOf("--branch");
      branch = args[index + 1];
    }
    if (args.includes("-dry") || args.includes("--dry-run")) {
      dryRun = true;
    }
  }
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
    const existingEnv = await readEnvFile();

    const config = await readProjectConfig();
    if (!config) {
      console.log(
        pc.red("Cannot read local .nvii folder currently. Try again."),
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

    // fetch data
    const client = await getConfiguredClient();
    const response = await client.get<{
      project: Project;
      versions: EnvVersion[];
    }>(`/projects/${userConfig.userId}/${projectId}`);

    let { versions, project } = response.data;

    if (!project) {
      console.log(pc.yellow("No project found for this user or repository."));
      process.exit(1);
    }

    versions = versions.sort(
      (a, b) =>
        new Date(a.updatedAt).getHours() - new Date(b.updatedAt).getHours(),
    );
    const newVersion = versions[versions.length - 1];

    if (!project.content) {
      console.log(pc.yellow("No content found for this project envs."));
      process.exit(1);
    }

    // If there is dry run show the user the changes between this version and previous one
    if (dryRun) {
      handleSummary({
        projectId,
        prevVersion: newVersion.content as Record<string, string>,
        localEnvs: existingEnv,
      });
      return;
    }

    // Detect conflicts and handle them
    const conflicts = detectConflicts(
      existingEnv,
      newVersion.content as Record<string, string>,
    );
    let finalContent = newVersion.content as Record<string, string>;

    if (!skipResolve) {
      if (conflicts.length > 0) {
        console.log(
          pc.yellow(
            `\n⚠️  Found ${conflicts.length} conflict(s) between local and remote versions.`,
          ),
        );
        const resolution = await promptConflictResolution(conflicts);
        finalContent = resolveConflicts(
          existingEnv,
          newVersion.content as Record<string, string>,
          resolution,
        );
      } else {
        finalContent = mergeEnvironments(
          existingEnv,
          newVersion.content as Record<string, string>,
        );
      }
    }

    const values = await writeEnvFile(finalContent);
    if (!values) {
      console.error(pc.red("\nOops an unexpected error occurred."));
      process.exit(1);
    }

    // log change summary
    handleSummary({
      projectId,
      localEnvs: existingEnv,
      prevVersion: finalContent,
    });
    console.log(pc.green(".env file updated successfully!"));
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.yellow(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellow("\nPull cancelled."));
      return;
    }
    console.error(pc.red("\nError linking project:"), error.message);
    process.exit(1);
  }
}

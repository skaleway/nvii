import {
  generateDiff,
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readEnvFile,
  readProjectConfig,
} from "@nvii/env-helpers";
import pc from "picocolors";
import { login } from "./auth/login";
import { EnvVersion } from "@nvii/db";
import inquirer from "inquirer";
import { linkProject } from "./link";

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
      pc.bold(`\n📜 Change summary for project: ${pc.cyan(`${projectId}`)}`)
    );

    console.log(pc.dim("--------------------------------------------------"));
    changesSummary.added.forEach((key) => {
      console.log(
        `${pc.yellowBright(`${key}:`)} added with value: ${localEnvs[key]}`
      );
      console.log(`Date:    ${new Date(Date.now()).toLocaleString()}`);
      console.log(pc.dim("--------------------------------------------------"));
    });
    changesSummary.modified.forEach((change) => {
      console.log(
        `${pc.yellowBright(`${change.key}:`)} changed from ${change.original} (remote) to ${change.value} (local)`
      );
      console.log(`Date:    ${new Date(Date.now()).toLocaleString()}`);
      console.log(pc.dim("--------------------------------------------------"));
    });
    changesSummary.removed.forEach((key) => {
      console.log(
        `${pc.yellowBright(`${key}:`)} deleted with prev value: ${prevVersion[key]}`
      );
      console.log(`Date:    ${new Date(Date.now()).toLocaleString()}`);
      console.log(pc.dim("--------------------------------------------------"));
    });
  } else {
    console.log(
      pc.bold(`\nNo changes detected for project: ${pc.cyan(`${projectId}`)}`)
    );
  }
};
export async function pushLatestChanges(args?: {
  message: string;
  branch: string;
  dryRun: boolean;
}) {
  let message = "";
  let branch = "";
  let dryRun = false;
  if (args) {
    if (args.message) {
      message = args.message;
    }
    if (args.branch) {
      branch = args.branch;
    }
    if (args.dryRun) {
      dryRun = true;
    }
  }

  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to push changes."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();
    if (!userConfig?.userId) {
      console.log(pc.red("No user ID found. Please log in again.")); // Should not happen if logged in, but good practice
      return;
    }
    let config = await readProjectConfig();
    if (!config) {
      await linkProject();
    }
    config = await readProjectConfig();
    if (!config) {
      console.log(
        pc.red(
          "An error occurred reading local .nvii folder currently. Try again."
        )
      );
      process.exit(1);
    }
    const projectId = config.projectId;
    if (!projectId) {
      console.error(
        pc.red(
          "❌ Project not linked. Please run 'nvii link' to link your project first."
        )
      );
      process.exit(1);
    }

    const localEnvs = await readEnvFile();
    if (Object.keys(localEnvs).length === 0) {
      console.log(
        pc.yellowBright("Local .env file is empty. Nothing to push.")
      );
      return;
    }

    // if there is a message flag, use it. Or ask for one
    if (message.trim() === "" && !dryRun) {
      const { description } = await inquirer.prompt([
        {
          type: "input",
          name: "description",
          message: "Enter a short description for this version:",
          required: true,
        },
      ]);
      message = description;
    }

    const client = await getConfiguredClient();

    // If there is dry run show the user the changes between this version and previous one
    if (dryRun) {
      const response = await client.get<EnvVersion[]>(
        `/projects/${userConfig.userId}/${projectId}/versions`
      );

      if (!response) {
        console.log(
          pc.red(`bad: unable to access '${process.env.CLIENT_URL}'`)
        );
      }

      let versions = response.data;
      versions = versions.sort(
        (a, b) =>
          new Date(a.updatedAt).getHours() - new Date(b.updatedAt).getHours()
      );

      const prevVersion = versions[versions.length - 1];
      handleSummary({
        projectId,
        prevVersion: prevVersion.content as Record<string, string>,
        localEnvs,
      });
      return;
    }

    await client.patch<{
      version: EnvVersion;
      versions: EnvVersion[];
    }>(`/projects/${userConfig.userId}/${projectId}`, {
      content: localEnvs,
      message: message,
    });

    console.log(
      pc.green("\n✅ Successfully pushed changes and created a new version.")
    );
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.yellowBright(`\n${error.response.data.error}`));
      return;
    }

    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellowBright("\nPush cancelled."));
      return;
    }
    console.error(pc.red("\nError pushing local changes:"), error.message);
    process.exit(1);
  }
}

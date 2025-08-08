import {
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readProjectConfig,
  writeProjectConfig,
} from "@nvii/env-helpers";
import pc from "picocolors";
import { login } from "./auth/login";
import inquirer from "inquirer";
import { VersionBranch } from "@nvii/db";

export async function createBranch(args?: { name: string; version: string }) {
  let branchName = "";
  let baseVersionId = "";
  if (args) {
    if (args.name) {
      branchName = args.name;
    }

    if (args.version) {
      baseVersionId = args.version;
    }
  }
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to create branches."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();
    if (!userConfig?.userId) {
      console.log(pc.red("No user ID found. Please log in again."));
      return;
    }

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

    const client = await getConfiguredClient();

    // If no branch name provided, prompt for it
    if (!branchName) {
      const { inputBranchName } = await inquirer.prompt([
        {
          type: "input",
          name: "inputBranchName",
          message: "Enter branch name:",
          validate: (input) => {
            if (!input.trim()) return "Branch name cannot be empty";
            if (!/^[a-zA-Z0-9._/-]+$/.test(input))
              return "Branch name can only contain letters, numbers, dots, underscores, hyphens, and slashes";
            return true;
          },
        },
      ]);
      branchName = inputBranchName;
    }

    // If no base version specified, get latest version
    if (!baseVersionId) {
      const versionsResponse = await client.get(
        `/projects/${userConfig.userId}/${projectId}/versions?limit=1`,
      );
      const versions = versionsResponse.data;
      if (versions.length === 0) {
        console.log(pc.yellow("No versions available to branch from."));
        return;
      }
      baseVersionId = versions[0].id;
    }

    // Create branch via API
    const response = await client.post(
      `/projects/${userConfig.userId}/${projectId}/versions/branches`,
      {
        branchName,
        baseVersionId,
        projectId,
      },
    );

    if (!response || !response.data) {
      console.log(pc.yellow("Oops an error occurred creating new branch."));
      process.exit(1);
    }

    console.log(
      pc.green(
        `✅ Successfully created branch '${branchName}' from version ${baseVersionId?.slice(0, 8)}`,
      ),
    );
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.error(
        pc.red("❌ Branch name already exists. Choose a different name."),
      );
    } else {
      console.error(pc.red("Error creating branch:"), error.message);
    }
    process.exit(1);
  }
}

export async function listBranches() {
  const oraModule = await import("ora");
  const ora = oraModule.default;
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to list branches."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();
    if (!userConfig?.userId) {
      console.log(pc.red("No user ID found. Please log in again."));
      return;
    }

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

    const client = await getConfiguredClient();
    const spinner = ora("Fetching project branches...\n").start();
    const response = await client.get(
      `/projects/${userConfig.userId}/${projectId}/versions/branches`,
    );
    spinner.stop();

    const branches = response.data;

    if (!branches || branches.length === 0) {
      console.log(pc.yellow("No branches found for this project."));
      return;
    }

    console.log(pc.bold(`\n🌿 Branches for project ${pc.cyan(projectId)}`));
    console.log(pc.dim("--------------------------------------------------"));
    const projectConfig = await readProjectConfig();

    branches.forEach((branch: any) => {
      const isActive = branch.isActive ? pc.green("* ") : "  ";
      console.log(
        `${isActive}${pc.cyan(projectConfig?.branch === branch.name ? `*${branch.name}` : branch.name)} -> ${pc.dim(`version ${branch.baseVersion.id.slice(0, 8)}`)}`,
      );
      console.log(
        `   Created: ${new Date(branch.createdAt).toLocaleDateString()}`,
      );
      console.log(pc.dim("--------------------------------------------------"));
    });
  } catch (error: any) {
    if (error.response) {
      console.error(pc.yellow(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellow("\nBranch create cancelled."));
      return;
    }
    console.error(pc.red("Error listing branches:"), error.message);
    process.exit(1);
  }
}

export async function switchBranch(args?: { name: string }) {
  let branchName = "";
  if (args) {
    if (args.name) {
      branchName = args.name;
    }
  }
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to switch branches."));
      await login();
      return;
    }

    const userConfig = await readConfigFile();
    if (!userConfig?.userId) {
      console.log(pc.red("No user ID found. Please log in again."));
      return;
    }

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

    const client = await getConfiguredClient();

    // If no branch name provided, show available branches to choose from
    if (!branchName) {
      const branchesResponse = await client.get(
        `/projects/${userConfig.userId}/${projectId}/versions/branches`,
      );
      const branches = branchesResponse.data;

      if (!branches || branches.length === 0) {
        console.log(pc.yellow("No branches found for this project."));
        return;
      }

      const { selectedBranch } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedBranch",
          message: "Select a branch to switch to:",
          choices: branches.map((branch: any) => ({
            name: `${branch.name} ${branch.isActive ? "(current)" : ""}`,
            value: branch.name,
          })),
        },
      ]);
      branchName = selectedBranch;
    }
    const remoteUpdateResponse = await client.patch<VersionBranch>(
      `/projects/${userConfig.userId}/${projectId}/versions/branches/${branchName}`,
    );

    branchName = remoteUpdateResponse.data.name;
    await writeProjectConfig(projectId, branchName);

    console.log(pc.green(`✅ Switched to branch '${branchName}'`));
  } catch (error: any) {
    if (error.response) {
      console.error(pc.yellow(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellow("\nBranch switch cancelled."));
      return;
    }
    if (error.response?.status === 404) {
      console.error(pc.red("❌ Branch not found."));
    } else {
      console.error(pc.red("Error switching branch:"), error.message);
    }
    process.exit(1);
  }
}

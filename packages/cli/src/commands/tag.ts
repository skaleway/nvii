import {
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readProjectConfig,
} from "@nvii/env-helpers";
import pc from "picocolors";
import { login } from "./auth/login";
import inquirer from "inquirer";

export async function createTag(args?: { version: string; name: string }) {
  const oraModule = await import("ora");
  const ora = oraModule.spinners.aesthetic;

  let tagName = "";
  let versionId = "";
  if (args) {
    if (args.name) {
      tagName = args.name;
    }

    if (args.version) {
      versionId = args.version;
    }
  }
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to create tags."));
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

    // If no version specified, get latest version
    if (!versionId) {
      const versionsResponse = await client.get(
        `/projects/${userConfig.userId}/${projectId}/versions?limit=1`,
      );
      const versions = versionsResponse.data;
      if (versions.length === 0) {
        console.log(pc.yellow("No versions available to tag."));
        return;
      }
      versionId = versions[0].id;
    }

    // If no tag name provided, prompt for it
    if (!tagName) {
      const { inputTagName } = await inquirer.prompt([
        {
          type: "input",
          name: "inputTagName",
          message: "Enter tag name:",
          validate: (input) => {
            if (!input.trim()) return "Tag name cannot be empty";
            if (!/^[a-zA-Z0-9._-]+$/.test(input))
              return "Tag name can only contain letters, numbers, dots, underscores, and hyphens";
            return true;
          },
        },
      ]);
      tagName = inputTagName;
    }

    // Create tag via API
    const response = await client.post(
      `/projects/${userConfig.userId}/${projectId}/versions/tags`,
      {
        versionId,
        tagName,
      },
    );

    console.log(
      pc.green(
        `✅ Successfully created tag '${tagName}' for version ${versionId?.slice(0, 8)}`,
      ),
    );
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.error(
        pc.red("❌ Tag name already exists. Choose a different name."),
      );
    } else {
      console.error(pc.red("Error creating tag:"), error.message);
    }
    process.exit(1);
  }
}

export async function listTags() {
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to list tags."));
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
    const response = await client.get(
      `/projects/${userConfig.userId}/${projectId}/versions/tags`,
    );

    const tags = response.data;

    if (!tags || tags.length === 0) {
      console.log(pc.yellow("No tags found for this project."));
      return;
    }

    console.log(pc.bold(`\n🏷️ Tags for project ${pc.cyan(projectId)}`));
    console.log(pc.dim("--------------------------------------------------"));

    tags.forEach((tag: any) => {
      console.log(
        `${pc.yellow(tag.name)} -> ${pc.dim(`version ${tag.version.id.slice(0, 8)}`)}`,
      );
      console.log(`   ${tag.version.description || "No description"}`);
      console.log(`   ${new Date(tag.createdAt).toLocaleDateString()}`);
      console.log(pc.dim("--------------------------------------------------"));
    });
  } catch (error: any) {
    if (error.response) {
      console.error(pc.yellow(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellow("\nTag cancelled."));
      return;
    }
    console.error(pc.red("Error listing tags:"), error.message);
    process.exit(1);
  }
}

import {
  fetchVersions,
  getConfiguredClient,
  isLogedIn,
  readConfigFile,
  readProjectConfig,
} from "@nvii/env-helpers";
import pc from "picocolors";
import { login } from "./auth/login";
import { Project } from "@nvii/db";

export async function getHistory(args?: {
  limit: string;
  oneline: boolean;
  author: string;
}) {
  let limit: number = 0;
  let oneline = false;
  let author = "";
  if (args) {
    if (args.author) {
      // validate author email

      author = args.author;
    }

    if (args.limit) {
      // validate limit (number only)
      if (!Number(args.limit)) {
        console.warn(pc.yellow("Invalid limit (must be of type number)"));
        process.exit(1);
      }
      const limitNumber = Number(args.limit);
      if (limitNumber <= 0) {
        console.warn(pc.yellow("Invalid limit (must be at least 1)"));
        process.exit(1);
      }

      limit = limitNumber;
    }

    if (args.oneline) {
      oneline = true;
    }
  }
  try {
    if (!isLogedIn()) {
      console.log(pc.red("You must be logged in to view project history."));
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

    // fetch project info from the API
    const client = await getConfiguredClient();
    const response = await client.get(
      `/projects/${userConfig.userId}/${projectId}`,
    );
    const project = response.data.project as Project;

    if (!project) {
      console.log(pc.yellow("No project found for this user or repository."));
      process.exit(1);
    }

    if (!project.content) {
      console.log(pc.yellow("No content found for this project envs."));
      process.exit(1);
    }

    const versions = await fetchVersions(userConfig.userId, projectId, limit);

    if (!versions || versions.length === 0) {
      console.log(pc.yellow("No version history found for this project."));
      return;
    }

    // Filter by author if specified
    let filteredVersions = versions;
    if (author) {
      filteredVersions = versions.filter(
        (version) =>
          version.user.email?.toLowerCase().includes(author.toLowerCase()) ||
          (version.user.name &&
            version.user.name.toLowerCase().includes(author.toLowerCase())),
      );

      if (filteredVersions.length === 0) {
        console.log(pc.yellow(`No versions found for author: ${author}`));
        return;
      }
    }

    console.log(
      pc.bold(
        `\n📜 Version history for project ${pc.cyan(`${project.name} - ${project.id}`)}`,
      ),
    );

    if (author) {
      console.log(pc.dim(`Filtered by author: ${author}`));
    }

    if (!oneline) {
      console.log(pc.dim("--------------------------------------------------"));
    }

    filteredVersions.forEach((version) => {
      if (oneline) {
        // Compact one-line format
        const shortId = version.id.substring(0, 8);
        const author = version.user.name || version.user.email;
        const date = new Date(version.createdAt).toLocaleDateString();
        const message = version.description || "No description";
        console.log(
          `${pc.yellow(shortId)} ${pc.dim(date)} ${pc.cyan(author)} ${message}`,
        );
      } else {
        // Detailed multi-line format
        console.log(
          `${pc.yellow(`version ${version.id}`)} ${pc.dim(`(by ${version.user.name || version.user.email})`)}`,
        );
        console.log(`Date:    ${new Date(version.createdAt).toLocaleString()}`);
        console.log(
          `Message: ${version.description || pc.dim("No description")}`,
        );
        console.log(
          pc.dim("--------------------------------------------------"),
        );
      }
    });
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.yellow(`\n${error.response.data.error}`));
      return;
    }
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellow("\nHistory log cancelled."));
      return;
    }
    console.error(pc.red("\nError fetching history:"), error.message);
    process.exit(1);
  }
}

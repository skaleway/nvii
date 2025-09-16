import { generateEnvVersion, readEnvFile } from "@nvii/env-helpers";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import pc from "picocolors";

interface FileError extends Error {
  code?: string;
}

interface VersionInfo {
  id: string;
  description: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
  content: Record<string, string>;
  tags?: string[];
}

export async function generateExample(args?: {
  output: string;
  format: "env" | "json" | "yaml";
}) {
  let outPutPath = "";
  let resultFormat: "env" | "json" | "yaml" | "" = "";

  if (args) {
    if (args.format) {
      resultFormat = args.format;
    }

    if (args.output) {
      outPutPath = args.output;
    }
  }

  try {
    const cwd = process.cwd();
    const envPath = join(cwd, ".env");
    const envLocalPath = join(cwd, ".env.local");
    const examplePath = ".env.example";

    let envContent: string;
    let sourceFile: string;

    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, "utf-8");
      sourceFile = ".env";
    } else if (existsSync(envLocalPath)) {
      envContent = readFileSync(envLocalPath, "utf-8");
      sourceFile = ".env.local";
    } else {
      throw new Error(
        "No .env or .env.local file found in the current directory",
      );
    }

    const existingEnvs = await readEnvFile();
    let newEnvContent = envContent
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        if (line.startsWith("#")) {
          return line;
        }

        const key = line.split("=")[0];
        if (!key) return null;

        return `${key}=""`;
      })
      .filter(Boolean)
      .join("\n");
    let filePath = examplePath;
    if (outPutPath && outPutPath.trim() !== "") {
      filePath = outPutPath;
    } else if (resultFormat && resultFormat.trim() !== "") {
      const content = { content: existingEnvs };
      newEnvContent = generateEnvVersion(
        content as Record<string, string> & VersionInfo,
        resultFormat,
      );
      filePath = `${resultFormat === "env" ? examplePath : `.env.${resultFormat}`}`;
    }

    writeFileSync(filePath, newEnvContent);

    console.log(pc.green("✓"), ` Generated ${filePath} file successfully!`);
    console.log(pc.dim("Source:"), sourceFile);
    console.log(pc.dim("Location:"), filePath);
  } catch (error: Error | any) {
    const fileError = error as FileError;
    if (fileError.code === "ENOENT") {
      console.error(pc.red("✗"), fileError.message);
      return;
    }
    console.error(
      pc.red("✗"),
      "Failed to generate .env.<format> file:",
      fileError.message,
    );
    process.exit(1);
  }
}

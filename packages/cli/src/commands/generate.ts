import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import pc from "picocolors";

interface FileError extends Error {
  code?: string;
}

export async function generateExample() {
  try {
    const cwd = process.cwd();
    const envPath = join(cwd, ".env");
    const envLocalPath = join(cwd, ".env.local");
    const examplePath = join(cwd, ".env.example");

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
        "No .env or .env.local file found in the current directory"
      );
    }

    const exampleContent = envContent
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

    writeFileSync(examplePath, exampleContent);

    console.log(pc.green("✓"), "Generated .env.example file successfully!");
    console.log(pc.dim("Source:"), sourceFile);
    console.log(pc.dim("Location:"), examplePath);
  } catch (error: unknown) {
    const fileError = error as FileError;
    if (fileError.code === "ENOENT") {
      console.error(pc.red("✗"), fileError.message);
      return;
    }
    console.error(
      pc.red("✗"),
      "Failed to generate .env.example file:",
      fileError.message
    );
  }
}

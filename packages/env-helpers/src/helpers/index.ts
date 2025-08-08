import crypto from "crypto";
import { existsSync, promises as fs, readFileSync, writeFileSync } from "fs";
import os from "os";
import path from "path";
import pc from "picocolors";
import { ConfigData } from "../types";

export * from "./api-client";
export * from "./conflict";
export * from "./version";
export * from "./encrypt";
export * from "./diff";
export * from "./version-helpers";

export const FILENAME = process.env.FILENAME || ".nvii";

const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || "KRHW2MSHGJ5HC2KXHFKDKNZSPBATQ4DD",
  "utf8",
).slice(0, 32);

const IV_LENGTH = 16;

export async function readConfigFile(): Promise<ConfigData | null> {
  try {
    const homeDir = os.homedir();
    const filePath = path.join(homeDir, FILENAME);
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    console.error(
      pc.red("Oups! you're not yet logged-in. run npm install -g @nvii/cli"),
    );
    return null;
  }
}

// check login stats
export async function checkLoginStats(): Promise<{ success: boolean }> {
  try {
    const homeDir = os.homedir();
    const filePath = path.join(homeDir, FILENAME);
    const fileContent = await fs.readFile(filePath, "utf-8");

    if (!fileContent) {
      return { success: false };
    }

    const file = JSON.parse(fileContent);

    console.log(pc.green(`Logged in as ${file.username} (${file.email})`));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export function getVersion() {
  const packageJson = readFileSync(
    path.join(__dirname, "../..", "package.json"),
    "utf-8",
  );
  const { version } = JSON.parse(packageJson);
  return version;
}

export function isLogedIn() {
  const filePath = path.join(os.homedir(), FILENAME);
  return existsSync(filePath);
}

/**
 * Converts a parsed `.env` JSON object back to its original string format.
 * @param envObject - The parsed environment variables as a JSON object.
 * @returns A string representation in `.env` format.
 */
export function convertEnvJsonToString(
  envObject: Record<string, string>,
): string {
  return Object.entries(envObject)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

/**
 * Reads and parses the root `.env` file into a JSON object.
 * @returns A parsed object containing key-value pairs from the `.env` file.
 */
export async function readEnvFile(): Promise<Record<string, string>> {
  try {
    const envPath = path.join(process.cwd(), ".env");
    const envContent = await fs.readFile(envPath, "utf-8");

    return envContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#")) // Ignore empty lines and comments
      .reduce(
        (acc, line) => {
          const [key, value] = line.split("=");
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        },
        {} as Record<string, string>,
      );
  } catch (error) {
    console.error(pc.yellow("⚠️ No .env file found or unable to read it."));
    return {};
  }
}

/**
 * Writes to the root `.env` file
 * @param envs - The decrypted env values from the server.
 * @returns A parsed object containing key-value pairs from the `.env` file.
 */
export async function writeEnvFile(
  envs: Record<string, string>,
): Promise<Record<string, string>> {
  try {
    const envPath = path.join(process.cwd(), ".env");
    const envContent = await fs.readFile(envPath, "utf-8");
    let newEnvContent: Record<string, string> = {};

    Object.entries(envs).map((item) => {
      envContent.split("\n").map(
        (line) => {
          const [key, value] = line.split("=");
          // tackle empty commented lines
          if (!key && !value && line.startsWith("#")) {
            newEnvContent = { ...newEnvContent, "#": "" };
          }
          // update these lines with values received
          if (key && value) {
            // tackle commented lines that were ignored in the push or read process.
            if (line.startsWith("#")) {
              newEnvContent[key.trim()] = value.trim();
            } else {
              if (envs[key.trim()]) {
                newEnvContent[key.trim()] = envs[key.trim()];
              }
            }
          }
        },
        {} as Record<string, string>,
      );

      // handle values that are not available locally.
      newEnvContent[item[0]] = item[1];
    });

    const finalEnvContent = Object.entries(newEnvContent)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    await writeFileSync(envPath, finalEnvContent);

    return envs;
  } catch (error: Error | any) {
    console.log(pc.red(error));
    console.error(pc.yellow("⚠️ No .env file found or unable to write in it."));
    return {};
  }
}

function deriveKey(userId: string): Buffer {
  // Simplify key derivation to reduce potential inconsistencies
  return crypto
    .createHash("sha256")
    .update(ENCRYPTION_KEY)
    .update(userId)
    .digest()
    .slice(0, 32); // Ensure exactly 32 bytes
}

function encrypt(text: string, userId: string): string {
  const key = deriveKey(userId);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string, userId: string): string {
  const key = deriveKey(userId);
  const textParts = text.split(":");
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedText = Buffer.from(textParts[1], "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Encrypts all values in an environment object.
 * @param envObject - The parsed .env object.
 * @returns A new object with encrypted values.
 */
export function encryptEnvValues(
  envObject: Record<string, string>,
  userId: string,
): Record<string, string> {
  const encryptedEnv: Record<string, string> = {};
  for (const key in envObject) {
    encryptedEnv[key] = encrypt(envObject[key], userId);
  }
  return encryptedEnv;
}

/**
 * Decrypts all values in an environment object.
 * @param encryptedEnv - The encrypted .env object.
 * @returns A new object with decrypted values.
 */
export function decryptEnvValues(
  encryptedEnv: Record<string, string>,
  userId: string,
): Record<string, string> {
  const decryptedEnv: Record<string, string> = {};
  for (const key in encryptedEnv) {
    decryptedEnv[key] = decrypt(encryptedEnv[key], userId);
  }
  return decryptedEnv;
}

/**
 * Type definition for the project configuration
 */
export interface ProjectConfig {
  projectId: string;
  branch?: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Reads project configuration from .nvii/nvii.json file
 * @returns Promise<ProjectConfig[] | null> The project configurations or null if not found
 */
export async function readProjectConfig(): Promise<ProjectConfig | null> {
  try {
    const currentDir = process.cwd();
    const enviDirPath = path.join(currentDir, ".nvii");
    const enviFilePath = path.join(enviDirPath, "nvii.json");

    // Check if both directory and file exist
    if (!existsSync(enviDirPath) || !existsSync(enviFilePath)) {
      console.warn(
        pc.yellow("No project configuration found. A new one will be created."),
      );
      return null;
    }

    // Read and parse the configuration file
    const fileContent = await fs.readFile(enviFilePath, "utf-8");
    const config: ProjectConfig = JSON.parse(fileContent);

    // Validate the configuration
    if (!config.projectId) {
      console.warn(
        pc.yellow(
          "⚠️ Invalid project configuration: missing projectId for some projects.",
        ),
      );
      return null;
    }

    return config;
  } catch (error) {
    console.error(pc.red("Error reading project configuration:"), error);
    return null;
  }
}

/**
 * Updates or creates .gitignore to include the .nvii folder
 */
async function updateGitignore(): Promise<void> {
  try {
    const currentDir = process.cwd();
    const gitignorePath = path.join(currentDir, ".gitignore");
    const enviEntry = ".nvii/";

    let content = "";
    if (existsSync(gitignorePath)) {
      // Read existing .gitignore
      content = await fs.readFile(gitignorePath, "utf-8");

      // Check if .nvii is already in .gitignore
      if (content.split("\n").some((line) => line.trim() === enviEntry)) {
        return; // Already exists, no need to update
      }

      // Add a newline if the file doesn't end with one
      if (content.length > 0 && !content.endsWith("\n")) {
        content += "\n";
      }
    }

    // Append .nvii/ to .gitignore
    content += `${enviEntry}\n`;
    await fs.writeFile(gitignorePath, content, "utf-8");
    console.log(pc.green("✅ Updated .gitignore to exclude .nvii folder"));
  } catch (error) {
    console.error(pc.red("Error updating .gitignore:"), error);
    // Don't throw error as this is not critical
  }
}

/**
 * Writes project configuration to .nvii/nvii.json file
 * @param projectId - The project ID to save
 */
export async function writeProjectConfig(
  projectId: string,
  brachName?: string,
): Promise<void> {
  try {
    const currentDir = process.cwd();
    const enviDirPath = path.join(currentDir, ".nvii");
    const enviFilePath = path.join(enviDirPath, "nvii.json");

    if (!existsSync(enviDirPath)) {
      // Create .nvii directory if it doesn't exist
      await fs.mkdir(enviDirPath, { recursive: true });
    }

    // Update .gitignore before writing the config
    await updateGitignore();

    // Merge new projectId with existing config
    const updatedConfig: { projectId: string; branch?: string } = {
      projectId,
    };

    if (brachName && brachName.trim() !== "") {
      updatedConfig.branch = brachName;
    }

    // Write the updated configuration
    await fs.writeFile(
      enviFilePath,
      JSON.stringify(updatedConfig, null, 2),
      "utf-8",
    );

    console.log(
      pc.green(
        `✅ Project configuration ${projectId ? "updated" : "saved"} at ${enviFilePath}`,
      ),
    );
  } catch (error) {
    console.error(pc.red("Error writing project configuration:"), error);
    throw error;
  }
}

/**
 * Delete project configuration from .nvii/nvii.json file
 * @param projectId - The project ID to unlink
 */
export async function unlinkProjectConfig(projectId: string): Promise<boolean> {
  let success = false;
  try {
    const currentDir = process.cwd();
    const enviDirPath = path.join(currentDir, ".nvii");
    const enviFilePath = path.join(enviDirPath, "nvii.json");

    // Check if .nvii directory exists
    if (existsSync(enviDirPath)) {
      // Check if nvii.json exists and delete it
      if (existsSync(enviFilePath)) {
        try {
          const config = await readProjectConfig();
          // delete the directory if there is a config in it config
          if (config) {
            await fs.unlink(enviFilePath);
            await fs.rmdir(enviDirPath);
          }
          success = true;
        } catch (error) {
          console.warn(pc.yellow("Warning: Could not delete nvii.json."));
          return success;
        }
      }
    } else {
      console.warn(pc.yellow("Warning: .nvii directory not found."));
      return success;
    }

    console.log(
      pc.green(`✅ Project configuration ${projectId ? "updated" : "saved"}.`),
    );
    return success;
  } catch (error) {
    console.error(pc.red("Error writing project configuration:"), error);
    return success;
  }
}

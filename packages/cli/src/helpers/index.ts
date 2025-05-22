import crypto from "crypto";
import { existsSync, promises as fs, readFileSync } from "fs";
import os from "os";
import path from "path";
import pc from "picocolors";
import { ConfigData } from "../types";

export const FILENAME = process.env.FILENAME || ".envincible";
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(
    String(process.env.ENCRYPTION_KEY || "KRHW2MSHGJ5HC2KXHFKDKNZSPBATQ4DD")
  )
  .digest();
const IV_LENGTH = 16;

export async function readConfigFile(): Promise<ConfigData | null> {
  try {
    const homeDir = os.homedir();
    const filePath = path.join(homeDir, FILENAME);
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error: any) {
    console.error(
      pc.red("Oups! you're not yet logged-in. run npm install -g @envi/cli")
    );
    return null;
  }
}

export function getVersion() {
  const packageJson = readFileSync(
    path.join(__dirname, "../..", "package.json"),
    "utf-8"
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
  envObject: Record<string, string>
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
        {} as Record<string, string>
      );
  } catch (error) {
    console.error(pc.yellow("⚠️ No .env file found or unable to read it."));
    return {}; // Return an empty object if the file doesn't exist
  }
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string): string {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedText = Buffer.from(textParts[1], "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText.toString("hex"), "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Encrypts all values in an environment object.
 * @param envObject - The parsed .env object.
 * @returns A new object with encrypted values.
 */
export function encryptEnvValues(
  envObject: Record<string, string>
): Record<string, string> {
  const encryptedEnv: Record<string, string> = {};
  for (const key in envObject) {
    encryptedEnv[key] = encrypt(envObject[key]);
  }
  return encryptedEnv;
}

/**
 * Decrypts all values in an environment object.
 * @param encryptedEnv - The encrypted .env object.
 * @returns A new object with decrypted values.
 */
export function decryptEnvValues(
  encryptedEnv: Record<string, string>
): Record<string, string> {
  const decryptedEnv: Record<string, string> = {};
  for (const key in encryptedEnv) {
    decryptedEnv[key] = decrypt(encryptedEnv[key]);
  }
  return decryptedEnv;
}

/**
 * Type definition for the project configuration
 */
export interface ProjectConfig {
  projectId: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Reads project configuration from .envi/envi.json file
 * @returns Promise<ProjectConfig | null> The project configuration or null if not found
 */
export async function readProjectConfig(): Promise<ProjectConfig | null> {
  try {
    const currentDir = process.cwd();
    const enviDirPath = path.join(currentDir, ".envi");
    const enviFilePath = path.join(enviDirPath, "envi.json");

    // Check if both directory and file exist
    if (!existsSync(enviDirPath) || !existsSync(enviFilePath)) {
      console.warn(
        pc.yellow(
          "⚠️ No project configuration found. Run 'envi new' to create a new project."
        )
      );
      return null;
    }

    // Read and parse the configuration file
    const fileContent = await fs.readFile(enviFilePath, "utf-8");
    const config = JSON.parse(fileContent);

    // Validate the configuration
    if (!config.projectId) {
      console.warn(
        pc.yellow("⚠️ Invalid project configuration: missing projectId")
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
 * Writes project configuration to .envi/envi.json file
 * @param projectId - The project ID to save
 */
export async function writeProjectConfig(projectId: string): Promise<void> {
  try {
    const currentDir = process.cwd();
    const enviDirPath = path.join(currentDir, ".envi");
    const enviFilePath = path.join(enviDirPath, "envi.json");

    let existingConfig: { projectId?: string } = {};

    // Check if .envi directory exists
    if (existsSync(enviDirPath)) {
      // Check if envi.json exists and read it
      if (existsSync(enviFilePath)) {
        try {
          const fileContent = await fs.readFile(enviFilePath, "utf-8");
          existingConfig = JSON.parse(fileContent);
        } catch (error) {
          console.warn(
            pc.yellow(
              "Warning: Could not parse existing envi.json, creating new file"
            )
          );
        }
      }
    } else {
      // Create .envi directory if it doesn't exist
      await fs.mkdir(enviDirPath, { recursive: true });
    }

    // Merge new projectId with existing config
    const updatedConfig = {
      ...existingConfig,
      projectId,
    };

    // Write the updated configuration
    await fs.writeFile(
      enviFilePath,
      JSON.stringify(updatedConfig, null, 2),
      "utf-8"
    );

    console.log(
      pc.green(
        `✅ Project configuration ${existingConfig.projectId ? "updated" : "saved"} at ${enviFilePath}`
      )
    );
  } catch (error) {
    console.error(pc.red("Error writing project configuration:"), error);
    throw error;
  }
}

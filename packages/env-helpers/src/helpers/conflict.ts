import inquirer from "inquirer";
import pc from "picocolors";

export interface ConflictResolution {
  [key: string]: "overwrite" | "skip";
}

function normalizeValue(value: string | undefined): string {
  if (value === undefined) return "";
  return String(value).trim().replace(/^"|"$/g, ""); // Remove quotes and trim
}

/**
 * Detects conflicts between local and remote environment variables.
 * @param localEnv The local environment variables.
 * @param remoteEnv The remote environment variables.
 * @returns An array of keys that have conflicts.
 */
export function detectConflicts(
  localEnv: Record<string, string>,
  remoteEnv: Record<string, string>,
): string[] {
  const conflicts: string[] = [];
  for (const key in remoteEnv) {
    const normalizedLocal = normalizeValue(localEnv[key]);
    if (
      localEnv[key] !== undefined &&
      normalizedLocal !== normalizeValue(remoteEnv[key])
    ) {
      conflicts.push(key);
    }
  }
  return conflicts;
}

/**
 * Prompts the user to resolve conflicts between local and remote environment variables.
 * @param conflicts An array of keys that have conflicts.
 * @returns A promise that resolves to a ConflictResolution object.
 */
export async function promptConflictResolution(
  conflicts: string[],
): Promise<ConflictResolution> {
  const resolution: ConflictResolution = {};

  for (const key of conflicts) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: `Conflict found for ${pc.cyan(key)}. Choose how to resolve:`,
        choices: [
          {
            name: "Overwrite local value with remote value",
            value: "overwrite",
          },
          { name: "Skip remote value and keep local value", value: "skip" },
        ],
      },
    ]);
    resolution[key] = action;
  }

  return resolution;
}

/**
 * Merges local and remote environments based on the provided conflict resolution.
 * @param localEnv The local environment variables.
 * @param remoteEnv The remote environment variables.
 * @param resolution A ConflictResolution object specifying how to resolve conflicts.
 * @returns A new environment object with the conflicts resolved.
 */
export function mergeEnvironments(
  localEnv: Record<string, string>,
  remoteEnv: Record<string, string>,
  resolution: ConflictResolution,
): Record<string, string> {
  const mergedEnv: Record<string, string> = { ...localEnv };
  for (const key in remoteEnv) {
    if (resolution[key] === "overwrite" || localEnv[key] === undefined) {
      mergedEnv[key] = remoteEnv[key];
    }
  }
  return mergedEnv;
}

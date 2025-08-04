import inquirer from "inquirer";

export interface ConflictResolution {
  [key: string]: "existing" | "new";
}

/**
 * Detects conflicts between local and remote environment variables.
 * @param localEnv Local environment variables
 * @param remoteEnv Remote environment variables
 * @returns Array of conflicting keys
 */
export function detectConflicts(
  localEnv: Record<string, string>,
  remoteEnv: Record<string, string>
): string[] {
  const conflicts: string[] = [];
  
  for (const [key, localValue] of Object.entries(localEnv)) {
    if (key in remoteEnv && remoteEnv[key] !== localValue) {
      conflicts.push(key);
    }
  }
  
  return conflicts;
}

/**
 * Prompts user to resolve conflicts interactively.
 * @param conflicts Array of conflicting keys
 * @returns Resolution choices for each conflict
 */
export async function promptConflictResolution(
  conflicts: string[]
): Promise<ConflictResolution> {
  const resolution: ConflictResolution = {};
  
  console.log(`\n⚠️  Found ${conflicts.length} conflict(s). Please resolve them:\n`);
  
  for (const key of conflicts) {
    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: `Conflict for "${key}":`,
        choices: [
          { name: "Keep local value", value: "existing" },
          { name: "Use remote value", value: "new" },
        ],
      },
    ]);
    resolution[key] = choice;
  }
  
  return resolution;
}

/**
 * Resolves conflicts by merging environments based on resolution choices.
 * @param localEnv Local environment variables
 * @param remoteEnv Remote environment variables
 * @param resolution Resolution choices
 * @returns Merged environment variables
 */
export function resolveConflicts(
  localEnv: Record<string, string>,
  remoteEnv: Record<string, string>,
  resolution: ConflictResolution
): Record<string, string> {
  const mergedEnv = { ...localEnv };
  
  // Apply remote changes first
  for (const [key, value] of Object.entries(remoteEnv)) {
    if (!(key in localEnv)) {
      // New key from remote, add it
      mergedEnv[key] = value;
    }
  }
  
  // Apply conflict resolutions
  for (const [key, choice] of Object.entries(resolution)) {
    if (choice === "new") {
      mergedEnv[key] = remoteEnv[key];
    }
  }
  
  return mergedEnv;
}

/**
 * Merges environments automatically when there are no conflicts.
 * @param localEnv Local environment variables
 * @param remoteEnv Remote environment variables
 * @returns Merged environment variables
 */
export function mergeEnvironments(
  localEnv: Record<string, string>,
  remoteEnv: Record<string, string>
): Record<string, string> {
  return { ...localEnv, ...remoteEnv };
}

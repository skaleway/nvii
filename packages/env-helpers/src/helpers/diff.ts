export interface DiffResult {
  added: string[];
  removed: string[];
  updated: [string, { old: string; new: string }][];
}

/**
 * Generates a diff between two environment variable objects.
 * @param oldContent The old environment variables.
 * @param newContent The new environment variables.
 * @returns An object containing the added, removed, and updated keys.
 */
export function generateDiff(
  oldContent: Record<string, string>,
  newContent: Record<string, string>,
): DiffResult {
  const oldKeys = new Set(Object.keys(oldContent));
  const newKeys = new Set(Object.keys(newContent));

  const added = [...newKeys].filter((key) => !oldKeys.has(key));
  const removed = [...oldKeys].filter((key) => !newKeys.has(key));
  const updated: [string, { old: string; new: string }][] = [];

  for (const key of oldKeys) {
    if (newKeys.has(key) && oldContent[key] !== newContent[key]) {
      updated.push([key, { old: oldContent[key], new: newContent[key] }]);
    }
  }

  return { added, removed, updated };
}

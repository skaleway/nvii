export interface DiffResult {
  added: DiffItem[];
  modified: DiffItem[];
  deleted: DiffItem[];
  unchanged: DiffItem[];
}

export interface DiffItem {
  key: string;
  oldValue?: string;
  newValue?: string;
  type: "added" | "modified" | "deleted" | "unchanged";
}

export interface VersionChanges {
  added: string[];
  modified: string[];
  deleted: string[];
}

/**
 * Compare two versions and return detailed diff results
 */
export function compareVersions(
  version1: Record<string, string>,
  version2: Record<string, string>,
): DiffResult {
  const result: DiffResult = {
    added: [],
    modified: [],
    deleted: [],
    unchanged: [],
  };

  const allKeys = new Set([...Object.keys(version1), ...Object.keys(version2)]);

  for (const key of allKeys) {
    const oldValue = version1[key];
    const newValue = version2[key];

    if (!oldValue && newValue) {
      result.added.push({
        key,
        newValue,
        type: "added",
      });
    } else if (oldValue && !newValue) {
      result.deleted.push({
        key,
        oldValue,
        type: "deleted",
      });
    } else if (oldValue !== newValue) {
      result.modified.push({
        key,
        oldValue,
        newValue,
        type: "modified",
      });
    } else {
      result.unchanged.push({
        key,
        oldValue,
        newValue,
        type: "unchanged",
      });
    }
  }

  // Sort all arrays by key name
  const sortByKey = (a: DiffItem, b: DiffItem) => a.key.localeCompare(b.key);
  result.added.sort(sortByKey);
  result.modified.sort(sortByKey);
  result.deleted.sort(sortByKey);
  result.unchanged.sort(sortByKey);

  return result;
}

/**
 * Generate a human-readable diff report
 */
export function generateDiffReport(diff: DiffResult): string {
  const lines: string[] = [];

  lines.push("=== DIFF REPORT ===");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");

  // Summary
  lines.push("SUMMARY:");
  lines.push(`  Added: ${diff.added.length} variables`);
  lines.push(`  Modified: ${diff.modified.length} variables`);
  lines.push(`  Deleted: ${diff.deleted.length} variables`);
  lines.push(`  Unchanged: ${diff.unchanged.length} variables`);
  lines.push("");

  // Added variables
  if (diff.added.length > 0) {
    lines.push("ADDED VARIABLES:");
    diff.added.forEach((item) => {
      lines.push(`+ ${item.key} = ${item.newValue}`);
    });
    lines.push("");
  }

  // Modified variables
  if (diff.modified.length > 0) {
    lines.push("MODIFIED VARIABLES:");
    diff.modified.forEach((item) => {
      lines.push(`~ ${item.key}`);
      lines.push(`  - ${item.oldValue}`);
      lines.push(`  + ${item.newValue}`);
    });
    lines.push("");
  }

  // Deleted variables
  if (diff.deleted.length > 0) {
    lines.push("DELETED VARIABLES:");
    diff.deleted.forEach((item) => {
      lines.push(`- ${item.key} = ${item.oldValue}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format version changes into a readable summary
 */
export function formatVersionChanges(changes: VersionChanges): string {
  const parts: string[] = [];

  if (changes.added.length > 0) {
    parts.push(`${changes.added.length} added`);
  }
  if (changes.modified.length > 0) {
    parts.push(`${changes.modified.length} modified`);
  }
  if (changes.deleted.length > 0) {
    parts.push(`${changes.deleted.length} deleted`);
  }

  return parts.length > 0 ? parts.join(", ") : "No changes";
}

/**
 * Calculate percentage of changes between two versions
 */
export function calculateChangePercentage(
  version1: Record<string, string>,
  version2: Record<string, string>,
): number {
  const diff = compareVersions(version1, version2);
  const totalChanges =
    diff.added.length + diff.modified.length + diff.deleted.length;
  const totalVariables = new Set([
    ...Object.keys(version1),
    ...Object.keys(version2),
  ]).size;

  return totalVariables > 0 ? (totalChanges / totalVariables) * 100 : 0;
}

/**
 * Export diff as various formats
 */
export function exportDiff(
  diff: DiffResult,
  format: "text" | "json" | "csv" = "text",
): string {
  switch (format) {
    case "json":
      return JSON.stringify(diff, null, 2);

    case "csv":
      const csvLines = ["Key,Type,Old Value,New Value"];
      const allItems = [...diff.added, ...diff.modified, ...diff.deleted];
      allItems.forEach((item) => {
        const oldValue = item.oldValue
          ? `"${item.oldValue.replace(/"/g, '""')}"`
          : "";
        const newValue = item.newValue
          ? `"${item.newValue.replace(/"/g, '""')}"`
          : "";
        csvLines.push(`"${item.key}",${item.type},${oldValue},${newValue}`);
      });
      return csvLines.join("\n");

    case "text":
    default:
      return generateDiffReport(diff);
  }
}

/**
 * Merge two environment variable sets with conflict resolution
 */
export function mergeEnvironments(
  base: Record<string, string>,
  incoming: Record<string, string>,
  strategy: "base" | "incoming" | "manual" = "incoming",
): { merged: Record<string, string>; conflicts: string[] } {
  const merged = { ...base };
  const conflicts: string[] = [];

  for (const [key, value] of Object.entries(incoming)) {
    if (key in base && base[key] !== value) {
      conflicts.push(key);

      switch (strategy) {
        case "base":
          // Keep base value, don't overwrite
          break;
        case "incoming":
          merged[key] = value;
          break;
        case "manual":
          // Leave for manual resolution
          break;
      }
    } else {
      merged[key] = value;
    }
  }

  return { merged, conflicts };
}

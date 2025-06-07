type EnvContent = {
  [key: string]: string;
};

interface VersionChanges {
  added: string[];
  modified: string[];
  deleted: string[];
}

export function calculateChanges(
  oldContent: EnvContent | null,
  newContent: EnvContent,
): VersionChanges {
  const changes: VersionChanges = {
    added: [],
    modified: [],
    deleted: [],
  };

  // If there's no old content, all current variables are new
  if (!oldContent) {
    changes.added = Object.keys(newContent);
    return changes;
  }

  // Find added and modified variables
  for (const key in newContent) {
    if (!(key in oldContent)) {
      changes.added.push(key);
    } else if (oldContent[key] !== newContent[key]) {
      changes.modified.push(key);
    }
  }

  // Find deleted variables
  for (const key in oldContent) {
    if (!(key in newContent)) {
      changes.deleted.push(key);
    }
  }

  return changes;
}

export function formatChangeSummary(changes: VersionChanges): string {
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

  return parts.join(", ") || "No changes";
}

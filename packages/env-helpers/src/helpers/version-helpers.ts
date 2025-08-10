type EnvContent = {
  [key: string]: string;
};

interface VersionChanges {
  added: string[];
  modified: string[];
  deleted: string[];
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

interface VersionTag {
  id: string;
  name: string;
  versionId: string;
  createdAt: Date;
  createdBy: string;
}

interface VersionAnalytics {
  changeFrequency: {
    date: string;
    changes: number;
    versions: number;
  }[];
  mostChangedVariables: {
    variable: string;
    changeCount: number;
    lastChanged: Date;
  }[];
  userActivity: {
    user: {
      name: string | null;
      email: string | null;
    };
    versions: number;
    lastActivity: Date;
  }[];
  versionStats: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    averagePerDay: number;
  };
  changeTypes: {
    added: number;
    modified: number;
    deleted: number;
  };
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

/**
 * Get version analytics for a project
 */
export async function getVersionAnalytics(
  projectId: string,
): Promise<VersionAnalytics> {
  try {
    const response = await fetch(`/api/projects/${projectId}/analytics`);
    if (!response.ok) {
      throw new Error("Failed to fetch analytics");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching version analytics:", error);
    throw error;
  }
}

/**
 * Create a version tag
 */
export async function createVersionTag(
  versionId: string,
  tagName: string,
): Promise<VersionTag> {
  try {
    const response = await fetch(`/api/versions/${versionId}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: tagName }),
    });

    if (!response.ok) {
      throw new Error("Failed to create tag");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating version tag:", error);
    throw error;
  }
}

/**
 * Merge two versions
 */
export async function mergeVersions(
  sourceVersionId: string,
  targetVersionId: string,
): Promise<VersionInfo> {
  try {
    const response = await fetch(`/api/versions/merge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceVersionId,
        targetVersionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to merge versions");
    }

    return await response.json();
  } catch (error) {
    console.error("Error merging versions:", error);
    throw error;
  }
}

/**
 * Get version history for a project
 */
export async function getVersionHistory(
  projectId: string,
  options?: {
    limit?: number;
    offset?: number;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  },
): Promise<VersionInfo[]> {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());
    if (options?.userId) params.append("userId", options.userId);
    if (options?.dateFrom)
      params.append("dateFrom", options.dateFrom.toISOString());
    if (options?.dateTo) params.append("dateTo", options.dateTo.toISOString());

    const response = await fetch(
      `/api/projects/${projectId}/versions?${params}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch version history");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching version history:", error);
    throw error;
  }
}

/**
 * Export version as different formats
 */
export function exportVersion(
  version: VersionInfo,
  format: "env" | "json" | "yaml" = "env",
): string {
  switch (format) {
    case "json":
      return JSON.stringify(version.content, null, 2);

    case "yaml":
      return Object.entries(version.content)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

    case "env":
    default:
      return Object.entries(version.content)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");
  }
}

/**
 * Generate an example env versions as different formats
 */
export function generateEnvVersion(
  version: VersionInfo,
  format: "env" | "json" | "yaml" = "env",
): string {
  switch (format) {
    case "json": {
      let content = {};
      Object.entries(version.content).map(([key]) => {
        content = { ...content, [key]: "" };
      });
      return JSON.stringify(content, null, 2);
    }
    case "yaml":
      return (
        "nvii:\n" +
        Object.entries(version.content)
          .map(([key]) => `\t${key}: ${'""'}`)
          .join("\n")
      );

    case "env":
    default:
      return Object.entries(version.content)
        .map(([key]) => `${key}=${'""'}`)
        .join("\n");
  }
}

/**
 * Validate version content
 */
export function validateVersionContent(content: Record<string, string>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for empty keys
  for (const key of Object.keys(content)) {
    if (!key.trim()) {
      errors.push("Environment variable keys cannot be empty");
    }

    // Check for invalid characters in keys
    if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) {
      errors.push(
        `Invalid key format: ${key}. Keys should contain only letters, numbers, and underscores.`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

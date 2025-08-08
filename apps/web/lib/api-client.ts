import { EnvVersion } from "@nvii/db";
import { Project } from "../types/project";

// Version control types
export interface VersionInfo {
  id: string;
  description: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
  changes: Record<string, any> | null;
  tags?: string[];
  isCurrent?: boolean;
}

export interface VersionTag {
  id: string;
  name: string;
  versionId: string;
  createdAt: Date;
  createdBy: string;
}

export interface VersionBranch {
  id: string;
  name: string;
  baseVersionId: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
}

export interface VersionAnalytics {
  totalVersions: number;
  changeFrequency: { date: string; changes: number }[];
  mostChangedVariables: { key: string; changeCount: number }[];
  userActivity: { userId: string; userName: string; versionCount: number }[];
  recentActivity: { date: string; action: string; user: string }[];
}

const API_BASE = "/api";

export type CreateProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt" | "userId" | "content" | "deviceId"
>;

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    const data = await response.json();

    // Transform the data to set status based on totalEmpty
    return data.map((project: Project) => ({
      ...project,
      status: project.content.totalEmpty > 0 ? "missing" : "valid",
      envCount: project.content.totalElem,
    }));
  },

  create: async (
    project: CreateProjectInput,
    userId: string,
  ): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    });
    if (!response.ok) {
      throw new Error("Failed to create project");
    }
    const data = await response.json();

    // Transform the response to set status based on totalEmpty
    const completeData = data.data;
    return {
      ...completeData,
      status:
        Object.entries(completeData.content).length > 0 ? "missing" : "valid",
      envCount: completeData.content.totalElem,
    };
  },

  delete: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/projects/${userId}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete project");
    }
  },

  get: async (id: string): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch project");
    }
    const data = await response.json();

    return {
      ...data,
      status: data.content.totalEmpty > 0 ? "missing" : "valid",
      envCount: data.content.totalElem,
    };
  },
};

export const projectApi = {
  get: async (
    projectId: string,
    userId: string,
  ): Promise<{ project: Project }> => {
    const response = await fetch(`${API_BASE}/projects/${userId}/${projectId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch project");
    }
    const data = await response.json();

    return data;
  },

  versions: async (
    projectId: string,
    userId: string,
  ): Promise<EnvVersion[]> => {
    const response = await fetch(
      `${API_BASE}/projects/${userId}/${projectId}/versions`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch project versions");
    }
    const data = await response.json();

    return data;
  },
  version: async (
    projectId: string,
    userId: string,
    versionId: string,
  ): Promise<EnvVersion> => {
    const response = await fetch(
      `${API_BASE}/projects/${userId}/${projectId}/versions/${versionId}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch project versions");
    }
    const data = await response.json();

    return data;
  },
};

export type ProjectAccessUser = {
  id: string;
  name: string | null;
  email: string | null;
};

export type ProjectAccess = {
  projectId: string;
  userId: string;
  assignedAt: string;
  user: ProjectAccessUser;
};

export const projectAccessApi = {
  list: async (projectId: string, userId: string): Promise<ProjectAccess[]> => {
    const response = await fetch(
      `${API_BASE}/projects/${userId}/${projectId}/access`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch project access");
    }
    return response.json();
  },

  add: async (
    projectId: string,
    userEmail: string,
    userId: string,
  ): Promise<ProjectAccess> => {
    const response = await fetch(
      `${API_BASE}/projects/${userId}/${projectId}/access`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      },
    );
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || "Failed to add project access");
    }
    return await response.json();
  },

  remove: async (projectId: string, userIdToRemove: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE}/projects/${userIdToRemove}/${projectId}/access/${userIdToRemove}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to remove project access");
    }
  },
};

// Version control API methods
export const versionApi = {
  // Get all versions for a project
  list: async (projectId: string): Promise<VersionInfo[]> => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/versions`);
    if (!response.ok) {
      throw new Error("Failed to fetch versions");
    }
    return response.json();
  },

  // Get a specific version
  get: async (projectId: string, versionId: string): Promise<VersionInfo> => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/versions/${versionId}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch version");
    }
    return response.json();
  },

  // Create a new version
  create: async (
    projectId: string,
    description?: string,
  ): Promise<VersionInfo> => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/versions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });
    if (!response.ok) {
      throw new Error("Failed to create version");
    }
    return response.json();
  },

  // Rollback to a specific version
  rollback: async (
    projectId: string,
    versionId: string,
  ): Promise<VersionInfo> => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/versions/${versionId}/rollback`,
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to rollback version");
    }
    return response.json();
  },

  // Delete a version
  delete: async (projectId: string, versionId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/versions/${versionId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to delete version");
    }
  },

  // Compare two versions
  compare: async (
    projectId: string,
    version1Id: string,
    version2Id: string,
  ): Promise<any> => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/versions/compare?v1=${version1Id}&v2=${version2Id}`,
    );
    if (!response.ok) {
      throw new Error("Failed to compare versions");
    }
    return response.json();
  },

  // Export a version
  export: async (
    projectId: string,
    versionId: string,
    format: "json" | "env" = "env",
  ): Promise<string> => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/versions/${versionId}/export?format=${format}`,
    );
    if (!response.ok) {
      throw new Error("Failed to export version");
    }
    return response.text();
  },
};

// Version tags API methods
export const versionTagApi = {
  // Get all tags for a project
  list: async (projectId: string): Promise<VersionTag[]> => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/tags`);
    if (!response.ok) {
      throw new Error("Failed to fetch tags");
    }
    return response.json();
  },

  // Create a tag for a version
  create: async (
    projectId: string,
    versionId: string,
    tagName: string,
  ): Promise<VersionTag> => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/versions/${versionId}/tags`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: tagName }),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to create tag");
    }
    return response.json();
  },

  // Delete a tag
  delete: async (projectId: string, tagId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/tags/${tagId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to delete tag");
    }
  },
};

// Version branches API methods
export const versionBranchApi = {
  // Get all branches for a project
  list: async (projectId: string): Promise<VersionBranch[]> => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/branches`);
    if (!response.ok) {
      throw new Error("Failed to fetch branches");
    }
    return response.json();
  },

  // Create a branch from a version
  create: async (
    projectId: string,
    baseVersionId: string,
    branchName: string,
    description?: string,
  ): Promise<VersionBranch> => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ baseVersionId, name: branchName, description }),
    });
    if (!response.ok) {
      throw new Error("Failed to create branch");
    }
    return response.json();
  },

  // Delete a branch
  delete: async (projectId: string, branchId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/branches/${branchId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to delete branch");
    }
  },
};

// Version analytics API methods
export const versionAnalyticsApi = {
  // Get analytics for a project's versions
  get: async (projectId: string): Promise<VersionAnalytics> => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/analytics`);
    if (!response.ok) {
      throw new Error("Failed to fetch version analytics");
    }
    return response.json();
  },
};

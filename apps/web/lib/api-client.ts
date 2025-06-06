import { Project } from "../types/project";

const API_BASE = "/api";

export type CreateProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt" | "userId" | "content"
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
    userId: string
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
    return {
      ...data,
      status: data.content.totalEmpty > 0 ? "missing" : "valid",
      envCount: data.content.totalElem,
    };
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
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
  list: async (projectId: string): Promise<ProjectAccess[]> => {
    const response = await fetch(`/api/projects/access?projectId=${projectId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch project access list");
    }
    return response.json();
  },

  add: async (projectId: string, userEmail: string): Promise<ProjectAccess> => {
    const response = await fetch("/api/projects/access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectId, userEmail }),
    });
    if (!response.ok) {
      throw new Error("Failed to add project access");
    }
    return response.json();
  },

  remove: async (projectId: string, userIdToRemove: string): Promise<void> => {
    const response = await fetch(
      `/api/projects/access?projectId=${projectId}&userIdToRemove=${userIdToRemove}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to remove project access");
    }
  },
};

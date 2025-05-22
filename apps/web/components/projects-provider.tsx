"use client";

import * as React from "react";

type Project = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  envCount: number;
  status: "valid" | "missing" | "invalid";
  slug: string;
};

type ProjectsContextType = {
  projects: Project[];
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  filteredProjects: (filter: string) => Project[];
  filterValue: string;
  setFilterValue: (filter: string) => void;
};

const ProjectsContext = React.createContext<ProjectsContextType | undefined>(
  undefined
);

// Initial projects data
const initialProjects: Project[] = [
  {
    id: "1",
    name: "Web App",
    description: "Frontend application",
    updatedAt: "Updated 2 hours ago",
    envCount: 12,
    status: "valid",
    slug: "web-app",
  },
  {
    id: "2",
    name: "API Service",
    description: "Backend API",
    updatedAt: "Updated 1 day ago",
    envCount: 24,
    status: "valid",
    slug: "api-service",
  },
  {
    id: "3",
    name: "Admin Dashboard",
    description: "Internal admin tools",
    updatedAt: "Updated 3 days ago",
    envCount: 18,
    status: "missing",
    slug: "admin-dashboard",
  },
  {
    id: "4",
    name: "Marketing Site",
    description: "Public website",
    updatedAt: "Updated 5 days ago",
    envCount: 8,
    status: "valid",
    slug: "marketing-site",
  },
  {
    id: "5",
    name: "Authentication Service",
    description: "User authentication",
    updatedAt: "Updated 1 week ago",
    envCount: 15,
    status: "invalid",
    slug: "authentication-service",
  },
  {
    id: "6",
    name: "Analytics",
    description: "Data processing",
    updatedAt: "Updated 2 weeks ago",
    envCount: 21,
    status: "valid",
    slug: "analytics",
  },
];

// Helper function to safely access localStorage
const getLocalStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
};

// Helper function to safely set localStorage
const setLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  // Initialize projects from localStorage or use initialProjects if not available
  const [projects, setProjects] = React.useState<Project[]>(() => {
    return getLocalStorage<Project[]>("envsync-projects", initialProjects);
  });
  const [filterValue, setFilterValue] = React.useState("all");

  // Save projects to localStorage whenever they change
  React.useEffect(() => {
    setLocalStorage("envsync-projects", projects);
  }, [projects]);

  const addProject = React.useCallback((project: Project) => {
    setProjects((prev) => [project, ...prev]);
  }, []);

  const removeProject = React.useCallback((id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  }, []);

  const filteredProjects = React.useCallback(
    (filter: string) => {
      if (filter === "all") return projects;
      return projects.filter((project) => project.status === filter);
    },
    [projects]
  );

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        addProject,
        removeProject,
        filteredProjects,
        filterValue,
        setFilterValue,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = React.useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}

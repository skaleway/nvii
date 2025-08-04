"use client";

import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  projectsApi,
  CreateProjectInput,
  projectAccessApi,
  ProjectAccess,
  projectApi,
} from "../lib/api-client";
import { Project } from "../types/project";
import { useSession } from "@/provider/session";

type ProjectsContextType = {
  projects: Project[];
  isRefetchingProjects: boolean;
  refetchProjects: () => void;
  isLoading: boolean;
  error: Error | null;
  addProject: (project: CreateProjectInput) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  filteredProjects: (filter: string) => Project[];
  filterValue: string;
  setFilterValue: (filter: string) => void;
  getProjectAccess: (projectId: string) => Promise<ProjectAccess[]>;
  addProjectAccess: (projectId: string, userEmail: string) => Promise<void>;
  removeProjectAccess: (projectId: string, userId: string) => Promise<void>;
};

const ProjectsContext = React.createContext<ProjectsContextType | undefined>(
  undefined,
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [filterValue, setFilterValue] = React.useState("all");

  return (
    <QueryClientProvider client={queryClient}>
      <ProjectsProviderInner
        filterValue={filterValue}
        setFilterValue={setFilterValue}
      >
        {children}
      </ProjectsProviderInner>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function ProjectsProviderInner({
  children,
  filterValue,
  setFilterValue,
}: {
  children: React.ReactNode;
  filterValue: string;
  setFilterValue: (filter: string) => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useSession();

  // Fetch projects
  const {
    data: projects = [],
    isLoading,
    error,
    refetch: refetchProjects,
    isRefetching: isRefetchingProjects,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
    staleTime: Infinity,
    gcTime: 500,
  });

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: (project: CreateProjectInput) =>
      projectsApi.create(project, user?.id ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  // Remove project mutation
  const removeProjectMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const addProject = React.useCallback(
    async (project: CreateProjectInput) => {
      await addProjectMutation.mutateAsync(project);
    },
    [addProjectMutation],
  );

  const removeProject = React.useCallback(
    async (id: string) => {
      await removeProjectMutation.mutateAsync(id);
    },
    [removeProjectMutation],
  );

  const filteredProjects = React.useCallback(
    (filter: string) => {
      if (filter === "all") return projects;
      return projects.filter((project) => project.status === filter);
    },
    [projects],
  );

  // Project access mutations
  const addProjectAccessMutation = useMutation({
    mutationFn: ({
      projectId,
      userEmail,
    }: {
      projectId: string;
      userEmail: string;
    }) => projectAccessApi.add(projectId, userEmail),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projectAccess", projectId] });
    },
  });

  const removeProjectAccessMutation = useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => projectAccessApi.remove(projectId, userId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projectAccess", projectId] });
    },
  });

  const getProjectAccess = React.useCallback(async (projectId: string) => {
    return projectAccessApi.list(projectId);
  }, []);

  const addProjectAccess = React.useCallback(
    async (projectId: string, userEmail: string) => {
      await addProjectAccessMutation.mutateAsync({ projectId, userEmail });
    },
    [addProjectAccessMutation],
  );

  const removeProjectAccess = React.useCallback(
    async (projectId: string, userId: string) => {
      await removeProjectAccessMutation.mutateAsync({ projectId, userId });
    },
    [removeProjectAccessMutation],
  );

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        error: error as Error | null,
        addProject,
        removeProject,
        filteredProjects,
        filterValue,
        setFilterValue,
        getProjectAccess,
        addProjectAccess,
        removeProjectAccess,
        isRefetchingProjects,
        refetchProjects,
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

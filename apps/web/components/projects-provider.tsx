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
import { EnvVersion, User } from "@nvii/db";

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
  getProjectAccess: (
    projectId: string,
    userId: string
  ) => Promise<ProjectAccess[]>;
  addProjectAccess: (
    projectId: string,
    userEmail: string,
    userId: string
  ) => Promise<void>;
  removeProjectAccess: (projectId: string, userId: string) => Promise<void>;
  getProjectVersions: (
    projectId: string,
    userId: string
  ) => Promise<Array<EnvVersion & { user: User }>>;
  getProjectVersion: (
    projectId: string,
    userId: string,
    versionId: string
  ) => Promise<EnvVersion & { user: User }>;
};

const ProjectsContext = React.createContext<ProjectsContextType | undefined>(
  undefined
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

  const addProjectMutation = useMutation({
    mutationFn: (project: CreateProjectInput) =>
      projectsApi.create(project, user?.id ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

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
    [addProjectMutation]
  );

  const removeProject = React.useCallback(
    async (id: string) => {
      await removeProjectMutation.mutateAsync(id);
    },
    [removeProjectMutation]
  );

  const filteredProjects = React.useCallback(
    (filter: string) => {
      if (filter === "all") return projects;
      return projects.filter((project) => project.status === filter);
    },
    [projects]
  );

  const addProjectAccessMutation = useMutation({
    mutationFn: ({
      projectId,
      userEmail,
      userId,
    }: {
      projectId: string;
      userEmail: string;
      userId: string;
    }) => projectAccessApi.add(projectId, userEmail, userId),
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
      queryClient.invalidateQueries({
        queryKey: ["projectAccess", projectId],
      });
    },
  });

  const getProjectAccess = React.useCallback(
    async (projectId: string, userId: string) => {
      return projectAccessApi.list(projectId, userId);
    },
    []
  );

  const getProjectVersions = React.useCallback(
    async (
      projectId: string,
      userId: string
    ): Promise<Array<EnvVersion & { user: User }>> => {
      return await projectApi.versions(projectId, userId);
    },
    []
  );

  const getProjectVersion = React.useCallback(
    async (
      projectId: string,
      userId: string,
      versionId: string
    ): Promise<EnvVersion & { user: User }> => {
      return await projectApi.version(projectId, userId, versionId);
    },
    []
  );

  const addProjectAccess = React.useCallback(
    async (projectId: string, userEmail: string, userId: string) => {
      await addProjectAccessMutation.mutateAsync({
        projectId,
        userEmail,
        userId,
      });
    },
    [addProjectAccessMutation]
  );

  const removeProjectAccess = React.useCallback(
    async (projectId: string, userId: string) => {
      await removeProjectAccessMutation.mutateAsync({ projectId, userId });
    },
    [removeProjectAccessMutation]
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
        getProjectVersions,
        getProjectVersion,
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

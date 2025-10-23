"use client";

import { EnvVariableTable } from "@/components/env-variable-table";
import { ProjectAccessManager } from "@/components/project-access-manager";
import { VersionHistory } from "@/components/version-history";
import { projectApi } from "@/lib/api-client";
import { useSession } from "@/provider/session";
import { Project } from "@/types/project";
import { Badge } from "@nvii/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@nvii/ui/components/breadcrumb";
import { Button } from "@nvii/ui/components/button";
import { Skeleton } from "@nvii/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, RefreshCw } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useSession();

  const getProject = async (): Promise<{ project: Project } | null> => {
    try {
      const res = await projectApi.get(projectId as string, user.id);

      return res;
    } catch (error: Error | any) {
      if (error.message) {
        toast.error(error.message);
        return null;
      }

      toast.error("Error fetching project data");
      console.error(error);
      return null;
    }
  };

  // Fetch project
  const {
    data,
    isPending,
    error,
    refetch: refetchProject,
    isRefetching: isRefetchingProject,
  } = useQuery<{ project: Project } | null>({
    queryKey: [`project-${projectId}`],
    queryFn: getProject,
    staleTime: Infinity,
    gcTime: 100,
  });

  if (!user) {
    return notFound();
  }

  if (isPending || isRefetchingProject) {
    return (
      <div className="max-w-7xl mx-auto container py-6 space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-20 bg-primary/10" />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 w-32 bg-primary/10" />
          </div>
          <Skeleton className="h-9 w-32 bg-primary/10" />
        </div>

        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-48 bg-primary/10" />
              <Skeleton className="h-6 w-24 bg-primary/10" />
            </div>
            <Skeleton className="h-5 w-80 bg-primary/10" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-20 bg-primary/10" />
            <Skeleton className="h-9 w-32 bg-primary/10" />
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <div className="p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 pb-2 border-b">
                <Skeleton className="h-4 w-16 bg-primary/10" />
                <Skeleton className="h-4 w-20 bg-primary/10" />
                <Skeleton className="h-4 w-16 bg-primary/10" />
                <Skeleton className="h-4 w-20 bg-primary/10" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`item-${i}`} className="grid grid-cols-4 gap-4 py-3">
                  <Skeleton className="h-4 w-24 bg-primary/10" />
                  <Skeleton className="h-4 w-32 bg-primary/10" />
                  <Skeleton className="h-4 w-16 bg-primary/10" />
                  <Skeleton className="h-4 w-8 bg-primary/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.project) {
    return notFound();
  }

  return (
    <div className="max-w-7xl mx-auto container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="capitalize">
                {data.project?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ProjectAccessManager
          projectId={data.project?.id as string}
          userId={user.id}
          projectUserId={data.project.userId}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight capitalize">
              {data.project?.name}
            </h1>
            <Badge variant="outline" className="ml-2">
              Development
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage environment variables for this project
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => refetchProject()}
          >
            <RefreshCw className="h-4 w-4" />
            Sync
          </Button>
          <VersionHistory userId={user.id} projectId={projectId as string} />
        </div>
      </div>

      <EnvVariableTable
        environment={data.project?.content as unknown as Record<string, string>}
        projectUserId={data.project.userId}
        userId={user.id}
      />
    </div>
  );
}

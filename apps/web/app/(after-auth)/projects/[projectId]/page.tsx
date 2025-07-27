import { EnvVariableTable } from "@/components/env-variable-table";
import { ProjectAccessManager } from "@/components/project-access-manager";
import { VersionHistory } from "@/components/version-history";
import { getCurrentUserFromSession } from "@/lib/current-user";
import { db, EnvVersion } from "@nvii/db";
import { decryptEnvValues } from "@nvii/env-helpers";
import { Badge } from "@nvii/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@nvii/ui/components/breadcrumb";
import { Button } from "@nvii/ui/components/button";
import axios from "axios";
import { ChevronRight, RefreshCw } from "lucide-react";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

async function getProjectData(projectId: string, userId: string) {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      ProjectAccess: {
        where: {
          userId,
        },
      },
    },
  });

  if (
    !project ||
    (project.userId !== userId && project.ProjectAccess.length === 0)
  ) {
    return null;
  }

  const versions = await db.envVersion.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    project,
    versions,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const user = await getCurrentUserFromSession();
  if (!user) {
    return notFound();
  }

  const { projectId } = await params;

  const data = await getProjectData(projectId, user.id);
  if (!data) {
    return notFound();
  }

  const { project, versions } = data;

  const decryptedContent = decryptEnvValues(
    project.content as Record<string, string>,
    user.id,
  );

  // const tryMe = async () => {
  //   const res = await axios.get(
  //     `api/projects/${user.id}/${projectId}/versions`
  //   );
  //   console.log({ data: res.data });
  // };

  // await tryMe();

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
                {project.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ProjectAccessManager projectId={project.id} />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight capitalize">
              {project.name}
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
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Sync
          </Button>
          <VersionHistory
            versions={versions.map(
              (
                version: EnvVersion & {
                  user: { name: string | null; email: string | null };
                },
              ) => ({
                ...version,
                changes: version.changes
                  ? JSON.parse(JSON.stringify(version.changes))
                  : null,
              }),
            )}
          />
        </div>
      </div>

      <EnvVariableTable environment={decryptedContent} />
    </div>
  );
}

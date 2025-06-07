import { EnvVariableTable } from "@/components/env-variable-table";
import { ProjectAccessManager } from "@/components/project-access-manager";
import { auth } from "@/lib/auth";
import { db } from "@workspace/db";
import { decryptEnvValues } from "@workspace/env-helpers";
import { Badge } from "@workspace/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { ChevronRight, Plus, RefreshCw } from "lucide-react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return notFound();
  }

  const project = await db.project.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id }, // Project owner
        { ProjectAccess: { some: { userId: session.user.id } } }, // Has access through sharing
      ],
    },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!project) notFound();

  // Decrypt the environment variables using the project owner's ID
  const decryptedContent =
    project.content && typeof project.content === "object"
      ? decryptEnvValues(
          project.content as Record<string, string>,
          project.user.id,
        )
      : {};

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
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Variable
          </Button>
        </div>
      </div>

      <EnvVariableTable environment={decryptedContent} />
    </div>
  );
}

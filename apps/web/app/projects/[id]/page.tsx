import { EnvVariableTable } from "@/components/env-variable-table";
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
import { auth } from "@clerk/nextjs/server";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return notFound();
  }

  const project = await db.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) notFound();

  // Decrypt the environment variables
  const decryptedContent =
    project.content && typeof project.content === "object"
      ? decryptEnvValues(project.content as Record<string, string>, userId)
      : {};

  return (
    <div className="container py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
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

      <Tabs defaultValue="development" className="w-full">
        <TabsList>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="staging">Staging</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>
        <TabsContent value="development" className="mt-4">
          <EnvVariableTable environment={decryptedContent} />
        </TabsContent>
        <TabsContent value="staging" className="mt-4">
          <EnvVariableTable environment={decryptedContent} />
        </TabsContent>
        <TabsContent value="production" className="mt-4">
          <EnvVariableTable environment={decryptedContent} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

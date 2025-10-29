"use client";

import { useProjects } from "@/components/projects-provider";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/provider/session";
import { Project, ProjectAccess } from "@/types/project";
import { Badge } from "@nvii/ui/components/badge";
import { Button } from "@nvii/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nvii/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@nvii/ui/components/dropdown-menu";
import { Copy, MoreVertical, RefreshCcw, Trash2, User } from "lucide-react";
import Link from "next/link";
import { toast as toaster } from "sonner";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { removeProject } = useProjects();
  const { toast } = useToast();
  const { user } = useSession();

  const isSharedProject = project.userId !== user?.id;
  const sharedBy = project.ProjectAccess?.find(
    (access: ProjectAccess) => access.user.id === project.userId
  )?.user;

  const handleDelete = async () => {
    if (!project.id) return;

    const toastId = toaster.loading(`Deleting "${project.name}"`);
    try {
      await removeProject(project.id);
      toast({
        title: "Project deleted",
        description: `${project.name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Your project could not be deleted. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating project:", error);
    } finally {
      toaster.dismiss(toastId);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Project id copied",
      description: `Project ${project.name} id copied successfully.`,
    });
  };

  return (
    <Card className="overflow-hidden transition-all shadow-none">
      <CardHeader className="flex flex-row items-start justify-between pb-2  space-y-0">
        <CardTitle>
          <Link
            href={`/projects/${project.id}`}
            className="text-lg font-bold capitalize"
          >
            {project.name}
            {isSharedProject && (
              <Badge variant="secondary" className="ml-2 text-xs">
                <User className="mr-1 h-4 w-4" />
                Shared by {sharedBy?.name || sharedBy?.email || "Unknown"}
              </Badge>
            )}
          </Link>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sync">
                <RefreshCcw className="mr-1 h-4 w-4" />
                Sync Variables
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyId(project.id)}>
              <Copy className="mr-1 h-4 w-4" />
              Copy Project Id
            </DropdownMenuItem>
            {!isSharedProject && (
              <DropdownMenuItem
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-0 flex flex-col gap-4">
        <p className="text-muted-foreground line-clamp-2 px-4">
          {project.description}
        </p>
        <div className="border-t flex items-center justify-between p-4">
          <Badge>{project.content.totalElem} variables</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

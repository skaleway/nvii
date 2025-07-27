"use client";

import Link from "next/link";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@nvii/ui/lib/utils";
import { Button } from "@nvii/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@nvii/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@nvii/ui/components/dropdown-menu";
import { useProjects } from "@/components/projects-provider";
import { useToast } from "@/hooks/use-toast";
import { parseISO, format } from "date-fns";
import { AnalyzedContent, Project, ProjectAccess } from "@/types/project";
import { useSession } from "@/provider/session";
import { VersionHistory } from "./version-history";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const slug = project.name.toLowerCase().replace(/\s+/g, "-");
  const { removeProject } = useProjects();
  const { toast } = useToast();
  const { user } = useSession();

  const isSharedProject = project.userId !== user?.id;
  const sharedBy = project.ProjectAccess?.find(
    (access: ProjectAccess) => access.user.id === project.userId,
  )?.user;

  const handleDelete = () => {
    if (!project.id) return;

    removeProject(project.id);
    toast({
      title: "Project deleted",
      description: `${project.name} has been deleted successfully.`,
    });
  };

  return (
    <Card className="overflow-hidden transition-all shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <Link href={`/projects/${project.id}`}>
            <h3 className="font-semibold leading-none tracking-tight hover:text-primary">
              {project.name}
              {isSharedProject && (
                <span className="ml-2 text-xs text-muted-foreground">
                  Shared by {sharedBy?.name || sharedBy?.email || "Unknown"}
                </span>
              )}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}`}>View Details</Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}`}>Edit Variables</Link>
            </DropdownMenuItem> */}
            <DropdownMenuItem asChild>
              <Link href="/sync">Sync Variables</Link>
            </DropdownMenuItem>
            {!isSharedProject && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                Delete Project
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {format(parseISO(project.updatedAt), "MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-2">
            <VersionHistory projectId={project.id} />
            <span className="text-sm font-medium">
              {project.content.totalElem} variables
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter
        className={cn(
          "border-t px-6 py-3",
          project.status === "valid" && "bg-emerald-500/10",
          project.status === "missing" && "bg-amber-500/10",
          project.status === "invalid" && "bg-rose-500/10",
        )}
      >
        <div className="flex items-center gap-2 text-sm">
          {status === "valid" && (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          )}
          {status === "missing" && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
          {status === "invalid" && (
            <XCircle className="h-4 w-4 text-rose-500" />
          )}
          <span
            className={cn(
              status === "valid" && "text-emerald-500",
              status === "missing" && "text-amber-500",
              status === "invalid" && "text-rose-500",
            )}
          >
            {status === "valid" && "All variables valid"}
            {status === "missing" && "Missing variables"}
            {status === "invalid" && "Invalid variables"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

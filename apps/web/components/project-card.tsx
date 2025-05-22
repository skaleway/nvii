"use client";

import Link from "next/link";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useProjects } from "@/components/projects-provider";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  name: string;
  description: string;
  updatedAt: string;
  envCount: number;
  status: "valid" | "missing" | "invalid";
  id?: string;
}

export function ProjectCard({
  id,
  name,
  description,
  updatedAt,
  envCount,
  status,
}: ProjectCardProps) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const { removeProject } = useProjects();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!id) return;

    removeProject(id);
    toast({
      title: "Project deleted",
      description: `${name} has been deleted successfully.`,
    });
  };

  return (
    <Card className="overflow-hidden transition-all shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <Link href={`/projects/${slug}`}>
            <h3 className="font-semibold leading-none tracking-tight hover:text-primary">
              {name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">{description}</p>
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
              <Link href={`/projects/${slug}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/projects/${slug}`}>Edit Variables</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sync">Sync Variables</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDelete}
            >
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{updatedAt}</div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{envCount} variables</span>
          </div>
        </div>
      </CardContent>
      <CardFooter
        className={cn(
          "border-t px-6 py-3",
          status === "valid" && "bg-emerald-500/10",
          status === "missing" && "bg-amber-500/10",
          status === "invalid" && "bg-rose-500/10"
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
              status === "invalid" && "text-rose-500"
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

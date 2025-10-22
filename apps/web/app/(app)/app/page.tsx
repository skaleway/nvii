"use client";

import { AddProjectDialog } from "@/components/add-project-dialog";
import { ProjectCard } from "@/components/project-card";
import { useProjects } from "@/components/projects-provider";
import {
  ProjectCardSkeleton,
  StatusCardSkeleton,
} from "@/components/skeletons";
import { StatusCard } from "@/components/status-card";
import { Button } from "@nvii/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nvii/ui/components/select";
import { RefreshCcw } from "lucide-react";

export default function Dashboard() {
  const { projects, filteredProjects, filterValue, setFilterValue, isLoading } =
    useProjects();

  const validCount = projects.filter((p) => p.status === "valid").length;
  const missingCount = projects.filter((p) => p.status === "missing").length;
  const invalidCount = projects.filter((p) => p.status === "invalid").length;

  const displayedProjects = filteredProjects(filterValue);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto container">
      <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="md:text-sm text-xs text-muted-foreground">
            Manage your environment variables across all projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="missing">Missing Variables</SelectItem>
              <SelectItem value="invalid">Invalid Variables</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <AddProjectDialog>
            <Button>Add Project</Button>
          </AddProjectDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
          </>
        ) : (
          <>
            <StatusCard
              title="Valid Projects"
              value={validCount.toString()}
              description="All environment variables are valid"
              status="valid"
            />
            <StatusCard
              title="Missing Variables"
              value={missingCount.toString()}
              description="Projects with missing environment variables"
              status="missing"
            />
            <StatusCard
              title="Invalid Variables"
              value={invalidCount.toString()}
              description="Projects with invalid environment variables"
              status="invalid"
            />
          </>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Projects</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-7xl">
          {isLoading ? (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          ) : displayedProjects.length > 0 ? (
            displayedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No projects match the current filter.
              </p>
              <AddProjectDialog>
                <Button>Create a New Project</Button>
              </AddProjectDialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

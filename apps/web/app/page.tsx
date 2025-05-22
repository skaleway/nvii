"use client";
import { ProjectCard } from "@/components/project-card";
import { StatusCard } from "@/components/status-card";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { AddProjectDialog } from "@/components/add-project-dialog";
import { useProjects } from "@/components/projects-provider";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { projects, filteredProjects, filterValue, setFilterValue } =
    useProjects();
  const router = useRouter();

  // Calculate status counts
  const validCount = projects.filter((p) => p.status === "valid").length;
  const missingCount = projects.filter((p) => p.status === "missing").length;
  const invalidCount = projects.filter((p) => p.status === "invalid").length;

  // Get filtered projects based on current filter
  const displayedProjects = filteredProjects(filterValue);

  return (
    <div className="container py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
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
            onClick={() => {
              router.refresh();
            }}
          >
            <RefreshCcw />
            <span>Refresh</span>
          </Button>
          <AddProjectDialog>
            <Button>Add Project</Button>
          </AddProjectDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Recent Projects</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            name={project.name}
            description={project.description}
            updatedAt={project.updatedAt}
            envCount={project.envCount}
            status={project.status}
          />
        ))}

        {displayedProjects.length === 0 && (
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
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@nvii/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nvii/ui/components/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@nvii/ui/components/breadcrumb";
import { Skeleton } from "@nvii/ui/components/skeleton";
import { useSession } from "@/provider/session";
import { useProjects } from "@/components/projects-provider";
import { format } from "date-fns";

export default function ProjectsPage() {
  const { projects, isLoading } = useProjects();
  const { user } = useSession();
  const [sortOrder, setSortOrder] = useState("asc");

  const sortedProjects = [...projects].sort((a, b) => {
    if (sortOrder === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>Projects</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button variant="outline" size="sm" onClick={toggleSortOrder}>
          {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-48" />)
        ) : projects.length > 0 ? (
          sortedProjects.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden transition-all shadow-none"
            >
              <CardHeader>
                <CardTitle className="leading-none text-lg">
                  <Link href={`/projects/${project.id}`}>{project.name}</Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {project.description || "No description available"}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Created on{" "}
                  {format(new Date(project.createdAt), "MMM d, yyyy")}
                </p>
                <p className="text-sm">{project.content.totalElem} variables</p>
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      project.status === "valid"
                        ? "text-green-600"
                        : project.status === "missing"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }
                  >
                    {project.status}
                  </span>
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No projects found.</p>
            <Link href="/create">
              <Button>Create a New Project</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

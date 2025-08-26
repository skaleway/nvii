"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { VersionActions } from "@/components/version-actions";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Code,
  GitCommit,
  Copy,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@nvii/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nvii/ui/components/card";
import { Badge } from "@nvii/ui/components/badge";
import { ScrollArea } from "@nvii/ui/components/scroll-area";
import { useProjects } from "@/components/projects-provider";
import { useSession } from "@/provider/session";
import { useQuery } from "@tanstack/react-query";

export default function VersionDetailsPage() {
  const { projectId, versionId } = useParams();
  const router = useRouter();
  const { user } = useSession();

  const { getProjectVersion } = useProjects();
  const fetchVersionDetails = async (): Promise<any | null> => {
    try {
      const data = await getProjectVersion(
        projectId as string,
        user.id,
        versionId as string
      );
      console.log({ data });
      return data;
    } catch (error) {
      toast.error("Failed to load version details");
      console.error("Error fetching version details:", error);
      return null;
    }
  };
  const {
    data: version,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useQuery<any | null>({
    queryFn: fetchVersionDetails,
    queryKey: ["versionDetails", projectId, versionId],
    gcTime: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleRollback = async (versionId: string) => {
    toast.success("Version rollback initiated");
  };

  const handleCreateTag = async (versionId: string, tagName: string) => {
    toast.success(`Tag "${tagName}" created`);
  };

  const handleCreateBranch = async (versionId: string, branchName: string) => {
    toast.success(`Branch "${branchName}" created`);
  };

  const handleDeleteVersion = async (versionId: string) => {
    toast.success("Version deleted");
    router.push(`/projects/${projectId}/versions`);
  };

  const handleExportVersion = async (versionId: string) => {
    toast.success("Version exported");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getChangeType = (
    key: string
  ): "added" | "modified" | "deleted" | null => {
    if (!version?.changes) return null;
    if (version.changes.added.includes(key)) return "added";
    if (version.changes.modified.includes(key)) return "modified";
    if (version.changes.deleted.includes(key)) return "deleted";
    return null;
  };

  if (isPending) {
    return (
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-primary/10 rounded w-1/3" />
          <div className="h-4 bg-primary/10 rounded w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-primary/10 rounded" />
            <div className="h-64 bg-primary/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!version) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium">Version not found</h3>
          <Link href={`/projects/${projectId}/versions`}>
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Versions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link href={`/projects/${projectId}/versions`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <VersionActions
          version={version}
          projectId={projectId as string}
          onRollback={handleRollback}
          onTag={handleCreateTag}
          onBranch={handleCreateBranch}
          onDelete={handleDeleteVersion}
          onExport={handleExportVersion}
        />
      </div>

      {/* Version Title & ID */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {version.description || `Version ${version.id.slice(0, 8)}`}
        </h1>
        <div className="flex items-center gap-2">
          <code className="text-sm px-2 py-1 rounded bg-muted">
            {version.id}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(version.id)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environment Variables */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                <span>Environment Variables</span>
                <Badge variant="outline">
                  {Object.keys(version.content).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {Object.entries(version.content).map(([key, value]) => {
                    const changeType = getChangeType(key);
                    return (
                      <div
                        key={key}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <code className="font-semibold text-sm">{key}</code>
                            {changeType && (
                              <Badge variant="outline" className="text-xs">
                                {changeType}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`${key}=${value}`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-mono text-sm break-all border rounded p-2 bg-muted">
                          {value as string}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Version Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCommit className="h-5 w-5" />
                <span>Version Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {version.user.name || version.user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {version.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatDistanceToNow(version.createdAt, {
                      addSuffix: true,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {version.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>

              {version.isCurrent && (
                <Badge variant="default" className="w-fit">
                  Current Version
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

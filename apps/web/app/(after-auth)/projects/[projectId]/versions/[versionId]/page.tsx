"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VersionActions } from "@/components/version-actions";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Code,
  GitCommit,
  Plus,
  Minus,
  Edit,
  Copy,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface VersionDetails {
  id: string;
  description: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
  tags: string[];
  isCurrent: boolean;
  content: Record<string, string>;
  changes: {
    added: string[];
    modified: string[];
    deleted: string[];
  } | null;
  previousVersion?: {
    id: string;
    content: Record<string, string>;
  };
}

export default function VersionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const versionId = params.versionId as string;

  const [version, setVersion] = useState<VersionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVersionDetails = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockVersion: VersionDetails = {
          id: versionId,
          description:
            "Added new API endpoints and updated database configuration",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          user: {
            name: "John Doe",
            email: "john@example.com",
          },
          tags: ["v1.2.0", "production", "stable"],
          isCurrent: true,
          content: {
            DATABASE_URL: "postgresql://user:pass@localhost:5432/nvii",
            API_BASE_URL: "https://api.nvii.dev",
            API_TIMEOUT: "30000",
            JWT_SECRET: "***hidden***",
            REDIS_URL: "redis://localhost:6379",
            NODE_ENV: "production",
          },
          changes: {
            added: ["API_BASE_URL", "API_TIMEOUT"],
            modified: ["DATABASE_URL", "NODE_ENV"],
            deleted: ["OLD_API_URL"],
          },
          previousVersion: {
            id: "prev123",
            content: {
              DATABASE_URL: "postgresql://user:pass@localhost:5432/old_nvii",
              JWT_SECRET: "***hidden***",
              REDIS_URL: "redis://localhost:6379",
              NODE_ENV: "development",
              OLD_API_URL: "https://old-api.nvii.dev",
            },
          },
        };

        setVersion(mockVersion);
      } catch (error) {
        toast.error("Failed to load version details");
        console.error("Error fetching version details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersionDetails();
  }, [projectId, versionId]);

  const handleRollback = async (versionId: string) => {
    console.log("Rolling back to version:", versionId);
    toast.success("Version rollback initiated");
  };

  const handleCreateTag = async (versionId: string, tagName: string) => {
    console.log("Creating tag:", tagName, "for version:", versionId);
    toast.success(`Tag "${tagName}" created`);
  };

  const handleCreateBranch = async (
    versionId: string,
    branchName: string,
    description?: string,
  ) => {
    console.log("Creating branch:", branchName, "from version:", versionId);
    toast.success(`Branch "${branchName}" created`);
  };

  const handleDeleteVersion = async (versionId: string) => {
    console.log("Deleting version:", versionId);
    toast.success("Version deleted");
    router.push(`/projects/${projectId}/versions`);
  };

  const handleExportVersion = async (versionId: string) => {
    console.log("Exporting version:", versionId);
    toast.success("Version exported");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getChangeType = (
    key: string,
  ): "added" | "modified" | "deleted" | null => {
    if (!version?.changes) return null;
    if (version.changes.added.includes(key)) return "added";
    if (version.changes.modified.includes(key)) return "modified";
    if (version.changes.deleted.includes(key)) return "deleted";
    return null;
  };

  const getChangeIcon = (type: "added" | "modified" | "deleted" | null) => {
    switch (type) {
      case "added":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "modified":
        return <Edit className="h-4 w-4 text-blue-600" />;
      case "deleted":
        return <Minus className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded" />
            </div>
            <div className="h-64 bg-gray-200 rounded" />
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Version not found
          </h3>
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/projects/${projectId}/versions`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Versions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {version.description || `Version ${version.id.slice(0, 8)}`}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
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
        </div>

        <VersionActions
          version={version}
          projectId={projectId}
          onRollback={handleRollback}
          onTag={handleCreateTag}
          onBranch={handleCreateBranch}
          onDelete={handleDeleteVersion}
          onExport={handleExportVersion}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Environment Variables</span>
                <Badge variant="outline">
                  {Object.keys(version.content).length} variables
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {Object.entries(version.content).map(([key, value]) => {
                    const changeType = getChangeType(key);
                    return (
                      <div key={key} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getChangeIcon(changeType)}
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
                        <div className="bg-gray-50 p-2 rounded border font-mono text-sm break-all">
                          {value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitCommit className="h-5 w-5" />
                <span>Version Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
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

              <div className="flex items-center space-x-2">
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

          {version.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {version.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

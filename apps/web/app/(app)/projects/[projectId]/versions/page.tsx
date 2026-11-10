"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";

import { VersionHistory } from "@/components/version-history";
import { VersionActions } from "@/components/version-actions";
import { VersionAnalytics } from "@/components/version-analytics";
import {
  Search,
  Filter,
  Calendar,
  User,
  GitCompare,
  Plus,
  History,
  BarChart3,
  ArrowUpDown,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@nvii/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nvii/ui/components/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nvii/ui/components/card";
import { Input } from "@nvii/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nvii/ui/components/select";
import { Badge } from "@nvii/ui/components/badge";
import { useProjects } from "@/components/projects-provider";
import { useSession } from "@/provider/session";
import { EnvVersion, User as UserType } from "@nvii/db";

interface VersionAnalyticsData {
  changeFrequency: {
    date: string;
    changes: number;
    versions: number;
  }[];
  mostChangedVariables: {
    variable: string;
    changeCount: number;
    lastChanged: Date;
  }[];
  userActivity: {
    user: {
      name: string | null;
      email: string | null;
    };
    versions: number;
    lastActivity: Date;
  }[];
  versionStats: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    averagePerDay: number;
  };
  changeTypes: {
    added: number;
    modified: number;
    deleted: number;
  };
}

export default function VersionsPage() {
  const { projectId } = useParams();
  const { user } = useSession();

  const [analytics, setAnalytics] = useState<VersionAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "changes">("date");
  const [activeTab, setActiveTab] = useState("history");
  const [versions, setVersions] = useState<
    Array<EnvVersion & { user: UserType }>
  >([]);
  const { getProjectVersions, getProjectAccess } =
    useProjects();

  const [users, setUsers] = useState<
    Array<{ id: string; email: string | null; name: string | null }>
  >([]);

  const loadUsers = useCallback(async () => {
    try {
      const projectAccess = await getProjectAccess(
        projectId as string,
        user.id
      );
      setUsers(projectAccess.map((access) => access.user));
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users with access");
    }
  }, [projectId, getProjectAccess, user.id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProjectVersions(
        projectId as string,
        user.id as string
      );

      if (!data) {
        toast.error("Cannot fetch env versions at the moment.");
        return;
      }

      setVersions(data as Array<EnvVersion & { user: UserType }>);
    } catch (error) {
      toast.error("An error occurred loading env versions.");
    } finally {
      setIsLoading(false);
    }
  }, [getProjectVersions, user.id, projectId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const versionActionUrl = (versionId: string, suffix = "") =>
    `/api/projects/${user.id}/${projectId}/versions/${versionId}${suffix}`;

  const throwForBadResponse = async (response: Response, fallback: string) => {
    if (response.ok) return;
    let message = fallback;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // keep the fallback message
    }
    throw new Error(message);
  };

  const handleRollback = async (versionId: string) => {
    const response = await fetch(versionActionUrl(versionId, "/rollback"), {
      method: "POST",
    });
    await throwForBadResponse(response, "Failed to rollback version");
    await loadVersions();
  };

  const handleCreateTag = async (versionId: string, tagName: string) => {
    const response = await fetch(versionActionUrl(versionId, "/tags"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: tagName }),
    });
    await throwForBadResponse(response, "Failed to create tag");
    await loadVersions();
  };

  const handleCreateBranch = async (
    versionId: string,
    branchName: string,
    description?: string
  ) => {
    const response = await fetch(
      `/api/projects/${user.id}/${projectId}/versions/branches`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branchName,
          baseVersionId: versionId,
          description,
        }),
      }
    );
    await throwForBadResponse(response, "Failed to create branch");
  };

  const handleDeleteVersion = async (versionId: string) => {
    const response = await fetch(versionActionUrl(versionId), {
      method: "DELETE",
    });
    await throwForBadResponse(response, "Failed to delete version");
    await loadVersions();
  };

  const handleExportVersion = async (versionId: string) => {
    const response = await fetch(versionActionUrl(versionId, "/export?format=env"));
    await throwForBadResponse(response, "Failed to export version");
    const text = await response.text();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `version-${versionId.slice(0, 8)}.env`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredVersions = versions.filter((version) => {
    const matchesSearch =
      !searchQuery ||
      version.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      version.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      version.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      version.user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUser =
      selectedUser === "all" || version.user.email === selectedUser;

    return matchesSearch && matchesUser;
  });

  const sortedVersions = [...filteredVersions].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      const getChangeCount = (changes: any) => {
        if (
          changes &&
          typeof changes === "object" &&
          "added" in changes &&
          "modified" in changes &&
          "deleted" in changes &&
          Array.isArray(changes.added) &&
          Array.isArray(changes.modified) &&
          Array.isArray(changes.deleted)
        ) {
          return (
            changes.added.length +
            changes.modified.length +
            changes.deleted.length
          );
        }
        return 0;
      };

      const aChanges = getChangeCount(a.changes);
      const bChanges = getChangeCount(b.changes);
      return bChanges - aChanges;
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mt-4">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to explorer
          </Button>
        </Link>

        <div className="flex items-center space-x-2">
          <Link href={`/projects/${projectId}/versions/compare`}>
            <Button variant="outline">
              <GitCompare className="mr-2 h-4 w-4" />
              Compare Versions
            </Button>
          </Link>
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold">Version History</h1>
        <p className="text-muted-foreground">
          Track and manage your environment variable versions
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search versions, descriptions, or users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-48">
                    <User className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.email!}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as "date" | "changes")
                  }
                >
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="changes">Sort by Changes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Version List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-primary/10 rounded animate-pulse" />
                        <div className="h-3 bg-primary/10 rounded animate-pulse w-2/3" />
                        <div className="h-3 bg-primary/10 rounded animate-pulse w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedVersions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <History className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No versions found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || selectedUser !== "all"
                      ? "Try adjusting your filters"
                      : "Versions will appear here as you make changes"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              sortedVersions.map((version) => (
                <Card
                  key={version.id}
                  className={version.isCurrent ? "ring-2 ring-blue-500" : ""}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/projects/${projectId}/versions/${version.id}`}
                            className="text-lg font-semibold hover:underline"
                          >
                            {version.description ||
                              `Version ${version.id.slice(0, 8)}`}
                          </Link>
                          {version.isCurrent && (
                            <Badge variant="default">Current</Badge>
                          )}
                          {/* {version.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))} */}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>
                            by {version.user.name || version.user.email}
                          </span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(version.createdAt, {
                              addSuffix: true,
                            })}
                          </span>
                          <span>•</span>
                          <Badge
                            variant={"outline"}
                            className="text-xs text-gray-100 px-2 py-1 rounded"
                          >
                            {version.id.slice(0, 8)}
                          </Badge>
                        </div>

                        {version.changes &&
                          typeof version.changes === "object" &&
                          version.changes !== null &&
                          "added" in version.changes &&
                          "modified" in version.changes &&
                          "deleted" in version.changes &&
                          Array.isArray((version.changes as any).added) &&
                          Array.isArray((version.changes as any).modified) &&
                          Array.isArray((version.changes as any).deleted) && (
                            <div className="flex items-center space-x-4">
                              {(version.changes as any).added.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-green-600"
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  {(version.changes as any).added.length} added
                                </Badge>
                              )}
                              {(version.changes as any).modified.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-blue-600"
                                >
                                  {(version.changes as any).modified.length}{" "}
                                  modified
                                </Badge>
                              )}
                              {(version.changes as any).deleted.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-red-600"
                                >
                                  {(version.changes as any).deleted.length}{" "}
                                  deleted
                                </Badge>
                              )}
                            </div>
                          )}
                      </div>

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
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <VersionAnalytics
            projectId={projectId as string}
            userId={user.id as string}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

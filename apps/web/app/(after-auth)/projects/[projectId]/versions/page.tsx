"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

interface Version {
  id: string;
  description: string | null;
  createdAt: Date;
  changes: {
    added: string[];
    modified: string[];
    deleted: string[];
  } | null;
  user: {
    name: string | null;
    email: string | null;
  };
  tags: string[];
  isCurrent: boolean;
}

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

  const [versions, setVersions] = useState<Version[]>([]);
  const [analytics, setAnalytics] = useState<VersionAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "changes">("date");
  const [activeTab, setActiveTab] = useState("history");
  const { getProjectVersions } = useProjects();

  useEffect(() => {
    const handleFetch = async () => {
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

        setVersions(data);
      } catch (error) {
        toast.error("An error occurred loading env versions.");
      } finally {
        setIsLoading(false);
      }
    };

    handleFetch();
  }, [getProjectVersions, user.id, projectId]);

  const handleRollback = async (versionId: string) => {
    // Implement rollback logic
    console.log("Rolling back to version:", versionId);
  };

  const handleCreateTag = async (versionId: string, tagName: string) => {
    // Implement tag creation logic
    console.log("Creating tag:", tagName, "for version:", versionId);
  };

  const handleCreateBranch = async (
    versionId: string,
    branchName: string,
    description?: string
  ) => {
    // Implement branch creation logic
    console.log("Creating branch:", branchName, "from version:", versionId);
  };

  const handleDeleteVersion = async (versionId: string) => {
    // Implement version deletion logic
    console.log("Deleting version:", versionId);
  };

  const handleExportVersion = async (versionId: string) => {
    // Implement version export logic
    console.log("Exporting version:", versionId);
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
      const aChanges =
        (a.changes?.added.length || 0) +
        (a.changes?.modified.length || 0) +
        (a.changes?.deleted.length || 0);
      const bChanges =
        (b.changes?.added.length || 0) +
        (b.changes?.modified.length || 0) +
        (b.changes?.deleted.length || 0);
      return bChanges - aChanges;
    }
  });

  const uniqueUsers = Array.from(
    new Set(versions.map((v) => v.user.email))
  ).filter(Boolean);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Version History</h1>
          <p className="text-muted-foreground">
            Track and manage your environment variable versions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/projects/${projectId}/versions/compare`}>
            <Button variant="outline">
              <GitCompare className="mr-2 h-4 w-4" />
              Compare Versions
            </Button>
          </Link>
        </div>
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
                    {uniqueUsers.map((email) => (
                      <SelectItem key={email} value={email!}>
                        {email}
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
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
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
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {version.id.slice(0, 8)}
                          </code>
                        </div>

                        {version.changes && (
                          <div className="flex items-center space-x-4">
                            {version.changes.added.length > 0 && (
                              <Badge
                                variant="outline"
                                className="text-green-600"
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                {version.changes.added.length} added
                              </Badge>
                            )}
                            {version.changes.modified.length > 0 && (
                              <Badge
                                variant="outline"
                                className="text-blue-600"
                              >
                                {version.changes.modified.length} modified
                              </Badge>
                            )}
                            {version.changes.deleted.length > 0 && (
                              <Badge variant="outline" className="text-red-600">
                                {version.changes.deleted.length} deleted
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
            analytics={analytics}
            isLoading={isLoading}
            onRefresh={() => window.location.reload()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

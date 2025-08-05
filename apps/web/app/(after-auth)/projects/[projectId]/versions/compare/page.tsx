"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { VersionDiff } from "@/components/version-diff";
import { ArrowLeft, GitCompare, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@nvii/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nvii/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nvii/ui/components/select";
import { Label } from "@nvii/ui/components/label";
import { VersionActions } from "@/components/version-actions";

interface VersionInfo {
  id: string;
  description: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
  content: Record<string, string>;
}

export default function VersionComparePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;

  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [leftVersionId, setLeftVersionId] = useState<string>(
    searchParams.get("left") || "",
  );
  const [rightVersionId, setRightVersionId] = useState<string>(
    searchParams.get("right") || "",
  );
  const [leftVersion, setLeftVersion] = useState<VersionInfo | null>(null);
  const [rightVersion, setRightVersion] = useState<VersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockVersions: VersionInfo[] = [
          {
            id: "v1234567890abcdef",
            description: "Added new API endpoints",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            user: {
              name: "John Doe",
              email: "john@example.com",
            },
            content: {
              DATABASE_URL: "postgresql://user:pass@localhost:5432/nvii",
              API_BASE_URL: "https://api.nvii.dev",
              API_TIMEOUT: "30000",
              JWT_SECRET: "***hidden***",
              REDIS_URL: "redis://localhost:6379",
              NODE_ENV: "production",
            },
          },
          {
            id: "v0987654321fedcba",
            description: "Database migration updates",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            user: {
              name: "Jane Smith",
              email: "jane@example.com",
            },
            content: {
              DATABASE_URL: "postgresql://user:pass@localhost:5432/old_nvii",
              JWT_SECRET: "***hidden***",
              REDIS_URL: "redis://localhost:6379",
              NODE_ENV: "development",
              OLD_API_URL: "https://old-api.nvii.dev",
              DB_POOL_SIZE: "10",
            },
          },
          {
            id: "v1111222233334444",
            description: "Initial configuration",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            user: {
              name: "Admin User",
              email: "admin@example.com",
            },
            content: {
              DATABASE_URL: "postgresql://user:pass@localhost:5432/initial",
              JWT_SECRET: "***hidden***",
              NODE_ENV: "development",
            },
          },
        ];

        setVersions(mockVersions);

        // Set default versions if not provided in URL
        if (!leftVersionId && mockVersions.length > 1) {
          setLeftVersionId(mockVersions[1].id);
        }
        if (!rightVersionId && mockVersions.length > 0) {
          setRightVersionId(mockVersions[0].id);
        }
      } catch (error) {
        toast.error("Failed to load versions");
        console.error("Error fetching versions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [projectId]);

  useEffect(() => {
    if (leftVersionId) {
      const version = versions.find((v) => v.id === leftVersionId);
      setLeftVersion(version || null);
    }
  }, [leftVersionId, versions]);

  useEffect(() => {
    if (rightVersionId) {
      const version = versions.find((v) => v.id === rightVersionId);
      setRightVersion(version || null);
    }
  }, [rightVersionId, versions]);

  const handleExportDiff = async () => {
    if (!leftVersion || !rightVersion) return;

    try {
      // Generate diff content
      const diffContent = generateDiffExport(leftVersion, rightVersion);

      // Create and download file
      const blob = new Blob([diffContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `version-diff-${leftVersion.id.slice(0, 8)}-to-${rightVersion.id.slice(0, 8)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Diff exported successfully");
    } catch (error) {
      toast.error("Failed to export diff");
      console.error("Export error:", error);
    }
  };

  const handleCopyDiff = async () => {
    if (!leftVersion || !rightVersion) return;

    try {
      const diffContent = generateDiffExport(leftVersion, rightVersion);
      await navigator.clipboard.writeText(diffContent);
      toast.success("Diff copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy diff");
      console.error("Copy error:", error);
    }
  };

  const generateDiffExport = (
    left: VersionInfo,
    right: VersionInfo,
  ): string => {
    const lines = [
      `Version Comparison Report`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `Left Version: ${left.id}`,
      `Description: ${left.description || "No description"}`,
      `Created: ${left.createdAt.toISOString()}`,
      `By: ${left.user.name || left.user.email}`,
      ``,
      `Right Version: ${right.id}`,
      `Description: ${right.description || "No description"}`,
      `Created: ${right.createdAt.toISOString()}`,
      `By: ${right.user.name || right.user.email}`,
      ``,
      `Changes:`,
      `========`,
    ];

    const allKeys = new Set([
      ...Object.keys(left.content),
      ...Object.keys(right.content),
    ]);

    for (const key of Array.from(allKeys).sort()) {
      const leftValue = left.content[key];
      const rightValue = right.content[key];

      if (!leftValue && rightValue) {
        lines.push(`+ ${key}=${rightValue}`);
      } else if (leftValue && !rightValue) {
        lines.push(`- ${key}=${leftValue}`);
      } else if (leftValue !== rightValue) {
        lines.push(`~ ${key}`);
        lines.push(`  - ${leftValue}`);
        lines.push(`  + ${rightValue}`);
      }
    }

    return lines.join("\n");
  };

  const canCompare =
    leftVersion && rightVersion && leftVersionId !== rightVersionId;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-600 rounded w-1/3" />
          <div className="h-4 bg-gray-600 rounded w-1/2" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-600 rounded" />
            <div className="h-32 bg-gray-600 rounded" />
          </div>
          <div className="h-64 bg-gray-600 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col justify-between w-full">
        <div className="flex items-center space-x-4 w-full justify-between">
          <Link href={`/projects/${projectId}/versions`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Versions
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mt-4">
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <GitCompare className="h-8 w-8" />
            <span>Compare Versions</span>
          </h1>
          <p className="text-muted-foreground">
            Compare environment variables between different versions
          </p>
        </div>
      </div>

      {/* Version Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Versions to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Left Version (Base)</Label>
              <Select value={leftVersionId} onValueChange={setLeftVersionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select base version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {version.description ||
                            `Version ${version.id.slice(0, 8)}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {version.createdAt.toLocaleDateString()} •{" "}
                          {version.user.name || version.user.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Right Version (Compare)
              </label>
              <Select value={rightVersionId} onValueChange={setRightVersionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version to compare" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {version.description ||
                            `Version ${version.id.slice(0, 8)}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {version.createdAt.toLocaleDateString()} •{" "}
                          {version.user.name || version.user.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {leftVersionId === rightVersionId && leftVersionId && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please select two different versions to compare.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {canCompare ? (
        <VersionDiff
          leftVersion={leftVersion}
          rightVersion={rightVersion}
          onExport={handleExportDiff}
          onCopy={handleCopyDiff}
        />
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <GitCompare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {!leftVersionId || !rightVersionId
                ? "Select versions to compare"
                : "Select different versions to see comparison"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Choose two different versions from the dropdowns above to view
              their differences.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Download,
  Copy,
  Plus,
  Minus,
  Edit,
} from "lucide-react";
import { Badge } from "@nvii/ui/components/badge";
import { Button } from "@nvii/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nvii/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nvii/ui/components/tabs";
import { ScrollArea } from "@nvii/ui/components/scroll-area";
import { cn } from "@nvii/ui/lib/utils";

interface DiffItem {
  key: string;
  oldValue?: string;
  newValue?: string;
  type: "added" | "modified" | "deleted";
}

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

interface VersionDiffProps {
  leftVersion: VersionInfo;
  rightVersion: VersionInfo;
  onExport?: () => void;
  onCopy?: () => void;
}

export function VersionDiff({
  leftVersion,
  rightVersion,
  onExport,
  onCopy,
}: VersionDiffProps) {
  const [viewMode, setViewMode] = useState<"side-by-side" | "inline">(
    "side-by-side",
  );

  // Calculate differences
  const calculateDiff = (): DiffItem[] => {
    const diff: DiffItem[] = [];
    const allKeys = new Set([
      ...Object.keys(leftVersion.content),
      ...Object.keys(rightVersion.content),
    ]);

    for (const key of allKeys) {
      const oldValue = leftVersion.content[key];
      const newValue = rightVersion.content[key];

      if (!oldValue && newValue) {
        diff.push({ key, newValue, type: "added" });
      } else if (oldValue && !newValue) {
        diff.push({ key, oldValue, type: "deleted" });
      } else if (oldValue !== newValue) {
        diff.push({ key, oldValue, newValue, type: "modified" });
      }
    }

    return diff.sort((a, b) => a.key.localeCompare(b.key));
  };

  const diffItems = calculateDiff();
  const stats = {
    added: diffItems.filter((item) => item.type === "added").length,
    modified: diffItems.filter((item) => item.type === "modified").length,
    deleted: diffItems.filter((item) => item.type === "deleted").length,
  };

  const getTypeColor = (type: DiffItem["type"]) => {
    switch (type) {
      case "added":
        return "bg-green-200 bg-opacity-60";
      case "deleted":
        return "bg-red-200 bg-opacity-60";
      case "modified":
        return "bg-blue-200 bg-opacity-60";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with version info and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Version Comparison</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{stats.added} added</Badge>
            <Badge variant="outline">{stats.modified} modified</Badge>
            <Badge variant="outline">{stats.deleted} deleted</Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Diff
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      {/* Version headers */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              <ArrowLeft className="mr-2 h-4 w-4 inline" />
              Version {leftVersion.id.slice(0, 8)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {leftVersion.description || "No description"}
            </p>
            <p className="text-xs text-muted-foreground">
              by {leftVersion.user.name || leftVersion.user.email} •{" "}
              {leftVersion.createdAt.toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              <ArrowRight className="mr-2 h-4 w-4 inline" />
              Version {rightVersion.id.slice(0, 8)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {rightVersion.description || "No description"}
            </p>
            <p className="text-xs text-muted-foreground">
              by {rightVersion.user.name || rightVersion.user.email} •{" "}
              {rightVersion.createdAt.toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>
      </div>
      border-blue-200
      {/* View mode tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as typeof viewMode)}
      >
        <TabsList>
          <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
          <TabsTrigger value="inline">Inline</TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side" className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {diffItems.map((item, index) => (
                <Card
                  key={index}
                  className={cn(
                    "border-l-4 text-black",
                    getTypeColor(item.type),
                  )}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono">{item.key}</code>
                        </div>
                        {item.oldValue && (
                          <div className="bg-inherit p-2 rounded text-sm font-mono break-all">
                            {item.oldValue}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono">{item.key}</code>
                        </div>
                        {item.newValue && (
                          <div className="bg-inherit bg-opacity-40 p-2 rounded text-sm font-mono break-all">
                            {item.newValue}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="inline" className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {diffItems.map((item, index) => (
                <Card
                  key={index}
                  className={cn("border-l-4", getTypeColor(item.type))}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono font-semibold">
                          {item.key}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>

                      {item.type === "modified" && (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Minus className="h-3 w-3 text-red-600" />
                            <div className="bg-red-50 p-2 rounded text-sm font-mono break-all flex-1">
                              {item.oldValue}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Plus className="h-3 w-3 text-green-600" />
                            <div className="bg-green-50 p-2 rounded text-sm font-mono break-all flex-1">
                              {item.newValue}
                            </div>
                          </div>
                        </div>
                      )}

                      {item.type === "added" && (
                        <div className="flex items-center space-x-2">
                          <Plus className="h-3 w-3 text-green-600" />
                          <div className="bg-green-50 p-2 rounded text-sm font-mono break-all flex-1">
                            {item.newValue}
                          </div>
                        </div>
                      )}

                      {item.type === "deleted" && (
                        <div className="flex items-center space-x-2">
                          <Minus className="h-3 w-3 text-red-600" />
                          <div className="bg-red-50 p-2 rounded text-sm font-mono break-all flex-1">
                            {item.oldValue}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

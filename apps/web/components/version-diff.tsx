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
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@nvii/ui/components/button";
import { ScrollArea } from "@nvii/ui/components/scroll-area";
import { cn } from "@nvii/ui/lib/utils";
import { EnvVersion, User } from "@nvii/db";

interface VersionDiffProps {
  leftVersion: (EnvVersion & { user: User }) | null;
  rightVersion: (EnvVersion & { user: User }) | null;
  onExport?: () => void;
  onCopy?: () => void;
}

interface DiffLine {
  type: "added" | "deleted" | "unchanged";
  content: string;
  lineNumber?: number;
}

interface FileDiff {
  fileName: string;
  lines: DiffLine[];
}

export function VersionDiff({
  leftVersion,
  rightVersion,
  onExport,
  onCopy,
}: VersionDiffProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate differences
  const calculateFileDiff = (): FileDiff => {
    const lines: DiffLine[] = [];
    const allKeys = new Set([
      ...Object.keys(leftVersion?.content || {}),
      ...Object.keys(rightVersion?.content || {}),
    ]);

    let lineNumber = 1;
    for (const key of Array.from(allKeys).sort()) {
      const isStringRecord = (obj: unknown): obj is Record<string, string> => {
        return typeof obj === "object" && obj !== null && !Array.isArray(obj);
      };

      const leftContent = isStringRecord(leftVersion?.content)
        ? leftVersion.content
        : {};
      const rightContent = isStringRecord(rightVersion?.content)
        ? rightVersion.content
        : {};
      const oldValue = leftContent[key];
      const newValue = rightContent[key];

      if (!oldValue && newValue) {
        lines.push({
          type: "added",
          content: `${key}=${newValue}`,
          lineNumber: lineNumber++,
        });
      } else if (oldValue && !newValue) {
        lines.push({
          type: "deleted",
          content: `${key}=${oldValue}`,
          lineNumber: lineNumber++,
        });
      } else if (oldValue !== newValue) {
        lines.push({
          type: "deleted",
          content: `${key}=${oldValue}`,
          lineNumber: lineNumber++,
        });
        lines.push({
          type: "added",
          content: `${key}=${newValue}`,
          lineNumber: lineNumber++,
        });
      } else {
        lines.push({
          type: "unchanged",
          content: `${key}=${oldValue}`,
          lineNumber: lineNumber++,
        });
      }
    }

    return { fileName: ".env", lines };
  };

  const fileDiff = calculateFileDiff();
  const stats = {
    added: fileDiff.lines.filter((line) => line.type === "added").length,
    deleted: fileDiff.lines.filter((line) => line.type === "deleted").length,
  };

  return (
    <div className="border border-background/80 rounded-lg overflow-hidden bg-background">
      {/* File Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-background border-b border-muted/80 cursor-pointer hover:bg-background/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
          <FileText className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-100">.env</span>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-400 bg-opacity-15 text-green-500">
              +{stats.added}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-400 bg-opacity-15 text-red-500">
              -{stats.deleted}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCopy?.();
            }}
            className="h-8 px-3 text-xs"
          >
            <Copy className="mr-1 h-3 w-3" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onExport?.();
            }}
            className="h-8 px-3 text-xs"
          >
            <Download className="mr-1 h-3 w-3" />
            Export
          </Button>
        </div>
      </div>

      {/* Diff Content */}
      {isExpanded && (
        <div className="overflow-hidden">
          <ScrollArea className="h-auto">
            <table className="w-full h-auto text-sm font-mono">
              <tbody>
                {fileDiff.lines.map((line, index) => {
                  const isAdded = line.type === "added";
                  const isDeleted = line.type === "deleted";
                  const isUnchanged = line.type === "unchanged";

                  return (
                    <tr
                      key={index}
                      className={cn(
                        {
                          "bg-emerald-400 bg-opacity-15": isAdded,
                          "bg-rose-400 bg-opacity-15": isDeleted,
                          "bg-transparent": isUnchanged,
                        },
                        "h-10"
                      )}
                    >
                      {/* Line number column */}
                      <td className="w-12 px-3 py-0.5 text-right text-gray-400 border-r border-border select-none">
                        <span className="text-xs">{line.lineNumber}</span>
                      </td>

                      {/* Sign column */}
                      <td className="w-6 px-2 py-0.5 text-center select-none">
                        <span
                          className={cn("text-sm font-bold", {
                            "text-green-600": isAdded,
                            "text-red-600": isDeleted,
                            "text-gray-400": isUnchanged,
                          })}
                        >
                          {isAdded ? "+" : isDeleted ? "-" : " "}
                        </span>
                      </td>

                      {/* Content column */}
                      <td className="px-2 py-0.5 text-gray-300">
                        <span className="whitespace-pre text-sm">
                          {line.content}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { History, ArrowRight, Plus, Minus } from "lucide-react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Badge } from "@workspace/ui/components/badge";

interface VersionHistoryProps {
  projectId: string;
}

interface EnvVersion {
  id: string;
  createdAt: Date;
  createdBy: {
    name: string;
  };
  description: string | null;
  changes: {
    added: string[];
    modified: string[];
    deleted: string[];
  } | null;
}

export function VersionHistory({ projectId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<EnvVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/versions`);
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error("Failed to load versions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={loadVersions}>
          <History className="h-4 w-4 mr-2" />
          Version History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            Track how your environment variables have changed over time
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : versions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDistanceToNow(new Date(version.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>{version.createdBy.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {version.changes?.added.length ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="default" className="h-5">
                              <Plus className="h-3 w-3 mr-1" />
                              {version.changes.added.length} added
                            </Badge>
                          </div>
                        ) : null}
                        {version.changes?.modified.length ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="destructive" className="h-5">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              {version.changes.modified.length} modified
                            </Badge>
                          </div>
                        ) : null}
                        {version.changes?.deleted.length ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="destructive" className="h-5">
                              <Minus className="h-3 w-3 mr-1" />
                              {version.changes.deleted.length} deleted
                            </Badge>
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{version.description || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No version history yet</p>
              <p className="text-sm text-muted-foreground">
                Changes to your environment variables will be tracked here
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

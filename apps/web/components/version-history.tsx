"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nvii/ui/components/dialog";
import { Button } from "@nvii/ui/components/button";
import { ScrollArea } from "@nvii/ui/components/scroll-area";
import { Badge } from "@nvii/ui/components/badge";
import { Card, CardContent, CardHeader } from "@nvii/ui/components/card";
import { History } from "lucide-react";
import { useProjects } from "./projects-provider";
import { toast } from "sonner";
import Link from "next/link";

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
}

interface VersionHistoryProps {
  projectId: string;
  userId: string;
}

export function VersionHistory({ userId, projectId }: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { getProjectVersions } = useProjects();

  useEffect(() => {
    const handleFetch = async () => {
      setIsLoading(true);
      try {
        const data = await getProjectVersions(projectId, userId);

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
  }, [getProjectVersions, userId, projectId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="mr-2 h-4 w-4" />
          Version History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {versions.length > 0 ? (
            <div className="space-y-4">
              {versions.map((version) => (
                <Card key={version.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {version.description || "No description provided"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {version.user.name ||
                            version.user.email ||
                            "Unknown user"}{" "}
                          committed{" "}
                          {formatDistanceToNow(new Date(version.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {version.changes && version.changes.added.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-500">
                            Added
                          </Badge>
                          <span className="text-sm">
                            {version.changes.added.length} environment
                            variable(s)
                          </span>
                        </div>
                      )}
                      {version.changes &&
                        version.changes.modified.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-blue-500">
                              Modified
                            </Badge>
                            <span className="text-sm">
                              {version.changes.modified.length} environment
                              variable(s)
                            </span>
                          </div>
                        )}
                      {version.changes &&
                        version.changes.deleted.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">Deleted</Badge>
                            <span className="text-sm">
                              {version.changes.deleted.length} environment
                              variable(s)
                            </span>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                No version history available.
              </p>
            </div>
          )}
        </ScrollArea>
        <Button asChild variant="outline" className="mt-4" size="sm">
          <Link href={`/projects/${projectId}/versions`}>
            View more details
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

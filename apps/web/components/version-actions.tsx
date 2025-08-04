"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  RotateCcw,
  Tag,
  GitBranch,
  Trash2,
  Download,
  Copy,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@nvii/ui/components/badge";
import { Button } from "@nvii/ui/components/button";
import { Label } from "@nvii/ui/components/label";
import { Input } from "@nvii/ui/components/input";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@nvii/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@nvii/ui/components/alert-dialog";

interface VersionInfo {
  id: string;
  description: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
  tags?: string[];
  isCurrent?: boolean;
}

interface VersionActionsProps {
  version: VersionInfo;
  projectId: string;
  onRollback?: (versionId: string) => Promise<void>;
  onTag?: (versionId: string, tagName: string) => Promise<void>;
  onBranch?: (
    versionId: string,
    branchName: string,
    description?: string,
  ) => Promise<void>;
  onDelete?: (versionId: string) => Promise<void>;
  onExport?: (versionId: string) => Promise<void>;
  disabled?: boolean;
}

export function VersionActions({
  version,
  projectId,
  onRollback,
  onTag,
  onBranch,
  onDelete,
  onExport,
  disabled = false,
}: VersionActionsProps) {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchDescription, setBranchDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRollback = async () => {
    if (!onRollback) return;

    setIsLoading(true);
    try {
      await onRollback(version.id);
      toast.success("Successfully rolled back to this version");
    } catch (error) {
      toast.error("Failed to rollback version");
      console.error("Rollback error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!onTag || !tagName.trim()) return;

    setIsLoading(true);
    try {
      await onTag(version.id, tagName.trim());
      toast.success(`Tag "${tagName}" created successfully`);
      setTagName("");
      setIsTagDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create tag");
      console.error("Tag creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!onBranch || !branchName.trim()) return;

    setIsLoading(true);
    try {
      await onBranch(
        version.id,
        branchName.trim(),
        branchDescription.trim() || undefined,
      );
      toast.success(`Branch "${branchName}" created successfully`);
      setBranchName("");
      setBranchDescription("");
      setIsBranchDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create branch");
      console.error("Branch creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsLoading(true);
    try {
      await onDelete(version.id);
      toast.success("Version deleted successfully");
    } catch (error) {
      toast.error("Failed to delete version");
      console.error("Delete error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!onExport) return;

    setIsLoading(true);
    try {
      await onExport(version.id);
      toast.success("Version exported successfully");
    } catch (error) {
      toast.error("Failed to export version");
      console.error("Export error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyVersionId = () => {
    navigator.clipboard.writeText(version.id);
    toast.success("Version ID copied to clipboard");
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Quick Actions */}
      {!version.isCurrent && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || isLoading}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Rollback
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rollback to this version?</AlertDialogTitle>
              <AlertDialogDescription>
                This will revert your project&apos;s environment variables to
                the state they were in at this version. This action cannot be
                undone, but a new version will be created with the rollback.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRollback} disabled={isLoading}>
                {isLoading ? "Rolling back..." : "Rollback"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {version.isCurrent && (
        <Badge variant="secondary" className="text-xs">
          <Clock className="mr-1 h-3 w-3" />
          Current
        </Badge>
      )}

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={disabled || isLoading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setIsTagDialogOpen(true)}>
            <Tag className="mr-2 h-4 w-4" />
            Create Tag
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsBranchDialogOpen(true)}>
            <GitBranch className="mr-2 h-4 w-4" />
            Create Branch
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Version
          </DropdownMenuItem>

          <DropdownMenuItem onClick={copyVersionId}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Version ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {!version.isCurrent && (
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Version
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tag Creation Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tag</DialogTitle>
            <DialogDescription>
              Create a tag for version {version.id.slice(0, 8)} to mark
              important milestones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="e.g., v1.0.0, production, stable"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTagDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={!tagName.trim() || isLoading}
            >
              {isLoading ? "Creating..." : "Create Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Branch Creation Dialog */}
      <Dialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Branch</DialogTitle>
            <DialogDescription>
              Create a new branch starting from version {version.id.slice(0, 8)}
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g., feature/new-api, hotfix/bug-123"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="branch-description">Description (Optional)</Label>
              <Textarea
                id="branch-description"
                value={branchDescription}
                onChange={(e) => setBranchDescription(e.target.value)}
                placeholder="Describe the purpose of this branch..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBranchDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBranch}
              disabled={!branchName.trim() || isLoading}
            >
              {isLoading ? "Creating..." : "Create Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

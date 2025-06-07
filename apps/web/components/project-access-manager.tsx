"use client";

import * as React from "react";
import { useProjects } from "./projects-provider";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Users, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

function UserAvatar({
  user,
}: {
  user: { name: string | null; email: string | null };
}) {
  const initials = React.useMemo(() => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.slice(0, 2).toUpperCase() || "??";
  }, [user.name, user.email]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-8 w-8 border-2 border-background">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{user.name || user.email}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ProjectAccessManager({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [users, setUsers] = React.useState<
    Array<{ id: string; email: string | null; name: string | null }>
  >([]);
  const { getProjectAccess, addProjectAccess, removeProjectAccess } =
    useProjects();

  const loadUsers = React.useCallback(async () => {
    try {
      const projectAccess = await getProjectAccess(projectId);
      setUsers(projectAccess.map((access) => access.user));
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users with access");
    }
  }, [projectId, getProjectAccess]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await addProjectAccess(projectId, email);
      toast.success("User invited successfully");
      setEmail("");
      loadUsers();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to invite user:", error);
      toast.error("Failed to invite user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeProjectAccess(projectId, userId);
      toast.success("User access removed");
      loadUsers();
    } catch (error) {
      console.error("Failed to remove user:", error);
      toast.error("Failed to remove user access");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {users.length} members
        </span>
      </div>

      <div className="flex items-center">
        <div className="flex -space-x-2">
          {users.slice(0, 4).map((user) => (
            <UserAvatar key={user.id} user={user} />
          ))}
          {users.length > 4 && (
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback>+{users.length - 4}</AvatarFallback>
            </Avatar>
          )}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 h-8 w-8 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Project Access</DialogTitle>
              <DialogDescription>
                Invite team members to collaborate on this project.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <form onSubmit={handleInvite} className="flex items-center gap-2">
                <Input
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !email}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </form>

              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2 px-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div>
                        <p className="font-medium">
                          {user.name || "Unnamed User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(user.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

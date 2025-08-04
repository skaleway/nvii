"use client";

import { Avatar, AvatarFallback } from "@nvii/ui/components/avatar";
import { Button } from "@nvii/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nvii/ui/components/dialog";
import { Input } from "@nvii/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@nvii/ui/components/tooltip";
import UserProfile from "@nvii/ui/components/user-profile";
import { Loader2, Plus, Users, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useProjects } from "./projects-provider";

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
          <UserProfile
            name={user.name ?? "user"}
            className="rounded-full cursor-pointer"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{user.name || user.email}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ProjectAccessManager({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
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
      const projectAccess = await getProjectAccess(projectId, userId);
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
      await addProjectAccess(projectId, email, userId);
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
          {users.length} {users.length === 1 ? "member" : "members"}
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
              className="ml-1 h-8 w-8 rounded-full border border-dashed"
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

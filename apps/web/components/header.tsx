"use client";

import { Search, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import Profile from "@workspace/ui/components/user-profile";
import { useSession } from "@/provider/session";

export function Header() {
  const { setTheme } = useTheme();
  const { user } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-background">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects..."
          className="w-full bg-background pl-8 shadow-none md:w-[300px] lg:w-[400px]"
        />
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        <Profile name={user.name} url={user?.image ?? ""} />
      </div>
    </header>
  );
}

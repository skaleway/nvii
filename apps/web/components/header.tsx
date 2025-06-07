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
import Link from "next/link";

export function Header() {
  const { setTheme } = useTheme();
  const { user } = useSession();

  return (
    <header className="flex h-16 items-center border-b bg-background">
      <div className="flex items-center gap-8 px-6 w-full max-w-7xl mx-auto container">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="font-bold text-xl">EnvSync</div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Projects
            </Link>
            <Link
              href="/sync"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sync
            </Link>
            <Link
              href="/settings"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex-1 flex items-center justify-end gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="w-[240px] bg-background pl-8 shadow-none focus-visible:ring-1"
            />
          </div>

          <Button variant="outline" size="sm" className="hidden md:flex">
            + New Project
          </Button>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
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
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-5 w-5" />
            </Button>
            <Profile name={user.name} url={user?.image ?? ""} />
          </div>
        </div>
      </div>
    </header>
  );
}

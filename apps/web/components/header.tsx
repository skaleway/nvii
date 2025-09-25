"use client";

import { Search, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@nvii/ui/components/button";
import { Input } from "@nvii/ui/components/input";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@nvii/ui/components/dropdown-menu";
import Profile from "@nvii/ui/components/user-profile";
import { useSession } from "@/provider/session";
import Link from "next/link";
import { cn } from "@nvii/ui/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { AddProjectDialog } from "./add-project-dialog";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const { setTheme } = useTheme();
  const { user } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const router = useRouter();
  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Sync", href: "/sync" },
    { label: "Settings", href: "/settings" },
  ];

  const themes = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  return (
    <header className="border-b bg-background sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 md:px-6 h-16 w-full max-w-7xl mx-auto container">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="font-bold text-xl">Nvii</div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "text-sm text-muted-foreground hover:text-foreground transition-colors",
                  pathname === item.href
                    ? "text-primary font-semibold hover:text-primary"
                    : ""
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative max-w-[200px] hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="w-full bg-background pl-8 shadow-none focus-visible:ring-1"
            />
          </div>
          <AddProjectDialog>
            <Button size="sm">New Project</Button>
          </AddProjectDialog>
          <div className="flex items-center gap-1 md:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {themes.map((theme) => (
                  <DropdownMenuItem
                    key={theme.value}
                    onClick={() => setTheme(theme.value)}
                  >
                    {theme.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Profile name={user.name} url={user?.image ?? ""} />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-0 left-0 w-3/4 max-w-xs h-full bg-background shadow-lg flex flex-col p-6 gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <Link
                href="/"
                className="font-bold text-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nvii
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            </div>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "text-base text-muted-foreground hover:text-foreground py-2 px-2 rounded transition-colors",
                    pathname === item.href ? "text-primary font-semibold" : ""
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4">
              <AddProjectDialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/96 text-white"
                >
                  + New Project
                </Button>
              </AddProjectDialog>
            </div>
            <div className="mt-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-5 w-5" />
              </Button>
              <Profile name={user.name} url={user?.image ?? ""} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

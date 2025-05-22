"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Settings, Layers, RefreshCw, ChevronLeft, PanelLeft, Plus } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { useSidebar } from "@/components/sidebar-provider"
import { AddProjectDialog } from "@/components/add-project-dialog"

export function Sidebar() {
  const pathname = usePathname()
  const { expanded, toggleSidebar } = useSidebar()

  const routes = [
    {
      label: "Dashboard",
      icon: BarChart,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Projects",
      icon: Layers,
      href: "/projects",
      active: pathname === "/projects" || pathname.startsWith("/projects/"),
    },
    {
      label: "Sync",
      icon: RefreshCw,
      href: "/sync",
      active: pathname === "/sync",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  return (
    <div
      className={cn(
        "group relative h-screen border-r bg-background transition-all duration-300",
        expanded ? "w-64" : "w-[70px]",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className={cn("flex items-center gap-x-2", expanded ? "justify-start" : "justify-center w-full")}>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <PanelLeft className="h-4 w-4 text-primary" />
          </div>
          {expanded && <span className="font-semibold text-xl">EnvSync</span>}
        </div>
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7",
            !expanded &&
              "absolute right-[-12px] top-5 bg-primary text-primary-foreground rounded-full border border-border shadow-md",
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-all", !expanded && "rotate-180")} />
        </Button>
      </div>
      <div className="flex flex-col gap-y-2 p-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-primary/10",
              route.active ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
          >
            <route.icon className={cn("h-5 w-5")} />
            {expanded && <span>{route.label}</span>}
          </Link>
        ))}
      </div>
      <div className="absolute bottom-5 w-full px-3">
        <AddProjectDialog>
          <Button className={cn("w-full justify-start gap-x-2", !expanded && "justify-center")}>
            <Plus className="h-4 w-4" />
            {expanded && <span>New Project</span>}
          </Button>
        </AddProjectDialog>
      </div>
    </div>
  )
}

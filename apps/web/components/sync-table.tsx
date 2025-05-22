"use client"

import { ArrowDownToLine, ArrowUpFromLine, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"

interface SyncTableProps {
  filter: "all" | "changes" | "conflicts"
}

type Project = {
  id: string
  name: string
  localChanges: number
  remoteChanges: number
  conflicts: number
  lastSynced: string
}

export function SyncTable({ filter }: SyncTableProps) {
  // Mock data
  const projects: Project[] = [
    {
      id: "1",
      name: "Web App",
      localChanges: 2,
      remoteChanges: 0,
      conflicts: 0,
      lastSynced: "2 hours ago",
    },
    {
      id: "2",
      name: "API Service",
      localChanges: 0,
      remoteChanges: 2,
      conflicts: 0,
      lastSynced: "1 day ago",
    },
    {
      id: "3",
      name: "Admin Dashboard",
      localChanges: 1,
      remoteChanges: 1,
      conflicts: 1,
      lastSynced: "3 days ago",
    },
    {
      id: "4",
      name: "Marketing Site",
      localChanges: 0,
      remoteChanges: 0,
      conflicts: 0,
      lastSynced: "5 days ago",
    },
    {
      id: "5",
      name: "Authentication Service",
      localChanges: 0,
      remoteChanges: 0,
      conflicts: 0,
      lastSynced: "1 week ago",
    },
  ]

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true
    if (filter === "changes") return project.localChanges > 0 || project.remoteChanges > 0
    if (filter === "conflicts") return project.conflicts > 0
    return true
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox />
            </TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Local Changes</TableHead>
            <TableHead>Remote Changes</TableHead>
            <TableHead>Conflicts</TableHead>
            <TableHead>Last Synced</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>
                {project.localChanges > 0 ? (
                  <Badge variant="outline" className="bg-primary/10">
                    {project.localChanges}
                  </Badge>
                ) : (
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </TableCell>
              <TableCell>
                {project.remoteChanges > 0 ? (
                  <Badge variant="outline" className="bg-primary/10">
                    {project.remoteChanges}
                  </Badge>
                ) : (
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </TableCell>
              <TableCell>
                {project.conflicts > 0 ? (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive">
                    {project.conflicts}
                  </Badge>
                ) : (
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </TableCell>
              <TableCell>{project.lastSynced}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowDownToLine className="h-4 w-4" />
                    <span className="sr-only">Pull</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowUpFromLine className="h-4 w-4" />
                    <span className="sr-only">Push</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Sync</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

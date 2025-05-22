"use client"

import { useState } from "react"
import { CheckCircle, Copy, Eye, EyeOff, MoreHorizontal, Pencil, XCircle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Switch } from "@workspace/ui/components/switch"
import { cn } from "@workspace/ui/lib/utils"

interface EnvVariableTableProps {
  environment: "development" | "staging" | "production"
}

type EnvVariable = {
  id: string
  key: string
  value: string
  isPublic: boolean
  status: "valid" | "invalid" | "missing"
  isEditing: boolean
  isVisible: boolean
  requiredBy: string[]
}

export function EnvVariableTable({ environment }: EnvVariableTableProps) {
  // Mock data
  const [variables, setVariables] = useState<EnvVariable[]>([
    {
      id: "1",
      key: "DATABASE_URL",
      value: "postgresql://user:password@localhost:5432/mydb",
      isPublic: false,
      status: "valid",
      isEditing: false,
      isVisible: false,
      requiredBy: ["Prisma"],
    },
    {
      id: "2",
      key: "NEXT_PUBLIC_API_URL",
      value: "https://api.example.com",
      isPublic: true,
      status: "valid",
      isEditing: false,
      isVisible: false,
      requiredBy: [],
    },
    {
      id: "3",
      key: "CLERK_SECRET_KEY",
      value: "",
      isPublic: false,
      status: "missing",
      isEditing: false,
      isVisible: false,
      requiredBy: ["Clerk"],
    },
    {
      id: "4",
      key: "STRIPE_API_KEY",
      value: "sk_test_invalid_key",
      isPublic: false,
      status: "invalid",
      isEditing: false,
      isVisible: false,
      requiredBy: [],
    },
    {
      id: "5",
      key: "NEXT_PUBLIC_SITE_URL",
      value: "https://example.com",
      isPublic: true,
      status: "valid",
      isEditing: false,
      isVisible: false,
      requiredBy: [],
    },
  ])

  const toggleVisibility = (id: string) => {
    setVariables(
      variables.map((variable) => (variable.id === id ? { ...variable, isVisible: !variable.isVisible } : variable)),
    )
  }

  const toggleEditing = (id: string) => {
    setVariables(
      variables.map((variable) => (variable.id === id ? { ...variable, isEditing: !variable.isEditing } : variable)),
    )
  }

  const updateValue = (id: string, value: string) => {
    setVariables(variables.map((variable) => (variable.id === id ? { ...variable, value } : variable)))
  }

  const togglePublic = (id: string) => {
    setVariables(
      variables.map((variable) => (variable.id === id ? { ...variable, isPublic: !variable.isPublic } : variable)),
    )
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Key</TableHead>
            <TableHead className="w-[40%]">Value</TableHead>
            <TableHead className="w-[10%]">Public</TableHead>
            <TableHead className="w-[10%]">Status</TableHead>
            <TableHead className="w-[10%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variables.map((variable) => (
            <TableRow
              key={variable.id}
              className={cn(
                variable.status === "missing" && "bg-amber-500/5",
                variable.status === "invalid" && "bg-rose-500/5",
              )}
            >
              <TableCell className="font-mono text-sm">
                {variable.key}
                {variable.requiredBy.length > 0 && (
                  <div className="mt-1 flex gap-1">
                    {variable.requiredBy.map((req) => (
                      <Badge key={req} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {variable.isEditing ? (
                  <Input
                    type={variable.isVisible ? "text" : "password"}
                    value={variable.value}
                    onChange={(e) => updateValue(variable.id, e.target.value)}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="font-mono text-sm">
                    {variable.value ? (
                      variable.isVisible ? (
                        variable.value
                      ) : (
                        "••••••••••••••••••••••"
                      )
                    ) : (
                      <span className="text-muted-foreground italic">Not set</span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Switch
                  checked={variable.isPublic}
                  onCheckedChange={() => togglePublic(variable.id)}
                  className="data-[state=checked]:bg-primary"
                />
              </TableCell>
              <TableCell>
                {variable.status === "valid" && (
                  <div className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Valid</span>
                  </div>
                )}
                {variable.status === "missing" && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs">Missing</span>
                  </div>
                )}
                {variable.status === "invalid" && (
                  <div className="flex items-center gap-1 text-rose-500">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs">Invalid</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVisibility(variable.id)}>
                    {variable.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{variable.isVisible ? "Hide" : "Show"}</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleEditing(variable.id)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View History</DropdownMenuItem>
                      <DropdownMenuItem>Sync Variable</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Variable</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

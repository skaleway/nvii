"use client";

import { useToast } from "@/hooks/use-toast";
import { Variable } from "@/types/project";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import {
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  XCircle,
  Check,
} from "lucide-react";
import { useState } from "react";

interface EnvVariableTableProps {
  environment: Record<string, string>;
}

export function EnvVariableTable({ environment }: EnvVariableTableProps) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [variables, setVariables] = useState<Variable[]>(() =>
    Object.entries(environment).map(([key, value], index) => ({
      id: `${index}-${key}`,
      key,
      value,
      isPublic: false,
      isVisible: false,
      isEditing: false,
      status: value ? "valid" : "missing",
      requiredBy: [],
    }))
  );

  const toggleVisibility = (id: string) => {
    setVariables((prevVars) =>
      prevVars.map((variable) =>
        variable.id === id
          ? { ...variable, isVisible: !variable.isVisible }
          : variable
      )
    );
  };

  const toggleEditing = (id: string) => {
    setVariables((prevVars) =>
      prevVars.map((variable) =>
        variable.id === id
          ? { ...variable, isEditing: !variable.isEditing }
          : variable
      )
    );
  };

  const updateValue = (id: string, value: string) => {
    setVariables((prevVars) =>
      prevVars.map((variable) =>
        variable.id === id
          ? {
              ...variable,
              value,
              status: value ? "valid" : "missing",
            }
          : variable
      )
    );
  };

  const togglePublic = (id: string) => {
    setVariables((prevVars) =>
      prevVars.map((variable) =>
        variable.id === id
          ? { ...variable, isPublic: !variable.isPublic }
          : variable
      )
    );
  };

  const copyToClipboard = async (variable: Variable) => {
    try {
      await navigator.clipboard.writeText(variable.value);
      setCopiedId(variable.id);
      toast({
        title: "Copied!",
        description: `${variable.key} has been copied to clipboard.`,
      });
      setTimeout(() => {
        setCopiedId(null);
      }, 1000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Key</TableHead>
            <TableHead className="w-[40%]">Value</TableHead>
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
                variable.status === "invalid" && "bg-rose-500/5"
              )}
            >
              <TableCell className="font-mono text-sm">
                {variable.key}
                {variable.requiredBy.length > 0 && (
                  <div className="mt-1 flex gap-1">
                    {variable.requiredBy.map((req: string) => (
                      <Badge key={req} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-[200px]">
                {variable.isEditing ? (
                  <Input
                    type={variable.isVisible ? "text" : "password"}
                    value={variable.value}
                    onChange={(e) => updateValue(variable.id, e.target.value)}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="font-mono text-sm truncate">
                    {variable.value ? (
                      variable.isVisible ? (
                        variable.value
                      ) : (
                        "••••••••••••••••••••••"
                      )
                    ) : (
                      <span className="text-muted-foreground italic">
                        Not set
                      </span>
                    )}
                  </div>
                )}
              </TableCell>

              <TableCell>
                {(() => {
                  const statusConfig = {
                    valid: {
                      icon: <CheckCircle className="h-4 w-4" />,
                      text: "Valid",
                      color: "text-emerald-500",
                    },
                    missing: {
                      icon: <XCircle className="h-4 w-4" />,
                      text: "Missing",
                      color: "text-amber-500",
                    },
                    invalid: {
                      icon: <XCircle className="h-4 w-4" />,
                      text: "Invalid",
                      color: "text-rose-500",
                    },
                  };

                  const config = statusConfig[variable.status];
                  return (
                    <div className={`flex items-center gap-1 ${config.color}`}>
                      {config.icon}
                      <span className="text-xs">{config.text}</span>
                    </div>
                  );
                })()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleVisibility(variable.id)}
                  >
                    {variable.isVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {variable.isVisible ? "Hide" : "Show"}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleEditing(variable.id)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition-colors",
                      copiedId === variable.id && "text-green-500"
                    )}
                    onClick={() => copyToClipboard(variable)}
                    disabled={!variable.value}
                  >
                    {copiedId === variable.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
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
                      <DropdownMenuItem className="text-destructive">
                        Delete Variable
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

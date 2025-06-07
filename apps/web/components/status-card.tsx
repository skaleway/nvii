import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

interface StatusCardProps {
  title: string;
  value: string;
  description: string;
  status: "valid" | "missing" | "invalid";
}

export function StatusCard({
  title,
  value,
  description,
  status,
}: StatusCardProps) {
  return (
    <Card
      className={cn(
        "transition-all",
        status === "valid" && "border-emerald-500/20",
        status === "missing" && "border-amber-500/20",
        status === "invalid" && "border-rose-500/20",
        "shadow-none"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {
          {
            valid: <CheckCircle className="h-4 w-4 text-emerald-500" />,
            missing: <AlertTriangle className="h-4 w-4 text-amber-500" />,
            invalid: <XCircle className="h-4 w-4 text-rose-500" />,
          }[status]
        }
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nvii/ui/components/card";
import { BadgeAlert, BadgeCheck, BadgeX } from "lucide-react";

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {
          {
            valid: <BadgeCheck className="h-4 w-4 text-emerald-500" />,
            missing: <BadgeAlert className="h-4 w-4 text-amber-500" />,
            invalid: <BadgeX className="h-4 w-4 text-rose-500" />,
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

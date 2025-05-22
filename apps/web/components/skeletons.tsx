import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { Skeleton } from "./ui/skeleton";

export function StatusCardSkeleton() {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-12 mb-1" />
        <Skeleton className="h-4 w-48" />
      </CardContent>
    </Card>
  );
}

export function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-3">
        <Skeleton className="h-4 w-32" />
      </CardFooter>
    </Card>
  );
}

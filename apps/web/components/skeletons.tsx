import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@nvii/ui/components/card";
import { Skeleton } from "@nvii/ui/components/skeleton";

export function StatusCardSkeleton() {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24 bg-primary/10" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-12 mb-1 bg-primary/10" />
        <Skeleton className="h-4 w-48 bg-primary/10" />
      </CardContent>
    </Card>
  );
}

export function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32 mb-2 bg-primary/10" />
          <Skeleton className="h-4 w-48 bg-primary/10" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md bg-primary/10" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24 bg-primary/10" />
          <Skeleton className="h-4 w-20 bg-primary/10" />
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-3">
        <Skeleton className="h-4 w-32 bg-primary/10" />
      </CardFooter>
    </Card>
  );
}

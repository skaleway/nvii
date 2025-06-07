import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { SyncTable } from "@/components/sync-table";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw } from "lucide-react";

export default function SyncPage() {
  return (
    <div className="max-w-7xl mx-auto container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Sync</h1>
          <p className="text-muted-foreground">
            Synchronize environment variables with remote storage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <ArrowDownToLine className="h-4 w-4" />
            Pull All
          </Button>
          <Button variant="outline" className="gap-2">
            <ArrowUpFromLine className="h-4 w-4" />
            Push All
          </Button>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Selected
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 hours ago</div>
            <CardDescription>May 21, 2025 at 9:45 AM</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Remote Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Supabase</div>
            <CardDescription>Connected to project: env-manager</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 changes</div>
            <CardDescription>2 local, 2 remote changes</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="changes">With Changes</TabsTrigger>
          <TabsTrigger value="conflicts">With Conflicts</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <SyncTable filter="all" />
        </TabsContent>
        <TabsContent value="changes" className="mt-4">
          <SyncTable filter="changes" />
        </TabsContent>
        <TabsContent value="conflicts" className="mt-4">
          <SyncTable filter="conflicts" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

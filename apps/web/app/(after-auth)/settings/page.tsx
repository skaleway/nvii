import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";

export default function SettingsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tokens">API Tokens</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input id="app-name" defaultValue="EnvSync" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-env">Default Environment</Label>
                <Select defaultValue="development">
                  <SelectTrigger id="default-env">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync">Auto Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync environment variables
                  </p>
                </div>
                <Switch id="auto-sync" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monorepo Configuration</CardTitle>
              <CardDescription>
                Configure settings for your monorepo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repo-path">Repository Path</Label>
                <Input id="repo-path" defaultValue="/path/to/monorepo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turbo-config">Turborepo Config Path</Label>
                <Input id="turbo-config" defaultValue="turbo.json" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-detect">Auto Detect Projects</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect projects in monorepo
                  </p>
                </div>
                <Switch id="auto-detect" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Tokens</CardTitle>
              <CardDescription>
                Manage API tokens for accessing the EnvSync API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token-name">Token Name</Label>
                <Input id="token-name" placeholder="Enter token name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token-expiry">Expiration</Label>
                <Select defaultValue="never">
                  <SelectTrigger id="token-expiry">
                    <SelectValue placeholder="Select expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 Days</SelectItem>
                    <SelectItem value="30days">30 Days</SelectItem>
                    <SelectItem value="90days">90 Days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Generate Token</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Remote Storage</CardTitle>
              <CardDescription>
                Configure remote storage for environment variables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storage-provider">Storage Provider</Label>
                <Select defaultValue="supabase">
                  <SelectTrigger id="storage-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supabase">Supabase</SelectItem>
                    <SelectItem value="firestore">Firestore</SelectItem>
                    <SelectItem value="s3">AWS S3</SelectItem>
                    <SelectItem value="local">Local File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="connection-string">Connection String</Label>
                <Input
                  id="connection-string"
                  type="password"
                  defaultValue="••••••••••••••••••••••"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Connection</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Integrations</CardTitle>
              <CardDescription>Connect to external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Prisma</Label>
                  <p className="text-sm text-muted-foreground">
                    Validate Prisma environment variables
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Clerk</Label>
                  <p className="text-sm text-muted-foreground">
                    Validate Clerk environment variables
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vercel</Label>
                  <p className="text-sm text-muted-foreground">
                    Sync with Vercel environment variables
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Integrations</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>
                Manage team members and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input id="team-name" defaultValue="My Team" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email">Invite Member</Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-email"
                    placeholder="Email address"
                    className="flex-1"
                  />
                  <Button>Invite</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Team Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

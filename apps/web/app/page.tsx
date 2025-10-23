import { Button } from "@nvii/ui/components/button";
import { Lock, GitBranch, Users, Zap, Shield, Code } from "lucide-react";
import { siteConfig } from "@/lib/site";
import Link from "next/link";
import { Icons } from "@nvii/ui/components/icons";

export default function Home() {
  return (
    <div className="min-h-screen text-foreground">
      <main className="max-w-5xl  mx-auto bg-background min-h-screen relative w-full z-[999]">
        <nav className="sticky top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
                <span className="text-background  text-sm">N</span>
              </div>
              <span className=" text-lg">Nvii</span>
              <div className="hidden md:flex items-center gap-8 ml-10">
                <a
                  href="#features"
                  className="text-sm hover:text-muted-foreground transition"
                >
                  Features
                </a>
                <a
                  href={siteConfig.links.documentation}
                  target="_blank"
                  className="text-sm hover:text-muted-foreground transition"
                >
                  Docs
                </a>
              </div>
            </div>
            <Button asChild>
              <Link href="/auth">Get Started</Link>
            </Button>
          </div>
        </nav>

        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-muted/50 font-mono border select-none rounded-full text-sm font-medium">
              npm i -g nvii
            </div>
            <h1 className="text-5xl md:text-7xl  mb-6 leading-tight font-cooper text-balance">
              Manage secrets with confidence
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
              End-to-end encrypted environment variables with version control,
              team collaboration, and seamless deployment integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-foreground text-background hover:bg-foreground/90">
                Get Started
              </Button>
              <Button variant="outline" asChild>
                <Link href={siteConfig.links.documentation} target="_blank">
                  Visit documentation
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Line />
        <section id="features" className="pt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl  mb-4">
                Powerful features for teams
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage environment variables securely and
                efficiently
              </p>
            </div>
            <div className="border-t divide-y border-b">
              <div className="grid md:grid-cols-2 divide-x">
                {[
                  {
                    icon: Lock,
                    title: "End-to-End Encryption",
                    description:
                      "Military-grade encryption ensures your secrets are protected at rest and in transit",
                  },
                  {
                    icon: GitBranch,
                    title: "Version Control",
                    description:
                      "Complete history tracking with rollback capabilities and branch management",
                  },
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="p-6 min-h-60 flex flex-col">
                      <Icon className="w-8 h-8 mb-4" />
                      <h3 className="text-lg  mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm mt-auto">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-x">
                {[
                  {
                    icon: Users,
                    title: "Team Collaboration",
                    description:
                      "Seamless team access control with conflict resolution and synchronized updates",
                  },
                  {
                    icon: Zap,
                    title: "Lightning Fast",
                    description:
                      "Optimized CLI commands with dry-run capabilities for safe deployments",
                  },
                  {
                    icon: Shield,
                    title: "Device Authentication",
                    description:
                      "Secure session management with device-based authentication for each team member",
                  },
                  {
                    icon: Code,
                    title: "Developer Experience",
                    description:
                      "Intuitive CLI with automated conflict detection and seamless integration",
                  },
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="p-6 flex flex-col min-h-60">
                      <Icon className="w-8 h-8 mb-4" />
                      <h3 className="text-lg  mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm mt-auto">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        {/* Security Section */}
        <section id="security" className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl  mb-6">Security at the core</h2>
                <div className="space-y-4">
                  {[
                    "End-to-end encryption for all variables",
                    "Secure device-based authentication",
                    "Local credential storage in home directory",
                    "Team-based access control",
                    "Complete audit trail of all changes",
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted/50 border border-border rounded-lg p-8 font-mono text-sm">
                <div className="text-muted-foreground mb-4">
                  $ nvii push --message &quot;Update API keys&quot;
                </div>
                <div className="space-y-2 text-xs">
                  <div className="text-green-600">
                    ✓ Encrypting variables...
                  </div>
                  <div className="text-green-600">✓ Uploading to remote...</div>
                  <div className="text-green-600">
                    ✓ Version created: v1.2.3
                  </div>
                  <div className="mt-4 text-muted-foreground">
                    Added: 2 | Modified: 1 | Removed: 0
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Line />

        <section className="pt-20 border-t">
          <div className="text-center mb-16">
            <h2 className="text-4xl  mb-4">Powerful workflow for teams</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From initial setup to production deployments, Nvii streamlines
              your entire environment management process
            </p>
          </div>

          <div className="grid md:grid-cols-3 divide-x border-y">
            {[
              {
                step: "1",
                title: "Authenticate",
                desc: "Secure device-based login",
                cmd: "nvii login",
              },
              {
                step: "2",
                title: "Initialize Project",
                desc: "Create or link your project",
                cmd: "nvii new",
              },
              {
                step: "3",
                title: "Push Variables",
                desc: "Upload encrypted environment variables",
                cmd: "nvii push --message 'Initial setup'",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6">
                <div className="bg-foreground text-background w-10 h-10 rounded-full flex items-center justify-center  mb-4">
                  {item.step}
                </div>
                <h4 className=" mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.desc}
                </p>
                <div className="bg-muted/50 border border-border p-3 font-mono text-xs text-muted-foreground">
                  $ {item.cmd}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl  mb-6">
              We&apos;re open source.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join developers who trust Nvii for secure environment management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-foreground text-background hover:bg-foreground/90">
                <Link href="/auth">Get Started for free</Link>
              </Button>
              <Button
                variant="outline"
                className="border-foreground text-foreground hover:bg-muted bg-transparent"
                asChild
              >
                <Link href={siteConfig.links.github} target="_blank">
                  <Icons.github className="size-4" /> View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
                    <span className="text-background  text-xs">N</span>
                  </div>
                  <span className="">Nvii</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Secure environment management for modern teams
                </p>
              </div>
              <div>
                <h4 className=" mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Features
                    </a>
                  </li>

                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Security
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className=" mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a
                      href={siteConfig.links.documentation}
                      target="_blank"
                      className="hover:text-foreground transition"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Support
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className=" mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
              <p>&copy; 2025 Skeleway. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  className="hover:text-foreground transition"
                >
                  Twitter
                </a>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  className="hover:text-foreground transition"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
      <div className="fixed top-0 w-screen h-screen bg-muted/10 z-50">
        <div className="max-w-[65rem] border-x mx-auto h-screen w-full top-0 z-50 px-1 bg-[repeating-linear-gradient(-45deg,hsl(var(--border)),hsl(var(--border))_1px,transparent_1px,transparent_6px)]">
          <div className="size-full border-x bg-background" />
        </div>
      </div>
    </div>
  );
}

const Line = () => {
  return <div className="h-px max-w-5xl w-full bg-border" />;
};

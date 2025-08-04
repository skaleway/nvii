"use client";

import Link from "next/link";
import {
  Shield,
  Zap,
  Users,
  GitBranch,
  Terminal,
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Github,
  Play,
  Lock,
  Layers,
  Activity,
  Code,
  Database,
  Cloud,
} from "lucide-react";
import { Button } from "@nvii/ui/components/button";
import { Card, CardContent } from "@nvii/ui/components/card";
import { Badge } from "@nvii/ui/components/badge";

export default function LandingPage() {
  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Military-Grade Security",
      description:
        "AES-256 encryption ensures your environment variables are always protected.",
    },
    {
      icon: <GitBranch className="h-6 w-6" />,
      title: "Version Control",
      description:
        "Track every change with Git-like version control for your environment variables.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description:
        "Share projects securely with role-based access control and real-time sync.",
    },
    {
      icon: <Terminal className="h-6 w-6" />,
      title: "CLI & Web Interface",
      description:
        "Work from anywhere with our powerful CLI tool and intuitive web dashboard.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description:
        "Deploy and sync your environment variables in seconds, not minutes.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multi-Environment",
      description:
        "Manage development, staging, and production environments effortlessly.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Lead Developer at TechCorp",
      content:
        "Nvii transformed how we manage environment variables. No more Slack messages asking for API keys!",
      avatar: "SC",
    },
    {
      name: "Marcus Rodriguez",
      role: "DevOps Engineer",
      content:
        "The version control feature saved us from a major production incident. Absolutely essential tool.",
      avatar: "MR",
    },
    {
      name: "Emily Johnson",
      role: "Startup Founder",
      content:
        "Simple, secure, and powerful. Nvii is exactly what every development team needs.",
      avatar: "EJ",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Developers" },
    { number: "50,000+", label: "Projects" },
    { number: "99.9%", label: "Uptime" },
    { number: "256-bit", label: "Encryption" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nvii
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#docs"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Docs
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-6xl">
          <Badge variant="secondary" className="mb-6">
            <Star className="h-3 w-3 mr-1" />
            Trusted by 10,000+ developers
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
            Secure Environment
            <br />
            Variable Management
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop sharing environment variables through Slack or email. Nvii
            provides military-grade security, version control, and seamless team
            collaboration for all your environment variables.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                <Play className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to manage environment variables
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From local development to production deployment, Nvii has you
              covered with enterprise-grade features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CLI Demo Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Powerful CLI for Developers
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Integrate Nvii seamlessly into your development workflow with
                our intuitive command-line interface.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>One-command project setup</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Automatic environment sync</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Version control integration</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 ml-2">Terminal</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-green-400">$</span> npm install -g
                  @nvii/cli
                </div>
                <div>
                  <span className="text-green-400">$</span> nvii login
                </div>
                <div>
                  <span className="text-green-400">$</span> nvii new my-project
                </div>
                <div>
                  <span className="text-green-400">$</span> nvii push
                </div>
                <div className="text-gray-400">
                  ✓ Environment variables synced successfully
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Loved by developers worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about Nvii
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6 italic">
                    &quot;{testimonial.content}&quot;
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to secure your environment variables?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers who trust Nvii with their most
            sensitive configuration data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600"
              >
                Contact Sales
              </Button>
            </Link>
          </div>

          <p className="text-sm opacity-75 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold">Nvii</span>
              </div>
              <p className="text-gray-400">
                Secure environment variable management for modern development
                teams.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#docs"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#api"
                    className="hover:text-white transition-colors"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#security"
                    className="hover:text-white transition-colors"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="#status"
                    className="hover:text-white transition-colors"
                  >
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Nvii. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

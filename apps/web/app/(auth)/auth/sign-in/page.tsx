"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nvii/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nvii/ui/components/form";
import { Input } from "@nvii/ui/components/input";
import { signInSchema } from "@/lib/verification";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { ErrorContext } from "@better-fetch/fetch";
import { GithubIcon, Loader2 } from "lucide-react";
import { Button } from "@nvii/ui/components/button";
import { cn } from "@nvii/ui/lib/utils";

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingCredentials, setPendingCredentials] = useState(false);
  const [pendingGithub, setPendingGithub] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleCredentialsSignIn = async (
    values: z.infer<typeof signInSchema>,
  ) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onRequest: () => setPendingCredentials(true),
        onSuccess: async () => {
          router.push("/");
          router.refresh();
        },
        onError: (ctx: ErrorContext) => {
          toast({
            title: "Login failed",
            description: ctx.error.message ?? "Unknown error.",
            variant: "destructive",
          });
        },
      },
    );
    setPendingCredentials(false);
  };

  const handleSignInWithGithub = async () => {
    await authClient.signIn.social(
      { provider: "github" },
      {
        onRequest: () => setPendingGithub(true),
        onSuccess: async () => {
          router.push("/");
          router.refresh();
        },
        onError: (ctx: ErrorContext) => {
          toast({
            title: "GitHub sign-in failed",
            description: ctx.error.message ?? "Unknown error.",
            variant: "destructive",
          });
        },
      },
    );
    setPendingGithub(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl border border-transbg-transparent bg-background text-white">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-center">
            Sign In
          </CardTitle>
          <p className="text-sm text-center text-gray-400">
            Welcome back! Login to your account
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCredentialsSignIn)}
              className="space-y-6"
            >
              {["email", "password"].map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field as keyof z.infer<typeof signInSchema>}
                  render={({ field: fieldProps }) => (
                    <FormItem>
                      <div
                        className={cn(
                          field === "password"
                            ? "flex items-center justify-between w-full"
                            : "",
                        )}
                      >
                        <FormLabel className="capitalize text-gray-300">
                          {field === "email" ? "Email Address" : "Password"}
                        </FormLabel>
                        {field === "password" && (
                          <div className="text-left -mt-2 text-sm">
                            <Link
                              href="/auth/forgot-password"
                              className="text-primary hover:underline"
                            >
                              Forgot password?
                            </Link>
                          </div>
                        )}
                      </div>
                      <FormControl>
                        <Input
                          className="bg-transparent border border-gray-700 text-white placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                          type={field === "password" ? "password" : "email"}
                          placeholder={`Enter your ${field}`}
                          autoComplete={
                            field === "password" ? "current-password" : "email"
                          }
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                disabled={pendingCredentials}
                className="w-full flex items-center justify-center gap-2"
              >
                {pendingCredentials && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Sign In
              </Button>
            </form>
          </Form>
          <div className="mt-6">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 bg-transparent border border-transbg-transparent p-4"
              onClick={handleSignInWithGithub}
              disabled={pendingGithub}
            >
              {pendingGithub && <Loader2 className="w-4 h-4 animate-spin" />}
              <GithubIcon className="w-4 h-4" /> Continue with GitHub
            </Button>
          </div>
          <div className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

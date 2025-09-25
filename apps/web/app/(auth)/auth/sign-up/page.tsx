"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nvii/ui/components/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nvii/ui/components/card";
import { Input } from "@nvii/ui/components/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/verification";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nvii/ui/components/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignUp() {
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      {
        onRequest: () => setPending(true),
        onSuccess: () => {
          toast.success("Account created", {
            description: "Check your email for a verification link.",
          });
        },
        onError: (ctx: any) => {
          toast.error(ctx.error.message ?? "Unknown error.", {
            description: "Something went wrong",
          });
        },
      }
    );
    setPending(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl border bg-background">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-center">
            Create Account
          </CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            Join us and get started instantly
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {["name", "email", "password", "confirmPassword"].map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field as keyof z.infer<typeof signUpSchema>}
                  render={({ field: fieldProps }) => (
                    <FormItem>
                      <FormLabel className="capitalize text-muted-foreground">
                        {field.replace("Password", " password")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-transparent border placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                          type={
                            field.toLowerCase().includes("password")
                              ? "password"
                              : field === "email"
                                ? "email"
                                : "text"
                          }
                          placeholder={`Enter your ${field}`}
                          autoComplete="off"
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                disabled={pending}
                className="w-full flex items-center justify-center gap-2"
              >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />} Sign
                Up
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

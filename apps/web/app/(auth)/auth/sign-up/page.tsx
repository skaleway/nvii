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
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/verification";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nvii/ui/components/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

export default function SignUp() {
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

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
          toast({
            title: "Account created",
            description: "Check your email for a verification link.",
          });
        },
        onError: (ctx: any) => {
          toast({
            title: "Something went wrong",
            description: ctx.error.message ?? "Unknown error.",
          });
        },
      },
    );
    setPending(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl border border-tranbg-transparent bg-background text-white">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-center">
            Create Account
          </CardTitle>
          <p className="text-sm text-center text-gray-400">
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
                      <FormLabel className="capitalize text-gray-300">
                        {field.replace("Password", " password")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-transparent border border-gray-700 text-white placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                          type={
                            field.includes("password")
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
          <div className="mt-6 text-center text-sm text-gray-400">
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

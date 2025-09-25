"use client";

import { Button } from "@nvii/ui/components/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorContext } from "@better-fetch/fetch";
import { Icons } from "@nvii/ui/components/icons";

export const AuthButton = () => {
  const [pendingGithub, setPendingGithub] = useState(false);
  const router = useRouter();

  const handleSignInWithGithub = async () => {
    await authClient.signIn.social(
      {
        provider: "github",
        callbackURL: process.env.CALLBACK_URL as string,
      },
      {
        onRequest: () => setPendingGithub(true),
        onSuccess: async () => {
          router.push("/");
          router.refresh();
        },
        onError: (ctx: ErrorContext) => {
          toast.error(ctx.error.message ?? "Unknown error.", {
            description: "GitHub sign-in failed",
          });
        },
      }
    );
    setPendingGithub(false);
  };

  return (
    <Button onClick={handleSignInWithGithub} disabled={pendingGithub}>
      <Icons.github />{" "}
      {pendingGithub ? "Signing in with GitHub..." : "Sign in with GitHub"}
    </Button>
  );
};

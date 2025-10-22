"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@nvii/ui/components/button";
import { Icons } from "@nvii/ui/components/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
        onError: (ctx: any) => {
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

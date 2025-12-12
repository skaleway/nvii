"use client";

import { authClient } from "@/lib/auth-client";
import LoadingButton from "@nvii/ui/components/loading-button";
import { Icons } from "@nvii/ui/components/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const AuthButton = () => {
  const [pendingGithub, setPendingGithub] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get("redirect");
    if (redirectUrl) {
      setRedirectUrl(decodeURIComponent(redirectUrl));
      router.replace("/auth");
    }
  }, [router]);

  const handleSignInWithGithub = async () => {
    await authClient.signIn.social(
      {
        provider: "github",
        callbackURL: redirectUrl || window.location.origin + "/app",
      },
      {
        onRequest: () => setPendingGithub(true),
        onSuccess: async () => {
          toast.success("Signed in successfully");
          window.location.reload();
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
    <LoadingButton
      onClick={handleSignInWithGithub}
      disabled={pendingGithub}
      className="!px-10"
      loading={pendingGithub}
    >
      <Icons.github />{" "}
      {pendingGithub ? "Signing in with GitHub..." : "Sign in with GitHub"}
    </LoadingButton>
  );
};

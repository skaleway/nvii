"use client";

import { authClient } from "@/lib/auth-client";
import { buildCallbackURL } from "@/lib/redirect";
import LoadingButton from "@nvii/ui/components/loading-button";
import { Icons } from "@nvii/ui/components/icons";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryStates } from "nuqs";
import { searchParamsSchema } from "@/nuqs_config";

export const AuthButton = () => {
  const [pendingGithub, setPendingGithub] = useState(false);
  const [params] = useQueryStates(searchParamsSchema);

  const handleSignInWithGithub = async () => {
    await authClient.signIn.social(
      {
        provider: "github",
        callbackURL: buildCallbackURL(params.redirect, window.location.origin),
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
      },
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
      <Icons.github /> Sign in with GitHub
    </LoadingButton>
  );
};

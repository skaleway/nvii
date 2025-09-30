"use client";

import { notFound, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Fingerprint, PartyPopper, XCircle } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/provider/session";
import { Button } from "@nvii/ui/components/button";

function CodeCharacter({ char }: { char: string }) {
  return (
    <div className="size-10 lg:size-12 font-mono font-bold text-xl lg:text-4xl text-secondary-foreground flex items-center justify-center bg-secondary">
      {char}
    </div>
  );
}

function Cancelled() {
  return (
    <div className="w-full min-h-screen flex items-center pt-[250px] px-4 flex-col">
      <div className="flex pt-10">
        <div className="flex justify-center items-center pr-10">
          <XCircle className="text-gray-100" />
        </div>
        <div className="flex-col">
          <h1 className="text-lg text-gray-100">Login cancelled</h1>
          <p className="text-sm text-gray-500">You can return to your CLI.</p>
        </div>
      </div>
    </div>
  );
}

function Success() {
  return (
    <div className="w-full min-h-screen flex items-center pt-[250px] px-4 flex-col">
      <div className="flex pt-10">
        <div className="flex justify-center items-center pr-10">
          <PartyPopper className="text-primary" />
        </div>
        <div className="flex-col">
          <h1 className="text-lg text-primary">Login successful!</h1>
          <p className="text-sm text-muted-foreground">
            You can return to your CLI.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const _redirect = searchParams.get("redirect");

  async function verify(opts: {
    code: string | null;
    redirect: string | null;
  }) {
    setLoading(true);
    try {
      const data = await fetch("/api/nvii/opts", {
        method: "POST",
        body: JSON.stringify({ code: opts.code }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const updatedUser = await data.json();

      if (!data.ok) {
        throw new Error(`HTTP error! status: ${data.status}`);
      }

      const req = await fetch("/api/nvii", {
        method: "POST",
        body: JSON.stringify(opts),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!req.ok) {
        throw new Error(`HTTP error! status: ${req.status}`);
      }

      const res = await req.json();

      console.log(res);
      try {
        const redirectUrl = new URL(res.redirect);
        redirectUrl.searchParams.append("authCode", opts.code as string);
        redirectUrl.searchParams.append("code", res.code);
        redirectUrl.searchParams.append("key", res.key);
        redirectUrl.searchParams.append("userId", res.userId);
        redirectUrl.searchParams.append("deviceId", res.id);
        redirectUrl.searchParams.append("username", updatedUser.username);
        redirectUrl.searchParams.append("email", updatedUser.email);

        const redirectUrlString = redirectUrl.toString();

        const cliServerRes = await fetch(redirectUrlString);

        if (cliServerRes.status === 400) {
          toast.error(
            "Invalid opts code. Copy and paste the url displayed in your terminal."
          );
          return;
        }

        setLoading(false);
        setSuccess(true);
      } catch (_error) {
        console.error(_error);
        setLoading(false);
        toast.error(
          "Error redirecting back to local CLI. Is your CLI running?"
        );
      }
    } catch (_error) {
      console.error(_error);
      setLoading(false);
      toast.error("Error creating Evincible API key.");
    }
  }

  async function cancel() {
    try {
      setLoading(true);
      const redirectUrl = new URL(_redirect as string);
      redirectUrl.searchParams.append("cancelled", "true");
      await fetch(redirectUrl.toString());
      setLoading(false);
      setCancelled(true);
    } catch (_error) {
      console.error(_error);
      setLoading(false);
      toast.error("Error cancelling login. Is your local CLI running?");
    }
  }

  const { user } = useSession();

  if (!code || !_redirect) {
    return notFound();
  }

  const opts = { code, redirect: _redirect, id: user?.id };

  if (cancelled) {
    return <Cancelled />;
  }

  if (success) {
    return <Success />;
  }

  return (
    <div className="w-full min-h-screen flex items-center pt-[250px] px-4 flex-col ">
      <div className="flex flex-col">
        <div className="flex ">
          <div className="flex justify-center items-center pr-4">
            <Fingerprint className="text-muted-foreground" />
          </div>
          <div className="flex-col">
            <h1 className="text-lg text-muted-foreground">
              Device confirmation
            </h1>
            <p className="text-sm text-muted-foreground/60">
              Please confirm this is the code shown in your terminal
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid grid-flow-col gap-1 pt-6 leading-none lg:gap-3 auto-cols-auto">
            {code?.split("").map((char, i) => (
              <CodeCharacter char={char} key={`${char}-${i}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <div className="flex items-center w-full">
              <Button
                className="mr-2 flex-1"
                onClick={() => verify(opts)}
                disabled={loading}
              >
                {loading ? "Confirming..." : "Confirm code"}
              </Button>
              <Button
                variant="outline"
                onClick={() => cancel()}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

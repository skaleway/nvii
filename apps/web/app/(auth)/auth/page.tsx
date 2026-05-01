import { AuthButton } from "@/components/auth/auth-button";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Auth",
  description: "Auth",
};

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthButton />
    </Suspense>
  );
}
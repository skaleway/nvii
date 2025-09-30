import { AuthButton } from "@/components/auth/auth-button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth",
  description: "Auth",
};

export default function AuthPage() {
  return <AuthButton />;
}

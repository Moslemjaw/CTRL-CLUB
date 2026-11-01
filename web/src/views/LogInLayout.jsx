"use client";

import { usePathname } from "next/navigation";
import AuthFrame from "@/components/brand/AuthFrame";

const HEADINGS = {
  "/logIn/forgot-password": "Reset Your Password",
  "/logIn/reset-password": "Choose a New Password",
};

export default function LogInLayout({ children }) {
  const pathname = usePathname();
  return (
    <AuthFrame
      title="Welcome to CTRL Club Events."
      tagline="Welcome back! Log in to access your personalized dashboard and continue your journey with our exclusive coding events."
      heading={HEADINGS[pathname] ?? "Sign into Your Account"}
    >
      {children}
    </AuthFrame>
  );
}

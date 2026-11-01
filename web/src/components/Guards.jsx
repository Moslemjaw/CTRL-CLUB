"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "./AuthProvider";
import KeyCap from "./brand/KeyCap";

export function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-navy-deep" role="status" aria-label="Loading">
      <div className="w-24 animate-pulse"><KeyCap /></div>
    </div>
  );
}

// Decides what the page shows. The database access rules enforce the same roles.
export function ProtectedRoute({ allow, children }) {
  const router = useRouter();
  const { loading, isLoggedIn, role } = useAuth();
  const permitted = isLoggedIn && (!allow || allow.includes(role));

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      router.replace("/logIn");
    } else if (!permitted) {
      toast.error("You do not have permission to access this link.");
      router.replace("/");
    }
  }, [loading, isLoggedIn, permitted, router]);

  return loading || !permitted ? <Loading /> : children;
}

export function NotProtectedRoute({ children }) {
  const router = useRouter();
  const { loading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!loading && isLoggedIn) router.replace("/");
  }, [loading, isLoggedIn, router]);

  return loading || isLoggedIn ? <Loading /> : children;
}

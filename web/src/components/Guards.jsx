"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "./AuthProvider";

export function Loading() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-16 h-16 rounded-full border-8 border-gray-200 border-t-base-color animate-spin" />
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

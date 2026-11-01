import { Suspense } from "react";
import { ProtectedRoute } from "@/components/Guards";
import EventDetails from "@/views/EventDetails";

export default function Page() {
  return <ProtectedRoute allow={["user", "admin"]}><Suspense><EventDetails /></Suspense></ProtectedRoute>;
}

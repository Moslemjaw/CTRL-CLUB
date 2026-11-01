import { Suspense } from "react";
import RootShell from "@/views/RootShell";
import Blog from "@/views/Blog";

export default function Page() {
  return <RootShell><Suspense><Blog /></Suspense></RootShell>;
}

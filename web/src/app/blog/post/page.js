import { Suspense } from "react";
import RootShell from "@/views/RootShell";
import BlogPost from "@/views/BlogPost";

export default function Page() {
  return <RootShell><Suspense><BlogPost /></Suspense></RootShell>;
}

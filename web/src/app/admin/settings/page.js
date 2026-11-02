import { redirect } from "next/navigation";

// The profile page is shared with members, so it lives under /workspace.
export default function Page() {
  redirect("/workspace/profile");
}

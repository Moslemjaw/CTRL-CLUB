"use client";

import PageHeader from "@/components/molecule/PageHeader";
import EditProfile from "./EditProfile";

export default function Settings() {
  return (
    <div>
      <PageHeader title="Profile" description="Your title is set by an admin. Everything else here is yours to change." />
      <EditProfile />
    </div>
  );
}

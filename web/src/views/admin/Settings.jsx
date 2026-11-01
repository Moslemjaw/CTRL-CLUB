"use client";


import PageHeader from "@/components/molecule/PageHeader";
import EditProfile from "./EditProfile";

export default function Settings() {

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="panel">
        <EditProfile />
      </div>
    </div>
  )
}

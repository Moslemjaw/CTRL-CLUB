"use client";

import { BsQrCodeScan } from "react-icons/bs";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/molecule/PageHeader";
import QrScanner from "@/components/organism/QrScanner";
import SpeedDialComponent from "@/components/organism/SpeedDialComponent";
import AdminLayout from "@/views/admin/AdminLayout";

export default function ScannerPage() {
  const { role } = useAuth();

  if (role === "admin" || role === "ctrl_member") {
    return (
      <AdminLayout>
        <PageHeader title="QR Scanner" description="Choose the event, then scan each ticket." />
        <div className="mx-auto max-w-xl">
          <QrScanner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <main className="page-bg flex min-h-screen flex-col items-center px-4 py-6 md:py-12">
      <SpeedDialComponent />
      <div className="page-enter flex w-full max-w-xl flex-col items-center">
        <h1 className="heading mb-6 flex items-center gap-3 text-3xl md:text-5xl">QR Code Scanner <BsQrCodeScan className="text-sky" aria-hidden="true" /></h1>
        <QrScanner />
      </div>
    </main>
  );
}

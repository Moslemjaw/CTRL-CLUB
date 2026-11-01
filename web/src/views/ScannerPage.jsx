"use client";

import { BsQrCodeScan } from "react-icons/bs";
import QrScanner from "@/components/organism/QrScanner";
import SpeedDialComponent from "@/components/organism/SpeedDialComponent";

export default function ScannerPage() {
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

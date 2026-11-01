"use client";

import ButtonComponent from "@/components/atoms/ButtonComponent";
import KeyCap from "@/components/brand/KeyCap";
import SignalField from "@/components/brand/SignalField";

const NotFound = () => (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-5 text-center">
    <SignalField />
    <div className="page-enter relative">
      <div className="mx-auto mb-10 w-44"><KeyCap label="404" /></div>
      <h1 className="heading text-5xl md:text-6xl">Oops! Page Not Found</h1>
      <p className="mb-8 mt-4 text-white/75">The page you are looking for does not exist</p>
      <ButtonComponent text="Back to Home" path="/" />
    </div>
  </main>
);

export default NotFound;

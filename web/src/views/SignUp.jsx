"use client";

import AuthFrame from "@/components/brand/AuthFrame";
import SignUpForm from "@/components/organism/SignUpForm";

export default function SignUp() {
  return (
    <AuthFrame
      title="Welcome to CTRL Club Events."
      tagline="Welcome! Sign up to create your account and start your journey with our exclusive coding events. Unlock new experiences and skills today!"
      heading="Create Your Account here"
    >
      <SignUpForm />
    </AuthFrame>
  );
}

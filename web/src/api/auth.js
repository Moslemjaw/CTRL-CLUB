import { supabase } from "@/lib/supabase";

export async function signUp({ name, email, phoneNumber, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone_number: String(phoneNumber) },
      emailRedirectTo: `${window.location.origin}/logIn`,
    },
  });
  if (error) throw error;
  // Supabase hides existing accounts by returning a user with no identities.
  if (data.user && data.user.identities?.length === 0) {
    throw new Error("Email already exists");
  }
}

export async function verifyCode({ email, code }) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "signup",
  });
  if (error) throw new Error("Incorrect verification code");
  // The original flow sends users to the log in page after verifying.
  await supabase.auth.signOut();
}

export async function logIn({ email, password }) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(
      error.code === "email_not_confirmed"
        ? "Please verify your email first"
        : "Invalid email or password"
    );
  }
}

export async function sendForgotPasswordEmail({ email }) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/logIn/reset-password`,
  });
  if (error) throw error;
}

export async function resetPassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  await supabase.auth.signOut();
}

export const logOut = () => supabase.auth.signOut();

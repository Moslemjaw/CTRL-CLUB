import { invokeFunction, supabase } from "@/lib/supabase";

const PAGE_SIZE = 6;

export async function getAllUsers(page) {
  const from = (page - 1) * PAGE_SIZE;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone_number, role")
    .order("created_at", { ascending: true })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phoneNumber: row.phone_number,
    role: row.role,
  }));
}

export async function getCountUsers() {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count;
}

export const addUserByAdmin = ({ name, email, phoneNumber, password, role }) =>
  invokeFunction("admin-users", {
    action: "create",
    name,
    email,
    phoneNumber,
    password,
    role,
  });

export const deleteUser = (userId) =>
  invokeFunction("admin-users", { action: "delete", userId });

export const setUserRole = (userId, role) =>
  invokeFunction("admin-users", { action: "set-role", userId, role });

// Email changes go through Supabase Auth, which syncs the profile once confirmed.
export async function updateProfile(userId, { name, email }, currentEmail) {
  const { error } = await supabase
    .from("profiles")
    .update({ name })
    .eq("id", userId);
  if (error) throw error;
  if (email !== currentEmail) {
    const { error: emailError } = await supabase.auth.updateUser({ email });
    if (emailError) throw emailError;
  }
}

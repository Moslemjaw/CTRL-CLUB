import { invokeFunction, supabase } from "@/lib/supabase";

const PAGE_SIZE = 6;
const AVATARS = "avatars";

// Quoted so commas and brackets in the search text can't change the filter.
const searchTerm = (text) => `"%${text.replace(/[\\"]/g, (char) => `\\${char}`)}%"`;

export async function getAllUsers(page, { search = "", role = "all" } = {}) {
  const from = (page - 1) * PAGE_SIZE;
  let query = supabase
    .from("profiles")
    .select("id, name, email, phone_number, role, title", { count: "exact" });
  if (role !== "all") query = query.eq("role", role);
  const text = search.trim();
  if (text) {
    // Phone numbers are stored as digits, so spaces and dashes in the search are ignored for them.
    const phone = text.replace(/[\s()-]/g, "") || text;
    query = query.or(`name.ilike.${searchTerm(text)},email.ilike.${searchTerm(text)},phone_number.ilike.${searchTerm(phone)}`);
  }
  const { data, count, error } = await query
    .order("created_at", { ascending: true })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  const users = data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phoneNumber: row.phone_number,
    role: row.role,
    title: row.title,
  }));
  return { users, count };
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

export const setUserTitle = (userId, title) =>
  invokeFunction("admin-users", { action: "set-title", userId, title });

export const avatarUrl = (path) =>
  path ? supabase.storage.from(AVATARS).getPublicUrl(path).data.publicUrl : "";

// Email changes go through Supabase Auth, which syncs the profile once confirmed.
export async function updateProfile(userId, { name, phoneNumber, bio, email }, currentEmail) {
  const { error } = await supabase
    .from("profiles")
    .update({ name, phone_number: phoneNumber, bio: bio.trim() || null })
    .eq("id", userId);
  if (error) throw error;
  if (email !== currentEmail) {
    const { error: emailError } = await supabase.auth.updateUser({ email });
    if (emailError) throw emailError;
  }
}

export async function setAvatar(userId, file, previousPath) {
  const path = `${userId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage.from(AVATARS).upload(path, file);
  if (uploadError) throw uploadError;
  const { error } = await supabase.from("profiles").update({ avatar: path }).eq("id", userId);
  if (error) {
    await supabase.storage.from(AVATARS).remove([path]);
    throw error;
  }
  if (previousPath) await supabase.storage.from(AVATARS).remove([previousPath]);
}

export async function removeAvatar(userId, path) {
  const { error } = await supabase.from("profiles").update({ avatar: null }).eq("id", userId);
  if (error) throw error;
  await supabase.storage.from(AVATARS).remove([path]);
}

// Confirms the current password first, so an unattended session can't change it.
export async function changePassword(email, currentPassword, newPassword) {
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (signInError) throw new Error("Your current password is incorrect");
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

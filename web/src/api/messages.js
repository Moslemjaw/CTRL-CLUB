import { invokeFunction, supabase } from "@/lib/supabase";

const PAGE_SIZE = 10;

// Tells the sidebar to refresh its unread badge.
export const MESSAGES_CHANGED = "ctrl-messages-changed";

const applyFilter = (query, filter) => {
  if (filter === "unread") return query.is("read_at", null);
  if (filter === "replied") return query.not("replied_at", "is", null);
  return query;
};

export async function getMessages(page, filter) {
  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await applyFilter(
    supabase.from("contact_messages").select("*", { count: "exact" }),
    filter
  )
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  return { messages: data, pageCount: Math.ceil(count / PAGE_SIZE) };
}

export async function getMessageById(id) {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getUnreadCount() {
  const { count, error } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);
  if (error) throw error;
  return count;
}

export async function getReplies(messageId) {
  const { data, error } = await supabase
    .from("contact_replies")
    .select("*")
    .eq("message_id", messageId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function markRead(messageId) {
  const readAt = new Date().toISOString();
  const { error } = await supabase
    .from("contact_messages")
    .update({ read_at: readAt })
    .eq("id", messageId);
  if (error) throw error;
  return readAt;
}

export async function deleteMessage(messageId) {
  const { error } = await supabase.from("contact_messages").delete().eq("id", messageId);
  if (error) throw error;
}

export const sendReply = (messageId, reply) =>
  invokeFunction("contact-reply", { messageId, reply });

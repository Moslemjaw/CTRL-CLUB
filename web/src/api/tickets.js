import { invokeFunction, supabase } from "@/lib/supabase";

const PAGE_SIZE = 6;

const toTicket = (row) => ({
  id: row.id,
  qrId: row.qr_id,
  eventId: row.event_id,
  title: row.event_title,
  location: row.event_location,
  date: row.event_date,
  status: row.status,
});

const applyFilter = (query, filter) =>
  filter === "used" || filter === "unused" ? query.eq("status", filter) : query;

export async function getCountTickets() {
  const { count, error } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count;
}

export async function getCountUserTickets(filter, userId) {
  const { count, error } = await applyFilter(
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    filter
  );
  if (error) throw error;
  return count;
}

export async function getTicketsByUserId(userId, page, filter) {
  const from = (page - 1) * PAGE_SIZE;
  const { data, error } = await applyFilter(
    supabase.from("tickets").select("*").eq("user_id", userId),
    filter
  )
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  return data.map(toTicket);
}

// The ticket is saved first, so a failed email never loses it: it still shows in My Tickets.
export async function createTicket(eventId) {
  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: eventId,
    p_quantity: 1,
  });
  if (error) throw error;
  try {
    await invokeFunction("send-tickets", {
      ticketIds: data.map((ticket) => ticket.id),
    });
    return { emailSent: true };
  } catch {
    return { emailSent: false };
  }
}

export async function scanTicket(qrId, eventId) {
  const { data, error } = await supabase.rpc("scan_ticket", {
    p_qr_id: qrId,
    p_event_id: eventId,
  });
  if (error) throw error;
  return data;
}

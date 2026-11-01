import { supabase } from "@/lib/supabase";

const toTask = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status,
  dueDate: row.due_date,
  assignedTo: row.assigned_to,
  createdBy: row.created_by,
});

const toEntry = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  location: row.location,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  createdBy: row.created_by,
});

const toNote = (row) => ({
  id: row.id,
  title: row.title,
  body: row.body,
  updatedAt: row.updated_at,
  createdBy: row.created_by,
});

export async function getTeamMembers() {
  const { data, error } = await supabase.rpc("list_team_members");
  if (error) throw error;
  return data;
}

async function removeRow(table, id) {
  // A delete blocked by the access rules is not an error, it just removes nothing.
  const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data.length) throw new Error("Only the author or an admin can delete this.");
}

// Tasks
export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toTask);
}

const taskRow = (values) => ({
  title: values.title,
  description: values.description,
  status: values.status,
  due_date: values.dueDate || null,
  assigned_to: values.assignedTo || null,
});

export async function createTask(values) {
  const { data, error } = await supabase.from("tasks").insert(taskRow(values)).select().single();
  if (error) throw error;
  return toTask(data);
}

export async function updateTask(id, values) {
  const { data, error } = await supabase.from("tasks").update(taskRow(values)).eq("id", id).select().single();
  if (error) throw error;
  return toTask(data);
}

export const deleteTask = (id) => removeRow("tasks", id);

// Calendar
export async function getCalendarEntries(from, to) {
  const { data, error } = await supabase
    .from("calendar_entries")
    .select("*")
    .gte("starts_at", from.toISOString())
    .lt("starts_at", to.toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return data.map(toEntry);
}

export async function getClubEvents(from, to) {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, date, location")
    .gte("date", from.toISOString())
    .lt("date", to.toISOString())
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

const entryRow = (values) => ({
  title: values.title,
  description: values.description,
  location: values.location,
  starts_at: new Date(values.startsAt).toISOString(),
  ends_at: values.endsAt ? new Date(values.endsAt).toISOString() : null,
});

export async function createCalendarEntry(values) {
  const { data, error } = await supabase.from("calendar_entries").insert(entryRow(values)).select().single();
  if (error) throw error;
  return toEntry(data);
}

export async function updateCalendarEntry(id, values) {
  const { data, error } = await supabase.from("calendar_entries").update(entryRow(values)).eq("id", id).select().single();
  if (error) throw error;
  return toEntry(data);
}

export const deleteCalendarEntry = (id) => removeRow("calendar_entries", id);

// Notes
export async function getNotes() {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map(toNote);
}

export async function createNote({ title, body }) {
  const { data, error } = await supabase.from("notes").insert({ title, body }).select().single();
  if (error) throw error;
  return toNote(data);
}

export async function updateNote(id, { title, body }) {
  const { data, error } = await supabase.from("notes").update({ title, body }).eq("id", id).select().single();
  if (error) throw error;
  return toNote(data);
}

export const deleteNote = (id) => removeRow("notes", id);

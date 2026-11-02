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
  visibility: row.visibility,
  sharedWith: (row.note_shares ?? []).map((share) => share.user_id),
  attachments: (row.note_attachments ?? [])
    .map((file) => ({
      id: file.id,
      name: file.name,
      path: file.path,
      size: file.size_bytes,
      uploadedBy: file.uploaded_by,
      createdAt: file.created_at,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
});

const NOTE_COLUMNS = "*, note_shares(user_id), note_attachments(id, name, path, size_bytes, uploaded_by, created_at)";
const NOTE_FILES = "note-attachments";

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
    .select(NOTE_COLUMNS)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map(toNote);
}

export async function getNote(id) {
  const { data, error } = await supabase.from("notes").select(NOTE_COLUMNS).eq("id", id).single();
  if (error) throw error;
  return toNote(data);
}

export async function createNote({ title, body, visibility }) {
  const { data, error } = await supabase.from("notes").insert({ title, body, visibility }).select("id").single();
  if (error) throw error;
  return data.id;
}

// Only the author may send a visibility; the database rejects it from anyone else.
export async function updateNote(id, { title, body, visibility }) {
  const changes = visibility ? { title, body, visibility } : { title, body };
  const { error } = await supabase.from("notes").update(changes).eq("id", id);
  if (error) throw error;
}

export async function setNoteShares(noteId, userIds) {
  const { error } = await supabase.rpc("set_note_shares", { p_note_id: noteId, p_user_ids: userIds });
  if (error) throw error;
}

export async function addNoteAttachment(noteId, file) {
  const path = `${noteId}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage.from(NOTE_FILES).upload(path, file);
  if (uploadError) throw uploadError;
  const { error } = await supabase.from("note_attachments").insert({
    note_id: noteId,
    name: file.name.slice(0, 255),
    path,
    size_bytes: file.size,
    mime_type: file.type,
  });
  if (error) {
    await supabase.storage.from(NOTE_FILES).remove([path]);
    throw error;
  }
}

export async function removeNoteAttachment(attachment) {
  const { error: storageError } = await supabase.storage.from(NOTE_FILES).remove([attachment.path]);
  if (storageError) throw storageError;
  await removeRow("note_attachments", attachment.id);
}

// Links last one minute and download the file under its original name.
export async function getAttachmentLink(attachment) {
  const { data, error } = await supabase.storage
    .from(NOTE_FILES)
    .createSignedUrl(attachment.path, 60, { download: attachment.name });
  if (error) throw error;
  return data.signedUrl;
}

// Files are removed first, because the access rules stop allowing it once the note is gone.
export async function deleteNote(note) {
  if (note.attachments.length) {
    const { error } = await supabase.storage.from(NOTE_FILES).remove(note.attachments.map((file) => file.path));
    if (error) throw error;
  }
  await removeRow("notes", note.id);
}

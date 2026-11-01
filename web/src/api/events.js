import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 3;
const BUCKET = "event-images";

export const coverImageUrl = (path) =>
  path ? supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl : "";

const toEvent = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  date: row.date,
  location: row.location,
  price: row.price,
  capacity: row.capacity,
  availableTickets: row.available_tickets,
  coverImage: row.cover_image,
});

const applyFilter = (query, filter) => {
  if (filter === "open") return query.gt("available_tickets", 0);
  if (filter === "closed") return query.eq("available_tickets", 0);
  return query;
};

async function uploadCoverImage(file) {
  const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  return path;
}

export async function getAllEvents(page, filter) {
  const from = (page - 1) * PAGE_SIZE;
  const { data, error } = await applyFilter(
    supabase.from("events").select("*"),
    filter
  )
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  return data.map(toEvent);
}

export async function getCountEvents(filter) {
  const { count, error } = await applyFilter(
    supabase.from("events").select("*", { count: "exact", head: true }),
    filter
  );
  if (error) throw error;
  return count;
}

export async function getClosestEvent() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gt("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data && toEvent(data);
}

export async function getEventById(id) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data && toEvent(data);
}

export async function getAllEventsForScanner() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("events")
    .select("id, title")
    .gte("date", yesterday)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createEvent(values) {
  const coverImage = await uploadCoverImage(values.coverImage);
  const { error } = await supabase.from("events").insert({
    title: values.title,
    description: values.description,
    date: new Date(values.date).toISOString(),
    location: values.location,
    price: values.price,
    capacity: values.capacity,
    available_tickets: values.capacity,
    cover_image: coverImage,
  });
  if (error) {
    await supabase.storage.from(BUCKET).remove([coverImage]);
    throw error;
  }
}

// The existing cover image is kept unless a new file was chosen.
export async function updateEvent(id, values, previousImage) {
  const isNewImage = values.coverImage instanceof File;
  const coverImage = isNewImage
    ? await uploadCoverImage(values.coverImage)
    : previousImage;
  const { error } = await supabase
    .from("events")
    .update({
      title: values.title,
      description: values.description,
      date: new Date(values.date).toISOString(),
      location: values.location,
      price: values.price,
      capacity: values.capacity,
      available_tickets: values.availableTickets,
      cover_image: coverImage,
    })
    .eq("id", id);
  if (error) throw error;
  if (isNewImage && previousImage) {
    await supabase.storage.from(BUCKET).remove([previousImage]);
  }
}

export async function deleteEvent(event) {
  const { error } = await supabase.from("events").delete().eq("id", event.id);
  if (error) throw error;
  if (event.coverImage) {
    await supabase.storage.from(BUCKET).remove([event.coverImage]);
  }
}

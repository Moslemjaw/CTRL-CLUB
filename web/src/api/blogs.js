import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 6;
const BUCKET = "blog-images";

export const blogImageUrl = (path) =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

const toPost = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  images: row.images,
  linkUrl: row.link_url,
  linkLabel: row.link_label,
  createdAt: row.created_at,
});

export async function getBlogPosts(page) {
  const from = (page - 1) * PAGE_SIZE;
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  return data.map(toPost);
}

export async function getAllBlogPosts() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toPost);
}

export async function getCountBlogPosts() {
  const { count, error } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count;
}

export async function getBlogPostById(id) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data && toPost(data);
}

async function uploadImage(file, index) {
  const path = `${Date.now()}-${index}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  return path;
}

// images holds { path } for pictures already saved and { file } for new ones, in display order.
// New pictures are cleaned up if saving fails, and dropped ones are removed only after it succeeds.
export async function saveBlogPost(id, values, images, previousImages = []) {
  const uploaded = [];
  try {
    const paths = [];
    for (const [index, image] of images.entries()) {
      if (image.path) {
        paths.push(image.path);
      } else {
        const path = await uploadImage(image.file, index);
        uploaded.push(path);
        paths.push(path);
      }
    }
    const row = {
      title: values.title.trim(),
      description: values.description.trim(),
      images: paths,
      link_url: values.linkUrl.trim() || null,
      link_label: values.linkUrl.trim() ? values.linkLabel.trim() || "Learn More" : null,
    };
    const query = id
      ? supabase.from("blog_posts").update(row).eq("id", id)
      : supabase.from("blog_posts").insert(row);
    const { data, error } = await query.select().single();
    if (error) throw error;
    const dropped = previousImages.filter((path) => !paths.includes(path));
    if (dropped.length) await supabase.storage.from(BUCKET).remove(dropped);
    return toPost(data);
  } catch (error) {
    if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
    throw error;
  }
}

export async function deleteBlogPost(post) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
  if (error) throw error;
  if (post.images.length) await supabase.storage.from(BUCKET).remove(post.images);
}

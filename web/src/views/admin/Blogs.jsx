"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { IoMdCloudUpload } from "react-icons/io";
import PageHeader from "@/components/molecule/PageHeader";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import { blogImageUrl, deleteBlogPost, getBlogPosts, getCountBlogPosts, saveBlogPost } from "@/api/blogs";

const ITEMS_PER_PAGE = 6;
const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const LINK_PATTERN = /^(https?:\/\/\S+|\/([^/\\\s]\S*)?)$/;

const imageSrc = (image) => (image.path ? blogImageUrl(image.path) : image.preview);

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [postsCount, setPostsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [images, setImages] = useState([]);

  const loadPosts = (page) =>
    Promise.all([getBlogPosts(page), getCountBlogPosts()])
      .then(([rows, count]) => {
        setPosts(rows);
        setPostsCount(count);
      })
      .catch((error) => toast.error(`Error fetching posts: ${error.message}`))
      .finally(() => setLoaded(true));

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage]);

  const formik = useFormik({
    initialValues: { title: "", description: "", linkUrl: "", linkLabel: "" },
    validationSchema: Yup.object({
      title: Yup.string().trim().max(200, "Title is too long").required("Title is required"),
      description: Yup.string().trim().max(20000, "Description is too long").required("Description is required"),
      linkUrl: Yup.string().trim().max(2000, "Link is too long").matches(LINK_PATTERN, "Use a full https:// link, or a page on this site such as /signUp"),
      linkLabel: Yup.string().trim().max(60, "Button text is too long"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await saveBlogPost(editing?.id, values, images, editing?.images);
        toast.success(editing ? "Post updated successfully." : "Post published successfully.");
        closeForm();
        await loadPosts(currentPage);
      } catch (error) {
        toast.error(error.message || "Could not save the post.");
      }
      setSubmitting(false);
    },
  });

  const closeForm = () => {
    setEditing(null);
    setFormOpen(false);
    setImages([]);
    formik.resetForm();
  };

  const startEdit = (post) => {
    setEditing(post);
    setFormOpen(true);
    setImages(post.images.map((path) => ({ path })));
    formik.setValues({
      title: post.title,
      description: post.description,
      linkUrl: post.linkUrl ?? "",
      linkLabel: post.linkLabel ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addImages = (event) => {
    const files = [...event.target.files];
    event.target.value = "";
    const tooBig = files.filter((file) => file.size > MAX_IMAGE_BYTES);
    if (tooBig.length) toast.error("Each picture must be 5 MB or smaller.");
    const accepted = files
      .filter((file) => file.size <= MAX_IMAGE_BYTES)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    if (images.length + accepted.length > MAX_IMAGES) toast.error(`A post can have up to ${MAX_IMAGES} pictures.`);
    setImages((previous) => [...previous, ...accepted].slice(0, MAX_IMAGES));
  };

  const makeCover = (image) => setImages((previous) => [image, ...previous.filter((item) => item !== image)]);
  const removeImage = (image) => setImages((previous) => previous.filter((item) => item !== image));

  const handleDelete = async (post) => {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    try {
      await deleteBlogPost(post);
      toast.success("Post deleted successfully.");
      if (editing?.id === post.id) closeForm();
      // The last post on a page leaves nothing to show, so step back a page.
      if (posts.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
      else await loadPosts(currentPage);
    } catch (error) {
      toast.error(error.message || "Could not delete the post.");
    }
  };

  const fieldClass = (name) => `field ${formik.touched[name] && formik.errors[name] ? "field-invalid" : ""}`;
  const fieldError = (name) => formik.touched[name] && formik.errors[name] && <div className="field-error">{formik.errors[name]}</div>;

  return (
    <div>
      <PageHeader title="Blogs" description="Posts appear on the public blog page.">
        <Link href="/blog" className="btn btn-ghost !min-h-11 !py-2">View Blog</Link>
        {!formOpen && <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary !min-h-11 !py-2">New Post</button>}
      </PageHeader>

      {formOpen && (
        <div className="panel mb-6">
          <h2 className="heading mb-5 text-2xl">{editing ? "Edit Post" : "New Post"}</h2>
          <form onSubmit={formik.handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className="field-label">Pictures ({images.length} of {MAX_IMAGES})</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {images.map((image, index) => (
                  <div key={image.path ?? image.preview} className="overflow-hidden rounded-xl border border-sky/20 bg-white/[0.04]">
                    <img src={imageSrc(image)} alt={`Picture ${index + 1}`} className="aspect-[16/10] w-full object-cover" />
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 p-2 text-sm font-medium">
                      {index === 0 ? (
                        <span className="font-mono text-xs uppercase tracking-[0.12em] text-sky">Cover</span>
                      ) : (
                        <button type="button" onClick={() => makeCover(image)} className="text-sky hover:underline">Make Cover</button>
                      )}
                      <button type="button" aria-label={`Remove picture ${index + 1}`} onClick={() => removeImage(image)} className="text-stop hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label htmlFor="blog-images" className="flex aspect-[16/10] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sky/40 text-sm text-sky-soft transition-colors hover:bg-white/5">
                    <IoMdCloudUpload className="text-3xl" aria-hidden="true" />
                    Add Pictures
                  </label>
                )}
              </div>
              <input id="blog-images" type="file" multiple accept="image/png, image/jpeg, image/webp" onChange={addImages} className="sr-only" />
              <p className="mt-2 text-sm text-white/60">PNG, JPG or WebP, up to 5 MB each. The first picture is the cover.</p>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="blog-title" className="field-label">Title</label>
              <input id="blog-title" name="title" value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur} className={fieldClass("title")} />
              {fieldError("title")}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="blog-description" className="field-label">Description</label>
              <textarea id="blog-description" name="description" rows={6} value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} className={fieldClass("description")} />
              {fieldError("description")}
            </div>
            <div>
              <label htmlFor="blog-link" className="field-label">Button Link (optional)</label>
              <input id="blog-link" name="linkUrl" placeholder="https://example.com or /signUp" value={formik.values.linkUrl} onChange={formik.handleChange} onBlur={formik.handleBlur} className={fieldClass("linkUrl")} />
              {fieldError("linkUrl")}
            </div>
            <div>
              <label htmlFor="blog-label" className="field-label">Button Text (optional)</label>
              <input id="blog-label" name="linkLabel" placeholder="Learn More" value={formik.values.linkLabel} onChange={formik.handleChange} onBlur={formik.handleBlur} className={fieldClass("linkLabel")} />
              {fieldError("linkLabel")}
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button type="submit" disabled={formik.isSubmitting} className="btn btn-primary">
                {formik.isSubmitting ? "Saving..." : editing ? "Save Post" : "Publish Post"}
              </button>
              <button type="button" onClick={closeForm} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loaded && posts.length === 0 && <p className="panel text-center text-white/60">No posts yet.</p>}
      <div className="grid gap-4">
        {posts.map((post) => (
          <article key={post.id} className="panel !p-4 md:!p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {post.images[0] ? (
                <img src={blogImageUrl(post.images[0])} alt="" className="aspect-[16/10] w-full shrink-0 rounded-xl object-cover md:w-44" />
              ) : (
                <div className="hidden aspect-[16/10] w-44 shrink-0 items-center justify-center rounded-xl border border-dashed border-sky/25 text-sm text-white/50 md:flex">No picture</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="eyebrow mb-1">{new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
                <h2 className="break-words font-display text-xl font-semibold">{post.title}</h2>
                <p className="mt-1 line-clamp-2 break-words text-sm text-white/70">{post.description}</p>
              </div>
              <div className="flex shrink-0 gap-4 text-sm font-medium">
                <Link href={`/blog/post?id=${post.id}`} className="text-sky hover:underline">View</Link>
                <button type="button" onClick={() => startEdit(post)} className="text-sky hover:underline">Edit</button>
                <button type="button" onClick={() => handleDelete(post)} className="text-stop hover:underline">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <PaginationRounded count={Math.ceil(postsCount / ITEMS_PER_PAGE)} page={currentPage} onChange={(_event, value) => setCurrentPage(value)} />
    </div>
  );
}

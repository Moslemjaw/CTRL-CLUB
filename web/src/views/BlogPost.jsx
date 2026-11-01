"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import ButtonComponent from "@/components/atoms/ButtonComponent";
import { Loading } from "@/components/Guards";
import { blogImageUrl, getBlogPostById } from "@/api/blogs";

export default function BlogPost() {
  const postId = useSearchParams().get("id");
  const [post, setPost] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!postId) {
      setMissing(true);
      return;
    }
    getBlogPostById(postId)
      .then((data) => {
        if (data) setPost(data);
        else setMissing(true);
      })
      .catch((error) => {
        setMissing(true);
        toast.error(error.message);
      });
  }, [postId]);

  if (missing) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-5 text-center">
        <h1 className="heading text-4xl">Post not found</h1>
        <Link href="/blog" className="btn btn-primary">Back to Blog</Link>
      </main>
    );
  }

  if (!post) return <Loading />;

  const [cover, ...gallery] = post.images;
  const isInternal = post.linkUrl?.startsWith("/");

  return (
    <main className="page-bg min-h-screen px-5 pb-24 pt-6">
      <div className="page-enter mx-auto max-w-4xl">
        <Link href="/blog" className="btn btn-ghost !min-h-11">&larr; Blog</Link>
        <p className="eyebrow mb-4 mt-10">{new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        <h1 className="heading break-words text-4xl md:text-6xl">{post.title}</h1>
        {cover && <img src={blogImageUrl(cover)} alt={post.title} className="mt-8 aspect-[16/9] w-full rounded-3xl border border-sky/20 object-cover" />}
        <p className="mt-8 whitespace-pre-line break-words text-lg leading-relaxed text-white/80">{post.description}</p>

        {post.linkUrl && (
          <div className="mt-8">
            {isInternal ? (
              <ButtonComponent text={post.linkLabel} path={post.linkUrl} />
            ) : (
              <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">{post.linkLabel}</a>
            )}
          </div>
        )}

        {gallery.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {gallery.map((path, index) => (
              <img key={path} src={blogImageUrl(path)} alt={`${post.title}, picture ${index + 2}`} loading="lazy" className="aspect-[4/3] w-full rounded-2xl border border-sky/20 object-cover" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import { Loading } from "@/components/Guards";
import { blogImageUrl, getBlogPostById } from "@/api/blogs";

function PictureViewer({ images, title, start, onClose }) {
  const [current, setCurrent] = useState(start);
  const closeRef = useRef(null);
  const touchX = useRef(null);
  const count = images.length;
  const move = (step) => setCurrent((previous) => (previous + step + count) % count);

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTouchEnd = (event) => {
    if (touchX.current === null) return;
    const dx = event.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50 && count > 1) move(dx < 0 ? 1 : -1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pictures from ${title}`}
      onClick={onClose}
      onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-[400] flex flex-col bg-navy-deep/95 p-4 backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <p role="status" className="font-mono text-xs uppercase tracking-[0.14em] text-sky-soft">Picture {current + 1} of {count}</p>
        <button ref={closeRef} type="button" aria-label="Close pictures" onClick={onClose} className="btn-icon text-2xl"><IoClose aria-hidden="true" /></button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-3 py-4">
        {count > 1 && (
          <button type="button" aria-label="Previous picture" onClick={(event) => { event.stopPropagation(); move(-1); }} className="btn-icon hidden shrink-0 md:inline-flex"><IoChevronBack aria-hidden="true" /></button>
        )}
        <img src={blogImageUrl(images[current])} alt={`${title}, picture ${current + 1}`} onClick={(event) => event.stopPropagation()} className="max-h-full min-w-0 max-w-full rounded-2xl object-contain" />
        {count > 1 && (
          <button type="button" aria-label="Next picture" onClick={(event) => { event.stopPropagation(); move(1); }} className="btn-icon hidden shrink-0 md:inline-flex"><IoChevronForward aria-hidden="true" /></button>
        )}
      </div>
      {count > 1 && (
        <div className="flex justify-center gap-4 md:hidden">
          <button type="button" aria-label="Previous picture" onClick={(event) => { event.stopPropagation(); move(-1); }} className="btn-icon"><IoChevronBack aria-hidden="true" /></button>
          <button type="button" aria-label="Next picture" onClick={(event) => { event.stopPropagation(); move(1); }} className="btn-icon"><IoChevronForward aria-hidden="true" /></button>
        </div>
      )}
    </div>
  );
}

export default function BlogPost() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const page = Number(searchParams.get("page"));
  const backHref = page >= 1 ? `/blog?page=${page}` : "/blog";
  const [post, setPost] = useState(null);
  const [missing, setMissing] = useState(false);
  const [viewing, setViewing] = useState(null);

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

  const isInternal = post.linkUrl?.startsWith("/");
  const inkButton = "btn bg-ink text-white shadow-[0_5px_0_#6FCBFF] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none";

  return (
    <main className="page-bg min-h-screen px-4 pb-24 pt-6 md:px-5">
      <div className="page-enter mx-auto max-w-5xl">
        <Link href={backHref} className="btn btn-ghost !min-h-11">&larr; Back to the Book</Link>

        <article className="mt-6 rounded-3xl bg-[#F6F9FF] p-5 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.4)] md:p-10">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-navy-lift">
            {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            {page >= 1 && ` · Page ${page}`}
          </p>
          <h1 className="heading break-words text-4xl md:text-6xl">{post.title}</h1>
          <p className="mt-6 max-w-3xl whitespace-pre-line break-words text-lg leading-relaxed text-ink/80">{post.description}</p>

          {post.linkUrl && (
            <div className="mt-6">
              {isInternal ? (
                <Link href={post.linkUrl} className={inkButton}>{post.linkLabel}</Link>
              ) : (
                <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className={inkButton}>{post.linkLabel}</a>
              )}
            </div>
          )}

          {post.images.length > 0 && (
            <section aria-label="Pictures" className="mt-10">
              <h2 className="heading mb-4 text-2xl">{post.images.length === 1 ? "Picture" : `All ${post.images.length} Pictures`}</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                {post.images.map((path, index) => (
                  <button key={path} type="button" aria-label={`Open picture ${index + 1}`} onClick={() => setViewing(index)} className={`group overflow-hidden rounded-2xl ${index === 0 ? "col-span-2 md:col-span-3" : ""}`}>
                    <img src={blogImageUrl(path)} alt="" loading="lazy" className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${index === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>

      {viewing !== null && <PictureViewer images={post.images} title={post.title} start={viewing} onClose={() => setViewing(null)} />}
    </main>
  );
}

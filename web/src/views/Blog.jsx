"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import ButtonComponent from "@/components/atoms/ButtonComponent";
import BrandMark from "@/components/brand/BrandMark";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import { blogImageUrl, getBlogPosts, getCountBlogPosts } from "@/api/blogs";

const ITEMS_PER_PAGE = 6;

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [postsCount, setPostsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getBlogPosts(currentPage), getCountBlogPosts()])
      .then(([rows, count]) => {
        setPosts(rows);
        setPostsCount(count);
      })
      .catch((error) => toast.error(`Error fetching posts: ${error.message}`))
      .finally(() => setLoaded(true));
  }, [currentPage]);

  return (
    <main className="page-bg min-h-screen px-5 pb-24 pt-6">
      <div className="page-enter mx-auto max-w-[1300px]">
        <Link href="/" className="btn btn-ghost !min-h-11">&larr; Home</Link>
        <div className="mb-10 mt-10 lg:mb-14">
          <p className="eyebrow mb-4">Blog</p>
          <h1 className="heading text-5xl md:text-6xl xl:text-7xl">News and Stories<br />From CTRL.</h1>
        </div>

        {loaded && posts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-sky/30 px-6 py-20 text-center">
            <p className="heading text-3xl">No posts here yet.</p>
            <p className="mt-3 text-white/70">Check back soon.</p>
          </div>
        )}

        <div className="grid gap-6 2md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col overflow-hidden rounded-3xl border border-sky/20 bg-navy-panel/90 transition-colors duration-300 hover:border-sky/60">
              {post.images[0] ? (
                <img src={blogImageUrl(post.images[0])} alt={post.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-navy-lift/40"><BrandMark /></div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <p className="eyebrow mb-3">{new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                <h2 className="heading mb-3 break-words text-2xl">{post.title}</h2>
                <p className="mb-6 line-clamp-3 break-words leading-relaxed text-white/70">{post.description}</p>
                <div className="mt-auto">
                  <ButtonComponent text="Read More" path={`/blog/post?id=${post.id}`} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <PaginationRounded count={Math.ceil(postsCount / ITEMS_PER_PAGE)} page={currentPage} onChange={(_event, value) => setCurrentPage(value)} />
      </div>
    </main>
  );
}

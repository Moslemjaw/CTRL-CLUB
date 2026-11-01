"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "react-toastify";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import BrandMark from "@/components/brand/BrandMark";
import { Loading } from "@/components/Guards";
import { blogImageUrl, getAllBlogPosts } from "@/api/blogs";

// The book opens on the cover (0), then the title and contents (1), and each post after that.
const FIRST_POST_INDEX = 2;
const TURN = { duration: 0.85, ease: [0.45, 0.05, 0.25, 1] };
const INK_BUTTON = "btn bg-ink text-white shadow-[0_5px_0_#6FCBFF] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none";

const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const postHref = (post, number) => `/blog/post?id=${post.id}&page=${number}`;
const picturesLabel = (count) => `${count} ${count === 1 ? "picture" : "pictures"}`;

function Paper({ side, className = "", children }) {
  const rounded = { left: "rounded-l-2xl", right: "rounded-r-2xl", single: "rounded-r-2xl rounded-l-md" }[side];
  const spine = { left: "right-0 bg-gradient-to-l", right: "left-0 bg-gradient-to-r", single: "left-0 bg-gradient-to-r" }[side];
  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#F6F9FF] text-ink ${rounded} ${className}`}>
      {children}
      <span className={`pointer-events-none absolute inset-y-0 w-10 from-ink/20 to-transparent ${spine}`} aria-hidden="true" />
    </div>
  );
}

function Cover({ side, onOpen }) {
  return (
    <div className={`relative flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden border border-sky/40 bg-navy-panel p-8 text-center ${side === "single" ? "rounded-r-2xl rounded-l-md" : "rounded-r-2xl"}`}>
      <span className="absolute inset-3 rounded-xl border border-sky/25" aria-hidden="true" />
      <span className="absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-navy-deep to-transparent" aria-hidden="true" />
      <BrandMark className="scale-150" />
      <div className="mt-4">
        <p className="eyebrow mb-3">The Blog</p>
        <p className="heading text-4xl text-white lg:text-5xl">News and Stories From CTRL</p>
      </div>
      <button type="button" onClick={onOpen} className="btn btn-primary relative">Open the Book</button>
    </div>
  );
}

function TitlePage({ side, count }) {
  return (
    <Paper side={side} className="flex flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-navy-lift">CTRL Club</p>
      <p className="heading text-4xl">The Blog</p>
      <p className="text-ink/70">{count === 0 ? "The first page is still being written." : `${count} ${count === 1 ? "page" : "pages"} to read.`}</p>
    </Paper>
  );
}

function Contents({ side, posts, onJump }) {
  return (
    <Paper side={side} className="flex flex-col p-6 lg:p-8">
      <p className="heading mb-4 text-3xl">Contents</p>
      {posts.length === 0 && <p className="text-ink/70">No posts here yet. Check back soon.</p>}
      <ol className="min-h-0 flex-1 overflow-y-auto">
        {posts.map((post, index) => (
          <li key={post.id}>
            <button type="button" onClick={() => onJump(index + FIRST_POST_INDEX)} className="flex min-h-11 w-full items-baseline gap-3 border-b border-ink/10 py-2 text-left transition-colors hover:text-navy-lift">
              <span className="min-w-0 flex-1 truncate font-display font-semibold">{post.title}</span>
              <span className="shrink-0 font-mono text-xs text-ink/60">Page {index + 1}</span>
            </button>
          </li>
        ))}
      </ol>
    </Paper>
  );
}

function Picture({ post }) {
  return post.images[0] ? (
    <img src={blogImageUrl(post.images[0])} alt={post.title} className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-navy-panel"><BrandMark /></div>
  );
}

function PostText({ post, number }) {
  return (
    <>
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-navy-lift">{formatDate(post.createdAt)}</p>
      <h2 className="heading mb-3 break-words text-2xl lg:text-4xl">{post.title}</h2>
      <p className="min-h-0 flex-1 overflow-hidden whitespace-pre-line break-words leading-relaxed text-ink/75 [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">{post.description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={postHref(post, number)} className={INK_BUTTON}>Enter Page</Link>
        <p className="font-mono text-xs text-ink/60">{post.images.length > 0 && `${picturesLabel(post.images.length)} · `}Page {number}</p>
      </div>
    </>
  );
}

function SinglePost({ post, number }) {
  return (
    <Paper side="single" className="flex flex-col">
      <div className="h-[42%] shrink-0"><Picture post={post} /></div>
      <div className="flex min-h-0 flex-1 flex-col p-5"><PostText post={post} number={number} /></div>
    </Paper>
  );
}

export default function Blog() {
  const requestedPage = Number(useSearchParams().get("page"));
  const reduced = useReducedMotion();
  const [posts, setPosts] = useState(null);
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(null);
  const [isWide, setIsWide] = useState(null);
  const touchStart = useRef(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 820px)");
    const update = () => setIsWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    getAllBlogPosts()
      .then((rows) => {
        setPosts(rows);
        // Coming back from a post reopens the book where the reader left it.
        if (requestedPage >= 1) setIndex(Math.min(requestedPage, rows.length) + FIRST_POST_INDEX - 1);
      })
      .catch((error) => {
        setPosts([]);
        toast.error(`Error fetching posts: ${error.message}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastIndex = (posts?.length ?? 0) + FIRST_POST_INDEX - 1;

  const goTo = (target) => {
    if (turn || target === index || target < 0 || target > lastIndex) return;
    if (reduced) setIndex(target);
    else setTurn({ from: index, to: target });
  };

  const finishTurn = () => {
    setIndex(turn.to);
    setTurn(null);
  };

  useEffect(() => {
    if (!posts) return;
    const url = index >= FIRST_POST_INDEX ? `/blog?page=${index - FIRST_POST_INDEX + 1}` : "/blog";
    window.history.replaceState(window.history.state, "", url);
  }, [index, posts]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Load the neighbouring pictures early so they are ready when the page turns.
  useEffect(() => {
    [index - 1, index + 1].forEach((neighbour) => {
      const image = posts?.[neighbour - FIRST_POST_INDEX]?.images[0];
      if (image) new Image().src = blogImageUrl(image);
    });
  }, [index, posts]);

  if (!posts || isWide === null) return <Loading />;

  const postAt = (i) => posts[i - FIRST_POST_INDEX];
  const leftOf = (i) => {
    if (i === 0) return null;
    if (i === 1) return <TitlePage side="left" count={posts.length} />;
    return <Paper side="left"><Picture post={postAt(i)} /></Paper>;
  };
  const rightOf = (i) => {
    if (i === 0) return <Cover side="right" onOpen={() => goTo(1)} />;
    if (i === 1) return <Contents side="right" posts={posts} onJump={goTo} />;
    return <Paper side="right" className="flex flex-col p-6 lg:p-10"><PostText post={postAt(i)} number={i - FIRST_POST_INDEX + 1} /></Paper>;
  };
  const singleOf = (i) => {
    if (i === 0) return <Cover side="single" onOpen={() => goTo(1)} />;
    if (i === 1) return <Contents side="single" posts={posts} onJump={goTo} />;
    return <SinglePost post={postAt(i)} number={i - FIRST_POST_INDEX + 1} />;
  };

  const forward = turn && turn.to > turn.from;
  const target = turn ? turn.to : index;

  const handleTouchEnd = (event) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) goTo(index + (dx < 0 ? 1 : -1));
  };

  return (
    <main className="page-bg flex min-h-screen flex-col px-4 pb-24 pt-6 md:px-5">
      <h1 className="sr-only">CTRL Blog</h1>
      <div className="page-enter mx-auto flex w-full max-w-[1150px] flex-1 flex-col">
        <Link href="/" className="btn btn-ghost mb-6 !min-h-11 self-start">&larr; Home</Link>

        {isWide ? (
          <motion.div
            animate={{ x: target === 0 ? "-25%" : 0 }}
            transition={reduced ? { duration: 0 } : TURN}
            initial={false}
            className="relative aspect-[3/2] max-h-[78vh] w-full [perspective:2400px]"
          >
            <div className="absolute inset-y-0 left-0 w-1/2 drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]">{turn ? leftOf(forward ? turn.from : turn.to) : leftOf(index)}</div>
            <div className="absolute inset-y-0 right-0 w-1/2 drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]">{turn ? rightOf(forward ? turn.to : turn.from) : rightOf(index)}</div>
            {turn && (
              <motion.div
                aria-hidden="true"
                initial={{ rotateY: forward ? 0 : -180 }}
                animate={{ rotateY: forward ? -180 : 0 }}
                transition={TURN}
                onAnimationComplete={finishTurn}
                className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-1/2 origin-left [transform-style:preserve-3d]"
              >
                <div className="absolute inset-0 [backface-visibility:hidden]">{rightOf(forward ? turn.from : turn.to)}</div>
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">{leftOf(forward ? turn.to : turn.from)}</div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div
            onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
            onTouchEnd={handleTouchEnd}
            className="relative h-[72vh] min-h-[30rem] w-full [perspective:1800px]"
          >
            <div className="absolute inset-0">{singleOf(turn ? (forward ? turn.to : turn.from) : index)}</div>
            {turn && (
              <motion.div
                aria-hidden="true"
                initial={forward ? { rotateY: 0, opacity: 1 } : { rotateY: -110, opacity: 0 }}
                animate={forward ? { rotateY: -110, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                transition={TURN}
                onAnimationComplete={finishTurn}
                className="pointer-events-none absolute inset-0 z-10 origin-left"
              >
                {singleOf(forward ? turn.from : turn.to)}
              </motion.div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" aria-label="Previous page" disabled={index === 0} onClick={() => goTo(index - 1)} className="btn-icon disabled:cursor-not-allowed disabled:opacity-30"><IoChevronBack aria-hidden="true" /></button>
          <p role="status" className="min-w-28 text-center font-mono text-xs uppercase tracking-[0.14em] text-sky-soft">
            {target === 0 ? "Cover" : target === 1 ? "Contents" : `Page ${target - FIRST_POST_INDEX + 1} of ${posts.length}`}
          </p>
          <button type="button" aria-label="Next page" disabled={index === lastIndex} onClick={() => goTo(index + 1)} className="btn-icon disabled:cursor-not-allowed disabled:opacity-30"><IoChevronForward aria-hidden="true" /></button>
        </div>
        {index > 1 && (
          <button type="button" onClick={() => goTo(1)} className="mt-3 self-center text-sm font-medium text-sky hover:underline">Back to Contents</button>
        )}
      </div>
    </main>
  );
}

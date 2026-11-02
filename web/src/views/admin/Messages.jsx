"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { FaTrashAlt } from "react-icons/fa";
import { IoArrowBack, IoMailOutline } from "react-icons/io5";
import FilterKeys from "@/components/molecule/FilterKeys";
import PageHeader from "@/components/molecule/PageHeader";
import PaginationRounded from "@/components/molecule/PaginationRounded";
import { deleteMessage, getMessageById, getMessages, getReplies, markRead, MESSAGES_CHANGED, sendReply } from "@/api/messages";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "replied", label: "Replied" },
];

const formatDate = (value) =>
  new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export function MessageRow({ message, active, onOpen }) {
  const unread = !message.read_at;
  return (
    <button
      type="button"
      onClick={() => onOpen(message.id)}
      aria-current={active ? "true" : undefined}
      className={`block w-full rounded-xl border p-4 text-left transition-colors ${active ? "border-sky bg-white/10" : "border-transparent hover:bg-white/5"}`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className={`flex min-w-0 items-center gap-2 font-display ${unread ? "font-bold text-white" : "font-semibold text-white/75"}`}>
          {unread && <span className="led shrink-0 text-sky" aria-label="Unread" />}
          <span className="truncate">{message.name}</span>
        </span>
        <span className="shrink-0 font-mono text-[0.68rem] text-white/55">{new Date(message.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
      </span>
      <span className={`mt-1 block truncate text-sm ${unread ? "text-white" : "text-white/70"}`}>{message.subject}</span>
      <span className="mt-1 flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-sm text-white/55">{message.message}</span>
        {message.replied_at && <span className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-go">Replied</span>}
      </span>
    </button>
  );
}

export function MessageThread({ message, replies, draft, onDraftChange, onSend, sending, onDelete, onBack }) {
  return (
    <article className="flex min-w-0 flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {onBack && (
            <button type="button" onClick={onBack} className="mb-3 inline-flex min-h-11 items-center gap-2 font-display font-semibold text-sky lg:hidden">
              <IoArrowBack aria-hidden="true" /> All messages
            </button>
          )}
          <h2 className="heading break-words text-2xl md:text-3xl">{message.subject}</h2>
          <p className="mt-2 font-mono text-xs text-white/55">{formatDate(message.created_at)}</p>
        </div>
        <button type="button" onClick={onDelete} aria-label="Delete message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stop/40 text-stop transition-colors hover:bg-stop/10">
          <FaTrashAlt aria-hidden="true" />
        </button>
      </div>

      <dl className="grid gap-3 rounded-xl bg-white/5 p-4 text-sm md:grid-cols-3">
        <div className="min-w-0"><dt className="field-label !mb-1">From</dt><dd className="break-words">{message.name}</dd></div>
        <div className="min-w-0"><dt className="field-label !mb-1">Email</dt><dd className="break-words"><a href={`mailto:${message.email}`} className="text-sky hover:underline">{message.email}</a></dd></div>
        <div className="min-w-0"><dt className="field-label !mb-1">Phone</dt><dd className="break-words"><a href={`tel:${message.phone_number}`} className="text-sky hover:underline">{message.phone_number}</a></dd></div>
      </dl>

      <p className="whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>

      {replies.map((reply) => (
        <div key={reply.id} className="rounded-xl border-l-4 border-sky bg-sky/10 p-4">
          <p className="mb-2 font-mono text-xs text-sky-soft">{reply.admin_name} replied, {formatDate(reply.created_at)}</p>
          <p className="whitespace-pre-wrap break-words leading-relaxed">{reply.body}</p>
        </div>
      ))}

      <form onSubmit={onSend} className="border-t border-sky/15 pt-5">
        <label htmlFor="message-reply" className="field-label">Reply to {message.email}</label>
        <textarea id="message-reply" required maxLength={10000} value={draft} onChange={(event) => onDraftChange(event.target.value)} className="field h-36 resize-y" />
        <button type="submit" disabled={sending || !draft.trim()} className="btn btn-primary mt-4 w-full md:w-auto">
          {sending ? "Sending..." : "Send Reply"}
        </button>
      </form>
    </article>
  );
}

export default function Messages() {
  const router = useRouter();
  const selectedId = useSearchParams().get("id");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [replies, setReplies] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const loadList = useCallback(() => {
    return getMessages(page, filter)
      .then((result) => {
        setMessages(result.messages);
        setPageCount(result.pageCount);
      })
      .catch((error) => toast.error(`Error fetching messages: ${error.message}`))
      .finally(() => setLoaded(true));
  }, [page, filter]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    setDraft("");
    if (!selectedId) {
      setSelected(null);
      setReplies([]);
      return;
    }
    let active = true;
    Promise.all([getMessageById(selectedId), getReplies(selectedId)])
      .then(async ([message, messageReplies]) => {
        if (!active) return;
        if (!message) {
          toast.error("Message not found");
          router.replace("/admin/messages");
          return;
        }
        setSelected(message);
        setReplies(messageReplies);
        if (!message.read_at) {
          const readAt = await markRead(message.id);
          setMessages((previous) => previous.map((item) => (item.id === message.id ? { ...item, read_at: readAt } : item)));
          window.dispatchEvent(new Event(MESSAGES_CHANGED));
        }
      })
      .catch((error) => toast.error(error.message));
    return () => {
      active = false;
    };
  }, [selectedId, router]);

  const openMessage = (id) => router.push(`/admin/messages?id=${id}`, { scroll: false });
  const closeMessage = () => router.push("/admin/messages", { scroll: false });

  const handleFilterChange = (value) => {
    setFilter(value);
    setPage(1);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      const { reply } = await sendReply(selected.id, draft);
      setReplies((previous) => [...previous, reply]);
      setDraft("");
      toast.success("Reply sent");
      loadList();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this message and its replies?")) return;
    try {
      await deleteMessage(selected.id);
      toast.success("Message deleted");
      closeMessage();
      loadList();
      window.dispatchEvent(new Event(MESSAGES_CHANGED));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader title="Messages" description="Messages from the contact form. Replies go to the sender by email.">
        <FilterKeys label="Filter Messages" options={FILTERS} value={filter} onChange={handleFilterChange} />
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section aria-label="Message list" className={`panel !p-2 lg:self-start ${selectedId ? "hidden lg:block" : ""}`}>
          {messages.map((message) => (
            <MessageRow key={message.id} message={message} active={message.id === selectedId} onOpen={openMessage} />
          ))}
          {loaded && messages.length === 0 && <p className="px-4 py-14 text-center text-white/60">No messages here yet.</p>}
          <PaginationRounded count={pageCount} page={page} onChange={(_event, value) => setPage(value)} />
        </section>

        <section aria-label="Selected message" className={`panel min-w-0 ${selectedId ? "" : "hidden lg:block"}`}>
          {selected ? (
            <MessageThread
              message={selected}
              replies={replies}
              draft={draft}
              onDraftChange={setDraft}
              onSend={handleSend}
              sending={sending}
              onDelete={handleDelete}
              onBack={closeMessage}
            />
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center text-white/60">
              <IoMailOutline className="text-4xl text-sky" aria-hidden="true" />
              <p>{selectedId ? "Loading..." : "Select a message to read and reply."}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

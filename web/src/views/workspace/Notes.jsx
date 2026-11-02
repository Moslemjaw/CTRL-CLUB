"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { IoAttach, IoClose, IoDownloadOutline, IoGlobeOutline, IoLockClosedOutline, IoPeopleOutline, IoSearch } from "react-icons/io5";
import { useAuth } from "@/components/AuthProvider";
import FilterKeys from "@/components/molecule/FilterKeys";
import PageHeader from "@/components/molecule/PageHeader";
import {
  addNoteAttachment,
  createNote,
  deleteNote,
  getAttachmentLink,
  getNote,
  getNotes,
  getTeamMembers,
  removeNoteAttachment,
  setNoteShares,
  updateNote,
} from "@/api/workspace";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 10;
const ACCEPTED_FILES = ".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.csv,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
const SHARING_OPTIONS = [
  { value: "team", label: "Whole Team" },
  { value: "selected", label: "Specific Members" },
  { value: "private", label: "Only Me" },
];

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function SharingFields({ members, currentUserId, visibility, shareWith, onVisibilityChange, onShareWithChange, error }) {
  const others = members.filter((member) => member.id !== currentUserId);
  const toggle = (id) =>
    onShareWithChange(shareWith.includes(id) ? shareWith.filter((value) => value !== id) : [...shareWith, id]);

  return (
    <div>
      <p className="field-label">Who can see this</p>
      <FilterKeys label="Who can see this note" options={SHARING_OPTIONS} value={visibility} onChange={onVisibilityChange} />
      {visibility === "selected" && (
        <fieldset className="mt-3 rounded-xl border border-sky/20 p-3">
          <legend className="px-1 text-sm text-white/70">Share with</legend>
          {others.length === 0 ? (
            <p className="p-2 text-sm text-white/60">There are no other team members yet.</p>
          ) : (
            <div className="grid gap-1 md:grid-cols-2">
              {others.map((member) => (
                <label key={member.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-white/5">
                  <input type="checkbox" checked={shareWith.includes(member.id)} onChange={() => toggle(member.id)} className="h-5 w-5 accent-sky" />
                  <span className="min-w-0 break-words">{member.name}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      )}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}

function VisibilityBadge({ note, memberName }) {
  if (note.visibility === "private") {
    return <span className="inline-flex items-center gap-1.5 text-xs text-sky-soft"><IoLockClosedOutline aria-hidden="true" /> Only you</span>;
  }
  if (note.visibility === "selected") {
    const names = note.sharedWith.map(memberName).filter(Boolean);
    return (
      <span className="inline-flex items-start gap-1.5 text-xs text-sky-soft">
        <IoPeopleOutline className="mt-0.5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 break-words">{names.length ? `Shared with ${names.join(", ")}` : "Shared with selected members"}</span>
      </span>
    );
  }
  return <span className="inline-flex items-center gap-1.5 text-xs text-sky-soft"><IoGlobeOutline aria-hidden="true" /> Whole team</span>;
}

export function NoteCard({ note, memberName, canDelete, onEdit, onDelete, onDownload }) {
  return (
    <article className="panel min-w-0 !p-5">
      <h2 className="break-words font-display text-xl font-semibold">{note.title}</h2>
      <p className="mt-1 text-xs text-white/60">
        {[memberName(note.createdBy), new Date(note.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-1.5"><VisibilityBadge note={note} memberName={memberName} /></p>
      {note.body && <p className="mt-3 whitespace-pre-wrap break-words text-white/80">{note.body}</p>}
      {note.attachments.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1.5" aria-label="Attachments">
          {note.attachments.map((file) => (
            <li key={file.id}>
              <button type="button" onClick={() => onDownload(file)} aria-label={`Download ${file.name}`} className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-sky/20 px-3 py-1.5 text-left text-sm transition-colors hover:border-sky hover:bg-white/5">
                <IoAttach className="shrink-0 text-lg text-sky" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="shrink-0 font-mono text-xs text-white/55">{formatSize(file.size)}</span>
                <IoDownloadOutline className="shrink-0 text-lg text-sky" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex gap-4 text-sm font-medium">
        <button type="button" onClick={() => onEdit(note)} className="min-h-10 text-sky hover:underline">Edit</button>
        {canDelete && <button type="button" onClick={() => onDelete(note)} className="min-h-10 text-stop hover:underline">Delete</button>}
      </div>
    </article>
  );
}

export default function Notes() {
  const { userData, role } = useAuth();
  const fileInputRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [members, setMembers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");

  useEffect(() => {
    Promise.all([getNotes(), getTeamMembers()])
      .then(([noteRows, memberRows]) => {
        setNotes(noteRows);
        setMembers(memberRows);
      })
      .catch((error) => toast.error(`Error fetching notes: ${error.message}`))
      .finally(() => setLoaded(true));
  }, []);

  const memberName = (id) => members.find((member) => member.id === id)?.name;
  const canManageSharing = !editingNote || editingNote.createdBy === userData?.id;

  const closeForm = () => {
    setEditingNote(null);
    setFormOpen(false);
    setPendingFiles([]);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: { title: "", body: "", visibility: "team", shareWith: [] },
    validationSchema: Yup.object({
      title: Yup.string().trim().max(200, "Title is too long").required("Title is required"),
      body: Yup.string().max(20000, "Note is too long"),
      shareWith: Yup.array().when("visibility", {
        is: "selected",
        then: (schema) => schema.min(1, "Choose at least one member, or set this note to Only Me"),
      }),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const sharing = canManageSharing ? { visibility: values.visibility } : {};
        let noteId = editingNote?.id;
        if (noteId) await updateNote(noteId, { title: values.title, body: values.body, ...sharing });
        else noteId = await createNote({ title: values.title, body: values.body, visibility: values.visibility });
        if (canManageSharing && values.visibility === "selected") await setNoteShares(noteId, values.shareWith);

        // The note is already saved, so a failed file doesn't lose the text.
        const failed = [];
        for (const file of pendingFiles) {
          try {
            await addNoteAttachment(noteId, file);
          } catch {
            failed.push(file.name);
          }
        }
        if (failed.length) toast.error(`Could not attach ${failed.join(", ")}. Check the file type and try again.`);

        const saved = await getNote(noteId);
        setNotes((previous) => [saved, ...previous.filter((note) => note.id !== saved.id)]);
        closeForm();
      } catch (error) {
        toast.error(error.message || "Could not save the note.");
      }
      setSubmitting(false);
    },
  });

  const startEdit = (note) => {
    setEditingNote(note);
    setPendingFiles([]);
    setFormOpen(true);
    formik.setValues({ title: note.title, body: note.body, visibility: note.visibility, shareWith: note.sharedWith });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (note) => {
    if (!window.confirm("Are you sure you want to delete this note and its attachments?")) return;
    try {
      await deleteNote(note);
      setNotes((previous) => previous.filter((item) => item.id !== note.id));
      if (editingNote?.id === note.id) closeForm();
    } catch (error) {
      toast.error(error.message || "Could not delete the note.");
    }
  };

  const handleFiles = (event) => {
    const chosen = Array.from(event.target.files);
    event.target.value = "";
    const tooBig = chosen.filter((file) => file.size > MAX_FILE_BYTES);
    if (tooBig.length) toast.error(`Files must be 10 MB or smaller: ${tooBig.map((file) => file.name).join(", ")}`);
    const room = MAX_FILES - (editingNote?.attachments.length ?? 0) - pendingFiles.length;
    const allowed = chosen.filter((file) => file.size <= MAX_FILE_BYTES);
    if (allowed.length > room) toast.error(`A note can have up to ${MAX_FILES} attachments.`);
    setPendingFiles((previous) => [...previous, ...allowed.slice(0, Math.max(room, 0))]);
  };

  const handleRemoveAttachment = async (file) => {
    if (!window.confirm(`Remove ${file.name}?`)) return;
    try {
      await removeNoteAttachment(file);
      const saved = await getNote(editingNote.id);
      setEditingNote(saved);
      setNotes((previous) => previous.map((note) => (note.id === saved.id ? saved : note)));
    } catch (error) {
      toast.error(error.message || "Could not remove the attachment.");
    }
  };

  const handleDownload = async (file) => {
    try {
      window.location.href = await getAttachmentLink(file);
    } catch (error) {
      toast.error(error.message || "Could not download the file.");
    }
  };

  const visibleNotes = useMemo(() => {
    const text = search.trim().toLowerCase();
    return notes.filter((note) => {
      if (authorFilter !== "all" && note.createdBy !== authorFilter) return false;
      if (!text) return true;
      return [note.title, note.body, ...note.attachments.map((file) => file.name)].some((value) => value.toLowerCase().includes(text));
    });
  }, [notes, search, authorFilter]);

  const canRemoveAttachment = (file) =>
    role === "admin" || file.uploadedBy === userData?.id || editingNote?.createdBy === userData?.id;

  return (
    <div>
      <PageHeader title="Notes" description="Share with the whole team, with specific members, or keep them to yourself.">
        {!formOpen && <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary !min-h-11 !py-2">New Note</button>}
      </PageHeader>

      {formOpen && (
        <div className="panel mb-6">
          <h2 className="heading mb-5 text-2xl">{editingNote ? "Edit Note" : "New Note"}</h2>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="note-title" className="field-label">Title</label>
              <input id="note-title" name="title" value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`field ${formik.touched.title && formik.errors.title ? "field-invalid" : ""}`} />
              {formik.touched.title && formik.errors.title && <div className="field-error">{formik.errors.title}</div>}
            </div>
            <div>
              <label htmlFor="note-body" className="field-label">Note</label>
              <textarea id="note-body" name="body" rows={4} value={formik.values.body} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`field ${formik.touched.body && formik.errors.body ? "field-invalid" : ""}`} />
              {formik.touched.body && formik.errors.body && <div className="field-error">{formik.errors.body}</div>}
            </div>

            <div>
              <p className="field-label">Attachments</p>
              <ul className="mb-2 flex flex-col gap-1.5 empty:hidden">
                {editingNote?.attachments.map((file) => (
                  <li key={file.id} className="flex min-h-11 items-center gap-2 rounded-lg border border-sky/20 px-3 py-1.5 text-sm">
                    <IoAttach className="shrink-0 text-lg text-sky" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="shrink-0 font-mono text-xs text-white/55">{formatSize(file.size)}</span>
                    {canRemoveAttachment(file) && (
                      <button type="button" onClick={() => handleRemoveAttachment(file)} aria-label={`Remove ${file.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center text-lg text-stop"><IoClose aria-hidden="true" /></button>
                    )}
                  </li>
                ))}
                {pendingFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex min-h-11 items-center gap-2 rounded-lg border border-dashed border-sky/30 px-3 py-1.5 text-sm">
                    <IoAttach className="shrink-0 text-lg text-sky" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="shrink-0 font-mono text-xs text-white/55">{formatSize(file.size)}</span>
                    <button type="button" onClick={() => setPendingFiles((previous) => previous.filter((_, position) => position !== index))} aria-label={`Remove ${file.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center text-lg text-stop"><IoClose aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
              <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_FILES} onChange={handleFiles} className="hidden" aria-label="Choose files to attach" />
              <button type="button" onClick={() => fileInputRef.current.click()} className="btn btn-ghost !min-h-11 !py-2 text-sm"><IoAttach aria-hidden="true" /> Add Files</button>
              <p className="mt-2 text-sm text-white/55">Images, PDF, Office, text, CSV or ZIP. Up to 10 MB each.</p>
            </div>

            {canManageSharing ? (
              <SharingFields
                members={members}
                currentUserId={userData?.id}
                visibility={formik.values.visibility}
                shareWith={formik.values.shareWith}
                onVisibilityChange={(value) => formik.setFieldValue("visibility", value)}
                onShareWithChange={(value) => formik.setFieldValue("shareWith", value)}
                error={formik.submitCount > 0 ? formik.errors.shareWith : null}
              />
            ) : (
              <p className="text-sm text-white/60">Only the author can change who sees this note.</p>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={formik.isSubmitting} className="btn btn-primary">
                {formik.isSubmitting ? "Saving..." : editingNote ? "Save Note" : "Add Note"}
              </button>
              <button type="button" onClick={closeForm} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="relative">
          <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-sky" aria-hidden="true" />
          <input type="search" aria-label="Search notes" placeholder="Search titles, notes and file names" value={search} onChange={(event) => setSearch(event.target.value)} className="field !pl-11" />
        </div>
        <select aria-label="Filter by author" value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} className="field">
          <option value="all">All Authors</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>{member.id === userData?.id ? `${member.name} (me)` : member.name}</option>
          ))}
        </select>
      </div>

      {loaded && notes.length === 0 && <p className="panel text-center text-white/60">No notes yet.</p>}
      {loaded && notes.length > 0 && visibleNotes.length === 0 && <p className="panel text-center text-white/60">No notes match your search.</p>}
      <div className="grid grid-cols-1 items-start gap-4 2md:grid-cols-2 xl:grid-cols-3">
        {visibleNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            memberName={memberName}
            canDelete={role === "admin" || note.createdBy === userData?.id}
            onEdit={startEdit}
            onDelete={handleDelete}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </div>
  );
}

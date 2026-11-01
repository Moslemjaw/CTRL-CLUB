"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/molecule/PageHeader";
import { createNote, deleteNote, getNotes, getTeamMembers, updateNote } from "@/api/workspace";

export default function Notes() {
  const { userData, role } = useAuth();
  const [notes, setNotes] = useState([]);
  const [members, setMembers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    Promise.all([getNotes(), getTeamMembers()])
      .then(([noteRows, memberRows]) => {
        setNotes(noteRows);
        setMembers(memberRows);
      })
      .catch((error) => toast.error(`Error fetching notes: ${error.message}`))
      .finally(() => setLoaded(true));
  }, []);

  const formik = useFormik({
    initialValues: { title: "", body: "" },
    validationSchema: Yup.object({
      title: Yup.string().trim().max(200, "Title is too long").required("Title is required"),
      body: Yup.string().max(20000, "Note is too long"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const saved = editingId ? await updateNote(editingId, values) : await createNote(values);
        setNotes((previous) => [saved, ...previous.filter((note) => note.id !== saved.id)]);
        setEditingId(null);
        setFormOpen(false);
        resetForm();
      } catch (error) {
        toast.error(error.message || "Could not save the note.");
      }
      setSubmitting(false);
    },
  });

  const startEdit = (note) => {
    setEditingId(note.id);
    setFormOpen(true);
    formik.setValues({ title: note.title, body: note.body });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormOpen(false);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(id);
      setNotes((previous) => previous.filter((note) => note.id !== id));
      if (editingId === id) cancelEdit();
    } catch (error) {
      toast.error(error.message || "Could not delete the note.");
    }
  };

  const memberName = (id) => members.find((member) => member.id === id)?.name;

  return (
    <div>
      <PageHeader title="Notes" description="Shared with the whole team.">
        {!formOpen && <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary !min-h-11 !py-2">New Note</button>}
      </PageHeader>

      {formOpen && (
        <div className="panel mb-6">
          <h2 className="heading mb-5 text-2xl">{editingId ? "Edit Note" : "New Note"}</h2>
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
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={formik.isSubmitting} className="btn btn-primary">
                {formik.isSubmitting ? "Saving..." : editingId ? "Save Note" : "Add Note"}
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loaded && notes.length === 0 && <p className="panel text-center text-white/60">No notes yet.</p>}
      <div className="grid items-start gap-4 2md:grid-cols-2 xl:grid-cols-3">
        {notes.map((note) => (
          <article key={note.id} className="panel !p-5">
            <h2 className="break-words font-display text-xl font-semibold">{note.title}</h2>
            <p className="mt-1 text-xs text-sky-soft">
              {[memberName(note.createdBy), new Date(note.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })].filter(Boolean).join(" · ")}
            </p>
            {note.body && <p className="mt-3 whitespace-pre-wrap break-words text-white/80">{note.body}</p>}
            <div className="mt-4 flex gap-4 text-sm font-medium">
              <button type="button" onClick={() => startEdit(note)} className="text-sky hover:underline">Edit</button>
              {(role === "admin" || note.createdBy === userData?.id) && (
                <button type="button" onClick={() => handleDelete(note.id)} className="text-stop hover:underline">Delete</button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

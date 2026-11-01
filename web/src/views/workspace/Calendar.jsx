"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/molecule/PageHeader";
import { createCalendarEntry, deleteCalendarEntry, getCalendarEntries, getClubEvents, updateCalendarEntry } from "@/api/workspace";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dayKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// datetime-local inputs work in local time, without a timezone.
const toLocalInput = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  return `${dayKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const formatTime = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export default function Calendar() {
  const { userData, role } = useAuth();
  const today = dayKey(new Date());
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(today);
  const [entries, setEntries] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    Promise.all([getCalendarEntries(month, nextMonth), getClubEvents(month, nextMonth)])
      .then(([entryRows, eventRows]) => {
        if (!active) return;
        setEntries(entryRows);
        setClubEvents(eventRows);
      })
      .catch((error) => toast.error(`Error fetching the calendar: ${error.message}`));
    return () => {
      active = false;
    };
  }, [month]);

  const days = useMemo(() => {
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const blanks = Array(month.getDay()).fill(null);
    const dates = Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1));
    return [...blanks, ...dates];
  }, [month]);

  const itemsByDay = useMemo(() => {
    const items = {};
    const add = (iso, item) => {
      const key = dayKey(new Date(iso));
      (items[key] ??= []).push({ ...item, time: iso });
    };
    entries.forEach((entry) => add(entry.startsAt, { ...entry, kind: "entry" }));
    clubEvents.forEach((event) => add(event.date, { ...event, kind: "event" }));
    Object.values(items).forEach((list) => list.sort((a, b) => new Date(a.time) - new Date(b.time)));
    return items;
  }, [entries, clubEvents]);

  const formik = useFormik({
    initialValues: { title: "", description: "", location: "", startsAt: "", endsAt: "" },
    validationSchema: Yup.object({
      title: Yup.string().trim().max(200, "Title is too long").required("Title is required"),
      description: Yup.string().max(5000, "Description is too long"),
      location: Yup.string().max(200, "Location is too long"),
      startsAt: Yup.string().required("Start time is required"),
      endsAt: Yup.string().test("after-start", "End time must be after the start", function (value) {
        return !value || new Date(value) >= new Date(this.parent.startsAt);
      }),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const saved = editingId ? await updateCalendarEntry(editingId, values) : await createCalendarEntry(values);
        const start = new Date(saved.startsAt);
        const inMonth = start.getFullYear() === month.getFullYear() && start.getMonth() === month.getMonth();
        setEntries((previous) => [...previous.filter((entry) => entry.id !== saved.id), ...(inMonth ? [saved] : [])]);
        setSelectedDay(dayKey(start));
        setEditingId(null);
        setFormOpen(false);
        resetForm();
      } catch (error) {
        toast.error(error.message || "Could not save the entry.");
      }
      setSubmitting(false);
    },
  });

  const startNew = () => {
    setFormOpen(true);
    formik.setFieldValue("startsAt", `${selectedDay}T09:00`);
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setFormOpen(true);
    formik.setValues({
      title: entry.title,
      description: entry.description,
      location: entry.location,
      startsAt: toLocalInput(entry.startsAt),
      endsAt: toLocalInput(entry.endsAt),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormOpen(false);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteCalendarEntry(id);
      setEntries((previous) => previous.filter((entry) => entry.id !== id));
      if (editingId === id) cancelEdit();
    } catch (error) {
      toast.error(error.message || "Could not delete the entry.");
    }
  };

  const changeMonth = (offset) => setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  const selectedItems = itemsByDay[selectedDay] ?? [];

  return (
    <div>
      <PageHeader title="Calendar" description="Team entries and club events.">
        {!formOpen && <button type="button" onClick={startNew} className="btn btn-primary !min-h-11 !py-2">New Entry</button>}
      </PageHeader>

      {formOpen && (
        <section className="panel mb-6" aria-label={editingId ? "Edit entry" : "New entry"}>
          <h2 className="heading mb-4 text-2xl">{editingId ? "Edit Entry" : "New Entry"}</h2>
          <form onSubmit={formik.handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="entry-title" className="field-label">Title</label>
              <input id="entry-title" name="title" value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`field ${formik.touched.title && formik.errors.title ? "field-invalid" : ""}`} />
              {formik.touched.title && formik.errors.title && <div className="field-error">{formik.errors.title}</div>}
            </div>
            <div>
              <label htmlFor="entry-start" className="field-label">Starts</label>
              <input id="entry-start" type="datetime-local" name="startsAt" value={formik.values.startsAt} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`field ${formik.touched.startsAt && formik.errors.startsAt ? "field-invalid" : ""}`} />
              {formik.touched.startsAt && formik.errors.startsAt && <div className="field-error">{formik.errors.startsAt}</div>}
            </div>
            <div>
              <label htmlFor="entry-end" className="field-label">Ends (optional)</label>
              <input id="entry-end" type="datetime-local" name="endsAt" value={formik.values.endsAt} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`field ${formik.touched.endsAt && formik.errors.endsAt ? "field-invalid" : ""}`} />
              {formik.touched.endsAt && formik.errors.endsAt && <div className="field-error">{formik.errors.endsAt}</div>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="entry-location" className="field-label">Location</label>
              <input id="entry-location" name="location" value={formik.values.location} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`field ${formik.touched.location && formik.errors.location ? "field-invalid" : ""}`} />
              {formik.touched.location && formik.errors.location && <div className="field-error">{formik.errors.location}</div>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="entry-description" className="field-label">Description</label>
              <textarea id="entry-description" name="description" rows={2} value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`field ${formik.touched.description && formik.errors.description ? "field-invalid" : ""}`} />
              {formik.touched.description && formik.errors.description && <div className="field-error">{formik.errors.description}</div>}
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button type="submit" disabled={formik.isSubmitting} className="btn btn-primary">
                {formik.isSubmitting ? "Saving..." : editingId ? "Save Entry" : "Add Entry"}
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </section>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="panel">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="heading text-2xl md:text-3xl">{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
            <div className="flex shrink-0 gap-2">
              <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="btn-icon"><IoChevronBack /></button>
              <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="btn-icon"><IoChevronForward /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="pb-1 text-center font-mono text-xs uppercase tracking-[0.12em] text-sky">{weekday}</div>
            ))}
            {days.map((date, index) => {
              if (!date) return <div key={`blank-${index}`} />;
              const key = dayKey(date);
              const count = itemsByDay[key]?.length ?? 0;
              const selected = key === selectedDay;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${date.toLocaleDateString(undefined, { day: "numeric", month: "long" })}, ${count} ${count === 1 ? "item" : "items"}`}
                  onClick={() => setSelectedDay(key)}
                  className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border font-display font-semibold transition-colors md:min-h-16 ${selected ? "border-white bg-white text-ink" : key === today ? "border-sky text-white hover:bg-white/5" : "border-sky/10 text-white/80 hover:bg-white/5"}`}
                >
                  {date.getDate()}
                  <span className={`h-1.5 w-1.5 rounded-full ${count ? (selected ? "bg-ink" : "bg-sky") : "bg-transparent"}`} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>

        <section className="panel" aria-label="Selected day">
          <h2 className="heading mb-4 text-2xl">{new Date(`${selectedDay}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</h2>
          {selectedItems.length === 0 && <p className="text-white/60">Nothing scheduled.</p>}
          <div className="space-y-3">
            {selectedItems.map((item) => (
              <article key={`${item.kind}-${item.id}`} className="rounded-xl border border-sky/15 bg-white/[0.04] p-4">
                <p className="eyebrow mb-1">{item.kind === "event" ? "Club Event" : "Team"} · {formatTime(item.time)}{item.endsAt ? ` to ${formatTime(item.endsAt)}` : ""}</p>
                <h3 className="break-words font-display font-semibold">{item.title}</h3>
                {item.location && <p className="text-sm text-sky-soft">{item.location}</p>}
                {item.description && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-white/70">{item.description}</p>}
                {item.kind === "entry" && (
                  <div className="mt-3 flex gap-4 text-sm font-medium">
                    <button type="button" onClick={() => startEdit(item)} className="text-sky hover:underline">Edit</button>
                    {(role === "admin" || item.createdBy === userData?.id) && (
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-stop hover:underline">Delete</button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

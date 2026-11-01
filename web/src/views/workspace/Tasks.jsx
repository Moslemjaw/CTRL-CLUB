"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "@/components/AuthProvider";
import PageHeader from "@/components/molecule/PageHeader";
import { createTask, deleteTask, getTasks, getTeamMembers, updateTask } from "@/api/workspace";

const COLUMNS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const EMPTY = { title: "", description: "", status: "todo", dueDate: "", assignedTo: "" };

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function Tasks() {
  const { userData, role } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    Promise.all([getTasks(), getTeamMembers()])
      .then(([taskRows, memberRows]) => {
        setTasks(taskRows);
        setMembers(memberRows);
      })
      .catch((error) => toast.error(`Error fetching tasks: ${error.message}`))
      .finally(() => setLoaded(true));
  }, []);

  const formik = useFormik({
    initialValues: EMPTY,
    validationSchema: Yup.object({
      title: Yup.string().trim().max(200, "Title is too long").required("Title is required"),
      description: Yup.string().max(5000, "Description is too long"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (editingId) {
          const saved = await updateTask(editingId, values);
          setTasks((previous) => previous.map((task) => (task.id === saved.id ? saved : task)));
        } else {
          const saved = await createTask(values);
          setTasks((previous) => [saved, ...previous]);
        }
        setEditingId(null);
        setFormOpen(false);
        resetForm();
      } catch (error) {
        toast.error(error.message || "Could not save the task.");
      }
      setSubmitting(false);
    },
  });

  const startEdit = (task) => {
    setEditingId(task.id);
    setFormOpen(true);
    formik.setValues({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate ?? "",
      assignedTo: task.assignedTo ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormOpen(false);
    formik.resetForm();
  };

  const moveTask = async (task, status) => {
    try {
      const saved = await updateTask(task.id, { ...task, status });
      setTasks((previous) => previous.map((item) => (item.id === saved.id ? saved : item)));
    } catch (error) {
      toast.error(error.message || "Could not update the task.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks((previous) => previous.filter((task) => task.id !== id));
      if (editingId === id) cancelEdit();
    } catch (error) {
      toast.error(error.message || "Could not delete the task.");
    }
  };

  const memberName = (id) => members.find((member) => member.id === id)?.name;

  return (
    <div>
      <PageHeader title="Tasks" description="Shared with the whole team.">
        {!formOpen && <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary !min-h-11 !py-2">New Task</button>}
      </PageHeader>

      {formOpen && (
        <div className="panel mb-6">
          <h2 className="heading mb-5 text-2xl">{editingId ? "Edit Task" : "New Task"}</h2>
          <form onSubmit={formik.handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="task-title" className="field-label">Title</label>
              <input id="task-title" name="title" value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`field ${formik.touched.title && formik.errors.title ? "field-invalid" : ""}`} />
              {formik.touched.title && formik.errors.title && <div className="field-error">{formik.errors.title}</div>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="task-description" className="field-label">Description</label>
              <textarea id="task-description" name="description" rows={2} value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`field ${formik.touched.description && formik.errors.description ? "field-invalid" : ""}`} />
              {formik.touched.description && formik.errors.description && <div className="field-error">{formik.errors.description}</div>}
            </div>
            <div>
              <label htmlFor="task-due" className="field-label">Due Date</label>
              <input id="task-due" type="date" name="dueDate" value={formik.values.dueDate} onChange={formik.handleChange} className="field" />
            </div>
            <div>
              <label htmlFor="task-assignee" className="field-label">Assigned To</label>
              <select id="task-assignee" name="assignedTo" value={formik.values.assignedTo} onChange={formik.handleChange} className="field">
                <option value="">Nobody</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button type="submit" disabled={formik.isSubmitting} className="btn btn-primary">
                {formik.isSubmitting ? "Saving..." : editingId ? "Save Task" : "Add Task"}
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loaded && (
        <div className="grid items-start gap-4 2md:grid-cols-3">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.value);
            return (
              <section key={column.value} aria-label={column.label} className="panel !p-4">
                <h2 className="eyebrow mb-4">{column.label} ({columnTasks.length})</h2>
                <div className="space-y-3">
                  {columnTasks.length === 0 && <p className="text-sm text-white/60">No tasks here.</p>}
                  {columnTasks.map((task) => (
                    <article key={task.id} className="rounded-xl border border-sky/15 bg-white/[0.04] p-4">
                      <h3 className="break-words font-display font-semibold">{task.title}</h3>
                      {task.description && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-white/70">{task.description}</p>}
                      <p className="mt-2 text-xs text-sky-soft">
                        {[task.dueDate && `Due ${formatDate(task.dueDate)}`, memberName(task.assignedTo)].filter(Boolean).join(" · ")}
                      </p>
                      <label htmlFor={`task-status-${task.id}`} className="sr-only">Status of {task.title}</label>
                      <select id={`task-status-${task.id}`} value={task.status} onChange={(event) => moveTask(task, event.target.value)} className="field mt-3 !min-h-10 !py-2 text-sm">
                        {COLUMNS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <div className="mt-3 flex gap-4 text-sm font-medium">
                        <button type="button" onClick={() => startEdit(task)} className="text-sky hover:underline">Edit</button>
                        {(role === "admin" || task.createdBy === userData?.id) && (
                          <button type="button" onClick={() => handleDelete(task.id)} className="text-stop hover:underline">Delete</button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

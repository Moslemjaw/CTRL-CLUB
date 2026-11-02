"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "react-toastify";
import { sendContactForm } from "@/api/contact";
import CircuitRings from "@/components/brand/CircuitRings";
import KeyCap from "@/components/brand/KeyCap";

const MESSAGE_LIMIT = 5000;
const FIELDS = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phoneNumber", label: "Phone Number", type: "tel", autoComplete: "tel" },
];
const TOPICS = ["Events and Tickets", "Joining CTRL", "Partnerships"];

const ContactForm = () => {
  const reduced = useReducedMotion();
  const [typing, setTyping] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  const formik = useFormik({
    initialValues: { name: "", email: "", phoneNumber: "", subject: "", message: "" },
    validationSchema: Yup.object({
      name: Yup.string().trim().max(200, "Name is too long").required("Please enter your name"),
      email: Yup.string().trim().email("Please enter a valid email address").max(320, "Email is too long").required("Please enter your email"),
      phoneNumber: Yup.string().trim().max(50, "Phone number is too long").required("Please enter your phone number"),
      subject: Yup.string().trim().max(300, "Subject is too long").required("Please choose a topic or enter a subject"),
      message: Yup.string().trim().max(MESSAGE_LIMIT, "Message is too long").required("Please enter your message"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await sendContactForm(values);
        setSentTo(values.email.trim());
        resetForm();
      } catch {
        toast.error("Failed to send message. Please try again.");
      }
    },
  });

  const invalid = (name) => formik.touched[name] && formik.errors[name];
  const fieldProps = (name) => ({
    id: `contact-${name}`,
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    "aria-invalid": invalid(name) ? true : undefined,
    "aria-describedby": invalid(name) ? `contact-${name}-error` : undefined,
    className: `field ${invalid(name) ? "field-invalid" : ""}`,
  });
  const fieldError = (name) => invalid(name) && <div id={`contact-${name}-error`} className="field-error">{formik.errors[name]}</div>;

  return (
    <section id="contact" className="relative overflow-hidden bg-navy-deep px-4 py-20 md:px-5 lg:py-32">
      <motion.div
        initial={reduced ? false : { y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto grid max-w-[1200px] overflow-hidden rounded-3xl border border-sky/20 bg-navy-panel/70 shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      >
        <div className="relative flex flex-col overflow-hidden border-b border-sky/20 bg-gradient-to-br from-navy-lift to-navy-deep p-6 md:p-10 lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute -bottom-40 -right-48 w-[34rem] opacity-30" aria-hidden="true">
            <CircuitRings className="h-full w-full" delay={0} />
          </div>
          <div className="relative">
            <p className="eyebrow mb-4">Contact Us</p>
            <h2 className="heading text-4xl md:text-5xl xl:text-6xl">Get In Touch With Us</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
              Have a question about an event, or an idea for the club? Send us a message and we will reply to your email.
            </p>
          </div>
          <div className="relative mt-8 w-28 lg:mt-auto lg:w-44 lg:pt-12" aria-hidden="true">
            <KeyCap pressed={typing || formik.isSubmitting} />
          </div>
        </div>

        <div className="p-6 md:p-10">
          <AnimatePresence mode="wait" initial={false}>
            {sentTo ? (
              <motion.div key="sent" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex h-full min-h-80 flex-col items-center justify-center text-center">
                <span className="led mb-5 text-go" aria-hidden="true" />
                <h3 ref={(heading) => heading?.focus({ preventScroll: true })} tabIndex={-1} className="heading text-3xl outline-none md:text-4xl">Message Sent</h3>
                <p className="mt-4 max-w-md break-words text-white/75">Thanks for reaching out. We will reply to {sentTo}.</p>
                <button type="button" onClick={() => setSentTo(null)} className="btn btn-ghost mt-8">Send Another Message</button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                noValidate
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={formik.handleSubmit}
                onKeyDown={() => setTyping(true)}
                onKeyUp={() => setTyping(false)}
                onBlur={() => setTyping(false)}
              >
                <div className="grid gap-5 md:grid-cols-2">
                  {FIELDS.map((field) => (
                    <div key={field.name} className={field.name === "name" ? "md:col-span-2" : ""}>
                      <label htmlFor={`contact-${field.name}`} className="field-label">{field.label}</label>
                      <input type={field.type} autoComplete={field.autoComplete} {...fieldProps(field.name)} />
                      {fieldError(field.name)}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <label htmlFor="contact-subject" className="field-label">Subject</label>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        aria-pressed={formik.values.subject === topic}
                        onClick={() => formik.setFieldValue("subject", topic)}
                        className={`min-h-10 rounded-xl border px-3 font-display text-sm font-semibold transition-colors ${formik.values.subject === topic ? "border-white bg-white text-ink" : "border-sky/30 text-white/80 hover:border-sky hover:text-white"}`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder="Choose a topic above, or write your own" {...fieldProps("subject")} />
                  {fieldError("subject")}
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor="contact-message" className="field-label">Your Message</label>
                    <span className={`font-mono text-xs ${formik.values.message.length > MESSAGE_LIMIT ? "text-stop" : "text-white/50"}`}>{formik.values.message.length} / {MESSAGE_LIMIT}</span>
                  </div>
                  <textarea rows={5} {...fieldProps("message")} className={`${fieldProps("message").className} resize-y`} />
                  {fieldError("message")}
                </div>

                <button type="submit" disabled={formik.isSubmitting} className="btn btn-primary group mt-6 w-full md:w-auto">
                  {formik.isSubmitting ? "Sending..." : "Send Message"}
                  {!formik.isSubmitting && (
                    <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M1 8h13M9 3l5 5-5 5" />
                    </svg>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactForm;

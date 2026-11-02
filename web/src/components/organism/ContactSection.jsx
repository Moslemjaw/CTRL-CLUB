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
// Name and phone share a row on phones, which keeps the whole form close to one screen.
const FIELDS = [
  { name: "name", label: "Name", type: "text", autoComplete: "name", span: "md:col-span-2" },
  { name: "phoneNumber", label: "Phone Number", type: "tel", autoComplete: "tel", span: "" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", span: "col-span-2 md:col-span-1" },
];
const TOPICS = ["Events", "Joining CTRL", "Partnerships"];
const LABEL = "field-label !mb-1 md:!mb-2";

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
    className: `field !min-h-11 !py-2 md:!min-h-12 md:!py-3 ${invalid(name) ? "field-invalid" : ""}`,
  });
  const fieldError = (name) => invalid(name) && <div id={`contact-${name}-error`} className="field-error">{formik.errors[name]}</div>;

  return (
    <section id="contact" className="relative overflow-hidden bg-navy-deep px-4 py-8 md:px-5 md:py-20 lg:py-32">
      <motion.div
        initial={reduced ? false : { y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto grid max-w-[1200px] overflow-hidden rounded-3xl border border-sky/20 bg-navy-panel/70 shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      >
        <div className="relative flex flex-col overflow-hidden border-b border-sky/20 bg-gradient-to-br from-navy-lift to-navy-deep p-5 md:p-10 lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute -bottom-40 -right-48 w-[34rem] opacity-30" aria-hidden="true">
            <CircuitRings className="h-full w-full" delay={0} />
          </div>
          <div className="relative">
            <p className="eyebrow mb-2 md:mb-4">Contact Us</p>
            <h2 className="heading pr-16 text-3xl md:pr-24 md:text-5xl lg:pr-0 xl:text-6xl">Get In Touch With Us</h2>
            <p className="mt-2 max-w-md leading-relaxed text-white/75 md:mt-5 md:text-lg">
              <span className="md:hidden">Send us a message and we will reply by email.</span>
              <span className="hidden md:inline">Have a question about an event, or an idea for the club? Send us a message and we will reply to your email.</span>
            </p>
          </div>
          <div className="absolute right-5 top-5 w-14 md:right-10 md:top-10 md:w-20 lg:relative lg:right-auto lg:top-auto lg:mt-auto lg:w-44 lg:pt-12" aria-hidden="true">
            <KeyCap pressed={typing || formik.isSubmitting} />
          </div>
        </div>

        <div className="p-5 md:p-10">
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
                <div className="grid grid-cols-2 gap-3 md:gap-5">
                  {FIELDS.map((field) => (
                    <div key={field.name} className={`min-w-0 ${field.span}`}>
                      <label htmlFor={`contact-${field.name}`} className={LABEL}>{field.label}</label>
                      <input type={field.type} autoComplete={field.autoComplete} {...fieldProps(field.name)} />
                      {fieldError(field.name)}
                    </div>
                  ))}
                </div>

                <div className="mt-3 md:mt-5">
                  <label htmlFor="contact-subject" className={LABEL}>Subject</label>
                  <div className="mb-2 flex flex-wrap gap-1.5 md:mb-3 md:gap-2">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        aria-pressed={formik.values.subject === topic}
                        onClick={() => formik.setFieldValue("subject", topic)}
                        className={`min-h-10 rounded-xl border px-2.5 font-display md:px-3 text-sm font-semibold transition-colors ${formik.values.subject === topic ? "border-white bg-white text-ink" : "border-sky/30 text-white/80 hover:border-sky hover:text-white"}`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder="Or write your own subject" {...fieldProps("subject")} />
                  {fieldError("subject")}
                </div>

                <div className="mt-3 md:mt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor="contact-message" className={LABEL}>Your Message</label>
                    <span className={`font-mono text-xs ${formik.values.message.length > MESSAGE_LIMIT ? "text-stop" : "text-white/50"}`}>{formik.values.message.length} / {MESSAGE_LIMIT}</span>
                  </div>
                  <textarea {...fieldProps("message")} className={`${fieldProps("message").className} h-24 resize-y md:h-36`} />
                  {fieldError("message")}
                </div>

                <button type="submit" disabled={formik.isSubmitting} className="btn btn-primary group mt-4 w-full md:mt-6 md:w-auto">
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

"use client";

import { useFormik } from "formik";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "react-toastify";
import { sendContactForm } from "@/api/contact";
import CircuitRings from "@/components/brand/CircuitRings";
import KeyCap from "@/components/brand/KeyCap";

const FIELDS = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phoneNumber", label: "Phone Number", type: "tel", autoComplete: "tel" },
  { name: "subject", label: "Subject", type: "text" },
];

const ContactForm = () => {
  const reduced = useReducedMotion();
  const formik = useFormik({
    initialValues: { name: "", email: "", phoneNumber: "", subject: "", message: "" },
    onSubmit: async (values, { resetForm }) => {
      try {
        await sendContactForm(values);
        toast.success("Message sent successfully!");
        resetForm();
      } catch {
        toast.error("Failed to send message. Please try again.");
      }
    },
  });

  return (
    <section id="contact" className="relative overflow-hidden bg-navy-deep px-5 py-24 lg:py-36">
      <div className="absolute -left-40 top-1/2 w-[46rem] -translate-y-1/2 opacity-25" aria-hidden="true">
        <CircuitRings className="h-full w-full" delay={0} />
      </div>
      <div className="relative mx-auto grid max-w-[1300px] gap-14 lg:grid-cols-2 lg:gap-20">
        <motion.div initial={reduced ? false : { x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col justify-center">
          <p className="eyebrow mb-4">Contact Us</p>
          <h2 className="heading text-5xl md:text-6xl xl:text-7xl">Get In Touch With Us</h2>
          <div className="mt-10 hidden w-44 lg:block"><KeyCap /></div>
        </motion.div>

        <motion.form initial={reduced ? false : { y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} onSubmit={formik.handleSubmit} className="panel">
          <div className="grid gap-5 md:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.name}>
                <label htmlFor={`contact-${field.name}`} className="field-label">{field.label}</label>
                <input id={`contact-${field.name}`} name={field.name} type={field.type} autoComplete={field.autoComplete} required className="field" value={formik.values[field.name]} onChange={formik.handleChange} />
              </div>
            ))}
          </div>
          <label htmlFor="contact-message" className="field-label mt-5">Your Message</label>
          <textarea id="contact-message" name="message" required className="field h-36 resize-y" value={formik.values.message} onChange={formik.handleChange} />
          <button type="submit" disabled={formik.isSubmitting} className="btn btn-primary mt-6 w-full md:w-auto">
            {formik.isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactForm;

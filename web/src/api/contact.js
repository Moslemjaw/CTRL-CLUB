import { invokeFunction } from "@/lib/supabase";

export const sendContactForm = (values) =>
  invokeFunction("send-contact", values);

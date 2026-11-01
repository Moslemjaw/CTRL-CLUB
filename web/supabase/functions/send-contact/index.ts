import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Public on purpose: the contact form works without logging in.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { name, email, phoneNumber, subject, message } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Saved first, so the message is kept even if the email fails. The table's checks validate the fields.
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      phone_number: phoneNumber,
      subject,
      message,
    });
    if (error) return json({ message: "Please fill in all the fields." }, 400);

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: Deno.env.get("EMAIL"), pass: Deno.env.get("EMAIL_PASSWORD") },
      });
      await transporter.sendMail({
        from: Deno.env.get("EMAIL"),
        to: Deno.env.get("EMAIL"),
        subject: `New Message from ${name} - ${subject}`,
        text: `You have received a new message from ${name} (${email}):\n\n${message}\n\nPhone: ${phoneNumber}`,
      });
    } catch (mailError) {
      console.error(mailError);
    }

    return json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error(error);
    return json({ message: "Error sending message." }, 500);
  }
});

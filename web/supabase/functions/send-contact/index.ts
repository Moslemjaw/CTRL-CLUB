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

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function buildNoticeHtml({ name, email, phoneNumber, subject, message }, inboxUrl) {
  const button = inboxUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;">
        <tr>
          <td bgcolor="#FFFFFF" style="background-color:#FFFFFF;border:2px solid #05072A;border-bottom:7px solid #6FCBFF;border-radius:12px;">
            <a href="${inboxUrl}" style="display:inline-block;padding:14px 26px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#05072A;text-decoration:none;">Reply from the Dashboard</a>
          </td>
        </tr>
      </table>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>New contact message</title>
</head>
<body style="margin:0;padding:0;background-color:#00032E;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#00032E" style="background-color:#00032E;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr>
            <td bgcolor="#000650" style="background-color:#000650;border:1px solid #1E2E9E;border-radius:20px;padding:32px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#6FCBFF;">New contact message</p>
              <h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;font-weight:700;color:#FFFFFF;">${escapeHtml(subject)}</h1>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#C9D6F2;">
                <strong style="color:#FFFFFF;">${escapeHtml(name)}</strong><br>
                ${escapeHtml(email)}<br>
                ${escapeHtml(phoneNumber)}
              </p>
              <p style="margin:0;font-size:16px;line-height:1.65;color:#FFFFFF;">${escapeHtml(message).replace(/\r?\n/g, "<br>")}</p>
              ${button}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Public on purpose: the contact form works without logging in.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { name, email, phoneNumber, subject, message } = await req.json();
    // Replies go to this address, so it has to be a usable one.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? ""))) {
      return json({ message: "Please enter a valid email address." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Saved first, so the message reaches the dashboard even if the email fails. The table's checks validate the fields.
    const { data: saved, error } = await supabase
      .from("contact_messages")
      .insert({ name, email, phone_number: phoneNumber, subject, message })
      .select("id")
      .single();
    if (error) return json({ message: "Please fill in all the fields." }, 400);

    try {
      const clubEmail = Deno.env.get("EMAIL");
      const siteUrl = Deno.env.get("SITE_URL")?.replace(/\/+$/, "");
      const inboxUrl = siteUrl ? `${siteUrl}/admin/messages?id=${saved.id}` : null;
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: clubEmail, pass: Deno.env.get("EMAIL_PASSWORD") },
      });
      await transporter.sendMail({
        from: { name: "CTRL Website", address: clubEmail },
        to: clubEmail,
        replyTo: { name, address: email },
        subject: `New Message from ${name} - ${subject}`,
        html: buildNoticeHtml({ name, email, phoneNumber, subject, message }, inboxUrl),
        text: `You have received a new message from ${name} (${email}):\n\n${message}\n\nPhone: ${phoneNumber}${inboxUrl ? `\n\nReply from the dashboard: ${inboxUrl}` : ""}`,
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

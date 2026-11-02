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

const paragraphs = (value) => escapeHtml(value).replace(/\r?\n/g, "<br>");

function buildReplyHtml(message, reply, siteUrl) {
  const siteLink = siteUrl ? ` &middot; <a href="${siteUrl}" style="color:#6FCBFF;text-decoration:none;">${siteUrl.replace(/^https?:\/\/(www\.)?/, "")}</a>` : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>A reply from CTRL</title>
</head>
<body style="margin:0;padding:0;background-color:#00032E;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#00032E" style="background-color:#00032E;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr>
            <td style="padding:0 0 24px 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#FFFFFF" style="background-color:#FFFFFF;border:2px solid #05072A;border-bottom:6px solid #6FCBFF;border-radius:10px;padding:7px 14px;font-family:'Courier New',Courier,monospace;font-size:20px;font-weight:700;letter-spacing:2px;color:#05072A;">CTRL</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="#000650" style="background-color:#000650;border:1px solid #1E2E9E;border-radius:20px;padding:32px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#6FCBFF;">A reply from CTRL</p>
              <h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;font-weight:700;color:#FFFFFF;">Hi ${escapeHtml(message.name)},</h1>
              <p style="margin:0 0 26px;font-size:16px;line-height:1.65;color:#FFFFFF;">${paragraphs(reply)}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-left:3px solid #6FCBFF;padding:2px 0 2px 14px;font-size:14px;line-height:1.6;color:#C9D6F2;">
                    <strong style="color:#FFFFFF;">Your message: ${escapeHtml(message.subject)}</strong><br>
                    ${paragraphs(message.message)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#8EA0CC;">
              CTRL: Coding, Technology and Robotics League<br>
              AASU Programming Club${siteLink}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ message: "Failed to authenticate token." }, 401);

    const { data: caller } = await admin.from("profiles").select("role, name").eq("id", user.id).single();
    if (caller?.role !== "admin") {
      return json({ message: "You do not have the necessary permissions." }, 403);
    }

    const { messageId, reply } = await req.json();
    const body = String(reply ?? "").trim();
    if (!body || body.length > 10000) {
      return json({ message: "Write a reply of up to 10,000 characters." }, 400);
    }

    const { data: message } = await admin.from("contact_messages").select("*").eq("id", messageId).maybeSingle();
    if (!message) return json({ message: "Message not found" }, 404);

    const clubEmail = Deno.env.get("EMAIL");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: clubEmail, pass: Deno.env.get("EMAIL_PASSWORD") },
    });

    // The reply is only recorded once the email has actually gone out.
    try {
      await transporter.sendMail({
        from: { name: "CTRL Club", address: clubEmail },
        to: message.email,
        replyTo: clubEmail,
        subject: /^re:/i.test(message.subject) ? message.subject : `Re: ${message.subject}`,
        html: buildReplyHtml(message, body, Deno.env.get("SITE_URL")?.replace(/\/+$/, "")),
        text: `Hi ${message.name},\n\n${body}\n\nYour message: ${message.subject}\n${message.message}`,
      });
    } catch (mailError) {
      console.error(mailError);
      return json({ message: "The email could not be sent, so your reply was not saved." }, 502);
    }

    const now = new Date().toISOString();
    const { data: saved, error } = await admin
      .from("contact_replies")
      .insert({ message_id: message.id, admin_id: user.id, admin_name: caller.name, body })
      .select()
      .single();
    if (error) {
      console.error(error);
      return json({ message: "The email was sent, but the reply could not be saved here." }, 500);
    }
    await admin.from("contact_messages").update({ replied_at: now, read_at: message.read_at ?? now }).eq("id", message.id);

    return json({ message: "Reply sent", reply: saved });
  } catch (error) {
    console.error(error);
    return json({ message: "Error sending reply." }, 500);
  }
});

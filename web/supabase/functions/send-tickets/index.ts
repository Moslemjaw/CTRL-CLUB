import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6";
import QRCode from "npm:qrcode@1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const TIME_ZONE = "Asia/Kuwait";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", { timeZone: TIME_ZONE, weekday: "long", month: "long", day: "numeric", year: "numeric" });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" });

// Email clients need tables and inline styles. Each ticket is a white QR plate above a navy stub.
function buildTicketHtml(ticket, index, total, qrSource) {
  return `
    <tr>
      <td style="padding:0 0 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" bgcolor="#FFFFFF" style="background-color:#FFFFFF;border-radius:20px 20px 0 0;padding:24px 24px 18px;">
              <img src="${qrSource}" width="240" height="240" alt="QR code for your ticket to ${escapeHtml(ticket.event_title)}" style="display:block;width:240px;max-width:100%;height:auto;border:0;">
              <p style="margin:12px 0 0;font-family:'Courier New',Courier,monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#05072A;">${total > 1 ? `Ticket ${index + 1} of ${total}` : "Scan at the entrance"}</p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#101A7A" style="background-color:#101A7A;border-top:2px dashed #6FCBFF;border-radius:0 0 20px 20px;padding:22px 24px;font-family:Arial,Helvetica,sans-serif;">
              <h2 style="margin:0 0 14px;font-size:22px;line-height:1.25;font-weight:700;color:#FFFFFF;">${escapeHtml(ticket.event_title)}</h2>
              <p style="margin:0 0 3px;font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6FCBFF;">When</p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.5;color:#FFFFFF;">${formatDate(ticket.event_date)} at ${formatTime(ticket.event_date)}</p>
              <p style="margin:0 0 3px;font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6FCBFF;">Where</p>
              <p style="margin:0;font-size:15px;line-height:1.5;color:#FFFFFF;">${escapeHtml(ticket.event_location)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function buildEmailHtml(tickets, siteUrl, qrSourceFor) {
  const many = tickets.length > 1;
  const ticketsHtml = tickets.map((ticket, index) => buildTicketHtml(ticket, index, tickets.length, qrSourceFor(index))).join("");
  const button = siteUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;">
        <tr>
          <td bgcolor="#FFFFFF" style="background-color:#FFFFFF;border:2px solid #05072A;border-bottom:7px solid #6FCBFF;border-radius:12px;">
            <a href="${siteUrl}/myTickets" style="display:inline-block;padding:14px 26px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#05072A;text-decoration:none;">View My Tickets</a>
          </td>
        </tr>
      </table>`
    : "";
  const siteLink = siteUrl ? ` &middot; <a href="${siteUrl}" style="color:#6FCBFF;text-decoration:none;">${siteUrl.replace(/^https?:\/\/(www\.)?/, "")}</a>` : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>Your CTRL tickets</title>
</head>
<body style="margin:0;padding:0;background-color:#00032E;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your QR ${many ? "tickets are" : "ticket is"} inside. Show ${many ? "them" : "it"} at the entrance.</div>
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
            <td style="padding:0 4px 26px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#6FCBFF;">You're registered</p>
              <h1 style="margin:0 0 12px;font-size:32px;line-height:1.15;font-weight:700;color:#FFFFFF;">${many ? "Your tickets are ready." : "Your ticket is ready."}</h1>
              <p style="margin:0;font-size:16px;line-height:1.6;color:#C9D6F2;">Show the QR code at the event entrance. Each code can only be scanned once, so keep it to yourself.</p>
            </td>
          </tr>
          ${ticketsHtml}
          <tr>
            <td style="padding:0 4px;">${button}</td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#8EA0CC;">
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

function buildEmailText(tickets, siteUrl) {
  const lines = tickets.map((ticket) => `${ticket.event_title}\n${formatDate(ticket.event_date)} at ${formatTime(ticket.event_date)}\n${ticket.event_location}`);
  return [
    "You're registered with CTRL. Show your QR code at the event entrance.",
    ...lines,
    siteUrl ? `View your QR codes: ${siteUrl}/myTickets` : "",
  ].filter(Boolean).join("\n\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Uses the caller's session, so the access rules only return their own tickets.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    const { ticketIds } = await req.json();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return json({ message: "Failed to authenticate token." }, 401);

    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("*")
      .in("id", ticketIds)
      .eq("user_id", user.id);
    if (error) throw error;
    if (!tickets?.length) return json({ message: "Tickets not found" }, 404);

    const attachments = await Promise.all(tickets.map(async (ticket, index) => ({
      filename: `ticket_${index + 1}.png`,
      content: await QRCode.toBuffer(`Text: ${ticket.qr_id}\nEvent ID: ${ticket.event_id}`, { width: 480, margin: 1 }),
      cid: `image${index + 1}`,
    })));

    const siteUrl = Deno.env.get("SITE_URL")?.replace(/\/+$/, "");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: Deno.env.get("EMAIL"), pass: Deno.env.get("EMAIL_PASSWORD") },
    });

    await transporter.sendMail({
      from: { name: "CTRL Club", address: Deno.env.get("EMAIL") },
      to: user.email,
      subject: tickets.length > 1 ? "Your CTRL tickets" : `Your ticket: ${tickets[0].event_title}`,
      html: buildEmailHtml(tickets, siteUrl, (index) => `cid:image${index + 1}`),
      text: buildEmailText(tickets, siteUrl),
      attachments,
    });

    return json({ message: "Done, Sent Ticket" });
  } catch (error) {
    console.error(error);
    return json({ message: "Email sending failed" }, 500);
  }
});

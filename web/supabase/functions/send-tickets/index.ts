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
      filename: `ticket_${index}.png`,
      content: await QRCode.toBuffer(`Text: ${ticket.qr_id}\nEvent ID: ${ticket.event_id}`),
      cid: `image${index + 1}`,
    })));

    const ticketsHtml = tickets.map((ticket, index) => {
      const date = new Date(ticket.event_date);
      return `
        <div style="border:1px solid #000; color:white; padding:10px; margin-bottom:10px; max-width:300px; border-radius: 1rem; text-align:center; background-color: rgb(20, 16, 44);">
          <h2>${ticket.event_title}</h2>
          <p>Date: ${date.toLocaleDateString("en-US", { timeZone: TIME_ZONE })} at ${date.toLocaleTimeString("en-US", { timeZone: TIME_ZONE })}</p>
          <p>Location: ${ticket.event_location}</p>
          <img src="cid:image${index + 1}" alt="QR Code" style="width:100%; border-radius: 1rem;"/>
        </div>`;
    }).join("");

    const siteUrl = Deno.env.get("SITE_URL");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: Deno.env.get("EMAIL"), pass: Deno.env.get("EMAIL_PASSWORD") },
    });

    await transporter.sendMail({
      from: Deno.env.get("EMAIL"),
      to: user.email,
      subject: "Your Event Tickets",
      html: `<html><body>
        <h1>Your Event Tickets</h1>
        ${siteUrl ? `<a href="${siteUrl}"><h4>Visit Our Website</h4></a>` : ""}
        <p>Thank you for your purchase! Here are your tickets:</p>
        ${ticketsHtml}
        <p>Please present these tickets at the event entrance.</p>
      </body></html>`,
      attachments,
    });

    return json({ message: "Done, Sent Ticket" });
  } catch (error) {
    console.error(error);
    return json({ message: "Email sending failed" }, 500);
  }
});

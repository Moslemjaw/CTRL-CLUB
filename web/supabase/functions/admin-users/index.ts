import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ROLES = ["user", "admin", "scanner", "ctrl_member"];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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

    const { data: caller } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (caller?.role !== "admin") {
      return json({ message: "You do not have the necessary permissions." }, 403);
    }

    const body = await req.json();

    if (body.action === "create") {
      const { name, email, phoneNumber, password, role } = body;
      if (!name || !email || !phoneNumber || !password) {
        return json({ message: "Missing required fields" }, 400);
      }
      if (!ROLES.includes(role)) {
        return json({ message: "Invalid user role" }, 400);
      }

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, phone_number: String(phoneNumber) },
      });
      if (error) {
        const exists = error.code === "email_exists";
        return json({ message: exists ? "Email already exists" : error.message }, 400);
      }

      const { error: roleError } = await admin.from("profiles").update({ role }).eq("id", data.user.id);
      if (roleError) {
        await admin.auth.admin.deleteUser(data.user.id);
        throw roleError;
      }
      return json({ message: "User created successfully" }, 201);
    }

    if (body.action === "set-role") {
      if (body.userId === user.id) return json({ message: "You cannot change your own role" }, 400);
      if (!ROLES.includes(body.role)) return json({ message: "Invalid user role" }, 400);
      const { error } = await admin.from("profiles").update({ role: body.role }).eq("id", body.userId);
      if (error) return json({ message: error.message }, 400);
      return json({ message: "Role updated successfully" });
    }

    if (body.action === "delete") {
      if (body.userId === user.id) return json({ message: "You cannot delete your own account" }, 400);
      const { error } = await admin.auth.admin.deleteUser(body.userId);
      if (error) return json({ message: error.message }, 400);
      return json({ message: "User deleted successfully" });
    }

    return json({ message: "Unknown action" }, 400);
  } catch (error) {
    return json({ message: (error as Error).message }, 500);
  }
});

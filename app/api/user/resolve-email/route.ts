import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

function normalizeUsername(username: string) {
  return username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    const serviceSupabase = createSupabaseServiceRoleClient();

    // If admin APIs are not available (fallback anon key), we cannot resolve
    // a username to an email. Return a clear 501 explaining the missing key.
    if (!serviceSupabase.auth?.admin?.getUserById && !serviceSupabase.auth?.admin?.listUsers) {
      return NextResponse.json(
        { error: "Server missing SUPABASE_SERVICE_ROLE_KEY; resolving username to email requires it. Set SUPABASE_SERVICE_ROLE_KEY in your environment." },
        { status: 501 }
      );
    }

    // Try profiles table for username -> user id
    const { data: profileData, error: profileError } = await serviceSupabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }

    if (!profileData) {
      return NextResponse.json({ error: "Username not found" }, { status: 404 });
    }

    const userId = profileData.id;

    // Try admin API to get user's email by id
    try {
      // modern supabase client exposes admin.getUserById
      if (serviceSupabase.auth?.admin?.getUserById) {
        // @ts-ignore
        const { data: userResp, error: userErr } = await serviceSupabase.auth.admin.getUserById(userId);
        if (userErr) throw userErr;
        const email = (userResp?.user?.email) || null;
        if (email) return NextResponse.json({ success: true, email });
      }
    } catch (e) {
      // fallback to listing users
      console.warn("admin.getUserById failed, falling back to listUsers", e);
    }

    // Fallback: list users and find by id
    try {
      const { data: usersData, error: usersErr } = await serviceSupabase.auth.admin.listUsers();
      if (usersErr) {
        console.error("listUsers error:", usersErr);
        return NextResponse.json({ error: "Unable to resolve user" }, { status: 500 });
      }

      const found = (usersData?.users || []).find((u: any) => u.id === userId);
      if (!found) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, email: found.email });
    } catch (err) {
      console.error("Resolve email failed:", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Resolve email API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

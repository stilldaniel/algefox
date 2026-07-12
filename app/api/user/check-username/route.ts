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

    // Exact match using normalized username
    const { data, error } = await serviceSupabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (error) {
      console.error("Check username error:", error);
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }

    const exists = !!data;
    return NextResponse.json({ success: true, available: !exists });
  } catch (err) {
    console.error("Check username API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

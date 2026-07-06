import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const serviceSupabase = createSupabaseServiceRoleClient();

    // Case-insensitive exact match using ILIKE
    const { data, error } = await serviceSupabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
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

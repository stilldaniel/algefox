import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if this is a Google login user
    const userIdentities = user.identities || [];
    const isGoogleUser = userIdentities.some((id: any) => id.provider === "google");

    if (!isGoogleUser) {
      return NextResponse.json(
        { error: "Only Google-authenticated users can save XP" },
        { status: 403 }
      );
    }

    const { xpToAdd, xpTotal } = await request.json();

    const hasXpTotal = typeof xpTotal === "number" && xpTotal >= 0;
    const hasXpToAdd = typeof xpToAdd === "number" && xpToAdd >= 0;

    if (!hasXpTotal && !hasXpToAdd) {
      return NextResponse.json(
        { error: "Invalid XP amount" },
        { status: 400 }
      );
    }

    // First, get current XP
    const { data: existingStats } = await supabase
      .from("user_stats")
      .select("xp")
      .eq("user_id", user.id)
      .single();

    const currentXP = existingStats?.xp || 0;
    const newXP = hasXpTotal
      ? Math.max(currentXP, xpTotal)
      : currentXP + xpToAdd;

    // Upsert user stats (create or update) with accumulated XP
    const { data, error } = await supabase
      .from("user_stats")
      .upsert(
        {
          user_id: user.id,
          xp: newXP,
        },
        {
          onConflict: "user_id",
        }
      )
      .select();

    if (error) {
      console.error("Save XP error:", error);
      return NextResponse.json(
        { error: "Failed to save XP" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: data?.[0],
    });
  } catch (error) {
    console.error("Save XP API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch current user's XP stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Fetch user XP error:", error);
      return NextResponse.json(
        { error: "Failed to fetch user stats" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: data || { user_id: user.id, xp: 0 },
    });
  } catch (error) {
    console.error("Fetch user XP API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

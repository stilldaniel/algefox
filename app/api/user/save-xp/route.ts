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

    if (!user.id) {
      console.error("User object has no id:", user);
      return NextResponse.json({ error: "Invalid user session" }, { status: 401 });
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

    console.log(`[Save XP] User ID: ${user.id}, xpToAdd: ${xpToAdd}, xpTotal: ${xpTotal}`);

    // Ensure profile row exists for the current user so the leaderboard can show their name.
    const profileName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      null;

    if (profileName) {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: profileName,
        },
        {
          onConflict: "id",
        }
      );
    }

    // First, get current XP (defaults to 0 for new users)
    const { data: existingStats, error: selectError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (selectError) {
      console.error("Error selecting user stats:", selectError);
    }

    console.log(`[Save XP] Existing stats for user ${user.id}:`, existingStats);

    // If no stats row exists yet, insert with 0 XP first
    if (!existingStats) {
      console.log(`[Save XP] No existing stats, creating new row for user ${user.id}`);
      const { error: insertError } = await supabase
        .from("user_stats")
        .insert({
          user_id: user.id,
          xp: 0,
        });

      if (insertError) {
        console.error("Failed to initialize user stats:", insertError);
        return NextResponse.json({ error: "Failed to initialize user stats" }, { status: 500 });
      }
    }

    const currentXP = existingStats?.xp || 0;
    const newXP = hasXpTotal
      ? Math.max(currentXP, xpTotal)
      : currentXP + xpToAdd;

    console.log(`[Save XP] Updating user ${user.id}: currentXP=${currentXP}, newXP=${newXP}`);

    // Update user stats with new XP
    const { data, error } = await supabase
      .from("user_stats")
      .update({
        xp: newXP,
      })
      .eq("user_id", user.id)
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

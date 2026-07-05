import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    // Service role client bypasses RLS — needed to read all profiles
    const serviceSupabase = createSupabaseServiceRoleClient();

    // 1. Fetch top 20 by XP
    const { data, error } = await supabase
      .from("user_stats")
      .select("id, user_id, xp")
      .order("xp", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Leaderboard query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    const userIds = (data || []).map((row: any) => row.user_id);

    // 2. Fetch profiles using SERVICE ROLE so RLS doesn't block cross-user reads
    let profiles: any[] = [];
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await serviceSupabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profilesError) {
        console.error("Profiles query error:", profilesError);
      } else {
        profiles = profilesData || [];
      }
    }

    const profilesById = profiles.reduce(
      (acc: Record<string, any>, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      },
      {}
    );

    // 3. For any users still missing a name, fall back to auth metadata
    const missingIds = userIds.filter((id) => !profilesById[id]?.full_name);
    const authMetadataById: Record<string, string> = {};

    if (missingIds.length > 0) {
      try {
        const { data: authUsers, error: authUsersError } =
          await serviceSupabase.auth.admin.listUsers();

        if (!authUsersError && authUsers?.users) {
          authUsers.users.forEach((authUser: any) => {
            if (missingIds.includes(authUser.id)) {
              const name =
                authUser.user_metadata?.full_name ||
                authUser.user_metadata?.name ||
                authUser.email?.split("@")[0];
              if (name) authMetadataById[authUser.id] = name;
            }
          });
        }
      } catch (fallbackError) {
        console.warn("Auth metadata fallback failed:", fallbackError);
      }
    }

    // 4. Build leaderboard with real names
    const leaderboard = (data || []).map((user: any, index: number) => {
      const profile = profilesById[user.user_id];
      const metadataName = authMetadataById[user.user_id];
      const fullName = profile?.full_name || metadataName || null;
      const firstName = fullName?.split(" ")[0] || null;

      return {
        rank: index + 1,
        userId: user.user_id,
        name: firstName || "Anonymous",
        fullName: fullName || "Anonymous",
        xp: user.xp,
      };
    });

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
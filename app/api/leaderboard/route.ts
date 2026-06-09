import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

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

    let profiles: any[] = [];
    let profilesError = null;

    if (userIds.length > 0) {
      const profilesResult = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      profiles = profilesResult.data || [];
      profilesError = profilesResult.error;
    }

    if (profilesError) {
      console.error("Leaderboard profiles query error:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard profiles" },
        { status: 500 }
      );
    }

    const profilesById = (profiles || []).reduce(
      (acc: Record<string, any>, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      },
      {}
    );

    const missingProfileIds = userIds.filter((id) => !profilesById[id]);
    const authMetadataById: Record<string, string> = {};

    if (missingProfileIds.length > 0 && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const serviceSupabase = createSupabaseServiceRoleClient();
        const { data: authUsers, error: authUsersError } = await serviceSupabase.auth.admin.listUsers();

        if (!authUsersError && authUsers?.users) {
          authUsers.users.forEach((authUser: any) => {
            if (missingProfileIds.includes(authUser.id)) {
              const metadataName = authUser.user_metadata?.full_name || authUser.user_metadata?.name;
              if (metadataName) {
                authMetadataById[authUser.id] = metadataName;
              }
            }
          });
        }
      } catch (fallbackError) {
        console.warn("Leaderboard auth metadata fallback failed:", fallbackError);
      }
    }

    const leaderboard = (data || []).map((user: any, index: number) => {
      const profile = profilesById[user.user_id];
      const metadataName = authMetadataById[user.user_id];
      const firstName = profile?.full_name?.split(" ")[0] || metadataName?.split(" ")[0] || null;
      return {
        rank: index + 1,
        userId: user.user_id,
        name: firstName || "Player",
        fullName: profile?.full_name || metadataName || "Unknown",
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

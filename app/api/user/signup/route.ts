import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

function normalizeUsername(username: string) {
  return username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

function makeInternalEmail(username: string) {
  const safeUsername = normalizeUsername(username);
  return `${safeUsername}@algefox.app`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = String(body.full_name || body.fullName || "").trim();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!username || username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) {
      return NextResponse.json({ error: "Username contains invalid characters" }, { status: 400 });
    }

    const serviceSupabase = createSupabaseServiceRoleClient();

    const { data: existingProfile, error: existingError } = await serviceSupabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (existingError) {
      console.error("Username lookup failed:", existingError);
      return NextResponse.json({ error: "Unable to check username" }, { status: 500 });
    }

    if (existingProfile) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }

    const emailToUse = email || makeInternalEmail(normalizedUsername);

    // Prefer admin API for creating users (required for username-only signups).
    // If admin APIs are unavailable (e.g. running locally without service role key),
    // allow email+password signups via the anon key, but reject username-only flows.
    let user: any = null;

    if (serviceSupabase.auth?.admin?.createUser) {
      const { data: createData, error: createError } = await serviceSupabase.auth.admin.createUser({
        email: emailToUse,
        password,
        user_metadata: {
          full_name: fullName || null,
          username: normalizedUsername,
        },
        email_confirm: true,
      });

      if (createError) {
        console.error("Admin create user failed:", createError);
        return NextResponse.json({ error: createError.message || "Unable to create user" }, { status: 400 });
      }

      user = (createData as any)?.user || createData;
      if (!user?.id) {
        return NextResponse.json({ error: "Unable to create user" }, { status: 500 });
      }
    } else {
      // Admin API unavailable — likely running without SUPABASE_SERVICE_ROLE_KEY.
      if (!email) {
        return NextResponse.json(
          { error: "Server missing SUPABASE_SERVICE_ROLE_KEY; username-only signup requires it. Set SUPABASE_SERVICE_ROLE_KEY in your environment." },
          { status: 501 }
        );
      }

      // Try regular signUp with anon key (works for email+password flows).
      const { data: signData, error: signErr } = await serviceSupabase.auth.signUp({
        email: emailToUse,
        password,
        options: { data: { full_name: fullName || null, username: normalizedUsername } },
      });

      if (signErr) {
        console.error("Fallback signUp failed:", signErr);
        return NextResponse.json({ error: signErr.message || "Unable to create user" }, { status: 400 });
      }

      user = (signData as any)?.user || signData;
      // If user id is not returned, continue — Supabase will send confirmation email.
    }

    const { error: profileError } = await serviceSupabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName || null,
        username: normalizedUsername,
      },
      {
        onConflict: "id",
      }
    );

    if (profileError) {
      console.error("Profile upsert failed after signup:", profileError);
      return NextResponse.json({ error: "User created but profile setup failed" }, { status: 500 });
    }

    // Initialize user_stats with 0 XP for new users (only if user.id exists)
    if (user?.id) {
      // First check if a stats row already exists
      const { data: existingStats, error: checkError } = await serviceSupabase
        .from("user_stats")
        .select("xp")
        .eq("user_id", user.id)
        .maybeSingle();

      // Only insert if no stats row exists yet
      if (!checkError && !existingStats) {
        const { error: insertError } = await serviceSupabase
          .from("user_stats")
          .insert({
            user_id: user.id,
            xp: 0,
          });

        if (insertError) {
          console.error("User stats initialization failed after signup:", insertError);
          // Don't fail the signup just because stats initialization failed
        }
      }
    }

    return NextResponse.json({
      success: true,
      email: emailToUse,
      username: normalizedUsername,
      internalSignup: !email,
    });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

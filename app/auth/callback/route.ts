import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  // If Google returned an error, go back to login
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!userError && user) {
        const profileName =
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          null;

        if (profileName || user.user_metadata?.username) {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              full_name: profileName,
              username: user.user_metadata?.username || null,
            },
            {
              onConflict: "id",
            }
          );
        }

        // Initialize user_stats with 0 XP if it doesn't exist
        const { data: existingStats } = await supabase
          .from("user_stats")
          .select("xp")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existingStats) {
          await supabase.from("user_stats").insert({
            user_id: user.id,
            xp: 0,
          });
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Fallback — something went wrong
  return NextResponse.redirect(`${origin}/login`);
}
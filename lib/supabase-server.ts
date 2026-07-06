import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export function createSupabaseServiceRoleClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // In production we require the service role key. In local development
    // allow falling back to the anon key with a warning so the app can still
    // run for non-admin flows (but admin APIs will be unavailable).
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "SUPABASE_SERVICE_ROLE_KEY is not set — falling back to anon key for local development. Admin APIs will be unavailable."
      );
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY for fallback");
      }
        const client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Attach a lightweight dev-mode admin mock so username-only signup
        // and username->email resolution can work during local development.
        // This is intentionally limited and should NOT be used in production.
        try {
          // @ts-ignore
          client.auth = client.auth || {};
          // Attach as any to avoid TypeScript admin API type conflicts in dev.
          (client.auth as any).admin = {
            createUser: async (opts: any) => {
              // Map to regular signUp for local dev. Note: this will not
              // create a confirmed, server-side user as the real admin API does.
              const email = opts.email;
              const password = opts.password;
              const metadata = opts.user_metadata || {};
              const { data, error } = await client.auth.signUp({
                email,
                password,
                options: { data: metadata },
              } as any);
              return { data, error };
            },
            getUserById: async (id: string) => {
              // Derive email from profiles.username if available.
              const { data, error } = await client.from("profiles").select("id,username").eq("id", id).maybeSingle();
              if (error) return { error };
              if (!data) return { data: null };
              const email = `${data.username}@algefox.app`;
              return { data: { user: { id: data.id, email } } };
            },
            listUsers: async () => {
              const { data, error } = await client.from("profiles").select("id,username");
              if (error) return { error };
              const users = (data || []).map((p: any) => ({ id: p.id, email: `${p.username}@algefox.app` }));
              return { data: { users } };
            },
          };
        } catch (e) {
          // If anything goes wrong attaching the mock, just continue without it.
          console.warn("Failed to attach dev admin mock:", e);
        }

        return client;
    }

    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

}
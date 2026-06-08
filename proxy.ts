import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next();

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Missing Supabase environment variables in proxy");
      return supabaseResponse;
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // IMPORTANT: always call getUser() to refresh the session cookie
    let user = null;
    try {
      const result = await supabase.auth.getUser();
      user = result.data?.user ?? null;
    } catch (error) {
      console.error("Middleware Supabase auth error:", error);
    }

    const { pathname } = request.nextUrl;

    // Never intercept these paths
    const isAuthCallback = pathname.startsWith("/auth/callback");
    const isAuthPage     = pathname.startsWith("/login") || pathname.startsWith("/signup");
    const isPublic       = pathname === "/" || pathname.startsWith("/_next") || pathname.startsWith("/favicon");

    if (isAuthCallback || isPublic) {
      return supabaseResponse;
    }

    // Not logged in → send to login
    if (!user && !isAuthPage) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    // Already logged in → don't show auth pages
    if (user && isAuthPage) {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashUrl);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware unexpected error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
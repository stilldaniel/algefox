"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getBrowserSupabaseClient } from "@/lib/supabase-client";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = getBrowserSupabaseClient();

      // Allow login by username: if input doesn't contain @, try resolving it
      let emailToUse = email;
      if (!email.includes("@")) {
        const resp = await fetch(`/api/user/resolve-email?username=${encodeURIComponent(email)}`);
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          setError(body?.error || "Username not found");
          setLoading(false);
          return;
        }
        const body = await resp.json();
        emailToUse = body.email;
        if (!emailToUse) {
          setError("Unable to resolve username");
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  const getAuthRedirectUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (envUrl) {
      try {
        const parsed = new URL(envUrl);
        if (parsed.pathname.endsWith("/auth/callback")) {
          return envUrl;
        }
        return `${envUrl.replace(/\/$/, "")}/auth/callback`;
      } catch {
        return `${envUrl.replace(/\/$/, "")}/auth/callback`;
      }
    }

    return `${window.location.origin}/auth/callback`;
  };

  async function handleGoogle() {
    try {
      const supabase = getBrowserSupabaseClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: getAuthRedirectUrl() },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth login failed");
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4"
      style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg px-6 py-10">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <Image src="/fox-celebrate.png" alt="Algefox" fill className="object-contain" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[#1D1D1D] text-center mb-1">Welcome back!</h1>
        <p className="text-[#888] text-sm text-center mb-8">Sign in to continue learning</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Email */}
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
            <input
              type="text"
                placeholder="Email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-13 pl-11 pr-4 rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] text-[#1D1D1D] text-sm font-semibold focus:outline-none focus:border-[#9333EA] transition-all"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-13 pl-11 pr-12 rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] text-[#1D1D1D] text-sm font-semibold focus:outline-none focus:border-[#9333EA] transition-all"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ABABAB] cursor-pointer">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-semibold text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-full text-white font-bold text-base cursor-pointer transition-all hover:brightness-95"
            style={{ background: "linear-gradient(90deg,#9333EA,#7E22CE)", boxShadow: "0 5px 0 #6B21A8", fontFamily: "'Nunito', sans-serif" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#ECECEC]" />
          <span className="text-xs text-[#ABABAB] font-semibold">or</span>
          <div className="flex-1 h-px bg-[#ECECEC]" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full h-13 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center gap-3 text-sm font-bold text-[#1D1D1D] cursor-pointer hover:bg-[#FAFAFA] transition-all"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-[#888] mt-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
          Don't have an account?{" "}
          <button onClick={() => router.push("/signup")}
            className="text-[#9333EA] font-bold cursor-pointer hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </main>
  );
}
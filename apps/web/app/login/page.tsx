"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { LoginHeroIllustration } from "../../components/LoginHeroIllustration";
import { useAuthStore } from "../../store/authStore";

function RegisteredNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("registered") !== "1") return null;
  return (
    <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      Account created. Sign in with your email and password.
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left: brand + illustration */}
      <div className="relative flex min-h-[40vh] w-full flex-col overflow-hidden bg-brand-light lg:min-h-screen lg:w-[45%]">
        {/* Geometric background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-64 w-64 rotate-12 rounded-3xl bg-amber-200/60" />
          <div className="absolute bottom-0 right-0 h-80 w-80 -rotate-6 rounded-[3rem] bg-amber-300/40" />
          <div className="absolute right-10 top-1/3 h-48 w-48 rotate-45 rounded-2xl bg-yellow-200/50" />
        </div>

        <div className="relative z-10 flex items-center gap-2 px-8 pt-8 lg:px-10 lg:pt-10">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg text-white shadow-sm">
            📖
          </span>
          <span className="text-sm font-semibold leading-tight text-brand-ink md:text-base">
            Learning Management System
          </span>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-10 pt-6 opacity-85 lg:px-10 lg:pb-16">
          <LoginHeroIllustration />
        </div>
      </div>

      {/* Right: form */}
      <div className="flex w-full flex-1 flex-col bg-[#0d0d0d] lg:w-[55%]">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-8 pb-12 pt-10 lg:px-6 lg:pb-20 lg:pt-14">
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Account Login</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            If you are already a member you can login with your email address and password.
          </p>

          <div className="mt-6">
            <Suspense fallback={null}>
              <RegisteredNotice />
            </Suspense>
          </div>

          <form
            className="mt-10 space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              try {
                await login(email, password);
                router.push("/free-courses");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Login failed");
              }
            }}
          >
            <div>
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email address
              </label>
              <input
                id="email"
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none ring-brand/30 transition focus:border-brand focus:ring-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </label>
              <input
                id="password"
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none ring-brand/30 transition focus:border-brand focus:ring-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <span className="text-sm text-neutral-400">Forgot Password?</span>
            </div>

            {error ? (
              <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-md bg-brand py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
              Login
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-brand hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

const DASHBOARD_PATHS = [
  "/courses",
  "/free-courses",
  "/paid-courses",
  "/chat",
  "/payment",
  "/search",
  "/learning",
  "/wishlist",
  "/profile"
];
const AUTH_PATHS = ["/login", "/register"];

function isDashboardPath(pathname: string) {
  return DASHBOARD_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function ConditionalRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const dashboard = isDashboardPath(pathname);
  const auth = AUTH_PATHS.includes(pathname);

  useEffect(() => {
    if (!bootstrapped) return;
    if (dashboard && !user) {
      router.replace("/login");
    }
  }, [bootstrapped, dashboard, router, user]);

  if (dashboard && (!bootstrapped || !user)) {
    return null;
  }

  if (auth || dashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/free-courses" className="font-semibold text-neutral-900">
            LMS
          </Link>
          <div className="flex gap-4 text-sm text-neutral-700">
            <Link className="hover:underline" href="/free-courses">
              Courses
            </Link>
            <Link className="hover:underline" href="/docs">
              Docs
            </Link>
            <Link className="hover:underline" href="/login">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </>
  );
}

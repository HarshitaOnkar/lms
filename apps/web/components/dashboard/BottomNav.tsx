"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/free-courses", label: "Free courses", icon: GiftIcon, match: "free" as const },
  { href: "/paid-courses", label: "Paid courses", icon: CurrencyIcon, match: "paid" as const },
  { href: "/profile", label: "Account", icon: UserIcon, match: "exact" as const }
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-[#0d0d0d]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-2 pt-2">
        {items.map(({ href, label, icon: Icon, match }) => {
          const isActive =
            match === "free"
              ? pathname === "/free-courses" || pathname === "/" || pathname === "/courses"
              : match === "paid"
                ? pathname === "/paid-courses"
                : pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[9px] font-medium leading-tight sm:text-[10px] ${
                isActive ? "text-brand" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Icon active={isActive} />
              <span className="line-clamp-2 text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function GiftIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-6 w-6"
      fill={active ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  );
}

function CurrencyIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-6 w-6"
      fill={active ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-6 w-6" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

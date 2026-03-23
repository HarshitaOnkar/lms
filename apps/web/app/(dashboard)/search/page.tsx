"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthStore } from "../../../store/authStore";

export default function SearchPage() {
  const router = useRouter();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const user = useAuthStore((s) => s.user);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!bootstrapped) return;
    if (!user) router.push("/login");
  }, [bootstrapped, user, router]);

  if (!bootstrapped || !user) {
    return <div className="px-4 pt-8 text-sm text-neutral-500">Loading…</div>;
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold text-white">Search</h1>
      <p className="mt-2 text-sm text-neutral-500">Find courses and topics.</p>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="What do you want to learn?"
        className="mt-6 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      <p className="mt-8 text-center text-sm text-neutral-600">
        Browse categories on the Featured tab — search filters coming soon.
      </p>
    </div>
  );
}

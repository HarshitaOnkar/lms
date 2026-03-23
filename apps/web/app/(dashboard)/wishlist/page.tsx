"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "../../../store/authStore";

export default function WishlistPage() {
  const router = useRouter();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!bootstrapped) return;
    if (!user) router.push("/login");
  }, [bootstrapped, user, router]);

  if (!bootstrapped || !user) {
    return <div className="px-4 pt-8 text-sm text-neutral-500">Loading…</div>;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="text-4xl" aria-hidden>
        ♡
      </div>
      <h1 className="mt-4 text-xl font-bold text-white">Wishlist</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        Saved courses will appear here. This feature can be wired to your backend when you&apos;re ready.
      </p>
    </div>
  );
}

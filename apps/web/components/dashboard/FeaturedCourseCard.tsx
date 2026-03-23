"use client";

import Link from "next/link";

type Props = {
  id: number;
  title: string;
  description: string | null;
  isEnrolled: boolean;
  progressPercent: number;
  rating: string;
  reviews: string;
  tag?: string;
  /** When false, show paid pricing instead of “Free”. */
  isFree?: boolean;
  onEnroll?: () => void | Promise<void>;
};

export function FeaturedCourseCard({
  id,
  title,
  description,
  isEnrolled,
  progressPercent,
  rating,
  reviews,
  tag,
  isFree = true,
  onEnroll
}: Props) {
  const hue = (id * 47) % 360;
  return (
    <article className="w-[min(280px,78vw)] shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/80 shadow-lg">
      <div
        className="relative aspect-[16/10] w-full bg-gradient-to-br from-neutral-800 to-neutral-900"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(${hue},35%,22%), hsl(${(hue + 40) % 360},30%,12%))`
        }}
      >
        {tag ? (
          <span className="absolute left-2 top-2 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase text-neutral-900">
            {tag}
          </span>
        ) : null}
        <div className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white/90 line-clamp-2 drop-shadow">
          {title}
        </div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">{title}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
          {description?.slice(0, 80) || "Structured learning path"}
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
          <span aria-hidden>★★★★★</span>
          <span className="text-neutral-400">{rating}</span>
          <span className="text-neutral-600">({reviews})</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-white">
            {isEnrolled ? "Continue" : isFree ? "Free" : `From ₹${799 + (id % 5) * 100}`}
          </span>
          {isEnrolled ? (
            <span className="text-xs text-emerald-400">{progressPercent}% done</span>
          ) : (
            <span className="text-xs text-neutral-500">{isFree ? "Enroll to start" : "Purchase & enroll"}</span>
          )}
        </div>
        <div className="mt-3">
          {isEnrolled ? (
            <Link
              href={`/subjects/${id}`}
              className="block w-full rounded-md bg-brand py-2.5 text-center text-sm font-semibold text-neutral-900"
            >
              Continue learning
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void onEnroll?.()}
              className="block w-full rounded-md bg-brand py-2.5 text-center text-sm font-semibold text-neutral-900"
            >
              Enroll now
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

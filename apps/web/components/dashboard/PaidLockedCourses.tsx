"use client";

import Link from "next/link";

type PaidCourse = {
  title: string;
  instructor: string;
  rating: string;
  students: string;
  price: string;
  oldPrice: string;
  tag?: "Premium" | "Bestseller";
  thumbnail: string;
};

const PAID_COURSES: PaidCourse[] = [
  {
    title: "Full stack generative and Agentic AI with python",
    instructor: "Litesh Choudhary, Piyush Garg",
    rating: "4.5",
    students: "5,677",
    price: "₹549",
    oldPrice: "₹799",
    tag: "Premium",
    thumbnail: "https://img.youtube.com/vi/rfscVS0vtbw/0.jpg"
  },
  {
    title: "The Ultimate Python Bootcamp: Learn by Building Projects",
    instructor: "Litesh Choudhary",
    rating: "4.6",
    students: "2,095",
    price: "₹589",
    oldPrice: "₹799",
    tag: "Premium",
    thumbnail: "https://img.youtube.com/vi/_uQrJ0TkZlc/0.jpg"
  },
  {
    title: "Complete 2026 Python Bootcamp: Learn Python from Zero",
    instructor: "Ilaris Ali Khan",
    rating: "4.6",
    students: "12,715",
    price: "₹569",
    oldPrice: "₹799",
    tag: "Bestseller",
    thumbnail: "https://img.youtube.com/vi/9N6a-VLBa2I/0.jpg"
  },
  {
    title: "Learn Python Programming - Beginner to Master",
    instructor: "Abdul Bari",
    rating: "4.7",
    students: "13,405",
    price: "₹569",
    oldPrice: "₹799",
    tag: "Premium",
    thumbnail: "https://img.youtube.com/vi/XnSasPR2KJI/0.jpg"
  },
  {
    title: "Python Mega Course: Build Real-World Apps and AI Agents",
    instructor: "Ardit Sulce",
    rating: "4.6",
    students: "72,919",
    price: "₹749",
    oldPrice: "₹4,999",
    tag: "Premium",
    thumbnail: "https://img.youtube.com/vi/gPvYox9JIYI/0.jpg"
  },
  {
    title: "Master Python Full Stack Development from Beginner to Advanced",
    instructor: "Code with Harry",
    rating: "4.7",
    students: "19,842",
    price: "₹699",
    oldPrice: "₹3,999",
    tag: "Premium",
    thumbnail: "https://img.youtube.com/vi/gfDE2a7MKjA/0.jpg"
  }
];

export function PaidLockedCourses() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-8 pt-2">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-white">Paid courses</h1>
        <p className="mt-1 text-sm text-neutral-400">Premium courses curated for you</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAID_COURSES.map((course, idx) => (
          <Link
            key={`${course.title}-${idx}`}
            href={`/payment?course=${encodeURIComponent(course.title)}`}
            className="group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/80 text-left shadow-lg transition hover:border-neutral-600"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full object-cover transition group-hover:opacity-90"
                loading="lazy"
              />
            </div>

            <div className="p-3">
              <h2 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-white">
                {course.title}
              </h2>
              <p className="mt-1 line-clamp-1 text-xs text-neutral-400">{course.instructor}</p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <span className="font-bold text-amber-400">{course.rating}</span>
                <span className="text-amber-400">★★★★★</span>
                <span className="text-neutral-500">({course.students})</span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-bold text-white">{course.price}</span>
                <span className="text-xs text-neutral-500 line-through">{course.oldPrice}</span>
              </div>

              {course.tag ? (
                <span
                  className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    course.tag === "Bestseller"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-indigo-500/25 text-indigo-200"
                  }`}
                >
                  {course.tag}
                </span>
              ) : null}
            </div>

            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <span className="text-3xl text-white/95">🔒</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="text-2xl font-bold">Documentation</h1>
      <p className="mt-4 text-gray-600">
        Project documentation lives in the repository README. Replace this page with your own docs when ready.
      </p>
      <Link href="/free-courses" className="mt-6 inline-block font-semibold text-amber-600 hover:underline">
        ← Back to courses
      </Link>
    </div>
  );
}

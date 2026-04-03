import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5x1 px-6 py-16">
        <h1 className="text-4x1 font-bold text-slate-900">
          Home Inspection App
        </h1>
        <p className="mt-4 max-w-2x1 text-lg text-slate-600">
          Create inspection projects, organize findings by category, upload photos, and generate reports.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-x1 bg-slate-900 px-5 py-3 text-white">
              Open Dashboard
          </Link>
          <Link
            href="/projects/new"
            className="rounded-x1 border border-slate-300 bg-white px-5 py-3 text-slate-900">
              New Project
            </Link>
        </div>
      </div>
    </main>
  )
}
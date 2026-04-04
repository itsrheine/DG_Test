import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-3xl text-white">
            🏠
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Home Inspection App
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Create projects, document findings, upload photos, and generate reports.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/login"
            className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center text-white"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-slate-900"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-slate-500 underline underline-offset-4"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </main>
  );
}
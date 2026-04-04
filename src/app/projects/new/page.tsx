export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">New Project</h1>
        <p className="mt-2 text-slate-600">
          Enter the property details to start a new inspection.
        </p>

        <form className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Project Name
            </label>
            <input
              type="text"
              placeholder="1000 Quaint Rd"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Client Name
            </label>
            <input
              type="text"
              placeholder="Client Name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Property Address
            </label>
            <input
              type="text"
              placeholder="1000 Quaint Rd, Oakland, CA 94610"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Inspection Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

          <button
            type="button"
            className="rounded-xl bg-slate-900 px-5 py-3 text-white"
          >
            Save Project
          </button>
        </form>
      </div>
    </main>
  );
}
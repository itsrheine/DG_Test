import Link from "next/link";

const sampleProjects = [
    {
        id: "1",
        name: "1000 Quaint Rd",
        client: "Sample Client",
        status: "Draft",
        date: "2026-04-03",
    },
    {
        id: "2",
        name: "145 Oak Street",
        client: "Test Buyer",
        status: "In Progress",
        date: "2026-04-01",
    },
];

export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="mt-2 text-slate-600">
                        Manage your home inspection projects.
                    </p>
                </div>

                <Link
                    href="/projects/new"
                    className="rounded-xl bg-slate-900 px-5 py-3 text-white"
                >
                    New Project
                </Link>
            </div>

            <div className="mt-8 grid gap-4">
                {sampleProjects.map((project) => (
                    <div
                        key={project.id}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    {project.name}
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Client: {project.client}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Date: {project.date}
                                </p>
                        </div>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                                    {project.status}
                                </span>
                            </div>
                        </div>      
                        ))}
                </div>
            </div>
        </main>
    );
}
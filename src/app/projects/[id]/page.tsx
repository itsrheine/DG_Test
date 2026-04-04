type Category = {
    title: string;
    items: string[];
};

const categories: Category[] = [
    {
        title: "Grounds",
        items: [
            "Service Walks",
            "Driveway / Parking",
            "Porch(es)",
            "Stairs / Steps",
            "Patio",
            "Deck / Balcony",
            "Fence / Wall",
            "Landscaping Affecting Foundation",
            "Retaining Wall",
            "Hose Bibs",
        ],
    },
    {
        title: "Exterior",
        items: [
            "Chimneys",
            "Gutters / Scuppers / Eavestrough",
            "Siding",
            "Trim / Soffit / Fascia / Flashing",
            "Caulking",
            "Windows & Screens",
            "Foundation",
            "Service Entry",
            "Exterior Doors",
        ],
    },
    {
        title: "Roof",
        items: [
            "Roof Visibility",
            "Style of Roof",
            "Ventilation System",
            "Flashing",
            "Valleys",
            "Condition of Roof Coverings",
            "Plumbing Vents",
        ],
    },
];

export default async function ProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-8 rounded-2x1 border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">Project ID</p>
                    <h1 className="mt-1 text-3x1 font-bold text-slate-900">
                        Inspection Project #{id}
                    </h1>
                    <p className="mt-2 text-slate-600">
                        This is where the inspector, or user, will complete sections, upload photos, and generate the final report.
                    </p>
                </div>

                <div className="space-y-6">
                    {categories.map((category) => (
                        <section
                            key={category.title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            
                            <h2 className="text-2xl font-semibold text-slate-900">
                                {category.title}
                            </h2>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                {category.items.map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-xl broder border-slate-200 p-4">

                                        <h3 className="font-medium text-slate-900">{item}</h3>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <label className="flex items-center gap2 text-sm text-slate-700">
                                                <input type="checkbox" />
                                                Repair
                                            </label>
                                            <label className="flex items=center gap-2 text-sm text-slate-700">
                                                <input type="checkbox" />
                                                Improve
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                                <input type="checkbox" />
                                                Monitor
                                            </label>
                                            <label className="flex items-center gap2 text-sm text-slate-700">
                                                <input type="checkbox" />
                                                Safety Issue
                                            </label>
                                        </div>

                                        <textarea
                                            className="mt-4 w-full rounded-xl border border-slate-300 p-3"
                                            rows={4}
                                            placeholder={`Notes for ${item}`}
                                        />

                                        <button
                                            type="button"
                                            className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700">
                                            Upload Photos
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}

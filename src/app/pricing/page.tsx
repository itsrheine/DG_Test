"use client";

import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase/client";

const plans = [
  {
    name: "Pay Per Report",
    price: "Custom",
    subtitle: "Best for occasional inspectors",
    description:
      "Only pay when you need to create a report. A simple option for low-volume use.",
    features: [
      "Single report access",
      "Project workflow tools",
      "PDF export",
      "Due dates and organization",
    ],
    cta: "Select Plan",
    highlight: false,
  },
  {
    name: "Pro",
    price: "Flexible",
    subtitle: "Best for regular monthly use",
    description:
      "Built for inspectors who need a dependable workflow every month without jumping to a full enterprise setup.",
    features: [
      "Monthly report allowance",
      "Project tracking",
      "Photos and notes",
      "PDF export",
      "Due dates",
      "Sharing tools",
    ],
    cta: "Select Plan",
    highlight: true,
  },
  {
    name: "Unlimited",
    price: "Flexible",
    subtitle: "Best for high-volume inspectors",
    description:
      "For teams or inspectors who need full access without worrying about monthly report limits.",
    features: [
      "Unlimited monthly reports",
      "Full workflow access",
      "Photos and notes",
      "PDF export",
      "Due dates",
      "Sharing tools",
      "Future premium features",
    ],
    cta: "Select Plan",
    highlight: false,
  },
];

export default function PricingPage() {
  const { showToast } = useToast();
  const supabase = createClient();

  async function handlePlanClick(planName: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/signup";
      return;
    }

    showToast(`${planName} plan coming soon`, "success");
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
            Pricing
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Simple plans for busy inspectors
          </h1>

          <p className="mt-4 text-lg text-slate-600 dark:text-zinc-400">
            Choose the plan that fits your report volume now. Pricing can grow
            with the product as more features are added.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Back to Dashboard
            </Link>

            <Link
              href="/signup"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
            >
              Start Free
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-6 shadow-sm transition ${
                plan.highlight
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  <p
                    className={`mt-1 text-sm ${
                      plan.highlight
                        ? "text-slate-200 dark:text-zinc-700"
                        : "text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    {plan.subtitle}
                  </p>
                </div>

                {plan.highlight ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white dark:bg-black/10 dark:text-black">
                    Popular
                  </span>
                ) : null}
              </div>

              <div className="mt-8">
                <p className="text-4xl font-bold">{plan.price}</p>
                <p
                  className={`mt-2 text-sm ${
                    plan.highlight
                      ? "text-slate-200 dark:text-zinc-700"
                      : "text-slate-500 dark:text-zinc-400"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-3 text-sm ${
                      plan.highlight
                        ? "text-slate-100 dark:text-zinc-800"
                        : "text-slate-700 dark:text-zinc-300"
                    }`}
                  >
                    <span className="mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handlePlanClick(plan.name)}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  plan.highlight
                    ? "bg-white text-slate-900 hover:bg-slate-100 dark:bg-black dark:text-white dark:hover:bg-zinc-800"
                    : "bg-slate-900 text-white hover:opacity-90 dark:bg-white dark:text-black"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Need something different?
          </h3>
          <p className="mt-3 text-slate-600 dark:text-zinc-400">
            Final pricing is still being refined. This page is here so the
            product has a real upgrade path while features continue to grow.
          </p>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
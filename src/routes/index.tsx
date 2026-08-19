import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { InvestorIntakeForm } from "@/components/InvestorIntakeForm";
import { InvestorProfileCard } from "@/components/InvestorProfileCard";
import { Button } from "@/components/ui/button";
import type { InvestorSubmission } from "@/lib/intake-options";

const title = "AC Intelligence — Investor Intake for African Ventures";
const description =
  "AC Intelligence matches vetted, structured African ventures with the right capital partners. Tell us what you're looking for.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  const [submission, setSubmission] = useState<InvestorSubmission | null>(null);

  return (
    <main className="min-h-screen bg-background">
      <header className="surface-panel">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <span className="text-sm font-semibold uppercase tracking-[0.22em] text-surface-foreground">
            AC <span className="text-gold">Intelligence</span>
          </span>
          <Button asChild variant="onSurface" size="sm">
            <Link to="/admin">Admin</Link>
          </Button>
        </div>

        <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Venture structuring &amp; capital advisory
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-surface-foreground sm:text-5xl">
            We match vetted, structured African ventures with the right capital partners.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-surface-foreground/75 sm:text-lg">
            Tell us what you&apos;re looking for. Five minutes now means every deal we send you is
            pre-screened against your sectors, stage, check size and structural bar — nothing else.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Structured, not scraped", "Every venture is legally and financially prepared."],
              ["Screened on your terms", "Your ranked criteria drive what reaches your inbox."],
              ["Africa-focused", "Regional depth across the continent's growth markets."],
            ].map(([heading, copy]) => (
              <div
                key={heading}
                className="rounded-lg border border-surface-foreground/15 bg-surface-foreground/5 p-4"
              >
                <p className="text-sm font-semibold text-surface-foreground">{heading}</p>
                <p className="mt-1 text-sm text-surface-foreground/70">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        {submission ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl">Thank you — profile captured</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Here&apos;s what we recorded. We&apos;ll be in touch as matching ventures clear
                structuring.
              </p>
            </div>
            <InvestorProfileCard data={submission} />
            <div className="text-center">
              <Button variant="outline" onClick={() => setSubmission(null)}>
                Submit another profile
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl">Investor intake</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Six short steps. Your answers become your Investor Profile.
              </p>
            </div>
            <InvestorIntakeForm onSubmitted={setSubmission} />
          </>
        )}
      </div>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AC Intelligence — venture structuring &amp; capital advisory.
      </footer>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { InvestorIntakeForm } from "@/components/InvestorIntakeForm";
import { InvestorProfileCard } from "@/components/InvestorProfileCard";
import { Button } from "@/components/ui/button";
import type { InvestorSubmission } from "@/lib/intake-options";

const title = "Investor Mandate Intake — AC Intelligence";
const description =
  "Define your investment mandate once. AC Intelligence screens every African opportunity against your sectors, geographies, stages, ticket size and process.";

export const Route = createFileRoute("/investors")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: InvestorsPage,
});

function InvestorsPage() {
  const [submission, setSubmission] = useState<InvestorSubmission | null>(null);

  return (
    <main className="min-h-screen bg-background">
      <header className="surface-panel">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link
            to="/"
            className="text-sm font-semibold uppercase tracking-[0.22em] text-surface-foreground"
          >
            AC <span className="text-gold">Intelligence</span>
          </Link>
          <Button asChild variant="onSurface" size="sm">
            <Link to="/submit">Submit an opportunity</Link>
          </Button>
        </div>
        <div className="mx-auto max-w-4xl px-5 pb-14 pt-6">
          <h1 className="text-3xl text-surface-foreground sm:text-4xl">Your investment mandate</h1>
          <p className="mt-3 max-w-2xl text-surface-foreground/75">
            Sectors, geographies, stages, ticket size, instruments and process. Every opportunity we
            screen is scored against this profile — you only see what fits.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-12">
        {submission ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl">Investor profile captured</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Here is what we recorded. Matching opportunities will be scored against it.
              </p>
            </div>
            <InvestorProfileCard data={submission} />
            <div className="text-center">
              <Button variant="outline" onClick={() => setSubmission(null)}>
                Submit another mandate
              </Button>
            </div>
          </div>
        ) : (
          <InvestorIntakeForm onSubmitted={setSubmission} />
        )}
      </div>
    </main>
  );
}

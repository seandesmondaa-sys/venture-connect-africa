import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

const title = "AC Intelligence — AI Investment Screening for African Capital";
const description =
  "AI-powered investment screening, readiness assessment and capital matching for African businesses and projects, by Auxilium Consult.";

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

const LOOP = [
  ["Submit", "Upload a pitch deck or answer a short, conversational intake."],
  ["Analyse", "AI extracts what is confirmed, inferred, missing or unverified."],
  ["Score", "Business quality and investment readiness, scored and explained."],
  ["Match", "Opportunities compared against real investor mandates."],
  ["Decide", "Structured decision support — the decision stays human."],
];

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <header className="surface-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <span className="text-sm font-semibold uppercase tracking-[0.22em] text-surface-foreground">
            AC <span className="text-gold">Intelligence</span>
          </span>
          <div className="flex gap-2">
            <Button asChild variant="onSurface" size="sm">
              <Link to="/admin">Auxilium team</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Auxilium Consult
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-surface-foreground sm:text-5xl">
            AC Intelligence
          </h1>
          <p className="mt-5 max-w-2xl text-base text-surface-foreground/75 sm:text-lg">
            AI-powered investment screening, readiness assessment and capital matching for African
            businesses and projects.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <Link to="/submit">Submit an Opportunity</Link>
            </Button>
            <Button asChild variant="onSurface" size="lg">
              <Link to="/investors">I&apos;m an Investor</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-2xl">The intelligence loop</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          One pass from raw material to explainable decision support. Nothing invented, nothing
          asked twice.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {LOOP.map(([step, copy], index) => (
            <div key={step} className="rounded-xl border border-border bg-card p-5">
              <span className="flex size-7 items-center justify-center rounded-full bg-gold text-xs font-semibold text-gold-foreground">
                {index + 1}
              </span>
              <p className="mt-3 font-semibold">{step}</p>
              <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 lg:grid-cols-3">
          {[
            [
              "Three separate scores",
              "Business Quality, Investment Readiness and Investor Fit stay distinct — a strong business can still be unready, and a ready company can still be a poor fit.",
            ],
            [
              "Evidence, not assertions",
              "Every extracted data point is marked confirmed, inferred, missing or needing verification. The AI never fabricates figures.",
            ],
            [
              "Human decisions",
              "AI provides analysis, scoring, risks and recommended actions. Investors and the Investment Committee decide.",
            ],
          ].map(([heading, copy]) => (
            <div key={heading}>
              <h3 className="text-lg font-semibold">{heading}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">Founders &amp; project developers</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload an existing pitch deck or talk us through the business in six short stages.
              You&apos;ll receive an investment readiness assessment and a clear list of what to fix.
            </p>
            <Button asChild variant="gold" className="mt-5">
              <Link to="/submit">Submit an Opportunity</Link>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">Investors &amp; capital providers</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Define your mandate once — sectors, geographies, stages, ticket size, instruments and
              process — and we screen every opportunity against it.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/investors">I&apos;m an Investor</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        AC Intelligence — Auxilium Consult. AI analysis is advisory; investment decisions remain
        human.
      </footer>
    </main>
  );
}

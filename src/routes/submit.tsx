import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { DeckUpload } from "@/components/DeckUpload";
import { OpportunityIntakeForm } from "@/components/OpportunityIntakeForm";
import { Button } from "@/components/ui/button";

const title = "Submit an Opportunity — AC Intelligence";
const description =
  "Upload a pitch deck or answer a short conversational intake and receive an AI investment readiness assessment from AC Intelligence.";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SubmitPage,
});

type Mode = "choose" | "deck" | "conversation";

function SubmitPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("choose");

  const goToOpportunity = (opportunityId: string) =>
    navigate({ to: "/opportunity/$id", params: { id: opportunityId } });

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
            <Link to="/investors">I&apos;m an investor</Link>
          </Button>
        </div>
        <div className="mx-auto max-w-4xl px-5 pb-14 pt-6">
          <h1 className="text-3xl text-surface-foreground sm:text-4xl">Submit an opportunity</h1>
          <p className="mt-3 max-w-2xl text-surface-foreground/75">
            Two ways in. Either way you get three scores, an assessment and a clear list of what is
            missing before capital can be raised.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12">
        {mode === "choose" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("deck")}
              className="rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-gold"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                Fastest
              </p>
              <h2 className="mt-2 text-xl font-semibold">Upload a pitch deck</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We read your PDF, populate your profile automatically and only ask about what is
                genuinely missing.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("conversation")}
              className="rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-gold"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                No deck yet
              </p>
              <h2 className="mt-2 text-xl font-semibold">Talk us through it</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Around 24 plain-language questions across six short stages — like explaining the
                business to an analyst.
              </p>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <Button type="button" variant="outline" size="sm" onClick={() => setMode("choose")}>
              ← Change method
            </Button>
            {mode === "deck" ? (
              <DeckUpload onAnalyzed={goToOpportunity} />
            ) : (
              <OpportunityIntakeForm onSubmitted={goToOpportunity} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

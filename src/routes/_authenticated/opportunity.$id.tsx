import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AssessmentPanel } from "@/components/AssessmentPanel";
import { ExtractionTable, type ExtractedField } from "@/components/ExtractionTable";
import { FollowUpForm, type FollowUp } from "@/components/FollowUpForm";
import { ScorePanel } from "@/components/ScorePanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  OPPORTUNITY_STATUSES,
  STATUS_LABELS,
  formatUsdAmount,
  type OpportunityStatus,
} from "@/lib/ac-framework";
import {
  addNote,
  getOpportunity,
  rescreenOpportunity,
  runInvestorMatching,
  updateOpportunityStatus,
} from "@/lib/opportunities.functions";

const title = "Opportunity Assessment — AC Intelligence";
const description =
  "AI screening scores, investment readiness assessment, gap questions and investor matching for a submitted opportunity.";

export const Route = createFileRoute("/_authenticated/opportunity/$id")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OpportunityPage,
});

function OpportunityPage() {
  const { id } = Route.useParams();
  const fetchDetail = useServerFn(getOpportunity);
  const rescreen = useServerFn(rescreenOpportunity);
  const match = useServerFn(runInvestorMatching);
  const setStatus = useServerFn(updateOpportunityStatus);
  const saveNote = useServerFn(addNote);

  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showInternal, setShowInternal] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => fetchDetail({ data: { id } }),
  });

  if (isPending)
    return <Shell><p className="text-muted-foreground">Loading assessment…</p></Shell>;
  if (isError || !data)
    return <Shell><p className="text-destructive">We couldn&apos;t load this opportunity.</p></Shell>;

  const opportunity = data.opportunity;
  const assessment = data.assessment;
  const matches = data.matches as {
    id: string;
    fit_score: number;
    strong_matches: unknown;
    issues: unknown;
    explanation: string | null;
    recommendation: string | null;
    investor: { investor_name: string; investor_type: string | null } | null;
  }[];
  const bestFit = matches.length ? Math.max(...matches.map((m) => m.fit_score)) : null;

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    try {
      await fn();
      await refetch();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Shell>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {STATUS_LABELS[opportunity.status as OpportunityStatus]}
            </p>
            <h1 className="mt-1 text-3xl">{opportunity.company_name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {[
                opportunity.sector,
                opportunity.country,
                opportunity.stage,
                opportunity.capital_required
                  ? `Raising ${formatUsdAmount(Number(opportunity.capital_required))}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Profile in progress"}
            </p>
          </div>
          {data.isStaff ? (
            <Button variant="outline" size="sm" onClick={() => setShowInternal((v) => !v)}>
              {showInternal ? "Hide" : "Show"} Auxilium controls
            </Button>
          ) : null}
        </div>

        <ScorePanel
          businessQuality={opportunity.business_quality_score}
          readiness={opportunity.investment_readiness_score}
          investorFit={bestFit}
          confidence={opportunity.score_confidence}
          confidenceReason={assessment?.confidence_reason ?? null}
          categoryScores={(opportunity.category_scores ?? {}) as Record<string, number>}
        />

        {assessment ? <AssessmentPanel assessment={assessment} /> : null}

        <FollowUpForm
          opportunityId={id}
          questions={data.questions as FollowUp[]}
          onAnswered={() => void refetch()}
        />

        <section className="space-y-3">
          <h2 className="text-xl">What we captured</h2>
          <p className="text-sm text-muted-foreground">
            Every data point is marked confirmed, inferred, missing or needing verification. Nothing
            here is invented.
          </p>
          <ExtractionTable fields={data.fields as ExtractedField[]} />
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl">Investor matching</h2>
            <Button
              variant="gold"
              size="sm"
              disabled={busy !== null}
              onClick={() => void run("match", () => match({ data: { id } }))}
            >
              {busy === "match" ? "Matching…" : "Run investor matching"}
            </Button>
          </div>
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No matches yet. Matching compares this profile against every registered investor
              mandate.
            </p>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => (
                <div key={m.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {m.investor?.investor_name ?? "Investor"}
                      {m.investor?.investor_type ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {m.investor.investor_type}
                        </span>
                      ) : null}
                    </p>
                    <span className="text-lg font-semibold text-primary">{m.fit_score}/100</span>
                  </div>
                  {m.explanation ? (
                    <p className="mt-2 text-sm text-muted-foreground">{m.explanation}</p>
                  ) : null}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <ItemList title="Strong matches" items={m.strong_matches} tone="text-primary" />
                    <ItemList title="Potential issues" items={m.issues} tone="text-destructive" />
                  </div>
                  {m.recommendation ? (
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-gold-foreground">
                      {m.recommendation}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        {showInternal ? (
          <section className="space-y-4 rounded-xl border border-border bg-secondary/40 p-6">
            <h2 className="text-xl">Auxilium internal controls</h2>
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="status" className="text-sm font-medium">
                Workflow status
              </label>
              <select
                id="status"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={opportunity.status}
                onChange={(e) =>
                  void run("status", () => setStatus({ data: { id, status: e.target.value } }))
                }
              >
                {OPPORTUNITY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() => void run("rescreen", () => rescreen({ data: { id } }))}
              >
                {busy === "rescreen" ? "Re-screening…" : "Re-run AI screening"}
              </Button>
            </div>

            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">
                Add an internal note
              </label>
              <Textarea
                id="note"
                rows={3}
                value={note}
                maxLength={4000}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                size="sm"
                variant="gold"
                disabled={busy !== null || !note.trim()}
                onClick={() =>
                  void run("note", async () => {
                    await saveNote({
                      data: { entityType: "opportunity", entityId: id, body: note.trim() },
                    });
                    setNote("");
                  })
                }
              >
                Save note
              </Button>
            </div>

            {data.notes.length ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Notes
                </p>
                {data.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border bg-card p-3 text-sm">
                    <p>{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.author} · {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {data.audit.length ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Audit trail
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {data.audit.map((event) => (
                    <li key={event.id}>
                      {new Date(event.created_at).toLocaleString()} — {event.actor}:{" "}
                      {event.action.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </Shell>
  );
}

function ItemList({ title, items, tone }: { title: string; items: unknown; tone: string }) {
  const list = Array.isArray(items) ? items.map(String) : [];
  if (!list.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>
      <ul className="mt-1 space-y-1 text-sm">
        {list.map((item, i) => (
          <li key={i} className={tone}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <header className="surface-panel">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link
            to="/"
            className="text-sm font-semibold uppercase tracking-[0.22em] text-surface-foreground"
          >
            AC <span className="text-gold">Intelligence</span>
          </Link>
          <Button asChild variant="onSurface" size="sm">
            <Link to="/admin">Auxilium dashboard</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-10">{children}</div>
    </main>
  );
}

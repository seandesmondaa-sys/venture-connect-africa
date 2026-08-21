type Assessment = {
  executive_summary: string | null;
  highlights: unknown;
  weaknesses: unknown;
  risks: unknown;
  missing_information: unknown;
  verification_items: unknown;
  recommended_actions: unknown;
  capital_assessment: string | null;
  recommendation: string | null;
  confidence: string | null;
};

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function Block({ title, items, tone }: { title: string; items: string[]; tone?: string }) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
            <span className={`mt-2 size-1.5 shrink-0 rounded-full ${tone ?? "bg-primary"}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AssessmentPanel({ assessment }: { assessment: Assessment }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gold-foreground">
            {assessment.recommendation ?? "Assessment"}
          </span>
          {assessment.confidence ? (
            <span className="text-xs text-muted-foreground">
              Confidence: {assessment.confidence}
            </span>
          ) : null}
        </div>
        <h3 className="mt-4 text-lg font-semibold">Executive summary</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {assessment.executive_summary ?? "No summary generated."}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          AI analysis is advisory. The final investment decision remains with human investors and
          the Auxilium Investment Committee.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Investment highlights" items={list(assessment.highlights)} />
        <Block title="Key weaknesses" items={list(assessment.weaknesses)} tone="bg-destructive" />
        <Block title="Key risks" items={list(assessment.risks)} tone="bg-destructive" />
        <Block title="Missing information" items={list(assessment.missing_information)} tone="bg-gold" />
        <Block title="Verification items" items={list(assessment.verification_items)} tone="bg-gold" />
        <Block title="Recommended actions" items={list(assessment.recommended_actions)} />
      </div>

      {assessment.capital_assessment ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Capital assessment
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {assessment.capital_assessment}
          </p>
        </div>
      ) : null}
    </div>
  );
}

import { CATEGORY_LABELS, scoreTone } from "@/lib/ac-framework";

function ScoreDial({
  label,
  score,
  caption,
}: {
  label: string;
  score: number | null | undefined;
  caption?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-4xl font-semibold ${scoreTone(score)}`}>
        {score ?? "—"}
        <span className="text-base font-normal text-muted-foreground">/100</span>
      </p>
      {caption ? <p className="mt-2 text-xs text-muted-foreground">{caption}</p> : null}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${score ?? 0}%` }}
        />
      </div>
    </div>
  );
}

export function ScorePanel({
  businessQuality,
  readiness,
  investorFit,
  confidence,
  confidenceReason,
  categoryScores,
}: {
  businessQuality: number | null;
  readiness: number | null;
  investorFit?: number | null;
  confidence?: string | null;
  confidenceReason?: string | null;
  categoryScores?: Record<string, number>;
}) {
  const categories = Object.entries(categoryScores ?? {});
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <ScoreDial label="Business Quality" score={businessQuality} />
        <ScoreDial
          label="Investment Readiness"
          score={readiness}
          caption={confidence ? `Confidence: ${confidence}` : undefined}
        />
        <ScoreDial
          label="Investor Fit"
          score={investorFit ?? null}
          caption={investorFit == null ? "Run matching to calculate" : "Best current match"}
        />
      </div>

      {confidenceReason ? (
        <p className="rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Why this confidence: </span>
          {confidenceReason}
        </p>
      ) : null}

      {categories.length ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Category scores
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {categories.map(([key, value]) => (
              <div key={key}>
                <div className="flex items-baseline justify-between text-sm">
                  <span>{CATEGORY_LABELS[key] ?? key}</span>
                  <span className={`font-semibold ${scoreTone(value)}`}>{value}</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

import { formatUsd, type InvestorSubmission } from "@/lib/intake-options";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border/60 py-3 last:border-0">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function InvestorProfileCard({ data }: { data: InvestorSubmission }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card card-elevated">
      <div className="surface-panel px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Investor Profile
        </p>
        <h2 className="mt-2 text-2xl text-surface-foreground">{data.investor_name}</h2>
        <p className="mt-1 text-sm text-surface-foreground/70">{data.contact_email}</p>
      </div>
      <dl className="px-6 py-2">
        <Row label="Sectors">
          <Chips items={data.sectors} />
        </Row>
        {data.sector_notes ? <Row label="Sector notes">{data.sector_notes}</Row> : null}
        <Row label="Stages">
          <Chips items={data.stages} />
        </Row>
        <Row label="Typical check size">
          <span className="font-semibold">
            {formatUsd(data.check_size_min)} – {formatUsd(data.check_size_max)}
          </span>
        </Row>
        <Row label="What matters most (ranked)">
          <ol className="space-y-1">
            {data.deal_priorities.map((item, i) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-semibold text-gold-foreground">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </Row>
        <Row label="Geographic focus">
          <Chips items={data.geographies_focus} />
        </Row>
        {data.geographies_avoid ? <Row label="Avoids">{data.geographies_avoid}</Row> : null}
        {data.process_notes ? <Row label="Process once interested">{data.process_notes}</Row> : null}
        <Row label="Submitted">{new Date(data.submitted_at).toLocaleString()}</Row>
      </dl>
    </div>
  );
}

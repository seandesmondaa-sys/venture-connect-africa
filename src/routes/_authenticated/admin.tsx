import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  STATUS_LABELS,
  formatUsdAmount,
  scoreTone,
  type OpportunityStatus,
} from "@/lib/ac-framework";
import { formatUsd, type InvestorSubmission } from "@/lib/intake-options";
import { listInvestorSubmissions } from "@/lib/investors.functions";
import { listAllMatches, listOpportunities } from "@/lib/opportunities.functions";

const title = "Auxilium Dashboard — AC Intelligence";
const description =
  "Internal Auxilium Consult dashboard for opportunities, investor mandates, matches and workflow status.";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "opportunities" | "investors" | "matches";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("opportunities");
  const [search, setSearch] = useState("");
  const fetchAccess = useServerFn(getMyAccess);
  const access = useQuery({ queryKey: ["my-access"], queryFn: () => fetchAccess() });

  if (access.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Checking your access…</p>
      </main>
    );
  }

  if (!access.data?.isStaff) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center card-elevated">
          <h1 className="text-2xl">Auxilium team access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This dashboard is restricted to the Auxilium Consult internal team. Ask an administrator
            to grant your account access.
          </p>
          <Button asChild variant="gold" className="mt-6">
            <Link to="/">Back to AC Intelligence</Link>
          </Button>
        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-background">
      <header className="surface-panel">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link
            to="/"
            className="text-sm font-semibold uppercase tracking-[0.22em] text-surface-foreground"
          >
            AC <span className="text-gold">Intelligence</span> · Auxilium
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="onSurface" size="sm">
              <Link to="/submit">New opportunity</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl">Deal flow</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Opportunities, investor mandates and AI-generated matches.
            </p>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="sm:w-80"
          />
        </div>

        <div className="mt-6 flex gap-2">
          {(
            [
              ["opportunities", "Opportunities"],
              ["investors", "Investors"],
              ["matches", "Matches"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                tab === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "opportunities" ? (
            <OpportunitiesTable search={search} />
          ) : tab === "investors" ? (
            <InvestorsTable search={search} />
          ) : (
            <MatchesTable search={search} />
          )}
        </div>
      </div>
    </main>
  );
}

function Panel({
  isPending,
  isError,
  empty,
  children,
}: {
  isPending: boolean;
  isError: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card card-elevated">
      {isPending ? (
        <p className="p-8 text-sm text-muted-foreground">Loading…</p>
      ) : isError ? (
        <p className="p-8 text-sm text-destructive">Could not load this data.</p>
      ) : empty ? (
        <p className="p-8 text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        children
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}

type OpportunityRow = {
  id: string;
  company_name: string;
  sector: string | null;
  country: string | null;
  stage: string | null;
  capital_required: number | string | null;
  status: string;
  business_quality_score: number | null;
  investment_readiness_score: number | null;
  score_confidence: string | null;
  submitted_at: string;
};

function OpportunitiesTable({ search }: { search: string }) {
  const fetchAll = useServerFn(listOpportunities);
  const { data, isPending, isError } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => fetchAll(),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ((data ?? []) as OpportunityRow[]).filter(
      (row) =>
        !q ||
        row.company_name.toLowerCase().includes(q) ||
        (row.sector ?? "").toLowerCase().includes(q) ||
        (row.country ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <Panel isPending={isPending} isError={isError} empty={rows.length === 0}>
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <Th>Company</Th>
            <Th>Sector / Country</Th>
            <Th>Stage</Th>
            <Th>Raising</Th>
            <Th>Quality</Th>
            <Th>Readiness</Th>
            <Th>Status</Th>
            <Th>Submitted</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3">
                <Link
                  to="/opportunity/$id"
                  params={{ id: row.id }}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {row.company_name}
                </Link>
              </td>
              <td className="px-4 py-3">
                {[row.sector, row.country].filter(Boolean).join(" · ") || "—"}
              </td>
              <td className="px-4 py-3">{row.stage ?? "—"}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {row.capital_required ? formatUsdAmount(Number(row.capital_required)) : "—"}
              </td>
              <td className={`px-4 py-3 font-semibold ${scoreTone(row.business_quality_score)}`}>
                {row.business_quality_score ?? "—"}
              </td>
              <td
                className={`px-4 py-3 font-semibold ${scoreTone(row.investment_readiness_score)}`}
              >
                {row.investment_readiness_score ?? "—"}
                {row.score_confidence ? (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    {row.score_confidence}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                  {STATUS_LABELS[row.status as OpportunityStatus] ?? row.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {new Date(row.submitted_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function InvestorsTable({ search }: { search: string }) {
  const fetchAll = useServerFn(listInvestorSubmissions);
  const { data, isPending, isError } = useQuery({
    queryKey: ["investor-submissions"],
    queryFn: () => fetchAll(),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ((data ?? []) as InvestorSubmission[]).filter(
      (row) =>
        !q ||
        row.investor_name.toLowerCase().includes(q) ||
        row.contact_email.toLowerCase().includes(q) ||
        row.sectors.join(" ").toLowerCase().includes(q) ||
        row.geographies_focus.join(" ").toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <Panel isPending={isPending} isError={isError} empty={rows.length === 0}>
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <Th>Investor</Th>
            <Th>Sectors</Th>
            <Th>Stages</Th>
            <Th>Ticket size</Th>
            <Th>Priorities</Th>
            <Th>Geographies</Th>
            <Th>Submitted</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60 align-top last:border-0">
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">{row.investor_name}</div>
                <div className="text-xs text-muted-foreground">{row.contact_email}</div>
              </td>
              <td className="px-4 py-3">{row.sectors.join(", ") || "—"}</td>
              <td className="px-4 py-3">{row.stages.join(", ") || "—"}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatUsd(row.check_size_min)} – {formatUsd(row.check_size_max)}
              </td>
              <td className="px-4 py-3">
                {row.deal_priorities.map((p, i) => `${i + 1}. ${p}`).join(" · ") || "—"}
              </td>
              <td className="px-4 py-3">
                <div>{row.geographies_focus.join(", ") || "—"}</div>
                {row.geographies_avoid ? (
                  <div className="text-xs text-muted-foreground">
                    Avoids: {row.geographies_avoid}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {new Date(row.submitted_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

type MatchRow = {
  id: string;
  fit_score: number;
  recommendation: string | null;
  explanation: string | null;
  status: string;
  created_at: string;
  opportunity: { id: string; company_name: string; sector: string | null } | null;
  investor: { investor_name: string } | null;
};

function MatchesTable({ search }: { search: string }) {
  const fetchAll = useServerFn(listAllMatches);
  const { data, isPending, isError } = useQuery({
    queryKey: ["matches"],
    queryFn: () => fetchAll(),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ((data ?? []) as unknown as MatchRow[]).filter(
      (row) =>
        !q ||
        (row.opportunity?.company_name ?? "").toLowerCase().includes(q) ||
        (row.investor?.investor_name ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <Panel isPending={isPending} isError={isError} empty={rows.length === 0}>
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <Th>Opportunity</Th>
            <Th>Investor</Th>
            <Th>Fit</Th>
            <Th>Recommendation</Th>
            <Th>Reasoning</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60 align-top last:border-0">
              <td className="px-4 py-3">
                {row.opportunity ? (
                  <Link
                    to="/opportunity/$id"
                    params={{ id: row.opportunity.id }}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {row.opportunity.company_name}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">{row.investor?.investor_name ?? "—"}</td>
              <td className={`px-4 py-3 font-semibold ${scoreTone(row.fit_score)}`}>
                {row.fit_score}
              </td>
              <td className="px-4 py-3">{row.recommendation ?? "—"}</td>
              <td className="max-w-md px-4 py-3 text-muted-foreground">{row.explanation ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

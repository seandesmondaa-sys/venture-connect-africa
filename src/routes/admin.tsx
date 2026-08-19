import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatUsd, type InvestorSubmission } from "@/lib/intake-options";
import { listInvestorSubmissions } from "@/lib/investors.functions";

const title = "Admin — AC Intelligence Investor Submissions";
const description = "Internal dashboard of investor intake submissions for AC Intelligence.";

export const Route = createFileRoute("/admin")({
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

type SortKey = "investor_name" | "sectors" | "stages" | "check_size_max" | "submitted_at";

function AdminPage() {
  const fetchAll = useServerFn(listInvestorSubmissions);
  const { data, isPending, isError } = useQuery({
    queryKey: ["investor-submissions"],
    queryFn: () => fetchAll(),
  });

  const [sortKey, setSortKey] = useState<SortKey>("submitted_at");
  const [asc, setAsc] = useState(false);
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const list = ((data ?? []) as InvestorSubmission[]).filter((row) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        row.investor_name.toLowerCase().includes(q) ||
        row.contact_email.toLowerCase().includes(q) ||
        row.sectors.join(" ").toLowerCase().includes(q) ||
        row.geographies_focus.join(" ").toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "check_size_max") cmp = a.check_size_max - b.check_size_max;
      else if (sortKey === "sectors") cmp = a.sectors.join(",").localeCompare(b.sectors.join(","));
      else if (sortKey === "stages") cmp = a.stages.join(",").localeCompare(b.stages.join(","));
      else if (sortKey === "investor_name") cmp = a.investor_name.localeCompare(b.investor_name);
      else cmp = a.submitted_at.localeCompare(b.submitted_at);
      return asc ? cmp : -cmp;
    });
  }, [data, search, sortKey, asc]);

  const sortBy = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const columns: { key: SortKey | null; label: string }[] = [
    { key: "investor_name", label: "Investor" },
    { key: "sectors", label: "Sectors" },
    { key: "stages", label: "Stages" },
    { key: "check_size_max", label: "Check size" },
    { key: null, label: "Priorities" },
    { key: null, label: "Geographies" },
    { key: "submitted_at", label: "Submitted" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <header className="surface-panel">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <span className="text-sm font-semibold uppercase tracking-[0.22em] text-surface-foreground">
            AC <span className="text-gold">Intelligence</span> · Admin
          </span>
          <Button asChild variant="onSurface" size="sm">
            <Link to="/">Intake form</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl">Investor submissions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {rows.length} {rows.length === 1 ? "profile" : "profiles"} captured
            </p>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, sector, geography"
            className="sm:w-80"
          />
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card card-elevated">
          {isPending ? (
            <p className="p-8 text-sm text-muted-foreground">Loading submissions…</p>
          ) : isError ? (
            <p className="p-8 text-sm text-destructive">Could not load submissions.</p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {columns.map((col) => (
                    <th key={col.label} className="px-4 py-3 font-medium">
                      {col.key ? (
                        <button
                          type="button"
                          onClick={() => sortBy(col.key as SortKey)}
                          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                          {col.label}
                          {sortKey === col.key ? <span>{asc ? "↑" : "↓"}</span> : null}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {col.label}
                        </span>
                      )}
                    </th>
                  ))}
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
          )}
        </div>
      </div>
    </main>
  );
}

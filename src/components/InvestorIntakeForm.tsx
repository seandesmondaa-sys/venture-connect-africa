import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  CHECK_SIZE_STEPS,
  DEAL_PRIORITIES,
  REGIONS,
  SECTORS,
  STAGES,
  formatUsd,
  type InvestorSubmission,
} from "@/lib/intake-options";
import { HORIZONS, INSTRUMENTS, INVESTOR_TYPES } from "@/lib/ac-framework";
import { submitInvestorIntake } from "@/lib/investors.functions";

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-6 first:border-0 first:pt-0">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Step {step}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">{title}</h3>
        {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function InvestorIntakeForm({
  onSubmitted,
}: {
  onSubmitted: (row: InvestorSubmission) => void;
}) {
  const submit = useServerFn(submitInvestorIntake);

  const [investorName, setInvestorName] = useState("");
  const [email, setEmail] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [sectorNotes, setSectorNotes] = useState("");
  const [stages, setStages] = useState<string[]>([]);
  const [range, setRange] = useState<[number, number]>([2, 5]);
  const [priorities, setPriorities] = useState<string[]>([...DEAL_PRIORITIES]);
  const [regions, setRegions] = useState<string[]>([]);
  const [avoid, setAvoid] = useState("");
  const [process, setProcess] = useState("");
  const [website, setWebsite] = useState("");
  const [investorType, setInvestorType] = useState("");
  const [instruments, setInstruments] = useState<string[]>([]);
  const [horizon, setHorizon] = useState("");
  const [dueDiligence, setDueDiligence] = useState("");
  const [requiredDocuments, setRequiredDocuments] = useState("");
  const [preferredContact, setPreferredContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const movePriority = (index: number, direction: -1 | 1) => {
    const next = [...priorities];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const current = next[index]!;
    next[index] = next[target]!;
    next[target] = current;
    setPriorities(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!investorName.trim()) return setError("Please add your investor or fund name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      return setError("Please add a valid contact email.");
    if (sectors.length === 0) return setError("Select at least one sector.");
    if (stages.length === 0) return setError("Select at least one stage.");

    setPending(true);
    try {
      const row = await submit({
        data: {
          investor_name: investorName.trim(),
          contact_email: email.trim(),
          sectors,
          sector_notes: sectorNotes.trim() || null,
          stages,
          check_size_min: CHECK_SIZE_STEPS[range[0]]!,
          check_size_max: CHECK_SIZE_STEPS[range[1]]!,
          deal_priorities: priorities,
          geographies_focus: regions,
          geographies_avoid: avoid.trim() || null,
          process_notes: process.trim() || null,
        },
      });
      onSubmitted(row as InvestorSubmission);
    } catch {
      setError("Something went wrong submitting the form. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-xl border border-border bg-card p-6 card-elevated sm:p-8"
    >
      <Section step={1} title="Who you are">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="investor-name">Investor / fund name</Label>
            <Input
              id="investor-name"
              value={investorName}
              maxLength={160}
              onChange={(e) => setInvestorName(e.target.value)}
              placeholder="Sahel Growth Partners"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              maxLength={255}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deals@fund.com"
            />
          </div>
        </div>
      </Section>

      <Section step={2} title="Sectors & stages" hint="Select everything that applies.">
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((sector) => {
            const active = sectors.includes(sector);
            return (
              <button
                type="button"
                key={sector}
                onClick={() => setSectors(toggle(sectors, sector))}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {sector}
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="sector-notes">Anything more specific?</Label>
          <Input
            id="sector-notes"
            value={sectorNotes}
            maxLength={500}
            onChange={(e) => setSectorNotes(e.target.value)}
            placeholder="e.g. distributed solar, B2B payments infrastructure"
          />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {STAGES.map((stage) => (
            <label
              key={stage}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm hover:bg-secondary/60"
            >
              <Checkbox
                checked={stages.includes(stage)}
                onCheckedChange={() => setStages(toggle(stages, stage))}
              />
              {stage}
            </label>
          ))}
        </div>
      </Section>

      <Section step={3} title="Typical check size" hint="Drag to set your usual range in USD.">
        <div className="rounded-lg border border-border bg-secondary/40 px-5 py-6">
          <p className="mb-6 text-2xl font-semibold text-foreground">
            {formatUsd(CHECK_SIZE_STEPS[range[0]]!)} – {formatUsd(CHECK_SIZE_STEPS[range[1]]!)}
          </p>
          <Slider
            value={range}
            min={0}
            max={CHECK_SIZE_STEPS.length - 1}
            step={1}
            onValueChange={(value) => {
              const [a, b] = value as [number, number];
              setRange([Math.min(a, b), Math.max(a, b)]);
            }}
          />
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>{formatUsd(CHECK_SIZE_STEPS[0]!)}</span>
            <span>{formatUsd(CHECK_SIZE_STEPS[CHECK_SIZE_STEPS.length - 1]!)}</span>
          </div>
        </div>
      </Section>

      <Section
        step={4}
        title="What matters most in a deal"
        hint="Rank these from most to least important."
      >
        <ol className="space-y-2">
          {priorities.map((item, index) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-semibold text-gold-foreground">
                {index + 1}
              </span>
              <span className="flex-1 text-sm">{item}</span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Move ${item} up`}
                  disabled={index === 0}
                  onClick={() => movePriority(index, -1)}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Move ${item} down`}
                  disabled={index === priorities.length - 1}
                  onClick={() => movePriority(index, 1)}
                >
                  ↓
                </Button>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section step={5} title="Geographies" hint="Where you focus — and anywhere you avoid.">
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => {
            const active = regions.includes(region);
            return (
              <button
                type="button"
                key={region}
                onClick={() => setRegions(toggle(regions, region))}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="avoid">Markets you avoid</Label>
          <Input
            id="avoid"
            value={avoid}
            maxLength={500}
            onChange={(e) => setAvoid(e.target.value)}
            placeholder="e.g. conflict-affected markets, francophone Central Africa"
          />
        </div>
      </Section>

      <Section step={6} title="Your process once interested">
        <div className="space-y-2">
          <Label htmlFor="process">Timeline and next steps</Label>
          <Textarea
            id="process"
            rows={4}
            value={process}
            maxLength={1000}
            onChange={(e) => setProcess(e.target.value)}
            placeholder="Intro call within a week, then data room review, IC in 4–6 weeks…"
          />
        </div>
      </Section>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="gold" size="lg" disabled={pending} className="w-full">
        {pending ? "Submitting…" : "Submit investor profile"}
      </Button>
    </form>
  );
}

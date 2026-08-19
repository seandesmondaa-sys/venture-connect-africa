export const SECTORS = [
  "Clean Energy",
  "Tech",
  "AgTech",
  "Fintech",
  "Healthcare",
  "Infrastructure",
  "Other",
] as const;

export const STAGES = ["Pre-seed", "Seed", "Series A", "Growth"] as const;

export const DEAL_PRIORITIES = [
  "Team",
  "Traction",
  "Financials",
  "Legal/Structural readiness",
  "Ask Coherence",
] as const;

export const REGIONS = [
  "West Africa",
  "East Africa",
  "North Africa",
  "Southern Africa",
  "Central Africa",
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Egypt",
  "Morocco",
  "Pan-African",
] as const;

export const CHECK_SIZE_STEPS = [
  25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000,
  25_000_000,
];

export function formatUsd(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toString().replace(/\.0$/, "")}M`;
  return `$${(value / 1_000).toFixed(0)}K`;
}

export type InvestorSubmission = {
  id: string;
  investor_name: string;
  contact_email: string;
  sectors: string[];
  sector_notes: string | null;
  stages: string[];
  check_size_min: number;
  check_size_max: number;
  deal_priorities: string[];
  geographies_focus: string[];
  geographies_avoid: string | null;
  process_notes: string | null;
  submitted_at: string;
};

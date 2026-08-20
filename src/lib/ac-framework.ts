// Shared AC Intelligence framework definitions (client + server safe).

export const OPPORTUNITY_FIELDS = [
  { key: "company_name", label: "Company / project name", type: "text" },
  { key: "contact_name", label: "Contact name", type: "text" },
  { key: "contact_email", label: "Contact email", type: "text" },
  { key: "website", label: "Website", type: "text" },
  { key: "sector", label: "Sector", type: "text" },
  { key: "country", label: "Country", type: "text" },
  { key: "region", label: "Region", type: "text" },
  { key: "stage", label: "Current stage", type: "text" },
  { key: "business_description", label: "Business / project description", type: "long" },
  { key: "problem", label: "Problem", type: "long" },
  { key: "solution", label: "Solution", type: "long" },
  { key: "market", label: "Market", type: "long" },
  { key: "business_model", label: "Business model", type: "long" },
  { key: "competition", label: "Competitive position", type: "long" },
  { key: "traction", label: "Traction", type: "long" },
  { key: "revenue_summary", label: "Revenue", type: "long" },
  { key: "team", label: "Team", type: "long" },
  { key: "capital_required", label: "Capital requirement (USD)", type: "number" },
  { key: "instrument", label: "Instrument sought", type: "text" },
  { key: "use_of_funds", label: "Use of funds", type: "long" },
  { key: "existing_funding", label: "Existing funding", type: "long" },
  { key: "growth_plans", label: "Growth plans", type: "long" },
  { key: "financials", label: "Financial information", type: "long" },
  { key: "risks", label: "Key risks", type: "long" },
] as const;

export type OpportunityFieldKey = (typeof OPPORTUNITY_FIELDS)[number]["key"];

export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  OPPORTUNITY_FIELDS.map((f) => [f.key, f.label]),
);

export const FIELD_STATUSES = [
  "CONFIRMED",
  "INFERRED",
  "MISSING",
  "NEEDS_VERIFICATION",
] as const;
export type FieldStatus = (typeof FIELD_STATUSES)[number];

export const OPPORTUNITY_STATUSES = [
  "submitted",
  "ai_screening",
  "information_required",
  "investment_ready",
  "auxilium_review",
  "investor_matching",
  "investor_interest",
  "due_diligence",
  "investment_committee",
  "term_sheet",
  "closed",
  "portfolio",
  "rejected",
] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  submitted: "Submitted",
  ai_screening: "AI Screening",
  information_required: "Information Required",
  investment_ready: "Investment Ready",
  auxilium_review: "Auxilium Review",
  investor_matching: "Investor Matching",
  investor_interest: "Investor Interest",
  due_diligence: "Due Diligence",
  investment_committee: "Investment Committee",
  term_sheet: "Term Sheet",
  closed: "Closed",
  portfolio: "Portfolio",
  rejected: "Rejected / Archived",
};

export const RECOMMENDATIONS = [
  "Strong Candidate",
  "Proceed to Further Review",
  "Investment Readiness Improvements Required",
  "Insufficient Information",
  "Poor Investor Fit",
  "Decline / Do Not Proceed",
] as const;

export const BUSINESS_QUALITY_CATEGORIES = [
  "market",
  "team",
  "traction",
  "business_model",
  "competitive_position",
  "scalability",
] as const;

export const READINESS_CATEGORIES = [
  "financial_strength",
  "documentation",
  "legal_structural_readiness",
  "governance",
  "ask_coherence",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  market: "Market",
  team: "Team",
  traction: "Traction",
  business_model: "Business Model",
  competitive_position: "Competitive Position",
  scalability: "Scalability",
  financial_strength: "Financial Strength",
  documentation: "Documentation Quality",
  legal_structural_readiness: "Legal / Structural Readiness",
  governance: "Governance",
  ask_coherence: "Ask Coherence",
};

// ~24 conversational questions across six stages.
export const INTAKE_STAGES: {
  title: string;
  hint: string;
  questions: { key: OpportunityFieldKey; label: string; placeholder: string; type: "text" | "long" | "number" }[];
}[] = [
  {
    title: "The basics",
    hint: "Tell us who you are.",
    questions: [
      { key: "company_name", label: "What is the name of your business or project?", placeholder: "Sahel Solar Ltd", type: "text" },
      { key: "contact_name", label: "Who are we speaking with?", placeholder: "Full name", type: "text" },
      { key: "contact_email", label: "What is the best email to reach you on?", placeholder: "founder@company.com", type: "text" },
      { key: "website", label: "Do you have a website or data room link?", placeholder: "https://", type: "text" },
    ],
  },
  {
    title: "What you do",
    hint: "Explain it the way you would to an intelligent analyst.",
    questions: [
      { key: "business_description", label: "In a few sentences, what does the business or project do?", placeholder: "We build and operate…", type: "long" },
      { key: "problem", label: "What problem are you solving, and for whom?", placeholder: "Describe the pain point and who feels it", type: "long" },
      { key: "solution", label: "How does your solution work?", placeholder: "Product, service or project structure", type: "long" },
      { key: "business_model", label: "How do you make money?", placeholder: "Pricing, unit economics, contracts", type: "long" },
    ],
  },
  {
    title: "Market & position",
    hint: "Where you play and who else is there.",
    questions: [
      { key: "sector", label: "Which sector best describes you?", placeholder: "Clean Energy, Fintech, AgTech…", type: "text" },
      { key: "country", label: "Which country are you primarily operating in?", placeholder: "Ghana", type: "text" },
      { key: "region", label: "Which wider region do you serve?", placeholder: "West Africa", type: "text" },
      { key: "market", label: "How big is the market and why is it growing?", placeholder: "Size, drivers, demand evidence", type: "long" },
      { key: "competition", label: "Who else does this, and why do customers choose you?", placeholder: "Competitors and your edge", type: "long" },
    ],
  },
  {
    title: "Where you are today",
    hint: "Stage, traction and revenue.",
    questions: [
      { key: "stage", label: "What stage are you at?", placeholder: "Pre-seed, Seed, Series A, Growth, Project development…", type: "text" },
      { key: "traction", label: "What have you achieved so far?", placeholder: "Customers, volumes, partnerships, milestones", type: "long" },
      { key: "revenue_summary", label: "What is your revenue picture?", placeholder: "Last full year and year-to-date figures", type: "long" },
      { key: "team", label: "Who is on the team and why are they the right people?", placeholder: "Founders, key hires, relevant experience", type: "long" },
    ],
  },
  {
    title: "The capital ask",
    hint: "What you need and what it buys.",
    questions: [
      { key: "capital_required", label: "How much capital are you raising (USD)?", placeholder: "2500000", type: "number" },
      { key: "instrument", label: "What kind of capital are you looking for?", placeholder: "Equity, debt, blended, grant", type: "text" },
      { key: "use_of_funds", label: "How will the money be used?", placeholder: "Allocation across activities", type: "long" },
      { key: "existing_funding", label: "What funding have you already raised?", placeholder: "Rounds, investors, amounts, debt", type: "long" },
    ],
  },
  {
    title: "Forward view",
    hint: "Plans, numbers and honest risks.",
    questions: [
      { key: "growth_plans", label: "What does growth look like over the next 24–36 months?", placeholder: "Plans and milestones", type: "long" },
      { key: "financials", label: "What do your financials and projections show?", placeholder: "Margins, cash position, projections and key assumptions", type: "long" },
      { key: "risks", label: "What are the biggest risks to this business or project?", placeholder: "Be candid — this improves your assessment", type: "long" },
    ],
  },
];

export const INVESTOR_TYPES = [
  "Angel",
  "Venture Capital",
  "Private Equity",
  "Family Office",
  "DFI",
  "Bank / Debt Fund",
  "Impact Fund",
  "Corporate / Strategic",
] as const;

export const INSTRUMENTS = ["Equity", "Debt", "Mezzanine", "Blended finance", "Grant"] as const;

export const HORIZONS = ["1–3 years", "3–5 years", "5–7 years", "7–10 years", "10+ years"] as const;

export function scoreTone(score: number | null | undefined) {
  if (score == null) return "text-muted-foreground";
  if (score >= 75) return "text-primary";
  if (score >= 55) return "text-gold";
  return "text-destructive";
}

export function statusTone(status: FieldStatus) {
  switch (status) {
    case "CONFIRMED":
      return "bg-primary/10 text-primary border-primary/30";
    case "INFERRED":
      return "bg-gold/15 text-gold-foreground border-gold/40";
    case "NEEDS_VERIFICATION":
      return "bg-accent text-accent-foreground border-border";
    default:
      return "bg-destructive/10 text-destructive border-destructive/30";
  }
}

export function formatUsdAmount(value: number | null | undefined) {
  if (value == null) return "—";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

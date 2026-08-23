// Server-only AC Intelligence engine: extraction, screening, matching, workflow.
import { aiJson, type ContentBlock } from "./ai.server";
import {
  BUSINESS_QUALITY_CATEGORIES,
  FIELD_LABELS,
  OPPORTUNITY_FIELDS,
  READINESS_CATEGORIES,
  RECOMMENDATIONS,
  type FieldStatus,
  type OpportunityStatus,
} from "./ac-framework";

type AnyRecord = Record<string, unknown>;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const FIELD_KEYS = OPPORTUNITY_FIELDS.map((f) => f.key) as string[];

function clampScore(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).filter(Boolean).slice(0, 12);
}

function parseCapital(value: unknown): number | null {
  if (value == null) return null;
  const raw = String(value).toLowerCase().replace(/[, $]/g, "");
  const m = raw.match(/([\d.]+)\s*(m|k|bn|b)?/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2];
  if (unit === "m") return Math.round(n * 1_000_000);
  if (unit === "b" || unit === "bn") return Math.round(n * 1_000_000_000);
  if (unit === "k") return Math.round(n * 1_000);
  return Math.round(n);
}

export async function logAudit(
  entityType: string,
  entityId: string,
  action: string,
  detail: AnyRecord = {},
  actor = "auxilium_internal",
) {
  const db = await admin();
  await db.from("audit_events").insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    detail: detail as never,
    actor,
  });
}

/* ------------------------------ Extraction ------------------------------ */

const EXTRACTION_SYSTEM = `You are an investment analyst for Auxilium Consult, an African capital advisory firm.
You read founder-supplied material and map it onto the AC Intelligence opportunity profile.

Rules:
- NEVER invent information. Do not fabricate financials, traction, customers, investors or market size.
- Mark each field with exactly one status:
  CONFIRMED = explicitly stated in the material.
  INFERRED = reasonably inferred but not explicitly stated.
  MISSING = required by the framework but not found.
  NEEDS_VERIFICATION = stated but a claim that should be independently verified.
- For MISSING fields leave value as null.
- Generate targeted follow-up questions ONLY for information that is missing, vague or unverifiable.
  Never ask for something the material already answers.
Return strict JSON only.`;

type ExtractionResult = {
  fields: { field_key: string; value: string | null; status: string; source_note?: string }[];
  follow_up_questions: { field_key?: string; question: string; rationale?: string }[];
};

function extractionInstruction() {
  return `Extract these fields (field_key — label):
${OPPORTUNITY_FIELDS.map((f) => `- ${f.key} — ${f.label}`).join("\n")}

Respond with JSON of shape:
{"fields":[{"field_key":"...","value":"..."|null,"status":"CONFIRMED|INFERRED|MISSING|NEEDS_VERIFICATION","source_note":"where it came from or why inferred"}],
 "follow_up_questions":[{"field_key":"...","question":"...","rationale":"..."}]}
Include every field_key exactly once. Keep values concise but complete (max ~600 characters).
Produce between 3 and 12 follow-up questions.`;
}

export async function analyzePitchDeck(input: {
  fileName: string;
  mimeType: string;
  base64: string;
  ownerUserId: string;
}) {
  const db = await admin();

  const content: ContentBlock[] = [
    { type: "text", text: extractionInstruction() },
    {
      type: "file",
      file: { filename: input.fileName, file_data: `data:${input.mimeType};base64,${input.base64}` },
    },
  ];

  const result = await aiJson<ExtractionResult>({ system: EXTRACTION_SYSTEM, content });

  const byKey = new Map<string, { value: string | null; status: FieldStatus; source_note: string | null }>();
  for (const f of result.fields ?? []) {
    if (!FIELD_KEYS.includes(f.field_key)) continue;
    const status = (["CONFIRMED", "INFERRED", "MISSING", "NEEDS_VERIFICATION"] as const).includes(
      f.status as FieldStatus,
    )
      ? (f.status as FieldStatus)
      : "MISSING";
    byKey.set(f.field_key, {
      value: f.value ? String(f.value).slice(0, 2000) : null,
      status: f.value ? status : "MISSING",
      source_note: f.source_note ? String(f.source_note).slice(0, 500) : null,
    });
  }

  const companyName = byKey.get("company_name")?.value ?? input.fileName.replace(/\.[^.]+$/, "");

  const row: AnyRecord = {
    company_name: companyName,
    submission_method: "deck",
    status: "ai_screening",
    owner_user_id: input.ownerUserId,
  };

  for (const key of FIELD_KEYS) {
    if (key === "company_name") continue;
    const entry = byKey.get(key);
    if (!entry?.value) continue;
    row[key] = key === "capital_required" ? parseCapital(entry.value) : entry.value;
  }

  const { data: opportunity, error } = await db
    .from("opportunities")
    .insert(row as never)
    .select()
    .single();
  if (error) throw new Error(error.message);

  const opportunityId = (opportunity as { id: string }).id;

  // Upload the raw document for future document intelligence.
  let storagePath: string | null = null;
  try {
    const bytes = Uint8Array.from(atob(input.base64), (c) => c.charCodeAt(0));
    const path = `${opportunityId}/${Date.now()}-${input.fileName.replace(/[^\w.\-]/g, "_")}`;
    const upload = await db.storage
      .from("opportunity-documents")
      .upload(path, bytes, { contentType: input.mimeType, upsert: false });
    if (!upload.error) storagePath = path;
  } catch {
    /* storage failure must not lose the analysis */
  }

  const { data: doc } = await db
    .from("opportunity_documents")
    .insert({
      opportunity_id: opportunityId,
      doc_type: "pitch_deck",
      file_name: input.fileName,
      mime_type: input.mimeType,
      storage_path: storagePath,
    } as never)
    .select()
    .single();

  const documentId = (doc as { id: string } | null)?.id ?? null;

  await db.from("extracted_fields").insert(
    FIELD_KEYS.map((key) => {
      const entry = byKey.get(key);
      return {
        opportunity_id: opportunityId,
        document_id: documentId,
        field_key: key,
        field_label: FIELD_LABELS[key] ?? key,
        value: entry?.value ?? null,
        status: entry?.status ?? "MISSING",
        source_note: entry?.source_note ?? null,
      };
    }) as never,
  );

  const followUps = (result.follow_up_questions ?? []).slice(0, 12).filter((q) => q?.question);
  if (followUps.length) {
    await db.from("follow_up_questions").insert(
      followUps.map((q) => ({
        opportunity_id: opportunityId,
        field_key: q.field_key && FIELD_KEYS.includes(q.field_key) ? q.field_key : null,
        question: String(q.question).slice(0, 500),
        rationale: q.rationale ? String(q.rationale).slice(0, 500) : null,
      })) as never,
    );
  }

  await logAudit("opportunity", opportunityId, "deck_analyzed", { file: input.fileName }, "ai");
  return opportunityId;
}

/* --------------------------- Conversational intake --------------------------- */

export async function createOpportunityFromAnswers(
  answers: Record<string, string>,
  ownerUserId: string,
) {
  const db = await admin();
  const row: AnyRecord = {
    company_name: answers["company_name"]?.trim() || "Unnamed opportunity",
    submission_method: "conversational",
    status: "ai_screening",
    owner_user_id: ownerUserId,
  };
  for (const key of FIELD_KEYS) {
    if (key === "company_name") continue;
    const value = answers[key]?.trim();
    if (!value) continue;
    row[key] = key === "capital_required" ? parseCapital(value) : value;
  }

  const { data, error } = await db.from("opportunities").insert(row as never).select().single();
  if (error) throw new Error(error.message);
  const opportunityId = (data as { id: string }).id;

  await db.from("extracted_fields").insert(
    FIELD_KEYS.map((key) => {
      const value = answers[key]?.trim() || null;
      return {
        opportunity_id: opportunityId,
        field_key: key,
        field_label: FIELD_LABELS[key] ?? key,
        value,
        status: value ? "CONFIRMED" : "MISSING",
        source_note: value ? "Stated directly by the founder during intake" : null,
      };
    }) as never,
  );

  await logAudit("opportunity", opportunityId, "conversational_intake_submitted", {}, "founder");
  return opportunityId;
}

/* ------------------------------- Screening ------------------------------- */

const SCREENING_SYSTEM = `You are the screening engine of AC Intelligence (Auxilium Consult).
You assess African business and project investment opportunities. You NEVER make the investment decision;
you provide structured, explainable decision support for human investors and the Investment Committee.

Principles:
- Do not invent facts. If information is absent, say it is absent and lower confidence.
- Keep Business Quality and Investment Readiness conceptually separate.
- Score 0-100 per category and overall. Confidence must reflect information completeness.
Return strict JSON only.`;

type ScreeningResult = {
  executive_summary: string;
  highlights: string[];
  weaknesses: string[];
  risks: string[];
  missing_information: string[];
  verification_items: string[];
  recommended_actions: string[];
  capital_assessment: string;
  business_quality_score: number;
  investment_readiness_score: number;
  category_scores: Record<string, number>;
  confidence: string;
  confidence_reason: string;
  recommendation: string;
  follow_up_questions?: { field_key?: string; question: string; rationale?: string }[];
};

function profileText(opportunity: AnyRecord, extracted: AnyRecord[], answered: AnyRecord[]) {
  const lines = FIELD_KEYS.map((key) => {
    const field = extracted.find((f) => f["field_key"] === key);
    const value = (opportunity[key] as string | number | null) ?? (field?.["value"] as string | null);
    const status = (field?.["status"] as string) ?? (value ? "CONFIRMED" : "MISSING");
    return `- ${FIELD_LABELS[key]} [${status}]: ${value ?? "MISSING"}`;
  });
  const answers = answered
    .filter((q) => q["answer"])
    .map((q) => `- Q: ${q["question"]}\n  A: ${q["answer"]}`);
  return `OPPORTUNITY PROFILE\n${lines.join("\n")}${
    answers.length ? `\n\nFOUNDER ANSWERS TO FOLLOW-UP QUESTIONS\n${answers.join("\n")}` : ""
  }`;
}

export async function runScreening(opportunityId: string) {
  const db = await admin();
  const [{ data: opportunity }, { data: extracted }, { data: questions }, { data: config }] =
    await Promise.all([
      db.from("opportunities").select("*").eq("id", opportunityId).single(),
      db.from("extracted_fields").select("*").eq("opportunity_id", opportunityId),
      db.from("follow_up_questions").select("*").eq("opportunity_id", opportunityId),
      db.from("scoring_config").select("*"),
    ]);
  if (!opportunity) throw new Error("Opportunity not found.");

  const weights = Object.fromEntries(
    ((config ?? []) as AnyRecord[]).map((c) => [c["key"], c["weights"]]),
  );

  const instruction = `${profileText(opportunity as AnyRecord, (extracted ?? []) as AnyRecord[], (questions ?? []) as AnyRecord[])}

Configured scoring weights (apply them when aggregating category scores):
${JSON.stringify(weights)}

Score these Business Quality categories: ${BUSINESS_QUALITY_CATEGORIES.join(", ")}.
Score these Investment Readiness categories: ${READINESS_CATEGORIES.join(", ")}.
Recommendation must be exactly one of: ${RECOMMENDATIONS.join(" | ")}.
Confidence must be one of: High | Medium | Low.

Respond with JSON:
{"executive_summary":"...","highlights":["..."],"weaknesses":["..."],"risks":["..."],
 "missing_information":["..."],"verification_items":["..."],"recommended_actions":["..."],
 "capital_assessment":"whether the ask is coherent given stage, traction, financials, use of funds and growth opportunity",
 "business_quality_score":0,"investment_readiness_score":0,
 "category_scores":{"market":0,"team":0,"traction":0,"business_model":0,"competitive_position":0,"scalability":0,"financial_strength":0,"documentation":0,"legal_structural_readiness":0,"governance":0,"ask_coherence":0},
 "confidence":"High|Medium|Low","confidence_reason":"...","recommendation":"...",
 "follow_up_questions":[{"field_key":"...","question":"...","rationale":"..."}]}`;

  const result = await aiJson<ScreeningResult>({ system: SCREENING_SYSTEM, content: instruction });

  const bq = clampScore(result.business_quality_score);
  const ir = clampScore(result.investment_readiness_score);
  const categoryScores: Record<string, number> = {};
  for (const [key, value] of Object.entries(result.category_scores ?? {})) {
    const score = clampScore(value);
    if (score != null) categoryScores[key] = score;
  }
  const recommendation = RECOMMENDATIONS.includes(result.recommendation as never)
    ? result.recommendation
    : "Proceed to Further Review";

  await db.from("assessments").insert({
    opportunity_id: opportunityId,
    executive_summary: result.executive_summary ?? null,
    highlights: asStringArray(result.highlights) as never,
    weaknesses: asStringArray(result.weaknesses) as never,
    risks: asStringArray(result.risks) as never,
    missing_information: asStringArray(result.missing_information) as never,
    verification_items: asStringArray(result.verification_items) as never,
    recommended_actions: asStringArray(result.recommended_actions) as never,
    capital_assessment: result.capital_assessment ?? null,
    business_quality_score: bq,
    investment_readiness_score: ir,
    category_scores: categoryScores as never,
    confidence: result.confidence ?? "Medium",
    confidence_reason: result.confidence_reason ?? null,
    recommendation,
    model: "google/gemini-3.7-flash",
  } as never);

  const unanswered = ((questions ?? []) as AnyRecord[]).filter((q) => !q["answer"]).length;
  const nextStatus: OpportunityStatus =
    (result.missing_information?.length ?? 0) > 0 || unanswered > 0
      ? "information_required"
      : (ir ?? 0) >= 70
        ? "investment_ready"
        : "auxilium_review";

  await db
    .from("opportunities")
    .update({
      business_quality_score: bq,
      investment_readiness_score: ir,
      score_confidence: result.confidence ?? "Medium",
      category_scores: categoryScores as never,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", opportunityId);

  // Add any newly identified gap questions that are not already asked.
  const existing = new Set(((questions ?? []) as AnyRecord[]).map((q) => String(q["question"]).toLowerCase()));
  const fresh = (result.follow_up_questions ?? [])
    .filter((q) => q?.question && !existing.has(String(q.question).toLowerCase()))
    .slice(0, 8);
  if (fresh.length) {
    await db.from("follow_up_questions").insert(
      fresh.map((q) => ({
        opportunity_id: opportunityId,
        field_key: q.field_key && FIELD_KEYS.includes(q.field_key) ? q.field_key : null,
        question: String(q.question).slice(0, 500),
        rationale: q.rationale ? String(q.rationale).slice(0, 500) : null,
      })) as never,
    );
  }

  await logAudit("opportunity", opportunityId, "screening_completed", { recommendation }, "ai");
  return opportunityId;
}

/* -------------------------------- Matching -------------------------------- */

const MATCH_SYSTEM = `You are the investor matching engine of AC Intelligence.
Compare one opportunity profile against one investor mandate and explain the fit.
Never invent mandate criteria or opportunity facts. Explain the reasoning, do not just output a number.
Return strict JSON only.`;

type MatchResult = {
  fit_score: number;
  strong_matches: string[];
  issues: string[];
  explanation: string;
  recommendation: string;
};

export async function generateMatches(opportunityId: string) {
  const db = await admin();
  const [{ data: opportunity }, { data: extracted }, { data: investors }] = await Promise.all([
    db.from("opportunities").select("*").eq("id", opportunityId).single(),
    db.from("extracted_fields").select("*").eq("opportunity_id", opportunityId),
    db.from("investor_submissions").select("*").limit(25),
  ]);
  if (!opportunity) throw new Error("Opportunity not found.");
  const list = (investors ?? []) as AnyRecord[];
  if (!list.length) return 0;

  const profile = profileText(opportunity as AnyRecord, (extracted ?? []) as AnyRecord[], []);

  await db.from("investor_matches").delete().eq("opportunity_id", opportunityId);

  let created = 0;
  for (const investor of list) {
    try {
      const instruction = `${profile}

INVESTOR MANDATE
- Investor: ${investor["investor_name"]}
- Type: ${investor["investor_type"] ?? "Not stated"}
- Sectors: ${(investor["sectors"] as string[])?.join(", ") || "Not stated"} (${investor["sector_notes"] ?? ""})
- Stages: ${(investor["stages"] as string[])?.join(", ") || "Not stated"}
- Ticket size: ${investor["check_size_min"]} to ${investor["check_size_max"]} USD
- Instruments: ${(investor["instruments"] as string[])?.join(", ") || "Not stated"}
- Geographies focus: ${(investor["geographies_focus"] as string[])?.join(", ") || "Not stated"}
- Countries: ${(investor["countries"] as string[])?.join(", ") || "Not stated"}
- Geographies avoided: ${investor["geographies_avoid"] ?? "None stated"}
- Ranked priorities: ${(investor["deal_priorities"] as string[])?.join(" > ") || "Not stated"}
- Horizon: ${investor["investment_horizon"] ?? "Not stated"}

Respond with JSON:
{"fit_score":0,"strong_matches":["Energy mandate ✓"],"issues":["..."],"explanation":"...","recommendation":"Strong Candidate|Proceed to Further Review|Investment Readiness Improvements Required|Insufficient Information|Poor Investor Fit|Decline / Do Not Proceed"}`;

      const result = await aiJson<MatchResult>({ system: MATCH_SYSTEM, content: instruction });
      await db.from("investor_matches").insert({
        opportunity_id: opportunityId,
        investor_id: investor["id"] as string,
        fit_score: clampScore(result.fit_score) ?? 0,
        strong_matches: asStringArray(result.strong_matches) as never,
        issues: asStringArray(result.issues) as never,
        explanation: result.explanation ?? null,
        recommendation: result.recommendation ?? null,
      } as never);
      created += 1;
    } catch {
      /* skip an investor whose match call fails */
    }
  }

  await db
    .from("opportunities")
    .update({ status: "investor_matching", updated_at: new Date().toISOString() } as never)
    .eq("id", opportunityId);
  await logAudit("opportunity", opportunityId, "matches_generated", { count: created }, "ai");
  return created;
}

/* ------------------------------- Read models ------------------------------- */

export async function getOpportunityDetail(opportunityId: string) {
  const db = await admin();
  const [opportunity, fields, questions, assessments, matches, documents, notes, audit] =
    await Promise.all([
      db.from("opportunities").select("*").eq("id", opportunityId).single(),
      db.from("extracted_fields").select("*").eq("opportunity_id", opportunityId),
      db.from("follow_up_questions").select("*").eq("opportunity_id", opportunityId).order("created_at"),
      db
        .from("assessments")
        .select("*")
        .eq("opportunity_id", opportunityId)
        .order("created_at", { ascending: false }),
      db
        .from("investor_matches")
        .select("*, investor:investor_submissions(id, investor_name, investor_type)")
        .eq("opportunity_id", opportunityId)
        .order("fit_score", { ascending: false }),
      db.from("opportunity_documents").select("*").eq("opportunity_id", opportunityId),
      db
        .from("entity_notes")
        .select("*")
        .eq("entity_id", opportunityId)
        .order("created_at", { ascending: false }),
      db
        .from("audit_events")
        .select("*")
        .eq("entity_id", opportunityId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  if (opportunity.error) throw new Error(opportunity.error.message);

  const order = new Map(FIELD_KEYS.map((k, i) => [k, i]));
  const sortedFields = [...(fields.data ?? [])].sort(
    (a, b) => (order.get(a.field_key) ?? 99) - (order.get(b.field_key) ?? 99),
  );

  return {
    opportunity: opportunity.data,
    fields: sortedFields,
    questions: questions.data ?? [],
    assessment: (assessments.data ?? [])[0] ?? null,
    assessmentHistory: assessments.data ?? [],
    matches: matches.data ?? [],
    documents: documents.data ?? [],
    notes: notes.data ?? [],
    audit: audit.data ?? [],
  };
}

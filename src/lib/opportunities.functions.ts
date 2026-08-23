import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const answersSchema = z.record(z.string(), z.string().max(4000));

export const submitOpportunityIntake = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ answers: answersSchema }).parse(data))
  .handler(async ({ data, context }) => {
    const engine = await import("./opportunity-engine.server");
    const id = await engine.createOpportunityFromAnswers(data.answers, context.userId);
    await engine.runScreening(id);
    return { opportunityId: id };
  });

export const analyzePitchDeckUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(120),
        base64: z.string().min(16),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const engine = await import("./opportunity-engine.server");
    const id = await engine.analyzePitchDeck({ ...data, ownerUserId: context.userId });
    await engine.runScreening(id);
    return { opportunityId: id };
  });

export const getOpportunity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { requireOpportunityAccess } = await import("./authz.server");
    const { staff } = await requireOpportunityAccess(context.userId, data.id);
    const engine = await import("./opportunity-engine.server");
    const detail = await engine.getOpportunityDetail(data.id);
    // Internal-only material stays with the Auxilium team.
    if (!staff) return { ...detail, matches: [], notes: [], audit: [], isStaff: false };
    return { ...detail, isStaff: true };
  });

export const answerFollowUps = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        opportunityId: z.string().uuid(),
        answers: z
          .array(z.object({ id: z.string().uuid(), answer: z.string().trim().min(1).max(3000) }))
          .min(1),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { requireOpportunityAccess } = await import("./authz.server");
    await requireOpportunityAccess(context.userId, data.opportunityId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./opportunity-engine.server");

    const { data: questions } = await supabaseAdmin
      .from("follow_up_questions")
      .select("*")
      .eq("opportunity_id", data.opportunityId);

    for (const item of data.answers) {
      const question = (questions ?? []).find((q) => q.id === item.id);
      if (!question) continue;
      await supabaseAdmin
        .from("follow_up_questions")
        .update({ answer: item.answer, answered_at: new Date().toISOString() })
        .eq("id", item.id);

      if (question.field_key) {
        await supabaseAdmin
          .from("extracted_fields")
          .update({ value: item.answer, status: "CONFIRMED", source_note: "Answered by the founder" })
          .eq("opportunity_id", data.opportunityId)
          .eq("field_key", question.field_key);
      }
    }

    await engine.logAudit(
      "opportunity",
      data.opportunityId,
      "follow_ups_answered",
      { count: data.answers.length },
      "founder",
    );
    await engine.runScreening(data.opportunityId);
    return { ok: true };
  });

export const rescreenOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { requireOpportunityAccess } = await import("./authz.server");
    await requireOpportunityAccess(context.userId, data.id);
    const engine = await import("./opportunity-engine.server");
    await engine.runScreening(data.id);
    return { ok: true };
  });

export const runInvestorMatching = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./authz.server");
    await requireStaff(context.userId);
    const engine = await import("./opportunity-engine.server");
    const count = await engine.generateMatches(data.id);
    return { count };
  });

export const listOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./authz.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("opportunities")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAllMatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./authz.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("investor_matches")
      .select(
        "*, investor:investor_submissions(id, investor_name, investor_type), opportunity:opportunities(id, company_name, sector, country)",
      )
      .order("fit_score", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateOpportunityStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.string().max(40) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./authz.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./opportunity-engine.server");
    const { error } = await supabaseAdmin
      .from("opportunities")
      .update({ status: data.status as never, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await engine.logAudit("opportunity", data.id, "status_changed", { status: data.status });
    return { ok: true };
  });

export const overrideScores = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        business_quality_score: z.number().int().min(0).max(100).nullable(),
        investment_readiness_score: z.number().int().min(0).max(100).nullable(),
        reason: z.string().trim().min(1).max(1000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./authz.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./opportunity-engine.server");
    const { error } = await supabaseAdmin
      .from("opportunities")
      .update({
        business_quality_score: data.business_quality_score,
        investment_readiness_score: data.investment_readiness_score,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await engine.logAudit("opportunity", data.id, "scores_overridden", {
      business_quality_score: data.business_quality_score,
      investment_readiness_score: data.investment_readiness_score,
      reason: data.reason,
    });
    return { ok: true };
  });

export const updateExtractedField = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        fieldId: z.string().uuid(),
        opportunityId: z.string().uuid(),
        value: z.string().max(4000).nullable(),
        status: z.enum(["CONFIRMED", "INFERRED", "MISSING", "NEEDS_VERIFICATION"]),
        verified: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./authz.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./opportunity-engine.server");
    const { data: row, error } = await supabaseAdmin
      .from("extracted_fields")
      .update({ value: data.value, status: data.status, verified: data.verified })
      .eq("id", data.fieldId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await engine.logAudit("opportunity", data.opportunityId, "field_corrected", {
      field_key: row?.field_key,
      status: data.status,
      verified: data.verified,
    });
    return { ok: true };
  });

export const addNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        entityType: z.string().max(40),
        entityId: z.string().uuid(),
        body: z.string().trim().min(1).max(4000),
        author: z.string().trim().max(120).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./authz.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("entity_notes").insert({
      entity_type: data.entityType,
      entity_id: data.entityId,
      body: data.body,
      author: data.author ?? "Auxilium team",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { isStaff } = await import("./authz.server");
    return { userId: context.userId, isStaff: await isStaff(context.userId) };
  });

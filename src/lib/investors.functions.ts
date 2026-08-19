import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submissionSchema = z.object({
  investor_name: z.string().trim().min(1).max(160),
  contact_email: z.string().trim().email().max(255),
  sectors: z.array(z.string().max(60)).max(20),
  sector_notes: z.string().trim().max(500).nullish().transform((v) => v ?? null),
  stages: z.array(z.string().max(40)).max(10),
  check_size_min: z.number().int().min(0).max(1_000_000_000),
  check_size_max: z.number().int().min(0).max(1_000_000_000),
  deal_priorities: z.array(z.string().max(60)).max(10),
  geographies_focus: z.array(z.string().max(60)).max(30),
  geographies_avoid: z.string().trim().max(500).nullish().transform((v) => v ?? null),
  process_notes: z.string().trim().max(1000).nullish().transform((v) => v ?? null),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const submitInvestorIntake = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("investor_submissions")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listInvestorSubmissions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("investor_submissions")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return data ?? [];
});

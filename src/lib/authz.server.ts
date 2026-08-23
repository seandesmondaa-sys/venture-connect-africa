import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type Role = "admin" | "team" | "member";

export async function getRoles(userId: string): Promise<Role[]> {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  return ((data ?? []) as { role: Role }[]).map((r) => r.role);
}

export async function isStaff(userId: string): Promise<boolean> {
  const roles = await getRoles(userId);
  return roles.includes("admin") || roles.includes("team");
}

export async function requireStaff(userId: string): Promise<void> {
  if (!(await isStaff(userId))) throw new Error("Forbidden: Auxilium team access required");
}

/** Owner of the opportunity, or Auxilium staff. */
export async function requireOpportunityAccess(
  userId: string,
  opportunityId: string,
): Promise<{ staff: boolean }> {
  const { data } = await supabaseAdmin
    .from("opportunities")
    .select("owner_user_id")
    .eq("id", opportunityId)
    .maybeSingle();

  if (!data) throw new Error("Opportunity not found");

  const staff = await isStaff(userId);
  if (data.owner_user_id !== userId && !staff) {
    throw new Error("Forbidden: you do not have access to this opportunity");
  }
  return { staff };
}

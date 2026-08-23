-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'team', 'member');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'team')
  )
$$;

CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Ownership on opportunities
ALTER TABLE public.opportunities ADD COLUMN owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_opportunities_owner ON public.opportunities(owner_user_id);

DROP POLICY IF EXISTS "Anyone can submit an opportunity" ON public.opportunities;

GRANT SELECT, INSERT, UPDATE ON public.opportunities TO authenticated;

CREATE POLICY "Signed-in users can submit an opportunity"
ON public.opportunities FOR INSERT TO authenticated
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners and staff can read opportunities"
ON public.opportunities FOR SELECT TO authenticated
USING (owner_user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Owners and staff can update opportunities"
ON public.opportunities FOR UPDATE TO authenticated
USING (owner_user_id = auth.uid() OR public.is_staff(auth.uid()))
WITH CHECK (owner_user_id = auth.uid() OR public.is_staff(auth.uid()));

-- Documents
DROP POLICY IF EXISTS "Anyone can attach a document" ON public.opportunity_documents;
GRANT SELECT, INSERT ON public.opportunity_documents TO authenticated;

CREATE POLICY "Owners and staff can read documents"
ON public.opportunity_documents FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.opportunities o
  WHERE o.id = opportunity_id
    AND (o.owner_user_id = auth.uid() OR public.is_staff(auth.uid()))
));

CREATE POLICY "Owners can attach documents"
ON public.opportunity_documents FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.opportunities o
  WHERE o.id = opportunity_id
    AND (o.owner_user_id = auth.uid() OR public.is_staff(auth.uid()))
));

-- Analysis tables: readable by owner + staff
GRANT SELECT ON public.extracted_fields TO authenticated;
CREATE POLICY "Owners and staff can read extracted fields"
ON public.extracted_fields FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.opportunities o
  WHERE o.id = opportunity_id
    AND (o.owner_user_id = auth.uid() OR public.is_staff(auth.uid()))
));

GRANT SELECT, UPDATE ON public.follow_up_questions TO authenticated;
CREATE POLICY "Owners and staff can read follow-up questions"
ON public.follow_up_questions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.opportunities o
  WHERE o.id = opportunity_id
    AND (o.owner_user_id = auth.uid() OR public.is_staff(auth.uid()))
));
CREATE POLICY "Owners and staff can answer follow-up questions"
ON public.follow_up_questions FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.opportunities o
  WHERE o.id = opportunity_id
    AND (o.owner_user_id = auth.uid() OR public.is_staff(auth.uid()))
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.opportunities o
  WHERE o.id = opportunity_id
    AND (o.owner_user_id = auth.uid() OR public.is_staff(auth.uid()))
));

GRANT SELECT ON public.assessments TO authenticated;
CREATE POLICY "Owners and staff can read assessments"
ON public.assessments FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.opportunities o
  WHERE o.id = opportunity_id
    AND (o.owner_user_id = auth.uid() OR public.is_staff(auth.uid()))
));

-- Staff-only tables
GRANT SELECT ON public.investor_matches TO authenticated;
CREATE POLICY "Staff can read matches"
ON public.investor_matches FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

GRANT SELECT ON public.investor_submissions TO authenticated;
CREATE POLICY "Staff can read investor submissions"
ON public.investor_submissions FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

GRANT SELECT, INSERT ON public.entity_notes TO authenticated;
CREATE POLICY "Staff can read notes"
ON public.entity_notes FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can add notes"
ON public.entity_notes FOR INSERT TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

GRANT SELECT ON public.audit_events TO authenticated;
CREATE POLICY "Staff can read audit events"
ON public.audit_events FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

GRANT SELECT ON public.scoring_config TO authenticated;
CREATE POLICY "Staff can read scoring config"
ON public.scoring_config FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

-- Explicit storage policies for the private pitch deck bucket
CREATE POLICY "Staff can list opportunity documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'opportunity-documents' AND public.is_staff(auth.uid()));

CREATE POLICY "No client writes to opportunity documents"
ON storage.objects AS RESTRICTIVE FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id <> 'opportunity-documents');

CREATE POLICY "No client updates to opportunity documents"
ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon, authenticated
USING (bucket_id <> 'opportunity-documents');

CREATE POLICY "No client deletes of opportunity documents"
ON storage.objects AS RESTRICTIVE FOR DELETE TO anon, authenticated
USING (bucket_id <> 'opportunity-documents');
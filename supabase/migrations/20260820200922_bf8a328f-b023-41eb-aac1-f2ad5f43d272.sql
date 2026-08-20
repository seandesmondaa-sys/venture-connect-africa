
CREATE TYPE public.opportunity_status AS ENUM (
  'submitted','ai_screening','information_required','investment_ready','auxilium_review',
  'investor_matching','investor_interest','due_diligence','investment_committee','term_sheet',
  'closed','portfolio','rejected'
);

CREATE TYPE public.field_status AS ENUM ('CONFIRMED','INFERRED','MISSING','NEEDS_VERIFICATION');

CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text,
  contact_email text,
  website text,
  sector text,
  country text,
  region text,
  stage text,
  business_description text,
  problem text,
  solution text,
  market text,
  business_model text,
  competition text,
  traction text,
  revenue_summary text,
  team text,
  capital_required numeric,
  instrument text,
  use_of_funds text,
  existing_funding text,
  growth_plans text,
  financials text,
  risks text,
  submission_method text NOT NULL DEFAULT 'conversational',
  status public.opportunity_status NOT NULL DEFAULT 'submitted',
  business_quality_score integer,
  investment_readiness_score integer,
  score_confidence text,
  category_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.opportunity_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  doc_type text NOT NULL DEFAULT 'pitch_deck',
  file_name text NOT NULL,
  mime_type text,
  size_bytes integer,
  storage_path text,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.extracted_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.opportunity_documents(id) ON DELETE SET NULL,
  field_key text NOT NULL,
  field_label text NOT NULL,
  value text,
  status public.field_status NOT NULL DEFAULT 'MISSING',
  source_note text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.follow_up_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  field_key text,
  question text NOT NULL,
  rationale text,
  answer text,
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  executive_summary text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  weaknesses jsonb NOT NULL DEFAULT '[]'::jsonb,
  risks jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_information jsonb NOT NULL DEFAULT '[]'::jsonb,
  verification_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  capital_assessment text,
  business_quality_score integer,
  investment_readiness_score integer,
  category_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence text,
  confidence_reason text,
  recommendation text,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_submissions
  ADD COLUMN website text,
  ADD COLUMN investor_type text,
  ADD COLUMN countries text[] NOT NULL DEFAULT '{}',
  ADD COLUMN instruments text[] NOT NULL DEFAULT '{}',
  ADD COLUMN investment_horizon text,
  ADD COLUMN screening_process text,
  ADD COLUMN due_diligence_process text,
  ADD COLUMN decision_process text,
  ADD COLUMN required_documents text,
  ADD COLUMN preferred_contact text;

CREATE TABLE public.investor_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES public.investor_submissions(id) ON DELETE CASCADE,
  fit_score integer NOT NULL DEFAULT 0,
  strong_matches jsonb NOT NULL DEFAULT '[]'::jsonb,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  explanation text,
  recommendation text,
  status text NOT NULL DEFAULT 'suggested',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.entity_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  author text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  actor text NOT NULL DEFAULT 'auxilium_internal',
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.scoring_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  weights jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.scoring_config (key, weights) VALUES
 ('business_quality', '{"market":0.25,"team":0.25,"traction":0.2,"business_model":0.15,"competitive_position":0.15}'),
 ('investment_readiness', '{"financial_strength":0.3,"documentation":0.2,"legal_structural_readiness":0.25,"ask_coherence":0.25}'),
 ('investor_fit', '{"sector":0.25,"geography":0.2,"stage":0.2,"ticket_size":0.25,"priorities":0.1}');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT INSERT ON public.opportunities TO anon;
GRANT ALL ON public.opportunities TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_documents TO authenticated;
GRANT INSERT ON public.opportunity_documents TO anon;
GRANT ALL ON public.opportunity_documents TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.extracted_fields TO authenticated;
GRANT ALL ON public.extracted_fields TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_up_questions TO authenticated;
GRANT ALL ON public.follow_up_questions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investor_matches TO authenticated;
GRANT ALL ON public.investor_matches TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entity_notes TO authenticated;
GRANT ALL ON public.entity_notes TO service_role;
GRANT SELECT, INSERT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
GRANT SELECT ON public.scoring_config TO authenticated;
GRANT ALL ON public.scoring_config TO service_role;

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an opportunity" ON public.opportunities FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can attach a document" ON public.opportunity_documents FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX idx_extracted_fields_opportunity ON public.extracted_fields(opportunity_id);
CREATE INDEX idx_followups_opportunity ON public.follow_up_questions(opportunity_id);
CREATE INDEX idx_assessments_opportunity ON public.assessments(opportunity_id);
CREATE INDEX idx_matches_opportunity ON public.investor_matches(opportunity_id);
CREATE INDEX idx_matches_investor ON public.investor_matches(investor_id);

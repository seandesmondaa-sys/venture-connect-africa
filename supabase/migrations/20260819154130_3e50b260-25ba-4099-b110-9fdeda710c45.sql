CREATE TABLE public.investor_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  sectors TEXT[] NOT NULL DEFAULT '{}',
  sector_notes TEXT,
  stages TEXT[] NOT NULL DEFAULT '{}',
  check_size_min INTEGER NOT NULL DEFAULT 0,
  check_size_max INTEGER NOT NULL DEFAULT 0,
  deal_priorities TEXT[] NOT NULL DEFAULT '{}',
  geographies_focus TEXT[] NOT NULL DEFAULT '{}',
  geographies_avoid TEXT,
  process_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.investor_submissions TO anon;
GRANT INSERT ON public.investor_submissions TO authenticated;
GRANT ALL ON public.investor_submissions TO service_role;

ALTER TABLE public.investor_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit investor intake"
  ON public.investor_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
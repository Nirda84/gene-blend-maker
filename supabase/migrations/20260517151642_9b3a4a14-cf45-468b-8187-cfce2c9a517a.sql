
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT
);

CREATE TABLE public.generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mode TEXT NOT NULL,
  child_names TEXT[] NOT NULL DEFAULT '{}',
  participant_name TEXT
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (tracking), but no reads from client.
CREATE POLICY "anyone can insert page_views" ON public.page_views
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "anyone can insert generations" ON public.generations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX generations_created_at_idx ON public.generations (created_at DESC);

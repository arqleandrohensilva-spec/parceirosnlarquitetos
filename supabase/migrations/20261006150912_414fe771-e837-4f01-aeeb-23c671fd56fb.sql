CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

CREATE TABLE public.parceiros_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 100),
  empresa text NOT NULL CHECK (char_length(empresa) BETWEEN 2 AND 120),
  tipo text NOT NULL CHECK (tipo IN ('Construtora', 'Correspondente Caixa', 'Imobiliária', 'Loteamento', 'Outro')),
  cidade text NOT NULL CHECK (char_length(cidade) BETWEEN 2 AND 100),
  whatsapp text NOT NULL CHECK (whatsapp ~ '^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$'),
  demanda_mensal text NOT NULL CHECK (demanda_mensal IN ('Menos de 1', '1 a 2', '3 a 5', 'Mais de 5')),
  utm_source text CHECK (utm_source IS NULL OR char_length(utm_source) <= 200),
  utm_medium text CHECK (utm_medium IS NULL OR char_length(utm_medium) <= 200),
  utm_campaign text CHECK (utm_campaign IS NULL OR char_length(utm_campaign) <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.parceiros_leads TO anon, authenticated;
GRANT SELECT ON public.parceiros_leads TO authenticated;
GRANT ALL ON public.parceiros_leads TO service_role;
ALTER TABLE public.parceiros_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit partner leads"
ON public.parceiros_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view partner leads"
ON public.parceiros_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
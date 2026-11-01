-- =========================================================
-- Migration : contenus éditables (À propos + Parcours)
-- À exécuter dans : Supabase → SQL Editor → New query → Run
-- (à lancer une seule fois, en plus de schema.sql)
-- =========================================================

-- Table clé/valeur pour les contenus modifiables du site
create table if not exists public.settings (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read"
  on public.settings for select
  using (true);

drop policy if exists "settings_auth_write" on public.settings;
create policy "settings_auth_write"
  on public.settings for all to authenticated
  using (true) with check (true);

-- Contenu initial (repris de js/config.js)
insert into public.settings (key, value) values
('about', '{
  "paragraphs": [
    "Développeur web autodidacte, je transforme des besoins concrets en applications et sites sur mesure. Du jeu dans le navigateur à l''outil métier, en passant par les sites de clubs sportifs et les applications de gestion, j''aime concevoir des solutions simples, utiles et soignées.",
    "Je consolide cette pratique par une formation diplômante Graduate Développeur Flutter chez STUDI (2023–2029), pour aller plus loin — notamment vers le développement d''applications mobiles."
  ],
  "badges": ["Autodidacte", "Applications web", "Sites sur mesure", "Outils métier", "Flutter / Mobile"]
}'::jsonb),
('parcours', '{
  "facts": [
    {"icon": "🎓", "label": "STUDI — Graduate Développeur Flutter", "value": "2023 – 2029"},
    {"icon": "🚀", "label": "Parcours", "value": "Autodidacte"},
    {"icon": "📍", "label": "Localisation", "value": "Toulon (83)"}
  ]
}'::jsonb)
on conflict (key) do nothing;

-- =========================================================
-- Portfolio — Schéma Supabase
-- À exécuter dans : Supabase → SQL Editor → New query → Run
-- =========================================================

-- 1) Table des projets -------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text,
  description text,
  tags        text[] default '{}',
  image_url   text,
  live_url    text,
  repo_url    text,
  featured    boolean default false,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- 2) Sécurité (RLS) ----------------------------------------------------
-- Lecture publique, écriture réservée aux utilisateurs connectés.
alter table public.projects enable row level security;

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
  on public.projects for select
  using (true);

drop policy if exists "projects_auth_insert" on public.projects;
create policy "projects_auth_insert"
  on public.projects for insert to authenticated
  with check (true);

drop policy if exists "projects_auth_update" on public.projects;
create policy "projects_auth_update"
  on public.projects for update to authenticated
  using (true);

drop policy if exists "projects_auth_delete" on public.projects;
create policy "projects_auth_delete"
  on public.projects for delete to authenticated
  using (true);

-- 3) Stockage des images de couverture ---------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

drop policy if exists "images_public_read" on storage.objects;
create policy "images_public_read"
  on storage.objects for select
  using (bucket_id = 'project-images');

drop policy if exists "images_auth_write" on storage.objects;
create policy "images_auth_write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-images');

drop policy if exists "images_auth_update" on storage.objects;
create policy "images_auth_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'project-images');

drop policy if exists "images_auth_delete" on storage.objects;
create policy "images_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-images');

-- 4) Contenu initial : vos 9 projets existants -------------------------
insert into public.projects (title, category, description, tags, featured, sort_order) values
('Relais Tournée', 'Application',
 'Application de gestion des tournées de relais : suivi, organisation et visualisation des points de passage. Développée en React avec authentification et base de données Supabase.',
 array['React','TypeScript','Vite','Supabase'], true, 1),
('Réservation des véhicules municipaux · Ollioules', 'Application',
 'Outil de réservation des véhicules de la mairie d''Ollioules pour les associations : calendrier de disponibilité, demandes et espace association.',
 array['HTML','JavaScript','Collectivité'], true, 2),
('Sport Site Builder', 'Site web',
 'Base réutilisable pour créer le site officiel d''un club sportif : identité, couleurs et contenus configurables depuis un espace admin, sans toucher au code. Stack 100 % vanilla.',
 array['PHP','MySQL','JavaScript','PWA'], true, 3),
('Volley Ball Ollioulais', 'Site web',
 'Site officiel du club de volley-ball d''Ollioules : présentation des équipes, actualités et informations pratiques.',
 array['Web','Club sportif'], false, 4),
('Knight''s Quest', 'Jeu',
 'Jeu vidéo jouable directement dans le navigateur : aventure d''un chevalier, rendu et logique entièrement en JavaScript.',
 array['JavaScript','Canvas','Jeu'], false, 5),
('Générateur de factures', 'Outil',
 'Outil pour créer et exporter des factures proprement mises en forme, directement depuis le navigateur.',
 array['HTML','JavaScript','PDF'], false, 6),
('Suivi des prélèvements', 'Outil',
 'Tableau de bord personnel pour suivre ses prélèvements et abonnements récurrents et anticiper les échéances.',
 array['HTML','JavaScript','Finances'], false, 7),
('Encodeur Arbre des mots', 'Outil',
 'Outil d''encodage basé sur une structure en arbre des mots, avec une page de partage dédiée.',
 array['HTML','JavaScript','Algorithme'], false, 8),
('Invitation Anniversaire', 'Site web',
 'Page d''invitation d''anniversaire animée et festive, pensée pour être partagée facilement.',
 array['HTML','CSS','Animation'], false, 9);

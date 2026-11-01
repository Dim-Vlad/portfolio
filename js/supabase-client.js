/* =========================================================
   Client Supabase partagé + helpers
   ========================================================= */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

const cfg = window.PORTFOLIO_CONFIG || {};

export const isConfigured = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

export const supabase = isConfigured
  ? createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
  : null;

export const BUCKET = "project-images";

/* ---- Lecture des projets (publique) ---- */
export async function fetchProjects() {
  if (!isConfigured) {
    return (window.SEED_PROJECTS || []).map((p, i) => ({ id: "seed-" + i, ...p }));
  }
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/* ---- Écriture (admin, authentifié) ---- */
export async function saveProject(project) {
  const payload = { ...project };
  delete payload.id;
  if (project.id) {
    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", project.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

/* ---- Upload d'une image de couverture ---- */
export async function uploadImage(file) {
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

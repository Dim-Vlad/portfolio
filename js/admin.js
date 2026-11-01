/* =========================================================
   Espace privé : connexion + CRUD des projets
   ========================================================= */
import {
  supabase,
  isConfigured,
  fetchProjects,
  saveProject,
  deleteProject,
  uploadImage,
} from "./supabase-client.js";
import { esc } from "./public.js";

const $ = (id) => document.getElementById(id);
const authView = $("auth-view");
const dashView = $("dash-view");

/* ---------- Garde-fou : Supabase requis ---------- */
if (!isConfigured) {
  authView.innerHTML = `<div class="auth-card">
    <h2>Configuration requise</h2>
    <p class="sub">L'espace privé nécessite Supabase. Renseignez <code>SUPABASE_URL</code> et
    <code>SUPABASE_ANON_KEY</code> dans <code>js/config.js</code>, puis rechargez la page.</p>
    <a class="btn btn-primary" href="index.html">← Retour au portfolio</a>
  </div>`;
}

/* ---------- Connexion ---------- */
async function initAuth() {
  if (!isConfigured) return;
  const { data } = await supabase.auth.getSession();
  if (data.session) showDashboard();
  else showAuth();

  supabase.auth.onAuthStateChange((_evt, session) => {
    if (session) showDashboard();
    else showAuth();
  });
}

function showAuth() {
  authView.style.display = "block";
  dashView.style.display = "none";
  authView.innerHTML = `<div class="auth-card">
    <h2>Espace privé</h2>
    <p class="sub">Connectez-vous pour gérer vos projets.</p>
    <form id="login-form">
      <div class="field">
        <label for="email">Email</label>
        <input type="email" id="email" required autocomplete="username" />
      </div>
      <div class="field">
        <label for="password">Mot de passe</label>
        <input type="password" id="password" required autocomplete="current-password" />
      </div>
      <button class="btn btn-primary" type="submit" id="login-btn" style="width:100%;justify-content:center">Se connecter</button>
    </form>
    <p style="margin-top:18px;text-align:center"><a href="index.html" style="color:var(--text-dim);font-size:.88rem">← Retour au portfolio</a></p>
  </div>`;

  $("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("login-btn");
    btn.disabled = true;
    btn.textContent = "Connexion…";
    const { error } = await supabase.auth.signInWithPassword({
      email: $("email").value.trim(),
      password: $("password").value,
    });
    btn.disabled = false;
    btn.textContent = "Se connecter";
    if (error) toast(error.message || "Échec de la connexion", "error");
  });
}

/* ---------- Tableau de bord ---------- */
let projects = [];

async function showDashboard() {
  authView.style.display = "none";
  dashView.style.display = "block";
  const { data } = await supabase.auth.getUser();
  $("admin-email").textContent = data.user?.email || "";
  await refresh();
}

async function refresh() {
  const list = $("admin-list");
  list.innerHTML = `<div class="skeleton" style="height:120px"></div>`;
  try {
    projects = await fetchProjects();
  } catch (e) {
    list.innerHTML = `<div class="state"><h3>Erreur</h3><p>${esc(e.message)}</p></div>`;
    return;
  }
  if (!projects.length) {
    list.innerHTML = `<div class="state"><h3>Aucun projet</h3><p>Ajoutez votre première réalisation avec le bouton ci-dessus.</p></div>`;
    return;
  }
  list.innerHTML = projects
    .map(
      (p) => `<article class="card">
        <div style="position:relative">${
          p.image_url
            ? `<div class="card-media"><img src="${esc(p.image_url)}" alt=""></div>`
            : `<div class="card-media placeholder"><span>${esc((p.title || "?").slice(0, 2).toUpperCase())}</span></div>`
        }${p.featured ? `<span class="card-featured">★ À la une</span>` : ""}</div>
        <div class="card-body">
          <div class="card-cat">${esc(p.category || "")}</div>
          <h3>${esc(p.title)}</h3>
          <p>${esc((p.description || "").slice(0, 120))}${(p.description || "").length > 120 ? "…" : ""}</p>
        </div>
        <div class="card-admin">
          <button class="btn btn-ghost" data-edit="${esc(p.id)}" style="flex:1;justify-content:center">Modifier</button>
          <button class="btn btn-danger" data-del="${esc(p.id)}">Supprimer</button>
        </div>
      </article>`
    )
    .join("");

  list.querySelectorAll("[data-edit]").forEach((b) =>
    b.addEventListener("click", () => openModal(projects.find((p) => String(p.id) === b.dataset.edit)))
  );
  list.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", () => confirmDelete(b.dataset.del))
  );
}

/* ---------- Modale d'édition ---------- */
function openModal(project) {
  const p = project || { tags: [], featured: false, sort_order: (projects.length + 1) };
  const overlay = $("modal");
  overlay.classList.add("open");
  $("modal-title").textContent = project ? "Modifier le projet" : "Nouveau projet";
  const f = $("project-form");
  f.reset();
  f.dataset.id = project?.id || "";
  $("f-title").value = p.title || "";
  $("f-category").value = p.category || "";
  $("f-description").value = p.description || "";
  $("f-tags").value = (p.tags || []).join(", ");
  $("f-image").value = p.image_url || "";
  $("f-live").value = p.live_url || "";
  $("f-repo").value = p.repo_url || "";
  $("f-order").value = p.sort_order ?? 0;
  $("f-featured").checked = !!p.featured;
  $("img-preview").innerHTML = p.image_url ? `<img src="${esc(p.image_url)}" alt="" style="margin-top:10px;border-radius:10px;max-height:140px">` : "";
}

function closeModal() { $("modal").classList.remove("open"); }

async function handleUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const btn = $("upload-btn");
  btn.disabled = true;
  btn.textContent = "Envoi…";
  try {
    const url = await uploadImage(file);
    $("f-image").value = url;
    $("img-preview").innerHTML = `<img src="${esc(url)}" alt="" style="margin-top:10px;border-radius:10px;max-height:140px">`;
    toast("Image téléversée", "success");
  } catch (err) {
    toast(err.message || "Échec du téléversement", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Téléverser une image";
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const btn = $("save-btn");
  btn.disabled = true;
  btn.textContent = "Enregistrement…";
  const f = $("project-form");
  const project = {
    id: f.dataset.id || undefined,
    title: $("f-title").value.trim(),
    category: $("f-category").value.trim(),
    description: $("f-description").value.trim(),
    tags: $("f-tags").value.split(",").map((t) => t.trim()).filter(Boolean),
    image_url: $("f-image").value.trim(),
    live_url: $("f-live").value.trim(),
    repo_url: $("f-repo").value.trim(),
    sort_order: parseInt($("f-order").value, 10) || 0,
    featured: $("f-featured").checked,
  };
  try {
    await saveProject(project);
    toast("Projet enregistré", "success");
    closeModal();
    await refresh();
  } catch (err) {
    toast(err.message || "Erreur d'enregistrement", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enregistrer";
  }
}

async function confirmDelete(id) {
  const p = projects.find((x) => String(x.id) === String(id));
  if (!confirm(`Supprimer « ${p?.title || "ce projet"} » ? Cette action est définitive.`)) return;
  try {
    await deleteProject(id);
    toast("Projet supprimé", "success");
    await refresh();
  } catch (err) {
    toast(err.message || "Erreur de suppression", "error");
  }
}

/* ---------- Toast ---------- */
function toast(msg, type = "") {
  const stack = $("toasts");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/* ---------- Événements globaux ---------- */
if (isConfigured) {
  $("add-btn").addEventListener("click", () => openModal(null));
  $("logout-btn").addEventListener("click", () => supabase.auth.signOut());
  $("modal-close").addEventListener("click", closeModal);
  $("modal-cancel").addEventListener("click", closeModal);
  $("modal").addEventListener("click", (e) => { if (e.target === $("modal")) closeModal(); });
  $("project-form").addEventListener("submit", handleSubmit);
  $("upload-btn").addEventListener("click", () => $("f-file").click());
  $("f-file").addEventListener("change", handleUpload);
  initAuth();
}

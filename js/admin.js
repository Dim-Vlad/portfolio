/* =========================================================
   Espace privé : connexion + CRUD des projets
   ========================================================= */
import {
  supabase,
  isConfigured,
  fetchProjects,
  saveProject,
  deleteProject,
  saveOrder,
  uploadImage,
  fetchSettings,
  saveSetting,
} from "./supabase-client.js";
import { esc } from "./public.js";

const cfg = window.PORTFOLIO_CONFIG || {};
const DEFAULT_BADGES = ["Autodidacte", "Applications web", "Sites sur mesure", "Outils métier", "Flutter / Mobile"];

const $ = (id) => document.getElementById(id);
const authView = $("auth-view");
const dashView = $("dash-view");

/* Icônes œil (afficher / masquer le mot de passe) */
const ICON_EYE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const ICON_EYE_OFF = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

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
        <div class="password-wrap">
          <input type="password" id="password" required autocomplete="current-password" />
          <button type="button" class="password-toggle" id="pw-toggle" aria-label="Afficher le mot de passe" aria-pressed="false" title="Afficher le mot de passe">${ICON_EYE}</button>
        </div>
      </div>
      <button class="btn btn-primary" type="submit" id="login-btn" style="width:100%;justify-content:center">Se connecter</button>
    </form>
    <p style="margin-top:18px;text-align:center"><a href="index.html" style="color:var(--text-dim);font-size:.88rem">← Retour au portfolio</a></p>
  </div>`;

  $("pw-toggle").addEventListener("click", () => {
    const input = $("password");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    const tgl = $("pw-toggle");
    tgl.innerHTML = show ? ICON_EYE_OFF : ICON_EYE;
    tgl.setAttribute("aria-pressed", String(show));
    const label = show ? "Masquer le mot de passe" : "Afficher le mot de passe";
    tgl.setAttribute("aria-label", label);
    tgl.setAttribute("title", label);
    input.focus();
  });

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
      (p) => `<article class="card" draggable="true" data-id="${esc(p.id)}">
        <div class="card-drag" title="Glisser pour réordonner"><span class="grip">⠿</span> Glisser pour déplacer</div>
        <div style="position:relative">${
          p.image_url
            ? `<div class="card-media"><img src="${esc(p.image_url)}" alt=""></div>`
            : `<div class="card-media placeholder"><span>${esc((p.title || "?").slice(0, 2).toUpperCase())}</span></div>`
        }${p.featured ? `<span class="card-featured">À la une</span>` : ""}</div>
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

  setupDragSort(list);
}

/* ---------- Réordonnancement par glisser-déposer ---------- */
let dragEl = null;
let allowDrag = false; // le glisser ne démarre que depuis la poignée
let dragGlobalsBound = false;

function setupDragSort(list) {
  if (!dragGlobalsBound) {
    document.addEventListener("mouseup", () => { allowDrag = false; });
    dragGlobalsBound = true;
  }
  list.querySelectorAll(".card[draggable]").forEach((card) => {
    const handle = card.querySelector(".card-drag");
    if (handle) {
      handle.addEventListener("mousedown", () => { allowDrag = true; });
      handle.addEventListener("touchstart", () => { allowDrag = true; }, { passive: true });
    }
    card.addEventListener("dragstart", (e) => {
      if (!allowDrag) { e.preventDefault(); return; } // glisser hors poignée → ignoré
      dragEl = card;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", card.dataset.id); } catch (_) {}
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      allowDrag = false;
      const moved = !!dragEl;
      dragEl = null;
      if (moved) persistOrder(list);
    });
  });

  list.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!dragEl) return;
    const after = cardAfter(list, e.clientX, e.clientY);
    if (after == null) list.appendChild(dragEl);
    else if (after !== dragEl) list.insertBefore(dragEl, after);
  });
}

function cardAfter(list, x, y) {
  const cards = [...list.querySelectorAll(".card[draggable]:not(.dragging)")];
  let best = null;
  let bestDist = Infinity;
  for (const c of cards) {
    const r = c.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    // Avant la carte si le curseur est au-dessus (ligne précédente) ou à gauche sur la même ligne
    const before = y < cy - 8 || (Math.abs(y - cy) <= r.height / 2 && x < cx);
    if (before) {
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < bestDist) { bestDist = dist; best = c; }
    }
  }
  return best;
}

async function persistOrder(list) {
  const ids = [...list.querySelectorAll(".card[draggable]")].map((c) => c.dataset.id);
  const current = projects.map((p) => String(p.id));
  if (ids.join("|") === current.join("|")) return; // aucun changement
  // Réordonne la copie locale selon le nouvel ordre
  projects = ids.map((id) => projects.find((p) => String(p.id) === String(id))).filter(Boolean);
  try {
    await saveOrder(ids);
    toast("Ordre enregistré", "success");
  } catch (err) {
    toast(err.message || "Erreur lors de l'enregistrement de l'ordre", "error");
    await refresh();
  }
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

/* ---------- Éditeur Présentation & parcours ---------- */
async function openContentModal() {
  const overlay = $("content-modal");
  overlay.classList.add("open");
  let settings = {};
  try {
    settings = await fetchSettings();
  } catch (e) {
    toast(e.message || "Impossible de charger les contenus", "error");
  }
  const about = settings.about || {};
  const parcours = settings.parcours || {};

  const paragraphs = (Array.isArray(about.paragraphs) && about.paragraphs.length ? about.paragraphs : cfg.OWNER_ABOUT) || [];
  const badges = (Array.isArray(about.badges) && about.badges.length ? about.badges : DEFAULT_BADGES) || [];
  const facts = (Array.isArray(parcours.facts) && parcours.facts.length ? parcours.facts : cfg.OWNER_FACTS) || [];

  $("c-paragraphs").value = paragraphs.join("\n\n");
  $("c-badges").value = badges.join(", ");
  $("c-facts").innerHTML = "";
  if (facts.length) facts.forEach(addFactRow);
  else addFactRow();
}

function addFactRow(fact = {}) {
  const row = document.createElement("div");
  row.className = "fact-edit";
  row.innerHTML = `
    <input class="fact-ico-in" maxlength="4" placeholder="🎓" value="${esc(fact.icon || "")}" />
    <input class="fact-label-in" placeholder="Intitulé" value="${esc(fact.label || "")}" />
    <input class="fact-value-in" placeholder="Valeur" value="${esc(fact.value || "")}" />
    <button type="button" class="fact-del" title="Supprimer cette ligne">✕</button>`;
  row.querySelector(".fact-del").addEventListener("click", () => row.remove());
  $("c-facts").appendChild(row);
}

function closeContentModal() { $("content-modal").classList.remove("open"); }

async function handleContentSubmit(e) {
  e.preventDefault();
  const btn = $("content-save");
  btn.disabled = true;
  btn.textContent = "Enregistrement…";

  const paragraphs = $("c-paragraphs").value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const badges = $("c-badges").value.split(",").map((b) => b.trim()).filter(Boolean);
  const facts = [...$("c-facts").querySelectorAll(".fact-edit")]
    .map((row) => ({
      icon: row.querySelector(".fact-ico-in").value.trim(),
      label: row.querySelector(".fact-label-in").value.trim(),
      value: row.querySelector(".fact-value-in").value.trim(),
    }))
    .filter((f) => f.label || f.value);

  try {
    await saveSetting("about", { paragraphs, badges });
    await saveSetting("parcours", { facts });
    toast("Présentation mise à jour", "success");
    closeContentModal();
  } catch (err) {
    toast(err.message || "Erreur d'enregistrement", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enregistrer";
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

  // Éditeur Présentation & parcours
  $("edit-content-btn").addEventListener("click", openContentModal);
  $("content-close").addEventListener("click", closeContentModal);
  $("content-cancel").addEventListener("click", closeContentModal);
  $("content-modal").addEventListener("click", (e) => { if (e.target === $("content-modal")) closeContentModal(); });
  $("c-add-fact").addEventListener("click", () => addFactRow());
  $("content-form").addEventListener("submit", handleContentSubmit);

  initAuth();
}

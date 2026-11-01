/* =========================================================
   Page publique : rendu de la grille, filtres, recherche
   ========================================================= */
import { fetchProjects, isConfigured } from "./supabase-client.js";

const cfg = window.PORTFOLIO_CONFIG || {};
let allProjects = [];
let activeFilter = "Tous";
let searchTerm = "";

const grid = document.getElementById("grid");
const filtersEl = document.getElementById("filters");
const searchInput = document.getElementById("search");

/* ---- Hero depuis la config ---- */
function hydrateHero() {
  setText("owner-name", cfg.OWNER_NAME);
  setText("owner-role", cfg.OWNER_ROLE);
  setText("owner-tagline", cfg.OWNER_TAGLINE);
  const mail = document.getElementById("owner-mail");
  if (mail && cfg.OWNER_EMAIL) mail.href = "mailto:" + cfg.OWNER_EMAIL;
  const brandName = document.getElementById("brand-name");
  if (brandName && cfg.OWNER_NAME) brandName.textContent = cfg.OWNER_NAME;
  const logo = document.getElementById("brand-logo");
  if (logo && cfg.OWNER_NAME) logo.textContent = initials(cfg.OWNER_NAME);
}
function setText(id, v) { const el = document.getElementById(id); if (el && v) el.textContent = v; }
function initials(name) {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ---- Chargement ---- */
async function load() {
  hydrateHero();
  showSkeletons();
  try {
    allProjects = await fetchProjects();
  } catch (e) {
    console.error(e);
    grid.innerHTML = errorState(e.message);
    return;
  }
  buildFilters();
  render();
  updateStats();
}

function updateStats() {
  setText("stat-projects", String(allProjects.length));
  const cats = new Set(allProjects.map((p) => p.category).filter(Boolean));
  setText("stat-cats", String(cats.size));
}

/* ---- Filtres dynamiques ---- */
function buildFilters() {
  const cats = ["Tous", ...[...new Set(allProjects.map((p) => p.category).filter(Boolean))].sort()];
  filtersEl.innerHTML = cats
    .map(
      (c) =>
        `<button class="chip ${c === activeFilter ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`
    )
    .join("");
  filtersEl.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.cat;
      filtersEl.querySelectorAll(".chip").forEach((b) => b.classList.toggle("active", b === btn));
      render();
    });
  });
}

/* ---- Rendu ---- */
function render() {
  const list = allProjects.filter((p) => {
    const matchCat = activeFilter === "Tous" || p.category === activeFilter;
    const hay = `${p.title} ${p.description} ${(p.tags || []).join(" ")} ${p.category}`.toLowerCase();
    const matchSearch = !searchTerm || hay.includes(searchTerm);
    return matchCat && matchSearch;
  });

  if (!list.length) {
    grid.innerHTML = `<div class="state" style="grid-column:1/-1">
      <h3>Aucun projet trouvé</h3>
      <p>Essayez un autre filtre ou un autre mot-clé.</p></div>`;
    return;
  }
  grid.innerHTML = list.map(cardHTML).join("");
}

export function cardHTML(p) {
  const media = p.image_url
    ? `<div class="card-media"><img src="${esc(p.image_url)}" alt="${esc(p.title)}" loading="lazy"></div>`
    : `<div class="card-media placeholder"><span>${esc(initials(p.title || "?"))}</span></div>`;

  const featured = p.featured ? `<span class="card-featured">★ À la une</span>` : "";
  const tags = (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");

  const links = [];
  if (p.live_url) links.push(`<a class="card-link primary" href="${esc(p.live_url)}" target="_blank" rel="noopener">Voir le projet ↗</a>`);
  if (p.repo_url) links.push(`<a class="card-link" href="${esc(p.repo_url)}" target="_blank" rel="noopener">Code</a>`);
  const linksHTML = links.length ? `<div class="card-links">${links.join("")}</div>` : "";

  return `<article class="card">
    <div style="position:relative">${media}${featured}</div>
    <div class="card-body">
      ${p.category ? `<div class="card-cat">${esc(p.category)}</div>` : ""}
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.description || "")}</p>
      ${tags ? `<div class="tags">${tags}</div>` : ""}
      ${linksHTML}
    </div>
  </article>`;
}

/* ---- États ---- */
function showSkeletons() {
  grid.innerHTML = Array.from({ length: 6 }).map(() => `<div class="skeleton"></div>`).join("");
}
function errorState(msg) {
  return `<div class="state" style="grid-column:1/-1">
    <h3>Impossible de charger les projets</h3>
    <p>${esc(msg || "")}</p></div>`;
}

/* ---- Utils ---- */
export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    render();
  });
}

/* Bandeau mode démo */
if (!isConfigured) {
  const banner = document.getElementById("demo-banner");
  if (banner) banner.style.display = "block";
}

// N'exécute le rendu que sur la page publique (présence de la grille)
if (grid) load();

/* =========================================================
   Page publique : rendu de la grille, filtres, recherche
   ========================================================= */
import { fetchProjects, fetchSettings, isConfigured } from "./supabase-client.js";

const DEFAULT_BADGES = ["Autodidacte", "Applications web", "Sites sur mesure", "Outils métier", "Flutter / Mobile"];

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
}
function setText(id, v) { const el = document.getElementById(id); if (el && v) el.textContent = v; }
function initials(name) {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ---- Section À propos (contenu Supabase, repli sur config.js) ---- */
function hydrateAbout(settings = {}) {
  const about = settings.about || {};
  const parcours = settings.parcours || {};

  const paragraphs = Array.isArray(about.paragraphs) && about.paragraphs.length ? about.paragraphs : cfg.OWNER_ABOUT || [];
  const badges = Array.isArray(about.badges) && about.badges.length ? about.badges : DEFAULT_BADGES;
  const facts = Array.isArray(parcours.facts) && parcours.facts.length ? parcours.facts : cfg.OWNER_FACTS || [];

  const textEl = document.getElementById("about-text");
  if (textEl) {
    const paras = paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
    const badgeHTML = badges.length
      ? `<div class="badges">${badges.map((b) => `<span class="badge">${esc(b)}</span>`).join("")}</div>`
      : "";
    textEl.innerHTML = paras + badgeHTML;
  }

  const factsEl = document.getElementById("about-facts");
  if (factsEl) {
    factsEl.innerHTML = facts
      .map(
        (f) => `<div class="fact">
        <span class="fact-ico">${esc(f.icon || "•")}</span>
        <div><div class="fact-label">${esc(f.label)}</div><div class="fact-value">${esc(f.value)}</div></div>
      </div>`
      )
      .join("");
  }
}

/* ---- Fenêtre contact ---- */
const SOCIAL_ICONS = {
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.82-2.05 3.75-2.05C20.4 8.65 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2.02 0-2.33 1.57-2.33 3.2V21H9z"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0012 2z"/></svg>',
  reddit: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.07c0-1.2-.98-2.17-2.18-2.17-.58 0-1.1.23-1.5.6-1.45-1-3.4-1.64-5.56-1.72l.95-4.45 3.1.66a1.56 1.56 0 103.06.06c0-.86-.7-1.56-1.56-1.56-.6 0-1.13.35-1.39.86l-3.46-.74a.4.4 0 00-.48.31l-1.06 4.99c-2.2.07-4.18.7-5.65 1.72a2.16 2.16 0 00-1.5-.6A2.17 2.17 0 002 12.07c0 .85.49 1.58 1.2 1.94a3.9 3.9 0 00-.05.62c0 3.15 3.67 5.71 8.2 5.71 4.53 0 8.2-2.56 8.2-5.71 0-.21-.02-.42-.05-.62a2.17 2.17 0 001.2-1.94zM8.35 13.5a1.56 1.56 0 113.12 0 1.56 1.56 0 01-3.12 0zm7.57 3.65c-.95.95-2.78 1.02-3.32 1.02-.54 0-2.37-.07-3.32-1.02a.36.36 0 01.5-.5c.6.6 1.88.82 2.82.82.94 0 2.22-.22 2.82-.82a.36.36 0 01.5.5zm-.27-2.09a1.56 1.56 0 110-3.12 1.56 1.56 0 010 3.12z"/></svg>',
};

function setupContact() {
  const modal = document.getElementById("contact-modal");
  if (!modal) return;

  setText("contact-name", cfg.OWNER_NAME);
  setText("contact-role", cfg.OWNER_ROLE);

  // Lignes de contact
  const rows = [];
  if (cfg.OWNER_EMAIL)
    rows.push(contactRow("✉️", "Email", cfg.OWNER_EMAIL, "mailto:" + cfg.OWNER_EMAIL, "Écrire"));
  if (cfg.OWNER_PHONE)
    rows.push(contactRow("📱", "Téléphone", cfg.OWNER_PHONE_DISPLAY || cfg.OWNER_PHONE, "tel:" + cfg.OWNER_PHONE, "Appeler"));
  if (cfg.OWNER_LOCATION)
    rows.push(`<div class="contact-row"><span class="c-ico">📍</span><div class="c-main"><div class="c-label">Localisation</div><div class="c-value">${esc(cfg.OWNER_LOCATION)}</div></div></div>`);
  document.getElementById("contact-rows").innerHTML = rows.join("");

  // Réseaux
  const socials = [];
  if (cfg.OWNER_LINKEDIN) socials.push(socialLink("LinkedIn", cfg.OWNER_LINKEDIN, "linkedin"));
  if (cfg.OWNER_GITHUB) socials.push(socialLink("GitHub", cfg.OWNER_GITHUB, "github"));
  if (cfg.OWNER_REDDIT) socials.push(socialLink("Reddit", cfg.OWNER_REDDIT, "reddit"));
  const socialsEl = document.getElementById("contact-socials");
  socialsEl.innerHTML = socials.join("");
  if (!socials.length) {
    socialsEl.previousElementSibling.style.display = "none";
    socialsEl.style.display = "none";
  }

  // vCard
  const vc = document.getElementById("contact-vcard");
  if (cfg.OWNER_VCARD) vc.href = cfg.OWNER_VCARD;
  else vc.style.display = "none";

  // Ouverture / fermeture
  const open = () => modal.classList.add("open");
  const close = () => modal.classList.remove("open");
  document.querySelectorAll(".js-contact").forEach((b) => b.addEventListener("click", open));
  document.getElementById("contact-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

function contactRow(icon, label, value, href, cta) {
  return `<a class="contact-row" href="${esc(href)}">
    <span class="c-ico">${icon}</span>
    <div class="c-main"><div class="c-label">${esc(label)}</div><div class="c-value">${esc(value)}</div></div>
    <span class="c-go">${esc(cta)}</span>
  </a>`;
}
function socialLink(name, href, key) {
  return `<a class="social-link" href="${esc(href)}" target="_blank" rel="noopener">${SOCIAL_ICONS[key] || ""}<span>${esc(name)}</span></a>`;
}

/* ---- Chargement ---- */
async function load() {
  hydrateHero();
  setupContact();
  showSkeletons();
  let settings = {};
  try {
    settings = await fetchSettings();
  } catch (e) {
    console.warn("Settings indisponibles, repli sur la config locale.", e);
  }
  hydrateAbout(settings);
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

  const featured = p.featured ? `<span class="card-featured">À la une</span>` : "";
  const tags = (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");

  const links = [];
  if (p.live_url) links.push(`<a class="card-link primary" href="${esc(p.live_url)}" target="_blank" rel="noopener">Voir le projet ↗</a>`);
  if (p.repo_url) links.push(`<a class="card-link" href="${esc(p.repo_url)}" target="_blank" rel="noopener">Code</a>`);
  const linksHTML = links.length ? `<div class="card-links">${links.join("")}</div>` : "";

  return `<article class="card${p.featured ? " is-featured" : ""}">
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

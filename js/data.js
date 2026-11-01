/* =========================================================
   Données de départ (mode démo + seed Supabase)
   Ces 9 projets correspondent à vos dossiers existants.
   Ils servent de contenu de secours si Supabase n'est pas
   encore configuré, et de jeu de données initial (voir
   supabase/schema.sql pour les insérer en base).
   ========================================================= */
window.SEED_PROJECTS = [
  {
    title: "Relais Tournée",
    category: "Application",
    description:
      "Application de gestion des tournées de relais : suivi, organisation et visualisation des points de passage. Développée en React avec authentification et base de données Supabase.",
    tags: ["React", "TypeScript", "Vite", "Supabase"],
    image_url: "",
    live_url: "",
    repo_url: "",
    featured: true,
    sort_order: 1,
  },
  {
    title: "Réservation des véhicules municipaux · Ollioules",
    category: "Application",
    description:
      "Outil de réservation des véhicules de la mairie d'Ollioules pour les associations : calendrier de disponibilité, demandes et espace association. Projet avec présentation et plan de mise en production.",
    tags: ["HTML", "JavaScript", "Collectivité"],
    image_url: "",
    live_url: "",
    repo_url: "",
    featured: true,
    sort_order: 2,
  },
  {
    title: "Sport Site Builder",
    category: "Site web",
    description:
      "Base réutilisable pour créer le site officiel d'un club sportif : identité, couleurs et contenus configurables depuis un espace admin, sans toucher au code. Stack 100 % vanilla.",
    tags: ["PHP", "MySQL", "JavaScript", "PWA"],
    image_url: "",
    live_url: "",
    repo_url: "",
    featured: true,
    sort_order: 3,
  },
  {
    title: "Volley Ball Ollioulais",
    category: "Site web",
    description:
      "Site officiel du club de volley-ball d'Ollioules : présentation des équipes, actualités et informations pratiques pour les licenciés et visiteurs.",
    tags: ["Web", "Club sportif"],
    image_url: "",
    live_url: "",
    repo_url: "",
    featured: false,
    sort_order: 4,
  },
  {
    title: "Knight's Quest",
    category: "Jeu",
    description:
      "Jeu vidéo jouable directement dans le navigateur : aventure d'un chevalier, rendu et logique entièrement en JavaScript.",
    tags: ["JavaScript", "Canvas", "Jeu"],
    image_url: "",
    live_url: "",
    repo_url: "",
    featured: false,
    sort_order: 5,
  },
  {
    title: "Générateur de factures",
    category: "Outil",
    description:
      "Outil pour créer et exporter des factures proprement mises en forme, directement depuis le navigateur, sans logiciel à installer.",
    tags: ["HTML", "JavaScript", "PDF"],
    image_url: "",
    live_url: "",
    repo_url: "",
    featured: false,
    sort_order: 6,
  },
  {
    title: "Suivi des prélèvements",
    category: "Outil",
    description:
      "Tableau de bord personnel pour suivre ses prélèvements et abonnements récurrents, garder un œil sur ses dépenses mensuelles et anticiper les échéances.",
    tags: ["HTML", "JavaScript", "Finances"],
    image_url: "",
    live_url: "",
    repo_url: "",
    featured: false,
    sort_order: 7,
  },
  {
    title: "Encodeur Arbre des mots",
    category: "Outil",
    description:
      "Outil d'encodage basé sur une structure en arbre des mots, avec une page de partage dédiée. Un petit projet algorithmique et pédagogique.",
    tags: ["HTML", "JavaScript", "Algorithme"],
    image_url: "",
    live_url: "",
    repo_url: "",
    featured: false,
    sort_order: 8,
  },
  {
    title: "Invitation Anniversaire",
    category: "Site web",
    description:
      "Page d'invitation d'anniversaire animée et festive, pensée pour être partagée facilement avec les invités.",
    tags: ["HTML", "CSS", "Animation"],
    image_url: "",
    live_url: "",
    repo_url: "",
    featured: false,
    sort_order: 9,
  },
];

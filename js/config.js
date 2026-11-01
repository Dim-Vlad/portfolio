/* =========================================================
   CONFIGURATION — à remplir une seule fois
   ---------------------------------------------------------
   Récupérez ces 2 valeurs dans votre projet Supabase :
   Project Settings → API → "Project URL" et "anon public" key.
   Tant que ces champs restent vides, le portfolio fonctionne
   en mode démo avec la liste de projets ci-dessous (js/data.js),
   mais la connexion et l'ajout en ligne sont désactivés.
   ========================================================= */
window.PORTFOLIO_CONFIG = {
  SUPABASE_URL: "https://zadosrxichgfhelyrxdf.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_7BQg1sqY_V_FZpkpCHHM9Q_vibH0Z3I",

  // Infos affichées dans le hero (modifiables librement)
  OWNER_NAME: "Dimitri Garrigues",
  OWNER_BRAND: "DG-Dev",
  OWNER_ROLE: "Développeur web autodidacte",
  OWNER_TAGLINE:
    "Je conçois des applications et des sites sur mesure — du jeu navigateur à l'outil métier, en passant par les sites de clubs et les apps de gestion.",
  OWNER_LOCATION: "Toulon (83)",

  // Section « À propos » : chaque chaîne est un paragraphe
  OWNER_ABOUT: [
    "Développeur web autodidacte, je transforme des besoins concrets en applications et sites sur mesure. Du jeu dans le navigateur à l'outil métier, en passant par les sites de clubs sportifs et les applications de gestion, j'aime concevoir des solutions simples, utiles et soignées.",
    "Je consolide cette pratique par une formation diplômante Graduate Développeur Flutter chez STUDI (2023–2029), pour aller plus loin — notamment vers le développement d'applications mobiles.",
  ],

  // Parcours (affiché dans la carte « À propos »)
  OWNER_FACTS: [
    { icon: "🎓", label: "STUDI — Graduate Développeur Flutter", value: "2023 – 2029" },
    { icon: "🚀", label: "Parcours", value: "Autodidacte" },
    { icon: "📍", label: "Localisation", value: "Toulon (83)" },
  ],

  // Coordonnées & réseaux (repris de votre carte de visite)
  OWNER_EMAIL: "dimitrigarrigues@gmail.com",
  OWNER_PHONE: "+33603891971",
  OWNER_PHONE_DISPLAY: "06 03 89 19 71",
  OWNER_LINKEDIN: "https://www.linkedin.com/in/dimitri-garrigues-4b76a317b/",
  OWNER_GITHUB: "https://github.com/Dim-Vlad",
  OWNER_REDDIT: "https://www.reddit.com/user/AsleepAd420/",
  OWNER_VCARD: "https://www.volleyballollioulais.fr/vCard/DG-Dev.vcf",
};

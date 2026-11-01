# Portfolio — Dimitri Garrigues

Portfolio personnel pour présenter mes projets, avec un **espace privé** (connexion réservée à moi)
permettant d'**ajouter / modifier / supprimer** mes réalisations sans toucher au code.

- **100 % statique** (HTML / CSS / JavaScript) → se déploie partout : OVH (FTP), Netlify, Vercel, GitHub Pages…
- **Aucune étape de build** — pas de `npm install`, pas de compilation.
- **Backend Supabase** (gratuit) pour la base de données, l'authentification et le stockage des images.

---

## 📁 Structure

```
Portfolio/
├── index.html          → le portfolio public
├── admin.html          → l'espace privé (connexion + gestion)
├── css/style.css       → tout le design (clair/sombre, responsive)
├── js/
│   ├── config.js       → ⚙️ vos clés Supabase + infos du hero (À REMPLIR)
│   ├── data.js         → vos 9 projets (contenu de secours / mode démo)
│   ├── supabase-client.js
│   ├── public.js       → logique de la page publique
│   └── admin.js        → logique de l'espace privé
├── supabase/schema.sql → à exécuter une fois dans Supabase
└── README.md
```

> **Mode démo** : tant que `config.js` n'est pas rempli, le site s'affiche avec les 9 projets de `data.js`.
> C'est pratique pour prévisualiser immédiatement, mais la connexion et l'ajout en ligne restent désactivés.

---

## 🚀 Mise en service (une seule fois, ~10 min)

### 1. Créer le projet Supabase
1. Allez sur [supabase.com](https://supabase.com) → **New project** (gratuit).
2. Une fois créé, ouvrez **SQL Editor → New query**, collez tout le contenu de
   [`supabase/schema.sql`](supabase/schema.sql) puis **Run**.
   → cela crée les tables `projects` et `settings`, les règles de sécurité, le stockage des images
   et insère vos 9 projets + les contenus « À propos »/« Parcours ».

   > Si vous aviez déjà exécuté une **ancienne** version de `schema.sql` (sans la table `settings`),
   > lancez en plus, une seule fois, le fichier [`supabase/02-settings.sql`](supabase/02-settings.sql).

### 2. Créer VOTRE compte (le seul autorisé)
1. Dans Supabase : **Authentication → Users → Add user → Create new user**.
2. Saisissez votre email et un mot de passe. Cochez **Auto Confirm User**.
3. **Important — bloquer les inscriptions publiques** pour que vous soyez le seul à pouvoir vous connecter :
   **Authentication → Sign In / Providers → Email** → désactivez **Allow new users to sign up**.

### 3. Brancher le site sur Supabase
1. Dans Supabase : **Project Settings → API**.
2. Copiez **Project URL** et la clé **anon public**.
3. Ouvrez [`js/config.js`](js/config.js) et renseignez :
   ```js
   SUPABASE_URL: "https://xxxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGci...",
   ```
4. (Optionnel) Ajustez votre nom, votre rôle et la phrase d'accroche dans le même fichier.

### 4. Tester en local
Ouvrez simplement `index.html` dans votre navigateur.
> ⚠️ Les scripts sont des **modules ES** : certains navigateurs bloquent `file://`.
> Si la page reste vide, lancez un petit serveur local depuis le dossier `Portfolio/` :
> ```bash
> python -m http.server 5500
> ```
> puis ouvrez `http://localhost:5500`. (L'extension *Live Server* de VS Code fait pareil.)

---

## 🔐 Se connecter et gérer ses projets
1. Allez sur `admin.html` (lien **« Espace privé »** en bas du site).
2. Connectez-vous avec l'email/mot de passe créés à l'étape 2.
3. **+ Nouveau projet** pour ajouter une réalisation : titre, catégorie, description,
   technologies, image de couverture (téléversée ou via URL), liens, « à la une », ordre d'affichage.
4. Les changements sont visibles **immédiatement** sur le portfolio public.

---

## 🌐 Mise en ligne

### Option A — OVH (FTP)
Transférez **tout le contenu du dossier `Portfolio/`** dans le dossier `www/` de votre hébergement
(via FileZilla ou l'explorateur OVH). C'est tout — aucune configuration serveur nécessaire.

### Option B — Gratuit (Netlify / Vercel / GitHub Pages)
- **Netlify** : glissez-déposez le dossier `Portfolio/` sur [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages** : poussez le dossier dans un dépôt, puis **Settings → Pages**.

> Pensez à ajouter l'URL de votre site déployé dans Supabase :
> **Authentication → URL Configuration → Site URL / Redirect URLs**.

---

## 🎨 Personnalisation rapide
- **Couleurs / thème** : variables en haut de [`css/style.css`](css/style.css) (`--brand`, `--brand-2`, `--accent`…).
- **Thème clair/sombre** : bouton en haut à droite, mémorisé par visiteur.
- **Texte du hero, nom, email** : [`js/config.js`](js/config.js).

---

## 🔒 Sécurité — notes
- La clé `anon` est **publique par conception** : elle n'autorise que la **lecture** des projets.
  Toute écriture (ajout/modif/suppression) exige une **session authentifiée** (RLS côté Supabase).
- En désactivant les inscriptions (étape 2.3), **vous êtes le seul compte** pouvant se connecter.

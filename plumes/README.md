# Le Cabinet des Oiseaux 🪶

Un « pokédex » personnel pour répertorier des oiseaux.
Les visiteurs consultent la collection ; **toi seul** peux ajouter, modifier ou supprimer des fiches, via une page de gestion protégée par mot de passe.

- **Site statique** (HTML/CSS/JS) → hébergeable gratuitement sur GitHub Pages.
- **Supabase** → base de données + authentification.
- **Aucune étape de compilation**, aucun `npm`. Tu déposes les fichiers, c'est en ligne.

## Ce que contient une fiche
- Un ou plusieurs **médias en haut** : images (via une URL, ex. hébergées sur GitHub) **et/ou** intégrations de publications **Instagram**.
- **Nom**
- **Description**
- **Alimentation**
- **Comportement**

Toutes les fiches utilisent le même gabarit et sont numérotées dans l'ordre alphabétique.

---

## Installation en 5 étapes

### 1. Créer la base Supabase
1. Crée un compte sur https://supabase.com puis un nouveau projet (le plan gratuit suffit).
2. Ouvre **SQL Editor** → **New query**, colle tout le contenu de `supabase-setup.sql`, puis **Run**.
   Cela crée la table `birds` et les règles de sécurité (lecture publique, écriture réservée aux comptes connectés).

### 2. Créer ton compte administrateur
1. Dans Supabase : **Authentication** → **Users** → **Add user** → **Create new user**.
2. Saisis ton e-mail et un mot de passe, et coche « Auto Confirm User » si proposé.
3. **Ensuite**, va dans **Authentication → Sign In / Providers** (rubrique Email) et **désactive « Allow new users to sign up »**.
   👉 Étape essentielle : elle empêche quiconque de se créer un compte pour modifier ton site.

### 3. Renseigner les clés
1. Dans Supabase : **Project Settings** → **API**.
2. Copie **Project URL** et la clé **anon public**.
3. Ouvre `assets/config.js` et remplace :
   ```js
   const SUPABASE_URL = "https://VOTRE-PROJET.supabase.co";
   const SUPABASE_ANON_KEY = "VOTRE_CLE_ANON_PUBLIC";
   ```
   > La clé `anon` est publique **sans danger** : les règles de sécurité (RLS) posées à l'étape 1 empêchent toute modification sans être connecté.

   Tu peux aussi personnaliser le titre du site juste en dessous (`SITE.title`).

### 4. Mettre en ligne sur GitHub Pages
1. Crée un dépôt GitHub, dépose tous ces fichiers à la racine (`index.html`, `bird.html`, `admin.html`, le dossier `assets/`…).
2. Dans le dépôt : **Settings** → **Pages** → Source : *Deploy from a branch* → branche `main`, dossier `/root` → **Save**.
3. Après une minute, ton site est disponible à l'adresse indiquée (ex. `https://ton-pseudo.github.io/ton-depot/`).

### 5. Ajouter ton premier oiseau
1. Va sur `…/admin.html`, connecte-toi avec le compte de l'étape 2.
2. Clique **+ Nouvel oiseau**, remplis les champs, ajoute des médias, **Enregistrer**.

---

## Ajouter des images (hébergées sur GitHub)
1. Dépose ton image dans un dossier de ton dépôt (ex. `images/rouge-gorge.jpg`).
2. Sur GitHub, ouvre l'image → bouton **Raw** → copie l'URL. Elle ressemble à :
   `https://raw.githubusercontent.com/ton-pseudo/ton-depot/main/images/rouge-gorge.jpg`
3. Dans la gestion, ajoute un média de type **Image** et colle cette URL.

> La première image d'une fiche sert de vignette dans la collection.

## Ajouter une vidéo YouTube (Short ou classique)
1. Sur YouTube, copie le lien de la vidéo ou du Short — tous les formats marchent :
   `https://www.youtube.com/shorts/XXXX`, `https://youtu.be/XXXX`, ou `https://www.youtube.com/watch?v=XXXX`.
2. Dans la gestion, ajoute un média de type **YouTube** et colle le lien.
   La vidéo se lit **directement sur la fiche** (les Shorts s'affichent en vertical, les vidéos classiques en 16:9). Aucune redirection vers YouTube.

## Ajouter une publication Instagram
1. Sur Instagram, ouvre la publication et copie son lien
   (ex. `https://www.instagram.com/p/ABCDEF123/`).
2. Dans la gestion, ajoute un média de type **Instagram** et colle ce lien.
   L'intégration s'affiche automatiquement en haut de la fiche.

---

## Structure des fichiers
```
index.html          Collection (liste alphabétique + recherche)
bird.html           Gabarit d'une fiche oiseau
admin.html          Espace de gestion (connexion + édition)
assets/
  config.js         ← tes clés Supabase + titre du site
  style.css         Mise en forme
  list.js           Logique de la collection
  bird.js           Logique d'une fiche
  admin.js          Logique de la gestion
supabase-setup.sql  Script à exécuter dans Supabase
```

## Bon à savoir
- Le champ description accepte les **paragraphes** (laisse une ligne vide entre deux blocs).
- Pour changer les couleurs / polices, tout est en haut de `assets/style.css` (variables `--paper`, `--jay`, etc.).
- La page `admin.html` porte une balise `noindex` pour ne pas apparaître dans les moteurs de recherche — mais elle reste protégée avant tout par la connexion.

# Cours C# pour Unity

Un site statique de 99 leçons de C# pour Unity, classées en 7 thèmes et 3 niveaux. Chaque leçon contient des explications, un exercice, un indice et une solution cachée. Il n'y a ni serveur, ni base de données, ni étape de compilation.

## Contenu du dossier

```
index.html          la page (en-tête, zone de contenu, chargement des scripts)
styles.css          tout le style (thème clair et sombre automatique)
app.js              l'application : accueil, pages de leçon, filtres, schémas interactifs
lessons/
  00-base.js        les 26 leçons d'origine (tous thèmes)
  01-csharp.js      Bases du C#
  02-poo.js         Objets et patterns
  03-algo.js        Algorithmes
  04-maths.js       Maths du jeu
  05-unity.js       Unity
  06-editor.js      Outils éditeur et CI
  07-perf.js        Performance
  08-design.js      Game design
  09-exos-1..4.js   Exercices (100 exercices seuls : énoncé, indice, solution, source)
  x-*.js            approfondissements par thème (À retenir, Pour aller plus loin, défis)
  c-*.js            cours complets (chapitres, erreurs fréquentes, résumé, quiz, sources)
```

## 1. L'ouvrir sur ton ordinateur

Décompresse le dossier et double-clique sur `index.html`. Le site marche directement dans le navigateur, sans connexion (il lui faut seulement Internet pour les polices ; sans connexion, il prend les polices du système).

## 2. Le mettre en ligne

### Option A : Netlify Drop (le plus simple, aucun compte Git)
1. Va sur https://app.netlify.com/drop
2. Glisse le dossier entier dans la page.
3. Netlify te donne une adresse publique en quelques secondes. Crée un compte gratuit si tu veux garder le site en ligne et choisir son nom.

### Option B : GitHub Pages
1. Crée un dépôt sur GitHub, par exemple `carnet-csharp`.
2. Envoie le contenu du dossier à la racine du dépôt :
   ```
   git init
   git add .
   git commit -m "Carnet C# pour Unity"
   git branch -M main
   git remote add origin https://github.com/TON-COMPTE/carnet-csharp.git
   git push -u origin main
   ```
3. Sur GitHub : Settings › Pages › Source « Deploy from a branch », branche `main`, dossier `/ (root)`.
4. Le site sera disponible à `https://TON-COMPTE.github.io/carnet-csharp/` après une ou deux minutes.

### Option C : n'importe quel hébergeur
Copie les fichiers tels quels (FTP, panneau d'hébergement, serveur Nginx ou Apache). Comme tout est statique, il n'y a rien à configurer.

## 3. Ajouter ou modifier une leçon

Chaque fichier de `lessons/` ajoute des leçons à une liste commune. Une leçon a cette forme :

```js
{id:'mon-identifiant', cat:'maths', lvl:2,
 title:'Titre de la leçon',
 sum:'Une phrase de résumé.',
 body:[
   ['Titre de section', `Texte. ~code en ligne~, **gras**, lien vers [[vecteurs]] ou [[vecteurs|un texte de lien]].`],
   ['Section avec exemple', `Texte.`, `// un bloc de code affiché sous le texte`]
 ],
 ex:`Énoncé de l'exercice.`,
 exCode:`// facultatif : du code fourni avec l'énoncé`,
 hint:`L'indice.`,
 sol:`// la solution`,
 diag:'add'   // facultatif : schéma interactif (add, len, dot, lerp, trig)
}
```

- `id` : lettres minuscules, chiffres et tirets. Il sert d'adresse (`index.html#mon-identifiant`) et de cible pour les liens `[[...]]`.
- `cat` : `csharp`, `poo`, `algo`, `maths`, `unity`, `editor`, `perf`, `design` ou `exos`.
- Pour un exercice seul (`cat:'exos'`), `body` est inutile ; ajoute si tu veux `src:['Nom de la source', 'https://...']`, affiché sous le résumé.
- `lvl` : 1 (débutant), 2 (intermédiaire) ou 3 (avancé).
- Les textes sont entre accents graves `` ` ``. N'utilise pas d'accent grave ni la suite `${` à l'intérieur.
- L'ordre d'affichage d'un thème est défini dans `app.js` (listes `order` de `CATS`). Une nouvelle leçon absente de la liste s'affiche à la fin de son thème.
- La section « Réutilisée dans » se calcule toute seule à partir des liens `[[...]]`.

### Approfondissements

Les fichiers `lessons/x-*.js` ajoutent à chaque leçon, par son `id` :

```js
'singleton': {
  r: [`Point clé 1`, `Point clé 2`],                 // encadré « À retenir »
  m: [['Titre', `Texte`, `// code facultatif`]],     // sections « Pour aller plus loin »
  d: [[`Énoncé du défi`, `Indice`]]                  // défis supplémentaires
}
```

### Cours complets

Les fichiers `lessons/c-*.js` remplacent les explications courtes d'une leçon par un cours complet :

```js
'variables-types': {
  lead: `Introduction`,
  ch: [['Titre du chapitre', `Paragraphe`, {c:`code`, t:`légende`}, {n:`astuce`}, {w:`attention`}, {u:`dans Unity`}, {l:[`point 1`, `point 2`]}, {tab:[['En-tête'], ['Cellule']]}]],
  err: [[`Erreur`, `Explication`]],
  res: [`Point du résumé`],
  quiz: [[`Question`, [`Réponse A`, `Réponse B`], 1, `Explication`]],   // 1 = indice de la bonne réponse
  src: [[`Titre de la source`, `https://...`]]
}
```

Pour un nouveau fichier de leçons, ajoute sa ligne `<script src="lessons/....js"></script>` dans `index.html`, avant `app.js`.

## 4. Bon à savoir

- Le brouillon de chaque exercice et les leçons cochées sont enregistrés dans le navigateur (`localStorage`). Ils ne sont partagés ni entre appareils, ni avec d'autres personnes.
- Les solutions visent Unity 6 (par exemple `linearVelocity`, `Awaitable`, `FindObjectsByType`). Certaines leçons demandent des paquets : Input System, AI Navigation, Addressables, Burst et Collections, Unity Test Framework, TextMeshPro.
- Les extraits supposent les `using` habituels (`UnityEngine`, `System`, `System.Collections`, `System.Collections.Generic`, `System.Linq`, `UnityEditor`, etc.), qui ne sont pas répétés dans chaque solution.


## Application installable (PWA)

Le site peut s'installer comme une application sur téléphone et ordinateur, et fonctionne hors ligne après la première visite.

- `manifest.webmanifest` : nom, couleurs et icônes de l'application.
- `icons/` : icônes PNG (192, 512, version « maskable » pour Android, 180 pour iPhone).
- `sw.js` : le service worker. Il charge toujours la dernière version quand il y a du réseau, et utilise le cache hors connexion.
- `pwa.js` : enregistre le service worker, affiche le bouton « Installer » (Android, Chrome, Edge) et l'aide pour iPhone.

**Quand tu ajoutes ou renommes un fichier du site**, ajoute-le à la liste `FILES` en haut de `sw.js` et augmente `VERSION` (v1 → v2). Sinon il ne sera pas disponible hors ligne. Modifier un fichier existant ne demande rien : la nouvelle version est récupérée automatiquement.

Le service worker ne fonctionne qu'en HTTPS (GitHub Pages) ou sur `localhost`. En ouvrant `index.html` par double-clic, le site marche toujours, mais sans le mode hors ligne.

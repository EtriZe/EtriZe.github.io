# Carnet C# pour Unity

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
  x-*.js            approfondissements par thème (À retenir, Pour aller plus loin, défis)
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
- `cat` : `csharp`, `poo`, `algo`, `maths`, `unity`, `editor` ou `perf`.
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

Pour un nouveau fichier de leçons, ajoute sa ligne `<script src="lessons/....js"></script>` dans `index.html`, avant `app.js`.

## 4. Bon à savoir

- Le brouillon de chaque exercice et les leçons cochées sont enregistrés dans le navigateur (`localStorage`). Ils ne sont partagés ni entre appareils, ni avec d'autres personnes.
- Les solutions visent Unity 6 (par exemple `linearVelocity`, `Awaitable`, `FindObjectsByType`). Certaines leçons demandent des paquets : Input System, AI Navigation, Addressables, Burst et Collections, Unity Test Framework, TextMeshPro.
- Les extraits supposent les `using` habituels (`UnityEngine`, `System`, `System.Collections`, `System.Collections.Generic`, `System.Linq`, `UnityEditor`, etc.), qui ne sont pas répétés dans chaque solution.

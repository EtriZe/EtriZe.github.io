window.EXTRA=Object.assign(window.EXTRA||{},{
'profiler-markers':{
r:[`Mesurer, corriger, mesurer à nouveau.`,`~ProfilerMarker~ + ~using (marker.Auto())~ pour voir l'intérieur de son code.`,`Profiler un build de développement sur la machine cible.`],
m:[
['CPU ou GPU',`Une image lente peut venir du processeur (scripts, physique, animation) ou de la carte graphique (trop de pixels, de shaders, d'objets dessinés). Si le CPU attend le GPU (« Gfx.WaitForPresent » dans le profiler), optimiser les scripts ne servira à rien. Le Frame Debugger et les outils GPU (RenderDoc, PIX) prennent alors le relais.`],
['Budgets',`Les équipes fixent des **budgets** par système : sur 16,6 ms, par exemple 4 ms de gameplay, 2 ms de physique, 2 ms d'animation, 1 ms d'UI. Chaque système sait s'il déborde. Les ~ProfilerRecorder~ lisent ces mesures depuis le code, pour un affichage en jeu ou une alerte en CI.`],
['Memory Profiler',`Le paquet Memory Profiler prend des instantanés de la mémoire et les compare : textures en double, objets qui auraient dû être détruits, ScriptableObjects qui retiennent des listes énormes. Prendre un instantané au menu, jouer un niveau, revenir au menu et comparer révèle les fuites.`]],
d:[[`Affiche en jeu le temps du thread principal et la mémoire GC allouée par image avec ~ProfilerRecorder~.`,`ProfilerRecorder.StartNew(ProfilerCategory.Internal, "Main Thread") et (ProfilerCategory.Memory, "GC Allocated In Frame").`],
[`Prends un instantané mémoire au menu, joue un niveau, reviens au menu, prends un second instantané et cherche ce qui reste du niveau.`,`Memory Profiler > Compare ; filtre sur les objets du niveau.`]]},

'cache-references':{
r:[`Faire une recherche une fois, garder le résultat.`,`Hash des chaînes : ~StringToHash~, ~PropertyToID~.`,`Un cache peut devenir périmé : vérifier ~!= null~.`],
m:[
['Matériaux : material ou sharedMaterial',`~renderer.material~ crée une **copie** du matériau pour cet objet au premier accès (et elle doit être détruite à la main). ~sharedMaterial~ modifie l'asset partagé par tous. Pour changer la couleur d'un objet sans copier son matériau, ~MaterialPropertyBlock~ ou les propriétés par instance sont la solution performante, compatible avec le regroupement des appels de rendu.`,`private static readonly int ColorId = Shader.PropertyToID("_BaseColor");
private MaterialPropertyBlock block;

void SetColor(Renderer r, Color c)
{
    block ??= new MaterialPropertyBlock();
    r.GetPropertyBlock(block);
    block.SetColor(ColorId, c);
    r.SetPropertyBlock(block);
}`],
['Camera.main',`Dans les anciennes versions, ~Camera.main~ cherchait l'objet taggé « MainCamera » à chaque appel. Unity l'a optimisé depuis 2020, mais le garder en cache reste une habitude saine et rend la dépendance visible.`]],
d:[[`Change la couleur de 1 000 cubes chaque image avec ~material.color~ puis avec un ~MaterialPropertyBlock~, et compare dans le Profiler et le Frame Debugger.`,`Regarde le nombre d'appels de rendu (batches) et la mémoire.`],
[`Écris un ~ComponentCache<T>~ qui garde le résultat de ~GetComponent<T>~ par GameObject dans un dictionnaire, et nettoie les entrées d'objets détruits.`,`Dictionary<GameObject, T> ; supprime les clés == null périodiquement.`]]},

'allocations-gc':{
r:[`Chaque allocation sur le tas nourrit le ramasse-miettes, qui fait des pauses.`,`Sources cachées : chaînes, LINQ, lambdas, boxing, ~new~ dans Update.`,`Objectif en gameplay : 0 octet alloué par image.`],
m:[
['Le ramasse-miettes de Unity',`Unity utilise un ramasse-miettes non générationnel (Boehm) : chaque passage examine tout le tas, et la pause grandit avec la quantité de mémoire. Le mode **incrémental** (activé par défaut) répartit ce travail sur plusieurs images, ce qui réduit les pics, sans dispenser de limiter les allocations.`],
['Déclencher au bon moment',`On peut forcer un passage (~GC.Collect()~) à un moment où personne ne le remarque : pendant un écran de chargement, à l'ouverture d'un menu. Combiné à peu d'allocations en jeu, cela supprime quasiment les saccades.`],
['Le boxing en détail',`Mettre une struct dans une variable ~object~ ou une interface crée une copie sur le tas. Pièges fréquents : un ~Dictionary~ avec une clé enum dans d'anciens runtimes, ~string.Format~ avec des nombres, une struct qui implémente une interface et qu'on passe en tant qu'interface, ~Equals(object)~ non surchargé sur une struct.`]],
d:[[`Écris un script volontairement mauvais (5 sources d'allocation différentes dans Update), repère chacune dans le Profiler en mode Deep Profile, puis corrige-les une par une en notant le gain.`,`Chaîne concaténée, LINQ, lambda capturante, GetComponents, new List.`],
[`Écris une ~struct~ clé de dictionnaire qui n'entraîne aucun boxing (~IEquatable<T>~ et ~GetHashCode~), et vérifie l'absence d'allocation avec le Profiler.`,`Sans IEquatable, le Dictionary appelle Equals(object) et emballe la struct.`]]},

'object-pooling':{
r:[`Réutiliser au lieu de créer et détruire.`,`Réinitialiser l'état à la sortie de la réserve.`,`~UnityEngine.Pool.ObjectPool<T>~ est fourni.`],
m:[
['ObjectPool de Unity',`~new ObjectPool<Bullet>(create, onGet, onRelease, onDestroy, collectionCheck, defaultCapacity, maxSize)~ : on donne quoi faire à la création, à la sortie, au retour et à la destruction. ~collectionCheck~ détecte (dans l'éditeur) un objet rendu deux fois. ~maxSize~ borne la réserve : au-delà, les objets rendus sont détruits.`,`pool = new ObjectPool<Bullet>(
    () => Instantiate(prefab),
    b => b.gameObject.SetActive(true),
    b => b.gameObject.SetActive(false),
    b => Destroy(b.gameObject),
    collectionCheck: true, defaultCapacity: 50, maxSize: 500);`],
['Qui rend l\'objet',`Le plus propre : l'objet connaît sa réserve et se rend lui-même (une balle qui touche ou expire appelle ~pool.Release(this)~). Il faut alors interdire ~Destroy~ sur ces objets, et prévoir le cas du changement de scène (vider la réserve).`],
['Le pooling n\'est pas gratuit',`Une réserve garde la mémoire occupée en permanence, et l'activation d'un objet complexe a aussi un coût (OnEnable de tous ses composants). Mesure avant (voir [[profiler-markers]]) : pour un objet créé une fois par minute, le pooling n'apporte rien.`]],
d:[[`Réécris ton système de balles avec ~ObjectPool<T>~, des balles qui se rendent elles-mêmes après 3 secondes ou au contact, et ~collectionCheck~ activé.`,`La balle reçoit la référence du pool dans une méthode Init.`],
[`Fais un pool de systèmes de particules d'impact qui rend chaque effet quand il a fini de jouer.`,`ParticleSystem main.stopAction = Callback ; OnParticleSystemStopped() rend l'objet.`]]},

'update-manager':{
r:[`Une boucle C# centrale coûte moins que des milliers d'Update.`,`S'inscrire dans OnEnable, se désinscrire dans OnDisable.`,`Mettre à jour moins souvent ce qui peut attendre.`],
m:[
['Niveaux de détail du comportement',`Comme les maillages ont des niveaux de détail, le comportement aussi : un ennemi à 100 m n'a pas besoin d'animation complète, de recherche de chemin fréquente ni de sons. On réduit la fréquence et la précision selon la distance ou la visibilité. Les grands jeux en monde ouvert reposent beaucoup sur cette idée.`],
['Données plutôt qu\'objets',`Le gestionnaire peut aller plus loin : au lieu d'appeler une méthode par objet, il garde les données de tous les objets dans des tableaux et les traite en une seule boucle. C'est la porte d'entrée vers l'orienté données et les [[jobs-burst|jobs]].`]],
d:[[`Ajoute au ~TickManager~ des niveaux de fréquence selon la distance à la caméra (toutes les images sous 20 m, une image sur 4 sous 60 m, une sur 16 au-delà), recalculés une fois par seconde.`,`Trois listes ; un passage par seconde qui redistribue les objets.`],
[`Compare dans le Profiler 5 000 objets avec chacun leur Update contre le même travail via ~TickManager~.`,`Le même calcul trivial dans les deux cas ; regarde le temps total de la boucle.`]]},

'partition-spatiale':{
r:[`Ranger les objets par case pour ne comparer que les voisins.`,`Taille de case proche du rayon de recherche.`,`Pour des colliders, ~OverlapSphereNonAlloc~ fait déjà ce travail.`],
m:[
['Arbres spatiaux',`La grille est simple et rapide quand les objets sont répartis à peu près uniformément. Quand ils s'entassent à certains endroits, des arbres s'adaptent mieux : **quadtree** (2D) ou **octree** (3D) découpent l'espace là où il y a du monde, les **BVH** (hiérarchies de volumes englobants) servent aux lancers de rayons, les **k-d trees** à la recherche du plus proche voisin.`],
['Comportements de groupe',`Les « boids » (nuées d'oiseaux, bancs de poissons) calculent pour chaque individu la séparation, l'alignement et la cohésion avec ses voisins. Sans partition, 1 000 boids font un million de comparaisons par image ; avec une grille, quelques dizaines de milliers. C'est l'exercice idéal pour combiner [[vecteurs]], partition et [[jobs-burst]].`]],
d:[[`Écris un ~Quadtree~ 2D avec ~Insert(Vector2 point, T item)~ et ~Query(Rect area, List<T> results)~, qui se divise quand une case dépasse 8 éléments.`,`Chaque nœud a un Rect, une liste, et 4 enfants créés à la division.`],
[`Simule 2 000 boids (séparation, alignement, cohésion) en utilisant ta ~SpatialHash~ pour trouver les voisins, et mesure le temps par image.`,`Rayon de voisinage d'environ 2 unités ; taille de case égale au rayon.`]]},

'jobs-burst':{
r:[`Un job est une struct de données simples, exécutée en parallèle.`,`~NativeArray~ hors du ramasse-miettes, à libérer avec ~Dispose()~.`,`Lancer tôt, terminer tard ; Burst compile en code natif.`],
m:[
['Les règles de sécurité',`Unity vérifie dans l'éditeur que deux jobs n'écrivent pas dans le même tableau en même temps. ~[ReadOnly]~ sur un champ indique qu'un job ne fait que lire : plusieurs jobs peuvent alors lire le même tableau en parallèle. Un ~IJobParallelFor~ ne doit écrire qu'à l'indice qu'il traite.`],
['Dépendances entre jobs',`~job2.Schedule(count, 64, handle1)~ fait attendre job2 la fin de job1, sans bloquer le thread principal. On construit ainsi une chaîne (calculer les forces, puis intégrer, puis tester les collisions) qui tourne entièrement en arrière-plan.`],
['Burst et mathématiques',`Burst produit le meilleur code avec ~Unity.Mathematics~ (~float3~, ~math.dot~, ~math.normalize~) plutôt qu'avec ~Vector3~. Le code compilé peut traiter 4 ou 8 nombres à la fois (instructions SIMD). L'Inspector Burst montre le code produit, utile pour vérifier que la boucle est bien vectorisée.`]],
d:[[`Découpe la simulation en deux jobs chaînés : un qui applique la gravité et un vent par bruit de Perlin (~noise.cnoise~), un qui intègre les positions et gère les rebonds.`,`Le second Schedule prend le JobHandle du premier.`],
[`Affiche les 10 000 particules avec ~Graphics.RenderMeshInstanced~ à partir des positions calculées, sans aucun GameObject.`,`Construis un tableau de Matrix4x4 depuis le NativeArray (ou fais-le dans un troisième job).`]]}
});

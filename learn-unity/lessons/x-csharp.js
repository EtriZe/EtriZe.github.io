window.EXTRA=Object.assign(window.EXTRA||{},{
'variables-types':{
r:[`Le type d'une variable est fixé à la compilation.`,`Unity travaille en ~float~ : pense au suffixe ~f~.`,`Deux ~int~ divisés donnent un ~int~ ; compare les ~float~ avec une tolérance.`],
m:[
['Pourquoi 0,1 + 0,2 ne fait pas 0,3',`Un ~float~ stocke les nombres en binaire, sur 32 bits. Beaucoup de décimales simples (0,1) n'ont pas d'écriture exacte en binaire, comme 1/3 n'en a pas en décimal. Chaque calcul ajoute une petite erreur. ~float~ garde environ 7 chiffres significatifs : à 100 000 unités de l'origine, la précision tombe au centième, d'où les objets qui tremblent dans les très grands mondes (on recentre alors le monde autour du joueur).`],
['Les conversions',`Du plus petit au plus grand type, la conversion est implicite (~int~ vers ~float~). Dans l'autre sens, il faut un cast explicite, qui **tronque** : ~(int)2.9f~ vaut 2, ~(int)-2.9f~ vaut −2. Pour arrondir, ~Mathf.RoundToInt~ (qui arrondit 2,5 à 2, l'entier pair le plus proche), ~FloorToInt~ ou ~CeilToInt~.`],
['Le débordement',`Un ~int~ va jusqu'à environ 2,1 milliards. Au-delà, il « déborde » silencieusement et devient négatif : un score ou une monnaie de jeu incrémental peut afficher −2 147 483 648. ~long~ va bien plus loin ; ~checked(a + b)~ lève une exception au lieu de déborder.`,`int big = int.MaxValue;
big++;                       // -2147483648, sans erreur
long safe = (long)int.MaxValue + 1;   // 2147483648`]],
d:[[`Écris ~bool NearlyEqual(float a, float b, float epsilon = 1e-5f)~ qui fonctionne aussi pour de grands nombres (tolérance relative : proportionnelle à la taille des nombres).`,`Compare |a − b| à epsilon × max(1, |a|, |b|).`],
[`Écris ~string FormatGold(long amount)~ qui affiche 999, 1,2 k, 3,4 M, 5,6 Md, en évitant toute division entière involontaire.`,`Divise un double par 1000, 1 000 000, etc., et formate avec une décimale.`]]},

'conditions-boucles':{
r:[`~for~ avec un indice, ~foreach~ pour parcourir, ~while~ quand on ne connaît pas le nombre de tours.`,`~break~ sort, ~continue~ passe au tour suivant.`,`Toute boucle ~while~ doit avoir une limite de sécurité.`],
m:[
['Sortir tôt',`Plutôt que des ~if~ imbriqués sur quatre niveaux, on traite les cas d'exclusion en premier et on sort (~return~, ~continue~). Le code principal reste à gauche, lisible. C'est la « clause de garde », utilisée partout dans ce carnet.`,`foreach (var e in enemies)
{
    if (e == null) continue;
    if (!e.IsAlive) continue;
    if (!InRange(e)) continue;
    e.Alert();          // le vrai travail, sans imbrication
}`],
['Boucles imbriquées et coût',`Une boucle dans une boucle multiplie le nombre de tours : 100 × 100 = 10 000. Dans ~Update~, sur des centaines d'objets, cela se voit vite. Voir [[complexite]].`],
['Parcourir à l\'envers pour retirer',`Retirer l'élément i d'une liste décale tous les suivants vers la gauche. En avançant, on saute l'élément qui vient d'arriver en position i. En partant de la fin, les décalages ne touchent que des éléments déjà traités.`]],
d:[[`Écris ~int[] Fizz(int n)~ : pour chaque nombre de 1 à n, garde-le s'il est multiple de 3 ou de 5 mais pas des deux. Puis compte combien de nombres en dessous de 1000 respectent la règle.`,`Le reste de la division : % 3 == 0.`],
[`Écris ~Vector2Int FindSpawn(bool[,] blocked, Vector2Int start)~ qui cherche la première case libre en avançant en spirale, avec une limite de 500 essais.`,`Combine avec la leçon sur yield et la spirale, ou fais une boucle while avec un compteur.`]]},

'methodes-parametres':{
r:[`Une méthode = une action, nommée par un verbe.`,`~ref~ modifie la variable de l'appelant, ~out~ oblige à la remplir.`,`Arguments nommés et valeurs par défaut rendent les appels lisibles.`],
m:[
['Petites méthodes, bons noms',`Une méthode de 80 lignes fait plusieurs choses ; découpe-la et le nom de chaque morceau devient de la documentation. Un bon test : peux-tu décrire ce qu'elle fait sans le mot « et » ? Les méthodes qui renvoient un ~bool~ se nomment comme des questions : ~IsGrounded~, ~CanAfford~, ~HasKey~.`],
['Fonctions pures',`Une méthode **pure** dépend seulement de ses paramètres et ne modifie rien autour d'elle : même entrée, même sortie. ~HealthPercent(30, 100)~ en est une. Elles sont faciles à comprendre, à tester et à réutiliser. Isole la logique dans des fonctions pures et garde les effets (modifier la scène, jouer un son) à la périphérie.`],
['Renvoyer plusieurs valeurs',`Trois options : des paramètres ~out~, un tuple (~(bool ok, int level) Parse(string s)~), ou une petite struct nommée. Le tuple est pratique localement ; une struct est plus claire quand le résultat circule dans le code.`,`(int min, int max) Range(int[] values)
{
    int lo = int.MaxValue, hi = int.MinValue;
    foreach (int v in values) { lo = Mathf.Min(lo, v); hi = Mathf.Max(hi, v); }
    return (lo, hi);
}
var (min, max) = Range(scores);`]],
d:[[`Écris ~bool TryGetRandomPoint(Collider area, out Vector3 point)~ qui renvoie un point au hasard dans les limites (~bounds~) d'un collider, et false si le collider est désactivé.`,`area.bounds.min et max, puis Random.Range sur chaque axe.`],
[`Écris ~(int damage, bool crit) RollDamage(int baseDamage, float critChance, float critMultiplier, System.Random rng)~ et utilise la déconstruction à l'appel.`,`rng.NextDouble() < critChance.`]]},

'proprietes':{
r:[`Une propriété ressemble à un champ mais exécute du code.`,`~{ get; private set; }~ : lecture publique, écriture interne.`,`Unity sérialise les champs, pas les propriétés : ~[field: SerializeField]~ pour une propriété auto.`],
m:[
['Propriété ou méthode ?',`Une propriété doit être **rapide** et **sans surprise** : la lire deux fois de suite donne la même valeur et ne modifie rien. Si l'accès fait un calcul coûteux, une recherche ou un effet de bord, une méthode (~ComputePath()~) l'annonce mieux qu'une propriété (~Path~).`],
['Init et immuabilité',`~{ get; init; }~ (C# 9) permet de fixer une valeur seulement à la création. Les objets qui ne changent plus après leur construction sont plus simples à partager entre systèmes : personne ne peut les modifier dans votre dos.`],
['Propriétés calculées et caches',`~public float Ratio => current / max;~ recalcule à chaque lecture : très bien pour un calcul simple. Pour un calcul lourd, on garde le résultat dans un champ et on le marque « à recalculer » quand une donnée change (un « dirty flag »).`]],
d:[[`Écris une classe ~Stats~ avec une valeur de base et une liste de modificateurs (additifs et multiplicatifs). La propriété ~Value~ ne recalcule que si un modificateur a été ajouté ou retiré depuis la dernière lecture.`,`Un bool dirty passé à true dans AddModifier et RemoveModifier.`],
[`Transforme le champ public ~speed~ d'un script existant en propriété avec validation (jamais négatif), sans perdre la valeur réglée dans l'inspecteur.`,`[field: SerializeField] et [field: FormerlySerializedAs("speed")].`]]},

'static-instance':{
r:[`Instance : un exemplaire par objet. Static : un seul pour toute la classe.`,`Les classes utilitaires (~Mathf~) sont static.`,`Les static survivent entre deux Play Mode si le rechargement du domaine est désactivé.`],
m:[
['Le rechargement du domaine expliqué',`À chaque entrée en Play Mode, Unity peut recharger tout le code C# (« domain reload ») : les static repartent à zéro, mais cela prend plusieurs secondes sur un gros projet. Beaucoup d'équipes désactivent ce rechargement (Project Settings > Editor > Enter Play Mode Options) pour lancer le jeu instantanément. Le prix : chaque static doit être remis à zéro à la main, avec ~RuntimeInitializeOnLoadMethod~. Les événements static doivent aussi être vidés, sinon les abonnés de la partie précédente sont toujours là.`],
['Constructeur static',`~static MyClass() { ... }~ s'exécute une fois, avant la première utilisation de la classe. Pratique pour remplir une table de correspondance. Attention : avec le rechargement désactivé, il ne se relance pas entre deux parties.`],
['Méthodes static et testabilité',`Une méthode static pure (~MathUtils.Remap~) est idéale. Une méthode static qui lit un état global (~Time.time~, ~GameManager.Instance~) est difficile à tester : on ne peut pas remplacer ce qu'elle lit. Passe ces valeurs en paramètre.`]],
d:[[`Écris un ~IdGenerator~ static qui donne des identifiants uniques croissants pendant une partie et repart à 1 à chaque lancement du Play Mode, même avec le rechargement du domaine désactivé.`,`Un static int next et une méthode Reset marquée RuntimeInitializeOnLoadMethod(SubsystemRegistration).`],
[`Écris un registre static ~Registry<T>~ (où T est un MonoBehaviour) dans lequel les objets s'inscrivent et se désinscrivent, et qui se vide au lancement du jeu. Utilise-le pour les ennemis.`,`Un static List<T> par type générique : chaque Registry<Enemy>, Registry<Coin> a le sien.`]]},

'chaines-texte':{
r:[`Une ~string~ est immuable : chaque modification en crée une nouvelle.`,`Interpolation ~$"..."~ et formats (~:0.00~, ~:N0~, ~:P0~).`,`~StringBuilder~ pour construire, ~StringComparison.OrdinalIgnoreCase~ pour comparer.`],
m:[
['Culture et nombres',`~1.5f.ToString()~ donne « 1,5 » sur un PC français et « 1.5 » sur un PC anglais. Pour un fichier de sauvegarde ou un échange réseau, cela casse la relecture. Utilise ~CultureInfo.InvariantCulture~ pour les données, et la culture de l'utilisateur seulement pour l'affichage.`,`string saved = speed.ToString(CultureInfo.InvariantCulture);
float back = float.Parse(saved, CultureInfo.InvariantCulture);`],
['Localisation',`Écrire le texte du jeu en dur dans le code empêche de le traduire. Les vrais projets utilisent des clés (~"menu.play"~) et des tables de traduction ; le paquet Localization de Unity gère tables, pluriels et variables. Prends l'habitude de ne pas construire de phrases par concaténation : l'ordre des mots change d'une langue à l'autre.`],
['TextMeshPro sans allocation',`~tmp.SetText("Score : {0}", score)~ formate des nombres sans créer de chaîne. Pour un texte mis à jour à chaque image (un chronomètre), c'est la différence entre zéro et plusieurs kilo-octets alloués par seconde. Voir [[allocations-gc]].`]],
d:[[`Écris ~string Slugify(string title)~ qui transforme « Produit Scalaire (Dot) » en « produit-scalaire-dot » : minuscules, accents retirés, tout ce qui n'est pas lettre ou chiffre devient un tiret, sans tirets doubles ni aux extrémités.`,`string.Normalize(NormalizationForm.FormD) sépare les accents, qu'on retire en filtrant UnicodeCategory.NonSpacingMark.`],
[`Écris un chronomètre affiché chaque image avec TMP ~SetText~ et vérifie dans le Profiler qu'il n'alloue rien, puis compare avec ~text = $"..."~.`,`Regarde la colonne GC Alloc de la méthode Update.`]]},

'enums-switch':{
r:[`Un enum nomme un ensemble fermé de valeurs.`,`L'expression ~switch~ associe chaque cas à un résultat.`,`Unity enregistre la valeur numérique : n'insère jamais au milieu.`],
m:[
['Itérer sur un enum',`~Enum.GetValues(typeof(Rarity))~ renvoie toutes les valeurs, pratique pour remplir un menu. Dans les versions récentes de .NET, ~Enum.GetValues<Rarity>()~ est typé. C'est lent : fais-le une fois et garde le tableau.`],
['Le cas par défaut',`Un ~switch~ sans cas par défaut laisse passer une valeur oubliée sans bruit. Lever une exception dans ~_~ (ou ~default~) signale immédiatement qu'un nouveau cas a été ajouté à l'enum sans être traité. Certains analyseurs de code avertissent même à la compilation.`],
['Enum ou ScriptableObject',`L'enum est parfait pour des cas **figés par le code** (les états d'un bouton). Dès que les designers veulent ajouter des cas eux-mêmes (de nouvelles raretés, de nouveaux éléments), chaque ajout demande un programmeur et une recompilation : un [[scriptableobjects|ScriptableObject]] par cas est plus adapté.`]],
d:[[`Écris ~Rarity Roll(System.Random rng)~ qui tire une rareté selon les chances de ~DropChance~, sans écrire les cas à la main (parcours toutes les valeurs de l'enum).`,`Enum.GetValues, puis le tirage pondéré de la leçon Aléatoire.`],
[`Écris un ~[CustomPropertyDrawer]~ pour ~Rarity~ qui affiche le menu déroulant avec la couleur de la rareté à côté.`,`Voir la leçon PropertyDrawer : un EnumField et un VisualElement coloré dans une ligne.`]]},

'collections':{
r:[`~List~ pour une suite, ~Dictionary~ pour retrouver par clé, ~HashSet~ pour l'appartenance.`,`~TryGetValue~ plutôt que l'indexeur qui lève une exception.`,`Réutiliser une collection avec ~Clear()~ plutôt que la recréer.`],
m:[
['Comment marche un Dictionary',`Pour chaque clé, le dictionnaire calcule un nombre (~GetHashCode()~) qui indique dans quel « seau » la ranger. Trouver une clé revient à calculer ce nombre et regarder un seul seau : d'où la vitesse constante. Conséquence : une clé ne doit **jamais changer** pendant qu'elle est dans le dictionnaire, et deux clés égales doivent donner le même hash.`],
['Capacité',`Une ~List~ réserve un tableau interne, et le double quand il est plein (en recopiant tout). Si tu sais qu'il y aura 500 éléments, ~new List<T>(500)~ évite plusieurs recopies. Même chose pour ~Dictionary~ et ~HashSet~.`],
['Tableau ou liste',`Un tableau (~T[]~) a une taille fixe et un accès un peu plus rapide ; Unity en renvoie souvent. Une liste grandit. Pour des données de taille fixe (une grille, un tampon d'échantillons), le tableau est le bon choix. Pour exposer une collection sans permettre de la modifier, renvoie un ~IReadOnlyList<T>~.`]],
d:[[`Écris ~Dictionary<string, int> CountWords(string text)~ qui compte les mots sans tenir compte de la casse, puis renvoie les 5 mots les plus fréquents.`,`Un dictionnaire construit avec StringComparer.OrdinalIgnoreCase, puis un tri par valeur décroissante.`],
[`Écris une ~struct GridKey~ (x, y) utilisable comme clé de Dictionary, avec ~Equals~ et ~GetHashCode~ corrects, et mesure la différence avec une clé ~string~ ~$"{x},{y}"~ sur 100 000 insertions.`,`HashCode.Combine(x, y) donne un bon hash ; implémente IEquatable<GridKey> pour éviter le boxing.`]]},

'struct-vs-class':{
r:[`Class : on copie la référence. Struct : on copie tout le contenu.`,`~Vector3~, ~Quaternion~, ~Color~ sont des struct.`,`Une struct dans un ~object~ ou une interface est emballée (boxing) sur le tas.`],
m:[
['Le piège des struct dans une liste',`~list[0].x = 5~ ne compile pas si la liste contient des ~Vector3~ : l'indexeur renvoie une copie, comme ~transform.position~. Avec un **tableau**, en revanche, ~array[0].x = 5~ fonctionne : l'élément est modifié sur place. Ce comportement différent surprend souvent.`],
['readonly struct et in',`Marquer une struct ~readonly~ garantit qu'elle ne change jamais, et permet au compilateur d'éviter des copies défensives. Pour passer une grosse struct à une méthode sans la copier, le mot-clé ~in~ la passe par référence en lecture seule.`],
['Struct et données orientées performance',`Un tableau de struct est un bloc continu en mémoire : le processeur le lit très vite. Un tableau de class est un tableau de références vers des objets éparpillés. C'est la base des approches orientées données ([[jobs-burst]]) : quand on traite des milliers d'éléments, les struct en tableau gagnent largement.`]],
d:[[`Écris une ~readonly struct Damage~ (montant, type, point d'impact) avec une méthode ~WithMultiplier(float m)~ qui renvoie une nouvelle valeur au lieu de modifier l'existante.`,`Constructeur avec tous les champs ; WithMultiplier fait new Damage(...).`],
[`Écris un petit test : une liste de 10 000 ~Vector3~ modifiés via une copie, puis un tableau modifié sur place, et mesure le temps avec un Stopwatch. Explique la différence.`,`Pour la liste : var v = list[i]; v.x += 1; list[i] = v;`]]},

'null-securite':{
r:[`Accéder à un membre de ~null~ lève une ~NullReferenceException~.`,`~?.~, ~??~ et ~is null~ ignorent la surcharge Unity : à éviter sur les objets Unity.`,`Avec un objet Unity, ~!= null~ ou ~if (obj)~.`],
m:[
['Pourquoi Unity a ce comportement',`Un objet Unity a deux moitiés : l'objet C# que tu manipules, et un objet natif (C++) dans le moteur. ~Destroy~ détruit la moitié native ; la moitié C# reste tant que des variables y pointent. Unity surcharge ~==~ pour dire « détruit » quand la moitié native n'existe plus. Les opérateurs ~?.~ et ~??~ testent directement la nullité C#, sans passer par cette surcharge.`],
['Lire une NullReferenceException',`Le message donne le script et la **ligne**. Sur cette ligne, cherche chaque point (~a.b.c~) : un des éléments à gauche d'un point est null. Les causes fréquentes : une référence pas assignée dans l'inspecteur, un ~GetComponent~ qui n'a rien trouvé, un objet utilisé avant son ~Awake~, ou un objet détruit.`],
['Valider tôt',`Plutôt que de découvrir une référence vide en plein jeu, vérifie-la dans ~OnValidate~ (dans l'éditeur) ou dans ~Awake~ avec un message clair qui nomme l'objet : ~Debug.LogError($"{name} : prefab manquant", this)~. Le second argument rend le message cliquable pour sélectionner l'objet. Voir aussi [[attributs-reflexion]].`]],
d:[[`Écris une méthode d'extension ~T OrNull<T>(this T obj) where T : UnityEngine.Object~ qui renvoie un vrai null C# si l'objet est détruit, pour pouvoir ensuite utiliser ~?.~ sans danger.`,`return obj ? obj : null;`],
[`Ajoute à un de tes scripts un ~OnValidate~ qui affiche un avertissement cliquable pour chaque champ de référence vide, et vérifie qu'il ne se déclenche pas en boucle.`,`Debug.LogWarning(message, this) ; n'en fais pas un LogError qui bloquerait.`]]},

'exceptions':{
r:[`~try~/~catch~ pour l'inattendu, ~finally~ pour nettoyer dans tous les cas.`,`Attraper un type précis, jamais un ~catch~ vide.`,`Pour un cas normal, renvoyer un bool (~TryXxx~) plutôt que lever une exception.`],
m:[
['Ce que coûte une exception',`Lever une exception est lent (des microsecondes, contre des nanosecondes pour un ~if~), et sur certaines plateformes la gestion est encore plus coûteuse. Dans une boucle de jeu, une exception par image se voit dans le profiler. C'est une raison de plus de réserver les exceptions à l'exceptionnel.`],
['Relancer sans perdre l\'origine',`Dans un ~catch~, ~throw;~ relance l'exception d'origine avec sa pile d'appels intacte. ~throw e;~ réinitialise la pile et fait perdre l'endroit où l'erreur est vraiment née. Pour ajouter du contexte, crée une nouvelle exception avec l'originale en ~innerException~.`],
['Erreurs dans Unity',`Une exception dans ~Update~ n'arrête pas le jeu, mais saute la fin de la méthode pour cette image : l'objet peut rester dans un état à moitié modifié, et le bug apparaît plus loin. Dans un build, active les journaux (~Application.logMessageReceived~) pour récupérer les erreurs des joueurs.`]],
d:[[`Écris un composant ~ErrorReporter~ qui s'abonne à ~Application.logMessageReceived~, garde les 50 dernières erreurs et exceptions avec leur pile, et les écrit dans un fichier à la fermeture du jeu.`,`Filtre sur LogType.Error et LogType.Exception ; une Queue limitée à 50.`],
[`Écris ~int ParseLevel(string s)~ qui lève ~FormatException~ avec un message explicite si la chaîne n'est pas un nombre, et ~ArgumentOutOfRangeException~ s'il est hors de 1 à 99. Puis ~bool TryParseLevel~ qui ne lève jamais.`,`int.TryParse pour la version sans exception ; la version qui lève peut s'appuyer dessus.`]]},

'delegues-evenements':{
r:[`Un délégué contient une méthode : ~Action~, ~Func~.`,`~event~ : les autres s'abonnent, seul le propriétaire déclenche.`,`S'abonner dans ~OnEnable~, se désabonner dans ~OnDisable~.`],
m:[
['C# event, UnityEvent ou ScriptableObject',`**event C#** : rapide, typé, branché dans le code. **UnityEvent** : branché dans l'inspecteur par les designers, un peu plus lent, et les liens sont invisibles quand on lit le code. **Événement porté par un ScriptableObject** ([[event-bus-so]]) : relie des objets qui ne se connaissent pas. Un projet mélange souvent les trois ; ce qui compte, c'est la cohérence dans chaque système.`],
['Ordre et exceptions',`Les abonnés sont appelés dans l'ordre d'abonnement, mais ne compte pas dessus : si l'ordre importe, c'est qu'il faut un seul abonné qui orchestre. Une exception chez un abonné **empêche les suivants** d'être appelés ; pour des systèmes indépendants, on peut appeler chaque abonné dans un try/catch via ~GetInvocationList()~.`],
['Fuites mémoire',`Un objet abonné à un événement d'un objet qui vit plus longtemps (un static, un ScriptableObject, un singleton) ne peut pas être récupéré par le ramasse-miettes tant qu'il n'est pas désabonné. C'est la fuite mémoire la plus fréquente en C#.`]],
d:[[`Écris ~SafeInvoke(Action evt)~ qui appelle chaque abonné séparément et journalise l'exception d'un abonné sans empêcher les autres.`,`foreach (Action a in evt.GetInvocationList()) dans un try/catch.`],
[`Écris un ~Health~ avec trois événements (dégâts reçus, soigné, mort) et quatre abonnés indépendants : barre de vie, son, secousse de caméra, compteur de statistiques. Aucun ne doit connaître les autres.`,`Chaque abonné est un composant à part qui s'abonne dans OnEnable.`]]},

'lambdas-closures':{
r:[`Une lambda est une méthode écrite sur place.`,`Elle capture les variables qu'elle utilise, ce qui alloue.`,`Copier la variable de boucle avant de la capturer.`],
m:[
['Ce que fait le compilateur',`Quand une lambda capture une variable locale, le compilateur transforme cette variable en champ d'une petite classe cachée, et la lambda devient une méthode de cette classe. Toutes les lambdas qui capturent la même variable partagent la même instance : c'est pour cela qu'elles voient toutes la dernière valeur de ~i~.`],
['Lambdas statiques',`Depuis C# 9, ~static x => x * 2~ interdit toute capture : le compilateur refuse si la lambda utilise une variable extérieure. C'est une garantie qu'elle n'alloue pas, utile dans le code appelé souvent.`],
['Lisibilité',`Une lambda de plus de trois lignes gagne souvent à devenir une vraie méthode avec un nom. Le nom documente l'intention, la méthode apparaît dans la pile d'appels, et on peut s'en désabonner.`]],
d:[[`Écris ~Func<float, float> Compose(Func<float, float> f, Func<float, float> g)~ qui renvoie x => g(f(x)), puis compose un easing et un remap.`,`Une lambda qui appelle f puis g.`],
[`Crée 5 boutons UI par code, chacun affichant son numéro au clic, et vérifie que chacun affiche le bon numéro.`,`Copie l'indice dans une variable locale avant AddListener.`]]},

'linq':{
r:[`~Where~, ~Select~, ~OrderBy~, ~Any~, ~First~ : des requêtes lisibles sur les collections.`,`Exécution différée : rien ne se passe avant le parcours.`,`Parfait dans les outils, à éviter dans le code appelé chaque image.`],
m:[
['Les opérateurs à connaître',`~GroupBy~ regroupe (les armes par rareté), ~ToDictionary~ construit un dictionnaire, ~Distinct~ retire les doublons, ~SelectMany~ aplatit des listes de listes, ~Aggregate~ cumule, ~Zip~ marche sur deux séquences à la fois, ~Take~ et ~Skip~ découpent.`,`var parRarete = weapons
    .GroupBy(w => w.rarity)
    .ToDictionary(g => g.Key, g => g.Count());`],
['First et FirstOrDefault',`~First~ lève une exception si rien ne correspond, ~FirstOrDefault~ renvoie la valeur par défaut (null pour une class). ~Single~ vérifie en plus qu'il n'y en a qu'un : utile pour détecter des doublons qui ne devraient pas exister.`],
['Lire une requête',`Une chaîne LINQ se lit comme une phrase de haut en bas. Si elle dépasse 5 ou 6 étapes, découpe-la en variables intermédiaires bien nommées. Et pense au coût caché de chaque étape : ~OrderBy~ trie tout, ~ToList~ copie tout.`]],
d:[[`À partir d'une liste de ~WeaponData~, produis en LINQ : la liste des noms des 3 armes au meilleur DPS, le DPS moyen par rareté, et la liste des armes sans prefab de projectile.`,`OrderByDescending puis Take(3) ; GroupBy puis Average ; Where(w => w.projectilePrefab == null).`],
[`Réécris une requête LINQ de ton choix utilisée dans un Update en version boucle sans allocation, et vérifie la différence dans le Profiler.`,`Garde les listes de travail en champs et réutilise-les avec Clear().`]]},

'generiques':{
r:[`Un générique prend un type en paramètre (~T~).`,`Les contraintes (~where T : Component~) donnent accès aux membres du type.`,`Méthodes d'extension + génériques = petits utilitaires puissants.`],
m:[
['Génériques et performance',`Pour une struct, ~List<int>~ stocke vraiment des ~int~, sans boxing (contrairement à l'ancien ~ArrayList~ qui stockait des ~object~). Le runtime crée une version spécialisée du code pour chaque type valeur. C'est une des raisons pour lesquelles les génériques sont partout dans le code performant.`],
['Unity et les génériques sérialisés',`Unity sait sérialiser ~List<T>~ et, depuis 2020, des champs de types génériques fermés (~Pool<Bullet>~ si la classe est ~[Serializable]~). Il ne sait pas afficher un ~MonoBehaviour~ générique ouvert : on crée une petite classe concrète, ~class BulletPool : Pool<Bullet> {}~.`],
['Covariance',`~IEnumerable<Enemy>~ peut être utilisé là où un ~IEnumerable<MonoBehaviour>~ est attendu (covariance, mot-clé ~out~ sur le paramètre). ~List<Enemy>~ ne le peut pas, car on pourrait y ajouter autre chose qu'un ennemi. Ce détail explique bien des erreurs de compilation déroutantes.`]],
d:[[`Écris ~T RandomElement<T>(this IReadOnlyList<T> list, System.Random rng)~ et ~bool TryFindNearest<T>(IEnumerable<T> items, Vector3 from, out T nearest) where T : Component~.`,`Pour la seconde, la boucle de la leçon LINQ en version générique.`],
[`Écris une classe générique ~Observable<T>~ avec une propriété ~Value~ qui déclenche ~Changed(T old, T now)~ seulement quand la valeur change, en utilisant ~EqualityComparer<T>.Default~.`,`EqualityComparer<T>.Default.Equals(a, b) évite le boxing pour les struct.`]]},

'iterateurs-yield':{
r:[`~yield return~ produit les éléments un par un, à la demande.`,`Une coroutine est un itérateur que Unity fait avancer.`,`Parcourir deux fois relance le calcul.`],
m:[
['Évaluation paresseuse',`Un itérateur ne calcule que ce qu'on lui demande. ~Spiral(1000).First(IsFree)~ s'arrête dès la première case libre, sans générer le million de cases. C'est très efficace pour des recherches qui s'arrêtent tôt.`],
['Les pièges',`Le code d'un itérateur ne s'exécute **pas** à l'appel de la méthode, mais au premier parcours : une validation des paramètres placée au début ne se déclenche qu'au moment du ~foreach~. Pour valider tout de suite, on sépare en deux méthodes : une publique qui valide, une privée qui fait les ~yield~.`],
['Énumérateurs et allocations',`Chaque appel d'une méthode à ~yield~ crée un petit objet sur le tas. Dans le code appelé chaque image, une boucle classique sur un tableau ou une liste n'alloue rien. ~foreach~ sur une ~List<T>~ n'alloue pas non plus (son énumérateur est une struct), mais sur une interface ~IEnumerable<T>~, si.`]],
d:[[`Écris ~IEnumerable<int> Fibonacci()~ infini et récupère les 20 premiers termes avec ~Take~.`,`Une boucle while (true) avec deux variables.`],
[`Écris ~IEnumerable<Transform> Descendants(Transform root)~ qui parcourt toute la hiérarchie en largeur avec une Queue, sans récursion.`,`Enfile root, puis tant que la file n'est pas vide : défile, yield return, enfile ses enfants.`]]},

'pattern-matching':{
r:[`~is Type x~ teste le type et donne une variable typée.`,`Motifs de propriétés, de plages, combinés avec ~and~, ~or~, ~not~.`,`Sur un objet Unity, préfère ~!= null~ à ~is not null~.`],
m:[
['Motifs de position',`Avec une struct qui sait se déconstruire, ou un tuple, on peut tester plusieurs valeurs d'un coup. C'est très lisible pour des tables de règles.`,`string Combo(Element a, Element b) => (a, b) switch
{
    (Element.Fire, Element.Water) or (Element.Water, Element.Fire) => "Vapeur",
    (Element.Fire, Element.Fire) => "Brasier",
    _ => "Rien",
};`],
['Quand l\'utiliser',`Le pattern matching remplace avantageusement les cascades de ~if~ et de casts. Mais un ~switch~ sur des types répété à plusieurs endroits est souvent le signe qu'il manque une méthode virtuelle ou une [[interfaces|interface]] : chaque type devrait savoir faire le travail lui-même.`]],
d:[[`Écris ~float DamageMultiplier(Element attack, Element defense)~ avec une expression switch sur un tuple : feu bat glace, glace bat eau... (choisis tes règles), 1 par défaut.`,`(attack, defense) switch avec des cas (Element.Fire, Element.Ice) => 2f.`],
[`Écris ~string ClassifyHit(Collider c)~ qui renvoie « tête », « corps » ou « décor » selon le composant trouvé et son tag, en un seul switch.`,`c switch { { tag: "Head" } => ..., _ when c.GetComponentInParent<Enemy>() != null => ... }`]]},

'idisposable-using':{
r:[`~IDisposable~ : une ressource à libérer explicitement.`,`~using~ appelle ~Dispose()~ même en cas d'exception.`,`Le motif « scope » : ouvrir au début, refermer dans Dispose.`],
m:[
['Ce qui doit être libéré dans Unity',`Les conteneurs natifs (~NativeArray~), les ~RenderTexture~ créées par code (~Release()~), les ~ComputeBuffer~, les fichiers et flux, les ~UnityWebRequest~. Les objets Unity créés par code (~new Material~, ~new Texture2D~, ~new Mesh~) ne sont pas IDisposable mais doivent être détruits avec ~Destroy~, sinon ils restent en mémoire jusqu'au prochain changement de scène.`],
['Les scopes de l\'éditeur',`L'éditeur Unity utilise beaucoup ce motif : ~using (new EditorGUI.DisabledScope(true))~, ~using (new EditorGUILayout.HorizontalScope())~, ~using (new EditorGUI.ChangeCheckScope())~. Comprendre le motif permet d'écrire les siens.`]],
d:[[`Écris ~using (new TimeScaleScope(0.2f)) { ... }~ qui ralentit le jeu dans le bloc et restaure l'ancien timeScale à la sortie, même en cas d'exception.`,`Le constructeur mémorise Time.timeScale et le change ; Dispose le restaure.`],
[`Crée un ~Material~ par code dans un composant et vérifie avec le Memory Profiler qu'il fuit quand l'objet est détruit sans ~Destroy(material)~. Corrige-le.`,`Destroy(material) dans OnDestroy.`]]},

'attributs-reflexion':{
r:[`Un attribut est une étiquette ; un autre code la lit.`,`La réflexion inspecte les types à l'exécution : lente, réservée aux outils.`,`~TypeCache~ dans l'éditeur trouve vite les types marqués.`],
m:[
['Réflexion et builds',`La réflexion fonctionne dans un build, mais avec IL2CPP (la compilation en C++ utilisée sur consoles et mobiles), le code jugé inutilisé est retiré (« stripping »). Un type uniquement atteint par réflexion peut disparaître. ~[Preserve]~ ou un fichier ~link.xml~ le protègent. C'est une raison de plus de garder la réflexion côté éditeur.`],
['Générer du code plutôt que réfléchir',`Les outils sérieux remplacent souvent la réflexion à l'exécution par du **code généré** : un script d'éditeur lit les attributs et écrit des fichiers C#, ou un « source generator » le fait à la compilation. Résultat : la souplesse des attributs, sans le coût de la réflexion en jeu.`]],
d:[[`Utilise ~TypeCache.GetFieldsWithAttribute<RequiredAttribute>()~ pour écrire une commande d'éditeur qui vérifie tous les prefabs du projet et liste ceux qui ont un champ ~[Required]~ vide.`,`Combine avec la leçon sur les modifications en masse : charge chaque prefab et appelle FindMissing sur ses composants.`],
[`Crée un attribut ~[Button]~ pour des méthodes sans paramètre, et un inspecteur qui affiche un bouton par méthode marquée.`,`target.GetType().GetMethods(...) puis GetCustomAttribute<ButtonAttribute>() ; method.Invoke(target, null).`]]},

'async-await':{
r:[`~await~ attend sans bloquer le jeu.`,`~Awaitable~ dans Unity 6, avec ~destroyCancellationToken~.`,`Pas de ~async void~ sauf pour un gestionnaire d'événement.`],
m:[
['Coroutine ou async',`Les [[coroutines]] restent liées à un MonoBehaviour et s'arrêtent avec lui : simples et sûres pour des séquences de gameplay. ~async~ renvoie de vraies valeurs, gère les exceptions avec try/catch, se compose (~await~ dans ~await~) et peut passer sur un autre thread. Choisis async pour les chargements, le réseau et les calculs ; la coroutine reste très bien pour « attendre 2 secondes puis faire clignoter ».`],
['Attendre plusieurs choses',`Avec des ~Task~, ~Task.WhenAll~ attend plusieurs opérations en parallèle et ~Task.WhenAny~ la première terminée (par exemple un chargement contre un délai maximal). Pour les Awaitable, on lance chaque opération puis on les attend l'une après l'autre : elles avancent quand même en même temps.`],
['Le contexte de synchronisation',`Unity remet automatiquement la suite d'une méthode async sur le thread principal. Si tu passes sur un autre thread, aucun appel à l'API Unity n'est permis (pas de Transform, pas de GameObject) jusqu'au retour avec ~MainThreadAsync()~. Une erreur ici donne des plantages difficiles à reproduire.`]],
d:[[`Écris ~async Awaitable<T> WithTimeout<T>(Awaitable<T> op, float seconds)~ ou, si c'est plus simple, une version avec ~Task~ qui lève ~TimeoutException~ si l'opération dépasse le délai.`,`Avec Task : await Task.WhenAny(op, Task.Delay(ms)) puis comparer le résultat.`],
[`Charge une grille de 200×200 cases de bruit de Perlin sur un thread d'arrière-plan avec ~Awaitable.BackgroundThreadAsync~, puis reviens sur le thread principal pour créer la texture.`,`Calcule un tableau de float en arrière-plan ; Texture2D.SetPixels seulement après MainThreadAsync.`]]}
});

window.LESSONS=(window.LESSONS||[]).concat([
{id:'complexite',cat:'algo',lvl:1,title:'Complexité (grand O)',sum:'Estimer comment le temps d\'un algorithme grandit avec la taille des données.',
body:[
['L\'idée',`La complexité ne mesure pas des millisecondes : elle dit comment le travail **grandit** quand les données grandissent. O(1) : constant, quel que soit n. O(n) : proportionnel. O(n²) : 10 fois plus de données, 100 fois plus de travail.`],
['Les ordres courants',`O(1) : lire une case d'un tableau, chercher dans un ~Dictionary~. O(log n) : la [[recherche-binaire]]. O(n) : parcourir une liste, ~List.Contains~. O(n log n) : un bon [[tri]]. O(n²) : comparer chaque élément à tous les autres.`],
['Le piège O(n²) du jeu vidéo',`Tester chaque ennemi contre chaque autre ennemi : 100 ennemis = 10 000 tests, 1000 ennemis = un million. C'est la cause de beaucoup de chutes de framerate. Les solutions : une structure adaptée (voir [[collections]]), ou une [[partition-spatiale]] qui ne compare que les voisins.`],
['Relativiser',`Pour 10 éléments, n'importe quel algorithme va bien, et le plus lisible gagne. La complexité devient importante quand n grandit ou quand le code tourne chaque image. Mesure avec le profiler avant d'optimiser (voir [[profiler-markers]]).`]],
ex:`Écris ~bool HasDuplicate(int[] ids)~ deux fois : une version naïve en O(n²), puis une version en O(n). Ajoute en commentaire la complexité de chacune.`,
hint:`La version O(n) garde les identifiants déjà vus dans un HashSet. HashSet.Add renvoie false si l'élément y était déjà.`,
sol:`// O(n²) : chaque paire est comparée
public static bool HasDuplicateNaive(int[] ids)
{
    for (int i = 0; i < ids.Length; i++)
        for (int j = i + 1; j < ids.Length; j++)
            if (ids[i] == ids[j]) return true;
    return false;
}

// O(n) : un seul passage, recherche en temps constant dans le HashSet
public static bool HasDuplicate(int[] ids)
{
    var seen = new HashSet<int>();
    foreach (int id in ids)
        if (!seen.Add(id)) return true;
    return false;
}`},

{id:'pile-file',cat:'algo',lvl:1,title:'Pile et file',sum:'Stack (dernier entré, premier sorti) et Queue (premier entré, premier sorti).',
body:[
['L\'idée',`Une **pile** (~Stack<T>~) fonctionne comme une pile d'assiettes : on ajoute et on retire en haut. Le dernier entré sort le premier. Une **file** (~Queue<T>~) fonctionne comme une file d'attente : on ajoute à la fin, on retire au début.`],
['Les opérations',`Pile : ~Push~ ajoute, ~Pop~ retire, ~Peek~ regarde le dessus. File : ~Enqueue~ ajoute, ~Dequeue~ retire, ~Peek~ regarde le premier. Toutes en temps constant. ~TryPop~ et ~TryDequeue~ évitent l'exception sur une collection vide.`],
['La pile dans les jeux',`Historique d'annulation (voir [[command-undo]]), menus empilés (Échap ferme le dernier ouvert), le [[object-pooling|pool]] d'objets libres, le parcours en profondeur, la [[recursion]] (qui utilise la pile d'appels du programme).`],
['La file dans les jeux',`Une file d'actions au tour par tour, des messages à afficher l'un après l'autre, des vagues d'ennemis, et le [[bfs-grille|parcours en largeur]] qui explore une grille couche par couche.`]],
ex:`Écris un ~MenuStack~ (MonoBehaviour) : ~Open(GameObject menu)~ cache le menu courant et affiche le nouveau, ~Back()~ ferme le menu du dessus et réaffiche le précédent, et Échap appelle Back. Puis un ~ToastQueue~ qui affiche des messages un par un, 2 secondes chacun.`,
hint:`MenuStack : une Stack<GameObject>. ToastQueue : une Queue<string> et une coroutine qui tourne tant qu'il reste des messages.`,
sol:`public class MenuStack : MonoBehaviour
{
    private readonly Stack<GameObject> stack = new Stack<GameObject>();

    public void Open(GameObject menu)
    {
        if (stack.TryPeek(out GameObject current)) current.SetActive(false);
        stack.Push(menu);
        menu.SetActive(true);
    }

    public void Back()
    {
        if (!stack.TryPop(out GameObject top)) return;
        top.SetActive(false);
        if (stack.TryPeek(out GameObject previous)) previous.SetActive(true);
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape)) Back();
    }
}

public class ToastQueue : MonoBehaviour
{
    [SerializeField] private TMP_Text label;
    private readonly Queue<string> pending = new Queue<string>();
    private bool showing;

    public void Show(string message)
    {
        pending.Enqueue(message);
        if (!showing) StartCoroutine(Run());
    }

    private IEnumerator Run()
    {
        showing = true;
        var wait = new WaitForSeconds(2f);
        while (pending.TryDequeue(out string msg))
        {
            label.text = msg;
            label.gameObject.SetActive(true);
            yield return wait;
        }
        label.gameObject.SetActive(false);
        showing = false;
    }
}`},

{id:'recherche-binaire',cat:'algo',lvl:2,title:'Recherche binaire',sum:'Trouver une valeur dans une liste triée en coupant l\'intervalle en deux à chaque étape.',
body:[
['L\'idée',`Dans une liste **triée**, on regarde l'élément du milieu : si la valeur cherchée est plus petite, elle est forcément à gauche, sinon à droite. On élimine la moitié à chaque étape. Un million d'éléments se fouille en 20 étapes : c'est du O(log n). Voir [[complexite]].`],
['La condition indispensable',`La liste doit être triée selon le même critère que la recherche. Sur une liste non triée, le résultat est faux sans aucune erreur.`],
['Usages en jeu',`Trouver le palier d'expérience correspondant à un nombre de points, retrouver une clé dans une courbe de valeurs (une ~AnimationCurve~ le fait en interne), choisir un élément dans un tirage pondéré cumulé (voir [[aleatoire]]).`],
['Déjà fourni',`~Array.BinarySearch~ et ~List<T>.BinarySearch~ existent. Si la valeur n'est pas trouvée, ils renvoient un nombre négatif dont l'inverse binaire donne la position où l'insérer.`]],
ex:`Les seuils d'expérience des niveaux sont dans un tableau trié ~int[] thresholds~ (niveau 1 à 0 XP, niveau 2 à 100, etc.). Écris ~int LevelFor(int xp, int[] thresholds)~ en recherche binaire : le plus grand niveau dont le seuil est inférieur ou égal à xp.`,
hint:`Cherche le dernier indice i tel que thresholds[i] <= xp ; le niveau est i + 1.`,
sol:`public static int LevelFor(int xp, int[] thresholds)
{
    int lo = 0, hi = thresholds.Length - 1, best = 0;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;      // évite le débordement de (lo + hi)
        if (thresholds[mid] <= xp)
        {
            best = mid;                    // candidat, on cherche plus haut
            lo = mid + 1;
        }
        else
        {
            hi = mid - 1;
        }
    }
    return best + 1;
}

// LevelFor(250, new[] { 0, 100, 300, 600 }) == 2`},

{id:'tri',cat:'algo',lvl:2,title:'Trier des données',sum:'Sort, comparateurs, tri stable : classer des ennemis, des scores ou des objets à dessiner.',
body:[
['L\'idée',`~List<T>.Sort()~ et ~Array.Sort()~ trient en place, en O(n log n). Il suffit de leur dire comment comparer deux éléments : une fonction qui renvoie un nombre négatif si a vient avant b, positif si a vient après, 0 s'ils sont équivalents.`],
['Comparer',`~a.CompareTo(b)~ existe pour les nombres et les chaînes. Pour un tri décroissant, on inverse : ~b.CompareTo(a)~. Pour plusieurs critères, on compare le premier et, en cas d'égalité, le second.`,`scores.Sort((a, b) =>
{
    int c = b.points.CompareTo(a.points);       // points décroissants
    return c != 0 ? c : a.time.CompareTo(b.time); // puis le plus rapide
});`],
['Stable ou pas',`~List.Sort~ n'est **pas stable** : deux éléments égaux peuvent échanger leur place. ~OrderBy~ de [[linq]] est stable mais alloue. Si l'ordre d'origine compte, ajoute un critère final (l'indice d'origine).`],
['Trier pour la performance',`Trier les objets transparents du plus loin au plus proche pour les dessiner, ou trier une liste une fois pour permettre une [[recherche-binaire]] ensuite. Éviter de trier chaque image si une simple recherche du minimum suffit (voir [[linq]]).`]],
ex:`Écris ~void SortLeaderboard(List<Entry> entries)~ : par score décroissant, puis par temps croissant, puis par nom alphabétique (sans tenir compte de la casse). ~Entry~ a ~name~, ~score~ et ~time~.`,
hint:`Une seule lambda de comparaison qui enchaîne les trois critères. Pour le nom : string.Compare avec StringComparison.OrdinalIgnoreCase.`,
sol:`public class Entry
{
    public string name;
    public int score;
    public float time;
}

public static void SortLeaderboard(List<Entry> entries)
{
    entries.Sort((a, b) =>
    {
        int c = b.score.CompareTo(a.score);
        if (c != 0) return c;
        c = a.time.CompareTo(b.time);
        if (c != 0) return c;
        return string.Compare(a.name, b.name, StringComparison.OrdinalIgnoreCase);
    });
}`},

{id:'recursion',cat:'algo',lvl:2,title:'Récursion',sum:'Une méthode qui s\'appelle elle-même pour parcourir des arbres : hiérarchies, dossiers, menus.',
body:[
['L\'idée',`Une méthode récursive résout un problème en s'appelant sur un morceau plus petit du même problème. Elle a toujours un **cas de base** qui s'arrête sans s'appeler. Sans lui, elle s'appelle à l'infini.`],
['Les arbres',`La récursion brille sur les structures en arbre : la hiérarchie d'un Transform (chaque enfant a ses enfants), les dossiers d'un projet, un arbre de dialogues ou de compétences.`,`void SetLayerRecursive(Transform t, int layer)
{
    t.gameObject.layer = layer;
    foreach (Transform child in t)
        SetLayerRecursive(child, layer);
}`],
['La limite',`Chaque appel occupe de la place sur la pile d'appels. Une récursion trop profonde (des dizaines de milliers de niveaux) provoque une ~StackOverflowException~ qui fait planter Unity. Pour une grille ou un graphe très grand, on remplace la récursion par une boucle et une [[pile-file|pile]] explicite.`],
['Remplissage par diffusion',`Le « pot de peinture » (flood fill) est l'exemple classique : colorier une case puis ses voisines de même couleur. En récursif, il explose sur une grande grille ; avec une file, c'est un [[bfs-grille|parcours en largeur]].`]],
ex:`Écris ~Transform FindDeep(Transform root, string name)~ qui cherche un enfant par son nom à n'importe quelle profondeur, puis ~int CountDescendants(Transform root)~.`,
hint:`Cas de base : root lui-même porte le nom. Sinon, appelle FindDeep sur chaque enfant et renvoie le premier résultat non null.`,
sol:`public static Transform FindDeep(Transform root, string name)
{
    if (root.name == name) return root;
    foreach (Transform child in root)
    {
        Transform found = FindDeep(child, name);
        if (found != null) return found;
    }
    return null;
}

public static int CountDescendants(Transform root)
{
    int count = 0;
    foreach (Transform child in root)
        count += 1 + CountDescendants(child);
    return count;
}`},

{id:'aleatoire',cat:'algo',lvl:1,title:'Aléatoire et graines',sum:'Random.Range, System.Random, graines reproductibles et tirages pondérés.',
body:[
['L\'idée',`L'ordinateur ne tire pas vraiment au hasard : il calcule une suite de nombres qui en a l'air, à partir d'une **graine** (seed). Même graine, même suite. C'est un avantage : une graine suffit pour régénérer tout un niveau ou rejouer un bug.`],
['Random.Range',`~UnityEngine.Random.Range(0, 10)~ renvoie un ~int~ entre 0 et **9** : la borne haute est exclue pour les entiers. ~Random.Range(0f, 1f)~ renvoie un ~float~ où la borne haute est incluse. C'est un piège classique.`],
['Un générateur par usage',`~UnityEngine.Random~ est partagé par tout le jeu : si un effet visuel tire un nombre de plus, la génération du niveau change. Crée un ~System.Random~ dédié avec sa graine pour tout ce qui doit être reproductible.`,`var rng = new System.Random(seed);
int roomCount = rng.Next(5, 12);   // 5 à 11
double chance = rng.NextDouble();  // entre 0 et 1`],
['Le tirage pondéré',`Pour que « commun » sorte 70 fois sur 100 et « légendaire » 1 fois : on additionne les poids, on tire un nombre entre 0 et le total, puis on parcourt les éléments en soustrayant leur poids jusqu'à passer sous zéro. Voir aussi [[melange-fisher-yates]] et [[point-aleatoire-forme]].`]],
ex:`Écris ~T PickWeighted<T>(IList<T> items, IList<float> weights, System.Random rng)~ qui renvoie un élément au hasard selon son poids.`,
hint:`Calcule le total, tire r = rng.NextDouble() × total, puis soustrais chaque poids de r jusqu'à ce que r passe sous 0.`,
sol:`public static T PickWeighted<T>(IList<T> items, IList<float> weights, System.Random rng)
{
    if (items.Count == 0 || items.Count != weights.Count)
        throw new ArgumentException("Listes vides ou de tailles différentes.");

    float total = 0f;
    for (int i = 0; i < weights.Count; i++) total += Mathf.Max(0f, weights[i]);

    double r = rng.NextDouble() * total;
    for (int i = 0; i < items.Count; i++)
    {
        r -= Mathf.Max(0f, weights[i]);
        if (r < 0) return items[i];
    }
    return items[items.Count - 1];   // sécurité contre les arrondis
}`},

{id:'melange-fisher-yates',cat:'algo',lvl:1,title:'Mélanger une liste',sum:'L\'algorithme de Fisher-Yates, et le « sac » qui évite les séries malchanceuses.',
body:[
['L\'idée',`Pour mélanger un paquet de cartes ou un ordre de niveaux, on parcourt la liste de la fin vers le début et on échange chaque élément avec un élément pris au hasard **parmi ceux qui restent**, lui compris. Chaque ordre possible a la même probabilité.`],
['Le piège du faux mélange',`Échanger chaque élément avec n'importe quel élément de toute la liste semble équivalent mais donne des ordres **biaisés**. Trier avec une comparaison aléatoire (~OrderBy(x => Random.value)~) fonctionne, mais alloue et coûte plus cher.`],
['Le sac aléatoire',`Le vrai hasard peut donner trois fois de suite le même objet, ce que les joueurs vivent comme injuste. Un « sac » (shuffle bag) mélange la liste, la distribue dans l'ordre, et se remélange quand il est vide : chaque objet sort une fois par tour. Tetris utilise ce principe.`],
['Liens',`Pour un tirage reproductible, passe un ~System.Random~ avec une graine (voir [[aleatoire]]).`]],
ex:`Écris une méthode d'extension ~Shuffle<T>(this IList<T> list, System.Random rng)~ (Fisher-Yates), puis une classe ~ShuffleBag<T>~ avec ~Next()~ qui distribue tous les éléments avant de remélanger.`,
hint:`for (int i = list.Count - 1; i > 0; i--) { int j = rng.Next(i + 1); échanger i et j }`,
sol:`public static class ListExtensions
{
    public static void Shuffle<T>(this IList<T> list, System.Random rng)
    {
        for (int i = list.Count - 1; i > 0; i--)
        {
            int j = rng.Next(i + 1);                 // 0 à i inclus
            (list[i], list[j]) = (list[j], list[i]);  // échange par tuple
        }
    }
}

public class ShuffleBag<T>
{
    private readonly List<T> items;
    private readonly System.Random rng;
    private int cursor;

    public ShuffleBag(IEnumerable<T> source, int seed)
    {
        items = new List<T>(source);
        rng = new System.Random(seed);
        cursor = items.Count;   // force un mélange au premier tirage
    }

    public T Next()
    {
        if (cursor >= items.Count)
        {
            items.Shuffle(rng);
            cursor = 0;
        }
        return items[cursor++];
    }
}`},

{id:'grille-2d',cat:'algo',lvl:1,title:'Grilles 2D',sum:'Stocker une carte en cases, passer d\'une position monde à une case, trouver les voisins.',
body:[
['L\'idée',`Beaucoup de jeux reposent sur une grille : tuiles, inventaires, puzzles, cartes de stratégie. On peut la stocker en tableau 2D (~int[,] cells~) ou en tableau 1D, avec l'indice ~y * width + x~. Le 1D est souvent plus simple à sérialiser et plus rapide.`],
['Monde vers case',`Avec des cases de taille ~cellSize~ et une grille qui commence à ~origin~ : ~x = Mathf.FloorToInt((p.x - origin.x) / cellSize)~. ~FloorToInt~ et non un simple cast : le cast arrondit vers zéro, faux pour les coordonnées négatives. Le centre d'une case : ~origin + (x + 0.5f) * cellSize~.`],
['Les voisins',`4 voisins (haut, bas, gauche, droite) ou 8 avec les diagonales. Toujours vérifier qu'on reste dans la grille. ~Vector2Int~ est idéal pour les coordonnées de case.`],
['Liens',`Les grilles servent de base aux recherches de chemin ([[bfs-grille]], [[astar]]) et à la [[partition-spatiale]]. Pour parcourir les cases autour d'un point, voir [[iterateurs-yield]].`]],
ex:`Écris une classe ~Grid<T>~ avec un tableau 1D : constructeur (largeur, hauteur, taille de case, origine), indexeur ~this[int x, int y]~, ~bool InBounds(Vector2Int c)~, ~Vector2Int WorldToCell(Vector3 p)~ (plan XZ), ~Vector3 CellCenter(Vector2Int c)~.`,
hint:`L'indexeur lit cells[y * Width + x]. WorldToCell utilise FloorToInt sur x et z.`,
sol:`public class Grid<T>
{
    public int Width { get; }
    public int Height { get; }
    private readonly float cellSize;
    private readonly Vector3 origin;
    private readonly T[] cells;

    public Grid(int width, int height, float cellSize, Vector3 origin)
    {
        Width = width;
        Height = height;
        this.cellSize = cellSize;
        this.origin = origin;
        cells = new T[width * height];
    }

    public T this[int x, int y]
    {
        get => cells[y * Width + x];
        set => cells[y * Width + x] = value;
    }

    public bool InBounds(Vector2Int c) => c.x >= 0 && c.y >= 0 && c.x < Width && c.y < Height;

    public Vector2Int WorldToCell(Vector3 p)
    {
        return new Vector2Int(
            Mathf.FloorToInt((p.x - origin.x) / cellSize),
            Mathf.FloorToInt((p.z - origin.z) / cellSize));
    }

    public Vector3 CellCenter(Vector2Int c)
    {
        return origin + new Vector3((c.x + 0.5f) * cellSize, 0f, (c.y + 0.5f) * cellSize);
    }
}`},

{id:'bfs-grille',cat:'algo',lvl:2,title:'Parcours en largeur (BFS)',sum:'Explorer une grille couche par couche : distances, zones atteignables, plus court chemin sans poids.',
body:[
['L\'idée',`On part d'une case, on visite toutes ses voisines, puis les voisines des voisines, et ainsi de suite, comme une onde. Grâce à une [[pile-file|file]], les cases sont visitées par distance croissante : la première fois qu'on atteint une case, c'est par le plus court chemin.`],
['L\'algorithme',`Mettre le départ dans la file et le marquer visité. Tant que la file n'est pas vide : retirer une case, et pour chaque voisine praticable non visitée, la marquer, noter d'où on vient et l'ajouter à la file.`],
['Reconstruire le chemin',`On garde pour chaque case « d'où je viens ». Arrivé à la cible, on remonte ces liens jusqu'au départ, puis on inverse la liste.`],
['Usages',`Les cases atteignables en N mouvements dans un jeu tactique, une carte de distances vers le joueur que tous les ennemis lisent (« flow field »), le remplissage de zone. Quand les cases ont des coûts différents (boue, route), on passe à [[astar|A*]].`]],
ex:`Avec une grille ~bool[,] walkable~, écris ~List<Vector2Int> FindPath(bool[,] walkable, Vector2Int start, Vector2Int goal)~ en BFS à 4 directions. Renvoie la liste du départ à l'arrivée, ou une liste vide si c'est impossible.`,
hint:`Une Queue<Vector2Int>, un Dictionary<Vector2Int, Vector2Int> cameFrom qui sert aussi de « visité ».`,
sol:`private static readonly Vector2Int[] Dirs =
    { Vector2Int.up, Vector2Int.right, Vector2Int.down, Vector2Int.left };

public static List<Vector2Int> FindPath(bool[,] walkable, Vector2Int start, Vector2Int goal)
{
    int w = walkable.GetLength(0), h = walkable.GetLength(1);
    var cameFrom = new Dictionary<Vector2Int, Vector2Int> { [start] = start };
    var queue = new Queue<Vector2Int>();
    queue.Enqueue(start);

    while (queue.Count > 0)
    {
        Vector2Int c = queue.Dequeue();
        if (c == goal) break;

        foreach (Vector2Int d in Dirs)
        {
            Vector2Int n = c + d;
            if (n.x < 0 || n.y < 0 || n.x >= w || n.y >= h) continue;
            if (!walkable[n.x, n.y] || cameFrom.ContainsKey(n)) continue;
            cameFrom[n] = c;
            queue.Enqueue(n);
        }
    }

    var path = new List<Vector2Int>();
    if (!cameFrom.ContainsKey(goal)) return path;   // inaccessible

    for (Vector2Int c = goal; c != start; c = cameFrom[c]) path.Add(c);
    path.Add(start);
    path.Reverse();
    return path;
}`},

{id:'astar',cat:'algo',lvl:3,title:'Recherche de chemin A*',sum:'Le plus court chemin avec des coûts de terrain, guidé vers la cible par une estimation.',
body:[
['L\'idée',`A* explore en priorité les cases qui semblent les plus prometteuses. Pour chaque case, il additionne **g**, le coût réel depuis le départ, et **h**, une estimation du coût restant jusqu'à la cible (l'heuristique). Il développe toujours la case de plus petit ~f = g + h~.`],
['L\'heuristique',`Sur une grille à 4 directions, la distance de Manhattan (~|dx| + |dy|~) est idéale. Elle ne doit **jamais surestimer** le vrai coût, sinon le chemin trouvé n'est plus forcément le plus court. Avec h = 0, A* devient l'algorithme de Dijkstra.`],
['La file de priorité',`Il faut retirer rapidement la case de plus petit f. Depuis .NET 6, ~PriorityQueue<TElement, TPriority>~ fait ce travail ; dans les versions de Unity qui ne l'ont pas, une liste qu'on parcourt pour trouver le minimum suffit pour de petites grilles.`],
['Différence avec BFS',`Le [[bfs-grille|BFS]] traite toutes les cases au même coût et explore dans toutes les directions. A* gère les coûts (route 1, boue 3) et file vers la cible. Pour de nombreux agents en 3D, Unity fournit le [[navmesh]].`]],
ex:`Écris ~List<Vector2Int> AStar(int[,] cost, Vector2Int start, Vector2Int goal)~ où ~cost[x, y]~ est le coût pour entrer dans la case (0 ou moins = mur). 4 directions, heuristique de Manhattan.`,
hint:`gScore dans un Dictionary, cameFrom pour reconstruire, PriorityQueue avec la priorité g + h. Ignore une case sortie de la file si son g a été amélioré depuis.`,
sol:`private static readonly Vector2Int[] Dirs =
    { Vector2Int.up, Vector2Int.right, Vector2Int.down, Vector2Int.left };

public static List<Vector2Int> AStar(int[,] cost, Vector2Int start, Vector2Int goal)
{
    int w = cost.GetLength(0), h = cost.GetLength(1);
    int Heuristic(Vector2Int a) => Mathf.Abs(a.x - goal.x) + Mathf.Abs(a.y - goal.y);

    var g = new Dictionary<Vector2Int, int> { [start] = 0 };
    var cameFrom = new Dictionary<Vector2Int, Vector2Int>();
    var open = new PriorityQueue<Vector2Int, int>();
    open.Enqueue(start, Heuristic(start));

    while (open.TryDequeue(out Vector2Int c, out int f))
    {
        if (c == goal) break;
        if (f > g[c] + Heuristic(c)) continue;   // entrée périmée

        foreach (Vector2Int d in Dirs)
        {
            Vector2Int n = c + d;
            if (n.x < 0 || n.y < 0 || n.x >= w || n.y >= h) continue;
            int step = cost[n.x, n.y];
            if (step <= 0) continue;              // mur

            int tentative = g[c] + step;
            if (g.TryGetValue(n, out int old) && tentative >= old) continue;

            g[n] = tentative;
            cameFrom[n] = c;
            open.Enqueue(n, tentative + Heuristic(n));
        }
    }

    var path = new List<Vector2Int>();
    if (start != goal && !cameFrom.ContainsKey(goal)) return path;
    for (Vector2Int c = goal; c != start; c = cameFrom[c]) path.Add(c);
    path.Add(start);
    path.Reverse();
    return path;
}`}
]);

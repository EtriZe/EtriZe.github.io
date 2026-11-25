window.LESSONS=(window.LESSONS||[]).concat([
{id:'conditions-boucles',cat:'csharp',lvl:1,title:'Conditions et boucles',sum:'if, else, for, foreach, while : décider et répéter.',
body:[
['L\'idée',`Un programme fait deux choses en permanence : **choisir** (~if~, ~else~, ~switch~) et **répéter** (~for~, ~foreach~, ~while~). Toute la logique de jeu se construit avec ces briques.`],
['for, foreach, while',`~for~ quand tu as besoin de l'indice (~i~). ~foreach~ pour parcourir une collection sans t'occuper des indices. ~while~ quand tu ne sais pas à l'avance combien de tours il faudra, par exemple « tant que la case est occupée, essaie la suivante ».`,`for (int i = 0; i < 3; i++) Spawn(i);
foreach (Enemy e in enemies) e.Alert();
while (IsBlocked(pos)) pos += Vector3.right;`],
['break et continue',`~break~ sort de la boucle, ~continue~ passe au tour suivant. Utile pour s'arrêter au premier ennemi trouvé ou ignorer les ennemis morts.`],
['Le piège de la boucle infinie',`Un ~while~ dont la condition ne devient jamais fausse fige Unity entièrement : l'éditeur ne répond plus. Ajoute toujours une limite de sécurité (un nombre maximal d'essais).`],
['L\'opérateur ternaire',`~condition ? a : b~ choisit une valeur en une ligne : ~float speed = running ? 8f : 4f;~. Lisible pour les cas simples, à éviter imbriqué. Pour beaucoup de cas, voir [[enums-switch]].`]],
ex:`Écris ~int FirstFreeSlot(bool[] occupied)~ qui renvoie l'indice de la première case libre, ou −1 si tout est plein. Puis ~int CountAlive(int[] hp)~ qui compte les valeurs strictement positives.`,
hint:`Pour la première, un for avec return dès que tu trouves. Pour la seconde, un foreach et un compteur.`,
sol:`public static int FirstFreeSlot(bool[] occupied)
{
    for (int i = 0; i < occupied.Length; i++)
        if (!occupied[i]) return i;
    return -1;
}

public static int CountAlive(int[] hp)
{
    int count = 0;
    foreach (int h in hp)
    {
        if (h <= 0) continue;
        count++;
    }
    return count;
}`},

{id:'methodes-parametres',cat:'csharp',lvl:1,title:'Méthodes et paramètres',sum:'Découper le code en petites méthodes, et passer des valeurs avec ref, out et des paramètres optionnels.',
body:[
['L\'idée',`Une méthode est un bloc de code nommé, avec des paramètres en entrée et un type de retour (~void~ si rien). Une bonne méthode fait **une seule chose** et son nom le dit : ~ApplyDamage~, ~IsGrounded~, ~FindClosest~.`],
['Passage par valeur',`Par défaut, C# copie la valeur du paramètre. Pour un ~int~ ou un ~Vector3~, la méthode travaille sur une copie. Pour une class, c'est la référence qui est copiée : l'objet lui-même peut être modifié. Voir [[struct-vs-class]].`],
['ref et out',`~ref~ passe la variable elle-même : la méthode peut la modifier. ~out~ oblige la méthode à remplir la variable : c'est le motif de ~TryGetValue~ et ~Physics.Raycast(..., out RaycastHit hit)~, une méthode qui renvoie un bool **et** un résultat.`,`public static bool TryParseLevel(string s, out int level)
{
    return int.TryParse(s, out level) && level > 0;
}`],
['Paramètres optionnels et nommés',`~void Shake(float force = 1f, float duration = 0.2f)~ peut s'appeler ~Shake()~ ou ~Shake(duration: 0.5f)~. Les arguments nommés rendent un appel lisible quand il y a plusieurs nombres d'affilée.`],
['Surcharge',`Plusieurs méthodes peuvent porter le même nom si leurs paramètres diffèrent : ~Spawn(Vector3 pos)~ et ~Spawn(Transform parent)~. Le compilateur choisit selon les arguments.`]],
ex:`Écris ~bool TrySpend(ref int gold, int cost)~ qui retire le prix si le joueur a assez d'or et renvoie true, sinon ne touche à rien et renvoie false. Puis ~void Clamp(ref Vector3 p, float limit)~ qui garde x et z entre −limit et limit.`,
hint:`Avec ref, la modification de gold est visible chez l'appelant. Pour Clamp, modifie p.x et p.z avec Mathf.Clamp.`,
sol:`public static bool TrySpend(ref int gold, int cost)
{
    if (cost < 0 || gold < cost) return false;
    gold -= cost;
    return true;
}

public static void Clamp(ref Vector3 p, float limit)
{
    p.x = Mathf.Clamp(p.x, -limit, limit);
    p.z = Mathf.Clamp(p.z, -limit, limit);
}

// Utilisation :
// int gold = 50;
// if (TrySpend(ref gold, 30)) { /* gold vaut 20 */ }`},

{id:'proprietes',cat:'csharp',lvl:1,title:'Propriétés',sum:'Exposer une valeur tout en contrôlant qui la lit, qui l\'écrit et ce qui se passe à ce moment-là.',
body:[
['L\'idée',`Une propriété ressemble à un champ de l'extérieur (~player.Health~) mais exécute du code à la lecture (~get~) et à l'écriture (~set~). On peut ainsi valider, limiter ou déclencher un événement à chaque changement.`],
['Les formes courantes',`~public int Score { get; private set; }~ : tout le monde lit, seule la classe écrit. ~public float Ratio => current / max;~ : propriété calculée, en lecture seule. Une propriété avec un champ derrière permet d'ajouter de la logique.`,`private int health;
public int Health
{
    get => health;
    set => health = Mathf.Clamp(value, 0, MaxHealth);
}`],
['Propriétés et inspecteur',`Unity ne sérialise pas les propriétés, seulement les champs. Le motif habituel : un champ privé ~[SerializeField]~ visible dans l'inspecteur, et une propriété publique en lecture seule pour le reste du code. Pour une propriété auto, ~[field: SerializeField]~ sérialise le champ caché.`],
['Le piège du coût caché',`Une propriété peut cacher un calcul coûteux. ~Camera.main~ ou ~transform~ ont longtemps fait une recherche à chaque accès. Si une propriété fait du travail, mets le résultat en cache. Voir [[cache-references]].`]],
ex:`Écris une classe ~Stamina~ avec un ~Max~ réglable dans l'inspecteur, une propriété ~Current~ bornée entre 0 et Max, une propriété calculée ~IsExhausted~ et un événement déclenché seulement quand la valeur change vraiment.`,
hint:`Dans le set, calcule la nouvelle valeur bornée, compare-la à l'ancienne, puis déclenche l'événement si elles diffèrent.`,
sol:`public class Stamina : MonoBehaviour
{
    [field: SerializeField] public float Max { get; private set; } = 100f;

    private float current;
    public event Action<float> Changed;

    public float Current
    {
        get => current;
        set
        {
            float clamped = Mathf.Clamp(value, 0f, Max);
            if (Mathf.Approximately(clamped, current)) return;
            current = clamped;
            Changed?.Invoke(current);
        }
    }

    public bool IsExhausted => current <= 0f;

    private void Awake() => current = Max;
}`},

{id:'static-instance',cat:'csharp',lvl:1,title:'static et membres d\'instance',sum:'Ce qui appartient à chaque objet, et ce qui appartient à la classe entière.',
body:[
['L\'idée',`Un membre d'**instance** existe une fois par objet : chaque ennemi a sa propre vie. Un membre **static** existe une seule fois pour toute la classe : le nombre total d'ennemis vivants. On accède au premier par un objet (~enemy.hp~), au second par la classe (~Enemy.AliveCount~).`],
['Les classes utilitaires',`Une classe ~static~ ne contient que des membres static et ne s'instancie pas : ~Mathf~, ~Debug~, ou tes propres ~MathUtils~. Idéal pour des fonctions pures qui ne gardent aucun état.`],
['Le piège du static qui survit',`Un champ static garde sa valeur tant que le programme tourne. Dans l'éditeur, avec l'option « Enter Play Mode » rapide (sans rechargement du domaine), il **garde la valeur de la partie précédente**. On le remet à zéro avec ~[RuntimeInitializeOnLoadMethod]~.`,`[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
private static void ResetStatics() => AliveCount = 0;`],
['Avec modération',`Le static est pratique mais crée des dépendances invisibles : n'importe quel code peut le modifier. C'est le défaut principal du [[singleton]]. Préfère passer les références quand c'est possible.`]],
ex:`Écris une classe ~Coin~ (MonoBehaviour) qui tient un compteur static de pièces présentes dans la scène, mis à jour à l'activation et à la désactivation, remis à zéro au lancement du jeu, et un événement static ~AllCollected~ déclenché quand il tombe à 0.`,
hint:`OnEnable incrémente, OnDisable décrémente et vérifie si on est à 0. Pense à ResetStatics.`,
sol:`public class Coin : MonoBehaviour
{
    public static int Remaining { get; private set; }
    public static event Action AllCollected;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    private static void ResetStatics()
    {
        Remaining = 0;
        AllCollected = null;
    }

    private void OnEnable() => Remaining++;

    private void OnDisable()
    {
        Remaining--;
        if (Remaining == 0) AllCollected?.Invoke();
    }
}`},

{id:'chaines-texte',cat:'csharp',lvl:1,title:'Chaînes de caractères',sum:'Construire, formater et comparer du texte sans piège ni allocation inutile.',
body:[
['L\'idée',`Une ~string~ est **immuable** : chaque modification crée une nouvelle chaîne. ~s += "a"~ dans une boucle de 1000 tours crée 1000 chaînes. C'est sans importance pour un texte de menu, coûteux chaque image. Voir [[allocations-gc]].`],
['L\'interpolation',`~$"Vie : {hp}/{max}"~ est plus lisible qu'une concaténation. On peut formater : ~{ratio:P0}~ donne un pourcentage, ~{time:0.00}~ deux décimales, ~{gold:N0}~ un séparateur de milliers.`],
['StringBuilder',`Pour construire un long texte en plusieurs morceaux (un journal, un rapport d'outil), ~StringBuilder~ ajoute sans recréer la chaîne à chaque fois. On appelle ~ToString()~ une fois à la fin.`,`var sb = new StringBuilder();
foreach (var w in weapons) sb.AppendLine(w.displayName);
Debug.Log(sb.ToString());`],
['Comparer correctement',`~string.Equals(a, b, StringComparison.OrdinalIgnoreCase)~ compare sans tenir compte de la casse. Évite ~ToLower()~ qui alloue et dépend de la langue du système (le « i » turc est un piège célèbre). ~string.IsNullOrEmpty~ teste les deux cas d'un coup.`]],
ex:`Écris ~string FormatTime(float seconds)~ qui renvoie « 02:05.3 » pour 125,3 secondes (minutes sur deux chiffres, secondes sur deux chiffres, un dixième). Puis ~string BuildReport(List<string> errors)~ qui renvoie « Aucune erreur » ou la liste numérotée.`,
hint:`Minutes : (int)(seconds / 60). Le reste : seconds % 60. Format {m:00} et {s:00.0}.`,
sol:`public static string FormatTime(float seconds)
{
    int m = (int)(seconds / 60f);
    float s = seconds % 60f;
    return $"{m:00}:{s:00.0}";
}

public static string BuildReport(List<string> errors)
{
    if (errors == null || errors.Count == 0) return "Aucune erreur";

    var sb = new StringBuilder();
    sb.AppendLine($"{errors.Count} erreur(s) :");
    for (int i = 0; i < errors.Count; i++)
        sb.AppendLine($"{i + 1}. {errors[i]}");
    return sb.ToString();
}`},

{id:'enums-switch',cat:'csharp',lvl:1,title:'Enums et switch',sum:'Nommer un ensemble fini de cas, et réagir à chacun proprement.',
body:[
['L\'idée',`Un ~enum~ donne des noms à une liste fermée de valeurs : ~enum Rarity { Common, Rare, Epic, Legendary }~. C'est plus sûr qu'une chaîne (pas de faute de frappe) et plus lisible qu'un nombre. L'inspecteur l'affiche en menu déroulant.`],
['switch',`~switch~ choisit un bloc selon la valeur. Depuis C# 8, l'**expression switch** renvoie directement une valeur, très compacte pour associer chaque cas à un résultat.`,`Color c = rarity switch
{
    Rarity.Common    => Color.white,
    Rarity.Rare      => Color.blue,
    Rarity.Epic      => Color.magenta,
    Rarity.Legendary => Color.yellow,
    _                => Color.gray,
};`],
['Le piège de la sérialisation',`Unity enregistre un enum par sa **valeur numérique**. Insérer une valeur au milieu de la liste décale toutes les suivantes, et les assets existants changent de sens sans prévenir. Donne des valeurs explicites (~Rare = 10~) ou ajoute toujours à la fin.`],
['Quand l\'enum ne suffit plus',`Si chaque cas a beaucoup de données (couleur, son, multiplicateur), un [[scriptableobjects|ScriptableObject]] par cas est plus souple. Si les cas peuvent se combiner, voir les enums [[operations-bits|[Flags]]]. Pour des comportements différents, voir [[machine-etats]].`]],
ex:`Avec ~enum Rarity { Common, Rare, Epic, Legendary }~, écris ~float DropChance(Rarity r)~ (60 %, 25 %, 12 %, 3 %) avec une expression switch, puis ~Rarity Next(Rarity r)~ qui renvoie la rareté supérieure, Legendary restant Legendary.`,
hint:`Un enum se convertit en int et inversement. Le nombre de valeurs : Enum.GetValues(typeof(Rarity)).Length.`,
sol:`public enum Rarity { Common = 0, Rare = 1, Epic = 2, Legendary = 3 }

public static float DropChance(Rarity r) => r switch
{
    Rarity.Common    => 0.60f,
    Rarity.Rare      => 0.25f,
    Rarity.Epic      => 0.12f,
    Rarity.Legendary => 0.03f,
    _ => throw new ArgumentOutOfRangeException(nameof(r)),
};

public static Rarity Next(Rarity r)
{
    int next = Mathf.Min((int)r + 1, (int)Rarity.Legendary);
    return (Rarity)next;
}`},

{id:'null-securite',cat:'csharp',lvl:2,title:'null et les opérateurs ?. ??',sum:'Gérer l\'absence de valeur, et le cas très particulier des objets Unity détruits.',
body:[
['L\'idée',`Une variable de type référence peut valoir ~null~ : elle ne désigne aucun objet. Accéder à un membre de ~null~ lève une ~NullReferenceException~, l'erreur la plus fréquente de tout projet Unity.`],
['Les opérateurs',`~a?.b~ renvoie null au lieu de planter si a est null. ~a ?? b~ renvoie b si a est null. ~a ??= b~ affecte b seulement si a est null. Très pratiques en C# pur.`],
['Le grand piège Unity',`Un objet Unity détruit (~Destroy~) n'est pas null pour C#, mais Unity surcharge ~==~ pour qu'il le paraisse. Or ~?.~ et ~??~ **ignorent cette surcharge** : ~target?.Explode()~ appelle la méthode sur un objet détruit et provoque une ~MissingReferenceException~. Avec un objet Unity, utilise ~if (target != null)~ ou ~if (target)~.`,`// Faux avec un objet Unity détruit :
target?.TakeDamage(5);

// Correct :
if (target != null) target.TakeDamage(5);`],
['TryGetComponent',`~GetComponent~ renvoie null si le composant manque. ~TryGetComponent(out T c)~ renvoie un bool, ce qui rend le cas « absent » explicite et n'alloue rien dans l'éditeur. Voir [[generiques]].`]],
ex:`Écris ~string DisplayName(Player p)~ qui renvoie le pseudo du joueur, ou « Invité » si p est null ou si son pseudo est vide, en gérant correctement un Player (MonoBehaviour) détruit. Puis une propriété paresseuse ~Rigidbody Body~ qui fait le GetComponent une seule fois.`,
hint:`Pour l'objet Unity, utilise == null, pas ?. Pour la propriété, un champ privé et le test == null avant de le remplir.`,
sol:`public static string DisplayName(Player p)
{
    // == null tient compte des objets Unity détruits, contrairement à ?.
    if (p == null || string.IsNullOrEmpty(p.nickname)) return "Invité";
    return p.nickname;
}

public class Crate : MonoBehaviour
{
    private Rigidbody body;
    public Rigidbody Body
    {
        get
        {
            if (body == null) body = GetComponent<Rigidbody>();
            return body;
        }
    }
}`},

{id:'exceptions',cat:'csharp',lvl:2,title:'Exceptions et gestion d\'erreurs',sum:'try, catch, finally, et quand il vaut mieux ne pas lever d\'exception.',
body:[
['L\'idée',`Une exception interrompt le code en cours et remonte jusqu'au premier ~catch~ capable de la traiter. Dans Unity, une exception non attrapée dans ~Update~ s'affiche en rouge dans la Console et **saute le reste de la méthode** pour cette image, mais le jeu continue.`],
['try, catch, finally',`~try~ entoure le code risqué, ~catch~ réagit à l'erreur, ~finally~ s'exécute dans tous les cas (fermer un fichier, remettre une barre de progression à zéro).`,`try
{
    string json = File.ReadAllText(path);
    return JsonUtility.FromJson<SaveData>(json);
}
catch (IOException e)
{
    Debug.LogWarning($"Sauvegarde illisible : {e.Message}");
    return new SaveData();
}`],
['Attraper précisément',`Attrape le type d'exception que tu sais traiter (~IOException~, ~FormatException~), pas ~Exception~ en général : tu masquerais de vrais bugs. Un ~catch~ vide est presque toujours une erreur.`],
['Exceptions ou valeurs de retour',`Les exceptions sont lentes et réservées à l'**inattendu**. Pour un cas normal (le joueur n'a pas assez d'or, la clé n'existe pas), renvoie un bool : c'est le motif ~TryXxx~ vu dans [[methodes-parametres]]. Pour signaler qu'un appelant s'est trompé (argument null), ~throw new ArgumentNullException(nameof(x))~ est le bon outil.`]],
ex:`Écris ~SaveData LoadOrDefault(string path)~ qui lit un fichier JSON de sauvegarde. Si le fichier n'existe pas, renvoie une sauvegarde neuve sans message. S'il est illisible ou corrompu, journalise un avertissement et renvoie une sauvegarde neuve. Garde une barre de progression éditeur fermée dans tous les cas.`,
hint:`File.Exists d'abord (cas normal, pas d'exception). Puis try/catch autour de la lecture et du JsonUtility. Le finally ferme la barre.`,
sol:`public static SaveData LoadOrDefault(string path)
{
    if (!File.Exists(path)) return new SaveData();   // cas normal, pas une erreur

    try
    {
        EditorUtility.DisplayProgressBar("Chargement", path, 0.5f);
        string json = File.ReadAllText(path);
        SaveData data = JsonUtility.FromJson<SaveData>(json);
        return data ?? new SaveData();
    }
    catch (Exception e) when (e is IOException || e is ArgumentException)
    {
        Debug.LogWarning($"Sauvegarde corrompue ({path}) : {e.Message}");
        return new SaveData();
    }
    finally
    {
        EditorUtility.ClearProgressBar();
    }
}`},

{id:'lambdas-closures',cat:'csharp',lvl:2,title:'Lambdas et captures',sum:'Des petites fonctions écrites sur place, et ce qu\'elles capturent sans qu\'on le voie.',
body:[
['L\'idée',`Une lambda est une méthode anonyme écrite là où on en a besoin : ~x => x * 2~, ~(a, b) => a + b~, ~() => Debug.Log("ok")~. On les passe à LINQ, aux boutons d'UI, aux événements.`],
['La capture',`Une lambda peut utiliser les variables autour d'elle : elle les **capture**. C# crée alors un objet caché qui garde ces variables vivantes, même après la fin de la méthode. C'est puissant, et c'est une allocation. Voir [[allocations-gc]].`],
['Le piège de la boucle',`Dans une boucle ~for~, toutes les lambdas capturent **la même** variable ~i~, qui vaut sa dernière valeur à la fin. Copie-la dans une variable locale à l'intérieur de la boucle. (~foreach~ crée une nouvelle variable à chaque tour depuis C# 5, il n'a pas ce problème.)`,`for (int i = 0; i < buttons.Length; i++)
{
    int index = i;   // copie locale : chaque lambda a la sienne
    buttons[i].onClick.AddListener(() => SelectSlot(index));
}`],
['Se désabonner d\'une lambda',`~event -= () => ...~ ne retire rien : c'est une nouvelle lambda, différente de la première. Pour pouvoir se désabonner, garde la lambda dans une variable ou utilise une vraie méthode. Voir [[delegues-evenements]].`]],
ex:`Écris ~Func<float, float> MakeMultiplier(float factor)~ qui renvoie une fonction multipliant par factor. Puis ~List<Action> MakeCountdown(int n)~ qui renvoie n actions affichant n, n−1, … 1, en évitant le piège de la boucle.`,
hint:`Une lambda qui capture factor suffit pour la première. Pour la seconde, copie la valeur dans une variable locale à chaque tour.`,
sol:`public static Func<float, float> MakeMultiplier(float factor)
{
    return x => x * factor;   // factor est capturé
}

public static List<Action> MakeCountdown(int n)
{
    var actions = new List<Action>();
    for (int i = n; i >= 1; i--)
    {
        int value = i;        // une copie par tour
        actions.Add(() => Debug.Log(value));
    }
    return actions;
}`},

{id:'iterateurs-yield',cat:'csharp',lvl:2,title:'IEnumerable et yield',sum:'Produire une séquence élément par élément, à la demande. Le mécanisme derrière les coroutines.',
body:[
['L\'idée',`~IEnumerable<T>~ représente « quelque chose qu'on peut parcourir avec foreach ». Une méthode qui utilise ~yield return~ produit ses éléments **un par un, à la demande** : rien n'est calculé tant qu'on ne parcourt pas.`],
['yield return',`Chaque ~yield return x~ fournit un élément et met la méthode en pause jusqu'à la demande suivante. ~yield break~ termine la séquence. Le compilateur transforme la méthode en un petit automate.`,`IEnumerable<Vector2Int> Neighbours(Vector2Int c)
{
    yield return c + Vector2Int.up;
    yield return c + Vector2Int.right;
    yield return c + Vector2Int.down;
    yield return c + Vector2Int.left;
}`],
['Le lien avec les coroutines',`Une [[coroutines|coroutine]] est exactement ce mécanisme : un ~IEnumerator~ que Unity fait avancer d'un pas par image. ~yield return null~ veut dire « rends la main jusqu'à l'image suivante ».`],
['Le piège de l\'évaluation multiple',`Parcourir deux fois un ~IEnumerable~ relance tout le calcul. Si la séquence est coûteuse ou aléatoire, stocke-la avec ~ToList()~. C'est le même comportement que [[linq]], qui repose entièrement sur ce mécanisme.`]],
ex:`Écris ~IEnumerable<Vector2Int> Spiral(int radius)~ qui renvoie toutes les cases d'une grille autour de (0, 0), anneau par anneau : d'abord le centre, puis les 8 cases à distance 1, puis les 16 à distance 2, etc. (distance de Chebyshev).`,
hint:`Pour chaque anneau r, parcours x et y de −r à r et ne garde que les cases où max(|x|, |y|) vaut exactement r.`,
sol:`public static IEnumerable<Vector2Int> Spiral(int radius)
{
    yield return Vector2Int.zero;
    for (int r = 1; r <= radius; r++)
    {
        for (int y = -r; y <= r; y++)
        for (int x = -r; x <= r; x++)
        {
            if (Mathf.Max(Mathf.Abs(x), Mathf.Abs(y)) != r) continue;
            yield return new Vector2Int(x, y);
        }
    }
}

// Usage : trouver la case libre la plus proche
// foreach (var c in Spiral(5)) if (IsFree(origin + c)) return origin + c;`},

{id:'pattern-matching',cat:'csharp',lvl:2,title:'Pattern matching',sum:'Tester un type ou une forme de valeur et en extraire les données en une expression.',
body:[
['L\'idée',`Le pattern matching teste la **forme** d'une valeur. ~if (hit.collider.TryGetComponent(out IDamageable d))~ est un cas particulier, mais C# va plus loin : ~if (obj is Enemy e)~ teste le type et donne une variable typée d'un coup.`],
['Les motifs utiles',`Type : ~x is Enemy e~. Nullité : ~x is null~, ~x is not null~. Propriétés : ~x is { hp: > 0 }~. Plages : ~score is >= 90 and <= 100~. Ils se combinent avec ~and~, ~or~, ~not~.`],
['Dans une expression switch',`Avec [[enums-switch|switch]], les motifs permettent des règles lisibles sur plusieurs critères à la fois.`,`string Grade(int score) => score switch
{
    >= 90 => "S",
    >= 75 => "A",
    >= 50 => "B",
    < 0   => throw new ArgumentOutOfRangeException(),
    _     => "C",
};`],
['Attention aux objets Unity',`~obj is null~ et ~obj is not null~ ignorent la surcharge de ~==~ de Unity, comme ~?.~ (voir [[null-securite]]). Pour savoir si un objet Unity est détruit, garde ~obj != null~.`]],
ex:`Écris ~string Describe(object item)~ qui renvoie : « Arme (X dégâts) » pour un ~WeaponData~, « Soin de X » pour un ~Potion~ avec heal > 0, « Potion vide » pour une Potion à 0, « Rien » pour null et « Objet inconnu » sinon.`,
hint:`Une expression switch avec des motifs de type et de propriété : Potion { heal: > 0 } p.`,
sol:`public static string Describe(object item) => item switch
{
    null                     => "Rien",
    WeaponData w             => $"Arme ({w.damage} dégâts)",
    Potion { heal: > 0 } p   => $"Soin de {p.heal}",
    Potion                   => "Potion vide",
    _                        => "Objet inconnu",
};`},

{id:'idisposable-using',cat:'csharp',lvl:2,title:'IDisposable et using',sum:'Libérer à coup sûr une ressource, même quand une erreur survient.',
body:[
['L\'idée',`Certaines ressources ne sont pas gérées par le ramasse-miettes : fichiers ouverts, connexions, ~NativeArray~ (voir [[jobs-burst]]), textures temporaires. Leurs classes implémentent ~IDisposable~ : il faut appeler ~Dispose()~ quand on a fini.`],
['using',`~using (var x = ...) { }~ appelle ~Dispose()~ automatiquement à la sortie du bloc, même en cas d'exception. Depuis C# 8, ~using var x = ...;~ le fait à la fin de la méthode.`,`using (var writer = new StreamWriter(path))
{
    writer.WriteLine("début du journal");
}   // fichier fermé ici, quoi qu'il arrive`],
['Le motif « scope »',`On peut détourner ~using~ pour tout ce qui doit être « ouvert puis refermé » : un marqueur de profiler (voir [[profiler-markers]]), un style d'interface, ~EditorGUI.indentLevel~. On écrit une petite struct qui fait l'action au début et l'inverse dans Dispose.`],
['Le lien avec try/finally',`~using~ est exactement un ~try { } finally { x.Dispose(); }~ écrit pour toi. Voir [[exceptions]].`]],
ex:`Écris une struct ~TimerScope : IDisposable~ qui, utilisée avec ~using (new TimerScope("Génération"))~, affiche « Génération : 12,3 ms » à la fin du bloc.`,
hint:`Stocke le nom et un Stopwatch démarré dans le constructeur. Dispose l'arrête et affiche Elapsed.TotalMilliseconds.`,
sol:`public readonly struct TimerScope : IDisposable
{
    private readonly string label;
    private readonly System.Diagnostics.Stopwatch watch;

    public TimerScope(string label)
    {
        this.label = label;
        watch = System.Diagnostics.Stopwatch.StartNew();
    }

    public void Dispose()
    {
        watch.Stop();
        Debug.Log($"{label} : {watch.Elapsed.TotalMilliseconds:0.0} ms");
    }
}

// using (new TimerScope("Génération"))
// {
//     GenerateLevel();
// }`},

{id:'async-await',cat:'csharp',lvl:3,title:'async et await',sum:'Écrire du code qui attend sans bloquer le jeu, avec Task et Awaitable.',
body:[
['L\'idée',`~await~ met une méthode en pause jusqu'à ce qu'une opération soit finie (un chargement, un délai, une requête réseau), **sans bloquer** le reste du jeu. La méthode doit être marquée ~async~ et renvoie ~Task~, ~Task<T>~ ou, dans Unity 6, ~Awaitable~.`],
['Awaitable dans Unity',`~await Awaitable.WaitForSecondsAsync(1f)~ attend une seconde, ~await Awaitable.NextFrameAsync()~ une image. ~await SceneManager.LoadSceneAsync(...)~ attend un chargement. C'est l'équivalent moderne des [[coroutines]], avec en plus une vraie valeur de retour et des try/catch naturels.`,`async Awaitable ShowIntro()
{
    title.SetActive(true);
    await Awaitable.WaitForSecondsAsync(2f);
    title.SetActive(false);
}`],
['Le piège de l\'objet détruit',`Contrairement à une coroutine, une méthode async **continue** même si le GameObject est détruit. Passe un jeton d'annulation : ~destroyCancellationToken~ est fourni par chaque MonoBehaviour.`],
['Le piège async void',`Une méthode ~async void~ ne peut pas être attendue, et ses exceptions sont difficiles à suivre. Réserve-la aux gestionnaires d'événements (un clic de bouton). Partout ailleurs, renvoie un ~Awaitable~ ou un ~Task~.`],
['Threads',`Par défaut, le code après ~await~ reprend sur le thread principal, où l'API Unity est utilisable. ~await Awaitable.BackgroundThreadAsync()~ passe sur un autre thread pour un calcul lourd ; on revient avec ~MainThreadAsync()~ avant de toucher aux objets Unity.`]],
ex:`Dans un composant ~Countdown~ qui a un champ ~TMP_Text label~, écris ~async Awaitable<int> CountdownAsync(int from)~ qui affiche from, from−1, … 1 avec une seconde entre chaque, puis « Go ! », et renvoie le nombre de secondes écoulées. Elle doit s'arrêter proprement si l'objet est détruit.`,
hint:`Passe destroyCancellationToken à WaitForSecondsAsync. L'annulation lève une OperationCanceledException.`,
sol:`public class Countdown : MonoBehaviour
{
    [SerializeField] private TMP_Text label;

    public async Awaitable<int> CountdownAsync(int from)
    {
        var token = destroyCancellationToken;
        int elapsed = 0;
        try
        {
            for (int i = from; i >= 1; i--)
            {
                label.text = i.ToString();
                await Awaitable.WaitForSecondsAsync(1f, token);
                elapsed++;
            }
            label.text = "Go !";
        }
        catch (OperationCanceledException)
        {
            // objet détruit pendant le compte à rebours : on s'arrête sans bruit
        }
        return elapsed;
    }
}`}
]);

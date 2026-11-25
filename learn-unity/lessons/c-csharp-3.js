window.COURSES=Object.assign(window.COURSES||{},{
'generiques':{
lead:`Tu utilises les génériques depuis le début sans forcément le savoir : ~List<Enemy>~, ~GetComponent<Rigidbody>()~, ~Dictionary<string, int>~. Un générique est du code écrit **une seule fois** qui fonctionne pour n'importe quel type, avec la sécurité du typage. Ce cours explique comment en écrire, comment les contraindre et comment les combiner avec les méthodes d'extension pour créer des utilitaires réutilisables.`,
ch:[
['Pourquoi des génériques',
`Imagine qu'on veuille un pool d'objets réutilisables (voir [[object-pooling]]) pour les balles, puis pour les effets, puis pour les ennemis. Sans générique, on écrirait trois classes presque identiques, ou une seule qui manipule des ~object~ et oblige à caster partout, avec le risque de se tromper de type.`,
`Un générique prend un **type en paramètre**, noté entre chevrons. Par convention, on l'appelle ~T~ (ou ~TKey~, ~TValue~ quand il y en a plusieurs).`,
{c:`public class Pool<T>
{
    private readonly Stack<T> free = new Stack<T>();
    private readonly Func<T> create;

    public Pool(Func<T> create) => this.create = create;

    public T Get() => free.Count > 0 ? free.Pop() : create();
    public void Release(T item) => free.Push(item);
}

var bullets = new Pool<Bullet>(() => Instantiate(bulletPrefab));
Bullet b = bullets.Get();          // déjà typé Bullet : aucun cast`},
`Le compilateur vérifie les types : ~bullets.Release(enemy)~ ne compile pas. On a la réutilisation **et** la sécurité.`],
['Méthodes génériques',
`Une méthode peut aussi être générique, indépendamment de sa classe. Souvent, le type est **déduit** des arguments et on n'a pas besoin de l'écrire.`,
{c:`public static T RandomElement<T>(IReadOnlyList<T> list)
{
    return list[UnityEngine.Random.Range(0, list.Count)];
}

string name = RandomElement(names);          // T déduit : string
Enemy e = RandomElement(enemies);            // T déduit : Enemy

public static void Swap<T>(ref T a, ref T b)
{
    T tmp = a; a = b; b = tmp;
}`},
`~GetComponent<T>()~ est une méthode générique de Unity : on écrit le type voulu et elle renvoie directement un objet de ce type.`],
['Les contraintes',
`Sans indication, le compilateur ne sait rien de ~T~ : on ne peut appeler sur lui que ce qui existe sur tous les types (~ToString~, ~Equals~). Les **contraintes** (~where~) promettent quelque chose sur T, ce qui donne accès à ses membres.`,
{tab:[['Contrainte','Signification','Permet'],['~where T : Component~','T est un composant Unity','~.gameObject~, ~.transform~'],['~where T : class~','T est un type référence','comparer à null'],['~where T : struct~','T est un type valeur','éviter le boxing'],['~where T : new()~','T a un constructeur sans paramètre','~new T()~'],['~where T : IDamageable~','T implémente une interface','appeler ~TakeDamage~'],['~where T : unmanaged~','T ne contient aucune référence','usage dans les jobs, la mémoire native']]},
{c:`public static T GetOrAdd<T>(this GameObject go) where T : Component
{
    if (!go.TryGetComponent(out T c))
        c = go.AddComponent<T>();
    return c;
}

public static void DamageAll<T>(List<T> targets, int amount) where T : IDamageable
{
    foreach (T t in targets) t.TakeDamage(amount);
}`}],
['Méthodes d\'extension génériques',
`Une **méthode d'extension** est une méthode static, dans une classe static, dont le premier paramètre est précédé de ~this~. Elle s'appelle ensuite comme si elle appartenait au type. Combinée aux génériques, elle permet de créer une petite bibliothèque d'utilitaires très agréable.`,
{c:`public static class CollectionExtensions
{
    public static T Random<T>(this IReadOnlyList<T> list) =>
        list[UnityEngine.Random.Range(0, list.Count)];

    public static bool IsNullOrEmpty<T>(this ICollection<T> c) => c == null || c.Count == 0;

    public static void Shuffle<T>(this IList<T> list)
    {
        for (int i = list.Count - 1; i > 0; i--)
        {
            int j = UnityEngine.Random.Range(0, i + 1);
            (list[i], list[j]) = (list[j], list[i]);
        }
    }
}

Enemy target = enemies.Random();     // se lit comme une méthode de List
spawnPoints.Shuffle();`},
`L'algorithme de mélange utilisé ici est détaillé dans [[melange-fisher-yates]].`],
['Génériques et Unity',
`Unity sérialise ~List<T>~ et, depuis 2020.1, les champs d'un type générique **fermé** dont la classe est ~[Serializable]~ (par exemple ~Pool<Bullet>~ si ~Pool<T>~ est sérialisable). Par contre, l'inspecteur ne sait pas créer un ~MonoBehaviour~ générique ouvert : on ne peut pas ajouter un composant ~Pool<T>~ à un objet.`,
{c:`public abstract class PoolBehaviour<T> : MonoBehaviour where T : Component { /* ... */ }

// Une petite classe concrète par type, pour pouvoir l'ajouter à un GameObject
public class BulletPool : PoolBehaviour<Bullet> { }
public class ImpactPool : PoolBehaviour<ParticleSystem> { }`},
{n:`Pour les types valeur, les génériques évitent le **boxing** : ~List<int>~ stocke vraiment des int, alors que l'ancien ~ArrayList~ les emballait en ~object~ (voir [[struct-vs-class]]).`}]
],
err:[[`Appeler un membre de T sans contrainte`,`Erreur de compilation : ajoute ~where T : ...~.`],[`Un MonoBehaviour générique dans l'inspecteur`,`Impossible ; crée une classe concrète qui en hérite.`],[`Des génériques partout « au cas où »`,`Un générique se justifie quand il sert vraiment à plusieurs types.`]],
res:[`Un générique prend un type en paramètre (~T~) : un seul code, plusieurs types, typage vérifié.`,`Les méthodes génériques déduisent souvent T des arguments.`,`Les contraintes ~where~ donnent accès aux membres de T.`,`Méthodes d'extension + génériques = utilitaires réutilisables.`,`Unity : classes concrètes pour les MonoBehaviour génériques.`],
quiz:[
[`Que permet ~where T : Component~ ?`,[`Rien`,`Accéder à .gameObject et .transform sur T`,`Créer T avec new`,`Comparer T à 5`],1,`La contrainte garantit que T est un composant.`],
[`Comment rendre ~Pool<Bullet>~ ajoutable à un GameObject si Pool est un MonoBehaviour générique ?`,[`C'est impossible`,`Créer ~class BulletPool : Pool<Bullet> {}~`,`Utiliser object`,`Ajouter [Serializable]`],1,`L'inspecteur a besoin d'une classe concrète non générique.`],
[`Quel est l'avantage de ~List<int>~ sur une liste d'object ?`,[`Aucun`,`Typage vérifié et pas de boxing`,`Moins de mémoire seulement`,`Elle est triée`],1,`Le générique stocke de vrais int, sans emballage ni cast.`]],
src:[[`Microsoft Learn : types et méthodes génériques`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/types/generics`],[`Microsoft Learn : contraintes sur les paramètres de type`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters`],[`Microsoft Learn : méthodes d'extension`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/extension-methods`]]},

'iterateurs-yield':{
lead:`~foreach~ fonctionne sur toutes les collections parce qu'elles implémentent ~IEnumerable~. Avec ~yield return~, tu peux écrire tes propres séquences, calculées élément par élément, à la demande. C'est le mécanisme qui fait tourner LINQ, et c'est exactement celui qu'utilisent les **coroutines** de Unity. Comprendre les itérateurs, c'est comprendre les coroutines de l'intérieur.`,
ch:[
['IEnumerable et IEnumerator',
`~IEnumerable<T>~ signifie « on peut me parcourir ». Il fournit un ~IEnumerator<T>~, un curseur avec deux membres principaux : ~MoveNext()~ (avancer, renvoie false à la fin) et ~Current~ (l'élément actuel). ~foreach~ est un raccourci pour cette mécanique.`,
{c:`// Ce que tu écris
foreach (Enemy e in enemies) e.Alert();

// Ce que le compilateur produit, en simplifié
var it = enemies.GetEnumerator();
while (it.MoveNext())
{
    Enemy e = it.Current;
    e.Alert();
}`}],
['Écrire une séquence avec yield return',
`Une méthode qui renvoie ~IEnumerable<T>~ et contient ~yield return~ devient un **itérateur**. Chaque ~yield return~ fournit un élément et **met la méthode en pause** jusqu'à ce que l'appelant demande le suivant. ~yield break~ termine la séquence.`,
{c:`IEnumerable<Vector2Int> Neighbours(Vector2Int c, int width, int height)
{
    if (c.y + 1 < height) yield return c + Vector2Int.up;
    if (c.x + 1 < width)  yield return c + Vector2Int.right;
    if (c.y > 0)          yield return c + Vector2Int.down;
    if (c.x > 0)          yield return c + Vector2Int.left;
}

foreach (var n in Neighbours(cell, 10, 10))
    Debug.Log(n);`},
`Le compilateur transforme la méthode en un petit **automate** qui se souvient où il s'est arrêté et de ses variables locales. C'est ce qui permet de reprendre exactement là où on en était.`],
['L\'évaluation paresseuse',
`Un itérateur ne calcule que ce qu'on lui demande. On peut donc décrire des séquences **très longues, voire infinies**, et ne consommer que le début.`,
{c:`IEnumerable<Vector2Int> Spiral()
{
    yield return Vector2Int.zero;
    for (int r = 1; ; r++)                      // infini
        for (int y = -r; y <= r; y++)
            for (int x = -r; x <= r; x++)
                if (Mathf.Max(Mathf.Abs(x), Mathf.Abs(y)) == r)
                    yield return new Vector2Int(x, y);
}

// On s'arrête à la première case libre : on ne calcule que ce qu'il faut
Vector2Int spot = Spiral().First(c => IsFree(origin + c));`},
`C'est aussi la raison de l'**exécution différée** de LINQ (voir [[linq]]) : ~Where~ et ~Select~ sont des itérateurs qui ne font rien tant qu'on ne les parcourt pas.`],
['Les pièges',
{l:[`**Le code ne s'exécute pas à l'appel.** Appeler ~Neighbours(cell, 10, 10)~ sans parcourir le résultat ne fait rien. Une validation de paramètres en début d'itérateur n'est donc déclenchée qu'au premier ~MoveNext~.`,`**Chaque parcours recommence tout.** Parcourir deux fois relance le calcul depuis le début ; si la séquence utilise de l'aléatoire, les deux parcours diffèrent.`,`**Allocation** : chaque appel d'un itérateur crée un petit objet sur le tas. Pas de problème dans un outil, à surveiller dans le code appelé chaque image.`]},
{c:`// Valider tout de suite : une méthode publique qui valide, une privée qui itère
public IEnumerable<int> Range(int from, int to)
{
    if (to < from) throw new ArgumentException("to < from");   // levée immédiatement
    return RangeIterator(from, to);
}
private IEnumerable<int> RangeIterator(int from, int to)
{
    for (int i = from; i <= to; i++) yield return i;
}`}],
['Le lien avec les coroutines',
`Une coroutine Unity est un itérateur qui renvoie ~IEnumerator~. Unity appelle ~MoveNext()~ une fois par image (ou quand l'attente est terminée), et regarde ce que la méthode a « yieldé » pour savoir quand reprendre.`,
{c:`IEnumerator Blink()
{
    for (int i = 0; i < 5; i++)
    {
        sprite.enabled = false;
        yield return new WaitForSeconds(0.1f);   // Unity reprendra dans 0,1 s
        sprite.enabled = true;
        yield return null;                       // Unity reprendra à l'image suivante
    }
}

StartCoroutine(Blink());`},
`~yield return null~ signifie « rends la main au moteur jusqu'à l'image suivante » ; ~yield return new WaitForSeconds(...)~ signifie « reprends après ce délai ». Ce n'est pas un thread : tout se passe sur le thread principal, une étape par image. Les coroutines sont détaillées dans [[coroutines]].`,
{u:`Une coroutine est un objet géré par le MonoBehaviour qui l'a lancée. Désactiver l'objet arrête toutes ses coroutines, et elles ne reprennent pas automatiquement à la réactivation.`}]
],
err:[[`Appeler un itérateur sans le parcourir`,`Rien ne se passe. Parcours-le ou matérialise-le (~ToList~).`],[`Parcourir deux fois une séquence aléatoire`,`Deux résultats différents. ~ToList()~ une fois.`],[`Attendre que la validation se déclenche à l'appel`,`Elle n'arrive qu'au premier élément. Sépare validation et itérateur.`]],
res:[`~IEnumerable~ se parcourt, ~IEnumerator~ est le curseur (MoveNext, Current).`,`~yield return~ fournit un élément et met la méthode en pause.`,`Évaluation paresseuse : on ne calcule que ce qui est demandé.`,`Chaque parcours recommence ; chaque appel alloue un petit objet.`,`Une coroutine est un itérateur que Unity fait avancer à chaque image.`],
quiz:[
[`Quand le corps d'un itérateur commence-t-il à s'exécuter ?`,[`À l'appel de la méthode`,`Au premier MoveNext (premier élément demandé)`,`À la compilation`,`Jamais`],1,`L'appel crée l'itérateur ; le code tourne quand on demande un élément.`],
[`Que signifie ~yield return null~ dans une coroutine ?`,[`Arrêter la coroutine`,`Reprendre à l'image suivante`,`Renvoyer null à l'appelant`,`Attendre une seconde`],1,`Unity reprend la coroutine à l'image suivante.`],
[`Une coroutine est-elle exécutée sur un autre thread ?`,[`Oui`,`Non, sur le thread principal, une étape par image`,`Seulement en build`,`Ça dépend de WaitForSeconds`],1,`Les coroutines sont un mécanisme d'itérateurs, pas de threads.`]],
src:[[`Microsoft Learn : itérateurs`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/iterators`],[`Microsoft Learn : instruction yield`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/yield`],[`Documentation Unity : coroutines`,`https://docs.unity3d.com/Manual/Coroutines.html`]]},

'pattern-matching':{
lead:`Le pattern matching permet de tester la **forme** d'une valeur (son type, ses propriétés, sa plage) et d'en extraire les données en une seule expression. Il remplace avantageusement les cascades de ~if~ et de casts, et rend les règles de jeu (combinaisons d'éléments, paliers de score, réactions selon l'objet touché) beaucoup plus lisibles.`,
ch:[
['Tester un type : is',
`Avant le pattern matching, tester un type et l'utiliser demandait deux étapes. Le motif de type fait les deux d'un coup et déclare une variable typée.`,
{c:`// Avant
if (item is Weapon)
{
    var w = (Weapon)item;
    Equip(w);
}

// Avec le motif de type
if (item is Weapon w)
    Equip(w);

// Négation (C# 9)
if (item is not Consumable) return;`},
`~TryGetComponent(out T c)~ de Unity suit le même esprit : tester et récupérer en une seule opération.`],
['Les motifs disponibles',
{tab:[['Motif','Exemple','Signification'],['Type','~x is Enemy e~','x est un Enemy ; le récupérer dans e'],['Constante','~x is 0~, ~x is null~','x vaut exactement cette valeur'],['Relationnel','~x is > 10~','comparaison'],['Logique','~x is >= 0 and < 100~','combinaison avec and, or, not'],['Propriété','~x is { Health: > 0 }~','une propriété respecte un motif'],['Position','~(a, b) is (Fire, Water)~','sur un tuple ou un type déconstructible'],['Rejet','~_~','tout le reste']]},
{c:`if (hit is { distance: < 2f, collider: var c })   // propriétés + capture
    Debug.Log($"Très proche : {c.name}");

bool isTeen = age is >= 13 and <= 19;
bool isEdge = x is 0 or 9;`}],
['L\'expression switch avec motifs',
`Combinés à l'expression switch, les motifs donnent des tables de règles très lisibles, évaluées de haut en bas.`,
{c:`string Grade(int score) => score switch
{
    < 0       => throw new ArgumentOutOfRangeException(nameof(score)),
    >= 90     => "S",
    >= 75     => "A",
    >= 50     => "B",
    _         => "C",
};

string Describe(object item) => item switch
{
    null                       => "Rien",
    Weapon { damage: > 50 } w  => $"Arme redoutable : {w.name}",
    Weapon w                   => $"Arme : {w.name}",
    Potion { heal: > 0 } p     => $"Soin de {p.heal}",
    Potion                     => "Potion vide",
    _                          => "Objet inconnu",
};`, t:`L'ordre compte : le cas le plus précis d'abord`},
`Le compilateur signale un cas jamais atteint (masqué par un cas plus général placé avant).`],
['Les motifs de position : des règles à deux entrées',
`Un tuple permet de tester **deux valeurs à la fois**, parfait pour les tableaux de combinaisons d'un jeu.`,
{c:`public enum Element { Fire, Water, Earth, Air }

float Multiplier(Element attack, Element defense) => (attack, defense) switch
{
    (Element.Water, Element.Fire)  => 2f,
    (Element.Fire,  Element.Earth) => 2f,
    (Element.Earth, Element.Air)   => 2f,
    (Element.Air,   Element.Water) => 2f,
    var (a, d) when a == d         => 0.5f,   // garde when : condition supplémentaire
    _                              => 1f,
};`},
`Le mot-clé ~when~ ajoute une condition libre à un cas.`],
['Quand ne pas l\'utiliser',
`Un même ~switch~ sur des types, répété dans plusieurs fichiers, est souvent le signe qu'il manque une méthode **virtuelle** ou une [[interfaces|interface]] : chaque type devrait savoir faire le travail lui-même. Ajouter un nouveau type obligerait sinon à modifier tous les ~switch~.`,
{w:`Comme ~?.~ et ~??~, les motifs ~is null~ et ~is not null~ **ignorent la surcharge de ~==~ de Unity** : un objet Unity détruit n'est pas « null » pour eux. Pour un objet Unity, continue d'utiliser ~== null~ ou ~!= null~ (voir [[null-securite]]).`}]
],
err:[[`Un cas général placé avant un cas précis`,`Le cas précis n'est jamais atteint ; le compilateur le signale.`],[`is null sur un objet Unity détruit`,`Renvoie false. Utilise == null.`],[`Un switch sur les types copié partout`,`Une méthode virtuelle ou une interface serait plus solide.`]],
res:[`~x is T t~ teste le type et récupère une variable typée.`,`Motifs : constante, relationnel, logique (and, or, not), propriété, position.`,`L'expression switch évalue les cas de haut en bas : le plus précis d'abord.`,`Tuples + motifs de position pour les règles à deux entrées ; ~when~ pour une condition libre.`,`Sur les objets Unity, ~== null~ plutôt que ~is null~.`],
quiz:[
[`Que fait ~if (obj is Enemy e)~ ?`,[`Crée un ennemi`,`Teste si obj est un Enemy et le met dans e`,`Compare obj à e`,`Lève une exception si ce n'est pas un Enemy`],1,`C'est le motif de type.`],
[`Que se passe-t-il avec ~score switch { >= 50 => "B", >= 90 => "S", _ => "C" }~ ?`,[`95 donne S`,`95 donne B`,`Erreur de compilation : le cas >= 90 est déjà couvert par >= 50`,`95 donne C`],2,`Les cas sont évalués dans l'ordre ; un cas entièrement couvert par un précédent est refusé par le compilateur. Il faut placer >= 90 en premier.`],
[`À quoi sert when dans un cas de switch ?`,[`À attendre`,`À ajouter une condition supplémentaire`,`À ignorer le cas`,`À rien`],1,`when est une garde booléenne libre.`]],
src:[[`Microsoft Learn : critères spéciaux (pattern matching)`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/functional/pattern-matching`],[`Microsoft Learn : référence des modèles`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/patterns`],[`Microsoft Learn : expression switch`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/switch-expression`]]},

'idisposable-using':{
lead:`Le ramasse-miettes libère la mémoire des objets C#, mais pas tout ce qu'un programme utilise : un fichier ouvert, une connexion, de la mémoire native, une texture créée à la volée. Ces ressources doivent être libérées **explicitement**, au bon moment, même en cas d'erreur. ~IDisposable~ et l'instruction ~using~ sont faits pour cela, et ils offrent en prime un motif d'écriture très élégant.`,
ch:[
['Les ressources non gérées',
`Le ramasse-miettes (GC) sait libérer les objets C#, mais il ne sait pas quand ils seront libérés, ni fermer un fichier à ta place. Les classes qui détiennent une ressource externe implémentent l'interface ~IDisposable~, qui n'a qu'une méthode : ~Dispose()~. L'appeler libère la ressource immédiatement.`,
{tab:[['Ressource','Comment la libérer'],['Fichier, flux (~StreamWriter~, ~FileStream~)','~Dispose()~ ou ~using~'],['~NativeArray~ et conteneurs natifs (jobs)','~Dispose()~'],['~UnityWebRequest~','~Dispose()~ ou ~using~'],['~RenderTexture~ créée par code','~Release()~ puis ~Destroy~'],['~Material~, ~Texture2D~, ~Mesh~ créés par code','~Destroy()~ (ce ne sont pas des IDisposable)']]},
{w:`Un ~new Material(...)~ ou un ~renderer.material~ (qui crée une copie) reste en mémoire jusqu'au prochain déchargement de scène si tu ne le détruis pas. Dans un jeu qui crée des matériaux à la volée, c'est une fuite progressive.`}],
['L\'instruction using',
`~using~ garantit que ~Dispose()~ est appelé à la sortie du bloc, **même si une exception est levée**. C'est exactement un ~try / finally~ écrit pour toi.`,
{c:`// Avec using
using (var writer = new StreamWriter(path))
{
    writer.WriteLine("début du journal");
    writer.WriteLine(DateTime.Now);
}   // writer.Dispose() appelé ici, quoi qu'il arrive

// Ce que le compilateur génère
var w = new StreamWriter(path);
try
{
    w.WriteLine("début du journal");
}
finally
{
    w.Dispose();
}`},
`Depuis C# 8, la **déclaration using** se passe de bloc : la ressource est libérée à la fin de la méthode (ou du bloc) qui la contient.`,
{c:`void Export(string path, List<string> lines)
{
    using var writer = new StreamWriter(path);
    foreach (var l in lines) writer.WriteLine(l);
}   // Dispose ici`}],
['Le motif « scope »',
`On peut détourner ~using~ pour tout ce qui doit être **ouvert puis refermé** : on crée une petite struct qui fait l'action au début (constructeur) et l'inverse dans ~Dispose~. Impossible alors d'oublier de refermer.`,
{c:`public readonly struct TimeScaleScope : IDisposable
{
    private readonly float previous;

    public TimeScaleScope(float scale)
    {
        previous = Time.timeScale;
        Time.timeScale = scale;
    }

    public void Dispose() => Time.timeScale = previous;
}

using (new TimeScaleScope(0.2f))
{
    PlaySlowMotionMoment();
}   // timeScale restauré, même si une exception est levée`},
{u:`Unity utilise ce motif partout : ~using (marker.Auto())~ pour le profiler (voir [[profiler-markers]]), et dans l'éditeur ~EditorGUI.DisabledScope~, ~EditorGUILayout.HorizontalScope~, ~EditorGUI.ChangeCheckScope~.`}],
['Implémenter IDisposable',
`Si ta propre classe détient une ressource à libérer (un ~NativeArray~, un fichier ouvert longtemps), elle implémente ~IDisposable~ et libère tout dans ~Dispose~. On protège contre un double appel.`,
{c:`public class ParticleBuffer : IDisposable
{
    private NativeArray<float3> positions;
    private bool disposed;

    public ParticleBuffer(int count)
    {
        positions = new NativeArray<float3>(count, Allocator.Persistent);
    }

    public void Dispose()
    {
        if (disposed) return;
        if (positions.IsCreated) positions.Dispose();
        disposed = true;
    }
}

// Dans un MonoBehaviour propriétaire
private ParticleBuffer buffer;
private void OnEnable()  => buffer = new ParticleBuffer(10000);
private void OnDisable() => buffer?.Dispose();`},
`Le motif complet de .NET ajoute un « finaliseur » pour les ressources vraiment non gérées ; pour du code Unity, la version simple ci-dessus, appelée depuis ~OnDisable~ ou ~OnDestroy~, suffit dans la grande majorité des cas.`]
],
err:[[`Oublier Dispose sur un NativeArray`,`Unity signale une fuite mémoire dans la Console.`],[`Ne pas détruire un Material créé par code`,`Il reste en mémoire. ~Destroy(material)~ dans OnDestroy.`],[`Remettre une valeur à la main après un bloc`,`Une exception saute la remise. Un scope ~using~ la garantit.`]],
res:[`Le GC ne libère pas tout : fichiers, mémoire native, ressources graphiques.`,`~IDisposable.Dispose()~ libère immédiatement.`,`~using~ = ~try/finally~ qui appelle Dispose dans tous les cas.`,`Le motif scope garantit qu'une action est toujours refermée.`,`Les Material, Texture, Mesh créés par code se détruisent avec ~Destroy~.`],
quiz:[
[`Que garantit using ?`,[`Plus de vitesse`,`Que Dispose est appelé même en cas d'exception`,`Que l'objet n'est jamais null`,`La libération par le GC`],1,`C'est un try/finally généré par le compilateur.`],
[`Comment libérer un Material créé avec new Material(...) ?`,[`Dispose()`,`Destroy(material)`,`Rien, le GC s'en charge`,`material = null`],1,`Les objets Unity se détruisent avec Destroy.`],
[`Quand Dispose est-il appelé avec ~using var w = ...;~ ?`,[`Immédiatement`,`À la fin du bloc ou de la méthode qui contient la déclaration`,`Jamais`,`Au prochain GC`],1,`La déclaration using libère à la sortie de sa portée.`]],
src:[[`Microsoft Learn : instruction using`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/using`],[`Microsoft Learn : implémenter une méthode Dispose`,`https://learn.microsoft.com/fr-fr/dotnet/standard/garbage-collection/implementing-dispose`],[`Documentation Unity : NativeArray`,`https://docs.unity3d.com/ScriptReference/Unity.Collections.NativeArray_1.html`]]},

'attributs-reflexion':{
lead:`Les attributs sont les étiquettes entre crochets que tu poses sur ton code : ~[SerializeField]~, ~[Range(0, 1)]~, ~[MenuItem("...")]~. La réflexion est la capacité d'un programme à s'inspecter lui-même pendant qu'il tourne. Ensemble, ils sont au cœur de l'éditeur Unity et de la plupart des outils de studio : validation automatique, inspecteurs générés, boutons de débogage. Ce cours explique comment ils marchent et comment s'en servir.`,
ch:[
['Les attributs : des métadonnées',
`Un attribut ajoute une **information** à une classe, un champ, une méthode ou un paramètre. Il ne fait rien par lui-même : c'est un autre code (l'éditeur Unity, le compilateur, ton outil) qui le lit et agit en conséquence.`,
{c:`public class Enemy : MonoBehaviour
{
    [Header("Déplacement")]
    [SerializeField, Range(0f, 10f)] private float speed = 3f;
    [Tooltip("Distance à laquelle l'ennemi repère le joueur")]
    [SerializeField, Min(0f)] private float sightRange = 8f;

    [ContextMenu("Tuer")]           // ajoute une entrée au menu du composant
    private void Kill() => Destroy(gameObject);
}`},
{tab:[['Attribut Unity','Effet'],['~[SerializeField]~','sérialise et affiche un champ privé'],['~[HideInInspector]~','cache un champ public'],['~[Header]~, ~[Space]~, ~[Tooltip]~','mise en forme de l\'inspecteur'],['~[Range]~, ~[Min]~','limite la valeur saisie'],['~[RequireComponent]~','ajoute automatiquement un composant requis'],['~[CreateAssetMenu]~','ajoute un ScriptableObject au menu Create'],['~[MenuItem]~, ~[ContextMenu]~','commandes d\'éditeur'],['~[DisallowMultipleComponent]~','un seul exemplaire du composant par objet']]}],
['Créer son propre attribut',
`Un attribut est une classe qui hérite de ~Attribute~. Par convention, son nom finit par « Attribute », suffixe qu'on omet à l'usage. ~[AttributeUsage]~ précise sur quoi on peut le poser.`,
{c:`[AttributeUsage(AttributeTargets.Field)]
public class RequiredAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Method)]
public class DebugButtonAttribute : Attribute
{
    public string Label { get; }
    public DebugButtonAttribute(string label = null) => Label = label;
}

public class Door : MonoBehaviour
{
    [SerializeField, Required] private Animator animator;

    [DebugButton("Ouvrir")] private void Open() { /* ... */ }
}`},
`Pour que l'inspecteur réagisse visuellement à un attribut, on écrit un [[property-drawer]] (l'attribut hérite alors de ~PropertyAttribute~).`],
['La réflexion : s\'inspecter soi-même',
`La réflexion permet de lire, pendant l'exécution, la structure des types : leurs champs, méthodes, propriétés et attributs. On part de ~GetType()~ ou ~typeof(T)~.`,
{c:`using System.Reflection;

Type t = target.GetType();
var flags = BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic;

foreach (FieldInfo f in t.GetFields(flags))
{
    bool required = f.GetCustomAttribute<RequiredAttribute>() != null;
    object value = f.GetValue(target);
    Debug.Log($"{f.Name} ({f.FieldType.Name}) = {value}, requis : {required}");
}

foreach (MethodInfo m in t.GetMethods(flags))
{
    var button = m.GetCustomAttribute<DebugButtonAttribute>();
    if (button != null && m.GetParameters().Length == 0)
        m.Invoke(target, null);      // appeler la méthode dynamiquement
}`},
`~BindingFlags.NonPublic~ est nécessaire pour voir les champs privés, ce qui est le cas de tous les ~[SerializeField] private~.`],
['Un outil complet : vérifier les références obligatoires',
`En combinant les deux, on écrit en quelques lignes un vérificateur qui trouve toutes les références ~[Required]~ restées vides sur un objet.`,
{c:`public static List<string> FindMissing(UnityEngine.Object target)
{
    var missing = new List<string>();
    var flags = BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic;

    foreach (FieldInfo field in target.GetType().GetFields(flags))
    {
        if (field.GetCustomAttribute<RequiredAttribute>() == null) continue;

        object value = field.GetValue(target);
        bool empty = value == null || (value is UnityEngine.Object o && o == null);
        if (empty) missing.Add(field.Name);
    }
    return missing;
}`},
`Le test ~value is UnityEngine.Object o && o == null~ est indispensable : une référence vide dans l'inspecteur n'est pas forcément un vrai null pour C#, et seule la surcharge ~==~ de Unity le détecte (voir [[null-securite]]). Appliqué à tous les prefabs du projet, cet outil devient une étape de [[validation-assets]].`],
['Coût et précautions',
{l:[`**La réflexion est lente** : des centaines de fois plus qu'un accès direct. On la réserve à l'éditeur, aux outils et à l'initialisation, jamais à la boucle de jeu.`,`**Mets en cache** les ~FieldInfo~ et ~MethodInfo~ trouvés : les rechercher à chaque fois coûte cher.`,`**Dans l'éditeur**, ~TypeCache~ (~TypeCache.GetFieldsWithAttribute<T>()~, ~GetTypesDerivedFrom<T>()~) trouve très rapidement tous les éléments marqués, grâce à un index que Unity maintient.`,`**En build avec IL2CPP** (consoles, mobiles), le code jugé inutilisé est retiré. Un type atteint uniquement par réflexion peut disparaître ; ~[Preserve]~ ou un fichier ~link.xml~ le protègent.`]},
{n:`Les outils professionnels remplacent souvent la réflexion à l'exécution par du **code généré** : un script lit les attributs dans l'éditeur et écrit des fichiers C# classiques. On garde la souplesse des attributs sans leur coût en jeu.`}]
],
err:[[`Oublier BindingFlags.NonPublic`,`Les champs [SerializeField] privés sont invisibles.`],[`Tester une référence vide avec value == null seulement`,`Les objets Unity « vides » ne sont pas null pour C#. Teste aussi via UnityEngine.Object.`],[`Utiliser la réflexion dans Update`,`Très lent. Réserve-la aux outils ou mets en cache.`]],
res:[`Un attribut est une métadonnée ; un autre code le lit.`,`Créer un attribut : une classe qui hérite d'~Attribute~.`,`La réflexion lit types, champs, méthodes et attributs à l'exécution.`,`Lente : outils, éditeur, initialisation ; ~TypeCache~ dans l'éditeur.`,`IL2CPP peut retirer le code atteint seulement par réflexion.`],
quiz:[
[`Un attribut fait-il quelque chose tout seul ?`,[`Oui, toujours`,`Non, un autre code doit le lire`,`Seulement en build`,`Seulement les attributs Unity`],1,`C'est une métadonnée, lue par l'éditeur, le compilateur ou tes outils.`],
[`Pourquoi GetFields ne trouve-t-il pas un champ [SerializeField] private ?`,[`Il n'existe pas`,`Il manque BindingFlags.NonPublic`,`La réflexion ne marche pas dans Unity`,`Il faut GetProperties`],1,`Par défaut, seuls les membres publics sont renvoyés.`],
[`Où utiliser la réflexion ?`,[`Dans Update`,`Dans les outils d'éditeur et l'initialisation`,`Dans FixedUpdate`,`Partout`],1,`Elle est trop lente pour la boucle de jeu.`]],
src:[[`Microsoft Learn : attributs et réflexion`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/advanced-topics/reflection-and-attributes/`],[`Microsoft Learn : créer des attributs personnalisés`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/advanced-topics/reflection-and-attributes/creating-custom-attributes`],[`Documentation Unity : TypeCache`,`https://docs.unity3d.com/ScriptReference/TypeCache.html`]]},

'async-await':{
lead:`Charger une scène, télécharger un fichier, attendre trois secondes, calculer un terrain : beaucoup d'opérations prennent du temps. ~async~ et ~await~ permettent d'écrire ce code comme s'il était séquentiel, **sans bloquer** le jeu pendant l'attente. Depuis Unity 6, la classe ~Awaitable~ rend ce modèle naturel dans Unity. Ce cours explique le fonctionnement, les différences avec les coroutines et les pièges propres à Unity.`,
ch:[
['Le problème : attendre sans bloquer',
`Le jeu tourne sur un **thread principal** qui doit produire une image toutes les 16 ms. Si une méthode attend (une boucle qui patiente, un ~Thread.Sleep~, une lecture de fichier lente), tout le jeu se fige pendant ce temps.`,
`~await~ résout ce problème : il **suspend la méthode** au point d'attente et rend la main au moteur, qui continue de faire tourner le jeu. Quand l'opération est terminée, la méthode **reprend** juste après le ~await~, avec toutes ses variables locales intactes.`,
{c:`async Awaitable ShowIntro()
{
    title.SetActive(true);
    await Awaitable.WaitForSecondsAsync(2f);   // le jeu continue de tourner
    title.SetActive(false);
    await FadeOutAsync();
    SceneManager.LoadScene("Menu");
}`, t:`Se lit de haut en bas, comme du code normal`}],
['async, await et les types de retour',
`Une méthode qui contient ~await~ doit être marquée ~async~. Son type de retour indique qu'elle est « attendable » :`,
{tab:[['Type de retour','Usage'],['~Awaitable~ / ~Awaitable<T>~','le choix recommandé dans Unity 6 : alloue peu (objets réutilisés), conscient de la boucle de jeu'],['~Task~ / ~Task<T>~','le standard .NET ; utile pour les bibliothèques .NET et ~Task.WhenAll~'],['~void~','seulement pour un gestionnaire d\'événement (un clic)']]},
{c:`async Awaitable<int> LoadHighScoreAsync()
{
    string json = await File.ReadAllTextAsync(path);   // .NET : renvoie Task<string>
    return JsonUtility.FromJson<ScoreData>(json).best;
}

async Awaitable Start()                 // Start peut être async dans Unity
{
    int best = await LoadHighScoreAsync();
    bestLabel.text = best.ToString();
}`},
{w:`Un ~Awaitable~ ne doit être attendu **qu'une seule fois** : Unity réutilise ces objets pour éviter les allocations. Attendre deux fois le même ~Awaitable~ provoque des erreurs. Si tu as besoin d'attendre un résultat à plusieurs endroits, convertis-le en ~Task~.`}],
['Les attentes fournies par Unity',
{tab:[['Méthode','Reprend…'],['~Awaitable.NextFrameAsync()~','à l\'image suivante (comme ~yield return null~)'],['~Awaitable.WaitForSecondsAsync(s)~','après s secondes de temps de jeu'],['~Awaitable.FixedUpdateAsync()~','au prochain pas de physique'],['~Awaitable.EndOfFrameAsync()~','à la fin de l\'image'],['~Awaitable.BackgroundThreadAsync()~','sur un thread d\'arrière-plan'],['~Awaitable.MainThreadAsync()~','sur le thread principal'],['~await SceneManager.LoadSceneAsync(...)~','quand la scène est chargée (toute ~AsyncOperation~ est attendable)']]},
{c:`async Awaitable MoveTo(Vector3 target, float duration)
{
    Vector3 start = transform.position;
    for (float t = 0f; t < duration; t += Time.deltaTime)
    {
        transform.position = Vector3.Lerp(start, target, t / duration);
        await Awaitable.NextFrameAsync();
    }
    transform.position = target;
}`}],
['Le piège : l\'objet détruit',
`Une coroutine s'arrête automatiquement quand son objet est désactivé ou détruit. Une méthode ~async~, **non** : elle continue, et accède ensuite à un objet détruit (~MissingReferenceException~). Il faut l'annuler explicitement avec un **jeton d'annulation**. Chaque MonoBehaviour fournit ~destroyCancellationToken~, annulé à sa destruction.`,
{c:`async Awaitable BlinkForever()
{
    var token = destroyCancellationToken;
    try
    {
        while (true)
        {
            sprite.enabled = !sprite.enabled;
            await Awaitable.WaitForSecondsAsync(0.3f, token);
        }
    }
    catch (OperationCanceledException)
    {
        // objet détruit : arrêt propre, rien à faire
    }
}`},
`L'annulation lève une ~OperationCanceledException~ au point d'attente : on l'attrape pour s'arrêter proprement. Pour arrêter sur une autre condition (le joueur quitte le menu), on crée son propre ~CancellationTokenSource~ et on appelle ~Cancel()~.`],
['Calculer en arrière-plan',
`~await Awaitable.BackgroundThreadAsync()~ fait continuer la méthode sur un autre thread : le calcul lourd n'affecte plus le framerate. **Aucune API Unity** (Transform, GameObject, Texture…) n'est permise tant qu'on n'est pas revenu sur le thread principal.`,
{c:`async Awaitable<Texture2D> GenerateNoiseTextureAsync(int size)
{
    await Awaitable.BackgroundThreadAsync();
    var pixels = new Color[size * size];                 // calcul pur : autorisé
    for (int y = 0; y < size; y++)
        for (int x = 0; x < size; x++)
        {
            float v = Mathf.PerlinNoise(x * 0.05f, y * 0.05f);
            pixels[y * size + x] = new Color(v, v, v);
        }

    await Awaitable.MainThreadAsync();                   // retour obligatoire
    var tex = new Texture2D(size, size);                 // API Unity : thread principal
    tex.SetPixels(pixels);
    tex.Apply();
    return tex;
}`},
{n:`Pour du calcul massivement parallèle sur des milliers d'éléments, le Job System et Burst sont bien plus performants (voir [[jobs-burst]]). ~BackgroundThreadAsync~ convient pour une tâche ponctuelle (générer une texture, analyser un fichier).`}],
['Coroutine ou async ?',
{tab:[['','Coroutine','async / Awaitable'],['Valeur de retour','non','oui (~Awaitable<T>~)'],['Gestion des erreurs','difficile','~try / catch~ naturel'],['Arrêt avec l\'objet','automatique','avec ~destroyCancellationToken~'],['Composition','~yield return StartCoroutine(...)~','~await~ simple'],['Thread d\'arrière-plan','non','oui']]},
`Les coroutines restent simples et sûres pour les petites séquences de gameplay, et sont omniprésentes dans le code existant. ~async~ est préférable pour les chargements, le réseau, les opérations qui renvoient un résultat et le travail en arrière-plan.`,
{w:`Évite ~async void~ sauf pour un gestionnaire d'événement : l'appelant ne peut pas l'attendre, et une exception qu'elle lève est difficile à suivre. Partout ailleurs, renvoie un ~Awaitable~.`}]
],
err:[[`Oublier destroyCancellationToken`,`La méthode continue après la destruction : MissingReferenceException.`],[`Toucher à l'API Unity depuis un thread d'arrière-plan`,`Erreurs ou plantages. Reviens avec MainThreadAsync.`],[`Attendre deux fois le même Awaitable`,`Les Awaitable sont réutilisés : erreurs. Convertis en Task si besoin.`],[`async void partout`,`Impossible à attendre, erreurs difficiles à suivre.`]],
res:[`~await~ suspend la méthode sans bloquer le jeu, puis reprend au même endroit.`,`Dans Unity 6, renvoyer ~Awaitable~ ou ~Awaitable<T>~.`,`Les méthodes ~Awaitable.*Async~ remplacent les attentes des coroutines.`,`Toujours annuler avec ~destroyCancellationToken~.`,`Arrière-plan pour calculer, thread principal pour l'API Unity.`],
quiz:[
[`Que fait await pendant l'attente ?`,[`Bloque le jeu`,`Suspend la méthode et rend la main au moteur`,`Crée un nouveau thread`,`Annule la méthode`],1,`Le jeu continue ; la méthode reprend quand l'opération est terminée.`],
[`Que se passe-t-il si l'objet est détruit pendant une méthode async sans jeton d'annulation ?`,[`Elle s'arrête automatiquement`,`Elle continue et peut accéder à l'objet détruit`,`Unity plante`,`Rien`],1,`Contrairement aux coroutines, il faut annuler explicitement.`],
[`Après ~await Awaitable.BackgroundThreadAsync()~, peut-on modifier transform.position ?`,[`Oui`,`Non, il faut revenir avec MainThreadAsync`,`Seulement en build`,`Seulement dans Update`],1,`L'API Unity n'est utilisable que sur le thread principal.`],
[`Quel type de retour privilégier dans Unity 6 ?`,[`void`,`Awaitable`,`IEnumerator`,`object`],1,`Awaitable est conçu pour Unity et alloue peu.`]],
src:[[`Microsoft Learn : programmation asynchrone avec async et await`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/asynchronous-programming/`],[`Documentation Unity : introduction à Awaitable`,`https://docs.unity3d.com/Manual/async-awaitable-introduction.html`],[`Documentation Unity : Awaitable (référence)`,`https://docs.unity3d.com/ScriptReference/Awaitable.html`],[`Documentation Unity : exemples d'Awaitable`,`https://docs.unity3d.com/Manual/async-awaitable-examples.html`]]}
});

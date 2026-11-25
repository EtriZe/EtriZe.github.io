window.COURSES=Object.assign(window.COURSES||{},{
'static-instance':{
lead:`Chaque ennemi a sa propre vie, mais le nombre total d'ennemis vivants est une seule valeur pour tout le jeu. Cette distinction entre ce qui appartient à **chaque objet** et ce qui appartient à **la classe entière** est celle entre membres d'instance et membres ~static~. Ce cours explique les deux, les classes utilitaires, et un piège propre à Unity : les valeurs static qui survivent d'une partie à l'autre dans l'éditeur.`,
ch:[
['Instance et static',
`Un membre **d'instance** existe en un exemplaire par objet. Un membre **static** existe en un seul exemplaire, partagé par toute la classe, et existe même s'il n'y a aucun objet.`,
{c:`public class Enemy : MonoBehaviour
{
    public int health = 30;               // instance : chaque ennemi a la sienne
    public static int AliveCount;         // static : une seule valeur pour tous

    private void OnEnable()  => AliveCount++;
    private void OnDisable() => AliveCount--;
}

// Accès
enemy.health -= 5;                // par un objet
Debug.Log(Enemy.AliveCount);      // par la classe, sans objet`},
`Une méthode static ne peut pas utiliser directement les membres d'instance : elle n'est attachée à aucun objet, donc il n'y a pas de ~this~. Elle peut en revanche recevoir un objet en paramètre.`],
['Les classes utilitaires',
`Une ~static class~ ne contient que des membres static et ne peut pas être instanciée. C'est la forme idéale pour des **fonctions pures** regroupées par thème. ~Mathf~, ~Debug~ et ~Physics~ sont de ce type.`,
{c:`public static class MathUtils
{
    public static float Remap(float v, float inMin, float inMax, float outMin, float outMax)
    {
        float t = Mathf.InverseLerp(inMin, inMax, v);
        return Mathf.Lerp(outMin, outMax, t);
    }

    public static bool InRange(Vector3 a, Vector3 b, float r) => (a - b).sqrMagnitude <= r * r;
}

float volume = MathUtils.Remap(speed, 0f, 20f, 0.2f, 1f);`},
`Les **méthodes d'extension** sont un cas particulier : des méthodes static dont le premier paramètre est précédé de ~this~, et qui s'appellent comme si elles appartenaient au type. Voir [[generiques]].`],
['Constantes, static readonly et constructeur static',
`Pour une valeur qui ne change jamais, ~const~ (connue à la compilation) ou ~static readonly~ (calculée une fois au démarrage) évitent les nombres magiques. Un **constructeur static** s'exécute une seule fois, avant la première utilisation de la classe.`,
{c:`public static class Layers
{
    public const int Ground = 6;
    public static readonly int GroundMask = 1 << Ground;
    public static readonly Dictionary<string, int> ByName;

    static Layers()      // une seule fois
    {
        ByName = new Dictionary<string, int> { ["Ground"] = Ground };
    }
}`}],
['Le piège Unity : les static qui survivent',
`À chaque entrée en Play Mode, Unity peut **recharger tout le code C#** (« domain reload ») : les champs static repartent alors de zéro. Mais sur un gros projet, ce rechargement prend plusieurs secondes. Beaucoup d'équipes le désactivent (Project Settings > Editor > Enter Play Mode Options) pour lancer le jeu instantanément.`,
`Sans rechargement, **les static gardent leur valeur de la partie précédente**. ~Enemy.AliveCount~ commence à 12 au lieu de 0, un événement static a encore les abonnés de la partie précédente, un constructeur static ne se relance pas. Les bugs qui en résultent n'existent que dans l'éditeur, ce qui les rend très déroutants.`,
{c:`public class Enemy : MonoBehaviour
{
    public static int AliveCount;
    public static event Action AllDead;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    private static void ResetStatics()
    {
        AliveCount = 0;
        AllDead = null;      // on retire les abonnés de la partie précédente
    }
}`, t:`La remise à zéro à prévoir pour chaque static`},
{u:`~RuntimeInitializeLoadType.SubsystemRegistration~ est appelé très tôt au lancement du Play Mode, avant le chargement de la première scène. C'est le moment recommandé pour remettre les static à zéro.`}],
['Quand utiliser static, et quand l\'éviter',
`Le static est pratique parce qu'il est **accessible de partout**. C'est aussi son défaut : n'importe quel code peut le lire et le modifier, et rien dans la signature d'une méthode ne dit qu'elle en dépend.`,
{tab:[['Bon usage','À éviter'],['Fonctions pures (~MathUtils~)','État de partie (score, vie du joueur) en static'],['Constantes et tables fixes','Une dépendance cachée lue dans des dizaines de scripts'],['Compteurs et registres avec remise à zéro','Des static sans remise à zéro dans un projet sans domain reload'],['Événements globaux bien maîtrisés','Remplacer toute communication entre objets par du static']]},
`Les alternatives sont détaillées dans [[singleton]], [[service-locator]] et [[event-bus-so]]. Retiens l'idée générale : passer une référence (par l'inspecteur ou en paramètre) rend les dépendances visibles et le code testable.`]
],
err:[[`Un static qui garde la partie précédente`,`Dans l'éditeur sans domain reload. Remets-le à zéro avec ~RuntimeInitializeOnLoadMethod~.`],[`Utiliser this dans une méthode static`,`Erreur CS0026 : une méthode static n'appartient à aucun objet.`],[`Tout mettre en static « pour simplifier »`,`Les dépendances deviennent invisibles et le code intestable.`]],
res:[`Instance : un exemplaire par objet. Static : un seul pour la classe.`,`Les classes static regroupent des fonctions pures.`,`~const~ et ~static readonly~ remplacent les nombres magiques.`,`Sans domain reload, les static survivent entre deux Play Mode : prévoir une remise à zéro.`,`Préférer passer des références quand c'est possible.`],
quiz:[
[`Combien d'exemplaires d'un champ static existe-t-il avec 50 ennemis ?`,[`50`,`1`,`0`,`51`],1,`Un champ static appartient à la classe, pas aux objets.`],
[`Pourquoi un compteur static peut-il commencer à 12 au lancement du jeu dans l'éditeur ?`,[`Bug de Unity`,`Le domain reload est désactivé et la valeur de la partie précédente est restée`,`Le compteur est mal déclaré`,`À cause de la sérialisation`],1,`Sans rechargement du domaine, les static gardent leur valeur.`],
[`Quelle méthode convient le mieux à une static class ?`,[`Une fonction de calcul qui ne dépend que de ses paramètres`,`Le déplacement d'un objet précis`,`Le stockage de la vie du joueur`,`Un Update`],0,`Les fonctions pures sont le cas idéal du static.`]],
src:[[`Microsoft Learn : classes statiques et membres de classe statique`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/static-classes-and-static-class-members`],[`Documentation Unity : rechargement du domaine (Domain Reloading)`,`https://docs.unity3d.com/Manual/domain-reloading.html`],[`Documentation Unity : RuntimeInitializeOnLoadMethodAttribute`,`https://docs.unity3d.com/ScriptReference/RuntimeInitializeOnLoadMethodAttribute.html`]]},

'struct-vs-class':{
lead:`C# a deux familles de types : les **types référence** (les ~class~) et les **types valeur** (les ~struct~, les nombres, les enums). La différence paraît théorique jusqu'au jour où ~transform.position.x = 5~ refuse de compiler, où une modification « disparaît », ou où le profiler montre des allocations inexpliquées. Ce cours explique ce qui se passe en mémoire et comment choisir.`,
ch:[
['Deux façons de copier',
`Une variable de type **référence** contient l'adresse d'un objet. La copier copie l'adresse : les deux variables désignent le **même objet**. Une variable de type **valeur** contient directement ses données. La copier copie tout le contenu : deux exemplaires **indépendants**.`,
{c:`// class : copie de la référence
public class HealthC { public int hp; }
var a = new HealthC { hp = 10 };
var b = a;          // b et a désignent le même objet
b.hp = 99;
Debug.Log(a.hp);    // 99

// struct : copie du contenu
public struct HealthS { public int hp; }
var c = new HealthS { hp = 10 };
var d = c;          // d est une copie
d.hp = 99;
Debug.Log(c.hp);    // 10`, t:`Le même code, deux résultats`},
`Image utile : une class, c'est un **lien** vers un document partagé ; une struct, c'est une **photocopie**.`],
['Les types de Unity',
`Dans Unity, ~Vector2~, ~Vector3~, ~Quaternion~, ~Color~, ~Rect~, ~Bounds~, ~RaycastHit~ et ~Matrix4x4~ sont des **struct**. ~GameObject~, ~Transform~, ~Rigidbody~, tes ~MonoBehaviour~ et les ~ScriptableObject~ sont des **class**.`,
`D'où le message d'erreur que tout le monde rencontre :`,
{c:`transform.position.x = 5f;
// erreur CS1612 : impossible de modifier la valeur de retour de 'Transform.position'
// car il ne s'agit pas d'une variable`},
`~transform.position~ est une [[proprietes|propriété]] : la lire renvoie une **copie** du ~Vector3~. Modifier ~x~ sur cette copie temporaire n'aurait aucun effet, alors le compilateur l'interdit. La solution est de copier, modifier, puis réaffecter.`,
{c:`Vector3 p = transform.position;   // 1. copie
p.x = 5f;                          // 2. modification de la copie
transform.position = p;            // 3. réaffectation : le setter applique le changement

// même motif pour la vitesse d'un Rigidbody
Vector3 v = body.linearVelocity;
v.y = jumpSpeed;
body.linearVelocity = v;`}],
['Le même piège dans les listes',
`Avec une ~List~ de struct, l'indexeur renvoie aussi une copie : ~list[0].x = 5~ ne compile pas. Avec un **tableau**, en revanche, l'élément est accessible directement et la modification fonctionne.`,
{c:`var list = new List<Vector3> { Vector3.zero };
// list[0].x = 5f;        // erreur CS1612
var tmp = list[0]; tmp.x = 5f; list[0] = tmp;   // correct

var array = new Vector3[1];
array[0].x = 5f;          // correct : modifie l'élément sur place`},
{w:`Le cas le plus traître : une struct **dans une variable locale** issue d'une méthode ou d'un ~foreach~. Modifier la copie compile parfaitement et n'a aucun effet. Si une modification « disparaît », vérifie si tu travailles sur une struct.`}],
['La pile, le tas et le ramasse-miettes',
`Les objets d'une class sont créés sur le **tas** (heap) avec ~new~. Quand plus aucune référence n'y mène, le **ramasse-miettes** (GC) les récupère, ce qui prend du temps et peut faire saccader le jeu (voir [[allocations-gc]]).`,
`Une struct déclarée comme variable locale vit sur la **pile** (stack), une zone mémoire libérée automatiquement à la sortie de la méthode : aucun travail pour le GC. Une struct qui est un champ d'une class vit à l'intérieur de cet objet.`,
`C'est pour cela que les types mathématiques de Unity sont des struct : on crée des millions de ~Vector3~ par seconde (chaque ~a + b~ en crée un) sans jamais solliciter le ramasse-miettes.`,
{n:`Un tableau de struct est un bloc **continu** en mémoire : le processeur le lit très vite. Un tableau de class est un tableau d'adresses vers des objets éparpillés. Pour traiter des milliers d'éléments, les struct en tableau gagnent nettement : c'est la base de [[jobs-burst]].`}],
['Le boxing',
`Mettre une struct dans une variable de type ~object~ (ou d'une interface qu'elle implémente) oblige C# à la **mettre dans une boîte** sur le tas : c'est le boxing. Le retour s'appelle unboxing. Chaque boxing est une allocation.`,
{c:`int score = 42;
object boxed = score;          // boxing : allocation sur le tas
int back = (int)boxed;         // unboxing

// Cas cachés fréquents
string s = string.Format("{0}", score);   // score est boxé
ArrayList old = new ArrayList(); old.Add(3);   // boxing (utilise List<int>)
IComparable c = score;                    // boxing via une interface`},
`Les génériques (~List<int>~, ~Dictionary<Vector2Int, Tile>~) évitent le boxing : ils stockent vraiment des struct. Pour une struct utilisée comme clé de dictionnaire, implémenter ~IEquatable<T>~ évite le boxing lors des comparaisons.`],
['Choisir entre struct et class',
{tab:[['Choisir une struct si…','Choisir une class si…'],['le type est **petit** (quelques champs, idéalement moins de 16 octets)','le type est gros ou contient beaucoup de données'],['il représente une **valeur** (une coordonnée, une couleur, des dégâts)','il représente une **entité** avec une identité (un joueur, un inventaire)'],['il est idéalement **immuable**','il doit être modifié et partagé entre plusieurs systèmes'],['on en crée énormément et l\'on veut éviter le GC','on a besoin d\'héritage']]},
`Une struct immuable se déclare avec ~readonly struct~ : tous ses champs sont en lecture seule et le compilateur peut éviter des copies défensives.`,
{c:`public readonly struct Damage
{
    public readonly int Amount;
    public readonly DamageType Type;

    public Damage(int amount, DamageType type)
    {
        Amount = amount;
        Type = type;
    }

    public Damage Scaled(float m) => new Damage(Mathf.RoundToInt(Amount * m), Type);
}`}]
],
err:[[`transform.position.x = ...`,`CS1612. Copier, modifier, réaffecter.`],[`Une modification qui « disparaît »`,`Tu modifies une copie de struct (variable locale, foreach, retour de méthode).`],[`Une grosse struct mutable`,`Les copies coûtent cher et prêtent à confusion. Petite et immuable, ou une class.`],[`Le boxing caché`,`Struct passée en ~object~ ou interface : allocation. Préfère les génériques.`]],
res:[`Class : on copie la référence. Struct : on copie le contenu.`,`Les types mathématiques de Unity sont des struct ; ~transform.position~ renvoie une copie.`,`Les struct locales ne sollicitent pas le ramasse-miettes.`,`Le boxing (struct vers object ou interface) alloue.`,`Struct : petite valeur, idéalement immuable. Class : entité avec identité.`],
quiz:[
[`Pourquoi ~transform.position.x = 5f;~ ne compile-t-il pas ?`,[`x est privé`,`position renvoie une copie de struct, la modifier n'aurait pas d'effet`,`Il faut écrire 5.0`,`Transform est une struct`],1,`La propriété renvoie une copie temporaire du Vector3.`],
[`Après ~var b = a; b.hp = 99;~ avec a une class, que vaut a.hp ?`,[`L'ancienne valeur`,`99`,`0`,`Erreur`],1,`a et b désignent le même objet.`],
[`Lequel est un type référence ?`,[`Vector3`,`Quaternion`,`Transform`,`Color`],2,`Transform est une class ; les trois autres sont des struct.`],
[`Qu'est-ce que le boxing ?`,[`Trier une liste`,`Mettre une struct dans un object, ce qui l'alloue sur le tas`,`Une erreur de compilation`,`Convertir un float en int`],1,`Le boxing emballe une valeur dans un objet sur le tas.`]],
src:[[`Microsoft Learn : types valeur`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/value-types`],[`Microsoft Learn : types référence`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/reference-types`],[`Microsoft Learn : choisir entre class et struct`,`https://learn.microsoft.com/fr-fr/dotnet/standard/design-guidelines/choosing-between-class-and-struct`]]},

'null-securite':{
lead:`La ~NullReferenceException~ est l'erreur la plus fréquente de tout projet Unity. Ce cours explique ce qu'est ~null~, comment lire et corriger cette erreur méthodiquement, les opérateurs de C# qui aident à la gérer, et surtout le comportement très particulier des objets Unity détruits, qui fait que certains de ces opérateurs sont dangereux dans Unity.`,
ch:[
['Qu\'est-ce que null ?',
`Une variable de type référence contient une adresse. ~null~ signifie qu'elle ne désigne **aucun objet**. C'est la valeur par défaut des champs de type référence qu'on n'a pas remplis.`,
{c:`public class Turret : MonoBehaviour
{
    [SerializeField] private Transform target;   // null si rien n'est glissé dans l'inspecteur

    private void Update()
    {
        float h = target.position.y;       // NullReferenceException si target est null
    }
}`},
`Accéder à un membre (~.position~, ~.Method()~) d'une variable null lève une **NullReferenceException** : le programme ne peut pas aller chercher quelque chose à l'adresse « rien ».`,
`Les types valeur (~int~, ~float~, ~Vector3~) ne peuvent pas être null. Pour un nombre « peut-être absent », on utilise un type valeur nullable : ~int? bestScore = null;~, avec ~bestScore.HasValue~ et ~bestScore.Value~.`],
['Lire et corriger une NullReferenceException',
`Le message de la Console donne le **script** et la **ligne**. La méthode de correction est toujours la même :`,
{l:[`Double-clique sur l'erreur pour ouvrir la ligne.`,`Sur cette ligne, repère chaque point (~a.b.c~) : l'une des variables **à gauche d'un point** est null.`,`Ajoute temporairement un ~Debug.Log~ ou un point d'arrêt pour savoir laquelle.`,`Demande-toi **pourquoi** elle est null, plutôt que d'ajouter un simple ~if != null~ qui masquerait le problème.`]},
`Les causes les plus fréquentes dans Unity :`,
{tab:[['Cause','Correction'],['Référence non assignée dans l\'inspecteur','La glisser ; valider dans ~OnValidate~'],['~GetComponent~ n\'a rien trouvé','Vérifier que le composant existe ; ~[RequireComponent]~'],['Utilisée avant d\'être initialisée','Initialiser dans ~Awake~, utiliser dans ~Start~ (voir [[cycle-de-vie]])'],['L\'objet a été détruit','Vérifier ~!= null~ ; se désabonner des événements'],['~Find~ n\'a rien trouvé (nom changé)','Remplacer par une référence directe']]},
{c:`private void Awake()
{
    if (target == null)
        Debug.LogError($"{name} : aucune cible assignée", this);   // "this" rend le message cliquable
}`}],
['Les opérateurs ?. ?? et ??=',
`C# fournit des opérateurs pour écrire les tests de null de façon compacte :`,
{c:`// ?. : renvoie null au lieu de lever une exception
string n = player?.Name;              // null si player est null
onDeath?.Invoke();                    // n'appelle que s'il y a des abonnés

// ?? : valeur de repli si la gauche est null
string shown = playerName ?? "Invité";

// ??= : affecte seulement si la variable est null
cache ??= new Dictionary<int, Item>();`},
`Ces opérateurs sont excellents pour le C# ordinaire : délégués, chaînes, collections, classes qui ne dérivent pas de ~UnityEngine.Object~.`],
['Le piège : les objets Unity détruits',
`Un objet Unity (~GameObject~, composant, asset) a **deux moitiés** : un objet C# que tu manipules, et un objet natif dans le moteur en C++. ~Destroy(obj)~ détruit la moitié native, mais la moitié C# continue d'exister tant que des variables y pointent.`,
`Pour que ce soit pratique, Unity **surcharge l'opérateur ~==~** : comparer un objet détruit à null renvoie true, même s'il n'est pas vraiment null pour C#. Or ~?.~, ~??~, ~??=~ et ~is null~ **ne passent pas par cette surcharge** : ils voient un objet C# non null.`,
{c:`Destroy(enemy.gameObject);
// ... une image plus tard ...

if (enemy == null) { }        // true : la surcharge de Unity détecte la destruction
enemy?.TakeDamage(5);         // appelle la méthode ! puis MissingReferenceException
var e = enemy ?? fallback;    // garde l'objet détruit au lieu de fallback
if (enemy is null) { }        // false`, t:`Même objet détruit, résultats différents`},
{w:`Règle simple : **avec un objet Unity, utilise ~== null~, ~!= null~ ou ~if (obj)~**. Réserve ~?.~ et ~??~ aux types C# ordinaires (événements, chaînes, listes). C'est un piège reconnu par la documentation de Unity et signalé par les analyseurs de code de Rider et Visual Studio.`},
{c:`if (enemy != null) enemy.TakeDamage(5);   // correct
if (enemy) enemy.TakeDamage(5);           // correct aussi : conversion implicite en bool`}],
['Prévenir plutôt que tester partout',
`Truffer le code de ~if (x != null)~ masque les vrais problèmes : un objet qui devrait exister n'existe pas, et le jeu continue silencieusement avec un comportement faux. Mieux vaut **échouer tôt et clairement** pour ce qui est obligatoire, et tester seulement ce qui est légitimement facultatif.`,
{l:[`**Obligatoire** : vérifier une fois au démarrage (~Awake~ ou ~OnValidate~) avec un message explicite, puis utiliser sans test.`,`**Facultatif** : ~TryGetComponent~, ~TryGetValue~ : le cas « absent » est explicite.`,`**Dans l'inspecteur** : ~[RequireComponent]~ garantit qu'un composant existe ; un attribut ~[Required]~ maison signale les références vides (voir [[attributs-reflexion]]).`]},
{c:`[RequireComponent(typeof(Rigidbody))]
public class Mover : MonoBehaviour
{
    private Rigidbody body;
    private void Awake() => body = GetComponent<Rigidbody>();   // jamais null grâce à RequireComponent

    private void OnTriggerEnter(Collider other)
    {
        if (other.TryGetComponent(out Coin coin))    // facultatif : cas absent explicite
            coin.Collect();
    }
}`}]
],
err:[[`Un ?. sur un objet Unity détruit`,`La méthode est appelée quand même. Utilise ~!= null~.`],[`Ajouter if != null partout`,`Le bug est masqué. Vérifie les références obligatoires une fois, au démarrage.`],[`Utiliser une référence dans Awake avant qu'un autre objet ne l'ait remplie`,`Ordre d'initialisation : Awake pour soi, Start pour les autres.`],[`Oublier de se désabonner`,`Un objet détruit reste abonné et provoque des erreurs. Désabonnement dans ~OnDisable~.`]],
res:[`null = aucune référence ; accéder à un membre lève une NullReferenceException.`,`Méthode : la ligne, les points, la variable fautive, la cause.`,`~?.~, ~??~ et ~??=~ sont parfaits pour le C# ordinaire.`,`Pour un objet Unity, ~== null~ ou ~if (obj)~, car Unity surcharge ~==~.`,`Valider tôt ce qui est obligatoire, tester seulement le facultatif.`],
quiz:[
[`Un ennemi a été détruit. Que fait ~enemy?.Die();~ ?`,[`Rien`,`Appelle Die sur l'objet détruit`,`Lève NullReferenceException`,`Ne compile pas`],1,`?. ne voit pas la destruction : l'objet C# existe encore.`],
[`Quelle écriture est sûre pour un objet Unity ?`,[`obj?.Method()`,`obj ?? other`,`if (obj != null) obj.Method()`,`if (obj is not null)`],2,`== et != passent par la surcharge de Unity.`],
[`Sur ~a.b.c.Run()~, l'erreur NullReference peut venir de :`,[`a, b ou c`,`Run seulement`,`a seulement`,`c seulement`],0,`Toute variable à gauche d'un point peut être null.`],
[`Quelle est la meilleure réponse à une référence obligatoire vide ?`,[`if != null partout`,`Un message d'erreur clair au démarrage`,`Un try/catch`,`L'ignorer`],1,`Échouer tôt et clairement rend le problème évident.`]],
src:[[`Microsoft Learn : opérateurs ?. et ?[]`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/member-access-operators`],[`Microsoft Learn : opérateurs ?? et ??=`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/null-coalescing-operator`],[`Documentation Unity : Object.operator ==`,`https://docs.unity3d.com/ScriptReference/Object-operator_eq.html`]]},

'exceptions':{
lead:`Une exception signale qu'une opération n'a pas pu se faire : fichier introuvable, argument invalide, référence null. Savoir quand en lever, quand en attraper et quand ne surtout pas en utiliser fait partie d'un code robuste. Ce cours couvre ~try~, ~catch~, ~finally~, ~throw~, le comportement des exceptions dans Unity et l'alternative du motif ~TryXxx~.`,
ch:[
['Ce qui se passe quand une exception est levée',
`Quand une erreur survient, C# crée un objet exception et **remonte** la pile d'appels : il quitte la méthode en cours, puis celle qui l'a appelée, et ainsi de suite, jusqu'à trouver un ~catch~ capable de la traiter. S'il n'en trouve aucun, l'exception est « non gérée ».`,
{u:`Dans Unity, une exception non gérée dans ~Update~ s'affiche en rouge dans la Console avec sa pile d'appels, **le reste de la méthode est sauté pour cette image**, et le jeu continue. À l'image suivante, ~Update~ est rappelé normalement. L'objet peut donc rester dans un état à moitié modifié, et le vrai bug se manifester plus loin.`},
{c:`void Update()
{
    MoveTowardTarget();     // lève NullReferenceException si target est null
    UpdateAnimation();      // jamais exécuté tant que l'erreur se produit
}`}],
['try, catch, finally',
`~try~ entoure le code qui peut échouer. ~catch~ réagit à un type d'exception précis. ~finally~ s'exécute **dans tous les cas**, qu'il y ait eu une exception ou non : c'est l'endroit pour nettoyer.`,
{c:`public static SaveData Load(string path)
{
    try
    {
        string json = File.ReadAllText(path);
        return JsonUtility.FromJson<SaveData>(json) ?? new SaveData();
    }
    catch (FileNotFoundException)
    {
        return new SaveData();                       // première partie : normal
    }
    catch (IOException e)
    {
        Debug.LogWarning($"Lecture impossible : {e.Message}");
        return new SaveData();
    }
    finally
    {
        isLoading = false;                           // toujours exécuté
    }
}`},
`Les ~catch~ sont testés dans l'ordre : du plus précis au plus général. ~FileNotFoundException~ est une sorte d'~IOException~, elle doit donc être placée avant. Un filtre ~when~ permet d'ajouter une condition : ~catch (IOException e) when (e.Message.Contains("disk"))~.`],
['Attraper avec discernement',
{l:[`**Attrape seulement ce que tu sais traiter.** Un ~catch (Exception)~ général attrape aussi les vrais bugs (NullReference, index hors limites) et les rend invisibles.`,`**Jamais de ~catch~ vide.** Au minimum, journalise l'erreur.`,`**Attrape au bon niveau** : là où tu peux réellement faire quelque chose (proposer une nouvelle partie, réessayer), pas dans chaque petite méthode.`]},
{c:`// À ne pas faire : le bug disparaît sans laisser de trace
try { ApplyUpgrade(item); } catch { }

// Relancer en gardant l'origine
try { Parse(data); }
catch (FormatException e)
{
    Debug.LogError($"Données invalides dans {fileName}");
    throw;          // relance la même exception, pile d'appels intacte
}`},
{w:`~throw e;~ (avec la variable) réinitialise la pile d'appels : on perd l'endroit où l'erreur est née. Pour relancer, écris ~throw;~ seul.`}],
['Lever ses propres exceptions',
`On lève une exception quand une méthode reçoit des données **impossibles** ou quand son contrat est violé par l'appelant. Les types standards suffisent dans la plupart des cas :`,
{tab:[['Exception','Quand l\'utiliser'],['~ArgumentNullException~','un paramètre obligatoire vaut null'],['~ArgumentOutOfRangeException~','une valeur hors de la plage permise'],['~ArgumentException~','un argument invalide pour une autre raison'],['~InvalidOperationException~','l\'opération n\'a pas de sens dans l\'état actuel'],['~NotSupportedException~','l\'opération n\'est pas prise en charge']]},
{c:`public void SetVolume(float v)
{
    if (v < 0f || v > 1f)
        throw new ArgumentOutOfRangeException(nameof(v), v, "Le volume doit être entre 0 et 1");
    volume = v;
}`},
`~nameof(v)~ donne le nom du paramètre sous forme de texte, et reste correct si on le renomme.`],
['Exceptions ou valeurs de retour',
`Lever une exception est **lent** (de l'ordre de la microseconde, contre la nanoseconde pour un ~if~) et rend le flux du programme difficile à suivre. On les réserve donc à l'**inattendu**. Pour un cas normal du jeu (pas assez d'or, inventaire plein, clé absente), on renvoie un résultat.`,
{c:`// Le joueur n'a pas assez d'or : c'est NORMAL, pas exceptionnel
public bool TryBuy(Item item)
{
    if (gold < item.price) return false;
    gold -= item.price;
    inventory.Add(item);
    return true;
}

if (!shop.TryBuy(sword))
    ShowMessage("Pas assez d'or");`, t:`Le motif TryXxx`},
`C'est le même motif que ~int.TryParse~, ~Dictionary.TryGetValue~ et ~TryGetComponent~ (voir [[methodes-parametres]]).`],
['Les erreurs dans un jeu publié',
`Dans un build, la Console n'existe pas. Pour récupérer les erreurs des joueurs, on s'abonne à ~Application.logMessageReceived~ et on écrit les erreurs dans un fichier, ou on les envoie à un service de rapports de plantage.`,
{c:`private void OnEnable()  => Application.logMessageReceived += OnLog;
private void OnDisable() => Application.logMessageReceived -= OnLog;

private void OnLog(string message, string stackTrace, LogType type)
{
    if (type == LogType.Exception || type == LogType.Error)
        errorLog.AppendLine($"[{DateTime.Now:HH:mm:ss}] {message}\n{stackTrace}");
}`},
{n:`Unity écrit aussi automatiquement un fichier ~Player.log~ sur la machine du joueur (dans le dossier de données de l'application). C'est la première chose à demander quand un joueur signale un bug.`}]
],
err:[[`catch vide`,`L'erreur disparaît sans trace. Journalise au minimum.`],[`catch (Exception) partout`,`Masque les vrais bugs. Attrape des types précis.`],[`throw e au lieu de throw`,`La pile d'appels d'origine est perdue.`],[`Des exceptions pour la logique de jeu`,`Lent et confus. ~TryXxx~ et booléens pour les cas normaux.`]],
res:[`Une exception remonte la pile jusqu'au premier ~catch~ adapté.`,`Dans Unity, une exception saute la fin de la méthode pour cette image.`,`~finally~ nettoie dans tous les cas ; ~throw;~ relance sans perdre l'origine.`,`Lever les exceptions standards avec ~nameof~ pour les contrats violés.`,`Cas normaux : ~TryXxx~ ; erreurs des joueurs : ~logMessageReceived~ et ~Player.log~.`],
quiz:[
[`Quand le bloc finally s'exécute-t-il ?`,[`Seulement sans exception`,`Seulement avec exception`,`Dans tous les cas`,`Jamais si catch existe`],2,`finally sert au nettoyage garanti.`],
[`Que fait Unity si Update lève une exception ?`,[`Le jeu plante`,`Update n'est plus jamais appelé`,`Le reste de la méthode est sauté pour cette image, le jeu continue`,`Rien`],2,`L'erreur s'affiche et Update est rappelé à l'image suivante.`],
[`Le joueur n'a pas assez d'or pour acheter. Que faire ?`,[`Lever InvalidOperationException`,`Renvoyer false (TryBuy)`,`Un catch vide`,`Quitter le jeu`],1,`C'est un cas normal, pas une exception.`],
[`Pourquoi préférer throw; à throw e; ?`,[`C'est plus court`,`throw; garde la pile d'appels d'origine`,`throw e; ne compile pas`,`Aucune différence`],1,`throw e; réinitialise la pile d'appels.`]],
src:[[`Microsoft Learn : exceptions et gestion des exceptions`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/exceptions/`],[`Microsoft Learn : bonnes pratiques pour les exceptions`,`https://learn.microsoft.com/fr-fr/dotnet/standard/exceptions/best-practices-for-exceptions`],[`Documentation Unity : Application.logMessageReceived`,`https://docs.unity3d.com/ScriptReference/Application-logMessageReceived.html`]]},

'delegues-evenements':{
lead:`Quand le joueur meurt, la barre de vie doit se vider, un son doit jouer, l'écran de fin doit apparaître et les statistiques doivent se mettre à jour. Si le script du joueur connaît tous ces systèmes, chaque ajout le rend plus fragile. Les **délégués** et les **événements** permettent au joueur d'annoncer « je suis mort » sans savoir qui écoute. C'est l'un des outils les plus importants pour organiser un jeu.`,
ch:[
['Un délégué : une variable qui contient une méthode',
`Un délégué est un type qui représente une **méthode** avec une signature donnée. On peut le stocker dans une variable, le passer en paramètre, et l'appeler plus tard. .NET fournit des délégués génériques prêts à l'emploi :`,
{tab:[['Délégué','Signature','Exemple'],['~Action~','aucun paramètre, aucun retour','~Action onDeath~'],['~Action<T>~','un paramètre (jusqu\'à 16), aucun retour','~Action<int> onDamage~'],['~Func<TResult>~','aucun paramètre, un retour','~Func<bool> canJump~'],['~Func<T, TResult>~','paramètres, puis le type de retour en dernier','~Func<Enemy, float> score~'],['~Predicate<T>~','un paramètre, renvoie bool','~Predicate<Enemy> isAlive~']]},
{c:`Action greet = SayHello;           // on stocke la méthode (sans parenthèses)
greet();                           // on l'appelle

Func<float, float> square = x => x * x;   // une lambda (voir le cours dédié)
float s = square(3f);              // 9

void SayHello() => Debug.Log("Bonjour");`},
`Un délégué peut contenir **plusieurs méthodes** : on les ajoute avec ~+=~ et on les retire avec ~-=~. L'appel les exécute toutes, dans l'ordre d'ajout.`],
['event : protéger le délégué',
`Un délégué public peut être déclenché ou remplacé par n'importe qui (~player.OnDeath = null;~ effacerait tous les abonnés). Le mot-clé ~event~ le protège : de l'extérieur, on peut seulement **s'abonner** (~+=~) et **se désabonner** (~-=~). Seule la classe qui le déclare peut le déclencher.`,
{c:`public class Health : MonoBehaviour
{
    [SerializeField] private int max = 100;
    private int current;

    public event Action<int, int> Changed;   // (vie actuelle, vie max)
    public event Action Died;

    private void Awake() => current = max;

    public void TakeDamage(int amount)
    {
        if (current <= 0) return;
        current = Mathf.Max(0, current - amount);
        Changed?.Invoke(current, max);       // ?. : rien ne se passe s'il n'y a aucun abonné
        if (current == 0) Died?.Invoke();
    }
}`},
`~?.Invoke()~ est indispensable : un événement sans abonné vaut null, et l'appeler directement lèverait une NullReferenceException. Ici, ~?.~ est sans danger car un délégué n'est pas un objet Unity (voir [[null-securite]]).`],
['S\'abonner et se désabonner proprement',
`Les abonnés s'inscrivent quand ils deviennent actifs et se retirent quand ils ne le sont plus. Dans un MonoBehaviour, la règle est : **~+=~ dans ~OnEnable~, ~-=~ dans ~OnDisable~**.`,
{c:`public class HealthBar : MonoBehaviour
{
    [SerializeField] private Health health;
    [SerializeField] private Image fill;

    private void OnEnable()  => health.Changed += Refresh;
    private void OnDisable() => health.Changed -= Refresh;

    private void Refresh(int current, int max) => fill.fillAmount = (float)current / max;
}

public class DeathSound : MonoBehaviour
{
    [SerializeField] private Health health;
    [SerializeField] private AudioSource source;

    private void OnEnable()  => health.Died += source.Play;
    private void OnDisable() => health.Died -= source.Play;
}`, t:`Deux abonnés indépendants : Health ne connaît aucun des deux`},
{w:`Oublier de se désabonner est une source majeure de bugs. Si la barre de vie est détruite sans se désabonner, l'événement continue de l'appeler : ~MissingReferenceException~. Et si l'événement appartient à un objet qui vit plus longtemps (un static, un ScriptableObject), l'abonné ne peut plus être libéré par le ramasse-miettes : c'est une **fuite mémoire**.`}],
['Conventions et données transmises',
`Quelques conventions rendent les événements faciles à lire :`,
{l:[`Nommer l'événement d'après ce qui **s'est passé**, au passé ou en nom : ~Died~, ~HealthChanged~, ~ItemPickedUp~ (et non ~DoDie~).`,`Nommer les méthodes abonnées d'après ce qu'elles **font** ou avec le préfixe ~On~ : ~OnHealthChanged~, ~Refresh~.`,`Pour plusieurs données, passer une petite struct plutôt que cinq paramètres : ~event Action<DamageInfo> Damaged~.`]},
{c:`public readonly struct DamageInfo
{
    public readonly int Amount;
    public readonly Vector3 Point;
    public readonly GameObject Source;
    public DamageInfo(int amount, Vector3 point, GameObject source)
    { Amount = amount; Point = point; Source = source; }
}

public event Action<DamageInfo> Damaged;`}],
['event C#, UnityEvent ou ScriptableObject',
`Unity propose aussi ~UnityEvent~, un événement que l'on branche **dans l'inspecteur** (c'est ce qu'utilise le ~onClick~ des boutons).`,
{tab:[['','event C#','UnityEvent','Événement en ScriptableObject'],['Branché','dans le code','dans l\'inspecteur','dans l\'inspecteur, via un asset'],['Pour qui','programmeurs','designers','systèmes qui ne se connaissent pas'],['Performance','la plus rapide','un peu plus lente','comme un event C#'],['Lisibilité','visible dans le code','liens invisibles en lisant le code','flux visible via les assets']]},
{c:`public class Door : MonoBehaviour
{
    [SerializeField] private UnityEvent opened;   // branché par un designer dans l'inspecteur
    public void Open() { /* ... */ opened.Invoke(); }
}`},
`Les événements portés par des assets sont détaillés dans [[event-bus-so]]. Un projet combine souvent les trois ; ce qui compte est la cohérence au sein de chaque système.`],
['Les pièges avancés',
{l:[`**Une exception chez un abonné arrête les suivants** : si le premier abonné lève une exception, les autres ne sont pas appelés.`,`**L'ordre d'appel** suit l'ordre d'abonnement ; ne construis pas de logique qui en dépend.`,`**Se désabonner d'une lambda** : ~Died -= () => Debug.Log("x");~ ne retire rien, car c'est une nouvelle lambda. Garde-la dans une variable ou utilise une méthode nommée (voir [[lambdas-closures]]).`,`**Les événements static** doivent être vidés au lancement du jeu (voir [[static-instance]]).`]},
{c:`// Appeler chaque abonné séparément pour qu'une erreur ne bloque pas les autres
public static void SafeInvoke(Action evt)
{
    if (evt == null) return;
    foreach (Action a in evt.GetInvocationList())
    {
        try { a(); }
        catch (Exception e) { Debug.LogException(e); }
    }
}`}]
],
err:[[`Déclencher sans ?.`,`NullReferenceException quand personne n'écoute.`],[`Oublier -= dans OnDisable`,`MissingReferenceException ou fuite mémoire.`],[`Se désabonner d'une nouvelle lambda`,`Rien n'est retiré. Utilise une méthode nommée.`],[`Délégué public sans event`,`N'importe qui peut le déclencher ou l'effacer.`]],
res:[`Un délégué contient une ou plusieurs méthodes : ~Action~, ~Func~.`,`~event~ : les autres s'abonnent, seul le propriétaire déclenche.`,`Déclencher avec ~?.Invoke()~.`,`~+=~ dans OnEnable, ~-=~ dans OnDisable.`,`event C# pour le code, UnityEvent pour les designers, ScriptableObject pour relier des systèmes.`],
quiz:[
[`Que permet event par rapport à un délégué public ?`,[`Plus de performance`,`Empêcher les autres classes de le déclencher ou de l'écraser`,`Avoir plusieurs abonnés`,`Rien`],1,`De l'extérieur, on ne peut que s'abonner et se désabonner.`],
[`Où se désabonner dans un MonoBehaviour ?`,[`Dans Update`,`Dans OnDisable`,`Dans Start`,`Jamais`],1,`On se désabonne quand l'objet n'est plus actif, symétriquement à OnEnable.`],
[`Quel délégué correspond à une méthode qui prend un Enemy et renvoie un float ?`,[`Action<Enemy, float>`,`Func<Enemy, float>`,`Func<float, Enemy>`,`Predicate<Enemy>`],1,`Avec Func, le type de retour est le dernier.`],
[`Pourquoi ~Died -= () => Log();~ ne retire-t-il rien ?`,[`Erreur de syntaxe`,`C'est une nouvelle lambda, différente de celle abonnée`,`Died est null`,`-= ne marche pas avec event`],1,`Chaque lambda écrite crée un délégué distinct.`]],
src:[[`Microsoft Learn : délégués`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/delegates/`],[`Microsoft Learn : événements`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/events/`],[`Documentation Unity : UnityEvent`,`https://docs.unity3d.com/ScriptReference/Events.UnityEvent.html`]]},

'lambdas-closures':{
lead:`Les lambdas permettent d'écrire une petite fonction directement là où on en a besoin : un critère de tri, la réaction à un clic, un filtre LINQ. Elles rendent le code concis, mais elles ont une mécanique cachée, la **capture**, qui explique un bug classique avec les boucles et des allocations invisibles. Ce cours détaille les deux.`,
ch:[
['Écrire une lambda',
`Une lambda s'écrit ~(paramètres) => expression~. Le type des paramètres est généralement déduit du contexte (le délégué attendu).`,
{c:`Func<int, int> doubleIt = x => x * 2;               // un paramètre : parenthèses facultatives
Func<int, int, int> add = (a, b) => a + b;           // plusieurs paramètres
Action hello = () => Debug.Log("Bonjour");          // aucun paramètre
Func<Enemy, bool> isWeak = e => e.health < 10;

// Corps sur plusieurs lignes : accolades et return
Func<Vector3, Vector3> flatten = v =>
{
    v.y = 0f;
    return v.normalized;
};`},
`On les utilise surtout comme **arguments** d'autres méthodes :`,
{c:`enemies.Sort((a, b) => a.health.CompareTo(b.health));
var weak = enemies.Where(e => e.health < 10).ToList();      // LINQ
button.onClick.AddListener(() => OpenMenu("options"));
int index = items.FindIndex(i => i.id == wantedId);`}],
['La capture de variables',
`Une lambda peut utiliser les variables **autour d'elle** : paramètres, variables locales, champs. On dit qu'elle les **capture** (on parle de « closure », fermeture).`,
{c:`Func<float, float> MakeMultiplier(float factor)
{
    return x => x * factor;     // factor est capturé
}

var triple = MakeMultiplier(3f);
Debug.Log(triple(2f));          // 6 : factor vit encore après la fin de MakeMultiplier`},
`Pour que cela marche, le compilateur transforme la variable capturée en **champ d'une petite classe cachée**, et la lambda en méthode de cette classe. La variable vit donc aussi longtemps que la lambda. Point important : la lambda capture la **variable elle-même**, pas sa valeur au moment de la création.`,
{c:`int counter = 0;
Action increment = () => counter++;
increment();
increment();
Debug.Log(counter);   // 2 : la lambda modifie la vraie variable`}],
['Le piège de la boucle for',
`Comme la lambda capture la variable et non sa valeur, toutes les lambdas créées dans une boucle ~for~ partagent **la même** variable ~i~. Quand on les appelle plus tard, ~i~ a sa valeur finale.`,
{c:`for (int i = 0; i < buttons.Length; i++)
{
    buttons[i].onClick.AddListener(() => SelectSlot(i));
}
// Chaque bouton appelle SelectSlot(buttons.Length) : i vaut sa valeur finale !`, t:`Le bug`},
{c:`for (int i = 0; i < buttons.Length; i++)
{
    int index = i;      // une nouvelle variable à chaque tour
    buttons[i].onClick.AddListener(() => SelectSlot(index));
}`, t:`La correction : une copie locale par tour`},
{n:`~foreach~ n'a pas ce problème depuis C# 5 : sa variable est recréée à chaque tour. Le piège ne concerne que ~for~ et ~while~.`}],
['Le coût des captures',
`Une lambda **qui capture** alloue un objet sur le tas à chaque fois que le code qui la crée s'exécute. Dans une méthode appelée une fois, c'est négligeable. Dans ~Update~, cela fait une allocation par image, et le ramasse-miettes finit par se déclencher (voir [[allocations-gc]]).`,
{c:`void Update()
{
    float range = detectionRange;
    // capture range et this : une allocation à CHAQUE image
    var near = enemies.Where(e => Vector3.Distance(e.transform.position, transform.position) < range);
}`},
`Une lambda qui **ne capture rien** est mise en cache par le compilateur et n'alloue qu'une fois. Depuis C# 9, le mot-clé ~static~ devant une lambda interdit toute capture : le compilateur refuse si elle utilise une variable extérieure, ce qui garantit l'absence d'allocation.`,
{c:`Func<int, int> sq = static x => x * x;    // garantie sans capture
// Func<int, int> bad = static x => x * factor;   // erreur : capture interdite`}],
['Lambdas et événements',
`Pour **se désabonner** d'un événement, il faut passer exactement le même délégué que lors de l'abonnement. Une nouvelle lambda, même identique en apparence, est un délégué différent.`,
{c:`// Ne fonctionne pas : on retire une lambda qui n'a jamais été ajoutée
health.Died += () => Debug.Log("mort");
health.Died -= () => Debug.Log("mort");

// Fonctionne : on garde la référence
private Action onDied;
private void OnEnable()
{
    onDied = () => Debug.Log("mort");
    health.Died += onDied;
}
private void OnDisable() => health.Died -= onDied;`},
`Dans la plupart des cas, une **méthode nommée** est plus simple et plus lisible pour un abonnement durable. Garde les lambdas pour les réactions courtes et ponctuelles.`],
['Quand préférer une méthode nommée',
{l:[`La lambda fait **plus de deux ou trois lignes**.`,`Elle est utilisée à **plusieurs endroits**.`,`On doit pouvoir s'en **désabonner**.`,`On veut la voir clairement nommée dans la **pile d'appels** quand une erreur survient.`]},
`Une méthode nommée documente l'intention par son nom : ~enemies.Where(IsInRange)~ se lit mieux qu'une longue lambda.`]
],
err:[[`Capturer i dans une boucle for`,`Toutes les lambdas voient la dernière valeur. Copie locale par tour.`],[`Une lambda capturante dans Update`,`Une allocation par image. Méthode nommée ou lambda static.`],[`Se désabonner d'une nouvelle lambda`,`Rien n'est retiré. Garde la référence.`]],
res:[`~(paramètres) => expression~ : une fonction écrite sur place.`,`Une lambda capture les variables, pas leurs valeurs.`,`Boucle for : copier la variable dans une locale avant de la capturer.`,`Une capture alloue ; ~static~ garantit l'absence de capture.`,`Méthode nommée pour les abonnements durables et le code long.`],
quiz:[
[`Après ~int c = 0; Action a = () => c++; a(); a();~, que vaut c ?`,[`0`,`1`,`2`,`Erreur`],2,`La lambda capture et modifie la vraie variable.`],
[`Pourquoi des boutons créés dans un for appellent-ils tous le même indice ?`,[`Bug de Unity`,`Ils capturent la même variable i`,`AddListener écrase le précédent`,`Les boutons sont identiques`],1,`Copier i dans une variable locale à chaque tour corrige le problème.`],
[`Que garantit ~static x => x * 2~ ?`,[`Plus de vitesse de calcul`,`Aucune capture de variable extérieure`,`Un résultat static`,`Rien`],1,`Le compilateur refuse toute capture.`]],
src:[[`Microsoft Learn : expressions lambda`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/lambda-expressions`],[`Microsoft Learn : délégués Func et Action`,`https://learn.microsoft.com/fr-fr/dotnet/standard/delegates-lambdas`]]},

'linq':{
lead:`LINQ (Language Integrated Query) ajoute à toutes les collections des méthodes pour filtrer, transformer, trier, regrouper et interroger des données en une chaîne lisible. C'est un outil formidable pour les outils d'éditeur et le code peu fréquent, et un piège de performance dans la boucle de jeu. Ce cours présente les opérateurs essentiels, l'exécution différée et les bons usages dans Unity.`,
ch:[
['Le principe',
`LINQ s'ajoute avec ~using System.Linq;~. Chaque opérateur prend une collection et renvoie une nouvelle séquence, ce qui permet de les **enchaîner** comme une phrase.`,
{c:`using System.Linq;

var names = enemies
    .Where(e => e.IsAlive)              // filtrer
    .OrderBy(e => e.health)             // trier
    .Select(e => e.name)                // transformer
    .Take(3)                            // garder les 3 premiers
    .ToList();                          // exécuter et stocker`, t:`Les noms des 3 ennemis vivants les plus faibles`},
`Sans LINQ, la même chose demande une boucle, une liste temporaire, un tri avec comparateur et une seconde boucle. LINQ exprime **ce qu'on veut** plutôt que **comment le faire**.`],
['Les opérateurs essentiels',
{tab:[['Opérateur','Rôle','Exemple'],['~Where~','filtrer','~.Where(e => e.IsAlive)~'],['~Select~','transformer chaque élément','~.Select(e => e.transform.position)~'],['~OrderBy~ / ~OrderByDescending~','trier','~.OrderByDescending(s => s.points)~'],['~ThenBy~','critère de tri secondaire','~.ThenBy(s => s.time)~'],['~First~ / ~FirstOrDefault~','le premier (qui vérifie une condition)','~.FirstOrDefault(i => i.id == id)~'],['~Any~ / ~All~','au moins un / tous','~.Any(e => e.IsBoss)~'],['~Count~ / ~Sum~ / ~Average~ / ~Max~','agréger','~.Sum(i => i.weight)~'],['~GroupBy~','regrouper','~.GroupBy(w => w.rarity)~'],['~Distinct~','retirer les doublons','~.Select(i => i.type).Distinct()~'],['~ToList~ / ~ToArray~ / ~ToDictionary~','matérialiser','~.ToDictionary(i => i.id)~']]},
{c:`// Poids total de l'inventaire
float weight = items.Sum(i => i.weight);

// Y a-t-il un boss vivant ?
bool bossAlive = enemies.Any(e => e.IsBoss && e.IsAlive);

// Nombre d'armes par rareté
var byRarity = weapons
    .GroupBy(w => w.rarity)
    .ToDictionary(g => g.Key, g => g.Count());

// Retrouver un objet par identifiant
Item found = items.FirstOrDefault(i => i.id == "potion");   // null si absent`},
{w:`~First~ lève une exception si aucun élément ne correspond ; ~FirstOrDefault~ renvoie la valeur par défaut (null pour une class, 0 pour un int). Choisis selon que l'absence est une erreur ou un cas normal.`}],
['L\'exécution différée',
`Une requête LINQ **ne s'exécute pas** quand on l'écrit. Elle décrit un calcul, qui ne se fait qu'au moment où l'on parcourt le résultat (~foreach~, ~ToList~, ~Count~, ~First~…).`,
{c:`var alive = enemies.Where(e => e.IsAlive);   // rien n'est calculé ici

enemies[0].Kill();
Debug.Log(alive.Count());   // calculé MAINTENANT : tient compte du Kill
Debug.Log(alive.Count());   // et RE-calculé une seconde fois`},
`Deux conséquences pratiques : le résultat reflète l'état **au moment du parcours**, et parcourir deux fois **refait tout le calcul**. Si la requête est coûteuse ou utilisée plusieurs fois, matérialise-la une fois avec ~ToList()~.`,
`Ce mécanisme repose sur les itérateurs et ~yield return~, expliqués dans [[iterateurs-yield]].`],
['LINQ et performance dans Unity',
`Chaque opérateur LINQ crée de petits objets (énumérateurs, délégués, et les lambdas qui capturent). Dans un outil d'éditeur ou une méthode appelée de temps en temps, c'est négligeable et LINQ rend le code bien plus lisible. Dans ~Update~, sur des centaines d'objets, ces allocations s'accumulent à chaque image (voir [[allocations-gc]]).`,
{c:`// Dans Update : à éviter
Enemy closest = enemies.OrderBy(e => (e.transform.position - pos).sqrMagnitude).First();

// Équivalent sans allocation et plus rapide (un passage au lieu d'un tri complet)
Enemy closest = null;
float best = float.MaxValue;
foreach (Enemy e in enemies)
{
    float d = (e.transform.position - pos).sqrMagnitude;
    if (d < best) { best = d; closest = e; }
}`},
`Attention aussi à l'**algorithme caché** : ~OrderBy(...).First()~ trie toute la liste (O(n log n)) pour garder un seul élément, alors qu'une boucle fait un seul passage (O(n)). Voir [[complexite]].`],
['Le terrain idéal : les outils',
`Dans les outils d'éditeur et les scripts de build, la lisibilité compte plus que quelques allocations. LINQ y est excellent.`,
{c:`// Toutes les scènes activées du build
string[] scenes = EditorBuildSettings.scenes
    .Where(s => s.enabled)
    .Select(s => s.path)
    .ToArray();

// Les 10 plus grosses textures du projet
var biggest = AssetDatabase.FindAssets("t:Texture2D")
    .Select(AssetDatabase.GUIDToAssetPath)
    .Select(path => (path, size: new FileInfo(path).Length))
    .OrderByDescending(t => t.size)
    .Take(10);`},
`Voir [[editor-window]] et [[build-ligne-commande]] pour des outils complets.`],
['Bien écrire une requête',
{l:[`Une étape par ligne, alignées : la requête se lit de haut en bas.`,`Au-delà de 5 ou 6 étapes, découpe en variables intermédiaires bien nommées.`,`Filtre (~Where~) **avant** de trier ou transformer : on traite moins d'éléments.`,`Pour un critère complexe, une méthode nommée : ~.Where(IsValidTarget)~.`]}]
],
err:[[`LINQ dans Update sur beaucoup d'objets`,`Allocations à chaque image. Boucle classique.`],[`OrderBy().First() pour un minimum`,`Trie tout pour un seul élément. Boucle en un passage.`],[`Parcourir deux fois une requête coûteuse`,`Elle est recalculée. ~ToList()~ une fois.`],[`First sur un résultat qui peut être vide`,`InvalidOperationException. ~FirstOrDefault~ si l'absence est normale.`]],
res:[`LINQ enchaîne Where, Select, OrderBy, First, Any, GroupBy…`,`Exécution différée : rien n'est calculé avant le parcours.`,`Parfait dans les outils et le code peu fréquent.`,`À éviter dans le code appelé chaque image.`,`Filtrer tôt, découper les longues requêtes.`],
quiz:[
[`Quand une requête ~list.Where(...)~ est-elle exécutée ?`,[`À l'écriture`,`Au moment où l'on parcourt le résultat`,`À la compilation`,`Jamais`],1,`C'est l'exécution différée.`],
[`Que renvoie FirstOrDefault sur une liste d'objets vide ?`,[`Une exception`,`null`,`Le premier objet`,`0`],1,`La valeur par défaut d'un type référence est null.`],
[`Pourquoi éviter LINQ dans Update ?`,[`Il ne marche pas dans Unity`,`Il alloue à chaque image et alimente le ramasse-miettes`,`Il est interdit`,`Il est imprécis`],1,`Les énumérateurs et lambdas créés à chaque appel s'accumulent.`],
[`Quel opérateur pour savoir s'il existe au moins un boss ?`,[`All`,`Any`,`Select`,`Count == 1`],1,`Any s'arrête dès qu'il trouve un élément qui correspond.`]],
src:[[`Microsoft Learn : LINQ (Language Integrated Query)`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/linq/`],[`Microsoft Learn : opérateurs de requête standard`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/linq/standard-query-operators/`],[`Documentation Unity : bonnes pratiques du ramasse-miettes`,`https://docs.unity3d.com/Manual/performance-garbage-collection-best-practices.html`]]}
});

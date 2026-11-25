window.LESSONS=(window.LESSONS||[]).concat([
{id:'classes-objets',cat:'poo',lvl:1,title:'Classes et objets',sum:'Le plan et la maison : ce qu\'est une classe, un objet, un constructeur.',
body:[
['L\'idée',`Une **classe** est un plan : elle décrit des données (champs) et des comportements (méthodes). Un **objet** est une maison construite d'après ce plan, avec ses propres valeurs. ~new Inventory()~ construit un objet ; on peut en construire autant qu'on veut.`],
['Le constructeur',`Méthode spéciale, du même nom que la classe, appelée par ~new~. Elle met l'objet dans un état valide dès sa naissance. ~readonly~ sur un champ interdit de le changer après le constructeur.`,`public class Wallet
{
    public readonly string Currency;
    public int Amount { get; private set; }

    public Wallet(string currency, int start = 0)
    {
        Currency = currency;
        Amount = start;
    }
}`],
['Encapsulation',`Garde les champs ~private~ et expose seulement ce qui doit l'être, via des méthodes et des [[proprietes]]. Ainsi la classe garantit ses règles (l'or ne devient jamais négatif) au lieu de compter sur la discipline de chaque appelant.`],
['MonoBehaviour est à part',`On ne fait jamais ~new~ sur un ~MonoBehaviour~ : Unity le crée avec ~AddComponent~ ou ~Instantiate~, et on remplace le constructeur par [[cycle-de-vie|Awake]]. Les classes C# ordinaires (données, logique pure) se construisent normalement et sont plus faciles à tester. Voir [[tests-unitaires]].`]],
ex:`Écris une classe C# ordinaire ~Timer~ : un constructeur qui prend une durée, une méthode ~Tick(float dt)~ qui renvoie true au moment où le temps est écoulé (une seule fois), une propriété ~Progress~ entre 0 et 1 et une méthode ~Reset()~.`,
hint:`Garde le temps écoulé dans un champ privé et un bool pour ne signaler la fin qu'une fois.`,
sol:`public class Timer
{
    public float Duration { get; }
    private float elapsed;
    private bool finished;

    public Timer(float duration)
    {
        if (duration <= 0f) throw new ArgumentOutOfRangeException(nameof(duration));
        Duration = duration;
    }

    public float Progress => Mathf.Clamp01(elapsed / Duration);

    public bool Tick(float dt)
    {
        if (finished) return false;
        elapsed += dt;
        if (elapsed < Duration) return false;
        finished = true;
        return true;
    }

    public void Reset()
    {
        elapsed = 0f;
        finished = false;
    }
}`},

{id:'heritage-polymorphisme',cat:'poo',lvl:2,title:'Héritage et polymorphisme',sum:'abstract, virtual, override : partager du code et laisser chaque type réagir à sa façon.',
body:[
['L\'idée',`Une classe peut **hériter** d'une autre : elle reprend ses champs et méthodes et peut en ajouter. ~class Goblin : Enemy~. Le **polymorphisme** permet de manipuler un ~Goblin~ comme un ~Enemy~ et d'obtenir quand même son comportement à lui.`],
['virtual, override, abstract',`~virtual~ dit « les classes filles peuvent remplacer cette méthode ». ~override~ la remplace. ~abstract~ oblige les filles à l'écrire, et la classe abstraite ne peut pas être instanciée. ~base.Method()~ appelle la version parente.`,`public abstract class Enemy : MonoBehaviour
{
    public abstract void Attack(Transform target);
    public virtual void Die() => Destroy(gameObject);
}

public class Bomber : Enemy
{
    public override void Attack(Transform t) { /* lancer une bombe */ }
    public override void Die() { Explode(); base.Die(); }
}`],
['Le piège des méthodes Unity',`Si la classe parente a un ~private void Awake()~, une fille qui écrit aussi ~Awake~ **remplace silencieusement** celle du parent. Rends-la ~protected virtual~ et appelle ~base.Awake()~ dans la fille.`],
['Avec modération',`Les hiérarchies profondes (~Enemy > FlyingEnemy > FlyingShootingEnemy~) deviennent vite rigides : où ranger un ennemi qui vole et nage ? Dans Unity, on préfère souvent assembler des composants. Voir [[composition]] et [[interfaces]].`]],
ex:`Écris une classe abstraite ~Pickup~ (MonoBehaviour) avec un ~OnTriggerEnter~ qui, si l'objet entrant a un ~Player~, appelle une méthode abstraite ~Apply(Player p)~ puis une méthode virtuelle ~Consume()~ qui détruit l'objet. Puis ~HealthPickup~ et ~MagnetPickup~ (qui ne se détruit pas, il se désactive 10 s).`,
hint:`OnTriggerEnter vit dans la classe abstraite. MagnetPickup override Consume et lance une coroutine de réapparition.`,
sol:`public abstract class Pickup : MonoBehaviour
{
    private void OnTriggerEnter(Collider other)
    {
        if (!other.TryGetComponent(out Player p)) return;
        Apply(p);
        Consume();
    }

    protected abstract void Apply(Player p);
    protected virtual void Consume() => Destroy(gameObject);
}

public class HealthPickup : Pickup
{
    [SerializeField] private int amount = 25;
    protected override void Apply(Player p) => p.Heal(amount);
}

public class MagnetPickup : Pickup
{
    [SerializeField] private float respawnDelay = 10f;

    protected override void Apply(Player p) => p.EnableMagnet(5f);

    protected override void Consume()
    {
        // On ne détruit pas : on cache le visuel et le collider, puis on réapparaît.
        SetVisible(false);
        StartCoroutine(Respawn());
    }

    private IEnumerator Respawn()
    {
        yield return new WaitForSeconds(respawnDelay);
        SetVisible(true);
    }

    private void SetVisible(bool on)
    {
        GetComponent<Collider>().enabled = on;
        foreach (var r in GetComponentsInChildren<Renderer>()) r.enabled = on;
    }
}`},

{id:'interfaces',cat:'poo',lvl:2,title:'Interfaces',sum:'Un contrat : « je sais faire ça ». Faire interagir des objets sans connaître leur type exact.',
body:[
['L\'idée',`Une interface liste des méthodes et propriétés sans les écrire : ~interface IDamageable { void TakeDamage(int amount); }~. Une classe qui l'implémente **promet** de savoir le faire. Un tonneau, un ennemi et un mur destructible n'ont rien en commun, sauf qu'on peut les abîmer.`],
['Plusieurs à la fois',`Une classe n'hérite que d'une seule classe, mais peut implémenter autant d'interfaces qu'on veut : ~class Barrel : MonoBehaviour, IDamageable, IInteractable~. C'est ce qui les rend plus souples que l'[[heritage-polymorphisme|héritage]].`],
['Avec GetComponent',`~GetComponent~ et ~TryGetComponent~ acceptent une interface. Une balle n'a pas besoin de connaître tous les types de cibles du jeu.`,`if (hit.collider.TryGetComponent(out IDamageable target))
    target.TakeDamage(damage);`],
['Limite dans l\'inspecteur',`Unity ne sait pas afficher un champ de type interface. Contournements : un champ de type ~MonoBehaviour~ vérifié dans ~OnValidate~, ou ~[SerializeReference]~ pour des classes C# ordinaires (voir [[serialisation]]).`],
['Le terrain des patterns',`Les interfaces sont à la base des patterns [[strategy]], [[command-undo]] et [[service-locator]].`]],
ex:`Définis ~IInteractable~ avec une propriété ~string Prompt~ et une méthode ~void Interact(GameObject who)~. Écris ~Door~ et ~Chest~ qui l'implémentent, puis un ~Interactor~ qui lance un raycast devant la caméra, affiche le Prompt de ce qu'il vise et appelle Interact à l'appui de E.`,
hint:`Raycast depuis la caméra, TryGetComponent<IInteractable>, puis Input.GetKeyDown(KeyCode.E).`,
sol:`public interface IInteractable
{
    string Prompt { get; }
    void Interact(GameObject who);
}

public class Door : MonoBehaviour, IInteractable
{
    private bool open;
    public string Prompt => open ? "Fermer" : "Ouvrir";
    public void Interact(GameObject who)
    {
        open = !open;
        transform.localRotation = Quaternion.Euler(0f, open ? 90f : 0f, 0f);
    }
}

public class Chest : MonoBehaviour, IInteractable
{
    [SerializeField] private int gold = 50;
    public string Prompt => gold > 0 ? "Fouiller" : "Vide";
    public void Interact(GameObject who)
    {
        if (gold == 0 || !who.TryGetComponent(out Player p)) return;
        p.AddGold(gold);
        gold = 0;
    }
}

public class Interactor : MonoBehaviour
{
    [SerializeField] private Camera cam;
    [SerializeField] private float reach = 2.5f;
    [SerializeField] private TMP_Text promptLabel;

    private void Update()
    {
        IInteractable target = null;
        var ray = new Ray(cam.transform.position, cam.transform.forward);
        if (Physics.Raycast(ray, out RaycastHit hit, reach))
            hit.collider.TryGetComponent(out target);

        promptLabel.text = target != null ? target.Prompt : "";
        if (target != null && Input.GetKeyDown(KeyCode.E))
            target.Interact(gameObject);
    }
}`},

{id:'composition',cat:'poo',lvl:2,title:'Composition plutôt qu\'héritage',sum:'Construire des comportements en assemblant de petits composants, comme Unity le fait lui-même.',
body:[
['L\'idée',`Au lieu d'une classe ~FlyingShootingEnemy~, on assemble des composants : ~Health~, ~Flyer~, ~Shooter~. Un ennemi qui vole et tire a les deux, une tourelle n'a que ~Shooter~ et ~Health~. On combine librement, sans réécrire de hiérarchie. C'est la philosophie même des GameObjects.`],
['Un composant, une responsabilité',`Un bon composant fait une chose et peut vivre seul : ~Health~ ne sait rien de l'IA, ~Shooter~ ne sait rien de la vie. Ils communiquent par [[delegues-evenements|événements]] ou par [[interfaces]] plutôt qu'en se connaissant directement.`],
['Les dépendances',`Quand un composant en a vraiment besoin d'un autre, ~[RequireComponent(typeof(Health))]~ le garantit, et la référence se récupère dans ~Awake~. Pour un composant facultatif, ~TryGetComponent~ suffit.`],
['Les données à part',`Les réglages partagés (vitesse, cadence, dégâts) vont dans des [[scriptableobjects]] : on compose aussi les données. Changer d'arme revient à changer un asset.`]],
ex:`Découpe ce « tout-en-un » : un ennemi qui a de la vie, tire sur le joueur à portée et laisse tomber de l'or à sa mort. Écris ~Health~ (avec un événement Died), ~Shooter~ (tire vers une cible à portée) et ~LootDropper~ (écoute Died et fait apparaître un prefab). Aucun ne doit connaître les deux autres, sauf LootDropper qui écoute Health.`,
hint:`LootDropper a [RequireComponent(typeof(Health))] et s'abonne dans OnEnable. Shooter a une cible et un délai entre les tirs.`,
sol:`public class Health : MonoBehaviour
{
    [SerializeField] private int max = 30;
    private int current;
    public event Action Died;

    private void Awake() => current = max;

    public void TakeDamage(int amount)
    {
        if (current <= 0) return;
        current -= amount;
        if (current <= 0) { Died?.Invoke(); Destroy(gameObject); }
    }
}

public class Shooter : MonoBehaviour
{
    [SerializeField] private Transform target;
    [SerializeField] private Projectile prefab;
    [SerializeField] private float range = 12f, cooldown = 1f;
    private float nextShot;

    private void Update()
    {
        if (target == null || Time.time < nextShot) return;
        Vector3 to = target.position - transform.position;
        if (to.sqrMagnitude > range * range) return;

        nextShot = Time.time + cooldown;
        Instantiate(prefab, transform.position, Quaternion.LookRotation(to));
    }
}

[RequireComponent(typeof(Health))]
public class LootDropper : MonoBehaviour
{
    [SerializeField] private GameObject coinPrefab;
    [SerializeField] private int count = 3;
    private Health health;

    private void Awake() => health = GetComponent<Health>();
    private void OnEnable() => health.Died += Drop;
    private void OnDisable() => health.Died -= Drop;

    private void Drop()
    {
        for (int i = 0; i < count; i++)
        {
            Vector2 offset = UnityEngine.Random.insideUnitCircle;
            Instantiate(coinPrefab, transform.position + new Vector3(offset.x, 0.5f, offset.y), Quaternion.identity);
        }
    }
}`},

{id:'singleton',cat:'poo',lvl:2,title:'Singleton',sum:'Une seule instance accessible partout. Pratique, et pourquoi il faut s\'en méfier.',
body:[
['L\'idée',`Un singleton garantit qu'il n'existe qu'**une** instance d'une classe et la rend accessible partout : ~AudioManager.Instance.Play(clip)~. C'est le pattern le plus utilisé dans les projets Unity, souvent trop.`],
['La version Unity',`On garde l'instance dans un champ static, on la remplit dans ~Awake~ et on détruit les doublons. ~DontDestroyOnLoad~ la fait survivre aux changements de scène.`],
['Les défauts',`Dépendance cachée : n'importe quel script peut l'appeler, on ne voit plus qui dépend de quoi. Ordre d'initialisation : appeler ~Instance~ dans un ~Awake~ peut trouver null. Tests difficiles : on ne peut pas le remplacer par une version factice. Et les [[static-instance|static]] qui survivent entre deux Play Mode.`],
['Les alternatives',`Passer la référence dans l'inspecteur, un [[service-locator]], ou un [[event-bus-so|événement porté par un ScriptableObject]]. Un singleton reste raisonnable pour un vrai service global sans état de jeu (audio, journalisation).`]],
ex:`Écris un ~AudioManager~ singleton propre : instance unique, doublons détruits, survie entre les scènes, instance remise à zéro au lancement du Play Mode, et une méthode ~PlaySfx(AudioClip clip)~.`,
hint:`Awake : si Instance existe et n'est pas this, Destroy(gameObject). ResetStatics avec RuntimeInitializeOnLoadMethod.`,
sol:`public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance { get; private set; }

    [SerializeField] private AudioSource sfxSource;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    private static void ResetStatics() => Instance = null;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);   // un autre existe déjà
            return;
        }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    private void OnDestroy()
    {
        if (Instance == this) Instance = null;
    }

    public void PlaySfx(AudioClip clip)
    {
        if (clip != null) sfxSource.PlayOneShot(clip);
    }
}`},

{id:'service-locator',cat:'poo',lvl:3,title:'Service locator',sum:'Un registre central de services interchangeables, plus souple qu\'une série de singletons.',
body:[
['L\'idée',`Au lieu de dix singletons, un seul registre : ~Services.Register<IAudio>(audio)~ au démarrage, ~Services.Get<IAudio>()~ ailleurs. Le code dépend d'une [[interfaces|interface]], pas d'une classe précise.`],
['Pourquoi c\'est mieux qu\'un singleton',`On peut enregistrer une autre implémentation : un ~SilentAudio~ pour les tests, un ~ConsoleAnalytics~ en développement et un vrai service en production. Le reste du code ne change pas.`],
['Les limites',`Les dépendances restent cachées (on ne les voit pas dans la signature), et un service non enregistré n'est découvert qu'à l'exécution. L'injection de dépendances (passer les services en paramètre) est plus explicite ; le locator est un bon compromis dans Unity.`],
['Bonnes pratiques',`Enregistrer tôt (un ~Bootstrap~ dans la première scène, ou ~RuntimeInitializeOnLoadMethod~), vider le registre au lancement du Play Mode (voir [[static-instance]]), et lever une erreur claire si un service manque.`]],
ex:`Écris une classe static ~Services~ avec ~Register<T>(T service)~, ~T Get<T>()~ (erreur explicite si absent), ~bool TryGet<T>(out T s)~ et une remise à zéro au lancement du jeu. Montre en commentaire l'enregistrement d'un ~IAudio~.`,
hint:`Un Dictionary<Type, object> ; typeof(T) comme clé.`,
sol:`public static class Services
{
    private static readonly Dictionary<Type, object> map = new Dictionary<Type, object>();

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    private static void Reset() => map.Clear();

    public static void Register<T>(T service) where T : class
    {
        map[typeof(T)] = service ?? throw new ArgumentNullException(nameof(service));
    }

    public static T Get<T>() where T : class
    {
        if (map.TryGetValue(typeof(T), out object s)) return (T)s;
        throw new InvalidOperationException($"Service {typeof(T).Name} non enregistré.");
    }

    public static bool TryGet<T>(out T service) where T : class
    {
        bool found = map.TryGetValue(typeof(T), out object s);
        service = found ? (T)s : null;
        return found;
    }
}

// Au démarrage :
// Services.Register<IAudio>(new UnityAudio(source));
// Partout ailleurs :
// Services.Get<IAudio>().Play("explosion");`},

{id:'machine-etats',cat:'poo',lvl:2,title:'Machine à états',sum:'Organiser un comportement en états distincts (patrouille, poursuite, attaque) et en transitions claires.',
body:[
['L\'idée',`Un ennemi qui patrouille, poursuit, attaque et fuit finit souvent en un ~Update~ rempli de ~if~ imbriqués. Une machine à états range chaque comportement dans son **état**, et une seule chose est vraie à la fois : l'état courant.`],
['Version simple : un enum',`Un [[enums-switch|enum]] et un ~switch~ dans ~Update~ suffisent pour 3 ou 4 états. Chaque cas fait son travail et décide s'il faut changer d'état.`],
['Version objet : une classe par état',`Quand les états grossissent, chacun devient une classe avec ~Enter~, ~Tick~ et ~Exit~. La machine appelle ~Exit~ de l'ancien et ~Enter~ du nouveau à chaque transition : c'est l'endroit pour lancer une animation ou un son.`,`public interface IState
{
    void Enter();
    void Tick(float dt);
    void Exit();
}`],
['Pièges',`Changer d'état plusieurs fois dans la même image, oublier ~Exit~ (une animation qui continue), ou des transitions éparpillées partout. Garde toutes les règles de transition au même endroit. L'~Animator~ de Unity est lui-même une machine à états (voir [[animator-parametres]]).`]],
ex:`Écris une machine à états objet pour un garde : ~StateMachine~ (avec ~ChangeState~), et trois états ~Patrol~, ~Chase~ et ~Attack~. Patrol passe à Chase si le joueur est à moins de 8 m ; Chase passe à Attack à moins de 2 m et revient à Patrol au-delà de 12 m ; Attack revient à Chase au-delà de 2,5 m.`,
hint:`Chaque état reçoit le Guard dans son constructeur pour lire la distance et demander un changement d'état.`,
sol:`public class StateMachine
{
    public IState Current { get; private set; }

    public void ChangeState(IState next)
    {
        if (next == Current) return;
        Current?.Exit();
        Current = next;
        Current.Enter();
    }

    public void Tick(float dt) => Current?.Tick(dt);
}

public class Guard : MonoBehaviour
{
    public Transform player;
    public float speed = 3f;
    public StateMachine Machine { get; } = new StateMachine();
    public IState Patrol, Chase, Attack;

    public float DistanceToPlayer => Vector3.Distance(transform.position, player.position);

    private void Awake()
    {
        Patrol = new PatrolState(this);
        Chase = new ChaseState(this);
        Attack = new AttackState(this);
    }

    private void Start() => Machine.ChangeState(Patrol);
    private void Update() => Machine.Tick(Time.deltaTime);
}

public class PatrolState : IState
{
    private readonly Guard g;
    public PatrolState(Guard g) => this.g = g;
    public void Enter() { }
    public void Tick(float dt)
    {
        g.transform.Rotate(0f, 30f * dt, 0f);            // tourne sur place
        if (g.DistanceToPlayer < 8f) g.Machine.ChangeState(g.Chase);
    }
    public void Exit() { }
}

public class ChaseState : IState
{
    private readonly Guard g;
    public ChaseState(Guard g) => this.g = g;
    public void Enter() { }
    public void Tick(float dt)
    {
        g.transform.position = Vector3.MoveTowards(g.transform.position, g.player.position, g.speed * dt);
        float d = g.DistanceToPlayer;
        if (d < 2f) g.Machine.ChangeState(g.Attack);
        else if (d > 12f) g.Machine.ChangeState(g.Patrol);
    }
    public void Exit() { }
}

public class AttackState : IState
{
    private readonly Guard g;
    public AttackState(Guard g) => this.g = g;
    public void Enter() => Debug.Log("Attaque !");
    public void Tick(float dt)
    {
        if (g.DistanceToPlayer > 2.5f) g.Machine.ChangeState(g.Chase);
    }
    public void Exit() { }
}`},

{id:'strategy',cat:'poo',lvl:2,title:'Strategy',sum:'Rendre un comportement interchangeable : changer de façon de faire sans changer le code qui l\'utilise.',
body:[
['L\'idée',`Une arme peut tirer en ligne droite, en éventail ou en tête chercheuse. Au lieu d'un ~switch~ dans la classe ~Weapon~, on isole « comment tirer » derrière une [[interfaces|interface]] ~IFirePattern~. L'arme garde sa stratégie et lui délègue le travail.`],
['Avec des ScriptableObjects',`Dans Unity, une stratégie en [[scriptableobjects|ScriptableObject]] devient un asset qu'on glisse dans l'inspecteur : les designers combinent armes et motifs de tir sans programmeur. Une classe de base abstraite remplace l'interface, car l'inspecteur sait l'afficher.`],
['Quand l\'utiliser',`Quand un même rôle a plusieurs variantes qui changent indépendamment du reste : motifs de tir, IA de déplacement, calcul de dégâts, génération de niveau. Si les variantes changent selon un état, c'est plutôt une [[machine-etats]].`]],
ex:`Écris une classe abstraite ~FirePattern~ (ScriptableObject) avec ~Fire(Transform muzzle, Projectile prefab)~, puis ~StraightPattern~ et ~SpreadPattern~ (n projectiles répartis sur un angle total). Enfin ~Weapon~ qui utilise le motif assigné.`,
hint:`Pour l'éventail, l'angle de départ est −total/2, et le pas total/(n−1). Quaternion.AngleAxis autour de muzzle.up.`,
sol:`public abstract class FirePattern : ScriptableObject
{
    public abstract void Fire(Transform muzzle, Projectile prefab);
}

[CreateAssetMenu(menuName = "Weapons/Straight")]
public class StraightPattern : FirePattern
{
    public override void Fire(Transform muzzle, Projectile prefab)
    {
        Instantiate(prefab, muzzle.position, muzzle.rotation);
    }
}

[CreateAssetMenu(menuName = "Weapons/Spread")]
public class SpreadPattern : FirePattern
{
    [Min(2)] public int count = 5;
    [Range(0f, 180f)] public float totalAngle = 40f;

    public override void Fire(Transform muzzle, Projectile prefab)
    {
        float step = totalAngle / (count - 1);
        float start = -totalAngle * 0.5f;
        for (int i = 0; i < count; i++)
        {
            Quaternion offset = Quaternion.AngleAxis(start + step * i, muzzle.up);
            Instantiate(prefab, muzzle.position, offset * muzzle.rotation);
        }
    }
}

public class Weapon : MonoBehaviour
{
    [SerializeField] private FirePattern pattern;
    [SerializeField] private Projectile projectile;
    [SerializeField] private Transform muzzle;

    public void Shoot() => pattern.Fire(muzzle, projectile);
}`},

{id:'command-undo',cat:'poo',lvl:3,title:'Command et annulation',sum:'Transformer une action en objet pour l\'annuler, la rejouer ou l\'enregistrer.',
body:[
['L\'idée',`Une **commande** est un objet qui représente une action : « déplacer cette pièce de A vers B ». Comme c'est un objet, on peut le garder dans une liste, l'exécuter plus tard, l'annuler, l'envoyer sur le réseau ou le rejouer.`],
['L\'annulation',`Chaque commande sait faire ~Execute()~ et ~Undo()~. On les empile dans une [[pile-file|pile]] après exécution ; annuler revient à dépiler et appeler ~Undo~. Une seconde pile permet de refaire.`],
['Usages',`Annuler dans un puzzle ou un éditeur de niveau, rejouer une partie (on enregistre les commandes, pas les positions), découpler les touches des actions (la touche Espace déclenche une ~JumpCommand~, qu'on peut réassigner), files d'actions d'un jeu au tour par tour.`],
['Dans l\'éditeur Unity',`~Undo.RecordObject~ fait ce travail pour les modifications d'éditeur : utilise-le dans tes outils (voir [[custom-inspector]]). Le pattern Command sert à ton propre jeu.`]],
ex:`Écris ~ICommand~ (Execute, Undo), ~MoveCommand~ qui déplace un Transform d'un décalage, et ~CommandHistory~ avec ~Run(ICommand)~, ~Undo()~ et ~Redo()~. Une nouvelle commande après une annulation efface l'historique des « refaire ».`,
hint:`Deux Stack<ICommand> : done et undone. Run vide undone.`,
sol:`public interface ICommand
{
    void Execute();
    void Undo();
}

public class MoveCommand : ICommand
{
    private readonly Transform target;
    private readonly Vector3 offset;

    public MoveCommand(Transform target, Vector3 offset)
    {
        this.target = target;
        this.offset = offset;
    }

    public void Execute() => target.position += offset;
    public void Undo()    => target.position -= offset;
}

public class CommandHistory
{
    private readonly Stack<ICommand> done = new Stack<ICommand>();
    private readonly Stack<ICommand> undone = new Stack<ICommand>();

    public void Run(ICommand command)
    {
        command.Execute();
        done.Push(command);
        undone.Clear();          // une nouvelle action efface le futur
    }

    public bool Undo()
    {
        if (done.Count == 0) return false;
        ICommand c = done.Pop();
        c.Undo();
        undone.Push(c);
        return true;
    }

    public bool Redo()
    {
        if (undone.Count == 0) return false;
        ICommand c = undone.Pop();
        c.Execute();
        done.Push(c);
        return true;
    }
}`},

{id:'event-bus-so',cat:'poo',lvl:3,title:'Événements portés par des ScriptableObjects',sum:'Faire communiquer des scènes et des prefabs sans référence directe, par un asset partagé.',
body:[
['L\'idée',`Un [[scriptableobjects|ScriptableObject]] peut porter un événement : un asset « PlayerDied » que le joueur déclenche et que l'UI, la musique et les succès écoutent. Personne ne connaît personne, chacun connaît seulement l'asset. On le branche dans l'inspecteur, même entre deux prefabs qui ne sont jamais dans la même scène.`],
['Pourquoi c\'est pratique',`Plus de [[singleton]] pour relier les systèmes, des prefabs testables seuls (on déclenche l'événement à la main), et des designers qui câblent eux-mêmes les réactions.`],
['Les pièges',`Toujours se désabonner dans ~OnDisable~ (voir [[delegues-evenements]]) : l'asset vit plus longtemps que les objets de la scène. Et le flux devient moins visible dans le code : nomme bien les assets et range-les dans un dossier dédié.`],
['Avec un paramètre',`Une version générique ~GameEvent<T>~ transporte une donnée (les dégâts, le score). Unity ne sérialise pas un type générique ouvert : on crée une petite classe concrète par type, ~IntEvent : GameEvent<int>~.`]],
ex:`Écris ~GameEvent~ (ScriptableObject) avec ~Raise()~, ~Register(Action)~ et ~Unregister(Action)~, puis un composant ~GameEventListener~ qui expose un ~UnityEvent~ dans l'inspecteur et le déclenche quand l'asset est levé.`,
hint:`La liste des abonnés peut être modifiée pendant Raise : parcours-la à l'envers.`,
sol:`[CreateAssetMenu(menuName = "Events/Game Event")]
public class GameEvent : ScriptableObject
{
    private readonly List<Action> listeners = new List<Action>();

    public void Raise()
    {
        // À l'envers : un abonné peut se retirer pendant l'appel
        for (int i = listeners.Count - 1; i >= 0; i--)
            listeners[i]();
    }

    public void Register(Action a)   { if (!listeners.Contains(a)) listeners.Add(a); }
    public void Unregister(Action a) => listeners.Remove(a);
}

public class GameEventListener : MonoBehaviour
{
    [SerializeField] private GameEvent gameEvent;
    [SerializeField] private UnityEvent response;

    private void OnEnable()  => gameEvent.Register(OnRaised);
    private void OnDisable() => gameEvent.Unregister(OnRaised);

    private void OnRaised() => response.Invoke();
}`},

{id:'separation-donnees-vue',cat:'poo',lvl:2,title:'Séparer les données et l\'affichage',sum:'Garder la logique du jeu indépendante de l\'interface, pour pouvoir changer l\'une sans casser l\'autre.',
body:[
['L\'idée',`L'inventaire (les données et les règles) ne devrait pas savoir qu'il existe une grille d'icônes à l'écran. L'interface (la vue) lit les données et **réagit** à leurs changements. On peut alors refaire toute l'interface, ou tester l'inventaire sans écran.`],
['Le motif',`Un **modèle** : une classe C# ordinaire avec les données, les règles et un événement ~Changed~. Une **vue** : un MonoBehaviour qui affiche et transmet les clics. Entre les deux, parfois un **présentateur** qui traduit (formatage, tri). C'est l'esprit des motifs MVC et MVP.`],
['Mettre à jour au bon moment',`La vue ne relit pas tout dans ~Update~ : elle s'abonne à ~Changed~ et ne se redessine que quand il le faut. C'est plus rapide et évite les allocations. Voir [[delegues-evenements]] et [[ui-canvas]].`],
['Bonus : testable',`Un modèle sans dépendance à Unity se teste avec de simples [[tests-unitaires]], sans scène ni Play Mode.`]],
ex:`Écris un modèle ~ScoreModel~ (classe C# ordinaire) avec ~Score~, ~Combo~, ~Add(int points)~ qui multiplie par le combo, ~Miss()~ qui remet le combo à 1, et un événement ~Changed~. Puis une vue ~ScoreView~ qui affiche « 1 250 · x3 » et s'abonne proprement.`,
hint:`La vue reçoit le modèle via une méthode Bind(ScoreModel m) et s'abonne dans Bind, se désabonne dans OnDestroy.`,
sol:`public class ScoreModel
{
    public int Score { get; private set; }
    public int Combo { get; private set; } = 1;
    public event Action Changed;

    public void Add(int points)
    {
        Score += points * Combo;
        Combo = Mathf.Min(Combo + 1, 8);
        Changed?.Invoke();
    }

    public void Miss()
    {
        Combo = 1;
        Changed?.Invoke();
    }
}

public class ScoreView : MonoBehaviour
{
    [SerializeField] private TMP_Text label;
    private ScoreModel model;

    public void Bind(ScoreModel m)
    {
        if (model != null) model.Changed -= Refresh;
        model = m;
        model.Changed += Refresh;
        Refresh();
    }

    private void OnDestroy()
    {
        if (model != null) model.Changed -= Refresh;
    }

    private void Refresh()
    {
        label.text = $"{model.Score:N0} · x{model.Combo}";
    }
}`}
]);

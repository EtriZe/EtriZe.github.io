window.EXTRA=Object.assign(window.EXTRA||{},{
'classes-objets':{
r:[`Une classe est un plan, un objet une instance construite avec ~new~.`,`Le constructeur met l'objet dans un état valide dès sa création.`,`Champs privés, méthodes publiques : la classe protège ses propres règles.`],
m:[
['Ce qui se passe en mémoire',`~new Wallet("or")~ réserve un bloc sur le **tas** et renvoie une référence vers lui. La variable ne contient que cette référence (quelques octets). Deux variables peuvent pointer sur le même objet : modifier l'un se voit par l'autre. Quand plus aucune référence ne mène à l'objet, le ramasse-miettes le récupère (voir [[allocations-gc]]).`],
['Invariants : la vraie raison de l\'encapsulation',`Un **invariant** est une règle toujours vraie pour un objet : « l'or n'est jamais négatif », « la vie est entre 0 et max ». Si le champ est public, n'importe quel code peut casser la règle, et le bug apparaît loin de sa cause. Avec un champ privé et des méthodes qui vérifient, la règle ne peut être violée qu'**à un seul endroit**. C'est là qu'on met un ~Debug.Assert~ ou une exception.`,`public void Spend(int amount)
{
    if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount));
    if (amount > Amount) throw new InvalidOperationException("Pas assez d'or");
    Amount -= amount;
}`],
['Classes C# ordinaires dans un projet Unity',`Les développeurs débutants font tout en MonoBehaviour. Les plus expérimentés gardent les MonoBehaviour pour ce qui touche à la scène (affichage, physique, entrées) et écrivent la logique (inventaire, règles de combat, économie) en classes ordinaires. Avantages : création instantanée, pas de dépendance à une scène, tests en millisecondes (voir [[tests-unitaires]]), réutilisables côté serveur.`],
['Égalité',`Pour une classe, ~a == b~ compare par défaut les **références** : deux portefeuilles identiques mais distincts ne sont pas égaux. Pour comparer le contenu, on redéfinit ~Equals~ et ~GetHashCode~ ensemble (indispensable pour servir de clé de [[collections|Dictionary]]), ou on utilise un ~record~ quand la version de C# le permet.`]],
d:[[`Ajoute à ~Timer~ un mode « en boucle » : quand le temps est écoulé, ~Tick~ renvoie true puis repart automatiquement, en gardant le temps excédentaire (si dt dépasse, le surplus compte pour le tour suivant).`,`Au lieu de remettre elapsed à 0, soustrais Duration ; gère aussi le cas où dt couvre plusieurs tours.`],
[`Écris une classe ~Inventory~ avec une capacité maximale, ~bool TryAdd(Item item)~, ~bool Remove(Item item)~, et un invariant vérifié par une méthode privée ~CheckInvariant()~ appelée après chaque modification (uniquement dans l'éditeur, avec ~[Conditional("UNITY_EDITOR")]~).`,`System.Diagnostics.ConditionalAttribute retire l'appel des builds de jeu.`]]},

'heritage-polymorphisme':{
r:[`~virtual~ permet de remplacer, ~override~ remplace, ~abstract~ oblige à écrire.`,`Le polymorphisme : manipuler un ~Goblin~ comme un ~Enemy~ et obtenir son comportement à lui.`,`Les hiérarchies profondes deviennent rigides ; préfère des composants et des interfaces.`],
m:[
['Comment l\'appel trouve la bonne méthode',`Pour une méthode ~virtual~, le programme ne décide pas à la compilation quelle version appeler : il regarde le **type réel** de l'objet au moment de l'appel (répartition dynamique, via une table de méthodes). C'est pour ça qu'une liste d'~Enemy~ peut contenir des gobelins et des dragons qui attaquent chacun à leur façon. Une méthode non virtuelle est choisie selon le type de la variable, pas de l'objet.`],
['Le piège de new',`Écrire dans la fille une méthode du même nom **sans** ~override~ la cache seulement (le compilateur suggère le mot-clé ~new~). Résultat surprenant : appelée via une variable de type parent, c'est la version parente qui s'exécute. Si tu vois l'avertissement « hides inherited member », c'est presque toujours un ~override~ oublié.`],
['Le principe de substitution',`Une classe fille doit pouvoir remplacer sa mère **partout** sans surprise. Si ~FlyingEnemy.Move~ ignore le sol alors que le code appelant compte sur des ennemis qui restent au sol, l'héritage ment. Signe d'alerte : une méthode override qui lève ~NotImplementedException~ ou ne fait rien. Il fallait sans doute une [[interfaces|interface]] ou une [[composition]].`],
['Le modèle de la méthode modèle',`Un usage sain de l'héritage : la classe mère fixe le **déroulement** dans une méthode non virtuelle et laisse les filles remplir des étapes ~protected abstract~. Le pickup de l'exercice en est un exemple : la détection et la consommation sont communes, seul l'effet change.`,`public void Use(Player p)          // déroulement fixe
{
    if (!CanUse(p)) return;
    Apply(p);                      // étape propre à chaque fille
    PlayFeedback();
}`]],
d:[[`Ajoute à ~Pickup~ une méthode virtuelle ~bool CanUse(Player p)~ (vrai par défaut) et fais en sorte que ~HealthPickup~ refuse quand le joueur a déjà toute sa vie. Vérifie que le pickup n'est alors ni appliqué ni consommé.`,`Le test se place dans OnTriggerEnter de la classe mère, avant Apply.`],
[`Prends une hiérarchie ~Enemy > Archer, Knight, Mage~ où chacun a un mode d'attaque différent, puis ajoute un « Archer à cheval » qui combine Archer et Knight. Explique en commentaire pourquoi l'héritage bloque, puis refais-le avec des composants.`,`C# n'a pas d'héritage multiple de classes : c'est exactement là que la composition gagne.`]]},

'interfaces':{
r:[`Une interface est un contrat : « je sais faire ça », sans dire comment.`,`Une classe peut implémenter plusieurs interfaces.`,`~TryGetComponent<IInteractable>~ trouve n'importe quel composant qui respecte le contrat.`],
m:[
['Programmer vers une abstraction',`Le code qui dépend d'~IDamageable~ fonctionne avec des types qui n'existent pas encore. Quand un designer demande « des caisses explosives », tu écris une nouvelle classe, et la balle, l'explosion, le piège à pointes marchent sans modification. C'est le principe ouvert/fermé : ouvert à l'extension, fermé à la modification.`],
['Petites interfaces',`Mieux vaut plusieurs interfaces de deux méthodes qu'une seule de quinze. ~IDamageable~, ~IHealable~, ~IPushable~ : chaque objet implémente ce qui le concerne. Une grosse interface force des implémentations vides (« ce mur ne se soigne pas »), signe de mauvais découpage.`],
['Méthodes par défaut et propriétés',`Une interface peut déclarer des propriétés (~string Prompt { get; }~) et, depuis C# 8, fournir une implémentation par défaut. Utilise ces implémentations avec prudence : elles ne sont visibles que via le type interface, ce qui surprend.`],
['Interfaces et objets Unity détruits',`Une variable de type interface qui pointe vers un MonoBehaviour détruit n'est **pas** null pour C#, et ~== null~ ne la détecte pas, puisque la surcharge de Unity ne s'applique qu'aux variables de type ~UnityEngine.Object~. Pour vérifier : ~target is UnityEngine.Object o && o == null~, ou garde une référence typée MonoBehaviour à côté. Voir [[null-securite]].`,`static bool IsAlive(IDamageable d) =>
    d != null && !(d is UnityEngine.Object o && o == null);`]],
d:[[`Écris ~IDamageable~ avec ~TakeDamage(int amount, Vector3 hitPoint)~ et ~bool IsDead~, puis une ~Explosion~ qui inflige des dégâts décroissants avec la distance à tout ce qui l'implémente dans un rayon, en n'en touchant chaque objet qu'une fois même s'il a plusieurs colliders.`,`Physics.OverlapSphere, GetComponentInParent<IDamageable>, et un HashSet pour ne pas compter deux fois.`],
[`Ajoute à l'~Interactor~ une mise en évidence : l'objet visé implémente aussi ~IHighlightable~ (~SetHighlighted(bool)~). Allume-la quand on vise, éteins-la quand on ne vise plus, sans l'appeler à chaque image.`,`Garde l'objet visé à l'image précédente et compare.`]]},

'composition':{
r:[`Assembler de petits composants plutôt qu'empiler des classes filles.`,`Un composant = une responsabilité, utilisable seul.`,`Les composants communiquent par événements ou interfaces, pas en se connaissant tous.`],
m:[
['Signes qu\'un composant en fait trop',`Plus de 300 lignes, un nom vague (~PlayerController~, ~GameManager~), des champs qui ne servent qu'à une partie des méthodes, ou un ~Update~ qui gère à la fois entrées, mouvement, animations et sons. Découpe selon les **raisons de changer** : si le designer modifie le saut, seul ~Jumper~ devrait bouger.`],
['Communication entre composants',`Trois niveaux, du plus couplé au plus libre : référence directe (~[RequireComponent]~ puis ~GetComponent~), [[interfaces|interface]] (~GetComponent<IDamageable>~), [[delegues-evenements|événement]] (on ne connaît même pas qui écoute). Choisis le plus libre qui reste lisible. Un composant de « haut niveau » (~Enemy~) peut connaître ses composants ; l'inverse est à éviter.`],
['Composer les données aussi',`Les composants contiennent le comportement, les [[scriptableobjects]] les réglages. Un ~Shooter~ avec un ~WeaponData~ et un [[strategy|FirePattern]] permet des dizaines d'armes sans une ligne de code de plus.`],
['Vers l\'ECS',`Unity propose aussi une approche « Entities » (DOTS) où la composition est poussée au bout : des entités sans comportement, des composants de pures données, et des systèmes qui traitent des milliers d'entités d'un coup. C'est une architecture différente, très performante, qui reprend les idées de [[jobs-burst]].`]],
d:[[`Ajoute un composant ~Knockback~ qui écoute un événement de dégâts de ~Health~ (ajoute ~Action<int, Vector3> Damaged~) et repousse le Rigidbody depuis le point d'impact. ~Health~ ne doit pas connaître Knockback.`,`Health déclenche Damaged(amount, hitPoint) ; Knockback s'abonne dans OnEnable.`],
[`Prends un ~PlayerController~ de ton choix (ou un tutoriel) de plus de 200 lignes et découpe-le en au moins 4 composants. Note pour chacun sa responsabilité en une phrase.`,`Entrées, mouvement, saut, animation, son sont des découpes classiques.`]]},

'separation-donnees-vue':{
r:[`Le modèle (données et règles) ne connaît pas l'affichage.`,`La vue s'abonne aux changements au lieu de tout relire chaque image.`,`Un modèle sans Unity se teste en quelques millisecondes.`],
m:[
['Pourquoi c\'est si important dans un vrai projet',`L'interface change sans arrêt : nouvelle maquette, version manette, version mobile, mode daltonien. Si les règles du jeu sont mêlées à l'UI, chaque refonte casse du gameplay. Séparés, un intégrateur peut refaire tout l'écran d'inventaire sans toucher à une règle.`],
['MVC, MVP, MVVM',`Trois variantes de la même idée. **MVC** : le contrôleur reçoit les entrées et modifie le modèle, la vue l'observe. **MVP** : le présentateur fait le lien et formate pour une vue très bête. **MVVM** : la vue se lie automatiquement à un « modèle de vue » ; c'est l'esprit de la liaison de données d'UI Toolkit (~dataSource~ et ~binding~ dans Unity 6). En pratique, ce qui compte est le sens des dépendances : la vue dépend du modèle, jamais l'inverse.`],
['Événements fins ou grossiers',`Un seul événement ~Changed~ est simple ; la vue redessine tout. Avec 200 objets d'inventaire, on préfère des événements précis (~ItemAdded(index)~) pour ne mettre à jour qu'une case. Commence simple, affine quand le profiler le demande (voir [[profiler-markers]]).`]],
d:[[`Écris un ~InventoryModel~ (liste d'emplacements, ~Add~, ~Remove~, ~Swap(int a, int b)~) avec un événement ~SlotChanged(int index)~, et une vue qui ne met à jour que la case concernée.`,`La vue garde un tableau de références vers les cases UI, indexées comme le modèle.`],
[`Écris 3 tests unitaires pour ~ScoreModel~ : le combo multiplie, Miss le remet à 1, le combo plafonne à 8.`,`Pas besoin de scène : new ScoreModel() suffit.`]]},

'singleton':{
r:[`Une seule instance, accessible partout via un champ static.`,`Pratique pour de vrais services globaux sans état de jeu (audio, journalisation).`,`Défauts : dépendances cachées, ordre d'initialisation, tests difficiles, état qui survit entre parties.`],
m:[
['Les trois variantes que tu croiseras',`**1. Le singleton de scène** (celui de la leçon) : un objet posé dans la scène qui s'enregistre dans ~Awake~. **2. Le singleton paresseux** : ~Instance~ crée l'objet à la première demande s'il n'existe pas, pratique mais il apparaît à un moment imprévisible. **3. Le singleton C# pur**, pour une classe ordinaire, avec ~Lazy<T>~ qui gère aussi les accès depuis plusieurs threads.`,`public sealed class Analytics
{
    private static readonly Lazy<Analytics> instance = new Lazy<Analytics>(() => new Analytics());
    public static Analytics Instance => instance.Value;
    private Analytics() { }   // personne d'autre ne peut faire new
}`],
['La classe de base générique et ses pièges',`On voit souvent ~public class Singleton<T> : MonoBehaviour where T : Singleton<T>~ pour éviter de réécrire le même code. Ça marche, mais : chaque classe fille doit appeler ~base.Awake()~ si elle a son propre Awake (voir [[heritage-polymorphisme]]), et la version paresseuse qui fait ~new GameObject().AddComponent<T>()~ peut **recréer** un singleton pendant la fermeture du jeu, quand un autre objet l'appelle dans son ~OnDestroy~. D'où les objets fantômes « (Clone) » qui restent dans la scène après l'arrêt du Play Mode. Une garde ~applicationIsQuitting~ évite ce piège.`],
['Pourquoi les équipes expérimentées s\'en méfient',`**Dépendances cachées** : en lisant la signature de ~Enemy~, rien ne dit qu'il a besoin de l'audio, du score et de la caméra ; on le découvre en cherchant ~.Instance~ dans tout le code. **Ordre d'initialisation** : un ~Awake~ qui appelle ~GameManager.Instance~ peut passer avant celui du GameManager et trouver null ; l'ordre d'exécution des scripts règle le symptôme, pas la cause. **Tests** : impossible de remplacer ~AudioManager~ par une version silencieuse. **État partagé** : un champ static qui garde la partie précédente (voir [[static-instance]]).`],
['Quand c\'est un bon choix',`Un service vraiment unique, sans état de partie, utilisé partout, et dont l'absence est un bug : audio, journalisation, gestionnaire de chargement de scènes. Si tu hésites entre singleton et référence dans l'inspecteur, prends la référence. Si tu as plus de trois singletons, regarde le [[service-locator]] ou l'[[event-bus-so|événement porté par un ScriptableObject]].`],
['Une alternative simple : le ScriptableObject partagé',`Un asset ~AudioSettings~ ou ~RuntimeSet~ glissé dans l'inspecteur des objets qui en ont besoin donne un accès partagé, visible dans l'inspecteur (donc la dépendance n'est plus cachée), remplaçable par un autre asset pour un test, et sans ordre d'initialisation à gérer.`,`[CreateAssetMenu(menuName = "Game/Player Registry")]
public class PlayerRegistry : ScriptableObject
{
    public Transform Current { get; private set; }
    public void Set(Transform t) => Current = t;
}
// Le joueur fait registry.Set(transform) dans OnEnable ;
// les ennemis lisent registry.Current. Aucun Find, aucun static.`]],
d:[[`Écris une classe de base générique ~PersistentSingleton<T>~ : instance unique, doublons détruits, ~DontDestroyOnLoad~, remise à zéro au lancement du Play Mode, et une garde qui empêche toute recréation pendant la fermeture du jeu (~OnApplicationQuit~).`,`Un champ static bool quitting mis à true dans OnApplicationQuit ; Instance renvoie null s'il est vrai.`],
[`Prends un projet (le tien ou un tutoriel) qui utilise un ~GameManager.Instance~ et remplace-le par des références passées dans l'inspecteur ou par un ScriptableObject. Liste ce que chaque script utilisait vraiment du GameManager : c'est souvent bien moins qu'on ne croit.`,`Cherche toutes les occurrences de « GameManager.Instance » et note la propriété utilisée à chaque fois.`]]},

'service-locator':{
r:[`Un registre central : on enregistre un service par son interface, on le récupère ailleurs.`,`Plus souple qu'un singleton : l'implémentation se remplace (tests, développement, production).`,`Les dépendances restent cachées ; l'injection de dépendances est plus explicite.`],
m:[
['L\'injection de dépendances',`L'alternative la plus propre : chaque classe **reçoit** ses dépendances au lieu d'aller les chercher. En C# pur, par le constructeur. Dans Unity, par l'inspecteur, ou par une méthode ~Init(...)~ appelée par celui qui crée l'objet. Des bibliothèques (Zenject/Extenject, VContainer) automatisent cela. Le locator est un compromis plus simple à adopter dans un projet existant.`,`public class EnemySpawner
{
    private readonly IAudio audio;
    private readonly IRandom rng;
    public EnemySpawner(IAudio audio, IRandom rng)  // dépendances visibles
    {
        this.audio = audio;
        this.rng = rng;
    }
}`],
['Un point d\'entrée unique',`Les projets bien organisés ont une scène ou un objet de démarrage (« Bootstrap ») qui crée et enregistre tous les services dans un ordre connu, avant tout le reste. Fini les problèmes d'ordre d'Awake. ~[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]~ permet de le faire même quand on lance une scène de niveau directement depuis l'éditeur.`],
['Services nuls',`Plutôt que de vérifier partout si un service existe, on enregistre par défaut une implémentation qui ne fait rien (~NullAudio~, ~NullAnalytics~). Le code appelant reste simple, et un oubli d'enregistrement ne fait pas planter le jeu.`]],
d:[[`Ajoute à ~Services~ un démarrage automatique : une méthode ~[RuntimeInitializeOnLoadMethod(BeforeSceneLoad)]~ qui enregistre des services nuls pour ~IAudio~ et ~IAnalytics~, remplaçables ensuite par les vrais.`,`Register écrase la valeur existante : il suffit d'enregistrer les vrais services plus tard.`],
[`Réécris l'~AudioManager~ de la leçon Singleton en ~UnityAudio : IAudio~ enregistré dans le locator, et un ~SilentAudio~ pour les tests. Écris un test qui vérifie qu'un ~Coin~ ramassé demande bien un son, avec un ~FakeAudio~ qui compte les appels.`,`FakeAudio garde une liste des sons demandés ; le test l'enregistre avant de simuler la collecte.`]]},

'machine-etats':{
r:[`Un seul état actif à la fois, avec Enter, Tick et Exit.`,`Les règles de transition au même endroit.`,`L'Animator de Unity est lui-même une machine à états.`],
m:[
['Où mettre les transitions',`Deux écoles. **Dans les états** (comme dans l'exercice) : simple, mais les règles sont éparpillées. **Dans une table** : la machine connaît la liste « de A vers B si condition », ce qui permet de tout voir d'un coup et même de dessiner le graphe dans un outil. Pour un projet qui grandit, la table gagne.`,`machine.AddTransition(Patrol, Chase, () => guard.DistanceToPlayer < 8f);
machine.AddTransition(Chase, Attack, () => guard.DistanceToPlayer < 2f);
machine.AddAnyTransition(Dead, () => health.IsDead);   // depuis n'importe quel état`],
['Machines hiérarchiques',`Quand les états se multiplient, on les regroupe : un état « Combat » contient lui-même « Poursuite », « Attaque », « Esquive ». La transition « mort » s'écrit une seule fois au niveau supérieur. C'est ce que font les sous-machines de l'Animator.`],
['Machine à états ou arbre de comportement',`Une machine à états convient quand le personnage a des **modes** nets. Pour une IA qui choisit parmi beaucoup d'actions selon des priorités (« si j'ai peu de vie, cherche un soin, sinon si je vois l'ennemi... »), les arbres de comportement (behavior trees) ou l'IA utilitaire (des scores par action) s'organisent mieux.`],
['Déboguer',`Affiche l'état courant au-dessus du personnage avec ~Handles.Label~ ou dans un [[gizmos|gizmo]], et journalise chaque transition avec l'image où elle a lieu. Une bonne part des bugs d'IA sont des transitions qui oscillent entre deux états à chaque image : ajoute une **hystérésis** (on entre à 8 m, on sort à 12 m, comme dans l'exercice).`]],
d:[[`Transforme la ~StateMachine~ de l'exercice pour qu'elle gère une table de transitions (~AddTransition(from, to, condition)~ et ~AddAnyTransition(to, condition)~), évaluée avant chaque Tick. Les états ne décident plus eux-mêmes.`,`Un Dictionary<IState, List<(IState to, Func<bool> cond)>> plus une liste pour les transitions depuis n'importe quel état.`],
[`Ajoute un état ~Search~ : quand le garde perd le joueur, il va à la dernière position connue, regarde autour pendant 3 secondes, puis retourne en patrouille.`,`Mémorise la dernière position connue dans le Guard au moment de quitter Chase.`]]},

'strategy':{
r:[`Isoler « comment faire » derrière une interface ou une classe abstraite.`,`Changer de stratégie sans toucher au code qui l'utilise.`,`En ScriptableObject, les designers combinent les stratégies dans l'inspecteur.`],
m:[
['Strategy face au switch',`Un ~switch~ sur un type d'arme marche pour trois cas. Au dixième, chaque ajout oblige à modifier la même méthode, et chaque cas peut casser les autres. Avec Strategy, ajouter un motif revient à **ajouter un fichier**, sans toucher à l'existant.`],
['Attention à l\'état dans un ScriptableObject',`Un ScriptableObject est **partagé** par tous ceux qui le référencent. Si ~SpreadPattern~ garde un compteur interne (« quel tir de la rafale »), deux armes qui utilisent le même asset se mélangent. Garde les stratégies sans état, ou passe l'état en paramètre (un objet de contexte propre à chaque arme).`],
['Stratégies en C# pur avec SerializeReference',`Pour éviter de créer un asset par variante, on peut sérialiser directement des classes C# ordinaires dans le composant avec ~[SerializeReference]~ (voir [[serialisation]]). Chaque arme a alors sa propre instance de stratégie, avec ses réglages, sans fichier séparé.`]],
d:[[`Ajoute un ~BurstPattern~ qui tire 3 projectiles à 0,1 s d'intervalle. Comme une stratégie sans état ne peut pas attendre, fais renvoyer à ~Fire~ un ~IEnumerator~ que l'arme lance en coroutine.`,`Change la signature en IEnumerator Fire(...) ; les motifs instantanés font simplement yield break après avoir tiré.`],
[`Écris une stratégie de déplacement d'ennemi (~IMovement~ : ~Vector3 Velocity(Transform self, Transform target)~) avec trois implémentations : direct, en zigzag (sinus perpendiculaire), et orbite à distance fixe.`,`Zigzag : direction + perpendiculaire × sin(Time.time × fréquence). Orbite : produit vectoriel avec Vector3.up.`]]},

'command-undo':{
r:[`Une commande est une action transformée en objet, avec Execute et Undo.`,`Deux piles : ce qui est fait, ce qui a été annulé.`,`Une nouvelle action efface l'historique « refaire ».`],
m:[
['Ce qui rend l\'annulation difficile',`Une commande doit pouvoir **défaire exactement** ce qu'elle a fait. ~target.position += offset~ s'annule facilement, mais « détruire un ennemi » demande de garder de quoi le recréer, et « ajouter de l'or puis le plafonner » doit mémoriser la valeur d'avant plutôt que soustraire. Règle sûre : enregistrer l'état avant, et le restaurer dans Undo.`],
['Fusionner les commandes',`Faire glisser un objet génère des dizaines de petits déplacements. Personne ne veut 60 Ctrl+Z pour un seul geste. On fusionne les commandes successives du même type sur le même objet (~TryMerge(ICommand next)~), ou on n'enregistre qu'au relâchement de la souris.`],
['Rejouer une partie',`Si toutes les actions du joueur passent par des commandes, et que le jeu est déterministe (même graine aléatoire, voir [[aleatoire]], même pas de temps), enregistrer la liste des commandes avec leur numéro d'image suffit pour **rejouer toute la partie**. C'est le principe des replays de jeux de stratégie et de beaucoup de jeux de combat en réseau.`]],
d:[[`Ajoute à ~CommandHistory~ une limite de 100 commandes (les plus anciennes sont oubliées) et une méthode ~TryMerge~ : deux ~MoveCommand~ consécutives sur le même Transform à moins de 0,3 s d'intervalle fusionnent en une seule.`,`Une LinkedList ou une liste dont on retire le premier élément remplace la Stack pour pouvoir oublier les plus anciennes.`],
[`Fais un mini jeu de Sokoban (pousser des caisses sur une grille) où chaque déplacement est une commande, avec annulation illimitée et un bouton « recommencer » qui annule tout.`,`Une commande de déplacement mémorise la position du joueur et, s'il y en a une, de la caisse poussée.`]]},

'event-bus-so':{
r:[`Un asset ScriptableObject porte l'événement ; émetteurs et récepteurs ne connaissent que lui.`,`Toujours se désabonner dans OnDisable.`,`Pratique pour relier des systèmes et des prefabs testés séparément.`],
m:[
['Les ensembles d\'exécution (runtime sets)',`Même idée appliquée aux listes : un asset ~EnemySet~ dans lequel chaque ennemi s'ajoute dans ~OnEnable~ et se retire dans ~OnDisable~. L'interface qui compte les ennemis, la mini-carte et le gestionnaire de vagues lisent tous l'asset, sans ~FindObjectsByType~ ni singleton.`,`public abstract class RuntimeSet<T> : ScriptableObject
{
    public readonly List<T> Items = new List<T>();
    public void Add(T t)    { if (!Items.Contains(t)) Items.Add(t); }
    public void Remove(T t) => Items.Remove(t);
}`],
['Variables partagées',`Un asset ~FloatVariable~ (la vie du joueur) qu'écrit le joueur et que lisent la barre de vie et la musique. Attention : c'est un état global déguisé. Pratique pour des prototypes et les petites équipes, plus délicat dans un grand projet où l'on ne sait plus qui écrit quoi.`],
['Limites',`Un événement levé pendant le chargement d'une scène peut ne trouver personne. L'ordre d'appel des abonnés n'est pas garanti. Et un ScriptableObject modifié en Play Mode garde son contenu dans l'éditeur (voir [[scriptableobjects]]) : vide les listes et les variables au début de la partie.`]],
d:[[`Écris ~GameEvent<T>~ générique et ~IntGameEvent : GameEvent<int>~, avec un ~IntGameEventListener~ qui expose un ~UnityEvent<int>~. Utilise-le pour « le joueur a gagné X points ».`,`Unity sait sérialiser UnityEvent<int> directement dans les versions récentes.`],
[`Ajoute à ~GameEvent~ un bouton dans l'inspecteur (éditeur personnalisé) qui lève l'événement à la main en Play Mode, et une liste des abonnés actuels. C'est un outil de débogage très apprécié.`,`Un Custom Inspector avec un Button dont l'action appelle Raise ; grise-le hors Play Mode (EditorApplication.isPlaying).`]]}
});

window.LESSONS=(window.LESSONS||[]).concat([
{id:'gameobject-composants',cat:'unity',lvl:1,title:'GameObjects et composants',sum:'Tout objet de la scène est un GameObject vide auquel on accroche des composants.',
body:[
['L\'idée',`Un ~GameObject~ seul ne fait presque rien : il a un nom, un layer, un tag et un ~Transform~. Tout le reste vient de ses **composants** : un ~MeshRenderer~ pour s'afficher, un ~Collider~ pour la physique, tes scripts pour le comportement. C'est la [[composition]] appliquée à tout le moteur.`],
['Retrouver un composant',`~GetComponent<T>()~ sur le même objet, ~GetComponentInChildren<T>()~ et ~GetComponentInParent<T>()~ dans la hiérarchie. Ces recherches ont un coût : fais-les une fois dans ~Awake~ (voir [[cache-references]]). Glisser la référence dans l'inspecteur est encore mieux.`],
['Activer et désactiver',`~gameObject.SetActive(false)~ désactive l'objet et tous ses enfants : plus d'~Update~, plus de rendu, plus de physique. ~enabled = false~ sur un composant ne coupe que ce composant. ~activeInHierarchy~ dit si l'objet est vraiment actif, parents compris.`],
['Trouver des objets',`~GameObject.Find("Nom")~ et ~FindObjectsByType~ parcourent toute la scène : lents et fragiles (un renommage casse tout). À éviter en jeu, acceptables dans un outil d'éditeur. Préfère les références directes ou un registre (voir [[static-instance]]).`]],
ex:`Écris ~T[] GetComponentsInDirectChildren<T>(Transform parent)~ qui renvoie les composants T des enfants directs seulement (pas des petits-enfants), et ~void SetChildrenActive(Transform parent, bool on, string exceptName)~.`,
hint:`foreach (Transform child in parent) parcourt les enfants directs. TryGetComponent pour chacun.`,
sol:`public static T[] GetComponentsInDirectChildren<T>(Transform parent) where T : Component
{
    var result = new List<T>(parent.childCount);
    foreach (Transform child in parent)
        if (child.TryGetComponent(out T c)) result.Add(c);
    return result.ToArray();
}

public static void SetChildrenActive(Transform parent, bool on, string exceptName)
{
    foreach (Transform child in parent)
    {
        if (child.name == exceptName) continue;
        child.gameObject.SetActive(on);
    }
}`},

{id:'prefabs-instantiate',cat:'unity',lvl:1,title:'Prefabs et Instantiate',sum:'Des modèles d\'objets réutilisables, créés et détruits pendant le jeu.',
body:[
['L\'idée',`Un **prefab** est un GameObject enregistré comme asset, avec tous ses composants et réglages. Chaque copie dans une scène reste liée au modèle : modifier le prefab met à jour toutes les copies, sauf les valeurs qu'on a volontairement changées (les overrides).`],
['Instantiate',`~Instantiate(prefab, position, rotation)~ crée une copie pendant le jeu. Si le champ est typé avec un composant (~Bullet prefab~) plutôt que ~GameObject~, Instantiate renvoie directement ce composant : plus besoin de GetComponent.`,`[SerializeField] private Bullet bulletPrefab;
Bullet b = Instantiate(bulletPrefab, muzzle.position, muzzle.rotation);
b.Launch(speed);`],
['Destroy',`~Destroy(obj)~ détruit à la fin de l'image en cours, ~Destroy(obj, 3f)~ après 3 secondes. Attention à détruire le ~gameObject~ et non le composant : ~Destroy(this)~ ne retire que le script.`],
['Variantes et imbrication',`Une **variante** de prefab hérite d'un prefab de base et n'en change que quelques valeurs (un gobelin rouge plus fort). Les prefabs peuvent contenir d'autres prefabs. Pour créer et détruire en masse, voir [[object-pooling]].`]],
ex:`Écris un ~Spawner~ qui fait apparaître un prefab ~Enemy~ toutes les ~interval~ secondes à un point au hasard parmi une liste, sans dépasser ~maxAlive~ ennemis vivants, et range les ennemis sous un objet parent.`,
hint:`Garde une List<Enemy> et retire les ennemis détruits (== null) avant de compter.`,
sol:`public class Spawner : MonoBehaviour
{
    [SerializeField] private Enemy prefab;
    [SerializeField] private Transform[] points;
    [SerializeField] private float interval = 2f;
    [SerializeField] private int maxAlive = 10;

    private readonly List<Enemy> alive = new List<Enemy>();
    private float timer;

    private void Update()
    {
        timer += Time.deltaTime;
        if (timer < interval) return;
        timer = 0f;

        alive.RemoveAll(e => e == null);          // ennemis détruits entre-temps
        if (alive.Count >= maxAlive || points.Length == 0) return;

        Transform p = points[UnityEngine.Random.Range(0, points.Length)];
        Enemy e = Instantiate(prefab, p.position, p.rotation, transform);
        alive.Add(e);
    }
}`},

{id:'input-system',cat:'unity',lvl:1,title:'Lire les entrées (Input System)',sum:'Clavier, manette et souris avec le nouveau Input System et ses actions.',
body:[
['L\'idée',`Le nouveau **Input System** ne demande pas « la touche W est-elle appuyée ? » mais « l'action Move a-t-elle une valeur ? ». On définit des **actions** (Move, Jump, Fire) dans un asset, et on leur associe plusieurs touches : clavier, manette, écran tactile. Le code ne lit que les actions.`],
['Lire une action',`Une ~InputActionReference~ exposée dans l'inspecteur pointe vers une action de l'asset. ~action.ReadValue<Vector2>()~ lit un stick, ~action.WasPressedThisFrame()~ un appui. Il faut activer l'action (~Enable()~).`,`[SerializeField] private InputActionReference move;
private void OnEnable() => move.action.Enable();
private void Update()
{
    Vector2 v = move.action.ReadValue<Vector2>();
}`],
['Les événements',`On peut aussi s'abonner : ~jump.action.performed += OnJump~. Utile pour les appuis ponctuels, avec les mêmes règles d'abonnement que tout [[delegues-evenements|événement]].`],
['L\'ancien système',`~Input.GetAxis~ et ~Input.GetKeyDown~ existent toujours et apparaissent dans beaucoup d'exemples, dont certains de ces cours. Ils restent pratiques pour un prototype. Le nouveau système est recommandé pour un vrai projet : multi-appareils, remappage des touches, joueurs multiples.`]],
ex:`Écris un ~PlayerInputReader~ qui expose ~Vector2 Move~ et un événement ~Jumped~, à partir de deux ~InputActionReference~, en activant et désactivant proprement les actions, et en corrigeant la diagonale trop rapide.`,
hint:`Active dans OnEnable, désactive dans OnDisable, et abonne/désabonne performed au même endroit. ClampMagnitude pour la diagonale.`,
sol:`public class PlayerInputReader : MonoBehaviour
{
    [SerializeField] private InputActionReference moveAction;
    [SerializeField] private InputActionReference jumpAction;

    public Vector2 Move { get; private set; }
    public event Action Jumped;

    private void OnEnable()
    {
        moveAction.action.Enable();
        jumpAction.action.Enable();
        jumpAction.action.performed += OnJump;
    }

    private void OnDisable()
    {
        jumpAction.action.performed -= OnJump;
        moveAction.action.Disable();
        jumpAction.action.Disable();
    }

    private void Update()
    {
        Move = Vector2.ClampMagnitude(moveAction.action.ReadValue<Vector2>(), 1f);
    }

    private void OnJump(InputAction.CallbackContext ctx) => Jumped?.Invoke();
}`},

{id:'rigidbody-forces',cat:'unity',lvl:2,title:'Rigidbody et forces',sum:'AddForce, ForceMode, vitesse et kinematic : faire bouger un objet avec la physique.',
body:[
['L\'idée',`Un ~Rigidbody~ confie l'objet au moteur physique : gravité, collisions, inertie. On ne déplace plus le Transform directement (ça « téléporte » l'objet et casse les collisions) : on applique des forces ou on règle la vitesse, dans [[cycle-de-vie|FixedUpdate]].`],
['Les ForceMode',`~Force~ : poussée continue, dépend de la masse (un moteur). ~Acceleration~ : pareil sans tenir compte de la masse. ~Impulse~ : coup instantané qui dépend de la masse (un saut, une explosion). ~VelocityChange~ : changement de vitesse immédiat, sans la masse.`],
['Kinematic',`Un Rigidbody **kinematic** ne subit aucune force mais pousse les autres. On le déplace avec ~MovePosition~ et ~MoveRotation~ : parfait pour une plateforme mobile ou une porte. Ne pas modifier le Transform d'un Rigidbody non kinematic.`],
['Interpolation',`La physique tourne à pas fixe (50 fois par seconde par défaut), l'affichage plus souvent : l'objet peut sembler saccadé. Régler ~Interpolate~ sur le Rigidbody lisse l'affichage, surtout pour ce que suit la caméra.`]],
ex:`Écris ~Jumper~ : un saut à hauteur précise (calcule la vitesse initiale avec √(2 × g × h)), autorisé seulement au sol, et ~ApplyExplosion(Vector3 center, float force, float radius)~ qui pousse tous les Rigidbody à portée.`,
hint:`Vitesse : Mathf.Sqrt(2f × −Physics.gravity.y × height), en VelocityChange. Explosion : Physics.OverlapSphere puis AddExplosionForce.`,
sol:`[RequireComponent(typeof(Rigidbody))]
public class Jumper : MonoBehaviour
{
    [SerializeField] private float jumpHeight = 2f;
    [SerializeField] private LayerMask ground;
    private Rigidbody body;
    private bool jumpRequested;

    private void Awake() => body = GetComponent<Rigidbody>();

    private void Update()
    {
        if (Input.GetButtonDown("Jump")) jumpRequested = true;
    }

    private void FixedUpdate()
    {
        if (!jumpRequested) return;
        jumpRequested = false;

        bool grounded = Physics.Raycast(transform.position + Vector3.up * 0.1f, Vector3.down, 0.2f, ground);
        if (!grounded) return;

        float v = Mathf.Sqrt(2f * -Physics.gravity.y * jumpHeight);
        Vector3 vel = body.linearVelocity;
        vel.y = 0f;                                   // un saut reproductible
        body.linearVelocity = vel;
        body.AddForce(Vector3.up * v, ForceMode.VelocityChange);
    }
}

public static void ApplyExplosion(Vector3 center, float force, float radius)
{
    foreach (Collider c in Physics.OverlapSphere(center, radius))
    {
        if (c.attachedRigidbody != null)
            c.attachedRigidbody.AddExplosionForce(force, center, radius, 0.5f, ForceMode.Impulse);
    }
}`},

{id:'collisions-triggers',cat:'unity',lvl:1,title:'Collisions et triggers',sum:'OnCollisionEnter, OnTriggerEnter : réagir quand deux objets se touchent.',
body:[
['L\'idée',`Deux colliders qui se touchent déclenchent des messages sur les scripts des deux objets. Un collider normal **bloque** et envoie ~OnCollisionEnter/Stay/Exit~. Un collider marqué ~Is Trigger~ **laisse passer** et envoie ~OnTriggerEnter/Stay/Exit~ : zones de détection, objets à ramasser, checkpoints.`],
['La condition oubliée',`Il faut qu'au moins **un des deux** objets ait un ~Rigidbody~ (même kinematic), sinon aucun message n'est envoyé. C'est la cause numéro un des « mon OnTriggerEnter ne marche pas ». Pour la 2D, les versions ~2D~ (~OnTriggerEnter2D~, ~Rigidbody2D~) sont indispensables.`],
['Les informations de collision',`~Collision~ donne les points de contact, la normale et la vitesse relative (~relativeVelocity~), utile pour des dégâts proportionnels à la violence du choc. ~Collider other~ dans un trigger permet de chercher un composant avec ~TryGetComponent~ ou une [[interfaces|interface]].`],
['Filtrer',`La matrice des collisions par layer (Project Settings > Physics) évite que les balles se touchent entre elles. Plus fin : vérifier un tag avec ~other.CompareTag("Player")~, plus rapide que ~other.tag == "Player"~. Voir aussi [[operations-bits]].`]],
ex:`Écris ~Checkpoint~ (trigger) qui enregistre la position de réapparition du joueur et change de couleur une seule fois, puis ~ImpactDamage~ qui inflige des dégâts proportionnels à la vitesse du choc au-delà d'un seuil.`,
hint:`CompareTag pour le joueur. Pour l'impact : collision.relativeVelocity.magnitude, puis TryGetComponent sur collision.collider.`,
sol:`public class Checkpoint : MonoBehaviour
{
    [SerializeField] private Renderer flag;
    [SerializeField] private Color activeColor = Color.green;
    private bool reached;

    public static Vector3 RespawnPoint { get; private set; }

    private void OnTriggerEnter(Collider other)
    {
        if (reached || !other.CompareTag("Player")) return;
        reached = true;
        RespawnPoint = transform.position;
        flag.material.color = activeColor;
    }
}

public class ImpactDamage : MonoBehaviour
{
    [SerializeField] private float minSpeed = 4f;
    [SerializeField] private float damagePerSpeed = 5f;

    private void OnCollisionEnter(Collision collision)
    {
        float speed = collision.relativeVelocity.magnitude;
        if (speed < minSpeed) return;

        if (collision.collider.TryGetComponent(out IDamageable target))
            target.TakeDamage(Mathf.RoundToInt((speed - minSpeed) * damagePerSpeed));
    }
}`},

{id:'camera-suivi',cat:'unity',lvl:2,title:'Caméra qui suit le joueur',sum:'Suivi doux, anticipation du mouvement et limites de terrain, dans LateUpdate.',
body:[
['L\'idée',`Une caméra collée au joueur est raide et donne mal au cœur. Une bonne caméra **suit avec un léger retard**, regarde un peu là où le joueur va, et reste dans les limites du niveau. On la met à jour dans ~LateUpdate~, après que tout a bougé (voir [[cycle-de-vie]]).`],
['Le suivi doux',`[[smoothdamp-ressort|SmoothDamp]] est l'outil habituel : il part de la vitesse actuelle et ne dépasse pas. Un [[interpolation|Lerp exponentiel]] marche aussi, à condition de le rendre indépendant du framerate.`],
['L\'anticipation',`On vise un point légèrement devant le joueur, dans la direction de sa vitesse (« look ahead ») : on voit mieux où l'on va. On lisse aussi ce décalage, sinon la caméra saute à chaque demi-tour.`],
['Cinemachine',`Le paquet Cinemachine fait tout cela et bien plus, sans code. Écrire sa propre caméra reste un excellent exercice, et souvent suffisant pour un jeu 2D.`]],
ex:`Écris une caméra 2D ~FollowCamera~ : suit une cible avec SmoothDamp, ajoute une anticipation de ~lookAhead~ unités dans le sens de la vitesse de la cible (lissée elle aussi), et reste dans un ~Rect bounds~ en tenant compte de la taille visible de la caméra orthographique.`,
hint:`Demi-hauteur visible : cam.orthographicSize ; demi-largeur : orthographicSize × cam.aspect. Borne x entre bounds.xMin + demi-largeur et bounds.xMax − demi-largeur.`,
sol:`[RequireComponent(typeof(Camera))]
public class FollowCamera : MonoBehaviour
{
    [SerializeField] private Rigidbody2D target;
    [SerializeField] private float smoothTime = 0.25f;
    [SerializeField] private float lookAhead = 2f;
    [SerializeField] private Rect bounds = new Rect(-50, -20, 100, 40);

    private Camera cam;
    private Vector3 velocity;
    private float aheadX, aheadVel;

    private void Awake() => cam = GetComponent<Camera>();

    private void LateUpdate()
    {
        float dir = Mathf.Abs(target.linearVelocity.x) > 0.1f ? Mathf.Sign(target.linearVelocity.x) : 0f;
        aheadX = Mathf.SmoothDamp(aheadX, dir * lookAhead, ref aheadVel, 0.5f);

        Vector3 goal = (Vector3)target.position + new Vector3(aheadX, 0f, 0f);
        goal.z = transform.position.z;

        Vector3 p = Vector3.SmoothDamp(transform.position, goal, ref velocity, smoothTime);

        float halfH = cam.orthographicSize, halfW = halfH * cam.aspect;
        p.x = Mathf.Clamp(p.x, bounds.xMin + halfW, bounds.xMax - halfW);
        p.y = Mathf.Clamp(p.y, bounds.yMin + halfH, bounds.yMax - halfH);
        transform.position = p;
    }
}`},

{id:'ui-canvas',cat:'unity',lvl:1,title:'Interface : Canvas et boutons',sum:'Afficher des textes, des barres et des boutons, et les relier au code.',
body:[
['L\'idée',`L'interface de jeu classique (uGUI) vit dans un ~Canvas~. Chaque élément a un ~RectTransform~ : position, taille et **ancres** qui disent comment il suit les bords de l'écran. Bien ancrer, c'est ce qui fait qu'une interface tient sur tous les formats d'écran.`],
['Textes et images',`~TMP_Text~ (TextMeshPro) pour le texte, ~Image~ pour les visuels. Une barre de vie est une Image en mode ~Filled~ dont on règle ~fillAmount~ entre 0 et 1.`],
['Boutons',`~button.onClick.AddListener(Methode)~ relie un bouton au code. On peut aussi le faire dans l'inspecteur, mais le code est plus facile à suivre et à retrouver. Attention au piège de la boucle avec les [[lambdas-closures|lambdas]].`],
['Performance',`Tout changement dans un Canvas peut forcer Unity à reconstruire tout le Canvas. Sépare les parties qui changent souvent (une minuterie) de celles qui sont fixes, dans des Canvas différents. Et ne mets à jour un texte que si la valeur change (voir [[allocations-gc]] et [[separation-donnees-vue]]).`]],
ex:`Écris ~HealthBarUI~ qui affiche une barre (Image Filled) qui descend en douceur vers la vraie valeur, et une seconde barre « dégâts récents » qui la suit avec un retard, comme dans les jeux de combat.`,
hint:`La barre principale se règle tout de suite, la barre de retard attend 0,4 s puis descend avec MoveTowards.`,
sol:`public class HealthBarUI : MonoBehaviour
{
    [SerializeField] private Image fill;        // barre principale
    [SerializeField] private Image lag;         // barre "dégâts récents", derrière
    [SerializeField] private float lagDelay = 0.4f, lagSpeed = 0.8f;

    private float target = 1f, lagTimer;

    public void SetRatio(float ratio)
    {
        ratio = Mathf.Clamp01(ratio);
        if (ratio < target) lagTimer = lagDelay;   // on vient de prendre des dégâts
        target = ratio;
        fill.fillAmount = ratio;
        if (lag.fillAmount < ratio) lag.fillAmount = ratio;   // soin : suit tout de suite
    }

    private void Update()
    {
        if (lagTimer > 0f) { lagTimer -= Time.deltaTime; return; }
        lag.fillAmount = Mathf.MoveTowards(lag.fillAmount, target, lagSpeed * Time.deltaTime);
    }
}`},

{id:'animator-parametres',cat:'unity',lvl:2,title:'Piloter l\'Animator',sum:'Paramètres, transitions et événements d\'animation depuis le code.',
body:[
['L\'idée',`L'~Animator~ est une [[machine-etats]] visuelle : chaque état joue une animation, les transitions dépendent de **paramètres** (float, int, bool, trigger). Le code ne lance pas les animations directement : il met à jour les paramètres, et l'Animator décide.`],
['Les paramètres',`~animator.SetFloat("Speed", v)~ pour un mélange (marche vers course), ~SetBool("Grounded", g)~ pour un état durable, ~SetTrigger("Attack")~ pour un événement ponctuel. Les chaînes sont lentes et fragiles : convertis-les une fois avec ~Animator.StringToHash~.`,`private static readonly int SpeedId = Animator.StringToHash("Speed");
animator.SetFloat(SpeedId, speed, 0.1f, Time.deltaTime); // avec lissage`],
['Événements d\'animation',`Une animation peut appeler une méthode du script à une image précise : le pied qui touche le sol (son de pas), le moment où l'épée frappe (dégâts). Plus fiable qu'un délai codé en dur.`],
['Les pièges',`Un trigger non consommé reste armé et se déclenche plus tard, au mauvais moment : ~ResetTrigger~ si besoin. Une transition avec « Has Exit Time » attend la fin de l'animation : décoche-le pour les réactions immédiates.`]],
ex:`Écris ~CharacterAnimator~ qui lit la vitesse d'un Rigidbody et l'état au sol, met à jour les paramètres Speed (lissé), Grounded et VerticalSpeed avec des hash, expose ~PlayAttack()~, et reçoit un événement d'animation ~OnFootstep()~ qui joue un son.`,
hint:`Trois hash static readonly. La vitesse horizontale : new Vector3(v.x, 0, v.z).magnitude.`,
sol:`public class CharacterAnimator : MonoBehaviour
{
    private static readonly int SpeedId = Animator.StringToHash("Speed");
    private static readonly int GroundedId = Animator.StringToHash("Grounded");
    private static readonly int VerticalId = Animator.StringToHash("VerticalSpeed");
    private static readonly int AttackId = Animator.StringToHash("Attack");

    [SerializeField] private Animator animator;
    [SerializeField] private Rigidbody body;
    [SerializeField] private AudioSource footstepSource;
    [SerializeField] private AudioClip[] footsteps;

    public bool Grounded { get; set; }

    private void Update()
    {
        Vector3 v = body.linearVelocity;
        float horizontal = new Vector3(v.x, 0f, v.z).magnitude;
        animator.SetFloat(SpeedId, horizontal, 0.1f, Time.deltaTime);
        animator.SetBool(GroundedId, Grounded);
        animator.SetFloat(VerticalId, v.y);
    }

    public void PlayAttack() => animator.SetTrigger(AttackId);

    // Appelé par un événement placé dans les clips de marche et de course
    public void OnFootstep()
    {
        if (!Grounded || footsteps.Length == 0) return;
        footstepSource.PlayOneShot(footsteps[UnityEngine.Random.Range(0, footsteps.Length)]);
    }
}`},

{id:'chargement-scenes',cat:'unity',lvl:2,title:'Charger des scènes',sum:'LoadSceneAsync, écran de chargement et scènes additives.',
body:[
['L\'idée',`~SceneManager.LoadScene("Level2")~ charge une scène et bloque le jeu pendant ce temps. ~LoadSceneAsync~ charge en arrière-plan et renvoie une ~AsyncOperation~ dont on suit la progression : c'est la base d'un écran de chargement.`],
['La progression',`~operation.progress~ monte jusqu'à **0,9** et pas 1 : les derniers 10 % sont l'activation de la scène. Avec ~allowSceneActivation = false~, la scène attend à 0,9 qu'on l'autorise, pratique pour afficher « Appuie sur une touche ».`],
['Le mode additif',`~LoadSceneMode.Additive~ ajoute une scène sans fermer les autres. On découpe ainsi un jeu en morceaux : une scène « Core » toujours chargée (joueur, interface, audio), et des scènes de niveaux qui vont et viennent. ~UnloadSceneAsync~ les décharge.`],
['Ce qui survit',`Les objets marqués ~DontDestroyOnLoad~ (voir [[singleton]]) et les [[scriptableobjects]] survivent aux changements de scène. Les [[static-instance|champs static]] aussi. Avec [[async-await]], on peut écrire ~await SceneManager.LoadSceneAsync(...)~ directement.`]],
ex:`Écris ~SceneLoader~ avec une coroutine ~LoadWithScreen(string scene)~ : affiche un écran de chargement, charge la scène en asynchrone, met à jour une barre de 0 à 100 % (en corrigeant le 0,9), garde l'écran au moins 1 seconde, puis active la scène.`,
hint:`progress / 0.9f pour la barre. allowSceneActivation = false, puis true une fois la durée minimale écoulée.`,
sol:`public class SceneLoader : MonoBehaviour
{
    [SerializeField] private GameObject loadingScreen;
    [SerializeField] private Image progressBar;
    [SerializeField] private float minDuration = 1f;

    private void Awake() => DontDestroyOnLoad(gameObject);

    public void Load(string scene) => StartCoroutine(LoadWithScreen(scene));

    private IEnumerator LoadWithScreen(string scene)
    {
        loadingScreen.SetActive(true);
        float start = Time.unscaledTime;

        AsyncOperation op = SceneManager.LoadSceneAsync(scene);
        op.allowSceneActivation = false;

        while (op.progress < 0.9f || Time.unscaledTime - start < minDuration)
        {
            progressBar.fillAmount = Mathf.Clamp01(op.progress / 0.9f);
            yield return null;
        }

        progressBar.fillAmount = 1f;
        op.allowSceneActivation = true;
        while (!op.isDone) yield return null;

        loadingScreen.SetActive(false);
    }
}`},

{id:'serialisation',cat:'unity',lvl:2,title:'Sérialisation dans Unity',sum:'Ce que Unity enregistre et affiche dans l\'inspecteur, et ce qu\'il ignore.',
body:[
['L\'idée',`La **sérialisation** transforme un objet en données enregistrables. Unity sérialise les scènes, les prefabs et les [[scriptableobjects]], et l'inspecteur n'affiche que ce qui est sérialisé.`],
['Les règles',`Sont sérialisés : les champs ~public~ ou ~[SerializeField]~, de types simples, d'objets Unity, de listes et tableaux, et de classes ou struct marquées ~[Serializable]~. Ne le sont **pas** : les propriétés, les champs static, ~readonly~, les ~Dictionary~, les types génériques ouverts et les interfaces.`],
['[Serializable]',`Une petite classe C# marquée ~[Serializable]~ apparaît comme un bloc dépliable dans l'inspecteur. Parfait pour regrouper des réglages (~WaveSettings~). Attention : chaque champ de ce type est une **copie**, pas une référence partagée.`],
['[SerializeReference]',`Permet de sérialiser une vraie référence, avec polymorphisme : une liste d'~IEffect~ contenant des ~DamageEffect~ et des ~SlowEffect~. Unity n'a pas de bouton natif pour choisir le type concret dans l'inspecteur ; on l'ajoute avec un petit outil d'éditeur (voir [[custom-inspector]]).`],
['Renommer sans perdre',`Renommer un champ fait perdre sa valeur dans tous les assets. ~[FormerlySerializedAs("ancienNom")]~ fait le lien. Voir aussi [[sauvegarde-json]].`]],
ex:`Écris un ~[Serializable]~ ~SpawnEntry~ (prefab, poids, nombre max), un ~WaveConfig~ (ScriptableObject) qui contient une liste de SpawnEntry et une durée, et renomme le champ ~duration~ en ~durationSeconds~ sans perdre les valeurs existantes.`,
hint:`[FormerlySerializedAs("duration")] juste avant le nouveau champ. using UnityEngine.Serialization.`,
sol:`[Serializable]
public class SpawnEntry
{
    public GameObject prefab;
    [Min(0f)] public float weight = 1f;
    [Min(1)] public int maxCount = 5;
}

[CreateAssetMenu(menuName = "Game/Wave Config")]
public class WaveConfig : ScriptableObject
{
    public List<SpawnEntry> entries = new List<SpawnEntry>();

    [FormerlySerializedAs("duration")]
    [Min(1f)] public float durationSeconds = 30f;
}`},

{id:'sauvegarde-json',cat:'unity',lvl:2,title:'Sauvegarder en JSON',sum:'Enregistrer la progression du joueur dans un fichier, et la recharger sans risque.',
body:[
['L\'idée',`On rassemble ce qu'il faut sauver dans une classe ~[Serializable]~ (~SaveData~), on la convertit en texte JSON avec ~JsonUtility.ToJson~, et on l'écrit dans ~Application.persistentDataPath~, le dossier prévu pour les données du joueur sur chaque plateforme.`],
['JsonUtility et ses limites',`~JsonUtility~ suit les mêmes règles que la [[serialisation]] de Unity : pas de Dictionary, pas de propriétés. Pour des structures plus riches, la bibliothèque Newtonsoft Json (paquet officiel ~com.unity.nuget.newtonsoft-json~) est plus souple.`],
['Écrire sans corrompre',`Si le jeu plante pendant l'écriture, le fichier peut être à moitié écrit. On écrit dans un fichier temporaire, puis on remplace l'ancien : la sauvegarde précédente reste intacte en cas de problème. Le chargement gère l'absence et la corruption (voir [[exceptions]]).`],
['Versionner',`Ajoute un champ ~version~ dès le début. Quand le format change, le chargement peut convertir une ancienne sauvegarde au lieu de la perdre. ~PlayerPrefs~ convient pour des réglages (volume, langue), pas pour une progression.`]],
ex:`Écris ~SaveData~ (version, niveau atteint, or, liste d'objets débloqués) et une classe static ~SaveSystem~ avec ~Save(SaveData)~ en écriture sûre (fichier temporaire puis remplacement) et ~SaveData Load()~ qui renvoie une sauvegarde neuve si le fichier manque ou est illisible.`,
hint:`File.WriteAllText sur path + ".tmp", puis File.Copy(tmp, path, true) et File.Delete(tmp). Application.persistentDataPath pour le dossier.`,
sol:`[Serializable]
public class SaveData
{
    public int version = 1;
    public int level = 1;
    public int gold;
    public List<string> unlocked = new List<string>();
}

public static class SaveSystem
{
    private static string Path => System.IO.Path.Combine(Application.persistentDataPath, "save.json");

    public static void Save(SaveData data)
    {
        string json = JsonUtility.ToJson(data, prettyPrint: true);
        string tmp = Path + ".tmp";
        File.WriteAllText(tmp, json);      // si ça plante ici, l'ancienne sauvegarde est intacte
        File.Copy(tmp, Path, overwrite: true);
        File.Delete(tmp);
    }

    public static SaveData Load()
    {
        if (!File.Exists(Path)) return new SaveData();
        try
        {
            SaveData data = JsonUtility.FromJson<SaveData>(File.ReadAllText(Path));
            return data ?? new SaveData();
        }
        catch (Exception e)
        {
            Debug.LogWarning($"Sauvegarde illisible, nouvelle partie : {e.Message}");
            return new SaveData();
        }
    }
}`},

{id:'gizmos',cat:'unity',lvl:1,title:'Gizmos et débogage visuel',sum:'Dessiner des rayons, des zones et des chemins dans la vue Scene pour comprendre ce que fait le code.',
body:[
['L\'idée',`Un nombre dans la Console dit peu de chose ; un cercle de portée dessiné autour d'un ennemi dit tout de suite si le réglage est bon. ~OnDrawGizmos~ dessine dans la vue Scene (et dans le Game view si les gizmos y sont activés), uniquement dans l'éditeur.`],
['Les fonctions',`~Gizmos.DrawWireSphere~, ~DrawLine~, ~DrawRay~, ~DrawWireCube~, ~DrawIcon~. ~Gizmos.color~ change la couleur pour les appels suivants. ~OnDrawGizmosSelected~ ne dessine que quand l'objet est sélectionné, ce qui évite d'encombrer la vue.`],
['Debug.DrawLine',`~Debug.DrawLine(a, b, color, duration)~ s'appelle depuis n'importe où (par exemple dans ~Update~) et reste visible le temps demandé. Parfait pour visualiser un [[raycast]] au moment où il est lancé.`],
['Aller plus loin',`~Gizmos.matrix~ dessine dans un repère tourné (voir [[matrices]]). Pour des poignées qu'on peut attraper à la souris, voir [[handles-scene]].`]],
ex:`Ajoute à un garde un ~OnDrawGizmosSelected~ qui dessine son rayon d'alerte, son cône de vision (deux lignes et un arc approximé par des segments) et une ligne vers le joueur, verte s'il le voit et rouge sinon.`,
hint:`Les bords du cône : Quaternion.AngleAxis(±fov/2, Vector3.up) × transform.forward. L'arc : une dizaine de segments entre les deux bords.`,
sol:`public class GuardGizmos : MonoBehaviour
{
    [SerializeField] private float range = 8f;
    [SerializeField] private float fov = 90f;
    [SerializeField] private Transform player;

    private void OnDrawGizmosSelected()
    {
        Vector3 p = transform.position;

        Gizmos.color = new Color(1f, 0.6f, 0f, 0.6f);
        Gizmos.DrawWireSphere(p, range);

        Gizmos.color = Color.yellow;
        const int segments = 12;
        Vector3 prev = p;
        for (int i = 0; i <= segments; i++)
        {
            float a = -fov / 2f + fov * i / segments;
            Vector3 point = p + Quaternion.AngleAxis(a, Vector3.up) * transform.forward * range;
            Gizmos.DrawLine(prev, point);
            prev = point;
        }
        Gizmos.DrawLine(prev, p);

        if (player == null) return;
        Vector3 to = player.position - p;
        bool sees = to.sqrMagnitude <= range * range
                 && Vector3.Angle(transform.forward, to) <= fov / 2f;
        Gizmos.color = sees ? Color.green : Color.red;
        Gizmos.DrawLine(p, player.position);
    }
}`},

{id:'time-scale-pause',cat:'unity',lvl:1,title:'Time.timeScale et pause',sum:'Ralentir, accélérer ou mettre le jeu en pause, sans figer les menus.',
body:[
['L\'idée',`~Time.timeScale~ règle la vitesse du temps du jeu : 1 normal, 0,5 ralenti, 0 pause. ~Time.deltaTime~ est multiplié par ce facteur, donc tout ce qui l'utilise ralentit ou s'arrête. La physique et les animations aussi.`],
['Ce qui continue en pause',`~Time.unscaledDeltaTime~ et ~Time.unscaledTime~ ignorent le timeScale : à utiliser pour animer les menus de pause. ~WaitForSecondsRealtime~ pour les [[coroutines]]. Un Animator d'interface doit passer en mode « Unscaled Time ».`],
['Le ralenti',`Pour un ralenti, réduis aussi ~Time.fixedDeltaTime~ dans les mêmes proportions, sinon la physique devient saccadée (elle fait moins de pas par seconde).`,`Time.timeScale = 0.3f;
Time.fixedDeltaTime = 0.02f * Time.timeScale;`],
['Le piège',`~Update~ continue d'être appelé à timeScale 0 : seul deltaTime vaut 0. Une entrée lue dans Update agit donc toujours (le joueur peut tirer en pause). Vérifie l'état de pause dans ton code de jeu.`]],
ex:`Écris ~PauseManager~ : Échap met en pause ou reprend, affiche un menu, mémorise et restaure le timeScale précédent (le jeu était peut-être au ralenti), restaure aussi fixedDeltaTime, et expose ~IsPaused~ et un événement ~PauseChanged~.`,
hint:`Garde savedScale et savedFixed au moment de la pause. Lis l'entrée même en pause, puisque Update tourne toujours.`,
sol:`public class PauseManager : MonoBehaviour
{
    [SerializeField] private GameObject pauseMenu;

    public bool IsPaused { get; private set; }
    public event Action<bool> PauseChanged;

    private float savedScale = 1f;
    private float savedFixed = 0.02f;

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape)) SetPaused(!IsPaused);
    }

    public void SetPaused(bool paused)
    {
        if (paused == IsPaused) return;
        IsPaused = paused;

        if (paused)
        {
            savedScale = Time.timeScale;
            savedFixed = Time.fixedDeltaTime;
            Time.timeScale = 0f;
        }
        else
        {
            Time.timeScale = savedScale;
            Time.fixedDeltaTime = savedFixed;
        }

        pauseMenu.SetActive(paused);
        PauseChanged?.Invoke(paused);
    }
}`},

{id:'audio',cat:'unity',lvl:1,title:'Jouer des sons',sum:'AudioSource, PlayOneShot, variations et sons 3D.',
body:[
['L\'idée',`Un ~AudioClip~ est le fichier son, une ~AudioSource~ le haut-parleur qui le joue, l'~AudioListener~ (sur la caméra) l'oreille. ~source.Play()~ joue le clip assigné ; ~source.PlayOneShot(clip)~ joue un clip en plus, sans couper le précédent : idéal pour les effets.`],
['Éviter la répétition',`Le même son de pas répété à l'identique fatigue vite l'oreille. On choisit au hasard parmi plusieurs clips et on fait varier légèrement le ~pitch~ (entre 0,9 et 1,1) et le volume. L'effet est immédiat sur la qualité perçue.`],
['Son 3D',`~spatialBlend~ à 1 rend le son positionnel : il dépend de la distance et de la direction par rapport à l'oreille. Les courbes de distance (min et max) se règlent sur la source. La musique et l'interface restent en 2D (~spatialBlend~ à 0).`],
['Mixer',`Un ~AudioMixer~ regroupe les sons en groupes (musique, effets, voix) avec leur propre volume : c'est ce que règlent les curseurs d'options. Le volume d'un mixer est en décibels : convertis un curseur linéaire avec ~Mathf.Log10(v) * 20~.`]],
ex:`Écris ~SfxPlayer~ avec ~Play(AudioClip[] variants, Vector3 position)~ : choisit un clip au hasard (jamais deux fois le même de suite), varie le pitch, joue en 3D à la position donnée à partir d'un petit pool d'AudioSource réutilisées. Puis ~SetVolume(AudioMixer m, string param, float linear)~.`,
hint:`Pool : un tableau d'AudioSource enfants, on prend la suivante en boucle. Volume : Log10(max(linear, 0,0001)) × 20.`,
sol:`public class SfxPlayer : MonoBehaviour
{
    [SerializeField] private int voices = 8;
    private AudioSource[] sources;
    private int next;
    private AudioClip last;

    private void Awake()
    {
        sources = new AudioSource[voices];
        for (int i = 0; i < voices; i++)
        {
            var go = new GameObject("Voice " + i);
            go.transform.SetParent(transform);
            sources[i] = go.AddComponent<AudioSource>();
            sources[i].spatialBlend = 1f;
            sources[i].playOnAwake = false;
        }
    }

    public void Play(AudioClip[] variants, Vector3 position)
    {
        if (variants == null || variants.Length == 0) return;

        AudioClip clip = variants[UnityEngine.Random.Range(0, variants.Length)];
        if (clip == last && variants.Length > 1)
            clip = variants[(Array.IndexOf(variants, clip) + 1) % variants.Length];
        last = clip;

        AudioSource s = sources[next];
        next = (next + 1) % sources.Length;
        s.transform.position = position;
        s.pitch = UnityEngine.Random.Range(0.92f, 1.08f);
        s.PlayOneShot(clip);
    }

    public static void SetVolume(AudioMixer mixer, string param, float linear)
    {
        float db = Mathf.Log10(Mathf.Max(linear, 0.0001f)) * 20f;
        mixer.SetFloat(param, db);
    }
}`},

{id:'navmesh',cat:'unity',lvl:2,title:'NavMesh et agents',sum:'Faire se déplacer des personnages en évitant les obstacles, avec le système de navigation intégré.',
body:[
['L\'idée',`Le **NavMesh** est une carte des zones où l'on peut marcher, calculée à partir du décor. Un ~NavMeshAgent~ s'y déplace tout seul : il trouve un chemin (avec un algorithme proche d'[[astar|A*]]), contourne les obstacles et évite les autres agents. Le paquet AI Navigation fournit le composant ~NavMeshSurface~ qui fait ce calcul.`],
['Les commandes',`~agent.SetDestination(point)~ lance le déplacement. ~agent.remainingDistance~ et ~agent.pathPending~ disent où il en est. ~agent.isStopped = true~ l'arrête. ~agent.speed~, ~angularSpeed~ et ~stoppingDistance~ règlent son comportement.`],
['Les pièges',`~remainingDistance~ vaut 0 tant que le chemin est en cours de calcul : vérifie ~pathPending~ d'abord. Une destination hors du NavMesh échoue : ~NavMesh.SamplePosition~ trouve le point marchable le plus proche. Ne pas appeler SetDestination à chaque image si la cible ne bouge pas.`],
['Avec les animations',`On peut laisser l'agent déplacer le Transform et lire ~agent.velocity~ pour l'[[animator-parametres|Animator]], ou faire l'inverse (le « root motion » pilote la position) en désactivant ~updatePosition~.`]],
ex:`Écris un ~Wanderer~ qui choisit un point marchable au hasard dans un rayon, s'y rend, attend entre 1 et 3 secondes, puis recommence. Il doit gérer correctement le calcul de chemin en cours.`,
hint:`Point au hasard : Random.insideUnitSphere × rayon, puis NavMesh.SamplePosition. Arrivée : !pathPending && remainingDistance <= stoppingDistance.`,
sol:`[RequireComponent(typeof(NavMeshAgent))]
public class Wanderer : MonoBehaviour
{
    [SerializeField] private float radius = 10f;
    private NavMeshAgent agent;
    private float waitUntil;

    private void Awake() => agent = GetComponent<NavMeshAgent>();

    private void Start() => PickDestination();

    private void Update()
    {
        if (agent.pathPending) return;
        bool arrived = agent.remainingDistance <= agent.stoppingDistance;
        if (!arrived) return;

        if (waitUntil == 0f)
            waitUntil = Time.time + UnityEngine.Random.Range(1f, 3f);
        else if (Time.time >= waitUntil)
        {
            waitUntil = 0f;
            PickDestination();
        }
    }

    private void PickDestination()
    {
        for (int i = 0; i < 10; i++)   // quelques essais
        {
            Vector3 candidate = transform.position + UnityEngine.Random.insideUnitSphere * radius;
            if (NavMesh.SamplePosition(candidate, out NavMeshHit hit, 2f, NavMesh.AllAreas))
            {
                agent.SetDestination(hit.position);
                return;
            }
        }
    }
}`},

{id:'addressables',cat:'unity',lvl:3,title:'Addressables',sum:'Charger et décharger du contenu à la demande, par adresse, au lieu de tout mettre dans la scène.',
body:[
['L\'idée',`Une référence directe dans une scène (un prefab glissé dans l'inspecteur) charge l'asset en mémoire **avec la scène**, qu'on s'en serve ou non. Les **Addressables** chargent un asset à la demande, par une adresse ou une ~AssetReference~, et le libèrent quand on n'en a plus besoin.`],
['Charger et libérer',`~Addressables.LoadAssetAsync<T>(clé)~ renvoie un ~handle~ : on attend qu'il soit prêt, on utilise le résultat, puis ~Addressables.Release(handle)~. ~InstantiateAsync~ crée directement un objet, à libérer avec ~ReleaseInstance~.`],
['Le piège de la libération',`Chaque chargement augmente un compteur, chaque ~Release~ le diminue ; l'asset est déchargé quand il retombe à 0. Oublier un Release fait fuir la mémoire ; en faire un de trop décharge un asset encore utilisé. Garde le handle et libère-le au même endroit où tu l'as obtenu (par exemple dans ~OnDestroy~).`],
['Groupes et builds',`Les assets sont rangés en groupes, construits en paquets (bundles) avant le build du jeu, éventuellement hébergés sur un serveur pour des mises à jour de contenu sans republier le jeu. Le build des Addressables s'automatise comme le reste (voir [[build-ligne-commande]]).`]],
ex:`Écris ~BossLoader~ : quand le joueur entre dans une zone (trigger), charge le prefab du boss par ~AssetReferenceGameObject~, l'instancie, et libère tout quand le composant est détruit. Un second passage dans la zone ne doit pas le charger deux fois.`,
hint:`InstantiateAsync renvoie un handle ; garde-le et appelle Addressables.ReleaseInstance(handle) dans OnDestroy si handle.IsValid().`,
sol:`public class BossLoader : MonoBehaviour
{
    [SerializeField] private AssetReferenceGameObject bossPrefab;
    [SerializeField] private Transform spawnPoint;

    private AsyncOperationHandle<GameObject> handle;
    private bool requested;

    private void OnTriggerEnter(Collider other)
    {
        if (requested || !other.CompareTag("Player")) return;
        requested = true;
        handle = bossPrefab.InstantiateAsync(spawnPoint.position, spawnPoint.rotation);
        handle.Completed += h =>
        {
            if (h.Status != AsyncOperationStatus.Succeeded)
                Debug.LogError("Impossible de charger le boss.");
        };
    }

    private void OnDestroy()
    {
        if (handle.IsValid()) Addressables.ReleaseInstance(handle);
    }
}`}
]);

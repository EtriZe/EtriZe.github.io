window.LESSONS=(window.LESSONS||[]).concat([
{id:'mda',cat:'design',lvl:1,title:'Le cadre MDA',sum:'Mécaniques, dynamiques, esthétiques : le vocabulaire de base pour analyser et concevoir un jeu.',
body:[['L\'idée',`Le designer règle des **mécaniques**, le joueur vit des **émotions** ; entre les deux, des **dynamiques** émergent du jeu en mouvement.`]],
ex:`Écris un petit système de télémétrie ~Telemetry~ pour observer les dynamiques d'un niveau : ~Log(string zone, string evt)~ enregistre l'événement avec l'heure de jeu, et ~Summary()~ renvoie, pour chaque zone, le nombre de morts et le temps moyen passé.`,
hint:`Un Dictionary<string, List<float>> par type d'événement ; enregistre « enter » et « exit » pour calculer les temps.`,
sol:`public class Telemetry
{
    private readonly List<(float time, string zone, string evt)> log = new List<(float, string, string)>();

    public void Log(string zone, string evt) => log.Add((Time.time, zone, evt));

    public string Summary()
    {
        var sb = new StringBuilder();
        foreach (var zone in log.Select(e => e.zone).Distinct())
        {
            var events = log.Where(e => e.zone == zone).ToList();
            int deaths = events.Count(e => e.evt == "death");

            float total = 0f; int visits = 0; float? enter = null;
            foreach (var e in events)
            {
                if (e.evt == "enter") enter = e.time;
                else if (e.evt == "exit" && enter.HasValue)
                {
                    total += e.time - enter.Value;
                    visits++;
                    enter = null;
                }
            }
            float avg = visits > 0 ? total / visits : 0f;
            sb.AppendLine($"{zone} : {deaths} mort(s), {avg:0.0} s en moyenne");
        }
        return sb.ToString();
    }
}`},

{id:'choix-interessants',cat:'design',lvl:1,title:'Des choix intéressants',sum:'Ce qui rend une décision intéressante pour le joueur, d\'après Sid Meier, et comment éviter les choix évidents.',
body:[['L\'idée',`Un choix est intéressant quand aucune option n'est évidemment la meilleure et que la décision a des conséquences.`]],
ex:`Une récompense propose 3 options, chacune avec une valeur (~reward~) et un risque (~risk~). Écris ~bool IsDominated(Offer a, Offer b)~ (b est au moins aussi bonne partout et meilleure quelque part), puis ~List<Offer> Generate(System.Random rng)~ qui tire des offres jusqu'à obtenir 3 options dont aucune n'en domine une autre.`,
hint:`b domine a si b.reward >= a.reward et b.risk <= a.risk, avec au moins une inégalité stricte. Recommence le tirage tant qu'une paire est dominée (avec une limite d'essais).`,
sol:`public struct Offer
{
    public int reward;   // plus c'est haut, mieux c'est
    public int risk;     // plus c'est bas, mieux c'est
}

public static bool IsDominated(Offer a, Offer b)
{
    bool atLeastAsGood = b.reward >= a.reward && b.risk <= a.risk;
    bool strictlyBetter = b.reward > a.reward || b.risk < a.risk;
    return atLeastAsGood && strictlyBetter;
}

public static List<Offer> Generate(System.Random rng)
{
    for (int attempt = 0; attempt < 100; attempt++)
    {
        var offers = new List<Offer>();
        for (int i = 0; i < 3; i++)
            offers.Add(new Offer { reward = rng.Next(1, 11), risk = rng.Next(0, 10) });

        bool anyDominated = false;
        for (int i = 0; i < 3 && !anyDominated; i++)
            for (int j = 0; j < 3; j++)
                if (i != j && IsDominated(offers[i], offers[j])) { anyDominated = true; break; }

        if (!anyDominated) return offers;
    }
    // repli : un compromis construit à la main
    return new List<Offer>
    {
        new Offer { reward = 3, risk = 1 },
        new Offer { reward = 6, risk = 4 },
        new Offer { reward = 10, risk = 8 },
    };
}`},

{id:'game-feel',cat:'design',lvl:2,title:'Game feel et « juice »',sum:'Pourquoi deux jeux identiques sur le papier ne procurent pas les mêmes sensations, et les retours qui changent tout.',
body:[['L\'idée',`Le game feel, c'est la sensation de contrôle ; le « juice », ce sont les retours qui rendent chaque action satisfaisante.`]],
ex:`Écris un composant ~HitFeedback~ qui, quand ~Play(Vector2 hitDir, float strength)~ est appelé sur un ennemi touché : fige le temps une fraction de seconde (hit stop), fait clignoter le sprite en blanc, le repousse dans la direction du coup et déclenche une secousse de caméra proportionnelle à la force.`,
hint:`Hit stop en temps réel (WaitForSecondsRealtime). Le flash peut passer par un MaterialPropertyBlock ou simplement la couleur du SpriteRenderer. Réutilise la CameraShake de la leçon [[bruit-perlin|bruit de Perlin]].`,
sol:`public class HitFeedback : MonoBehaviour
{
    [SerializeField] private SpriteRenderer sprite;
    [SerializeField] private Rigidbody2D body;
    [SerializeField] private CameraShake cameraShake;
    [SerializeField] private float hitStop = 0.06f;
    [SerializeField] private float flashTime = 0.08f;
    [SerializeField] private float knockback = 6f;

    private static bool stopping;

    public void Play(Vector2 hitDir, float strength)
    {
        StartCoroutine(Flash());
        body.AddForce(hitDir.normalized * knockback * strength, ForceMode2D.Impulse);
        cameraShake.Shake(0.2f * strength);
        if (!stopping) StartCoroutine(HitStop(hitStop * strength));
    }

    private IEnumerator Flash()
    {
        Color original = sprite.color;
        sprite.color = Color.white;               // avec un shader « flash » c'est encore plus net
        yield return new WaitForSeconds(flashTime);
        sprite.color = original;
    }

    private static IEnumerator HitStop(float duration)
    {
        stopping = true;
        float previous = Time.timeScale;
        Time.timeScale = 0f;
        yield return new WaitForSecondsRealtime(duration);
        Time.timeScale = previous;
        stopping = false;
    }
}`},

{id:'tolerance-controles',cat:'design',lvl:2,title:'Des contrôles qui pardonnent',sum:'Coyote time, mémoire d\'appui, saut variable : les petites tricheries qui rendent un jeu de plateforme juste.',
body:[['L\'idée',`Le jeu interprète l'intention du joueur plutôt que ses images exactes, pour que les échecs paraissent toujours mérités.`]],
ex:`Écris un ~PlatformerJump~ (Rigidbody2D) avec : coyote time de 0,1 s, mémoire d'appui de 0,1 s, saut plus court si on relâche le bouton tôt, et gravité plus forte en descente.`,
hint:`Deux minuteurs : depuis quand on a quitté le sol, depuis quand on a appuyé. On saute quand les deux sont dans leur fenêtre, puis on les remet à zéro.`,
sol:`[RequireComponent(typeof(Rigidbody2D))]
public class PlatformerJump : MonoBehaviour
{
    [SerializeField] private float jumpSpeed = 12f;
    [SerializeField] private float coyoteTime = 0.1f;
    [SerializeField] private float bufferTime = 0.1f;
    [SerializeField] private float fallGravity = 2.5f;
    [SerializeField] private float lowJumpGravity = 2f;
    [SerializeField] private LayerMask ground;
    [SerializeField] private Transform feet;

    private Rigidbody2D body;
    private float sinceGrounded = 999f, sincePressed = 999f;

    private void Awake() => body = GetComponent<Rigidbody2D>();

    private void Update()
    {
        bool grounded = Physics2D.OverlapCircle(feet.position, 0.1f, ground);
        sinceGrounded = grounded ? 0f : sinceGrounded + Time.deltaTime;
        sincePressed = Input.GetButtonDown("Jump") ? 0f : sincePressed + Time.deltaTime;

        if (sincePressed <= bufferTime && sinceGrounded <= coyoteTime)
        {
            body.linearVelocity = new Vector2(body.linearVelocity.x, jumpSpeed);
            sincePressed = sinceGrounded = 999f;   // consommé : pas de double saut
        }

        // Gravité variable : chute plus lourde, saut court si on relâche
        float vy = body.linearVelocity.y;
        if (vy < 0f) body.gravityScale = fallGravity;
        else if (vy > 0f && !Input.GetButton("Jump")) body.gravityScale = lowJumpGravity;
        else body.gravityScale = 1f;
    }
}`},

{id:'telegraphie',cat:'design',lvl:2,title:'Télégraphier les attaques',sum:'Anticipation, attaque, récupération : rendre un combat difficile mais lisible et juste.',
body:[['L\'idée',`Le joueur ne peut éviter que ce qu'il voit venir : chaque attaque s'annonce, frappe, puis laisse une fenêtre de riposte.`]],
ex:`Écris un ~EnemyAttack~ avec trois phases réglables (anticipation, actif, récupération) : pendant l'anticipation, l'ennemi clignote en rouge et un cercle d'avertissement apparaît ; la zone de dégâts n'est active que pendant la phase active ; pendant la récupération, l'ennemi est vulnérable.`,
hint:`Une coroutine qui enchaîne les trois phases avec un enum de phase. Le collider de dégâts est activé seulement pendant Active.`,
sol:`public class EnemyAttack : MonoBehaviour
{
    public enum Phase { Idle, Anticipation, Active, Recovery }

    [SerializeField] private float anticipation = 0.6f, active = 0.15f, recovery = 0.8f;
    [SerializeField] private SpriteRenderer sprite;
    [SerializeField] private GameObject warningCircle;
    [SerializeField] private Collider2D damageZone;

    public Phase Current { get; private set; } = Phase.Idle;
    public bool IsVulnerable => Current == Phase.Recovery;

    public void Attack()
    {
        if (Current == Phase.Idle) StartCoroutine(Run());
    }

    private IEnumerator Run()
    {
        Color normal = sprite.color;

        Current = Phase.Anticipation;
        warningCircle.SetActive(true);
        for (float t = 0f; t < anticipation; t += Time.deltaTime)
        {
            // clignote de plus en plus vite à l'approche du coup
            float freq = Mathf.Lerp(4f, 16f, t / anticipation);
            sprite.color = Mathf.Sin(t * freq * Mathf.PI * 2f) > 0f ? Color.red : normal;
            yield return null;
        }
        sprite.color = normal;
        warningCircle.SetActive(false);

        Current = Phase.Active;
        damageZone.enabled = true;
        yield return new WaitForSeconds(active);
        damageZone.enabled = false;

        Current = Phase.Recovery;
        yield return new WaitForSeconds(recovery);

        Current = Phase.Idle;
    }
}`},

{id:'enseigner-sans-texte',cat:'design',lvl:1,title:'Apprendre en jouant',sum:'Le niveau 1-1 de Super Mario Bros. et l\'art d\'enseigner les règles sans un mot.',
body:[['L\'idée',`Le niveau est le tutoriel : on introduit une seule idée à la fois, dans un endroit sûr, puis on la complique.`]],
ex:`Écris un ~ContextualHint~ qui affiche une aide (« Maintiens B pour courir ») seulement si le joueur a échoué 3 fois au même saut ou s'il reste bloqué 20 secondes devant, et qui ne réapparaît plus jamais une fois que le joueur a réussi.`,
hint:`Compte les morts dans la zone, mesure le temps passé dans le trigger, et mémorise la réussite (PlayerPrefs ou sauvegarde) avec une clé unique.`,
sol:`public class ContextualHint : MonoBehaviour
{
    [SerializeField] private string hintId = "run_jump_1";
    [SerializeField] private GameObject hintUI;
    [SerializeField] private int failsBeforeHint = 3;
    [SerializeField] private float stuckSeconds = 20f;

    private int fails;
    private float timeInside;
    private bool playerInside;

    private bool Learned
    {
        get => PlayerPrefs.GetInt("hint_" + hintId, 0) == 1;
        set => PlayerPrefs.SetInt("hint_" + hintId, value ? 1 : 0);
    }

    private void Start() => hintUI.SetActive(false);

    public void ReportFail() { if (!Learned) fails++; }

    public void ReportSuccess()
    {
        Learned = true;
        hintUI.SetActive(false);
    }

    private void OnTriggerEnter2D(Collider2D other) { if (other.CompareTag("Player")) playerInside = true; }
    private void OnTriggerExit2D(Collider2D other)  { if (other.CompareTag("Player")) playerInside = false; }

    private void Update()
    {
        if (Learned || hintUI.activeSelf) return;
        if (playerInside) timeInside += Time.deltaTime;
        if (fails >= failsBeforeHint || timeInside >= stuckSeconds)
            hintUI.SetActive(true);
    }
}`},

{id:'flow-difficulte',cat:'design',lvl:2,title:'Flow et courbe de difficulté',sum:'Garder le joueur entre l\'ennui et l\'anxiété : le flow, et les façons d\'ajuster la difficulté.',
body:[['L\'idée',`Le flow apparaît quand le défi correspond à la compétence ; la difficulté doit monter avec le joueur.`]],
ex:`Écris un ~AdaptiveSpawner~ discret : il mémorise le résultat des 10 dernières rencontres (gagnée ou perdue), vise un taux de réussite de 70 %, et ajuste doucement l'intervalle d'apparition des ennemis entre deux bornes.`,
hint:`Une Queue<bool> limitée à 10. Si le taux est au-dessus de la cible, réduis l'intervalle de 5 % ; en dessous, augmente-le de 5 % ; borne avec Mathf.Clamp.`,
sol:`public class AdaptiveSpawner : MonoBehaviour
{
    [SerializeField] private float minInterval = 0.8f, maxInterval = 4f;
    [SerializeField, Range(0f, 1f)] private float targetSuccess = 0.7f;
    [SerializeField] private int window = 10;

    public float Interval { get; private set; } = 2f;
    private readonly Queue<bool> results = new Queue<bool>();

    public void ReportEncounter(bool playerWon)
    {
        results.Enqueue(playerWon);
        if (results.Count > window) results.Dequeue();
        if (results.Count < window / 2) return;      // pas encore assez de données

        float rate = results.Count(r => r) / (float)results.Count;
        if (rate > targetSuccess) Interval *= 0.95f;   // trop facile : plus d'ennemis
        else if (rate < targetSuccess) Interval *= 1.05f;
        Interval = Mathf.Clamp(Interval, minInterval, maxInterval);
    }
}`},

{id:'directeur-ia',cat:'design',lvl:3,title:'Le rythme et le directeur d\'IA',sum:'Alterner tension et répit : comment Left 4 Dead règle le rythme selon l\'état des joueurs.',
body:[['L\'idée',`Un « directeur » mesure l'intensité vécue par le joueur et alterne montée en tension, pic et relâche.`]],
ex:`Écris un ~PacingDirector~ : une intensité (0 à 1) qui monte quand le joueur prend des dégâts ou tue un ennemi proche et redescend avec le temps ; une machine à états BuildUp, Peak, Relax ; les vagues d'ennemis ne sont lancées qu'en BuildUp, coupées pendant le Relax.`,
hint:`Peak dès que l'intensité dépasse 0,8 ; on y reste 5 s puis Relax pendant 20 s, sans nouvelles vagues ; retour en BuildUp quand l'intensité est retombée sous 0,3.`,
sol:`public class PacingDirector : MonoBehaviour
{
    public enum State { BuildUp, Peak, Relax }

    [SerializeField] private float decayPerSecond = 0.05f;
    [SerializeField] private float peakDuration = 5f, relaxDuration = 20f;
    [SerializeField] private EnemyWaves waves;

    public float Intensity { get; private set; }
    public State Current { get; private set; } = State.BuildUp;
    private float stateTimer;

    public void OnPlayerDamaged(int amount) => Intensity = Mathf.Clamp01(Intensity + amount * 0.01f);
    public void OnNearbyKill() => Intensity = Mathf.Clamp01(Intensity + 0.05f);

    private void Update()
    {
        Intensity = Mathf.Max(0f, Intensity - decayPerSecond * Time.deltaTime);
        stateTimer += Time.deltaTime;

        switch (Current)
        {
            case State.BuildUp:
                waves.enabled = true;
                if (Intensity >= 0.8f) Enter(State.Peak);
                break;
            case State.Peak:
                if (stateTimer >= peakDuration) Enter(State.Relax);
                break;
            case State.Relax:
                waves.enabled = false;              // répit : on laisse souffler
                if (stateTimer >= relaxDuration && Intensity < 0.3f) Enter(State.BuildUp);
                break;
        }
    }

    private void Enter(State s)
    {
        Current = s;
        stateTimer = 0f;
    }
}`},

{id:'hasard-equitable',cat:'design',lvl:2,title:'Un hasard qui paraît juste',sum:'Le « sac » de Tetris, les filets de sécurité et pourquoi le vrai hasard est vécu comme injuste.',
body:[['L\'idée',`On contraint le hasard pour éviter les séries extrêmes que les joueurs vivent comme de la malchance.`]],
ex:`Écris un ~LootTable~ qui combine deux techniques : un sac mélangé pour les objets courants (chaque objet sort une fois par tour), et un « filet de sécurité » qui garantit un objet rare au plus tard après 10 tirages sans rare.`,
hint:`Réutilise ShuffleBag de la leçon [[melange-fisher-yates|mélange]]. Le filet : un compteur de tirages depuis le dernier rare, avec une probabilité normale de 5 %.`,
sol:`public class LootTable
{
    private readonly ShuffleBag<string> common;
    private readonly List<string> rares;
    private readonly System.Random rng;
    private readonly float rareChance;
    private readonly int pity;
    private int sinceRare;

    public LootTable(IEnumerable<string> common, List<string> rares, int seed,
                     float rareChance = 0.05f, int pity = 10)
    {
        this.common = new ShuffleBag<string>(common, seed);
        this.rares = rares;
        rng = new System.Random(seed + 1);
        this.rareChance = rareChance;
        this.pity = pity;
    }

    public string Next()
    {
        sinceRare++;
        bool forced = sinceRare >= pity;                 // filet de sécurité
        if (forced || rng.NextDouble() < rareChance)
        {
            sinceRare = 0;
            return rares[rng.Next(rares.Count)];
        }
        return common.Next();
    }
}`},

{id:'boucles-retroaction',cat:'design',lvl:2,title:'Boucles de rétroaction',sum:'Quand le gagnant gagne encore plus, ou quand le jeu aide celui qui est derrière : le cas de la carapace bleue.',
body:[['L\'idée',`Une boucle positive creuse les écarts ; une boucle négative les resserre. Il faut choisir lesquelles on veut.`]],
ex:`Écris ~string RollItem(int position, int racers, System.Random rng)~ pour un jeu de course : plus le joueur est loin, plus les objets puissants sont probables ; le premier n'obtient presque que des objets défensifs. Utilise une interpolation des poids selon la position relative.`,
hint:`t = (position − 1) / (racers − 1) va de 0 (premier) à 1 (dernier). Chaque objet a un poids « en tête » et un poids « en queue » ; poids = Lerp(tête, queue, t), puis tirage pondéré.`,
sol:`private static readonly (string item, float front, float back)[] Items =
{
    ("Banane",           40f,  2f),
    ("Carapace verte",   30f,  8f),
    ("Champignon",       15f, 25f),
    ("Triple champignon", 5f, 25f),
    ("Étoile",            0f, 20f),
    ("Carapace bleue",    0f, 10f),
};

public static string RollItem(int position, int racers, System.Random rng)
{
    float t = racers > 1 ? (position - 1) / (float)(racers - 1) : 0f;

    float total = 0f;
    var weights = new float[Items.Length];
    for (int i = 0; i < Items.Length; i++)
    {
        weights[i] = Mathf.Lerp(Items[i].front, Items[i].back, t);
        total += weights[i];
    }

    double r = rng.NextDouble() * total;
    for (int i = 0; i < Items.Length; i++)
    {
        r -= weights[i];
        if (r < 0) return Items[i].item;
    }
    return Items[0].item;
}`},

{id:'camera-plateforme',cat:'design',lvl:2,title:'Caméras de jeux de plateforme',sum:'Fenêtre de caméra, accrochage aux plateformes, anticipation : les techniques recensées par Itay Keren.',
body:[['L\'idée',`La caméra montre ce dont le joueur a besoin pour décider, et bouge le moins possible.`]],
ex:`Écris une caméra 2D ~WindowCamera~ : horizontalement, une fenêtre (la caméra ne bouge que si le joueur en sort) ; verticalement, un accrochage aux plateformes (la hauteur ne change qu'à l'atterrissage, en douceur) ; plus une chute rapide suivie directement pour ne pas perdre le joueur.`,
hint:`Garde une cible y « verrouillée » mise à jour seulement quand le joueur est au sol ; si sa vitesse verticale est très négative et qu'il sort de l'écran par le bas, suis-le directement.`,
sol:`public class WindowCamera : MonoBehaviour
{
    [SerializeField] private Transform player;
    [SerializeField] private Rigidbody2D playerBody;
    [SerializeField] private float halfWindow = 1.5f;
    [SerializeField] private float snapSpeed = 4f;
    [SerializeField] private float fallFollowSpeed = -12f;

    private float lockedY;

    private void Start() => lockedY = player.position.y;

    private void LateUpdate()
    {
        Vector3 cam = transform.position;
        float px = player.position.x;

        // Fenêtre horizontale
        if (px > cam.x + halfWindow) cam.x = px - halfWindow;
        else if (px < cam.x - halfWindow) cam.x = px + halfWindow;

        // Accrochage vertical aux plateformes
        bool grounded = Physics2D.Raycast(player.position, Vector2.down, 0.6f, LayerMask.GetMask("Ground"));
        if (grounded) lockedY = player.position.y;

        // Chute rapide : on suit directement
        if (playerBody.linearVelocity.y < fallFollowSpeed) lockedY = player.position.y;

        cam.y = Mathf.Lerp(cam.y, lockedY, 1f - Mathf.Exp(-snapSpeed * Time.deltaTime));
        transform.position = cam;
    }
}`},

{id:'accessibilite',cat:'design',lvl:1,title:'Accessibilité',sum:'Permettre à plus de gens de jouer : les recommandations de référence et le mode Assistance de Celeste.',
body:[['L\'idée',`Beaucoup d'options d'accessibilité sont simples à ajouter si on y pense dès le début, et profitent à tout le monde.`]],
ex:`Écris un ~AccessibilitySettings~ (ScriptableObject) avec vitesse de jeu (50 à 100 %), « maintenir ou basculer » pour la visée, taille des sous-titres et invincibilité ; puis un composant ~AimInput~ qui respecte le réglage maintenir/basculer, et un ~GameSpeed~ qui applique la vitesse via timeScale.`,
hint:`En mode basculer, chaque appui inverse l'état ; en mode maintenir, l'état suit le bouton. La vitesse multiplie timeScale (et fixedDeltaTime).`,
sol:`[CreateAssetMenu(menuName = "Game/Accessibility Settings")]
public class AccessibilitySettings : ScriptableObject
{
    [Range(0.5f, 1f)] public float gameSpeed = 1f;
    public bool aimToggle;                 // false = maintenir, true = basculer
    [Range(0.8f, 2f)] public float subtitleScale = 1f;
    public bool invincible;
}

public class AimInput : MonoBehaviour
{
    [SerializeField] private AccessibilitySettings settings;
    public bool Aiming { get; private set; }

    private void Update()
    {
        if (settings.aimToggle)
        {
            if (Input.GetButtonDown("Fire2")) Aiming = !Aiming;
        }
        else
        {
            Aiming = Input.GetButton("Fire2");
        }
    }
}

public class GameSpeed : MonoBehaviour
{
    [SerializeField] private AccessibilitySettings settings;
    private const float BaseFixed = 0.02f;

    private void Update()
    {
        if (Mathf.Approximately(Time.timeScale, 0f)) return;   // ne pas casser la pause
        Time.timeScale = settings.gameSpeed;
        Time.fixedDeltaTime = BaseFixed * settings.gameSpeed;
    }
}`},

{id:'economie-jeu',cat:'design',lvl:2,title:'Économie : sources et puits',sum:'Faire entrer et sortir la monnaie du jeu pour qu\'elle garde sa valeur, sans inflation ni pénurie.',
body:[['L\'idée',`L'or entre par des sources et sort par des puits ; si les sources l'emportent, l'or ne vaut plus rien.`]],
ex:`Écris un ~EconomySimulator~ qui simule 60 minutes de jeu minute par minute : sources (or gagné par minute qui augmente avec le niveau), puits (réparations proportionnelles au niveau, achats d'améliorations dont le prix grimpe), et affiche à chaque tranche de 10 minutes l'or détenu et le temps nécessaire pour la prochaine amélioration.`,
hint:`Variables : gold, level, upgradeCost. À chaque minute : gold += income(level) − repair(level) ; si gold >= upgradeCost, achète, level++, upgradeCost ×= 1,35.`,
sol:`public static class EconomySimulator
{
    public static string Run(int minutes = 60)
    {
        var sb = new StringBuilder();
        float gold = 0f, upgradeCost = 100f;
        int level = 1;

        for (int m = 1; m <= minutes; m++)
        {
            float income = 40f + 12f * level;          // source : ennemis, coffres
            float repair = 5f * level;                 // puits : réparations
            gold += income - repair;

            while (gold >= upgradeCost)                // puits : améliorations
            {
                gold -= upgradeCost;
                level++;
                upgradeCost *= 1.35f;
            }

            if (m % 10 == 0)
            {
                float net = 40f + 12f * level - 5f * level;
                float minutesToNext = (upgradeCost - gold) / net;
                sb.AppendLine($"{m} min : niveau {level}, {gold:0} or, prochaine amélioration dans {minutesToNext:0.0} min");
            }
        }
        return sb.ToString();
    }
}`}
]);
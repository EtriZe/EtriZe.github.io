window.LESSONS=(window.LESSONS||[]).concat([
{id:'profiler-markers',cat:'perf',lvl:2,title:'Mesurer avec le Profiler',sum:'Trouver ce qui coûte vraiment, avant d\'optimiser, avec des marqueurs à soi.',
body:[
['L\'idée',`On se trompe presque toujours en devinant ce qui est lent. Le **Profiler** de Unity (Window > Analysis > Profiler) montre, image par image, le temps passé dans chaque méthode, la mémoire allouée (colonne GC Alloc, voir [[allocations-gc]]) et le rendu. Règle d'or : mesurer, corriger, mesurer à nouveau.`],
['Les marqueurs',`Le Profiler ne détaille pas l'intérieur de tes méthodes. Une ~ProfilerMarker~ crée un bloc nommé qui apparaît dans la vue Timeline et la vue Hierarchy. On l'entoure de ~Begin()~ / ~End()~, ou mieux d'un ~using (marker.Auto())~ (voir [[idisposable-using]]). Le coût est quasi nul, et nul dans un build Release.`,`private static readonly ProfilerMarker AiMarker = new ProfilerMarker("Enemy.AI");

void Update()
{
    using (AiMarker.Auto())
    {
        ThinkAndMove();
    }
}`],
['Profiler un build',`L'éditeur ajoute son propre coût. Pour des chiffres fiables, fais un build « Development Build » avec « Autoconnect Profiler », et profile sur la machine cible (une console ou un téléphone se comportent très différemment d'un PC de développeur).`],
['Lire les chiffres',`À 60 images par seconde, une image a 16,6 ms. Regarde les pics (une image de 80 ms se sent), pas seulement la moyenne. Les pics viennent souvent du ramasse-miettes, d'un chargement ou d'un ~Instantiate~ en masse (voir [[object-pooling]]).`]],
ex:`Écris un composant ~FrameStats~ qui mesure le temps de chaque image avec ~Time.unscaledDeltaTime~, garde les 120 dernières valeurs, et affiche la moyenne, le pire temps et le nombre d'images au-dessus de 33 ms, sans allocation par image. Ajoute un ProfilerMarker autour du calcul.`,
hint:`Un tableau circulaire de float et un index. Pour l'affichage, TMP SetText avec des paramètres (pas d'allocation).`,
sol:`public class FrameStats : MonoBehaviour
{
    private static readonly ProfilerMarker StatsMarker = new ProfilerMarker("FrameStats.Compute");

    [SerializeField] private TMP_Text label;
    private readonly float[] samples = new float[120];
    private int index, filled;

    private void Update()
    {
        samples[index] = Time.unscaledDeltaTime * 1000f;   // en ms
        index = (index + 1) % samples.Length;
        filled = Mathf.Min(filled + 1, samples.Length);

        using (StatsMarker.Auto())
        {
            float sum = 0f, worst = 0f;
            int slow = 0;
            for (int i = 0; i < filled; i++)
            {
                float s = samples[i];
                sum += s;
                if (s > worst) worst = s;
                if (s > 33.3f) slow++;
            }
            label.SetText("moy {0:1} ms · pire {1:1} ms · lentes {2}", sum / filled, worst, slow);
        }
    }
}`},

{id:'cache-references',cat:'perf',lvl:1,title:'Mettre en cache',sum:'Ne pas refaire chaque image une recherche dont le résultat ne change pas.',
body:[
['L\'idée',`Beaucoup d'appels Unity cherchent quelque chose : ~GetComponent~, ~GameObject.Find~, ~FindObjectsByType~, ~Camera.main~ dans les anciennes versions. Les faire dans ~Update~ refait la même recherche 60 fois par seconde. On la fait **une fois**, dans ~Awake~ ou ~Start~, et on garde le résultat dans un champ.`],
['Ce qui vaut le coup',`Les recherches dans la scène (Find) et les composants appelés souvent. Les chaînes converties en identifiants : ~Animator.StringToHash~ (voir [[animator-parametres]]), ~Shader.PropertyToID~ pour les matériaux. Les ~WaitForSeconds~ des [[coroutines]].`],
['Le piège du cache périmé',`Un cache peut devenir faux : l'objet a été détruit, ou un autre a pris sa place. Teste ~!= null~ (voir [[null-securite]]) ou invalide le cache quand l'événement correspondant arrive.`],
['Ne pas exagérer',`Mettre en cache ~transform~ ne fait plus gagner grand-chose dans les versions récentes. Le profiler dit ce qui compte (voir [[profiler-markers]]) ; un code plus compliqué pour un gain invisible est une perte.`]],
ex:`Réécris ce script pour qu'il ne fasse plus aucune recherche par image, sans changer son comportement.`,
exCode:`public class Blinker : MonoBehaviour
{
    void Update()
    {
        var player = GameObject.Find("Player");
        float d = Vector3.Distance(transform.position, player.transform.position);
        GetComponent<Renderer>().material.SetColor("_BaseColor",
            d < 5f ? Color.red : Color.white);
    }
}`,
hint:`Trois choses à garder : le Transform du joueur, le Renderer (et son matériau), l'identifiant de la propriété _BaseColor. Et ne change la couleur que si elle change.`,
sol:`public class Blinker : MonoBehaviour
{
    private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");

    [SerializeField] private Transform player;   // glissé dans l'inspecteur
    private Material material;
    private bool wasNear;

    private void Awake()
    {
        if (player == null) player = GameObject.Find("Player").transform;   // une seule fois
        material = GetComponent<Renderer>().material;                         // instance créée une fois
        material.SetColor(BaseColorId, Color.white);
    }

    private void Update()
    {
        bool near = (transform.position - player.position).sqrMagnitude < 25f;
        if (near == wasNear) return;     // rien à changer
        wasNear = near;
        material.SetColor(BaseColorId, near ? Color.red : Color.white);
    }
}`},

{id:'update-manager',cat:'perf',lvl:3,title:'Un seul Update pour tous',sum:'Remplacer des milliers d\'Update par une boucle centrale, et mettre à jour moins souvent ce qui peut attendre.',
body:[
['L\'idée',`Chaque méthode ~Update~ d'un MonoBehaviour coûte un petit appel du moteur vers le C#. Avec 5 000 objets, ce coût fixe devient visible. Un **gestionnaire** central tient la liste des objets à mettre à jour et les parcourt dans une simple boucle C#.`],
['Le principe',`Les objets s'inscrivent dans ~OnEnable~ et se désinscrivent dans ~OnDisable~ (voir [[static-instance]]). Ils implémentent une [[interfaces|interface]] ~ITickable~ avec ~Tick(float dt)~. Le gestionnaire a, lui, un seul ~Update~.`],
['Mettre à jour moins souvent',`Tout n'a pas besoin de 60 mises à jour par seconde : la décision d'une IA lointaine peut attendre 0,2 s. On répartit les objets en groupes et on n'en traite qu'une partie à chaque image (« time slicing »), avec le temps cumulé.`],
['Le piège de la liste modifiée',`Un objet peut se désinscrire pendant la boucle (il meurt dans son Tick). Parcours la liste à l'envers, ou retire les objets en fin de boucle. Et mesure avant d'adopter ce motif : pour quelques centaines d'objets, il n'apporte rien (voir [[profiler-markers]]).`]],
ex:`Écris ~ITickable~, ~TickManager~ (inscription, désinscription, une boucle par image) et un mode « réparti » : les objets inscrits avec ~slices = 4~ ne sont mis à jour qu'une image sur quatre, chacun à son tour, avec le temps cumulé correct.`,
hint:`Une liste par fréquence. Pour les objets répartis, l'objet d'indice i est traité quand i % 4 == frame % 4, avec dt × 4 (approximation) ou le temps réel depuis sa dernière mise à jour.`,
sol:`public interface ITickable
{
    void Tick(float dt);
}

public class TickManager : MonoBehaviour
{
    public static TickManager Instance { get; private set; }

    private const int Slices = 4;
    private readonly List<ITickable> everyFrame = new List<ITickable>();
    private readonly List<ITickable> sliced = new List<ITickable>();
    private readonly List<float> lastTick = new List<float>();
    private int frame;

    private void Awake() => Instance = this;

    public void Register(ITickable t, bool slicedUpdate = false)
    {
        if (!slicedUpdate) { everyFrame.Add(t); return; }
        sliced.Add(t);
        lastTick.Add(Time.time);
    }

    public void Unregister(ITickable t)
    {
        everyFrame.Remove(t);
        int i = sliced.IndexOf(t);
        if (i >= 0) { sliced.RemoveAt(i); lastTick.RemoveAt(i); }
    }

    private void Update()
    {
        float dt = Time.deltaTime;
        for (int i = everyFrame.Count - 1; i >= 0; i--)
            everyFrame[i].Tick(dt);

        int slot = frame++ % Slices;
        float now = Time.time;
        for (int i = sliced.Count - 1; i >= 0; i--)
        {
            if (i % Slices != slot) continue;
            float elapsed = now - lastTick[i];   // temps réel depuis sa dernière mise à jour
            lastTick[i] = now;
            sliced[i].Tick(elapsed);
        }
    }
}

// Côté objet :
// private void OnEnable()  => TickManager.Instance.Register(this, slicedUpdate: true);
// private void OnDisable() => TickManager.Instance.Unregister(this);`},

{id:'partition-spatiale',cat:'perf',lvl:3,title:'Partition spatiale',sum:'Ne comparer que les objets proches : une grille de seaux au lieu de tester tout le monde contre tout le monde.',
body:[
['L\'idée',`Pour savoir quels ennemis sont près d'un point, la méthode naïve teste tous les ennemis : O(n) par question, O(n²) si chaque ennemi pose la question (voir [[complexite]]). Une **grille de hachage spatial** range les objets par case ; on ne regarde que la case du point et ses voisines.`],
['Le principe',`On choisit une taille de case proche du rayon de recherche habituel. Chaque objet calcule sa case (voir [[grille-2d]]) et s'ajoute à la liste de cette case, dans un ~Dictionary<Vector2Int, List<T>>~. Une recherche lit les 9 cases autour du point et teste la vraie distance.`],
['Mettre à jour',`Quand un objet bouge, il change de case seulement s'il en franchit la limite : on compare l'ancienne et la nouvelle case avant de déplacer. Pour des objets qui bougent tous beaucoup, on reconstruit simplement la grille à chaque image, ce qui reste en O(n).`],
['Ce que fait le moteur',`La physique de Unity a déjà ses propres structures : ~Physics.OverlapSphereNonAlloc~ est souvent la bonne réponse pour des objets qui ont des colliders. La grille maison sert pour des objets sans physique (des milliers de particules de gameplay, des unités de stratégie), ou dans des [[jobs-burst|jobs]].`]],
ex:`Écris ~SpatialHash<T>~ sur le plan XZ : ~Clear()~, ~Insert(T item, Vector3 pos)~, et ~void Query(Vector3 center, float radius, List<T> results)~ qui remplit une liste fournie par l'appelant (pas d'allocation) avec les éléments dont la position est dans le rayon.`,
hint:`Stocke des paires (item, position) dans chaque case. Query parcourt les cases de floor((c − r) / size) à floor((c + r) / size) en x et z.`,
sol:`public class SpatialHash<T>
{
    private readonly float cellSize;
    private readonly Dictionary<Vector2Int, List<(T item, Vector3 pos)>> cells
        = new Dictionary<Vector2Int, List<(T, Vector3)>>();
    private readonly Stack<List<(T, Vector3)>> spareLists = new Stack<List<(T, Vector3)>>();

    public SpatialHash(float cellSize) => this.cellSize = cellSize;

    private Vector2Int CellOf(Vector3 p) =>
        new Vector2Int(Mathf.FloorToInt(p.x / cellSize), Mathf.FloorToInt(p.z / cellSize));

    public void Clear()
    {
        foreach (var list in cells.Values) { list.Clear(); spareLists.Push(list); }
        cells.Clear();
    }

    public void Insert(T item, Vector3 pos)
    {
        Vector2Int c = CellOf(pos);
        if (!cells.TryGetValue(c, out var list))
        {
            list = spareLists.Count > 0 ? spareLists.Pop() : new List<(T, Vector3)>();
            cells[c] = list;
        }
        list.Add((item, pos));
    }

    public void Query(Vector3 center, float radius, List<T> results)
    {
        results.Clear();
        float r2 = radius * radius;
        Vector2Int min = CellOf(center - new Vector3(radius, 0f, radius));
        Vector2Int max = CellOf(center + new Vector3(radius, 0f, radius));

        for (int x = min.x; x <= max.x; x++)
        for (int y = min.y; y <= max.y; y++)
        {
            if (!cells.TryGetValue(new Vector2Int(x, y), out var list)) continue;
            foreach (var (item, pos) in list)
            {
                Vector3 d = pos - center;
                d.y = 0f;
                if (d.sqrMagnitude <= r2) results.Add(item);
            }
        }
    }
}`},

{id:'jobs-burst',cat:'perf',lvl:3,title:'Job System et Burst',sum:'Répartir un calcul lourd sur tous les cœurs du processeur, et le compiler en code natif très rapide.',
body:[
['L\'idée',`Par défaut, ton code tourne sur un seul cœur, le thread principal. Le **Job System** découpe un travail en petits morceaux exécutés en parallèle sur tous les cœurs. Le compilateur **Burst** transforme ces jobs en code natif optimisé, souvent 10 fois plus rapide que du C# ordinaire.`],
['Les règles',`Un job est une ~struct~ qui ne contient que des types simples et des conteneurs natifs (~NativeArray<T>~). Pas de classes, pas d'objets Unity, pas de ~GameObject~. Ces règles garantissent qu'il n'y a pas de conflits entre threads.`],
['NativeArray',`Un tableau en mémoire native, hors du ramasse-miettes. Il faut le libérer avec ~Dispose()~ (voir [[idisposable-using]]) ; Unity signale une fuite sinon. ~Allocator.TempJob~ pour un tableau qui vit quelques images, ~Persistent~ pour un tableau gardé longtemps.`],
['Lancer et attendre',`~job.Schedule(count, batchSize)~ lance un ~IJobParallelFor~ et renvoie un ~JobHandle~. ~handle.Complete()~ attend la fin. Pour vraiment gagner du temps, on lance le job tôt dans l'image et on le termine le plus tard possible. Pour des milliers de Transform, ~IJobParallelForTransform~ existe.`]],
ex:`Écris un job Burst ~IJobParallelFor~ qui fait avancer 10 000 positions (~NativeArray<float3>~) selon leurs vitesses, avec rebond sur un sol à y = 0, puis un composant qui le lance chaque image et libère la mémoire à la fin.`,
hint:`[BurstCompile] sur la struct. Dans Execute(int i) : p += v × dt ; si p.y < 0 alors p.y = −p.y et v.y = −v.y × 0,8. Dispose dans OnDestroy.`,
sol:`[BurstCompile]
public struct MoveJob : IJobParallelFor
{
    public NativeArray<float3> positions;
    public NativeArray<float3> velocities;
    public float dt;
    public float3 gravity;

    public void Execute(int i)
    {
        float3 v = velocities[i] + gravity * dt;
        float3 p = positions[i] + v * dt;
        if (p.y < 0f)
        {
            p.y = -p.y;
            v.y = -v.y * 0.8f;   // rebond amorti
        }
        positions[i] = p;
        velocities[i] = v;
    }
}

public class ParticleSim : MonoBehaviour
{
    private const int Count = 10000;
    private NativeArray<float3> positions, velocities;

    private void Start()
    {
        positions = new NativeArray<float3>(Count, Allocator.Persistent);
        velocities = new NativeArray<float3>(Count, Allocator.Persistent);
        var rng = new Unity.Mathematics.Random(1234);
        for (int i = 0; i < Count; i++)
        {
            positions[i] = rng.NextFloat3(new float3(-20, 5, -20), new float3(20, 15, 20));
            velocities[i] = rng.NextFloat3(-2f, 2f);
        }
    }

    private void Update()
    {
        var job = new MoveJob
        {
            positions = positions,
            velocities = velocities,
            dt = Time.deltaTime,
            gravity = new float3(0f, -9.81f, 0f),
        };
        job.Schedule(Count, 64).Complete();
    }

    private void OnDestroy()
    {
        if (positions.IsCreated) positions.Dispose();
        if (velocities.IsCreated) velocities.Dispose();
    }
}`}
]);

window.LESSONS=(window.LESSONS||[]).concat([
{id:'modulo-repetition',cat:'maths',lvl:1,title:'Modulo, Repeat et PingPong',sum:'Faire boucler une valeur : indices circulaires, cycles jour-nuit, allers-retours.',
body:[
['L\'idée',`~a % b~ donne le reste de la division de a par b. ~7 % 3~ vaut 1. C'est l'outil pour faire **boucler** une valeur : passer de la dernière case d'un menu à la première, ou faire tourner un cycle.`],
['Le piège des négatifs',`En C#, le reste garde le signe de a : ~-1 % 5~ vaut **−1**, pas 4. Revenir en arrière depuis l'indice 0 casse donc la boucle. La formule sûre : ~((a % b) + b) % b~.`,`int Wrap(int i, int count) => ((i % count) + count) % count;
// Wrap(-1, 5) == 4`],
['Repeat et PingPong',`Pour les float, ~Mathf.Repeat(t, length)~ boucle entre 0 et length, en gérant les négatifs. ~Mathf.PingPong(t, length)~ fait un aller-retour : 0 → length → 0. Une plateforme qui va et vient : ~Mathf.PingPong(Time.time * speed, 1f)~ comme ~t~ d'un [[interpolation|Lerp]].`],
['Les angles',`Un angle qui boucle sur 360° est un cas de Repeat. Pour la plus petite différence entre deux angles, voir [[angles-signes]].`]],
ex:`Écris ~int Wrap(int i, int count)~, puis un ~DayCycle~ (MonoBehaviour) : une journée dure ~dayLength~ secondes, une propriété ~TimeOfDay~ va de 0 à 1 en boucle, et la lumière du soleil tourne de 360° sur une journée.`,
hint:`TimeOfDay = Mathf.Repeat(elapsed / dayLength, 1f). Rotation : Quaternion.Euler(TimeOfDay * 360f − 90f, 170f, 0f).`,
sol:`public static int Wrap(int i, int count) => ((i % count) + count) % count;

public class DayCycle : MonoBehaviour
{
    [SerializeField] private Light sun;
    [SerializeField] private float dayLength = 120f;
    [SerializeField, Range(0f, 1f)] private float startTime = 0.3f;
    private float elapsed;

    public float TimeOfDay => Mathf.Repeat(startTime + elapsed / dayLength, 1f);

    private void Update()
    {
        elapsed += Time.deltaTime;
        // 0 = minuit (soleil sous l'horizon), 0,5 = midi
        sun.transform.rotation = Quaternion.Euler(TimeOfDay * 360f - 90f, 170f, 0f);
    }
}`},

{id:'easing',cat:'maths',lvl:2,title:'Fonctions d\'easing',sum:'Donner du caractère au mouvement : accélérer, freiner, rebondir, dépasser.',
body:[
['L\'idée',`Une animation linéaire paraît mécanique. Une fonction d'easing transforme le temps ~t~ (de 0 à 1) avant de le donner à un [[interpolation|Lerp]] : le mouvement démarre doucement, freine en arrivant, ou dépasse puis revient. C'est une grande part du game feel.`],
['Les familles',`**Ease in** : lent au début (~t * t~). **Ease out** : lent à la fin (~1 - (1 - t) * (1 - t)~). **Ease in-out** : les deux (smoothstep ~t * t * (3 - 2 * t)~). **Back** : dépasse un peu la cible. **Elastic** et **bounce** : ressort et rebond.`],
['Une règle pratique',`Ce qui **arrive** à l'écran (un menu, une récompense) s'anime en ease out : rapide puis il se pose. Ce qui **part** s'anime en ease in. Les mouvements longs gagnent à être in-out.`],
['AnimationCurve',`Exposer une ~AnimationCurve~ dans l'inspecteur laisse les designers dessiner la courbe ; ~curve.Evaluate(t)~ remplace la fonction. Pratique, mais une fonction écrite en code reste plus facile à partager entre projets.`]],
ex:`Écris une classe static ~Ease~ avec ~OutCubic~, ~InOutQuad~ et ~OutBack~ (t de 0 à 1). Puis une coroutine ~PopIn(Transform t, float duration)~ qui fait grossir un objet de 0 à sa taille d'origine avec OutBack.`,
hint:`OutCubic : 1 − (1 − t)³. OutBack avec c1 = 1,70158 et c3 = c1 + 1 : 1 + c3 (t − 1)³ + c1 (t − 1)².`,
sol:`public static class Ease
{
    public static float OutCubic(float t) => 1f - Mathf.Pow(1f - t, 3f);

    public static float InOutQuad(float t) =>
        t < 0.5f ? 2f * t * t : 1f - Mathf.Pow(-2f * t + 2f, 2f) / 2f;

    public static float OutBack(float t)
    {
        const float c1 = 1.70158f, c3 = c1 + 1f;
        float u = t - 1f;
        return 1f + c3 * u * u * u + c1 * u * u;
    }
}

public static IEnumerator PopIn(Transform target, float duration)
{
    Vector3 full = target.localScale;
    for (float time = 0f; time < duration; time += Time.deltaTime)
    {
        float k = Ease.OutBack(time / duration);
        target.localScale = full * k;        // dépasse 1 un instant, puis revient
        yield return null;
    }
    target.localScale = full;
}`},

{id:'smoothdamp-ressort',cat:'maths',lvl:2,title:'SmoothDamp et ressorts',sum:'Suivre une cible en douceur, avec une vitesse qui monte et descend naturellement.',
body:[
['L\'idée',`~Vector3.SmoothDamp(current, target, ref velocity, smoothTime)~ fait glisser une valeur vers une cible comme si elle était tirée par un ressort amorti : elle accélère, puis freine sans dépasser. Elle garde sa propre vitesse dans ~velocity~, passée en [[methodes-parametres|ref]].`],
['Pourquoi c\'est mieux qu\'un Lerp',`Le [[interpolation|Lerp exponentiel]] démarre brutalement à pleine vitesse. SmoothDamp part de la vitesse actuelle : si la cible bouge, le mouvement reste continu. C'est le choix habituel pour une caméra (voir [[camera-suivi]]).`],
['Le piège de la vitesse partagée',`La variable ~velocity~ doit être un **champ**, conservé d'une image à l'autre, et propre à chaque valeur suivie. Une variable locale remise à zéro à chaque appel casse l'effet.`],
['Un vrai ressort',`Pour un effet qui dépasse et oscille (un bouton élastique, un objet qui tremble), on simule un ressort : une force proportionnelle à l'écart (raideur) moins une force proportionnelle à la vitesse (amortissement), intégrées à chaque pas.`]],
ex:`Écris une struct ~Spring~ avec ~stiffness~, ~damping~, une valeur, une vitesse et ~float Step(float target, float dt)~ qui fait osciller la valeur vers la cible. Utilise-la pour faire rebondir l'échelle d'un bouton quand on clique dessus.`,
hint:`force = (target − value) × stiffness − velocity × damping ; velocity += force × dt ; value += velocity × dt.`,
sol:`[Serializable]
public struct Spring
{
    public float stiffness;   // ex. 300
    public float damping;     // ex. 12
    public float value;
    public float velocity;

    public float Step(float target, float dt)
    {
        float force = (target - value) * stiffness - velocity * damping;
        velocity += force * dt;
        value += velocity * dt;
        return value;
    }
}

public class BouncyButton : MonoBehaviour
{
    [SerializeField] private Spring spring = new Spring { stiffness = 300f, damping = 12f, value = 1f };

    public void OnClick() => spring.value = 0.8f;   // écrase le bouton

    private void Update()
    {
        float s = spring.Step(1f, Time.unscaledDeltaTime);
        transform.localScale = Vector3.one * s;
    }
}`},

{id:'courbes-bezier',cat:'maths',lvl:2,title:'Courbes de Bézier',sum:'Des courbes douces définies par quelques points : trajectoires, rails, projectiles en arc.',
body:[
['L\'idée',`Une courbe de Bézier est une suite de [[interpolation|Lerp]] imbriqués. Avec trois points A, B, C (quadratique) : on lerp A→B et B→C avec le même t, puis on lerp entre les deux résultats. Le point B tire la courbe vers lui sans qu'elle passe dessus.`],
['La cubique',`Avec quatre points, on obtient la courbe des logiciels de dessin : deux extrémités et deux poignées. En formule directe, avec ~u = 1 - t~ : ~u³A + 3u²tB + 3ut²C + t³D~.`],
['La vitesse n\'est pas constante',`Avancer t régulièrement ne déplace pas le point à vitesse constante : il ralentit là où la courbe se resserre. Pour une vitesse constante, on précalcule la longueur de petits segments et on avance en distance.`],
['Usages',`Un projectile qui part en arc vers une cible, une caméra de cinématique, le chemin d'un ennemi, une ligne de connexion dans un outil d'éditeur (voir [[handles-scene]]).`]],
ex:`Écris ~Vector3 Quadratic(Vector3 a, Vector3 b, Vector3 c, float t)~ avec des Lerp, ~Vector3 Cubic(a, b, c, d, t)~ en formule directe, puis une coroutine qui lance un objet de ~from~ à ~to~ en arc, avec un point de contrôle au milieu surélevé de ~height~.`,
hint:`Contrôle de l'arc : (from + to) / 2 + Vector3.up × height × 2 (le sommet de la courbe est à mi-hauteur du point de contrôle).`,
sol:`public static Vector3 Quadratic(Vector3 a, Vector3 b, Vector3 c, float t)
{
    Vector3 ab = Vector3.Lerp(a, b, t);
    Vector3 bc = Vector3.Lerp(b, c, t);
    return Vector3.Lerp(ab, bc, t);
}

public static Vector3 Cubic(Vector3 a, Vector3 b, Vector3 c, Vector3 d, float t)
{
    float u = 1f - t;
    return u * u * u * a + 3f * u * u * t * b + 3f * u * t * t * c + t * t * t * d;
}

public static IEnumerator Arc(Transform obj, Vector3 from, Vector3 to, float height, float duration)
{
    // Le sommet d'une quadratique est à mi-chemin du point de contrôle
    Vector3 control = (from + to) * 0.5f + Vector3.up * height * 2f;
    for (float time = 0f; time < duration; time += Time.deltaTime)
    {
        obj.position = Quadratic(from, control, to, time / duration);
        yield return null;
    }
    obj.position = to;
}`},

{id:'angles-signes',cat:'maths',lvl:2,title:'Angles signés et différences d\'angles',sum:'SignedAngle, DeltaAngle, MoveTowardsAngle : tourner du bon côté et du plus court chemin.',
body:[
['L\'idée',`~Vector3.Angle(a, b)~ renvoie un angle entre 0 et 180° : il dit « de combien », pas « de quel côté ». ~Vector3.SignedAngle(a, b, axis)~ ajoute le signe : positif si on tourne dans le sens horaire autour de l'axe (vu depuis le haut de l'axe, dans le repère de Unity).`],
['DeltaAngle',`Entre 350° et 10°, la différence brute est −340°, mais le plus court chemin est +20°. ~Mathf.DeltaAngle(current, target)~ renvoie toujours la différence la plus courte, entre −180 et 180. C'est indispensable pour une tourelle qui ne doit pas faire un tour complet.`],
['Tourner vers un angle',`~Mathf.MoveTowardsAngle~ et ~Mathf.LerpAngle~ font la même chose que leurs équivalents normaux, mais en passant par le plus court chemin autour du cercle. En 3D, préfère [[quaternions|Quaternion.RotateTowards]].`],
['Liens',`Le signe d'un angle se calcule aussi avec le [[produit-vectoriel]]. Pour boucler une valeur sur 360°, voir [[modulo-repetition]].`]],
ex:`Écris un composant ~Turret~ qui tourne uniquement autour de l'axe vertical vers une cible, à vitesse maximale ~degPerSec~, par le plus court chemin, et expose ~IsAimed~ (vrai si l'écart est sous 2°). Utilise des angles en degrés, pas de quaternion pour la décision.`,
hint:`Angle visé : Mathf.Atan2(dir.x, dir.z) × Rad2Deg. Puis Mathf.MoveTowardsAngle sur transform.eulerAngles.y.`,
sol:`public class Turret : MonoBehaviour
{
    [SerializeField] private Transform target;
    [SerializeField] private float degPerSec = 120f;

    public bool IsAimed { get; private set; }

    private void Update()
    {
        if (target == null) return;
        Vector3 dir = target.position - transform.position;

        // Angle de lacet : 0° = +Z (avant), 90° = +X (droite)
        float wanted = Mathf.Atan2(dir.x, dir.z) * Mathf.Rad2Deg;
        float current = transform.eulerAngles.y;

        float next = Mathf.MoveTowardsAngle(current, wanted, degPerSec * Time.deltaTime);
        transform.rotation = Quaternion.Euler(0f, next, 0f);

        IsAimed = Mathf.Abs(Mathf.DeltaAngle(next, wanted)) < 2f;
    }
}`},

{id:'projection-vecteurs',cat:'maths',lvl:2,title:'Projeter un vecteur',sum:'Project et ProjectOnPlane : garder la part d\'un mouvement qui va dans une direction, ou sur une surface.',
body:[
['L\'idée',`Projeter un vecteur v sur une direction d, c'est garder seulement la part de v qui va **dans** cette direction. C'est le [[produit-scalaire]] multiplié par la direction : ~Vector3.Project(v, d)~ = ~Dot(v, d̂) × d̂~.`],
['Sur un plan',`~Vector3.ProjectOnPlane(v, normal)~ fait l'inverse : il **retire** la part de v qui va dans la normale. Il reste ce qui glisse le long de la surface. C'est exactement ce qu'il faut pour marcher sur une pente ou glisser le long d'un mur.`,`Vector3 slide = Vector3.ProjectOnPlane(velocity, hit.normal);`],
['Usages',`Faire marcher un personnage parallèlement au sol (la pente), une caméra qui suit sans monter ni descendre (projeter sur le plan horizontal), un déplacement relatif à la caméra (ses axes avant et droit à plat).`],
['Liens',`Faire rebondir une balle revient à retirer deux fois la projection sur la normale : voir [[raycast]].`]],
ex:`Écris ~Vector3 CameraRelativeMove(Transform cam, Vector2 input)~ qui transforme l'entrée du stick en direction de déplacement à plat, relative à la caméra. Puis ~Vector3 AlongGround(Vector3 move, Vector3 groundNormal)~ qui oriente ce déplacement le long de la pente en gardant sa longueur.`,
hint:`Projette cam.forward et cam.right sur le plan Vector3.up et normalise-les. Pour la pente : ProjectOnPlane puis normalise et remultiplie par la longueur d'origine.`,
sol:`public static Vector3 CameraRelativeMove(Transform cam, Vector2 input)
{
    Vector3 forward = Vector3.ProjectOnPlane(cam.forward, Vector3.up).normalized;
    Vector3 right = Vector3.ProjectOnPlane(cam.right, Vector3.up).normalized;
    Vector3 move = forward * input.y + right * input.x;
    return Vector3.ClampMagnitude(move, 1f);
}

public static Vector3 AlongGround(Vector3 move, Vector3 groundNormal)
{
    float length = move.magnitude;
    if (length < 0.0001f) return Vector3.zero;
    Vector3 onSlope = Vector3.ProjectOnPlane(move, groundNormal);
    return onSlope.normalized * length;   // même vitesse, en suivant la pente
}`},

{id:'matrices',cat:'maths',lvl:3,title:'Matrices de transformation',sum:'La matrice 4×4 qui combine position, rotation et échelle, et ce qu\'on peut en faire.',
body:[
['L\'idée',`Une matrice 4×4 (~Matrix4x4~) code une transformation complète : déplacement, rotation et échelle. Appliquer une matrice à un point le fait passer d'un repère à un autre. C'est ce que fait un ~Transform~ en interne (voir [[espaces-coordonnees]]).`],
['Construire et appliquer',`~Matrix4x4.TRS(position, rotation, scale)~ construit la matrice. ~m.MultiplyPoint3x4(p)~ transforme un point, ~m.MultiplyVector(v)~ une direction (sans la position). ~m.inverse~ fait le chemin retour.`],
['Composer',`Multiplier deux matrices les enchaîne : ~parent * enfant~ donne la matrice monde de l'enfant. L'ordre compte, comme pour les [[quaternions]] : la transformation de droite s'applique en premier.`],
['Usages',`Dessiner des milliers d'objets identiques avec ~Graphics.RenderMeshInstanced~ (on passe un tableau de matrices au lieu de créer des GameObjects), dessiner des [[gizmos]] tournés avec ~Gizmos.matrix~, générer des maillages, calculer des positions sans créer de Transform.`]],
ex:`Écris ~Matrix4x4[] RingMatrices(Vector3 center, float radius, int count, float scale)~ qui renvoie les matrices de count objets disposés en cercle, chacun tourné vers l'extérieur. Puis un composant qui les dessine chaque image avec ~Graphics.RenderMeshInstanced~.`,
hint:`Position avec cos et sin (voir la trigonométrie), rotation Quaternion.LookRotation(position − center). RenderParams prend le matériau.`,
sol:`public static Matrix4x4[] RingMatrices(Vector3 center, float radius, int count, float scale)
{
    var result = new Matrix4x4[count];
    for (int i = 0; i < count; i++)
    {
        float a = i * Mathf.PI * 2f / count;
        Vector3 offset = new Vector3(Mathf.Cos(a), 0f, Mathf.Sin(a)) * radius;
        Quaternion rot = Quaternion.LookRotation(offset.normalized, Vector3.up);
        result[i] = Matrix4x4.TRS(center + offset, rot, Vector3.one * scale);
    }
    return result;
}

public class RingRenderer : MonoBehaviour
{
    [SerializeField] private Mesh mesh;
    [SerializeField] private Material material;   // "Enable GPU Instancing" coché
    [SerializeField] private int count = 200;
    private Matrix4x4[] matrices;

    private void Start() => matrices = RingMatrices(transform.position, 10f, count, 0.5f);

    private void Update()
    {
        var rp = new RenderParams(material);
        Graphics.RenderMeshInstanced(rp, mesh, 0, matrices);
    }
}`},

{id:'plans-intersections',cat:'maths',lvl:3,title:'Plans et intersections',sum:'Où un rayon coupe un plan : viser le sol avec la souris, sans collider.',
body:[
['L\'idée',`Un plan infini se définit par une normale et un point (ou une distance à l'origine). Unity fournit la struct ~Plane~. ~plane.Raycast(ray, out float enter)~ dit si un rayon le coupe et à quelle distance : le point est ~ray.GetPoint(enter)~.`],
['La formule',`Pour un rayon d'origine O et de direction D, et un plan de normale N passant par P : ~t = Dot(P - O, N) / Dot(D, N)~. Si ~Dot(D, N)~ vaut 0, le rayon est parallèle au plan. Si t est négatif, le plan est derrière l'origine. Tout repose sur le [[produit-scalaire]].`],
['Pourquoi c\'est utile',`Viser le sol d'un jeu de stratégie avec la souris sans avoir besoin d'un collider ni de la physique, placer un objet sur une table, projeter une ombre simple. C'est beaucoup plus léger qu'un [[raycast]] physique.`],
['Côté d\'un point',`~plane.GetSide(p)~ ou le signe de ~Dot(p - P, N)~ dit de quel côté du plan se trouve un point : utile pour savoir si le joueur a franchi une ligne d'arrivée.`]],
ex:`Écris ~bool MouseOnGround(Camera cam, float groundHeight, out Vector3 point)~ qui renvoie le point du plan horizontal y = groundHeight sous la souris, sans Plane ni physique : calcule t avec la formule.`,
hint:`Rayon : cam.ScreenPointToRay(Input.mousePosition). Normale (0, 1, 0), donc Dot(D, N) = D.y et Dot(P − O, N) = groundHeight − O.y.`,
sol:`public static bool MouseOnGround(Camera cam, float groundHeight, out Vector3 point)
{
    Ray ray = cam.ScreenPointToRay(Input.mousePosition);
    point = default;

    float denom = ray.direction.y;                 // Dot(D, up)
    if (Mathf.Abs(denom) < 1e-5f) return false;    // rayon parallèle au sol

    float t = (groundHeight - ray.origin.y) / denom;
    if (t < 0f) return false;                      // le sol est derrière la caméra

    point = ray.origin + ray.direction * t;
    return true;
}`},

{id:'collisions-formes',cat:'maths',lvl:2,title:'Collisions de formes simples',sum:'Cercle contre cercle, boîte contre boîte, point dans un rectangle : tester sans moteur physique.',
body:[
['L\'idée',`Beaucoup de jeux (shoot'em up, puzzles, outils) n'ont pas besoin de la physique complète. Des tests mathématiques simples suffisent, et sont bien plus rapides.`],
['Cercles et sphères',`Deux cercles se touchent si la distance entre leurs centres est inférieure à la somme des rayons. Avec les [[longueur-distance|distances au carré]], pas besoin de racine : ~(a - b).sqrMagnitude <= (ra + rb)²~.`],
['Boîtes alignées (AABB)',`Deux rectangles alignés sur les axes se chevauchent si leurs projections se chevauchent **sur chaque axe** : ~a.min.x <= b.max.x && a.max.x >= b.min.x~, et pareil en y. Unity fournit ~Rect.Overlaps~ et ~Bounds.Intersects~.`],
['Cercle contre boîte',`On cherche le point de la boîte le plus proche du centre du cercle en bornant (~Mathf.Clamp~) chaque coordonnée, puis on teste la distance à ce point. Pour beaucoup d'objets, combine avec une [[partition-spatiale]].`]],
ex:`Écris ~bool CircleCircle(Vector2 a, float ra, Vector2 b, float rb)~, ~bool AabbOverlap(Vector2 aMin, Vector2 aMax, Vector2 bMin, Vector2 bMax)~ et ~bool CircleAabb(Vector2 c, float r, Vector2 min, Vector2 max)~.`,
hint:`CircleAabb : point le plus proche = (Clamp(c.x, min.x, max.x), Clamp(c.y, min.y, max.y)).`,
sol:`public static bool CircleCircle(Vector2 a, float ra, Vector2 b, float rb)
{
    float r = ra + rb;
    return (a - b).sqrMagnitude <= r * r;
}

public static bool AabbOverlap(Vector2 aMin, Vector2 aMax, Vector2 bMin, Vector2 bMax)
{
    return aMin.x <= bMax.x && aMax.x >= bMin.x
        && aMin.y <= bMax.y && aMax.y >= bMin.y;
}

public static bool CircleAabb(Vector2 c, float r, Vector2 min, Vector2 max)
{
    var closest = new Vector2(
        Mathf.Clamp(c.x, min.x, max.x),
        Mathf.Clamp(c.y, min.y, max.y));
    return (c - closest).sqrMagnitude <= r * r;
}`},

{id:'point-aleatoire-forme',cat:'maths',lvl:2,title:'Points aléatoires dans une forme',sum:'Répartir uniformément des points dans un disque, sur une sphère ou dans un anneau.',
body:[
['L\'idée',`Tirer un angle et un rayon au hasard semble donner un point au hasard dans un disque, mais les points s'entassent au **centre** : il y a autant de rayons courts que longs, alors que l'anneau extérieur est bien plus grand.`],
['La correction',`Pour une répartition uniforme, on prend la **racine carrée** du nombre aléatoire pour le rayon : ~r = R × √(Random.value)~. L'aire grandit comme le carré du rayon ; la racine compense.`],
['Ce que Unity fournit',`~Random.insideUnitCircle~ (disque), ~Random.insideUnitSphere~ (boule) et ~Random.onUnitSphere~ (surface de la sphère) sont déjà uniformes. ~Random.rotationUniform~ donne une orientation au hasard.`],
['Usages',`Faire apparaître des ennemis autour du joueur mais pas trop près (un anneau), disperser un butin, la dispersion d'une arme dans un cône. Pour une graine reproductible, voir [[aleatoire]]. Pour une répartition sans amas, regarde aussi le [[bruit-perlin]] ou l'échantillonnage de Poisson.`]],
ex:`Écris ~Vector2 InDisk(float radius, System.Random rng)~ uniforme, puis ~Vector3 InRing(Vector3 center, float minR, float maxR, System.Random rng)~ sur le plan horizontal, uniforme entre deux rayons.`,
hint:`Pour l'anneau : r = √(lerp(minR², maxR², u)) avec u aléatoire entre 0 et 1.`,
sol:`public static Vector2 InDisk(float radius, System.Random rng)
{
    float angle = (float)(rng.NextDouble() * Math.PI * 2.0);
    float r = radius * Mathf.Sqrt((float)rng.NextDouble());
    return new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * r;
}

public static Vector3 InRing(Vector3 center, float minR, float maxR, System.Random rng)
{
    float angle = (float)(rng.NextDouble() * Math.PI * 2.0);
    float u = (float)rng.NextDouble();
    float r = Mathf.Sqrt(Mathf.Lerp(minR * minR, maxR * maxR, u));
    return center + new Vector3(Mathf.Cos(angle), 0f, Mathf.Sin(angle)) * r;
}`},

{id:'bruit-perlin',cat:'maths',lvl:2,title:'Bruit de Perlin',sum:'Un hasard doux et continu : terrains, nuages, tremblements de caméra naturels.',
body:[
['L\'idée',`~Random.value~ saute d'une valeur à l'autre sans lien. Le bruit de Perlin donne des valeurs **qui varient en douceur** : deux points proches ont des valeurs proches. ~Mathf.PerlinNoise(x, y)~ renvoie une valeur à peu près entre 0 et 1.`],
['Fréquence et octaves',`Multiplier les coordonnées (la fréquence) rend le relief plus serré. On additionne souvent plusieurs couches (octaves) : une grande à faible fréquence pour les collines, des petites plus fréquentes et plus faibles pour les détails.`],
['Le tremblement de caméra',`Un tremblement à base de ~Random~ paraît nerveux et bon marché. Avec Perlin, en faisant avancer x avec le temps, le mouvement est organique. On utilise une ligne différente de y pour chaque axe.`],
['Les pièges',`~PerlinNoise~ vaut la même chose sur les coordonnées entières : évite de l'échantillonner seulement sur des entiers. Pour une graine, décale les coordonnées d'une valeur tirée au hasard (voir [[aleatoire]]).`]],
ex:`Écris ~float Fractal(float x, float y, int octaves)~ (chaque octave double la fréquence et divise l'amplitude par deux, résultat normalisé entre 0 et 1), puis un composant ~CameraShake~ avec ~Shake(float strength)~, un traumatisme qui diminue avec le temps et un décalage de position par Perlin.`,
hint:`Pour le shake : trauma diminue de 1 par seconde ; le décalage vaut (Perlin − 0,5) × 2 × trauma² × amplitude.`,
sol:`public static float Fractal(float x, float y, int octaves)
{
    float sum = 0f, amplitude = 1f, frequency = 1f, norm = 0f;
    for (int i = 0; i < octaves; i++)
    {
        sum += Mathf.PerlinNoise(x * frequency, y * frequency) * amplitude;
        norm += amplitude;
        amplitude *= 0.5f;
        frequency *= 2f;
    }
    return sum / norm;
}

public class CameraShake : MonoBehaviour
{
    [SerializeField] private float maxOffset = 0.5f, frequency = 25f;
    private float trauma, seed;
    private Vector3 basePos;

    private void Awake()
    {
        basePos = transform.localPosition;
        seed = UnityEngine.Random.value * 100f;
    }

    public void Shake(float strength) => trauma = Mathf.Clamp01(trauma + strength);

    private void LateUpdate()
    {
        trauma = Mathf.Max(0f, trauma - Time.deltaTime);
        float k = trauma * trauma * maxOffset;     // au carré : plus doux en fin de secousse
        float t = Time.time * frequency;
        var offset = new Vector3(
            (Mathf.PerlinNoise(seed, t) - 0.5f) * 2f,
            (Mathf.PerlinNoise(seed + 1f, t) - 0.5f) * 2f,
            0f) * k;
        transform.localPosition = basePos + offset;
    }
}`}
]);

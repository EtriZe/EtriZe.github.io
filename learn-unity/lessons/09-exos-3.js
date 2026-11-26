/* Exercices 51 à 75 : maths et physique de jeu */
window.LESSONS=(window.LESSONS||[]).concat([
{id:'exo-portee',cat:'exos',lvl:1,title:'Ennemis à portée',sum:'Trouver les cibles dans un rayon sans calculer une seule racine carrée.',
ex:`Écris ~List<Vector2> InRange(Vector2 center, float radius, List<Vector2> targets)~ en comparant les distances au carré, puis ~int Closest(Vector2 from, List<Vector2> targets)~ qui renvoie l'index de la cible la plus proche (−1 si la liste est vide). Voir [[longueur-distance]].`,
hint:`~(a − b).sqrMagnitude <= radius * radius~ donne le même résultat que la distance, sans racine carrée.`,
sol:`public static List<Vector2> InRange(Vector2 center, float radius, List<Vector2> targets)
{
    float r2 = radius * radius;
    return targets.Where(t => (t - center).sqrMagnitude <= r2).ToList();
}

public static int Closest(Vector2 from, List<Vector2> targets)
{
    int best = -1;
    float bestD2 = float.MaxValue;
    for (int i = 0; i < targets.Count; i++)
    {
        float d2 = (targets[i] - from).sqrMagnitude;
        if (d2 < bestD2) { bestD2 = d2; best = i; }
    }
    return best;
}`},

{id:'exo-cone-vision',cat:'exos',lvl:2,title:'Cône de vision d\'un garde',sum:'Le garde voit-il le joueur ? Distance, angle de vue et produit scalaire, comme dans les jeux d\'infiltration.',src:['Wikipédia : Jeu d\'infiltration','https://fr.wikipedia.org/wiki/Jeu_vid%C3%A9o_d%27infiltration'],
ex:`Écris ~bool CanSee(Vector2 guard, Vector2 forward, Vector2 target, float viewAngle, float range)~ où ~viewAngle~ est l'ouverture totale en degrés (90° = 45° de chaque côté). Bonus : à courte distance (moins de 1,5 unité), le garde « sent » le joueur même dans son dos.`,
hint:`Compare le produit scalaire de ~forward.normalized~ et de la direction normalisée vers la cible à ~cos(viewAngle / 2)~. Voir [[produit-scalaire]].`,
sol:`public static bool CanSee(Vector2 guard, Vector2 forward, Vector2 target, float viewAngle, float range)
{
    Vector2 toTarget = target - guard;
    float dist2 = toTarget.sqrMagnitude;
    if (dist2 > range * range) return false;
    if (dist2 < 1.5f * 1.5f) return true;                        // trop près : il l'entend

    float cosHalf = Mathf.Cos(viewAngle * 0.5f * Mathf.Deg2Rad);
    return Vector2.Dot(forward.normalized, toTarget.normalized) >= cosHalf;
}`},

{id:'exo-gauche-droite',cat:'exos',lvl:2,title:'À gauche ou à droite ?',sum:'Le signe du produit vectoriel en 2D, pour tourner une tourelle dans le bon sens.',
ex:`Écris ~int Side(Vector2 forward, Vector2 toTarget)~ qui renvoie 1 si la cible est à gauche, −1 si elle est à droite, 0 si elle est alignée. Puis ~float TurnTowards(float currentAngle, Vector2 pos, Vector2 target, float maxDegrees)~ qui tourne une tourelle d'au plus ~maxDegrees~ vers la cible. Voir [[produit-vectoriel]] et [[angles-signes]].`,
hint:`En 2D, le « produit vectoriel » vaut a.x × b.y − a.y × b.x : positif si b est à gauche de a (sens antihoraire).`,
sol:`public static float Cross(Vector2 a, Vector2 b) => a.x * b.y - a.y * b.x;

public static int Side(Vector2 forward, Vector2 toTarget)
{
    float c = Cross(forward, toTarget);
    return c > 1e-5f ? 1 : c < -1e-5f ? -1 : 0;
}

public static float TurnTowards(float currentAngle, Vector2 pos, Vector2 target, float maxDegrees)
{
    Vector2 d = target - pos;
    float wanted = Mathf.Atan2(d.y, d.x) * Mathf.Rad2Deg;
    float delta = Mathf.DeltaAngle(currentAngle, wanted);     // entre -180 et 180
    return currentAngle + Mathf.Clamp(delta, -maxDegrees, maxDegrees);
}`},

{id:'exo-rebond',cat:'exos',lvl:2,title:'Faire rebondir une balle',sum:'La réflexion d\'un vecteur sur une surface, au cœur de Breakout et de tous les jeux de flipper.',src:['Wikipédia : Breakout','https://fr.wikipedia.org/wiki/Breakout_(jeu_vid%C3%A9o,_1976)'],
ex:`Écris ~Vector2 Reflect(Vector2 v, Vector2 normal)~ sans utiliser ~Vector2.Reflect~, puis compare avec lui. Ajoute un coefficient de restitution ~bounciness~ (1 = rebond parfait, 0,5 = la balle perd la moitié de sa vitesse perpendiculaire au mur).`,
hint:`r = v − 2 (v · n) n, avec n normalisé. Pour la restitution, sépare v en composante normale (v · n) n et tangentielle, et ne réduis que la normale.`,
sol:`public static Vector2 Reflect(Vector2 v, Vector2 normal)
{
    Vector2 n = normal.normalized;
    return v - 2f * Vector2.Dot(v, n) * n;
}

public static Vector2 Bounce(Vector2 v, Vector2 normal, float bounciness)
{
    Vector2 n = normal.normalized;
    Vector2 normalPart = Vector2.Dot(v, n) * n;
    Vector2 tangentPart = v - normalPart;
    return tangentPart - normalPart * bounciness;
}`},

{id:'exo-pong-angle',cat:'exos',lvl:2,title:'L\'angle de renvoi de Pong',sum:'La balle repart avec un angle qui dépend de l\'endroit où elle touche la raquette : c\'est ce qui rend Pong jouable.',src:['Wikipédia : Pong','https://fr.wikipedia.org/wiki/Pong'],
ex:`La raquette gauche est centrée en ~paddleY~ et mesure ~paddleHeight~. Écris ~Vector2 PaddleBounce(float ballY, float paddleY, float paddleHeight, float speed, float maxAngle = 60)~ : au centre, la balle repart à l'horizontale ; au bord, avec l'angle maximal. Accélère la balle de 5 % à chaque renvoi.`,
hint:`offset = (ballY − paddleY) / (paddleHeight / 2), borné entre −1 et 1. Angle = offset × maxAngle. Direction = (cos, sin) de cet angle.`,
sol:`public static Vector2 PaddleBounce(float ballY, float paddleY, float paddleHeight, float speed, float maxAngle = 60f)
{
    float offset = Mathf.Clamp((ballY - paddleY) / (paddleHeight * 0.5f), -1f, 1f);
    float angle = offset * maxAngle * Mathf.Deg2Rad;
    float newSpeed = speed * 1.05f;
    return new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * newSpeed;   // vers la droite
}`},

{id:'exo-asteroids-bords',cat:'exos',lvl:1,title:'Les bords d\'Asteroids',sum:'Sortir d\'un côté de l\'écran et réapparaître de l\'autre, comme dans Asteroids (1979).',src:['Wikipédia : Asteroids','https://fr.wikipedia.org/wiki/Asteroids'],
ex:`Écris ~Vector2 Wrap(Vector2 p, Rect bounds)~ qui ramène une position dans le rectangle de jeu. Puis ~Vector2 ShortestDelta(Vector2 from, Vector2 to, Rect bounds)~ : le chemin le plus court vers une cible dans un monde qui boucle (utile pour viser à travers le bord). Voir [[modulo-repetition]].`,
hint:`~Mathf.Repeat(p.x − bounds.xMin, bounds.width) + bounds.xMin~. Pour le chemin le plus court, si |dx| dépasse la moitié de la largeur, passe par l'autre côté.`,
sol:`public static Vector2 Wrap(Vector2 p, Rect bounds)
{
    return new Vector2(
        Mathf.Repeat(p.x - bounds.xMin, bounds.width) + bounds.xMin,
        Mathf.Repeat(p.y - bounds.yMin, bounds.height) + bounds.yMin);
}

public static Vector2 ShortestDelta(Vector2 from, Vector2 to, Rect bounds)
{
    Vector2 d = to - from;
    if (d.x > bounds.width / 2) d.x -= bounds.width;
    else if (d.x < -bounds.width / 2) d.x += bounds.width;
    if (d.y > bounds.height / 2) d.y -= bounds.height;
    else if (d.y < -bounds.height / 2) d.y += bounds.height;
    return d;
}`},

{id:'exo-aabb',cat:'exos',lvl:1,title:'Collision de boîtes',sum:'Le test AABB et le vecteur pour séparer deux rectangles qui se chevauchent.',src:['MDN : Détection de collision 2D','https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection'],
ex:`Avec ~struct Box { Vector2 center; Vector2 half; }~, écris ~bool Overlaps(Box a, Box b)~, puis ~Vector2 Penetration(Box a, Box b)~ : le plus petit déplacement à appliquer à a pour qu'elle ne touche plus b (sur l'axe où le chevauchement est le plus faible). Voir [[collisions-formes]].`,
hint:`Chevauchement en x = (a.half.x + b.half.x) − |a.center.x − b.center.x|. S'il est positif sur les deux axes, il y a collision ; on pousse sur l'axe du plus petit chevauchement, dans le sens qui éloigne a de b.`,
sol:`public struct Box
{
    public Vector2 center, half;
    public Box(Vector2 c, Vector2 h) { center = c; half = h; }
}

public static bool Overlaps(Box a, Box b)
    => Mathf.Abs(a.center.x - b.center.x) < a.half.x + b.half.x
    && Mathf.Abs(a.center.y - b.center.y) < a.half.y + b.half.y;

public static Vector2 Penetration(Box a, Box b)
{
    Vector2 d = a.center - b.center;
    float ox = a.half.x + b.half.x - Mathf.Abs(d.x);
    float oy = a.half.y + b.half.y - Mathf.Abs(d.y);
    if (ox <= 0 || oy <= 0) return Vector2.zero;
    return ox < oy
        ? new Vector2(ox * Mathf.Sign(d.x), 0)
        : new Vector2(0, oy * Mathf.Sign(d.y));
}`},

{id:'exo-cercle-rectangle',cat:'exos',lvl:2,title:'Cercle contre rectangle',sum:'Le point le plus proche par « clamp » : la collision d\'une balle avec une brique.',
ex:`Écris ~bool CircleRect(Vector2 c, float r, Rect rect, out Vector2 normal)~ qui détecte la collision entre un cercle et un rectangle aligné sur les axes, et renvoie la normale du point de contact (pour faire rebondir la balle avec l'exercice du rebond).`,
hint:`Le point du rectangle le plus proche du centre : ~(Clamp(c.x, xMin, xMax), Clamp(c.y, yMin, yMax))~. Collision si la distance au carré est inférieure à r². Normale = (c − point) normalisé.`,
sol:`public static bool CircleRect(Vector2 c, float r, Rect rect, out Vector2 normal)
{
    Vector2 closest = new Vector2(
        Mathf.Clamp(c.x, rect.xMin, rect.xMax),
        Mathf.Clamp(c.y, rect.yMin, rect.yMax));
    Vector2 d = c - closest;
    normal = Vector2.zero;
    if (d.sqrMagnitude > r * r) return false;

    if (d.sqrMagnitude > 1e-8f) normal = d.normalized;
    else                                            // centre à l'intérieur : sortir par le côté le plus proche
    {
        float left = c.x - rect.xMin, right = rect.xMax - c.x;
        float down = c.y - rect.yMin, up = rect.yMax - c.y;
        float m = Mathf.Min(Mathf.Min(left, right), Mathf.Min(down, up));
        normal = m == left ? Vector2.left : m == right ? Vector2.right : m == down ? Vector2.down : Vector2.up;
    }
    return true;
}`},

{id:'exo-point-polygone',cat:'exos',lvl:3,title:'Un point dans un polygone',sum:'Le test du rayon : utile pour une zone de capture de forme libre ou un clic sur une région de carte.',src:['Wikipédia : Point in polygon','https://en.wikipedia.org/wiki/Point_in_polygon'],
ex:`Écris ~bool Contains(List<Vector2> polygon, Vector2 p)~ pour un polygone quelconque (même concave). Puis ~float Area(List<Vector2> polygon)~ avec la formule du lacet, et déduis-en si les points sont dans le sens horaire.`,
hint:`Trace un rayon horizontal vers la droite depuis p et compte les côtés qu'il traverse : impair = dedans. Un côté (a, b) est traversé si p.y est entre a.y et b.y et si l'intersection est à droite de p.`,
sol:`public static bool Contains(List<Vector2> poly, Vector2 p)
{
    bool inside = false;
    for (int i = 0, j = poly.Count - 1; i < poly.Count; j = i++)
    {
        Vector2 a = poly[i], b = poly[j];
        if ((a.y > p.y) != (b.y > p.y))
        {
            float xCross = a.x + (p.y - a.y) / (b.y - a.y) * (b.x - a.x);
            if (p.x < xCross) inside = !inside;
        }
    }
    return inside;
}

// Positive si les points tournent dans le sens antihoraire
public static float Area(List<Vector2> poly)
{
    float sum = 0;
    for (int i = 0, j = poly.Count - 1; i < poly.Count; j = i++)
        sum += poly[j].x * poly[i].y - poly[i].x * poly[j].y;
    return sum / 2f;
}`},

{id:'exo-segments',cat:'exos',lvl:3,title:'Intersection de deux segments',sum:'Où un laser coupe-t-il un mur ? La base des lignes de vue et des miroirs.',
ex:`Écris ~bool Intersect(Vector2 a, Vector2 b, Vector2 c, Vector2 d, out Vector2 point)~ qui renvoie le point de croisement des segments [ab] et [cd], ou ~false~ s'ils ne se coupent pas (y compris s'ils sont parallèles). Bonus : trouve le mur le plus proche touché par un laser parmi une liste de segments.`,
hint:`Écris a + t (b − a) = c + u (d − c). Avec le produit vectoriel 2D : t = cross(c − a, d − c) / cross(b − a, d − c), u = cross(c − a, b − a) / cross(b − a, d − c). Il y a intersection si t et u sont entre 0 et 1.`,
sol:`private static float Cross(Vector2 a, Vector2 b) => a.x * b.y - a.y * b.x;

public static bool Intersect(Vector2 a, Vector2 b, Vector2 c, Vector2 d, out Vector2 point)
{
    point = Vector2.zero;
    Vector2 r = b - a, s = d - c;
    float denom = Cross(r, s);
    if (Mathf.Abs(denom) < 1e-8f) return false;          // parallèles

    float t = Cross(c - a, s) / denom;
    float u = Cross(c - a, r) / denom;
    if (t < 0 || t > 1 || u < 0 || u > 1) return false;
    point = a + t * r;
    return true;
}

public static bool Laser(Vector2 from, Vector2 to, List<(Vector2 a, Vector2 b)> walls, out Vector2 hit)
{
    hit = to;
    bool any = false;
    foreach (var w in walls)
        if (Intersect(from, to, w.a, w.b, out Vector2 p) && (p - from).sqrMagnitude < (hit - from).sqrMagnitude)
        {
            hit = p;
            any = true;
        }
    return any;
}`},

{id:'exo-interception',cat:'exos',lvl:3,title:'Viser une cible qui bouge',sum:'Calculer où tirer pour toucher une cible en mouvement : une équation du second degré.',
ex:`Un projectile part de ~shooter~ à la vitesse ~speed~. La cible est en ~target~ et se déplace à vitesse constante ~targetVel~. Écris ~bool AimPoint(Vector2 shooter, Vector2 target, Vector2 targetVel, float speed, out Vector2 aim)~ qui renvoie le point à viser, ou ~false~ si la cible est impossible à rattraper.`,
hint:`On cherche t tel que |D + V t| = speed × t, avec D = target − shooter. En développant : (V·V − s²) t² + 2 (D·V) t + D·D = 0. Prends la plus petite racine positive.`,
sol:`public static bool AimPoint(Vector2 shooter, Vector2 target, Vector2 targetVel, float speed, out Vector2 aim)
{
    aim = target;
    Vector2 D = target - shooter;
    float a = Vector2.Dot(targetVel, targetVel) - speed * speed;
    float b = 2f * Vector2.Dot(D, targetVel);
    float c = Vector2.Dot(D, D);

    float t;
    if (Mathf.Abs(a) < 1e-6f)                         // même vitesse : équation du premier degré
    {
        if (Mathf.Abs(b) < 1e-6f) return false;
        t = -c / b;
    }
    else
    {
        float disc = b * b - 4f * a * c;
        if (disc < 0) return false;
        float sq = Mathf.Sqrt(disc);
        float t1 = (-b - sq) / (2f * a), t2 = (-b + sq) / (2f * a);
        t = Mathf.Min(t1, t2);
        if (t < 0) t = Mathf.Max(t1, t2);
    }
    if (t < 0) return false;
    aim = target + targetVel * t;
    return true;
}`},

{id:'exo-angle-tir',cat:'exos',lvl:3,title:'L\'angle de tir d\'un canon',sum:'Quel angle pour toucher une cible à distance d avec une vitesse donnée ? La balistique de Worms ou d\'Angry Birds.',src:['Wikipédia : Trajectoire d\'un projectile','https://en.wikipedia.org/wiki/Projectile_motion'],
ex:`Sans frottement de l'air, écris ~bool LaunchAngle(float distance, float height, float speed, float gravity, bool high, out float angleDeg)~ qui renvoie l'angle pour toucher une cible située à ~distance~ horizontalement et ~height~ plus haut. Il y a souvent deux solutions : un tir tendu et un tir en cloche (~high~).`,
hint:`tan θ = (v² ± √(v⁴ − g (g x² + 2 y v²))) / (g x). Si la quantité sous la racine est négative, la cible est hors de portée.`,
sol:`public static bool LaunchAngle(float distance, float height, float speed, float gravity, bool high, out float angleDeg)
{
    angleDeg = 0f;
    float v2 = speed * speed;
    float under = v2 * v2 - gravity * (gravity * distance * distance + 2f * height * v2);
    if (under < 0f) return false;                       // hors de portée

    float root = Mathf.Sqrt(under);
    float tan = (v2 + (high ? root : -root)) / (gravity * distance);
    angleDeg = Mathf.Atan(tan) * Mathf.Rad2Deg;
    return true;
}`},

{id:'exo-trajectoire-apercu',cat:'exos',lvl:2,title:'Aperçu de trajectoire',sum:'Les petits points qui montrent où va tomber le projectile avant de tirer.',
ex:`Écris ~List<Vector2> Preview(Vector2 start, Vector2 velocity, float gravity, int points, float timeStep)~ qui renvoie les positions successives du projectile. Arrête la liste dès qu'un point passe sous le sol (y < 0) et ajoute le point d'impact exact à la place.`,
hint:`p(t) = start + velocity × t + ½ × (0, −g) × t². Pour l'impact exact, résous p.y(t) = 0 avec la formule du second degré, ou interpole entre les deux derniers points.`,
sol:`public static List<Vector2> Preview(Vector2 start, Vector2 velocity, float gravity, int points, float timeStep)
{
    var result = new List<Vector2>();
    Vector2 At(float t) => start + velocity * t + new Vector2(0, -0.5f * gravity * t * t);

    for (int i = 0; i < points; i++)
    {
        Vector2 p = At(i * timeStep);
        if (p.y < 0f && i > 0)
        {
            Vector2 prev = result[result.Count - 1];
            float k = prev.y / (prev.y - p.y);                 // où la ligne croise y = 0
            result.Add(Vector2.Lerp(prev, p, k));
            break;
        }
        result.Add(p);
    }
    return result;
}`},

{id:'exo-orbite',cat:'exos',lvl:1,title:'Satellites en orbite',sum:'Faire tourner des objets en cercle ou en ellipse autour d\'un centre, comme des boucliers orbitaux.',
ex:`Écris ~Vector2 Orbit(Vector2 center, float radius, float speedDeg, float time, float phaseDeg)~, puis place n boucliers régulièrement répartis autour du joueur. Bonus : ~Ellipse(center, a, b, …)~ avec deux rayons différents. Voir [[trigonometrie]].`,
hint:`Angle = (phase + vitesse × temps) en radians ; position = centre + (cos, sin) × rayon. Pour n objets, phase = 360 / n × i.`,
sol:`public static Vector2 Orbit(Vector2 center, float radius, float speedDeg, float time, float phaseDeg)
{
    float a = (phaseDeg + speedDeg * time) * Mathf.Deg2Rad;
    return center + new Vector2(Mathf.Cos(a), Mathf.Sin(a)) * radius;
}

public static List<Vector2> Shields(Vector2 player, int n, float radius, float speedDeg, float time)
{
    var list = new List<Vector2>();
    for (int i = 0; i < n; i++)
        list.Add(Orbit(player, radius, speedDeg, time, 360f / n * i));
    return list;
}

public static Vector2 Ellipse(Vector2 center, float a, float b, float speedDeg, float time)
{
    float t = speedDeg * time * Mathf.Deg2Rad;
    return center + new Vector2(Mathf.Cos(t) * a, Mathf.Sin(t) * b);
}`},

{id:'exo-angle-or',cat:'exos',lvl:1,title:'Répartir des points comme un tournesol',sum:'L\'angle d\'or donne une répartition régulière sans motif visible : parfait pour faire apparaître des objets.',src:['Wikipédia : Angle d\'or','https://fr.wikipedia.org/wiki/Angle_d%27or'],
ex:`Écris ~List<Vector2> Sunflower(int count, float radius)~ : le point i est à l'angle i × 137,5° et à la distance radius × √(i / count). Compare visuellement avec des points tirés au hasard dans le disque. Voir [[point-aleatoire-forme]].`,
hint:`L'angle d'or vaut 180 × (3 − √5) degrés, soit environ 137,508°. La racine carrée sur la distance garde une densité constante.`,
sol:`public static List<Vector2> Sunflower(int count, float radius)
{
    float golden = Mathf.PI * (3f - Mathf.Sqrt(5f));     // ≈ 2,39996 rad ≈ 137,5°
    var points = new List<Vector2>(count);
    for (int i = 0; i < count; i++)
    {
        float r = radius * Mathf.Sqrt((i + 0.5f) / count);
        float a = i * golden;
        points.Add(new Vector2(Mathf.Cos(a), Mathf.Sin(a)) * r);
    }
    return points;
}`},

{id:'exo-rotation-2d',cat:'exos',lvl:1,title:'Tourner un vecteur à la main',sum:'La rotation 2D avec sinus et cosinus, sans passer par les quaternions.',
ex:`Écris ~Vector2 Rotate(Vector2 v, float degrees)~ (sens antihoraire), puis ~Vector2 RotateAround(Vector2 p, Vector2 pivot, float degrees)~. Utilise-les pour tirer 5 balles en éventail sur 40°, centrées sur la direction de visée.`,
hint:`x' = x cos θ − y sin θ ; y' = x sin θ + y cos θ. Pour un pivot : translate, tourne, retranslate.`,
sol:`public static Vector2 Rotate(Vector2 v, float degrees)
{
    float a = degrees * Mathf.Deg2Rad;
    float c = Mathf.Cos(a), s = Mathf.Sin(a);
    return new Vector2(v.x * c - v.y * s, v.x * s + v.y * c);
}

public static Vector2 RotateAround(Vector2 p, Vector2 pivot, float degrees)
    => pivot + Rotate(p - pivot, degrees);

public static List<Vector2> Spread(Vector2 aim, int bullets, float totalAngle)
{
    var dirs = new List<Vector2>();
    for (int i = 0; i < bullets; i++)
    {
        float t = bullets == 1 ? 0.5f : i / (float)(bullets - 1);
        dirs.Add(Rotate(aim.normalized, Mathf.Lerp(-totalAngle / 2, totalAngle / 2, t)));
    }
    return dirs;
}`},

{id:'exo-bresenham',cat:'exos',lvl:2,title:'Ligne de vue sur une grille',sum:'L\'algorithme de Bresenham : quelles cases traverse une ligne ? Utile pour la vision dans un rogue-like.',src:['Wikipédia : Algorithme de tracé de segment de Bresenham','https://fr.wikipedia.org/wiki/Algorithme_de_trac%C3%A9_de_segment_de_Bresenham'],
ex:`Écris ~List<Vector2Int> Line(Vector2Int a, Vector2Int b)~ avec uniquement des entiers, dans toutes les directions. Puis ~bool HasLineOfSight(bool[,] walls, Vector2Int a, Vector2Int b)~ qui renvoie ~false~ si une case de la ligne (hors extrémités) est un mur.`,
hint:`Version générale : dx = |x1 − x0|, dy = −|y1 − y0|, err = dx + dy. À chaque pas, e2 = 2 err ; si e2 ≥ dy, avance en x ; si e2 ≤ dx, avance en y.`,
sol:`public static List<Vector2Int> Line(Vector2Int a, Vector2Int b)
{
    var cells = new List<Vector2Int>();
    int x = a.x, y = a.y;
    int dx = Math.Abs(b.x - a.x), sx = a.x < b.x ? 1 : -1;
    int dy = -Math.Abs(b.y - a.y), sy = a.y < b.y ? 1 : -1;
    int err = dx + dy;
    while (true)
    {
        cells.Add(new Vector2Int(x, y));
        if (x == b.x && y == b.y) break;
        int e2 = 2 * err;
        if (e2 >= dy) { err += dy; x += sx; }
        if (e2 <= dx) { err += dx; y += sy; }
    }
    return cells;
}

public static bool HasLineOfSight(bool[,] walls, Vector2Int a, Vector2Int b)
{
    var cells = Line(a, b);
    for (int i = 1; i < cells.Count - 1; i++)
        if (walls[cells[i].x, cells[i].y]) return false;
    return true;
}`},

{id:'exo-courbe-xp',cat:'exos',lvl:1,title:'La courbe d\'expérience',sum:'Combien d\'XP pour chaque niveau ? Les formules des RPG, dont celles de Pokémon.',src:['Bulbapedia : Experience (courbes de Pokémon)','https://bulbapedia.bulbagarden.net/wiki/Experience'],
ex:`Dans Pokémon, la courbe « Moyenne » demande n³ points d'expérience au total pour atteindre le niveau n. Écris ~int TotalXp(int level)~, ~int LevelFor(int xp)~ (le niveau atteint avec cette XP, plafonné à 100) et ~float Progress(int xp)~ (avancement de 0 à 1 dans le niveau courant, pour une barre).`,
hint:`LevelFor : la racine cubique arrondie vers le bas, puis une correction de ±1 à cause des arrondis des float. Progress = (xp − Total(n)) / (Total(n + 1) − Total(n)).`,
sol:`public static int TotalXp(int level) => level * level * level;

public static int LevelFor(int xp)
{
    int n = (int)Math.Floor(Math.Pow(xp, 1.0 / 3.0));
    while (TotalXp(n + 1) <= xp) n++;        // corrige les arrondis
    while (n > 1 && TotalXp(n) > xp) n--;
    return Math.Max(1, Math.Min(n, 100));
}

public static float Progress(int xp)
{
    int n = LevelFor(xp);
    if (n >= 100) return 1f;
    int start = TotalXp(n), end = TotalXp(n + 1);
    return (xp - start) / (float)(end - start);
}`},

{id:'exo-armure',cat:'exos',lvl:1,title:'Réduction des dégâts par l\'armure',sum:'Une formule à rendements décroissants : chaque point d\'armure compte, mais jamais jusqu\'à l\'invincibilité.',
ex:`Écris ~float Mitigated(float damage, float armor)~ avec la formule de nombreux jeux de stratégie et MOBA : dégâts × 100 / (100 + armure). Avec 100 d'armure, on prend la moitié des dégâts. Puis ~float EffectiveHealth(float hp, float armor)~ : combien de dégâts bruts il faut pour tuer. Montre que l'armure ne réduit jamais les dégâts à zéro.`,
hint:`Points de vie effectifs = hp × (100 + armure) / 100. Chaque point d'armure ajoute toujours 1 % de vie effective : c'est pour ça que la formule reste équilibrée.`,
sol:`public static float Mitigated(float damage, float armor)
{
    if (armor >= 0) return damage * 100f / (100f + armor);
    return damage * (2f - 100f / (100f - armor));          // armure négative : dégâts amplifiés
}

public static float EffectiveHealth(float hp, float armor) => hp * (100f + Mathf.Max(0, armor)) / 100f;
// 1000 PV et 100 d'armure : il faut 2000 dégâts bruts`},

{id:'exo-dps-critique',cat:'exos',lvl:1,title:'Dégâts par seconde et coups critiques',sum:'Comparer deux armes avec l\'espérance : la base de l\'équilibrage.',
ex:`Écris ~float ExpectedDps(float damage, float attacksPerSecond, float critChance, float critMultiplier)~. Compare une épée (50 dégâts, 1,2 coup/s, 5 % de critiques à ×2) et une dague (18 dégâts, 3 coups/s, 30 % de critiques à ×2,5). Puis simule 10 000 secondes avec un ~System.Random~ pour vérifier ton calcul.`,
hint:`Dégât moyen d'un coup = damage × (1 + critChance × (critMultiplier − 1)).`,
sol:`public static float ExpectedDps(float damage, float attacksPerSecond, float critChance, float critMultiplier)
    => damage * (1f + critChance * (critMultiplier - 1f)) * attacksPerSecond;

public static double SimulateDps(float damage, float aps, float critChance, float critMult, int seconds, System.Random rng)
{
    double total = 0;
    int hits = (int)(aps * seconds);
    for (int i = 0; i < hits; i++)
        total += rng.NextDouble() < critChance ? damage * critMult : damage;
    return total / seconds;
}
// Épée : 63 DPS, dague : 78,3 DPS`},

{id:'exo-chute-degats',cat:'exos',lvl:1,title:'Dégâts selon la distance',sum:'La baisse de dégâts avec la distance des jeux de tir, et l\'explosion qui touche moins fort au bord.',
ex:`Écris ~float Falloff(float distance, float near, float far, float maxDamage, float minDamage)~ : dégâts pleins jusqu'à ~near~, minimum au-delà de ~far~, baisse linéaire entre les deux. Puis ~float Explosion(float distance, float radius, float maxDamage)~ avec une baisse quadratique, nulle au bord du rayon. Voir [[interpolation]].`,
hint:`t = InverseLerp(near, far, distance), puis Lerp(maxDamage, minDamage, t). Pour l'explosion : (1 − d / r)².`,
sol:`public static float Falloff(float distance, float near, float far, float maxDamage, float minDamage)
{
    float t = Mathf.InverseLerp(near, far, distance);
    return Mathf.Lerp(maxDamage, minDamage, t);
}

public static float Explosion(float distance, float radius, float maxDamage)
{
    if (distance >= radius) return 0f;
    float k = 1f - distance / radius;
    return maxDamage * k * k;
}`},

{id:'exo-easing',cat:'exos',lvl:1,title:'Courbes d\'animation',sum:'Écrire soi-même les fonctions d\'accélération des animations d\'interface.',src:['easings.net : fonctions d\'accélération','https://easings.net/fr'],
ex:`Écris ~EaseInQuad~, ~EaseOutQuad~, ~EaseInOutCubic~, ~EaseOutBack~ (qui dépasse un peu la cible avant d'y revenir) et ~EaseOutBounce~, toutes de [0, 1] vers [0, 1]. Utilise-les pour faire apparaître un bouton avec un léger rebond. Voir [[easing]].`,
hint:`EaseOutX(t) = 1 − EaseInX(1 − t). EaseOutBack : avec c1 = 1,70158 et c3 = c1 + 1, f(t) = 1 + c3 (t − 1)³ + c1 (t − 1)².`,
sol:`public static float EaseInQuad(float t) => t * t;
public static float EaseOutQuad(float t) => 1f - (1f - t) * (1f - t);

public static float EaseInOutCubic(float t)
    => t < 0.5f ? 4f * t * t * t : 1f - Mathf.Pow(-2f * t + 2f, 3f) / 2f;

public static float EaseOutBack(float t)
{
    const float c1 = 1.70158f, c3 = c1 + 1f;
    float u = t - 1f;
    return 1f + c3 * u * u * u + c1 * u * u;
}

public static float EaseOutBounce(float t)
{
    const float n1 = 7.5625f, d1 = 2.75f;
    if (t < 1f / d1) return n1 * t * t;
    if (t < 2f / d1) { t -= 1.5f / d1; return n1 * t * t + 0.75f; }
    if (t < 2.5f / d1) { t -= 2.25f / d1; return n1 * t * t + 0.9375f; }
    t -= 2.625f / d1;
    return n1 * t * t + 0.984375f;
}`},

{id:'exo-bezier-vitesse',cat:'exos',lvl:3,title:'Avancer à vitesse constante sur une courbe',sum:'Sur une courbe de Bézier, t ne correspond pas à la distance : il faut une table de longueurs.',
ex:`Pour une courbe de Bézier cubique, écris ~float Length(…, int samples)~ qui approxime sa longueur, puis ~Vector2 PointAtDistance(…, float distance)~ qui renvoie le point situé à une distance donnée depuis le départ. Un wagon qui suit la courbe doit alors avancer à vitesse constante. Voir [[courbes-bezier]].`,
hint:`Échantillonne la courbe en N points et stocke la longueur cumulée à chaque point. Pour une distance donnée, cherche les deux échantillons qui l'encadrent et interpole t entre eux.`,
sol:`public static Vector2 Bezier(Vector2 p0, Vector2 p1, Vector2 p2, Vector2 p3, float t)
{
    float u = 1f - t;
    return u * u * u * p0 + 3f * u * u * t * p1 + 3f * u * t * t * p2 + t * t * t * p3;
}

public class ArcLengthTable
{
    private readonly Vector2[] p;
    private readonly float[] cumulative;
    public float Length => cumulative[cumulative.Length - 1];

    public ArcLengthTable(Vector2 p0, Vector2 p1, Vector2 p2, Vector2 p3, int samples = 64)
    {
        p = new[] { p0, p1, p2, p3 };
        cumulative = new float[samples + 1];
        Vector2 prev = p0;
        for (int i = 1; i <= samples; i++)
        {
            Vector2 cur = Bezier(p0, p1, p2, p3, i / (float)samples);
            cumulative[i] = cumulative[i - 1] + (cur - prev).magnitude;
            prev = cur;
        }
    }

    public Vector2 PointAtDistance(float distance)
    {
        distance = Mathf.Clamp(distance, 0f, Length);
        int samples = cumulative.Length - 1;
        int i = Array.BinarySearch(cumulative, distance);
        if (i < 0) i = ~i;                              // index du premier élément plus grand
        i = Mathf.Clamp(i, 1, samples);
        float segStart = cumulative[i - 1], segEnd = cumulative[i];
        float local = segEnd > segStart ? (distance - segStart) / (segEnd - segStart) : 0f;
        float t = (i - 1 + local) / samples;
        return Bezier(p[0], p[1], p[2], p[3], t);
    }
}`},

{id:'exo-bruit-valeur',cat:'exos',lvl:2,title:'Écrire son propre bruit',sum:'Un bruit de valeurs en 1D : un hasard lisse pour faire onduler un terrain ou trembler une caméra.',src:['Wikipédia : Value noise','https://en.wikipedia.org/wiki/Value_noise'],
ex:`Écris ~float ValueNoise(float x, int seed)~ : une valeur pseudo-aléatoire entre 0 et 1 pour chaque entier, interpolée doucement entre deux entiers. Puis ~float Fractal(float x, int octaves)~ qui additionne plusieurs couches de plus en plus fines. Compare avec ~Mathf.PerlinNoise~. Voir [[bruit-perlin]].`,
hint:`Une fonction de hachage d'entier vers [0, 1] (multiplications et décalages de bits), puis Lerp entre Hash(i) et Hash(i + 1) avec t lissé par la fonction smoothstep 3t² − 2t³.`,
sol:`private static float Hash(int i, int seed)
{
    unchecked
    {
        uint h = (uint)(i * 374761393 + seed * 668265263);
        h = (h ^ (h >> 13)) * 1274126177u;
        h ^= h >> 16;
        return (h & 0xFFFFFF) / (float)0xFFFFFF;
    }
}

public static float ValueNoise(float x, int seed)
{
    int i = Mathf.FloorToInt(x);
    float t = x - i;
    t = t * t * (3f - 2f * t);                          // smoothstep
    return Mathf.Lerp(Hash(i, seed), Hash(i + 1, seed), t);
}

public static float Fractal(float x, int octaves, int seed = 0)
{
    float sum = 0f, amp = 1f, freq = 1f, norm = 0f;
    for (int o = 0; o < octaves; o++)
    {
        sum += ValueNoise(x * freq, seed + o) * amp;
        norm += amp;
        amp *= 0.5f;
        freq *= 2f;
    }
    return sum / norm;
}`},

{id:'exo-grille-hexagonale',cat:'exos',lvl:3,title:'Grille hexagonale',sum:'Coordonnées axiales, voisins et distance sur des hexagones, comme dans Civilization V et suivants.',src:['Red Blob Games : Hexagonal Grids','https://www.redblobgames.com/grids/hexagons/'],
ex:`Avec des coordonnées axiales ~(q, r)~ (un ~Vector2Int~), écris ~List<Vector2Int> Neighbors(Vector2Int h)~, ~int Distance(Vector2Int a, Vector2Int b)~, et ~Vector2 ToWorld(Vector2Int h, float size)~ pour des hexagones « pointe en haut ». Bonus : ~List<Vector2Int> Range(Vector2Int center, int n)~ (toutes les cases à distance ≤ n).`,
hint:`Les 6 directions : (1,0), (1,−1), (0,−1), (−1,0), (−1,1), (0,1). Distance = (|dq| + |dq + dr| + |dr|) / 2. Position : x = size × √3 × (q + r/2), y = size × 3/2 × r.`,
sol:`private static readonly Vector2Int[] Dirs =
{
    new Vector2Int(1, 0), new Vector2Int(1, -1), new Vector2Int(0, -1),
    new Vector2Int(-1, 0), new Vector2Int(-1, 1), new Vector2Int(0, 1)
};

public static List<Vector2Int> Neighbors(Vector2Int h) => Dirs.Select(d => h + d).ToList();

public static int Distance(Vector2Int a, Vector2Int b)
{
    int dq = a.x - b.x, dr = a.y - b.y;
    return (Math.Abs(dq) + Math.Abs(dq + dr) + Math.Abs(dr)) / 2;
}

public static Vector2 ToWorld(Vector2Int h, float size)
    => new Vector2(size * Mathf.Sqrt(3f) * (h.x + h.y / 2f), size * 1.5f * h.y);

public static List<Vector2Int> Range(Vector2Int center, int n)
{
    var result = new List<Vector2Int>();
    for (int q = -n; q <= n; q++)
        for (int r = Math.Max(-n, -q - n); r <= Math.Min(n, -q + n); r++)
            result.Add(center + new Vector2Int(q, r));
    return result;
}`}
]);

window.LESSONS=(window.LESSONS||[]).concat([

/* ---------- BASES DU C# ---------- */
{id:'variables-types',cat:'csharp',lvl:1,title:'Variables et types',sum:'int, float, bool, string : ce que contient une variable, et le piège de la division entière.',
body:[
['L\'idée',`Une variable est une boîte nommée dont le **type est fixé à la compilation**. C# est typé statiquement : une variable ~int~ ne contiendra jamais de texte. Le compilateur attrape ainsi beaucoup d'erreurs avant même de lancer le jeu.`],
['Les types que tu croiseras partout',`~int~ pour les compteurs et les points de vie, ~float~ pour tout ce qui est continu (positions, temps, vitesses), ~bool~ pour les états, ~string~ pour le texte. Unity utilise ~float~ et non ~double~ : un littéral décimal doit porter le suffixe ~f~, comme ~3.5f~.`],
['Le piège : la division entière',`Si les deux opérandes sont des ~int~, la division est entière : ~7 / 2~ vaut ~3~, et ~30 / 100~ vaut ~0~. C'est le bug classique de la barre de vie qui reste vide puis devient pleine d'un coup. Il suffit qu'un des deux soit un ~float~ : ~7 / 2f~ vaut ~3.5~.`,`int hp = 30, max = 100;
float faux = hp / max;          // 0 : division entière, puis conversion
float juste = (float)hp / max;  // 0.3`],
['Comparer des float',`Après des calculs, deux ~float~ « égaux » diffèrent souvent d'un minuscule écart d'arrondi. On ne teste donc pas ~a == b~ mais ~Mathf.Approximately(a, b)~, ou un écart inférieur à une tolérance. Tu le retrouveras avec la longueur d'un vecteur [[longueur-distance|normalisé]], qui vaut « presque » 1.`],
['Et var ?',`~var~ demande au compilateur de déduire le type : ~var speed = 4f;~ est un ~float~. Le type reste fixe, c'est juste moins à écrire. À réserver aux cas où le type se lit déjà à droite du ~=~.`]],
ex:`Écris une méthode ~HealthPercent(int current, int max)~ qui renvoie un ~float~ entre 0 et 1, sans tomber dans la division entière. Si ~max~ vaut 0 ou moins, elle renvoie 0.`,
hint:`Convertis un des deux opérandes en float avant de diviser, puis borne le résultat avec Mathf.Clamp01.`,
sol:`public static float HealthPercent(int current, int max)
{
    if (max <= 0) return 0f;
    float ratio = (float)current / max;   // un opérande float suffit
    return Mathf.Clamp01(ratio);          // reste entre 0 et 1
}`},

{id:'struct-vs-class',cat:'csharp',lvl:2,title:'Types valeur et types référence',sum:'struct ou class : copier le contenu ou copier l\'adresse. Pourquoi transform.position.x = 5 ne compile pas.',
body:[
['L\'idée',`Une **class** est un type référence : la variable contient l'adresse de l'objet. Copier la variable copie l'adresse, donc deux variables désignent le même objet. Une **struct** est un type valeur : copier la variable copie tout le contenu, chaque copie vit sa vie.`],
['L\'analogie',`Une class, c'est un lien vers un document partagé : si tu le modifies, tout le monde voit le changement. Une struct, c'est une photocopie : tu peux griffonner dessus, l'original ne bouge pas.`],
['Dans Unity',`~Vector3~, ~Quaternion~, ~Color~ et ~Rect~ sont des struct. ~GameObject~, ~Transform~ et tes ~MonoBehaviour~ sont des class. Comme ~transform.position~ est une propriété qui renvoie une **copie** du vecteur, écrire ~transform.position.x = 5~ modifierait une copie jetable : le compilateur refuse.`,`Vector3 p = transform.position;  // copie
p.x = 5f;                         // on modifie la copie
transform.position = p;           // on la renvoie`],
['Pourquoi des struct ?',`Une struct locale ne demande pas d'allocation sur le tas, donc pas de travail pour le ramasse-miettes. C'est pour ça que les maths de Unity sont des struct : on en crée des millions par seconde. Voir [[allocations-gc]].`],
['Quand en écrire une',`Petite (une poignée de champs), représentant une valeur (une coordonnée, une couleur, une plage), idéalement immuable. Au-delà, les copies coûtent plus cher que la référence. Attention au **boxing** : mettre une struct dans une variable ~object~ ou une interface l'emballe sur le tas.`]],
ex:`Écris ~SetX(Transform t, float x)~ qui change uniquement la coordonnée x de la position. Ajoute en commentaire l'explication de l'erreur de ~t.position.x = x~.`,
hint:`Trois lignes : lire la copie, la modifier, la réassigner.`,
sol:`public static void SetX(Transform t, float x)
{
    // t.position renvoie une COPIE du Vector3 (struct).
    // Modifier cette copie ne changerait rien, d'où l'erreur du compilateur.
    Vector3 p = t.position;
    p.x = x;
    t.position = p;
}`},

{id:'collections',cat:'csharp',lvl:1,title:'List, Dictionary et HashSet',sum:'Choisir la bonne collection selon la question qu\'on lui pose le plus souvent.',
body:[
['L\'idée',`Une collection se choisit selon l'opération la plus fréquente. Ajouter à la fin et parcourir : ~List<T>~. Retrouver par une clé : ~Dictionary<TKey, TValue>~. Savoir si un élément est présent, sans doublon : ~HashSet<T>~.`],
['Le coût des opérations',`~list.Contains(x)~ parcourt toute la liste : plus elle est longue, plus c'est lent. Un ~Dictionary~ ou un ~HashSet~ répondent en temps quasi constant, quelle que soit la taille, grâce au hachage de la clé.`],
['TryGetValue plutôt que l\'indexeur',`~dict["épée"]~ lève une exception si la clé n'existe pas. ~TryGetValue~ teste et lit en une seule recherche.`,`if (prices.TryGetValue("épée", out int price))
    Debug.Log(price);`],
['Le piège du foreach',`Ajouter ou retirer un élément pendant un ~foreach~ sur la même collection lève une exception. Pour retirer en parcourant une liste, utilise une boucle ~for~ qui part de la fin, ou ~RemoveAll~.`],
['Côté performance',`Créer une nouvelle liste à chaque image produit des déchets pour le ramasse-miettes. Garde la liste en champ et appelle ~Clear()~ : la capacité déjà allouée est réutilisée. Voir [[allocations-gc]].`]],
ex:`Inventaire basé sur un ~Dictionary<string, int>~. Écris ~Add(string item, int qty)~, puis ~bool Remove(string item, int qty)~ qui renvoie false s'il n'y en a pas assez, et supprime la clé quand la quantité tombe à 0.`,
hint:`TryGetValue met la valeur à 0 si la clé est absente : c'est pratique pour Add.`,
sol:`public class Inventory
{
    private readonly Dictionary<string, int> items = new Dictionary<string, int>();

    public void Add(string item, int qty)
    {
        items.TryGetValue(item, out int current);   // 0 si absent
        items[item] = current + qty;
    }

    public bool Remove(string item, int qty)
    {
        if (!items.TryGetValue(item, out int current) || current < qty)
            return false;

        if (current == qty) items.Remove(item);
        else items[item] = current - qty;
        return true;
    }
}`},

{id:'delegues-evenements',cat:'csharp',lvl:2,title:'Délégués, Action et événements',sum:'Faire réagir l\'UI, le son ou les succès sans que le joueur connaisse chacun d\'eux.',
body:[
['L\'idée',`Un délégué est une variable qui contient une **méthode**. ~Action~ ne renvoie rien, ~Action<int>~ reçoit un int, ~Func<float, bool>~ reçoit un float et renvoie un bool. On peut les passer, les stocker, les appeler plus tard.`],
['event : s\'abonner sans pouvoir déclencher',`Le mot-clé ~event~ protège un délégué : les autres classes peuvent seulement s'abonner (~+=~) ou se désabonner (~-=~). Seule la classe qui le déclare peut le déclencher.`],
['Pourquoi c\'est précieux',`Sans événement, le script de vie du joueur devrait connaître la barre de vie, le son de dégât, l'écran de game over… Avec un événement ~Died~, chacun s'abonne de son côté et le joueur ne connaît personne. Ajouter un système ne touche plus au code existant.`],
['Les pièges',`Oublier de se désabonner : un objet détruit reste abonné et provoque des erreurs ou des fuites. La règle : s'abonner dans ~OnEnable~ et se désabonner dans ~OnDisable~ (voir [[cycle-de-vie]]). Déclencher avec ~?.Invoke()~ évite une erreur quand personne n'écoute. Une lambda qui capture une variable alloue de la mémoire : à éviter dans le code appelé chaque image (voir [[allocations-gc]]).`]],
ex:`Crée un ~Health~ (MonoBehaviour) avec un événement ~Action<int, int> Changed~ (vie actuelle, vie max), un événement ~Action Died~ et une méthode ~TakeDamage(int)~. Puis un ~HealthBar~ qui met à jour une ~Image~ en s'abonnant proprement.`,
hint:`Died ne doit se déclencher qu'une fois : ignore les dégâts quand la vie est déjà à 0.`,
sol:`public class Health : MonoBehaviour
{
    [SerializeField] private int max = 100;
    private int current;

    public event Action<int, int> Changed;
    public event Action Died;

    private void Awake() => current = max;

    public void TakeDamage(int amount)
    {
        if (current <= 0 || amount <= 0) return;
        current = Mathf.Max(current - amount, 0);
        Changed?.Invoke(current, max);
        if (current == 0) Died?.Invoke();
    }
}

public class HealthBar : MonoBehaviour
{
    [SerializeField] private Health health;
    [SerializeField] private Image fill;

    private void OnEnable()  => health.Changed += OnChanged;
    private void OnDisable() => health.Changed -= OnChanged;

    private void OnChanged(int current, int max)
    {
        fill.fillAmount = (float)current / max;
    }
}`},

{id:'linq',cat:'csharp',lvl:2,title:'LINQ',sum:'Filtrer, trier et transformer des collections en une ligne, et savoir quand ne pas le faire.',
body:[
['L\'idée',`LINQ ajoute des méthodes de requête à toutes les collections : ~Where~ filtre, ~Select~ transforme, ~OrderBy~ trie, ~First~, ~Any~ et ~Count~ interrogent. On enchaîne les étapes comme une phrase.`,`var noms = ennemis
    .Where(e => e.hp > 0)
    .OrderBy(e => e.hp)
    .Select(e => e.name)
    .ToList();`],
['Exécution différée',`Une requête LINQ ne fait rien tant qu'on ne la parcourt pas. ~ToList()~ ou un ~foreach~ la déclenchent. Si tu la parcours deux fois, elle est calculée deux fois.`],
['Où l\'utiliser',`Dans les outils éditeur, les scripts de build et le code appelé rarement, LINQ rend le code bien plus lisible (voir [[editor-window]]). Dans ~Update~, il alloue des énumérateurs et des lambdas à chaque image : préfère une boucle. Voir [[allocations-gc]].`],
['Attention à l\'algorithme',`Trouver le plus proche avec ~OrderBy(...).First()~ trie toute la liste pour garder un seul élément. Une boucle qui garde le meilleur fait un seul passage. Et compare des distances au carré pour éviter la racine (voir [[longueur-distance]]).`]],
ex:`Écris deux versions de ~Closest(List<Transform> enemies, Vector3 from)~ : une en LINQ, une avec une boucle sans allocation qui compare les distances au carré.`,
hint:`(a - b).sqrMagnitude donne la distance au carré. Commence avec float.MaxValue comme meilleure distance.`,
sol:`// Version LINQ : lisible, mais alloue et trie toute la liste
public static Transform ClosestLinq(List<Transform> enemies, Vector3 from)
{
    return enemies
        .OrderBy(e => (e.position - from).sqrMagnitude)
        .FirstOrDefault();
}

// Version boucle : un seul passage, zéro allocation
public static Transform Closest(List<Transform> enemies, Vector3 from)
{
    Transform best = null;
    float bestSqr = float.MaxValue;
    for (int i = 0; i < enemies.Count; i++)
    {
        float sqr = (enemies[i].position - from).sqrMagnitude;
        if (sqr < bestSqr)
        {
            bestSqr = sqr;
            best = enemies[i];
        }
    }
    return best;
}`},

{id:'generiques',cat:'csharp',lvl:2,title:'Génériques',sum:'Écrire une méthode ou une classe une seule fois pour n\'importe quel type.',
body:[
['L\'idée',`Un générique prend un **type en paramètre**, noté ~T~. ~List<T>~ est écrite une fois et fonctionne pour ~List<int>~ comme pour ~List<Enemy>~. Dans Unity, ~GetComponent<T>()~ en est l'exemple le plus courant.`],
['Les contraintes',`~where T : Component~ garantit que T est un composant, donc qu'on peut accéder à ~.gameObject~. ~where T : class~ exige un type référence, ~where T : new()~ un constructeur sans paramètre. Sans contrainte, tu ne peux presque rien faire avec T.`],
['Les méthodes d\'extension',`Une méthode statique dont le premier paramètre est précédé de ~this~ s'utilise comme si elle appartenait au type : ~gameObject.GetOrAdd<Rigidbody>()~. Combinée aux génériques, c'est la base de beaucoup de petits utilitaires de studio.`],
['Où tu les retrouveras',`Un pool d'objets réutilisable pour n'importe quel prefab (voir [[object-pooling]]), des outils éditeur qui listent tous les assets d'un type (voir [[editor-window]]).`]],
ex:`Écris une méthode d'extension ~GetOrAdd<T>(this GameObject go)~ qui renvoie le composant T s'il existe déjà, sinon l'ajoute et le renvoie.`,
hint:`TryGetComponent(out T c) renvoie un bool et n'alloue rien quand le composant est absent.`,
sol:`public static class GameObjectExtensions
{
    public static T GetOrAdd<T>(this GameObject go) where T : Component
    {
        if (!go.TryGetComponent(out T component))
            component = go.AddComponent<T>();
        return component;
    }
}`},

{id:'attributs-reflexion',cat:'csharp',lvl:3,title:'Attributs et réflexion',sum:'Annoter son code, puis le lire depuis un outil. La base de beaucoup d\'outils de validation.',
body:[
['L\'idée',`Un attribut est une **étiquette** posée sur une classe, un champ ou une méthode, entre crochets. Tu en utilises déjà : ~[SerializeField]~, ~[Header("...")]~, ~[Range(0, 1)]~, ~[MenuItem("...")]~. Il ne fait rien tout seul : c'est un autre code qui le lit.`],
['Créer le sien',`Une classe qui hérite de ~Attribute~ suffit. Le suffixe « Attribute » disparaît à l'usage : ~RequiredAttribute~ s'écrit ~[Required]~.`],
['La réflexion',`La réflexion permet d'inspecter un type à l'exécution : ses champs, leurs valeurs, leurs attributs. ~target.GetType().GetFields(...)~ renvoie la liste des champs, ~field.GetCustomAttribute<T>()~ dit si l'étiquette est posée. C'est lent : réservé à l'éditeur et aux outils, jamais à la boucle de jeu.`],
['Le piège du null Unity',`Un objet Unity détruit n'est pas vraiment ~null~ en C#, mais Unity surcharge ~==~ pour qu'il le paraisse. Quand tu obtiens la valeur comme ~object~, il faut le reconvertir en ~UnityEngine.Object~ pour que la comparaison fonctionne.`],
['À quoi ça sert',`Vérifier qu'aucun prefab n'a de référence obligatoire vide avant un build (voir [[validation-assets]]), générer des inspecteurs (voir [[custom-inspector]]). Dans l'éditeur, ~TypeCache~ trouve très vite tous les types ou champs portant un attribut.`]],
ex:`Crée un attribut ~[Required]~ pour les champs. Écris ~List<string> FindMissing(UnityEngine.Object target)~ qui renvoie le nom des champs marqués ~[Required]~ restés vides, y compris les privés sérialisés.`,
hint:`BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic pour voir aussi les champs privés.`,
sol:`[AttributeUsage(AttributeTargets.Field)]
public class RequiredAttribute : Attribute { }

public static class RequiredChecker
{
    public static List<string> FindMissing(UnityEngine.Object target)
    {
        var missing = new List<string>();
        var flags = BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic;

        foreach (FieldInfo field in target.GetType().GetFields(flags))
        {
            if (field.GetCustomAttribute<RequiredAttribute>() == null) continue;

            object value = field.GetValue(target);
            // Unity surcharge == : un objet détruit "vaut" null
            if (value == null || (value is UnityEngine.Object o && o == null))
                missing.Add(field.Name);
        }
        return missing;
    }
}`},

/* ---------- MATHS ---------- */
{id:'vecteurs',cat:'maths',lvl:1,title:'Vecteurs',sum:'Une flèche avec une direction et une longueur. Additionner, soustraire, multiplier.',diag:'add',
body:[
['L\'idée',`Un vecteur est une **flèche** : une direction et une longueur. Unity utilise la même struct ~Vector3~ pour une position (un point) et pour un déplacement (une flèche). C'est le sens que tu lui donnes qui change, pas le type.`],
['Additionner : mettre bout à bout',`~A + B~ revient à suivre la flèche A, puis la flèche B depuis son bout. C'est exactement ce qu'on fait pour déplacer un objet : nouvelle position = position + vitesse × temps écoulé. Le temps écoulé est ~Time.deltaTime~ (voir [[cycle-de-vie]]).`,`transform.position += velocity * Time.deltaTime;`],
['Soustraire : la flèche entre deux points',`~B - A~ donne la flèche qui va **de A vers B**. C'est la formule la plus utile du jeu vidéo : « direction vers la cible = position de la cible − ma position ». Dans le schéma, la flèche bleue en pointillés représente B posée au bout de A.`],
['Multiplier par un nombre',`~A * 2~ double la longueur, ~A * 0.5f~ la divise par deux, ~A * -1~ inverse le sens. Pour obtenir une flèche de longueur précise dans une direction donnée, on la [[longueur-distance|normalise]] puis on la multiplie.`],
['Les axes de Unity',`x vers la droite, y vers le haut, z vers l'avant. C'est un repère « main gauche », ce qui compte pour le [[produit-vectoriel]]. ~transform.forward~, ~right~ et ~up~ donnent ces axes tournés avec l'objet.`]],
ex:`Écris ~StepTowards(Vector3 from, Vector3 target, float speed, float dt)~ qui avance vers la cible à vitesse constante sans jamais la dépasser. C'est ce que fait ~Vector3.MoveTowards~ : refais-le sans l'utiliser.`,
hint:`Calcule la flèche vers la cible et sa longueur. Si le pas du jour (speed × dt) est plus grand que la distance, renvoie directement la cible.`,
sol:`public static Vector3 StepTowards(Vector3 from, Vector3 target, float speed, float dt)
{
    Vector3 toTarget = target - from;          // flèche de "from" vers "target"
    float distance = toTarget.magnitude;
    float step = speed * dt;

    if (distance <= step || distance == 0f)
        return target;                         // on dépasserait : on s'arrête pile

    return from + toTarget / distance * step;  // direction normalisée × pas
}`},

{id:'longueur-distance',cat:'maths',lvl:1,title:'Longueur, distance et normalisation',sum:'Pythagore, sqrMagnitude, et pourquoi on va plus vite en diagonale.',diag:'len',
body:[
['La longueur',`La longueur d'un vecteur se calcule avec Pythagore : la racine de x² + y² + z². Unity la donne avec ~v.magnitude~. Dans le schéma, les pointillés sont les deux côtés du triangle rectangle.`],
['La distance',`La distance entre A et B est la longueur de la flèche qui les relie : ~(B - A).magnitude~, ou ~Vector3.Distance(A, B)~. C'est la même chose.`],
['sqrMagnitude : éviter la racine',`La racine carrée coûte plus cher qu'une multiplication. Pour **comparer** des distances, la racine est inutile : si d < r, alors d² < r². On compare donc ~sqrMagnitude~ à ~r * r~. Tu l'utilises pour trouver l'ennemi [[linq|le plus proche]] ou tester une portée.`],
['Normaliser',`Normaliser, c'est diviser un vecteur par sa longueur : on obtient une flèche de **longueur 1** dans la même direction. C'est « la direction pure », qu'on multiplie ensuite par la vitesse voulue. ~v.normalized~ renvoie le vecteur nul si v est nul, sans planter. Le cercle du schéma a un rayon de 1 : la flèche normalisée s'y arrête toujours.`],
['Le bug de la diagonale',`Si on lit l'entrée (1, 0) à droite et (1, 1) en diagonale, la diagonale mesure environ 1,41 : le personnage va 41 % plus vite. Normaliser règle le problème, mais casse les manettes analogiques (poussée à moitié = vitesse pleine). ~Vector2.ClampMagnitude(v, 1)~ ne réduit que ce qui dépasse 1.`]],
ex:`Écris ~bool InRange(Vector3 a, Vector3 b, float radius)~ sans racine carrée. Puis ~Vector2 ReadMove(float h, float v)~ qui corrige la diagonale trop rapide tout en gardant la finesse d'un stick analogique.`,
hint:`Pour InRange, compare deux carrés. Pour ReadMove, regarde ClampMagnitude.`,
sol:`public static bool InRange(Vector3 a, Vector3 b, float radius)
{
    return (b - a).sqrMagnitude <= radius * radius;
}

public static Vector2 ReadMove(float h, float v)
{
    var input = new Vector2(h, v);
    // normalized forcerait la longueur à 1 même avec un stick à peine poussé.
    // ClampMagnitude ne réduit que si la longueur dépasse 1.
    return Vector2.ClampMagnitude(input, 1f);
}`},

{id:'produit-scalaire',cat:'maths',lvl:2,title:'Produit scalaire (Dot)',sum:'Un seul nombre qui dit si deux directions vont dans le même sens. Cônes de vision, devant ou derrière.',diag:'dot',
body:[
['La formule',`~Dot(A, B) = A.x × B.x + A.y × B.y + A.z × B.z~. Le résultat est un nombre, pas un vecteur. Il vaut aussi |A| × |B| × cos(angle entre A et B) : c'est ce lien avec l'angle qui le rend si utile.`],
['Ce que dit le signe',`Avec deux vecteurs [[longueur-distance|normalisés]], le résultat vaut 1 s'ils pointent dans le même sens, 0 s'ils sont perpendiculaires, et −1 s'ils sont opposés. Positif : la cible est **devant**. Négatif : elle est **derrière**. Fais tourner B dans le schéma pour le voir.`],
['La projection',`~Dot(B, Anormalisé)~ donne la longueur de « l'ombre » de B sur la direction de A : le segment épais du schéma. C'est ce qu'on utilise pour savoir quelle part d'une vitesse va vers l'avant, ou pour faire [[raycast|rebondir]] une balle sur un mur.`],
['Le cône de vision',`Un garde voit à 90° de champ : la cible est visible si l'angle vers elle est inférieur à 45°. Plutôt que de calculer l'angle (arccos coûte cher), on compare le dot au **cosinus de 45°**, calculé une fois. Voir [[trigonometrie]].`],
['Autres usages',`L'éclairage diffus (dot entre la normale et la lumière), savoir si on regarde un objet, détecter un sol trop pentu (dot entre la normale du sol et ~Vector3.up~).`]],
ex:`Écris ~CanSee(Transform guard, Vector3 target, float fovDegrees, float range)~ : vrai si la cible est à portée et dans le cône de vision du garde.`,
hint:`transform.forward est déjà normalisé. Normalise la direction vers la cible, puis compare le dot à Mathf.Cos(moitié du champ en radians).`,
sol:`public static bool CanSee(Transform guard, Vector3 target, float fovDegrees, float range)
{
    Vector3 toTarget = target - guard.position;
    float sqrDist = toTarget.sqrMagnitude;
    if (sqrDist > range * range) return false;   // trop loin
    if (sqrDist < 0.0001f) return true;          // collé au garde

    float cosHalfFov = Mathf.Cos(fovDegrees * 0.5f * Mathf.Deg2Rad);
    Vector3 dir = toTarget / Mathf.Sqrt(sqrDist);  // normalisation
    return Vector3.Dot(guard.forward, dir) >= cosHalfFov;
}`},

{id:'produit-vectoriel',cat:'maths',lvl:2,title:'Produit vectoriel (Cross)',sum:'Le vecteur perpendiculaire à deux autres. Gauche ou droite, normale d\'un triangle.',
body:[
['L\'idée',`~Vector3.Cross(A, B)~ renvoie un vecteur **perpendiculaire** à A et à B. Sa longueur vaut |A| × |B| × sin(angle) : c'est l'aire du parallélogramme formé par A et B. Elle est nulle si A et B sont alignés.`],
['L\'ordre compte',`~Cross(A, B)~ est l'opposé de ~Cross(B, A)~. Dans le repère main gauche de Unity, ~Cross(Vector3.up, Vector3.forward)~ donne ~Vector3.right~.`],
['Gauche ou droite ?',`Le [[produit-scalaire]] dit devant ou derrière, mais pas gauche ou droite. Le produit vectoriel le dit : avec ~Cross(forward, versCible)~, la composante y est positive si la cible est à droite, négative à gauche. Parfait pour savoir dans quel sens tourner.`],
['La normale d\'une surface',`Pour un triangle ABC, ~Cross(B - A, C - A)~ est perpendiculaire à sa surface : c'est sa normale (une fois normalisée). C'est ce que calcule le moteur pour l'éclairage des maillages générés par code.`],
['Construire un repère',`À partir d'une direction avant et de « haut », deux produits vectoriels donnent les trois axes d'un repère orthogonal. C'est ce que fait ~Quaternion.LookRotation~ en interne (voir [[quaternions]]).`]],
ex:`Écris ~float TurnSign(Transform self, Vector3 target)~ : 1 si la cible est à droite, −1 à gauche, 0 si elle est alignée. Puis ~Vector3 TriangleNormal(Vector3 a, Vector3 b, Vector3 c)~.`,
hint:`Seule la composante y du produit vectoriel t'intéresse pour gauche ou droite sur le plan horizontal.`,
sol:`public static float TurnSign(Transform self, Vector3 target)
{
    Vector3 toTarget = target - self.position;
    float y = Vector3.Cross(self.forward, toTarget).y;
    // Repère main gauche de Unity : y > 0 => la cible est à droite
    if (Mathf.Abs(y) < 0.0001f) return 0f;
    return Mathf.Sign(y);
}

public static Vector3 TriangleNormal(Vector3 a, Vector3 b, Vector3 c)
{
    return Vector3.Cross(b - a, c - a).normalized;
}`},

{id:'trigonometrie',cat:'maths',lvl:1,title:'Angles et trigonométrie',sum:'Radians, cercle trigonométrique, Atan2 et oscillations.',diag:'trig',
body:[
['Radians et degrés',`~Mathf.Sin~ et ~Mathf.Cos~ attendent des **radians** : un tour complet vaut 2π, soit environ 6,28. Les inspecteurs et ~Quaternion.Euler~ parlent en degrés. On convertit avec ~Mathf.Deg2Rad~ et ~Mathf.Rad2Deg~.`],
['Le cercle trigonométrique',`Pour un angle θ, le point (cos θ, sin θ) est sur un cercle de rayon 1. Multiplie par un rayon et ajoute un centre : tu places des objets en cercle, tu fais orbiter un satellite. Dans le schéma, les pointillés montrent cos (horizontal) et sin (vertical).`],
['Atan2 : l\'angle d\'un vecteur',`~Mathf.Atan2(y, x)~ fait le chemin inverse : à partir d'une direction, il donne l'angle, dans le bon quadrant (de −180° à 180°). C'est l'outil pour orienter un sprite 2D vers la souris. Attention à l'ordre : y d'abord.`],
['Osciller dans le temps',`~Mathf.Sin(Time.time * vitesse)~ varie en douceur entre −1 et 1. Un bonus qui flotte, une lumière qui pulse, une caméra qui respire : c'est souvent ça.`,`float h = Mathf.Sin(Time.time * 2f) * 0.25f;
transform.localPosition = basePos + Vector3.up * h;`],
['Liens',`Le cosinus relie l'angle au [[produit-scalaire]]. En 3D, on préfère les [[quaternions]] aux angles pour stocker une rotation.`]],
ex:`Écris ~Vector3[] CirclePositions(Vector3 center, float radius, int count)~ qui répartit count points régulièrement sur un cercle horizontal (plan XZ). Bonus : ~float AngleTo2D(Vector2 from, Vector2 to)~ en degrés.`,
hint:`L'écart entre deux points est 2π / count. Sur le plan horizontal, cos va dans x et sin dans z.`,
sol:`public static Vector3[] CirclePositions(Vector3 center, float radius, int count)
{
    var result = new Vector3[count];
    float step = 2f * Mathf.PI / count;
    for (int i = 0; i < count; i++)
    {
        float a = i * step;
        result[i] = center + new Vector3(Mathf.Cos(a), 0f, Mathf.Sin(a)) * radius;
    }
    return result;
}

public static float AngleTo2D(Vector2 from, Vector2 to)
{
    Vector2 d = to - from;
    return Mathf.Atan2(d.y, d.x) * Mathf.Rad2Deg;
}`},

{id:'interpolation',cat:'maths',lvl:2,title:'Interpolation (Lerp)',sum:'Passer en douceur d\'une valeur à une autre, et le piège du Lerp qui dépend du framerate.',diag:'lerp',
body:[
['La formule',`~Lerp(a, b, t) = a + (b - a) × t~. Avec t = 0 on obtient a, avec t = 1 on obtient b, avec 0,5 le milieu. Ça marche pour des nombres, des vecteurs, des couleurs. Fais glisser t dans le schéma.`],
['InverseLerp et Remap',`~InverseLerp(a, b, v)~ fait le chemin inverse : à quelle proportion de a vers b se trouve v ? Enchaîner les deux donne un **remap** : transformer une vitesse entre 0 et 20 en volume sonore entre 0,2 et 1, par exemple.`],
['Le game feel : modifier t',`Au lieu de faire avancer t en ligne droite, on le passe dans une courbe : ~t * t * (3 - 2 * t)~ (smoothstep) démarre et finit en douceur. Les fonctions d'easing servent à ça, et une ~AnimationCurve~ permet aux designers de les dessiner.`],
['Le piège du Lerp dans Update',`~pos = Lerp(pos, cible, 0.1f)~ à chaque image rattrape 10 % de l'écart par image. À 144 images par seconde, l'objet arrive bien plus vite qu'à 30. La correction : ~t = 1 - Mathf.Exp(-vitesse * Time.deltaTime)~, qui dépend du temps et non du nombre d'images. Voir [[cycle-de-vie]].`],
['Et les rotations ?',`Pour une rotation, on utilise ~Quaternion.Slerp~, qui suit l'arc du cercle au lieu de la corde. Voir [[quaternions]].`]],
ex:`Écris ~float Remap(float v, float inMin, float inMax, float outMin, float outMax)~ et ~Vector3 Damp(Vector3 current, Vector3 target, float sharpness, float dt)~, un suivi doux qui donne le même résultat à 30 ou à 144 images par seconde.`,
hint:`Remap = InverseLerp puis Lerp. Pour Damp, calcule t avec une exponentielle.`,
sol:`public static float Remap(float v, float inMin, float inMax, float outMin, float outMax)
{
    float t = Mathf.InverseLerp(inMin, inMax, v);
    return Mathf.Lerp(outMin, outMax, t);
}

public static Vector3 Damp(Vector3 current, Vector3 target, float sharpness, float dt)
{
    // On rattrape une fraction de l'écart qui dépend du temps écoulé,
    // pas du nombre d'images : même mouvement quel que soit le framerate.
    float t = 1f - Mathf.Exp(-sharpness * dt);
    return Vector3.Lerp(current, target, t);
}`},

{id:'espaces-coordonnees',cat:'maths',lvl:2,title:'Espaces local et monde',sum:'Chaque Transform est un repère. Passer d\'un repère à l\'autre avec TransformPoint.',
body:[
['L\'idée',`Chaque ~Transform~ définit son propre repère : une origine (sa position), trois axes (~right~, ~up~, ~forward~) et une échelle. « Un mètre devant moi » est une position **locale** ; la même position exprimée dans la scène est une position **monde**.`],
['Du local vers le monde',`~TransformPoint(p)~ convertit un point (applique position, rotation et échelle). ~TransformDirection(d)~ convertit une direction (rotation seulement, la longueur ne change pas). ~TransformVector(v)~ applique rotation et échelle, sans la position.`],
['Du monde vers le local',`~InverseTransformPoint~ fait l'inverse. Exprimée dans le repère d'un personnage, la position d'une cible se lit directement : z positif = devant, x positif = à droite. C'est une alternative très lisible au [[produit-scalaire]] et au [[produit-vectoriel]].`],
['Sous le capot',`Chaque Transform garde une matrice 4×4, ~localToWorldMatrix~, qui combine translation, rotation et échelle. Enchaîner des parents revient à multiplier leurs matrices.`],
['Le piège de l\'échelle',`~localPosition~ est exprimée dans le repère du parent, échelle comprise. Sous un parent à l'échelle 2, déplacer de 1 en local déplace de 2 dans le monde. Une échelle non uniforme (2, 1, 1) déforme aussi les rotations des enfants.`]],
ex:`Le canon d'un vaisseau est à (0 ; 0,5 ; 1,2) dans le repère du vaisseau. Écris ~Vector3 MuzzleWorld(Transform ship)~ qui donne sa position dans le monde, puis ~bool IsBehind(Transform self, Vector3 worldPoint)~.`,
hint:`Un point local vers le monde : TransformPoint. Un point monde vers le local : InverseTransformPoint, puis regarde z.`,
sol:`private static readonly Vector3 MuzzleLocal = new Vector3(0f, 0.5f, 1.2f);

public static Vector3 MuzzleWorld(Transform ship)
{
    return ship.TransformPoint(MuzzleLocal);
}

public static bool IsBehind(Transform self, Vector3 worldPoint)
{
    Vector3 local = self.InverseTransformPoint(worldPoint);
    return local.z < 0f;
}`},

{id:'quaternions',cat:'maths',lvl:3,title:'Rotations et quaternions',sum:'Pourquoi Unity stocke les rotations en quaternions, et comment s\'en servir sans les comprendre entièrement.',
body:[
['Pourquoi pas des angles ?',`Trois angles (les angles d'Euler) sont lisibles, mais souffrent du **blocage de cardan** (gimbal lock : deux axes se confondent et on perd un degré de liberté) et s'interpolent mal : passer de 350° à 10° fait faire presque un tour complet dans le mauvais sens.`],
['Le quaternion',`Quatre nombres (x, y, z, w) qui codent une rotation autour d'un axe. On ne les lit pas et on ne les modifie **jamais** à la main. On les construit avec ~Quaternion.Euler(x, y, z)~, ~Quaternion.AngleAxis(angle, axe)~ ou ~Quaternion.LookRotation(direction, haut)~.`],
['Composer et appliquer',`~q1 * q2~ applique q2 puis q1 : l'ordre compte. ~q * v~ fait tourner un vecteur. Par exemple, ~Quaternion.AngleAxis(30, Vector3.up) * transform.forward~ donne une direction décalée de 30° à droite.`,`Quaternion recul = Quaternion.AngleAxis(-5f, Vector3.right);
transform.localRotation = transform.localRotation * recul;`],
['Interpoler',`~Quaternion.Slerp(a, b, t)~ fait une transition douce (voir [[interpolation]]). ~Quaternion.RotateTowards(a, b, degrés)~ tourne d'un nombre maximal de degrés : idéal pour une vitesse angulaire constante, comme une tourelle.`],
['Liens',`~LookRotation~ construit son repère avec des [[produit-vectoriel|produits vectoriels]]. Pour une rotation 2D, un seul angle via [[trigonometrie|Atan2]] suffit souvent.`]],
ex:`Tourelle : écris ~Quaternion AimStep(Quaternion current, Vector3 dir, float degPerSec, float dt)~ qui tourne vers dir à vitesse constante, uniquement autour de l'axe vertical (on ignore la hauteur de la cible).`,
hint:`Mets dir.y à 0, construis la rotation cible avec LookRotation, puis RotateTowards avec degPerSec × dt.`,
sol:`public static Quaternion AimStep(Quaternion current, Vector3 dir, float degPerSec, float dt)
{
    dir.y = 0f;                                   // rotation horizontale seulement
    if (dir.sqrMagnitude < 0.0001f) return current;

    Quaternion target = Quaternion.LookRotation(dir, Vector3.up);
    return Quaternion.RotateTowards(current, target, degPerSec * dt);
}`},

/* ---------- UNITY ---------- */
{id:'cycle-de-vie',cat:'unity',lvl:1,title:'Cycle de vie d\'un MonoBehaviour',sum:'Awake, Start, Update, FixedUpdate : qui est appelé quand, et Time.deltaTime.',
body:[
['L\'ordre des appels',`~Awake~ à la création (prépare tes propres références), ~OnEnable~ à chaque activation, ~Start~ juste avant la première image (les autres objets sont prêts), puis en boucle ~FixedUpdate~ (physique, à pas fixe), ~Update~ (chaque image) et ~LateUpdate~ (après tous les Update, idéal pour la caméra). Enfin ~OnDisable~ et ~OnDestroy~.`],
['Time.deltaTime',`Le temps écoulé depuis l'image précédente, en secondes. Toute vitesse doit être multipliée par lui, sinon le jeu va plus vite sur une machine rapide. Dans ~FixedUpdate~, ~Time.deltaTime~ renvoie automatiquement le pas fixe.`],
['Entrées dans Update, physique dans FixedUpdate',`Un appui de touche peut être raté dans ~FixedUpdate~, qui ne tourne pas à chaque image. On lit donc l'entrée dans ~Update~, on la garde dans un champ, et on applique les forces dans ~FixedUpdate~.`],
['Mettre en cache',`~GetComponent~ cherche à chaque appel. On l'appelle une fois dans ~Awake~ et on garde le résultat dans un champ. ~[RequireComponent]~ garantit que le composant existe.`],
['Liens',`S'abonner aux [[delegues-evenements|événements]] dans ~OnEnable~, se désabonner dans ~OnDisable~. ~velocity~ est un Vector3, donc une [[struct-vs-class|struct]] : on la copie, on la modifie, on la réassigne.`]],
ex:`Écris un ~Mover~ qui lit l'axe horizontal dans ~Update~ et applique la vitesse sur x au ~Rigidbody~ dans ~FixedUpdate~. La référence au Rigidbody est récupérée une seule fois.`,
hint:`Trois méthodes : Awake (GetComponent), Update (lecture de l'entrée), FixedUpdate (vitesse du Rigidbody).`,
sol:`[RequireComponent(typeof(Rigidbody))]
public class Mover : MonoBehaviour
{
    [SerializeField] private float speed = 6f;
    private Rigidbody body;
    private float input;

    private void Awake()
    {
        body = GetComponent<Rigidbody>();   // mis en cache une seule fois
    }

    private void Update()
    {
        input = Input.GetAxisRaw("Horizontal");   // l'entrée est lue chaque image
    }

    private void FixedUpdate()
    {
        // linearVelocity depuis Unity 6 (velocity avant)
        Vector3 v = body.linearVelocity;
        v.x = input * speed;
        body.linearVelocity = v;
    }
}`},

{id:'coroutines',cat:'unity',lvl:2,title:'Coroutines',sum:'Étaler une action sur plusieurs images sans timer manuel.',
body:[
['L\'idée',`Une coroutine est une méthode qui renvoie ~IEnumerator~ et peut se mettre **en pause** avec ~yield return~. Unity la reprend plus tard, au bon moment. On la lance avec ~StartCoroutine~. Ce n'est pas un thread : tout tourne sur le thread principal, une étape par image.`],
['Les pauses courantes',`~yield return null~ attend l'image suivante. ~yield return new WaitForSeconds(0.5f)~ attend une durée (affectée par ~Time.timeScale~). ~WaitForSecondsRealtime~ ignore la pause du jeu. ~WaitUntil(() => condition)~ attend qu'une condition soit vraie.`],
['Arrêter',`~StartCoroutine~ renvoie un ~Coroutine~ : garde-le pour appeler ~StopCoroutine~. Toutes les coroutines d'un composant s'arrêtent si son GameObject est désactivé, et ne reprennent pas toutes seules.`],
['Performance',`Chaque ~new WaitForSeconds~ alloue un objet. Dans une boucle, crée-le une fois et réutilise-le. Voir [[allocations-gc]].`],
['Et async ?',`Depuis Unity 6, la classe ~Awaitable~ permet d'écrire la même chose avec ~async~ et ~await~, avec une meilleure gestion des valeurs de retour et des erreurs. Les coroutines restent très répandues dans le code existant.`]],
ex:`Écris un composant ~HitFlash~ avec ~Flash(int times, float interval)~ qui fait clignoter un ~SpriteRenderer~. Un nouvel appel pendant un clignotement annule le précédent.`,
hint:`Garde la Coroutine en cours dans un champ ; si elle n'est pas null, arrête-la avant d'en lancer une nouvelle.`,
sol:`public class HitFlash : MonoBehaviour
{
    [SerializeField] private SpriteRenderer sprite;
    private Coroutine running;

    public void Flash(int times, float interval)
    {
        if (running != null) StopCoroutine(running);
        sprite.enabled = true;
        running = StartCoroutine(FlashRoutine(times, interval));
    }

    private IEnumerator FlashRoutine(int times, float interval)
    {
        var wait = new WaitForSeconds(interval);   // créé une fois, réutilisé
        for (int i = 0; i < times; i++)
        {
            sprite.enabled = false;
            yield return wait;
            sprite.enabled = true;
            yield return wait;
        }
        running = null;
    }
}`},

{id:'operations-bits',cat:'unity',lvl:2,title:'Opérations sur les bits et LayerMask',sum:'Un int, c\'est 32 interrupteurs. Les layers de Unity et les enums [Flags] reposent dessus.',
body:[
['L\'idée',`Un ~int~ contient 32 bits, donc 32 interrupteurs allumés ou éteints. Unity a 32 layers : un ~LayerMask~ est simplement un int où le bit n vaut 1 si le layer n est inclus.`],
['Les opérateurs',`~1 << n~ crée un nombre où seul le bit n est allumé. ~a | b~ combine (OU), ~a & b~ garde ce qui est commun (ET), le NON bit à bit inverse tout. On teste un bit avec ~(mask & (1 << n)) != 0~.`,`int ground = 1 << 6;          // 0b0100_0000
int water  = 1 << 4;          // 0b0001_0000
int both   = ground | water;  // 0b0101_0000`],
['Les enums [Flags]',`Un enum dont chaque valeur est une puissance de deux peut contenir plusieurs états à la fois : empoisonné **et** en feu. L'attribut ~[Flags]~ l'indique au compilateur et à l'inspecteur, qui affiche alors des cases à cocher.`],
['Le piège classique',`~Physics.Raycast(..., 6)~ ne filtre pas sur le layer 6 mais sur les layers 1 et 2 (6 = 0b110). Il faut passer ~1 << 6~ ou un ~LayerMask~ réglé dans l'inspecteur. Voir [[raycast]].`]],
ex:`Écris ~Contains(LayerMask mask, int layer)~, ~Add~ et ~Remove~. Puis un enum ~[Flags] StatusEffect~ avec Poisoned, Burning et Frozen, et montre en commentaire comment ajouter, retirer et tester un effet.`,
hint:`Retirer un bit : ET avec l'inverse du bit, soit mask & ~(1 << layer) en C#.`,
sol:`public static class MaskUtils
{
    public static bool Contains(LayerMask mask, int layer)
        => (mask.value & (1 << layer)) != 0;

    public static LayerMask Add(LayerMask mask, int layer)
        => mask.value | (1 << layer);

    public static LayerMask Remove(LayerMask mask, int layer)
        => mask.value & ~(1 << layer);
}

[Flags]
public enum StatusEffect
{
    None     = 0,
    Poisoned = 1 << 0,
    Burning  = 1 << 1,
    Frozen   = 1 << 2,
}

// effects |= StatusEffect.Burning;                  // ajouter
// effects &= ~StatusEffect.Poisoned;                // retirer
// bool burning = (effects & StatusEffect.Burning) != 0;   // tester`},

{id:'raycast',cat:'unity',lvl:2,title:'Raycasts',sum:'Lancer un rayon pour savoir ce qu\'il touche : sol, tir, visée, rebond.',
body:[
['L\'idée',`Un rayon, c'est une origine et une direction (deux [[vecteurs]]). ~Physics.Raycast~ le lance jusqu'à une distance maximale et renvoie vrai s'il touche un collider. Le ~RaycastHit~ donne le point touché, la normale de la surface, la distance et le collider.`,`if (Physics.Raycast(origin, dir, out RaycastHit hit, 50f, mask))
    Debug.Log(hit.collider.name + " à " + hit.distance + " m");`],
['Filtrer avec un LayerMask',`Sans filtre, le rayon peut toucher le joueur lui-même. On passe un ~LayerMask~ pour ne tester que certains layers. Voir [[operations-bits]].`],
['Viser depuis la caméra',`~Camera.main.ScreenPointToRay(Input.mousePosition)~ donne le rayon qui part de la caméra et passe par le curseur : la base de tout clic dans un monde 3D.`],
['Rebondir sur la normale',`Pour faire rebondir une balle, on retire deux fois la part de la vitesse qui va dans la normale. Cette part se calcule avec le [[produit-scalaire]]. ~Vector3.Reflect~ fait ce calcul.`],
['Performance',`~RaycastAll~ alloue un tableau à chaque appel. ~Physics.RaycastNonAlloc~ remplit un tableau que tu as créé une fois. Voir [[allocations-gc]].`]],
ex:`Écris ~bool IsGrounded(Transform t, float distance, LayerMask ground)~ qui lance un rayon vers le bas depuis légèrement au-dessus des pieds. Puis ~Vector3 Bounce(Vector3 velocity, Vector3 normal)~ sans utiliser ~Vector3.Reflect~.`,
hint:`Bounce : velocity − 2 × Dot(velocity, normal) × normal (la normale doit être normalisée, ce que garantit RaycastHit).`,
sol:`public static bool IsGrounded(Transform t, float distance, LayerMask ground)
{
    Vector3 origin = t.position + Vector3.up * 0.1f;   // un peu au-dessus des pieds
    return Physics.Raycast(origin, Vector3.down, distance + 0.1f, ground);
}

public static Vector3 Bounce(Vector3 velocity, Vector3 normal)
{
    // On retire deux fois la composante de la vitesse le long de la normale.
    return velocity - 2f * Vector3.Dot(velocity, normal) * normal;
}`},

{id:'scriptableobjects',cat:'unity',lvl:2,title:'ScriptableObjects',sum:'Des assets de données partagés : armes, ennemis, réglages. Le terrain de jeu des outils.',
body:[
['L\'idée',`Un ~ScriptableObject~ est un **asset de données** qui vit dans le projet, pas dans une scène. Dix ennemis qui pointent vers le même asset « Gobelin » partagent les mêmes données en mémoire, et un designer règle tout l'équilibrage sans toucher aux prefabs.`],
['Créer un asset',`~[CreateAssetMenu]~ ajoute une entrée au menu Create du panneau Project. Chaque asset créé est un fichier que Git versionne comme le reste.`],
['Le piège du Play Mode',`Dans l'éditeur, modifier un ScriptableObject pendant le jeu **modifie le fichier** : la valeur reste après l'arrêt. Dans un build, elle revient à sa valeur au prochain lancement. On n'y stocke donc pas l'état qui change en jeu (la vie actuelle), seulement les données de conception (la vie maximale).`],
['OnValidate',`Appelée dans l'éditeur à chaque modification de l'asset. Parfait pour corriger une valeur impossible avant qu'elle ne cause un bug, ou pour recalculer un champ dérivé.`],
['Pourquoi c\'est central pour les outils',`Les données des designers deviennent des fichiers qu'on peut lister, vérifier et afficher dans des outils : [[editor-window]], [[custom-inspector]], [[validation-assets]].`]],
ex:`Crée un ~WeaponData~ avec un nom, des dégâts, une cadence en tirs par seconde et un prefab de projectile. Ajoute une propriété calculée ~Cooldown~ et un ~OnValidate~ qui empêche une cadence nulle ou négative.`,
hint:`Cooldown = 1 / cadence. Garde la cadence en champ privé [SerializeField] pour contrôler sa valeur.`,
sol:`[CreateAssetMenu(fileName = "Weapon", menuName = "Game/Weapon Data")]
public class WeaponData : ScriptableObject
{
    public string displayName = "Pistolet";
    [Min(0)] public int damage = 10;
    [SerializeField] private float shotsPerSecond = 4f;
    public GameObject projectilePrefab;

    public float Cooldown => 1f / shotsPerSecond;

    private void OnValidate()
    {
        // Appelé dans l'éditeur à chaque modification de l'asset
        if (shotsPerSecond <= 0f) shotsPerSecond = 0.1f;
    }
}`},

/* ---------- OUTILS ÉDITEUR ---------- */
{id:'custom-inspector',cat:'editor',lvl:2,title:'Custom Inspector',sum:'Remplacer l\'affichage d\'un composant dans l\'Inspector, avec UI Toolkit.',
body:[
['L\'idée',`Un inspecteur personnalisé change ce qu'affiche l'Inspector pour un type donné : ajouter des boutons, des valeurs calculées, des avertissements. C'est une classe qui hérite d'~Editor~ avec ~[CustomEditor(typeof(MonType))]~.`],
['Le dossier Editor',`Le code d'éditeur utilise ~UnityEditor~, qui n'existe pas dans un build. Il doit vivre dans un dossier nommé ~Editor~ ou dans un assembly réservé à l'éditeur, sinon **le build échoue**. C'est une erreur fréquente que la CI attrape (voir [[build-ligne-commande]]).`],
['IMGUI ou UI Toolkit',`L'ancienne API redessine tout à chaque frame dans ~OnInspectorGUI~. UI Toolkit construit l'interface une fois dans ~CreateInspectorGUI~, avec des éléments comme en HTML. C'est la direction actuelle de Unity, celle à apprendre pour du code neuf.`],
['SerializedObject et SerializedProperty',`Modifier les données via ~serializedObject~ plutôt que directement sur ~target~ gère pour toi l'annulation (Undo), la multi-sélection et les modifications de prefab. ~ApplyModifiedProperties()~ valide les changements.`]],
ex:`Inspecteur UI Toolkit pour le ~WeaponData~ de la leçon [[scriptableobjects]] : l'inspecteur par défaut, un texte qui affiche les DPS (dégâts × cadence) mis à jour en direct, et un bouton qui remet les valeurs par défaut, avec Undo.`,
hint:`InspectorElement.FillDefaultInspector remplit les champs par défaut. TrackSerializedObjectValue appelle une méthode à chaque changement.`,
sol:`// Fichier à placer dans un dossier Editor/
[CustomEditor(typeof(WeaponData))]
public class WeaponDataEditor : Editor
{
    public override VisualElement CreateInspectorGUI()
    {
        var root = new VisualElement();
        InspectorElement.FillDefaultInspector(root, serializedObject, this);

        SerializedProperty damage = serializedObject.FindProperty("damage");
        SerializedProperty rate = serializedObject.FindProperty("shotsPerSecond");

        var dps = new Label();
        root.Add(dps);

        void Refresh() => dps.text = $"DPS : {damage.intValue * rate.floatValue:0.0}";
        Refresh();
        root.TrackSerializedObjectValue(serializedObject, _ => Refresh());

        root.Add(new Button(() =>
        {
            serializedObject.Update();
            damage.intValue = 10;
            rate.floatValue = 4f;
            serializedObject.ApplyModifiedProperties();   // gère l'Undo
        }) { text = "Valeurs par défaut" });

        return root;
    }
}`},

{id:'editor-window',cat:'editor',lvl:2,title:'Editor Window',sum:'Une fenêtre d\'outil dans l\'éditeur, ouverte depuis un menu, qui travaille sur tout le projet.',
body:[
['L\'idée',`Une ~EditorWindow~ est un panneau qu'on peut ancrer comme la Hierarchy ou la Console. On l'ouvre depuis un menu déclaré avec ~[MenuItem("Tools/Mon outil")]~. C'est le format idéal pour un outil qui travaille sur **tout le projet** plutôt que sur un objet sélectionné.`],
['Trouver les assets',`~AssetDatabase.FindAssets("t:WeaponData")~ renvoie les GUID de tous les assets d'un type. ~GUIDToAssetPath~ donne le chemin et ~LoadAssetAtPath<T>~ charge l'asset. Ici, [[linq]] rend le code très lisible et la performance importe peu.`],
['Interagir avec l\'éditeur',`~Selection.activeObject~ sélectionne un asset, ~EditorGUIUtility.PingObject~ le fait clignoter dans le panneau Project. ~EditorUtility.DisplayProgressBar~ affiche une barre de progression pendant un traitement long.`],
['Idées d\'outils',`Un tableau de toutes les armes pour comparer l'équilibrage, un renommeur en masse, un détecteur de références cassées, un bouton « préparer le build ». Chacun fait gagner du temps à toute l'équipe, chaque jour.`]],
ex:`Écris une fenêtre « Tools/Weapons Overview » qui liste tous les ~WeaponData~ du projet (voir [[scriptableobjects]]) triés par DPS, avec un bouton Rafraîchir. Cliquer sur une arme sélectionne l'asset.`,
hint:`Construis l'interface dans CreateGUI. Pour rafraîchir, vide la liste et reconstruis-la.`,
sol:`public class WeaponOverviewWindow : EditorWindow
{
    [MenuItem("Tools/Weapons Overview")]
    private static void Open() => GetWindow<WeaponOverviewWindow>("Weapons");

    private VisualElement list;

    private void CreateGUI()
    {
        rootVisualElement.Add(new Button(Rebuild) { text = "Rafraîchir" });
        list = new ScrollView();
        rootVisualElement.Add(list);
        Rebuild();
    }

    private void Rebuild()
    {
        list.Clear();

        var weapons = AssetDatabase.FindAssets("t:WeaponData")
            .Select(AssetDatabase.GUIDToAssetPath)
            .Select(path => AssetDatabase.LoadAssetAtPath<WeaponData>(path))
            .OrderByDescending(w => w.damage / w.Cooldown);

        foreach (WeaponData w in weapons)
        {
            var row = new Button(() =>
            {
                Selection.activeObject = w;
                EditorGUIUtility.PingObject(w);
            });
            row.text = $"{w.displayName}  ·  DPS {w.damage / w.Cooldown:0.0}";
            list.Add(row);
        }
    }
}`},

{id:'validation-assets',cat:'editor',lvl:3,title:'Validation automatique des assets',sum:'Attraper les erreurs dès l\'import plutôt qu\'en QA : nommage, tailles, réglages.',
body:[
['L\'idée',`Plus une erreur est trouvée tard, plus elle coûte cher. Une texture de 8K dans l'UI repérée par la QA a déjà été intégrée, buildée et testée. Repérée à l'import, elle coûte zéro. La validation automatique transforme les règles du studio en code.`],
['AssetPostprocessor',`Une classe qui hérite d'~AssetPostprocessor~ est appelée par Unity à chaque import. ~OnPreprocessTexture~ s'exécute **avant** l'import (on peut changer les réglages), ~OnPostprocessTexture~ après. Il existe l'équivalent pour les modèles, l'audio, etc.`],
['Deux familles de règles',`Les règles qu'on peut **corriger** automatiquement (toute texture d'UI devient un Sprite sans mipmaps) et celles qu'on doit **signaler** (un nom qui ne respecte pas la convention). Le message doit toujours contenir le chemin de l'asset.`],
['En CI',`Une méthode statique peut parcourir tout le projet et quitter avec un code d'erreur. Lancée en mode batch dans GitLab CI, elle fait échouer la merge request avant que le problème n'arrive dans la branche principale. Voir [[build-ligne-commande]].`],
['Avec la réflexion',`Le même principe s'applique aux prefabs et aux ScriptableObjects : parcourir les champs marqués ~[Required]~ et signaler ceux qui sont vides. Voir [[attributs-reflexion]].`]],
ex:`Écris un ~AssetPostprocessor~ : les textures sous ~Assets/Art/UI/~ deviennent des Sprites sans mipmaps, et toute texture dont le nom ne commence pas par ~T_~ déclenche un avertissement. Ajoute une méthode ~AssetValidator.ValidateAll()~, utilisable en CI, qui échoue si une texture dépasse 2048 pixels.`,
hint:`assetImporter se convertit en TextureImporter. En mode batch, EditorApplication.Exit(1) signale l'échec à la CI.`,
sol:`public class TextureRules : AssetPostprocessor
{
    private void OnPreprocessTexture()
    {
        var importer = (TextureImporter)assetImporter;
        string fileName = Path.GetFileName(assetPath);

        if (assetPath.StartsWith("Assets/Art/UI/"))
        {
            importer.textureType = TextureImporterType.Sprite;
            importer.mipmapEnabled = false;
        }

        if (!fileName.StartsWith("T_"))
            Debug.LogWarning($"Nommage : {assetPath} devrait commencer par T_");
    }
}

public static class AssetValidator
{
    // En CI : Unity -batchmode -projectPath . -executeMethod AssetValidator.ValidateAll
    public static void ValidateAll()
    {
        int errors = 0;
        foreach (string guid in AssetDatabase.FindAssets("t:Texture2D", new[] { "Assets" }))
        {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            var tex = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
            if (tex != null && Mathf.Max(tex.width, tex.height) > 2048)
            {
                Debug.LogError($"Texture trop grande ({tex.width}x{tex.height}) : {path}");
                errors++;
            }
        }

        if (Application.isBatchMode)
            EditorApplication.Exit(errors > 0 ? 1 : 0);
    }
}`},

{id:'build-ligne-commande',cat:'editor',lvl:3,title:'Builds en ligne de commande',sum:'Lancer Unity sans interface depuis la CI, construire le jeu et signaler l\'échec.',
body:[
['L\'idée',`Une machine de CI n'a pas d'écran ni de développeur pour cliquer sur « Build ». On lance donc Unity en **mode batch** et on lui demande d'exécuter une méthode statique qui fait le build.`,`Unity -batchmode -nographics -quit -projectPath . -executeMethod BuildScript.BuildWindows -buildPath Builds/Game.exe -logFile -`],
['BuildPipeline',`~BuildPipeline.BuildPlayer(options)~ fait le même travail que la fenêtre Build. Il renvoie un ~BuildReport~ : résultat, durée, taille, erreurs. On vérifie ~report.summary.result~.`],
['Le code de sortie',`C'est ce que lit GitLab CI : 0 = succès, autre chose = échec et job rouge. ~EditorApplication.Exit(code)~ quitte Unity avec ce code. Sans ça, un build raté peut passer pour réussi.`],
['Lire des arguments',`~Environment.GetCommandLineArgs()~ renvoie tous les arguments de la ligne de commande. On y ajoute les siens (~-buildPath~, ~-buildVersion~) que le pipeline remplit avec le numéro du commit ou du tag.`],
['Et Python dans tout ça ?',`Le C# fait le build ; un langage de script comme Python orchestre souvent autour : choisir la version de Unity, lancer la commande, analyser le log, compresser, envoyer sur Steam ou au serveur de QA, poster le lien dans le chat. Le contenu Addressables se construit avant le joueur. Les échecs à attraper en amont : un script éditeur hors du dossier Editor ([[custom-inspector]]), un asset invalide ([[validation-assets]]).`]],
ex:`Écris ~BuildScript.BuildWindows()~ qui lit ~-buildPath~ et ~-buildVersion~ dans la ligne de commande, construit toutes les scènes activées dans les Build Settings pour Windows 64 bits, affiche un résumé et quitte avec 0 ou 1.`,
hint:`EditorBuildSettings.scenes contient la liste des scènes ; filtre celles dont enabled est vrai.`,
sol:`public static class BuildScript
{
    public static void BuildWindows()
    {
        string path = GetArg("-buildPath") ?? "Builds/Windows/Game.exe";
        string version = GetArg("-buildVersion");
        if (!string.IsNullOrEmpty(version))
            PlayerSettings.bundleVersion = version;

        var options = new BuildPlayerOptions
        {
            scenes = EditorBuildSettings.scenes
                .Where(s => s.enabled)
                .Select(s => s.path)
                .ToArray(),
            locationPathName = path,
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.None,
        };

        BuildReport report = BuildPipeline.BuildPlayer(options);
        BuildSummary s = report.summary;
        Debug.Log($"Build {s.result} en {s.totalTime}, {s.totalSize / (1024 * 1024)} Mo");

        EditorApplication.Exit(s.result == BuildResult.Succeeded ? 0 : 1);
    }

    private static string GetArg(string name)
    {
        string[] args = Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length - 1; i++)
            if (args[i] == name) return args[i + 1];
        return null;
    }
}`},

/* ---------- PERFORMANCE ---------- */
{id:'allocations-gc',cat:'perf',lvl:3,title:'Allocations et ramasse-miettes',sum:'Pourquoi le jeu saccade de temps en temps, et comment viser zéro allocation par image.',
body:[
['L\'idée',`Chaque ~new~ d'une class réserve de la mémoire sur le **tas**. Quand il y a assez de déchets, le ramasse-miettes (garbage collector, GC) passe nettoyer, et cela prend du temps sur l'image en cours : le jeu saccade. Les [[struct-vs-class|struct]] locales n'en produisent pas.`],
['Les allocations cachées',`Concaténer des chaînes chaque image, une requête [[linq]], une lambda qui capture une variable, le **boxing** d'une struct dans un ~object~, ~GetComponents~ qui renvoie un nouveau tableau, ~new WaitForSeconds~ dans une [[coroutines|coroutine]], ~FindObjectsByType~.`],
['Les repérer',`Le Profiler de Unity a une colonne **GC Alloc** par méthode. En gameplay, l'objectif est 0 B par image. Le mode Deep Profile montre la ligne exacte, au prix d'un jeu très ralenti pendant la mesure.`],
['Les solutions',`Mettre en cache (références, ~WaitForSeconds~), réutiliser une liste avec ~Clear()~, les variantes ~NonAlloc~ des requêtes physiques (voir [[raycast]]), ne mettre à jour un texte que quand la valeur change, et réutiliser les objets au lieu de les détruire (voir [[object-pooling]]).`]],
ex:`Ce script alloue à chaque image. Réécris-le pour qu'il n'alloue plus rien en régime normal, sans changer son comportement.`,
exCode:`public class WaveManager : MonoBehaviour
{
    [SerializeField] private TMP_Text scoreText;
    private int score;

    void Update()
    {
        scoreText.text = "Score : " + score;
        var enemies = FindObjectsByType<Enemy>(FindObjectsSortMode.None);
        var alive = enemies.Where(e => e.gameObject.activeSelf).ToList();
        if (alive.Count == 0) StartCoroutine(NextWave());
    }
}`,
hint:`Trois problèmes : la chaîne reconstruite, la recherche de tous les ennemis, la liste LINQ. Et un bug : NextWave est relancée à chaque image tant que la vague est vide.`,
sol:`public class WaveManager : MonoBehaviour
{
    [SerializeField] private TMP_Text scoreText;
    private int score;
    private int displayedScore = -1;
    private bool waveStarting;

    private void Update()
    {
        // 1. Ne reconstruire le texte que si le score a changé
        if (score != displayedScore)
        {
            displayedScore = score;
            scoreText.SetText("Score : {0}", score);   // TMP formate sans allouer
        }

        // 2. Plus de Find ni de LINQ : les ennemis se comptent eux-mêmes
        if (!waveStarting && Enemy.AliveCount == 0)
        {
            waveStarting = true;                        // 3. une seule fois
            StartCoroutine(NextWave());
        }
    }

    private IEnumerator NextWave()
    {
        yield return null;   // ... faire apparaître la vague suivante
        waveStarting = false;
    }
}

public class Enemy : MonoBehaviour
{
    public static int AliveCount { get; private set; }
    private void OnEnable()  => AliveCount++;
    private void OnDisable() => AliveCount--;
}`},

{id:'object-pooling',cat:'perf',lvl:2,title:'Object pooling',sum:'Réutiliser les balles et les ennemis au lieu de les créer et détruire sans arrêt.',
body:[
['L\'idée',`~Instantiate~ et ~Destroy~ coûtent cher : allocation, initialisation de tous les composants, déchets pour le [[allocations-gc|ramasse-miettes]]. Pour ce qui apparaît et disparaît en masse (balles, impacts, ennemis), on garde une réserve d'objets désactivés et on les recycle.`],
['Le principe',`Une pile d'objets inactifs. ~Get~ en retire un (ou en crée un si la pile est vide), le place et l'active. ~Release~ le désactive et le remet dans la pile. On peut en créer d'avance (« prewarm ») pendant le chargement.`],
['Les pièges',`Un objet recyclé garde son ancien état : vitesse, vie, particules en cours. Il faut le **réinitialiser** à la sortie de la pile. Rendre deux fois le même objet le fait sortir deux fois : deux balles qui se partagent un GameObject.`],
['Dans Unity',`~UnityEngine.Pool.ObjectPool<T>~ fournit un pool prêt à l'emploi avec des callbacks de création, de sortie et de retour. Écrire le sien une fois aide à comprendre ce qu'il fait. C'est un bon cas d'usage des [[generiques]].`]],
ex:`Écris ton propre ~SimplePool<T> where T : Component~ avec un constructeur (prefab, nombre à créer d'avance, parent), ~Get(Vector3 position)~ et ~Release(T item)~, sans utiliser ~ObjectPool~.`,
hint:`Une Stack<T> suffit. Dans le constructeur, instancie puis Release chaque objet pour le ranger désactivé.`,
sol:`public class SimplePool<T> where T : Component
{
    private readonly T prefab;
    private readonly Transform parent;
    private readonly Stack<T> inactive = new Stack<T>();

    public SimplePool(T prefab, int prewarm, Transform parent = null)
    {
        this.prefab = prefab;
        this.parent = parent;
        for (int i = 0; i < prewarm; i++)
            Release(Object.Instantiate(prefab, parent));
    }

    public T Get(Vector3 position)
    {
        T item = inactive.Count > 0 ? inactive.Pop() : Object.Instantiate(prefab, parent);
        item.transform.position = position;
        item.gameObject.SetActive(true);
        return item;
    }

    public void Release(T item)
    {
        if (!item.gameObject.activeSelf) return;   // déjà rendu : on ignore
        item.gameObject.SetActive(false);
        inactive.Push(item);
    }
}`}

]);

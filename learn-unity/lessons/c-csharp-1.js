window.COURSES=Object.assign(window.COURSES||{},{
'variables-types':{
lead:`Toute donnée d'un jeu (une vie, une position, un nom de joueur, l'état « en pause ») vit dans une variable, et toute variable a un **type**. Ce premier cours pose des bases que l'on utilise à chaque ligne de code : comment C# range les nombres, pourquoi Unity préfère les ~float~, et les trois pièges qui coûtent le plus d'heures de débogage aux débutants : la division entière, la comparaison de ~float~ et le débordement.`,
ch:[
['Déclarer une variable',
`Une variable est un emplacement mémoire auquel on donne un **nom** et un **type**. Le type dit au compilateur ce que la variable peut contenir et quelles opérations sont permises. On écrit le type, le nom, puis éventuellement une valeur initiale.`,
{c:`int lives = 3;              // un nombre entier
float speed = 4.5f;         // un nombre à virgule (le f est obligatoire)
bool isGrounded = true;     // vrai ou faux
string playerName = "Aya";  // du texte
char grade = 'A';           // un seul caractère, entre apostrophes`, t:`Les cinq types que tu croiseras le plus`},
`C# est **typé statiquement** : le type est fixé une fois pour toutes à la compilation. Si tu écris ~lives = "trois";~, le programme ne compile même pas. C'est une protection : beaucoup d'erreurs sont attrapées avant d'avoir lancé le jeu, alors qu'un langage dynamique comme Python ou JavaScript ne les découvrirait qu'à l'exécution.`,
`Le mot-clé ~var~ demande au compilateur de **déduire** le type à partir de la valeur. La variable reste typée : ~var speed = 4.5f;~ crée un ~float~, et on ne pourra jamais y mettre autre chose.`,
{c:`var count = 10;                    // int
var position = new Vector3(0, 1, 0); // Vector3 : on évite de l'écrire deux fois
var enemies = new List<Enemy>();   // List<Enemy>`},
{n:`Utilise ~var~ quand le type est évident en lisant la partie droite (un ~new~, un cast). Écris le type quand il ne l'est pas : ~float ratio = GetRatio();~ est plus clair que ~var ratio = GetRatio();~.`}],
['Les types numériques',
`C# propose plusieurs types de nombres, qui diffèrent par leur **taille en mémoire** et donc par les valeurs qu'ils peuvent contenir.`,
{tab:[['Type','Taille','Valeurs','Usage typique'],['~int~','32 bits','environ −2,1 à +2,1 milliards','compteurs, vies, indices, scores'],['~long~','64 bits','environ ±9,2 × 10¹⁸','très grands scores, horodatages'],['~float~','32 bits','environ 7 chiffres significatifs','positions, vitesses, temps dans Unity'],['~double~','64 bits','environ 15 à 16 chiffres','calculs scientifiques, précision élevée'],['~byte~','8 bits','0 à 255','composantes de couleur, données compactes'],['~decimal~','128 bits','28 chiffres exacts en base 10','argent réel, comptabilité']]},
`Unity travaille presque entièrement en ~float~ : ~Vector3~, ~Quaternion~, ~Time.deltaTime~, ~Mathf~. La raison est la performance : les cartes graphiques et les instructions vectorielles des processeurs traitent les nombres de 32 bits très efficacement, et deux fois moins de mémoire signifie deux fois plus de données dans le cache.`,
`Un nombre décimal écrit dans le code (~4.5~) est un ~double~ par défaut. Pour obtenir un ~float~, il faut le suffixe ~f~. Sans lui, le compilateur refuse de mettre un ~double~ dans un ~float~ car il pourrait perdre de la précision.`,
{c:`float a = 4.5;    // erreur CS0664 : un double ne rentre pas dans un float
float b = 4.5f;   // correct
float c = 4;      // correct : un int se convertit sans perte en float`}],
['Conversions implicites et explicites',
`Passer d'un type « petit » à un type « grand » se fait tout seul : c'est une **conversion implicite**, sans risque de perte. Un ~int~ va dans un ~long~, un ~float~ dans un ~double~, un ~int~ dans un ~float~.`,
`Dans l'autre sens, il faut l'écrire : c'est un **cast** (conversion explicite), avec le type visé entre parenthèses. Tu prends alors la responsabilité de la perte éventuelle.`,
{c:`float health = 72.9f;
int shown = (int)health;              // 72 : le cast TRONQUE, il n'arrondit pas
int rounded = Mathf.RoundToInt(health); // 73
int down = Mathf.FloorToInt(-2.5f);     // -3 : arrondi vers le bas
int truncated = (int)-2.5f;             // -2 : troncature vers zéro`},
{w:`~Mathf.RoundToInt(2.5f)~ vaut **2** et ~Mathf.RoundToInt(3.5f)~ vaut **4** : Unity arrondit les demis vers l'entier pair le plus proche (« arrondi bancaire »), ce qui surprend souvent. Si tu as besoin de l'arrondi scolaire, écris ~Mathf.FloorToInt(x + 0.5f)~ pour les nombres positifs.`},
`Pour convertir du texte en nombre, on utilise ~int.Parse("42")~, qui lève une exception si le texte n'est pas un nombre, ou ~int.TryParse~, qui renvoie un booléen. On revient sur ce motif dans [[methodes-parametres]].`],
['Le piège de la division entière',
`C'est l'erreur la plus courante du débutant, et elle ne produit **aucun message d'erreur**. Quand les deux opérandes d'une division sont des entiers, C# fait une division entière : il garde la partie entière et jette le reste.`,
{c:`int hp = 30, max = 100;
float ratio = hp / max;        // 0 ! (30 / 100 = 0 en entiers, puis converti en 0f)
float ok1 = (float)hp / max;   // 0.3 : un opérande float suffit
float ok2 = hp / (float)max;   // 0.3
float ok3 = hp * 1f / max;     // 0.3, autre écriture courante`, t:`La barre de vie qui reste vide`},
`Le calcul se fait **avant** l'affectation : le fait que la variable de gauche soit un ~float~ ne change rien, la division a déjà été faite en entiers. C'est l'ordre d'évaluation qui compte.`,
`La division entière a aussi ses usages légitimes : trouver une ligne dans une grille (~y = index / width~), découper des secondes en minutes (~minutes = totalSeconds / 60~). L'opérateur ~%~ donne le reste : ~index % width~ donne la colonne. Voir [[grille-2d]] et [[modulo-repetition]].`],
['Comparer des nombres à virgule',
`Un ~float~ stocke les nombres en binaire. Beaucoup de décimales simples n'ont pas d'écriture exacte en binaire, exactement comme 1/3 n'a pas d'écriture exacte en décimal (0,3333…). Chaque opération ajoute donc une minuscule erreur d'arrondi.`,
{c:`float a = 0.1f + 0.2f;
Debug.Log(a == 0.3f);                    // False !
Debug.Log(Mathf.Approximately(a, 0.3f)); // True
Debug.Log(Mathf.Abs(a - 0.3f) < 0.0001f); // True : tolérance explicite`},
`Règle simple : **ne compare jamais deux ~float~ avec ~==~** après un calcul. Utilise ~Mathf.Approximately~ pour des valeurs proches de 1, ou une tolérance adaptée à l'échelle (0,01 pour des mètres, 0,0001 pour des ratios).`,
{u:`La précision d'un ~float~ est **relative** : environ 7 chiffres en tout. Près de l'origine, on a une précision de l'ordre du micromètre ; à 100 000 unités, de l'ordre du centimètre. C'est pourquoi les objets tremblent dans les très grands mondes ouverts. La solution des moteurs est de recentrer régulièrement le monde autour du joueur (« floating origin »).`}],
['Le débordement et les constantes',
`Un ~int~ ne peut pas dépasser 2 147 483 647. Si on l'augmente au-delà, il **déborde** silencieusement et repart du plus petit négatif. Dans un jeu incrémental où l'or monte très vite, c'est un vrai bug.`,
{c:`int gold = int.MaxValue;   // 2147483647
gold += 1;                 // -2147483648, sans aucune erreur

long bigGold = int.MaxValue;
bigGold += 1;              // 2147483648, correct

checked
{
    int x = int.MaxValue;
    x += 1;                // lève une OverflowException au lieu de déborder
}`},
`Enfin, une valeur qui ne change jamais s'écrit ~const~ (connue à la compilation, uniquement pour les types simples et ~string~) ou ~static readonly~ (fixée une fois à l'exécution, pour n'importe quel type). Nommer ses constantes évite les « nombres magiques » éparpillés dans le code.`,
{c:`private const int MaxLives = 3;
private const float Gravity = -9.81f;
private static readonly Vector3 SpawnOffset = new Vector3(0f, 1.5f, 0f);`}]
],
err:[[`Oublier le f`,`~float speed = 4.5;~ ne compile pas. Le message CS0664 dit exactement d'ajouter le suffixe.`],[`Diviser deux int`,`~hp / max~ vaut 0 tant que hp < max. Convertis un opérande en ~float~.`],[`Comparer des float avec ==`,`Utilise ~Mathf.Approximately~ ou une tolérance.`],[`Croire qu'un cast arrondit`,`~(int)2.9f~ vaut 2. Pour arrondir, ~Mathf.RoundToInt~, en tenant compte de l'arrondi des demis.`]],
res:[`Une variable a un type fixé à la compilation ; ~var~ le déduit sans le rendre dynamique.`,`Unity travaille en ~float~ : suffixe ~f~ obligatoire pour les littéraux décimaux.`,`Petit vers grand : implicite. Grand vers petit : cast explicite, qui tronque.`,`Deux ~int~ divisés donnent un ~int~.`,`On compare des ~float~ avec une tolérance ; on surveille le débordement des ~int~.`],
quiz:[
[`Que vaut ~float r = 7 / 2;~ ?`,[`3.5`,`3`,`4`,`Erreur de compilation`],1,`La division se fait en entiers (7 / 2 = 3), puis le résultat 3 est converti en 3f.`],
[`Que vaut ~(int)-3.7f~ ?`,[`-4`,`-3`,`-3.7`,`4`],1,`Le cast tronque vers zéro : il retire la partie décimale.`],
[`Pourquoi ~float x = 1.5;~ ne compile-t-il pas ?`,[`1.5 est un double et la conversion pourrait perdre de la précision`,`Il faut écrire 1,5`,`float ne peut pas contenir de décimales`,`Il manque var`],0,`Un littéral décimal est un double par défaut ; le suffixe f en fait un float.`],
[`Quelle comparaison est fiable après un calcul ?`,[`a == b`,`a.Equals(b)`,`Mathf.Approximately(a, b)`,`(int)a == (int)b`],2,`Les erreurs d'arrondi rendent == peu fiable ; Approximately tolère un petit écart.`]],
src:[[`Microsoft Learn : types intégrés de C#`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/built-in-types`],[`Microsoft Learn : types numériques à virgule flottante`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types`],[`Microsoft Learn : le système de types C#`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/types/`],[`Documentation Unity : Mathf`,`https://docs.unity3d.com/ScriptReference/Mathf.html`]]},

'conditions-boucles':{
lead:`Un programme passe son temps à **choisir** (le joueur a-t-il assez d'or ?) et à **répéter** (pour chaque ennemi, vérifier s'il voit le joueur). Ce cours détaille toutes les instructions de contrôle de C#, avec la façon de les écrire lisiblement et les pièges propres au jeu vidéo : les boucles infinies qui figent l'éditeur et les collections modifiées pendant qu'on les parcourt.`,
ch:[
['if, else if, else',
`~if~ exécute un bloc si une condition est vraie. ~else~ donne l'alternative. On peut enchaîner plusieurs cas avec ~else if~ : C# teste les conditions dans l'ordre et s'arrête à la première vraie.`,
{c:`if (health <= 0)
{
    Die();
}
else if (health < maxHealth * 0.25f)
{
    ShowLowHealthWarning();
}
else
{
    HideWarning();
}`},
`Une condition est une expression de type ~bool~. On la construit avec les comparaisons (~==~, ~!=~, ~<~, ~<=~, ~>~, ~>=~) et les opérateurs logiques : ~&&~ (et), ~||~ (ou), ~!~ (non).`,
`~&&~ et ~||~ sont **court-circuités** : si la partie gauche suffit à connaître le résultat, la droite n'est pas évaluée. C'est très utile pour se protéger : dans ~if (target != null && target.IsAlive)~, ~target.IsAlive~ n'est jamais lu si target est null.`,
{n:`Mets toujours des accolades, même pour une seule ligne. Sans elles, ajouter une deuxième ligne plus tard la fait sortir du ~if~ sans que l'indentation ne le montre.`}],
['La clause de garde : sortir tôt',
`Quand une méthode a plusieurs conditions préalables, les imbriquer produit une « pyramide » difficile à lire. La technique de la **clause de garde** traite d'abord les cas où il n'y a rien à faire, et sort immédiatement.`,
{c:`// Pyramide : difficile à suivre
void TryOpen(Player p)
{
    if (p != null)
    {
        if (!isOpen)
        {
            if (p.HasKey(keyId))
            {
                Open();
            }
        }
    }
}

// Clauses de garde : le cas normal reste à gauche
void TryOpen(Player p)
{
    if (p == null) return;
    if (isOpen) return;
    if (!p.HasKey(keyId)) return;
    Open();
}`, t:`Même logique, deux écritures`},
`Dans une boucle, ~continue~ joue le même rôle : il passe directement à l'élément suivant.`],
['switch et l\'opérateur ternaire',
`Quand on compare une même valeur à plusieurs constantes, ~switch~ est plus lisible qu'une chaîne de ~else if~. Chaque cas se termine par ~break~ (ou ~return~).`,
{c:`switch (state)
{
    case EnemyState.Idle:
        LookAround();
        break;
    case EnemyState.Chase:
    case EnemyState.Alert:     // deux cas, même traitement
        MoveToward(player);
        break;
    default:
        break;
}`},
`L'**opérateur ternaire** ~condition ? a : b~ choisit une valeur en une expression. Il est parfait pour une affectation simple ; imbriqué, il devient illisible.`,
{c:`float speed = isRunning ? runSpeed : walkSpeed;
string label = count == 1 ? "1 pièce" : $"{count} pièces";`},
`La version moderne du ~switch~, l'**expression switch**, renvoie directement une valeur. On la voit en détail dans [[enums-switch]] et [[pattern-matching]].`],
['Les boucles for et foreach',
`La boucle ~for~ a trois parties : l'initialisation, la condition pour continuer, et l'incrément. Elle est idéale quand on a besoin de l'**indice**.`,
{c:`for (int i = 0; i < waypoints.Length; i++)
{
    Debug.Log($"Point {i} : {waypoints[i].position}");
}

// Parcourir à l'envers
for (int i = list.Count - 1; i >= 0; i--) { /* ... */ }

// Un pas différent : une case sur deux
for (int x = 0; x < width; x += 2) { /* ... */ }`},
`~foreach~ parcourt tous les éléments d'une collection sans s'occuper des indices. C'est la boucle la plus lisible quand on veut simplement traiter chaque élément.`,
{c:`foreach (Enemy enemy in enemies)
{
    enemy.Alert(transform.position);
}

// Les enfants d'un Transform se parcourent aussi avec foreach
foreach (Transform child in transform)
{
    child.gameObject.SetActive(false);
}`},
{w:`On ne peut **pas** ajouter ou retirer d'éléments à une collection pendant un ~foreach~ sur cette même collection : C# lève une ~InvalidOperationException~ (« Collection was modified »). Pour retirer en parcourant, utilise un ~for~ à l'envers ou ~list.RemoveAll(condition)~.`}],
['while et do while',
`~while~ répète tant qu'une condition est vraie, quand on ne connaît pas le nombre de tours à l'avance. ~do while~ exécute le corps **au moins une fois** avant de tester.`,
{c:`// Trouver une position libre en décalant vers la droite
Vector3 pos = spawnPoint;
int tries = 0;
while (Physics.CheckSphere(pos, 0.5f) && tries < 50)
{
    pos += Vector3.right;
    tries++;
}

// Tirer un nombre différent du précédent
int next;
do
{
    next = Random.Range(0, 4);
} while (next == last);`},
{w:`Dans Unity, une boucle infinie **fige complètement l'éditeur** : il ne répond plus et il faut le tuer depuis le gestionnaire de tâches, en perdant ce qui n'était pas enregistré. Toute boucle ~while~ dont la sortie dépend du monde (physique, hasard) doit avoir un compteur de sécurité comme ~tries~ ci-dessus.`},
{u:`Pour attendre quelque chose **dans le temps** (que le joueur appuie sur une touche, qu'une porte s'ouvre), n'utilise jamais un ~while~ qui tourne en attendant : il bloquerait l'image en cours. Il faut rendre la main au moteur à chaque image : c'est le rôle des [[coroutines]] et de [[async-await]].`}],
['break, continue et le coût des boucles',
`~break~ quitte la boucle immédiatement, ~continue~ passe au tour suivant. ~return~ quitte toute la méthode, boucle comprise.`,
{c:`Enemy FindFirstVisible(List<Enemy> enemies)
{
    foreach (Enemy e in enemies)
    {
        if (!e.IsAlive) continue;      // on ignore les morts
        if (CanSee(e)) return e;       // trouvé : on sort tout de suite
    }
    return null;
}`},
`Une boucle dans une boucle multiplie le travail : comparer chaque ennemi à chaque autre ennemi, c'est n × n tours. Avec 100 ennemis, 10 000 tests ; avec 1 000, un million, **à chaque image**. C'est la première cause de chute de framerate dans les systèmes de gameplay. Le cours [[complexite]] explique comment raisonner, et [[partition-spatiale]] comment éviter ce cas.`]
],
err:[[`Une boucle infinie`,`L'éditeur se fige. Ajoute toujours une limite de tours aux ~while~.`],[`Modifier une liste dans son foreach`,`« Collection was modified ». Parcours à l'envers avec ~for~ ou utilise ~RemoveAll~.`],[`Le if sans accolades`,`Une deuxième ligne ajoutée plus tard sort du ~if~ sans prévenir.`],[`Oublier break dans un switch`,`C# refuse de « tomber » d'un cas non vide au suivant : erreur CS0163.`]],
res:[`~if / else if / else~ testent dans l'ordre ; ~&&~ et ~||~ court-circuitent.`,`Les clauses de garde gardent le code principal lisible.`,`~for~ pour l'indice, ~foreach~ pour parcourir, ~while~ quand on ignore le nombre de tours.`,`Ne jamais modifier une collection pendant son ~foreach~.`,`Une boucle ne doit jamais attendre le temps qui passe : coroutines ou async.`],
quiz:[
[`Dans ~if (a != null && a.hp > 0)~, que se passe-t-il si ~a~ est null ?`,[`NullReferenceException`,`La condition vaut false sans lire a.hp`,`La condition vaut true`,`Erreur de compilation`],1,`&& est court-circuité : la partie droite n'est pas évaluée.`],
[`Quelle boucle exécute son corps au moins une fois ?`,[`for`,`while`,`do while`,`foreach`],2,`do while teste la condition après le premier passage.`],
[`Que se passe-t-il si on retire un élément d'une List dans son propre foreach ?`,[`Rien de spécial`,`L'élément suivant est sauté`,`Une InvalidOperationException`,`La liste est vidée`],2,`Le foreach détecte que la collection a changé et lève une exception.`],
[`Comment attendre qu'un joueur appuie sur une touche ?`,[`while (!Input.anyKey) { }`,`Une coroutine ou une méthode async qui rend la main à chaque image`,`Un for de 1000 tours`,`Thread.Sleep`],1,`Une boucle qui attend bloquerait l'image en cours et figerait le jeu.`]],
src:[[`Microsoft Learn : instructions de sélection (if, switch)`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/selection-statements`],[`Microsoft Learn : instructions d'itération (for, foreach, while)`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/iteration-statements`],[`Microsoft Learn : instructions de saut (break, continue, return)`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/jump-statements`]]},

'methodes-parametres':{
lead:`Une méthode est un bloc de code nommé qui accomplit une tâche. Bien découper son code en méthodes est probablement la compétence qui distingue le plus un code de débutant d'un code professionnel. Ce cours couvre la syntaxe complète (paramètres, retour, ~ref~, ~out~, ~in~, paramètres optionnels, surcharge) et surtout la manière de bien concevoir ses méthodes.`,
ch:[
['Anatomie d\'une méthode',
`Une méthode se déclare avec un niveau d'accès, un type de retour, un nom et une liste de paramètres entre parenthèses. ~void~ signifie qu'elle ne renvoie rien.`,
{c:`//  accès   retour  nom             paramètres
    public  float   HealthPercent(  int current, int max  )
    {
        if (max <= 0) return 0f;
        return (float)current / max;
    }

    private void Respawn()
    {
        transform.position = spawnPoint;
        health = maxHealth;
    }`},
`~return~ renvoie une valeur et quitte la méthode immédiatement. Dans une méthode ~void~, ~return;~ sans valeur sert à sortir plus tôt (voir les clauses de garde dans [[conditions-boucles]]).`,
`Pour une méthode d'une seule expression, la syntaxe « corps d'expression » avec ~=>~ est plus compacte :`,
{c:`public bool IsDead() => health <= 0;
public float Ratio(int a, int b) => b == 0 ? 0f : (float)a / b;`}],
['Bien nommer, bien découper',
`Une méthode doit faire **une seule chose**, et son nom doit le dire. Les méthodes qui agissent se nomment par un verbe (~ApplyDamage~, ~SpawnWave~), celles qui répondent à une question par une forme interrogative (~IsGrounded~, ~CanAfford~, ~HasKey~).`,
`Test simple : peux-tu décrire ce que fait la méthode sans utiliser le mot « et » ? « Elle lit les entrées **et** déplace le joueur **et** joue le son » : il faut la découper.`,
{c:`// Avant : 60 lignes dans Update
void Update()
{
    // lecture des entrées...
    // calcul du mouvement...
    // saut...
    // animations...
}

// Après : Update raconte ce qui se passe
void Update()
{
    Vector2 input = ReadInput();
    Move(input);
    if (JumpPressed()) TryJump();
    UpdateAnimator(input);
}`, t:`Chaque nom devient de la documentation`},
{n:`Une méthode **pure** ne dépend que de ses paramètres et ne modifie rien autour d'elle : même entrée, même sortie. Elles sont faciles à comprendre et à tester. Isole les calculs dans des méthodes pures et garde les effets (déplacer, jouer un son) à part.`}],
['Passage par valeur, par référence : ref, out, in',
`Par défaut, C# **copie** la valeur du paramètre. Pour un ~int~ ou un ~Vector3~ (types valeur), la méthode travaille sur une copie : la modifier ne change rien chez l'appelant. Pour une class (type référence), c'est la référence qui est copiée : l'objet lui-même peut être modifié. Voir [[struct-vs-class]].`,
{c:`void AddBonus(int score) { score += 100; }     // ne sert à rien : copie
void AddBonus(ref int score) { score += 100; } // modifie la variable de l'appelant

int s = 50;
AddBonus(ref s);   // s vaut 150 ; le mot ref est obligatoire à l'appel aussi`},
`~out~ est une variante de ~ref~ où la méthode **doit** remplir la variable. C'est le motif ~TryXxx~ très courant : renvoyer un booléen « ça a marché » et le résultat dans un paramètre ~out~.`,
{c:`if (int.TryParse(inputField.text, out int amount))
    Buy(amount);
else
    ShowError("Nombre invalide");

if (Physics.Raycast(ray, out RaycastHit hit, 100f))
    Debug.Log(hit.point);

if (inventory.TryGetValue("potion", out int potions) && potions > 0)
    UsePotion();`, t:`Le motif TryXxx dans .NET et Unity`},
`~in~ passe par référence en **lecture seule**. Il sert à éviter la copie d'une grosse struct sans permettre de la modifier ; pour des petites struct comme ~Vector3~, le gain est négligeable.`],
['Paramètres optionnels, nommés et params',
`Un paramètre peut avoir une **valeur par défaut** : on peut alors l'omettre à l'appel. Les paramètres optionnels doivent être placés après les obligatoires.`,
{c:`void Shake(float strength = 1f, float duration = 0.2f, bool vibrate = true) { }

Shake();                        // tout par défaut
Shake(2f);                      // strength = 2
Shake(duration: 0.5f);          // argument nommé : on saute strength
Shake(0.5f, vibrate: false);`},
`Les **arguments nommés** rendent un appel lisible quand il y a plusieurs nombres ou booléens d'affilée : ~Spawn(enemy, 3, true, false)~ ne veut rien dire, ~Spawn(enemy, count: 3, elite: true, announce: false)~ si.`,
`~params~ permet de passer un nombre variable d'arguments, reçus sous forme de tableau.`,
{c:`int Sum(params int[] values)
{
    int total = 0;
    foreach (int v in values) total += v;
    return total;
}
Sum(1, 2, 3);    // 6
Sum();           // 0`}],
['Surcharge et renvoyer plusieurs valeurs',
`Plusieurs méthodes peuvent porter le même nom si leurs paramètres diffèrent : c'est la **surcharge**. Le compilateur choisit selon les arguments. Unity en use beaucoup (~Instantiate~ a une dizaine de versions).`,
{c:`public void Spawn(Vector3 position) => Spawn(position, Quaternion.identity);
public void Spawn(Vector3 position, Quaternion rotation) { /* ... */ }
public void Spawn(Transform at) => Spawn(at.position, at.rotation);`},
`Pour renvoyer plusieurs valeurs, trois options : des paramètres ~out~, un **tuple**, ou une petite struct nommée. Le tuple est pratique pour un usage local ; une struct est préférable quand le résultat circule dans le code.`,
{c:`(int min, int max) MinMax(int[] values)
{
    int lo = int.MaxValue, hi = int.MinValue;
    foreach (int v in values)
    {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
    }
    return (lo, hi);
}

var (lowest, highest) = MinMax(scores);   // déconstruction
Debug.Log($"{lowest} à {highest}");`}],
['Méthodes locales et récursion',
`Une **méthode locale** est déclarée à l'intérieur d'une autre méthode. Elle n'est visible que là, ce qui évite d'encombrer la classe avec un petit utilitaire à usage unique.`,
{c:`void BuildPath()
{
    // ...
    AddPoint(start);
    AddPoint(end);

    void AddPoint(Vector3 p)
    {
        if (points.Count == 0 || (points[^1] - p).sqrMagnitude > 0.01f)
            points.Add(p);
    }
}`},
`Une méthode peut aussi s'appeler elle-même : c'est la **récursion**, très utile pour parcourir des arbres comme la hiérarchie des Transform. Elle a ses règles et ses pièges, détaillés dans [[recursion]].`]
],
err:[[`Oublier ref à l'appel`,`~AddBonus(s)~ au lieu de ~AddBonus(ref s)~ : erreur de compilation CS1620.`],[`Modifier un paramètre struct en pensant modifier l'original`,`La méthode reçoit une copie. Renvoie la nouvelle valeur ou utilise ~ref~.`],[`Une méthode « couteau suisse »`,`Si son nom contient « And » ou « Handle » sans précision, elle fait sans doute trop de choses.`],[`Une liste de booléens à l'appel`,`~Spawn(e, true, false, true)~ est illisible : arguments nommés ou enum.`]],
res:[`Une méthode = une action, nommée par un verbe ; une question, nommée comme une question.`,`Par défaut, les paramètres sont copiés.`,`~ref~ modifie la variable de l'appelant, ~out~ oblige la méthode à la remplir, ~in~ évite la copie en lecture seule.`,`Valeurs par défaut et arguments nommés rendent les appels lisibles.`,`Tuples ou struct pour renvoyer plusieurs valeurs.`],
quiz:[
[`Que fait ~void F(int x) { x = 5; }~ sur la variable passée ?`,[`Elle vaut 5`,`Rien : x est une copie`,`Erreur de compilation`,`Elle vaut 0`],1,`Les paramètres sont passés par valeur par défaut.`],
[`Quelle est la différence entre ref et out ?`,[`Aucune`,`out oblige la méthode à affecter la variable`,`ref est en lecture seule`,`out ne marche qu'avec les classes`],1,`Avec out, la méthode doit écrire la variable avant de sortir ; avec ref, elle peut la lire et la modifier.`],
[`Quel appel est valide pour ~void S(float a = 1f, float b = 2f)~ ?`,[`S(b: 3f)`,`S(, 3f)`,`S(b = 3f)`,`S(3f, 4f, 5f)`],0,`Un argument nommé permet de sauter les paramètres optionnels précédents.`],
[`Pourquoi préférer ~TryGetValue~ à ~dict[key]~ ?`,[`C'est plus court`,`Il ne lève pas d'exception si la clé manque`,`Il trie le dictionnaire`,`Il est obligatoire en C#`],1,`Le motif TryXxx renvoie false au lieu de lever une exception.`]],
src:[[`Microsoft Learn : méthodes en C#`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/methods`],[`Microsoft Learn : paramètres de méthode (ref, out, in, params)`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/method-parameters`]]},

'chaines-texte':{
lead:`Le texte est partout dans un jeu : interface, dialogues, sauvegardes, journaux de débogage, noms d'assets dans les outils. En C#, le type ~string~ a des propriétés particulières (immuable, comparé par contenu, sensible à la culture du système) qui expliquent des bugs surprenants et des problèmes de performance. Ce cours fait le tour du sujet.`,
ch:[
['Une string est immuable',
`Une ~string~ est une suite de caractères. Contrairement à la plupart des objets, elle est **immuable** : une fois créée, elle ne change plus jamais. Toute « modification » crée une nouvelle chaîne.`,
{c:`string s = "Score";
s += " : 10";            // crée une NOUVELLE chaîne "Score : 10"
string upper = s.ToUpper(); // nouvelle chaîne aussi ; s n'a pas changé`},
`Conséquence : concaténer dans une boucle crée autant de chaînes intermédiaires que de tours. Pour 5 morceaux, c'est négligeable ; pour un rapport de 10 000 lignes construit avec ~+=~, c'est des mégaoctets de déchets. Et dans ~Update~, chaque image, cela alimente le ramasse-miettes (voir [[allocations-gc]]).`,
`Bien que ~string~ soit un type référence, ~==~ compare le **contenu** : ~"abc" == "ab" + "c"~ vaut true. C'est une exception voulue par le langage.`],
['Construire du texte : interpolation et format',
`L'**interpolation** (~$"..."~) insère des valeurs directement dans le texte, entre accolades. C'est la manière la plus lisible de construire une chaîne.`,
{c:`string msg = $"{playerName} a {gold} pièces";
string hp = $"Vie : {current}/{max}";
string pos = $"Position : {transform.position}";`},
`Après deux-points, on ajoute un **format** :`,
{tab:[['Écriture','Résultat pour 1234.5678','Usage'],['~{x:0.00}~','1234,57','deux décimales'],['~{x:0}~','1235','arrondi à l\'entier'],['~{x:N0}~','1 235','séparateur de milliers'],['~{x:P0}~ (avec x = 0.42)','42 %','pourcentage'],['~{x:000}~ (avec x = 7)','007','zéros devant'],['~{x,8}~','   1234,5678','aligné à droite sur 8 caractères']]},
{c:`float time = 83.456f;
int m = (int)(time / 60);
float sec = time % 60;
string chrono = $"{m:00}:{sec:00.00}";   // "01:23,46" sur un PC français`}],
['StringBuilder pour les longs textes',
`~StringBuilder~ est un tampon de texte **modifiable**. On y ajoute des morceaux sans créer de chaîne intermédiaire, puis on produit la chaîne finale une seule fois avec ~ToString()~.`,
{c:`var sb = new StringBuilder();
sb.AppendLine("Rapport de validation");
sb.AppendLine("---------------------");
foreach (string error in errors)
    sb.Append("- ").AppendLine(error);
sb.Append($"{errors.Count} erreur(s)");
Debug.Log(sb.ToString());`},
`On le réserve aux textes construits en plusieurs étapes : rapports d'outils, journaux, export CSV. Pour une phrase simple, l'interpolation reste plus lisible. On peut réutiliser un même ~StringBuilder~ avec ~sb.Clear()~ pour ne pas en recréer un à chaque fois.`],
['Comparer et chercher',
`Comparer des chaînes demande de décider si la **casse** compte (A et a) et si l'on suit les règles d'une **langue**. Pour du texte technique (identifiants, noms de fichiers, commandes), on compare en mode « ordinal », caractère par caractère.`,
{c:`bool same = string.Equals(a, b, StringComparison.OrdinalIgnoreCase);
bool isPrefab = path.EndsWith(".prefab", StringComparison.OrdinalIgnoreCase);
int i = name.IndexOf("Boss", StringComparison.Ordinal);

// Vide ou null en un seul test
if (string.IsNullOrEmpty(input)) return;
if (string.IsNullOrWhiteSpace(input)) return;   // espaces seuls aussi`},
{w:`Évite ~a.ToLower() == b.ToLower()~ : cela crée deux nouvelles chaînes et dépend de la langue du système. En turc, la majuscule de « i » est « İ » : une comparaison qui marche chez toi peut échouer chez un joueur turc. ~StringComparison.OrdinalIgnoreCase~ n'a pas ce problème.`},
`Les méthodes utiles : ~Split~ (découper), ~Trim~ (retirer les espaces aux bords), ~Replace~, ~Substring~, ~Contains~, ~StartsWith~, ~string.Join~ (assembler une liste avec un séparateur).`,
{c:`string line = "épée;12;0.8";
string[] parts = line.Split(';');
string name = parts[0].Trim();
string list = string.Join(", ", inventory);   // "épée, bouclier, potion"`}],
['Culture : les virgules qui cassent les sauvegardes',
`La conversion des nombres en texte dépend de la **culture** du système. Sur un PC français, ~1.5f.ToString()~ donne « 1,5 » ; sur un PC américain, « 1.5 ». Si un fichier de sauvegarde est écrit en France et relu aux États-Unis, ~float.Parse~ échoue ou lit une mauvaise valeur.`,
{c:`using System.Globalization;

// Pour les DONNÉES (fichiers, réseau) : culture invariante
string saved = speed.ToString(CultureInfo.InvariantCulture);           // "1.5"
float loaded = float.Parse(saved, CultureInfo.InvariantCulture);

// Pour l'AFFICHAGE : culture du joueur (comportement par défaut)
label.text = $"{speed:0.0} m/s";`},
`Règle : **culture invariante pour les données, culture du joueur pour l'affichage**. ~JsonUtility~ utilise déjà le point. Les problèmes viennent surtout des formats maison (CSV, fichiers texte).`,
{n:`Pour un jeu traduit, n'assemble pas de phrases par concaténation (~"Tu as " + n + " vies"~) : l'ordre des mots change d'une langue à l'autre, et les pluriels aussi. Le paquet Localization de Unity gère des tables de traduction avec variables et pluriels.`}],
['Le texte dans l\'interface Unity',
`Les textes à l'écran utilisent ~TMP_Text~ (TextMeshPro). Affecter ~label.text = $"Score : {score}";~ chaque image crée une nouvelle chaîne à chaque image. Deux bonnes pratiques :`,
{l:[`Ne mettre à jour le texte **que si la valeur change** (garder la dernière valeur affichée).`,`Utiliser ~SetText~ de TextMeshPro, qui formate des nombres sans créer de chaîne.`]},
{c:`private int shownScore = -1;

void Update()
{
    if (score == shownScore) return;
    shownScore = score;
    scoreLabel.SetText("Score : {0}", score);   // pas d'allocation
}`},
{u:`~Debug.Log~ est coûteux : il construit une chaîne et récupère la pile d'appels. Ne laisse pas de ~Debug.Log~ dans ~Update~ d'un build : retire-les ou entoure-les d'une condition de compilation (~#if UNITY_EDITOR~ ou ~[Conditional("DEBUG")]~).`}]
],
err:[[`Concaténer dans une boucle`,`Utilise ~StringBuilder~ pour les longs textes.`],[`Sauvegarder des nombres avec la culture du système`,`« 1,5 » ne se relit pas en « 1.5 ». ~CultureInfo.InvariantCulture~ pour les données.`],[`Comparer avec ToLower`,`Allocation et piège des langues. ~StringComparison.OrdinalIgnoreCase~.`],[`Mettre à jour un texte d'UI à chaque image`,`Ne le fais que si la valeur change, avec ~SetText~.`]],
res:[`Une ~string~ est immuable : chaque modification crée une nouvelle chaîne.`,`Interpolation ~$"..."~ et formats (~:0.00~, ~:N0~, ~:P0~) pour construire du texte.`,`~StringBuilder~ pour les textes construits en plusieurs étapes.`,`Comparaisons en ~Ordinal~ pour le texte technique.`,`Culture invariante pour les données, culture du joueur pour l'affichage.`],
quiz:[
[`Que fait ~s.ToUpper();~ seul sur une ligne ?`,[`Met s en majuscules`,`Rien d'utile : le résultat est perdu`,`Erreur de compilation`,`Lève une exception`],1,`Les chaînes sont immuables : ToUpper renvoie une nouvelle chaîne qu'il faut récupérer.`],
[`Que donne ~$"{0.256:P0}"~ ?`,[`0,256`,`26 %`,`25,6 %`,`P0`],1,`P0 multiplie par 100 et affiche un pourcentage sans décimale.`],
[`Pour enregistrer un float dans un fichier relu sur d'autres PC, on utilise :`,[`ToString()`,`ToString(CultureInfo.InvariantCulture)`,`$"{x}"`,`x + ""`],1,`La culture invariante utilise toujours le point décimal.`],
[`Quelle comparaison ignore la casse sans allocation ?`,[`a.ToLower() == b.ToLower()`,`string.Equals(a, b, StringComparison.OrdinalIgnoreCase)`,`a == b`,`a.CompareTo(b) == 0`],1,`Elle compare directement sans créer de nouvelles chaînes.`]],
src:[[`Microsoft Learn : chaînes et littéraux de chaîne`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/strings/`],[`Microsoft Learn : interpolation de chaînes`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/tokens/interpolated`],[`Microsoft Learn : bonnes pratiques de comparaison de chaînes`,`https://learn.microsoft.com/fr-fr/dotnet/standard/base-types/best-practices-strings`]]},

'enums-switch':{
lead:`Un ~enum~ donne des noms à un ensemble fermé de valeurs : les états d'un ennemi, les raretés d'objets, les directions. Associé à ~switch~, il rend le code plus sûr et plus lisible que des chaînes ou des nombres magiques. Ce cours couvre la déclaration, la sérialisation par Unity (avec son piège majeur), l'expression switch moderne et les limites des enums.`,
ch:[
['Déclarer et utiliser un enum',
`Un enum se déclare avec le mot-clé ~enum~ et une liste de noms. On l'utilise ensuite comme un type.`,
{c:`public enum EnemyState { Idle, Patrol, Chase, Attack, Dead }

public class Enemy : MonoBehaviour
{
    [SerializeField] private EnemyState state = EnemyState.Idle;

    public bool IsHostile => state == EnemyState.Chase || state == EnemyState.Attack;
}`},
`Par rapport à une chaîne (~"chase"~), l'enum est **vérifié par le compilateur** : une faute de frappe (~EnemyState.Chace~) ne compile pas, et l'éditeur de code propose la liste des valeurs. Par rapport à un nombre (~state == 2~), il dit ce qu'il signifie.`,
{u:`Un champ de type enum s'affiche dans l'inspecteur sous forme de **menu déroulant**. C'est une manière simple de donner des choix clairs aux designers.`}],
['Ce qu\'est vraiment un enum',
`Sous le capot, un enum est un **entier**. Par défaut, la première valeur vaut 0, la suivante 1, etc. On peut fixer les valeurs soi-même et convertir dans les deux sens.`,
{c:`public enum Rarity { Common = 0, Rare = 10, Epic = 20, Legendary = 30 }

int n = (int)Rarity.Epic;          // 20
Rarity r = (Rarity)10;             // Rarity.Rare
Rarity bad = (Rarity)999;          // compile ! mais ne correspond à aucun nom
bool valid = Enum.IsDefined(typeof(Rarity), 999);   // false`},
`~ToString()~ donne le nom (« Epic ») et ~Enum.Parse~ ou ~Enum.TryParse~ font l'inverse. ~Enum.GetValues~ liste toutes les valeurs, pratique pour remplir un menu.`,
{c:`foreach (Rarity value in Enum.GetValues(typeof(Rarity)))
    dropdown.options.Add(new TMP_Dropdown.OptionData(value.ToString()));`}],
['Le piège de la sérialisation Unity',
`Unity enregistre un champ enum par sa **valeur numérique**, pas par son nom. Imagine cet enum, utilisé par 200 prefabs d'ennemis :`,
{c:`public enum Element { Fire, Water, Earth }      // Fire=0, Water=1, Earth=2

// Un designer demande Ice. Tu l'insères "logiquement" après Water :
public enum Element { Fire, Water, Ice, Earth }  // Ice=2, Earth=3 !`},
`Tous les ennemis de type Earth (enregistrés avec 2) deviennent **Ice**, sans aucune erreur. Le bug est découvert des semaines plus tard. Deux protections :`,
{l:[`**Toujours ajouter à la fin** de la liste.`,`Mieux : **donner des valeurs explicites** dès le départ (~Fire = 0, Water = 1, Earth = 2, Ice = 3~). L'ordre d'écriture n'a alors plus d'importance.`]},
{w:`Même règle pour **supprimer** une valeur : les assets qui l'utilisaient garderont un nombre qui ne correspond plus à rien. Renomme-la plutôt en ~Obsolete~ et nettoie les assets avant de la retirer.`}],
['switch classique et expression switch',
`Le ~switch~ classique exécute du code selon la valeur. L'**expression switch** (C# 8) renvoie directement une valeur : c'est idéal pour associer chaque cas à un résultat.`,
{c:`// Instruction switch : exécuter du code
switch (state)
{
    case EnemyState.Patrol: Patrol(); break;
    case EnemyState.Chase:  Chase();  break;
    case EnemyState.Attack: Attack(); break;
}

// Expression switch : produire une valeur
Color RarityColor(Rarity r) => r switch
{
    Rarity.Common    => Color.white,
    Rarity.Rare      => new Color(0.3f, 0.5f, 1f),
    Rarity.Epic      => new Color(0.7f, 0.3f, 1f),
    Rarity.Legendary => new Color(1f, 0.6f, 0.1f),
    _ => throw new ArgumentOutOfRangeException(nameof(r), r, null),
};`},
`Le cas ~_~ attrape tout le reste. Y lever une exception est une bonne habitude : si quelqu'un ajoute une valeur à l'enum sans la traiter, l'erreur apparaît immédiatement au lieu d'un comportement silencieux. Le compilateur avertit d'ailleurs quand une expression switch n'est pas exhaustive.`],
['Quand un enum ne suffit plus',
`Un enum est parfait pour des cas **fixés par le code** : les états d'un bouton, les directions, les modes d'une caméra. Il devient un frein quand :`,
{l:[`les designers veulent **ajouter des cas eux-mêmes** (chaque nouvelle rareté demande un programmeur et une recompilation) ;`,`chaque cas porte **beaucoup de données** (couleur, son, multiplicateur, icône) : on se retrouve avec des ~switch~ identiques dans 10 fichiers ;`,`chaque cas a un **comportement** différent (un ~switch~ dans chaque méthode).`]},
`Les alternatives : un [[scriptableobjects|ScriptableObject]] par cas (données éditables dans l'inspecteur), le pattern [[strategy]] (comportements interchangeables), ou une [[machine-etats]] (états avec Enter, Tick, Exit).`,
`Enfin, quand plusieurs valeurs peuvent être vraies **en même temps** (empoisonné et en feu), on utilise un enum ~[Flags]~ dont les valeurs sont des puissances de deux : voir [[operations-bits]].`]
],
err:[[`Insérer une valeur au milieu`,`Les assets existants changent de sens. Ajoute à la fin, ou donne des valeurs explicites.`],[`Un switch sans cas par défaut`,`Une nouvelle valeur passe inaperçue. Lève une exception dans ~_~.`],[`Le même switch copié partout`,`Signe qu'il faut des données par cas (ScriptableObject) ou un comportement par cas (Strategy).`],[`Caster un nombre quelconque`,`~(Rarity)999~ compile. Vérifie avec ~Enum.IsDefined~ les valeurs venues de l'extérieur.`]],
res:[`Un enum nomme un ensemble fermé de valeurs, vérifié par le compilateur.`,`C'est un entier : Unity l'enregistre par sa valeur numérique.`,`Ajouter à la fin ou fixer les valeurs explicitement.`,`L'expression switch associe chaque cas à un résultat ; lever une exception dans ~_~.`,`Données ou comportements par cas : ScriptableObject ou Strategy.`],
quiz:[
[`Avec ~enum E { A, B, C }~, que vaut ~(int)E.C~ ?`,[`1`,`2`,`3`,`"C"`],1,`Les valeurs commencent à 0 par défaut.`],
[`On insère D entre A et B dans un enum utilisé par des prefabs. Que se passe-t-il ?`,[`Rien`,`Unity renomme automatiquement`,`Les prefabs qui avaient B ont maintenant D`,`Erreur de compilation`],2,`Unity enregistre la valeur numérique ; B valait 1, c'est maintenant D qui vaut 1.`],
[`À quoi sert ~_~ dans une expression switch ?`,[`À ignorer le résultat`,`À traiter tous les cas non listés`,`À déclarer une variable`,`À rien`],1,`C'est le motif par défaut, comme default dans un switch classique.`],
[`Les designers veulent ajouter souvent de nouvelles raretés avec couleur et son. Que choisir ?`,[`Un enum`,`Un ScriptableObject par rareté`,`Des chaînes`,`Des constantes int`],1,`Les ScriptableObjects s'ajoutent sans programmeur et portent leurs propres données.`]],
src:[[`Microsoft Learn : types énumération`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/enum`],[`Microsoft Learn : expression switch`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/switch-expression`],[`Documentation Unity : sérialisation des scripts`,`https://docs.unity3d.com/Manual/script-serialization.html`]]},

'collections':{
lead:`Un jeu manipule sans cesse des groupes d'objets : ennemis vivants, objets de l'inventaire, cases visitées, joueurs connectés. Choisir la bonne collection change à la fois la lisibilité et les performances. Ce cours présente les tableaux, ~List~, ~Dictionary~, ~HashSet~, ~Queue~ et ~Stack~, explique comment ils fonctionnent à l'intérieur et quand utiliser chacun.`,
ch:[
['Les tableaux',
`Un **tableau** (~T[]~) est une suite d'éléments de même type, de **taille fixe**, rangés côte à côte en mémoire. L'accès par indice est instantané. Unity en renvoie beaucoup (~GetComponentsInChildren~, ~Physics.OverlapSphere~).`,
{c:`Transform[] waypoints = new Transform[4];   // 4 cases, toutes null
int[] scores = { 120, 80, 300 };             // initialisé directement
int first = scores[0];                       // 120
int last = scores[scores.Length - 1];        // 300 (ou scores[^1])
int[,] grid = new int[10, 10];               // tableau 2D
grid[3, 4] = 1;`},
`Le premier indice est **0** et le dernier ~Length - 1~. Lire ~scores[3]~ dans un tableau de 3 lève une ~IndexOutOfRangeException~. Les tableaux sont parfaits pour des données de taille connue : une grille, un tampon d'échantillons, des points de passage réglés dans l'inspecteur.`],
['List<T> : le tableau qui grandit',
`~List<T>~ est la collection la plus utilisée. Elle s'utilise comme un tableau mais peut grandir et rétrécir. Le ~T~ entre chevrons est le type des éléments (voir [[generiques]]).`,
{c:`var enemies = new List<Enemy>();
enemies.Add(goblin);                 // ajoute à la fin
enemies.Insert(0, boss);             // insère au début (coûteux : décale tout)
enemies.Remove(goblin);              // retire la première occurrence
enemies.RemoveAt(0);                 // retire par indice
bool has = enemies.Contains(orc);    // parcourt toute la liste
int count = enemies.Count;           // Count, pas Length
enemies.Clear();                     // vide, garde la capacité`},
`À l'intérieur, une ~List~ est un tableau plus grand que nécessaire. Quand il est plein, elle en crée un **deux fois plus grand** et recopie tout. L'ajout est donc rapide en moyenne, avec un pic ponctuel. Si tu connais la taille finale, ~new List<Enemy>(500)~ réserve la place d'emblée.`,
{tab:[['Opération','Coût','Remarque'],['~list[i]~','constant','accès direct'],['~Add~','constant en moyenne','pic quand la capacité double'],['~Insert(0, x)~, ~RemoveAt(0)~','proportionnel à la taille','décale tous les éléments'],['~Contains~, ~IndexOf~, ~Remove(x)~','proportionnel à la taille','parcourt la liste']]}],
['Dictionary<TKey, TValue> : retrouver par clé',
`Un **dictionnaire** associe des clés uniques à des valeurs : un identifiant d'objet à sa définition, un nom de joueur à son score, une case à son contenu. Retrouver une valeur par sa clé prend un temps **constant**, quelle que soit la taille.`,
{c:`var prices = new Dictionary<string, int>
{
    ["épée"] = 120,
    ["bouclier"] = 80,
};
prices["potion"] = 15;              // ajoute ou remplace
prices.Add("arc", 90);              // ajoute ; exception si la clé existe déjà

if (prices.TryGetValue("épée", out int p))   // la façon sûre de lire
    Debug.Log(p);

int bad = prices["hache"];          // KeyNotFoundException !

foreach (var pair in prices)
    Debug.Log($"{pair.Key} : {pair.Value}");`},
`Le secret de sa vitesse est le **hachage** : pour chaque clé, le dictionnaire calcule un nombre (~GetHashCode()~) qui indique directement dans quel « seau » la ranger. Chercher, c'est calculer ce nombre et regarder un seul seau. Deux conséquences : une clé ne doit **jamais changer** une fois dans le dictionnaire, et l'ordre de parcours n'est **pas garanti**.`,
{u:`Unity ne sait pas sérialiser un ~Dictionary~ : il n'apparaît pas dans l'inspecteur et n'est pas sauvegardé dans les assets. On stocke une liste dans l'inspecteur et on construit le dictionnaire au démarrage. Voir [[serialisation]].`}],
['HashSet<T> : appartenance et unicité',
`Un ~HashSet~ est un ensemble **sans doublons**, sans ordre, qui répond instantanément à la question « cet élément est-il dedans ? ». C'est un dictionnaire sans valeurs.`,
{c:`var visited = new HashSet<Vector2Int>();
if (visited.Add(cell))          // Add renvoie false si déjà présent
    Explore(cell);

var hitThisSwing = new HashSet<Enemy>();
foreach (Collider c in Physics.OverlapSphere(blade.position, 1f))
{
    if (c.TryGetComponent(out Enemy e) && hitThisSwing.Add(e))
        e.TakeDamage(damage);   // un ennemi à plusieurs colliders n'est touché qu'une fois
}`},
`Il offre aussi les opérations d'ensemble : ~UnionWith~, ~IntersectWith~, ~ExceptWith~. Utile pour comparer deux listes d'identifiants (objets débloqués avant et après une mise à jour, par exemple).`],
['Queue<T> et Stack<T>',
`Une **file** (~Queue~) sort les éléments dans l'ordre d'arrivée : premier entré, premier sorti. Une **pile** (~Stack~) sort le dernier arrivé en premier. Ajout et retrait sont instantanés dans les deux cas.`,
{c:`var messages = new Queue<string>();
messages.Enqueue("Niveau terminé");
messages.Enqueue("Succès débloqué");
string next = messages.Dequeue();          // "Niveau terminé"

var openMenus = new Stack<GameObject>();
openMenus.Push(optionsMenu);
openMenus.Push(audioMenu);
GameObject top = openMenus.Pop();          // audioMenu : Échap ferme le dernier ouvert`},
`Le cours [[pile-file]] montre leurs usages en détail : historique d'annulation, file d'actions, parcours de grille.`],
['Choisir, réutiliser, exposer',
`Pour choisir, pose-toi la question de l'**opération la plus fréquente** :`,
{tab:[['Besoin','Collection'],['Taille fixe, accès par indice','tableau ~T[]~'],['Suite qui grandit, parcours dans l\'ordre','~List<T>~'],['Retrouver par une clé','~Dictionary<K, V>~'],['Savoir si un élément est présent, sans doublon','~HashSet<T>~'],['Traiter dans l\'ordre d\'arrivée','~Queue<T>~'],['Traiter le dernier ajouté d\'abord','~Stack<T>~']]},
`En jeu, **réutilise** tes collections : créer une nouvelle ~List~ à chaque image produit des déchets pour le ramasse-miettes. Garde-la en champ et appelle ~Clear()~, qui conserve la capacité.`,
{c:`private readonly List<Enemy> nearby = new List<Enemy>();

void Update()
{
    nearby.Clear();                 // pas de new : zéro allocation
    FindNearby(transform.position, 10f, nearby);
}`},
`Enfin, pour **exposer** une collection sans permettre aux autres classes de la modifier, renvoie une interface en lecture seule : ~public IReadOnlyList<Item> Items => items;~. L'appelant peut lire et parcourir, pas ajouter ni retirer.`]
],
err:[[`Lire un Dictionary avec [] sans vérifier`,`~KeyNotFoundException~. Utilise ~TryGetValue~.`],[`List.Contains dans une boucle`,`Chaque appel parcourt la liste : O(n²) au total. Un ~HashSet~ répond en temps constant.`],[`Confondre Length et Count`,`~Length~ pour les tableaux, ~Count~ pour les collections.`],[`Une nouvelle List à chaque image`,`Garde-la en champ et ~Clear()~.`]],
res:[`Tableau : taille fixe. List : grandit. Dictionary : par clé. HashSet : appartenance. Queue et Stack : ordre de traitement.`,`Le hachage donne un accès en temps constant aux Dictionary et HashSet.`,`~TryGetValue~ plutôt que l'indexeur.`,`Réutiliser les collections avec ~Clear()~ en jeu.`,`~IReadOnlyList~ pour exposer sans permettre la modification.`],
quiz:[
[`Quelle collection pour savoir rapidement si une case a déjà été visitée ?`,[`List<Vector2Int>`,`HashSet<Vector2Int>`,`Queue<Vector2Int>`,`Vector2Int[]`],1,`Contains d'un HashSet est en temps constant, celui d'une List parcourt tout.`],
[`Que fait ~dict["x"]~ si la clé x n'existe pas ?`,[`Renvoie null`,`Renvoie 0`,`Lève KeyNotFoundException`,`Ajoute la clé`],2,`La lecture par indexeur lève une exception ; l'écriture, elle, ajoute la clé.`],
[`Pourquoi ~list.Insert(0, x)~ est-il lent sur une grande liste ?`,[`Il trie la liste`,`Il décale tous les éléments d'un cran`,`Il recrée la liste`,`Il n'est pas lent`],1,`Insérer au début oblige à décaler tous les éléments suivants.`],
[`Comment éviter une allocation par image avec une liste de travail ?`,[`new List chaque image`,`La garder en champ et appeler Clear()`,`Utiliser un tableau de taille 1000`,`Utiliser LINQ`],1,`Clear vide la liste sans libérer sa capacité.`]],
src:[[`Microsoft Learn : collections et structures de données`,`https://learn.microsoft.com/fr-fr/dotnet/standard/collections/`],[`Microsoft Learn : sélection d'une classe de collection`,`https://learn.microsoft.com/fr-fr/dotnet/standard/collections/selecting-a-collection-class`],[`Documentation Unity : sérialisation des scripts`,`https://docs.unity3d.com/Manual/script-serialization.html`]]},

'proprietes':{
lead:`Une propriété ressemble à un champ quand on l'utilise (~player.Health~) mais exécute du code quand on la lit ou qu'on l'écrit. C'est l'outil principal pour exposer des données tout en gardant le contrôle : valider une valeur, la calculer à la demande, prévenir quand elle change. Ce cours couvre toutes les formes de propriétés et leur relation particulière avec l'inspecteur de Unity.`,
ch:[
['Champs et propriétés',
`Un **champ** est une variable de la classe. Le rendre ~public~ permet à n'importe quel code de le lire et de le modifier, sans aucun contrôle.`,
{c:`public class Wallet
{
    public int gold;     // n'importe qui peut écrire wallet.gold = -500;
}`},
`Une **propriété** expose la valeur à travers deux accesseurs : ~get~ (lecture) et ~set~ (écriture). Dans ~set~, le mot-clé ~value~ désigne la valeur qu'on essaie d'affecter.`,
{c:`public class Wallet
{
    private int gold;                 // le champ, caché

    public int Gold                   // la propriété, publique
    {
        get { return gold; }
        set { gold = Mathf.Max(0, value); }   // jamais négatif
    }
}

wallet.Gold = -500;   // gold vaut 0
int g = wallet.Gold;  // appelle get`},
`Pour l'appelant, rien ne change : il écrit ~wallet.Gold~ comme pour un champ. Mais la règle « jamais négatif » est garantie en un seul endroit.`],
['Les formes courtes',
`Quand aucune logique n'est nécessaire, la **propriété automatique** crée le champ caché pour toi. On combine souvent une lecture publique et une écriture privée.`,
{c:`public int Score { get; private set; }          // tout le monde lit, seule la classe écrit
public string PlayerName { get; set; } = "Invité"; // avec valeur initiale
public float MaxSpeed { get; }                    // lecture seule, fixée dans le constructeur`},
`Une **propriété calculée** n'a pas de champ : elle calcule sa valeur à chaque lecture, avec la syntaxe ~=>~.`,
{c:`public float HealthRatio => (float)current / max;
public bool IsDead => current <= 0;
public Vector3 Forward2D => new Vector3(transform.forward.x, 0f, transform.forward.z).normalized;`},
`Enfin, ~init~ (C# 9) permet d'affecter une propriété uniquement à la création de l'objet, ce qui rend l'objet **immuable** ensuite.`,
{c:`public class DamageInfo
{
    public int Amount { get; init; }
    public GameObject Source { get; init; }
}

var info = new DamageInfo { Amount = 10, Source = gameObject };
info.Amount = 20;   // erreur : init ne permet l'écriture qu'à la création`}],
['Propriétés et inspecteur Unity',
`Unity ne sérialise que des **champs**, jamais des propriétés : une propriété n'apparaît pas dans l'inspecteur et n'est pas enregistrée. Le motif standard d'un MonoBehaviour combine donc un champ privé sérialisé et une propriété publique.`,
{c:`public class Jumper : MonoBehaviour
{
    [SerializeField, Min(0f)] private float jumpHeight = 2f;   // réglable dans l'inspecteur

    public float JumpHeight => jumpHeight;                     // lisible par le code, pas modifiable
}`},
`Pour une propriété automatique, l'attribut ~[field: SerializeField]~ demande à Unity de sérialiser le champ caché généré par le compilateur.`,
{c:`[field: SerializeField] public float MoveSpeed { get; private set; } = 5f;`},
{w:`Le nom affiché dans l'inspecteur et le nom enregistré dans les assets sont alors ceux du champ caché (« <MoveSpeed>k__BackingField »). Renommer la propriété plus tard fait perdre les valeurs, sauf avec ~[field: FormerlySerializedAs(...)]~. Beaucoup d'équipes préfèrent donc le motif explicite champ + propriété.`}],
['Réagir aux changements',
`Le ~set~ est l'endroit idéal pour prévenir les autres systèmes qu'une valeur a changé. On compare l'ancienne et la nouvelle valeur pour ne déclencher l'événement qu'en cas de vrai changement.`,
{c:`public event Action<int> HealthChanged;

private int health;
public int Health
{
    get => health;
    set
    {
        int clamped = Mathf.Clamp(value, 0, maxHealth);
        if (clamped == health) return;      // rien n'a changé
        health = clamped;
        HealthChanged?.Invoke(health);       // la barre de vie, le son, etc. réagissent
    }
}`},
`C'est la base du découplage entre les données et l'affichage, développé dans [[delegues-evenements]] et [[separation-donnees-vue]].`],
['Propriété ou méthode ?',
`Une propriété doit se comporter **comme un champ** : rapide, sans effet de bord, et deux lectures consécutives donnent la même chose. Si l'accès fait un travail notable, une méthode l'annonce mieux.`,
{tab:[['Situation','Choix'],['Lire une valeur stockée ou un calcul simple','propriété'],['Une recherche dans la scène, un chargement, un calcul lourd','méthode (~FindTarget()~)'],['Un résultat qui change à chaque appel (aléatoire)','méthode (~RollDamage()~)'],['Une action avec effet visible','méthode']]},
{u:`Certaines propriétés de Unity cachent un coût : ~renderer.material~ **crée une copie** du matériau au premier accès ; ~GetComponent~ derrière une propriété fait une recherche. Voir [[cache-references]].`}]
],
err:[[`Un champ public modifié de partout`,`Les règles de la classe ne sont plus garanties. Champ privé + propriété.`],[`S'attendre à voir une propriété dans l'inspecteur`,`Unity ne sérialise que les champs : ~[SerializeField]~ ou ~[field: SerializeField]~.`],[`Une propriété qui s'appelle elle-même`,`~public int Hp { get => Hp; }~ boucle à l'infini (StackOverflowException). Utilise le champ (~hp~).`],[`Un calcul coûteux caché dans un get`,`Mets en cache ou transforme-le en méthode.`]],
res:[`Une propriété expose une valeur à travers get et set, avec du code de contrôle.`,`~{ get; private set; }~ : lecture publique, écriture interne.`,`Propriété calculée avec ~=>~, immuable avec ~init~.`,`Unity sérialise les champs : champ privé ~[SerializeField]~ + propriété publique.`,`Le set est l'endroit pour valider et déclencher un événement de changement.`],
quiz:[
[`Que désigne ~value~ dans un set ?`,[`L'ancienne valeur`,`La valeur qu'on essaie d'affecter`,`Le champ caché`,`Un mot-clé sans usage`],1,`value est la valeur à droite du = lors de l'affectation.`],
[`Pourquoi une propriété auto n'apparaît-elle pas dans l'inspecteur ?`,[`Elle est privée`,`Unity ne sérialise que les champs`,`Il manque public`,`Les propriétés sont lentes`],1,`Il faut [field: SerializeField] pour sérialiser son champ caché.`],
[`Que se passe-t-il avec ~public int Hp { get => Hp; }~ ?`,[`Renvoie 0`,`Boucle infinie et StackOverflowException`,`Erreur de compilation`,`Renvoie le champ`],1,`Le get s'appelle lui-même indéfiniment.`],
[`Quand préférer une méthode à une propriété ?`,[`Pour une valeur stockée`,`Pour un calcul lourd ou un résultat qui change à chaque appel`,`Jamais`,`Pour une valeur booléenne`],1,`Une propriété doit être rapide et stable.`]],
src:[[`Microsoft Learn : propriétés`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/properties`],[`Microsoft Learn : propriétés implémentées automatiquement`,`https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/auto-implemented-properties`],[`Documentation Unity : sérialisation des scripts`,`https://docs.unity3d.com/Manual/script-serialization.html`]]}
});

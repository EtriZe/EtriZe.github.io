window.EXTRA=Object.assign(window.EXTRA||{},{
'complexite':{
r:[`Le grand O décrit comment le travail grandit avec n.`,`O(1) dictionnaire, O(log n) recherche binaire, O(n) parcours, O(n²) double boucle.`,`Mesurer avant d'optimiser ; pour 10 éléments, le plus lisible gagne.`],
m:[
['Les constantes comptent aussi',`Le grand O ignore les constantes : un algorithme O(n) qui fait 100 opérations par élément peut être plus lent qu'un O(n log n) qui en fait 2, pour les tailles réelles du jeu. Un parcours de tableau contigu est aussi bien plus rapide qu'un parcours de liste chaînée de même complexité, à cause du cache du processeur. La complexité guide le choix, le profiler tranche.`],
['La mémoire',`On parle aussi de complexité en **espace**. Le [[bfs-grille|BFS]] garde chaque case visitée : O(n) en mémoire. Un cache échange de la mémoire contre du temps. Sur console ou mobile, la mémoire est souvent la ressource la plus rare.`],
['Coût amorti',`~List.Add~ est O(1) « en moyenne » : la plupart des ajouts sont instantanés, mais de temps en temps la liste double sa capacité et recopie tout (O(n)). Sur un grand nombre d'ajouts, le coût moyen reste constant. En jeu, ce pic ponctuel peut quand même causer une saccade : réserver la capacité à l'avance l'évite.`]],
d:[[`Pour chacune de ces opérations, donne la complexité : trouver le maximum d'une liste, vérifier si une liste triée contient une valeur, trouver les paires d'ennemis à moins de 2 m, retirer le premier élément d'une ~List~, retirer le premier d'une ~Queue~.`,`Retirer le premier d'une List décale tous les autres.`],
[`Mesure avec un Stopwatch ~List.Contains~ contre ~HashSet.Contains~ pour 10, 1 000 et 100 000 éléments. À partir de quelle taille la différence devient-elle visible ?`,`Répète la recherche 10 000 fois pour avoir un temps mesurable.`]]},

'pile-file':{
r:[`Pile (Stack) : dernier entré, premier sorti.`,`File (Queue) : premier entré, premier sorti.`,`Toutes les opérations en temps constant ; ~TryPop~ et ~TryDequeue~ évitent l'exception.`],
m:[
['Sous le capot',`Une ~Stack~ est un tableau qu'on remplit par la fin. Une ~Queue~ est un **tampon circulaire** : deux indices (début et fin) qui avancent et reviennent au début du tableau, ce qui évite de décaler les éléments. C'est le même principe que le tableau d'échantillons de [[profiler-markers]].`],
['File à priorité',`Quand l'ordre dépend d'une importance et pas de l'arrivée (l'action la plus urgente, la case la plus prometteuse d'[[astar]]), on utilise une file à priorité : ~PriorityQueue<TElement, TPriority>~. En interne, c'est un tas binaire : ajout et retrait en O(log n).`],
['Deque',`Pour ajouter et retirer aux deux bouts (un historique limité dont on oublie les plus anciens), ~LinkedList<T>~ fait l'affaire, ou un tampon circulaire écrit à la main pour éviter les allocations.`]],
d:[[`Écris un tampon circulaire générique ~RingBuffer<T>~ de capacité fixe, avec ~Push~ (écrase le plus ancien quand c'est plein), un indexeur du plus ancien au plus récent, et ~Count~.`,`Un tableau, un indice de début et un compteur ; l'indice réel est (start + i) % capacity.`],
[`Écris un vérificateur de parenthèses ~bool Balanced(string s)~ pour ( ) [ ] { } avec une pile.`,`Empile les ouvrantes ; à chaque fermante, la pile doit contenir l'ouvrante correspondante.`]]},

'grille-2d':{
r:[`Tableau 1D avec l'indice ~y * width + x~.`,`~FloorToInt~ pour passer du monde à la case (gère les négatifs).`,`Toujours vérifier qu'une case est dans la grille.`],
m:[
['Grilles hexagonales',`Beaucoup de jeux de stratégie utilisent des hexagones : chaque case a 6 voisins à égale distance. Les coordonnées « axiales » ou « cubiques » rendent les calculs de distance et de voisinage simples. L'excellent article de Red Blob Games sur les grilles hexagonales est la référence sur le sujet.`],
['Grilles creuses',`Pour un monde immense presque vide (un jeu de construction infini), un tableau gaspillerait la mémoire. Un ~Dictionary<Vector2Int, T>~ ne stocke que les cases utilisées. On découpe souvent en « chunks » : des petites grilles de 16×16 chargées à la demande.`],
['Les Tilemaps de Unity',`Pour la 2D, le composant ~Tilemap~ gère une grille de tuiles avec ~WorldToCell~, ~GetTile~, ~SetTile~. Ta propre grille reste utile pour les données de jeu (coût de déplacement, occupation) à côté de l'affichage.`]],
d:[[`Ajoute à ~Grid<T>~ une méthode ~IEnumerable<Vector2Int> Neighbours(Vector2Int c, bool diagonals)~ qui ne renvoie que les cases dans la grille.`,`Un tableau de 4 ou 8 directions, filtré par InBounds.`],
[`Écris le jeu de la vie de Conway sur une ~Grid<bool>~ de 100×100, avec un affichage par Texture2D (un pixel par case) et une génération toutes les 0,1 s.`,`Il faut deux grilles (lecture et écriture) pour ne pas modifier la grille pendant qu'on la lit.`]]},

'recursion':{
r:[`Une méthode qui s'appelle sur un problème plus petit.`,`Toujours un cas de base qui s'arrête.`,`Trop profond = StackOverflowException ; remplacer par une pile explicite.`],
m:[
['La pile d\'appels',`Chaque appel de méthode réserve un petit espace (paramètres, variables locales, adresse de retour) sur la **pile d'appels**. Elle est limitée (environ 1 Mo sur le thread principal). Une récursion de profondeur 10 000 sur une grille peut la remplir, et Unity plante sans message clair.`],
['Diviser pour régner',`Beaucoup d'algorithmes efficaces sont récursifs : couper le problème en deux, résoudre chaque moitié, combiner. Le tri fusion, la recherche dans un arbre (quadtree, BSP), la génération de donjons par découpage récursif de rectangles.`],
['Mémoïsation',`Une récursion qui recalcule les mêmes sous-problèmes devient exponentielle (Fibonacci naïf). On garde les résultats déjà calculés dans un dictionnaire : c'est la mémoïsation, porte d'entrée de la programmation dynamique.`]],
d:[[`Génère un donjon par découpage récursif (BSP) : coupe un rectangle en deux au hasard, recommence sur chaque moitié jusqu'à une taille minimale, puis place une salle dans chaque feuille.`,`Cas de base : largeur ou hauteur sous le double de la taille minimale.`],
[`Réécris ~FindDeep~ sans récursion, avec une ~Stack<Transform>~, et vérifie qu'il trouve les mêmes résultats.`,`Empile root ; tant que la pile n'est pas vide, dépile, teste, empile les enfants.`]]},

'tri':{
r:[`~Sort~ en O(n log n) avec une fonction de comparaison.`,`Négatif si a avant b, positif après, 0 si égaux.`,`~List.Sort~ n'est pas stable ; ~OrderBy~ l'est mais alloue.`],
m:[
['Les algorithmes derrière Sort',`.NET utilise un tri « introspectif » : un tri rapide (quicksort), qui bascule sur un tri par tas si les découpes tournent mal, et sur un tri par insertion pour les petits morceaux. Le tri par insertion est aussi excellent pour une liste **presque triée**, comme des objets à afficher par profondeur qui bougent peu d'une image à l'autre.`],
['Comparaison cohérente',`Une comparaison doit être cohérente : si a < b et b < c, alors a < c, et ~Compare(a, a)~ vaut 0. Une comparaison incohérente (avec du hasard, ou des ~float~ NaN) peut faire boucler ou planter le tri. C'est pour ça que mélanger une liste avec ~Sort~ et une comparaison aléatoire est une mauvaise idée ; voir [[melange-fisher-yates]].`],
['IComparable',`Une classe qui implémente ~IComparable<T>~ définit son ordre naturel, et ~Sort()~ sans paramètre l'utilise. Pour plusieurs ordres différents (par nom, par score), des ~IComparer<T>~ séparés sont plus clairs.`]],
d:[[`Écris un tri par insertion générique ~InsertionSort<T>(List<T> list, Comparison<T> cmp)~ et compare-le à ~List.Sort~ sur une liste presque triée de 10 000 éléments.`,`Pour chaque élément, décale vers la droite ceux qui sont plus grands, puis insère.`],
[`Trie des objets transparents du plus éloigné au plus proche de la caméra chaque image, sans allocation.`,`Une liste réutilisée et un Comparison<T> gardé dans un champ (pas une lambda recréée).`]]},

'recherche-binaire':{
r:[`Liste triée obligatoire.`,`On coupe l'intervalle en deux à chaque étape : O(log n).`,`~mid = lo + (hi - lo) / 2~ évite le débordement.`],
m:[
['Chercher une réponse, pas une valeur',`La recherche binaire marche dès qu'une question a une réponse « non, non, non, oui, oui, oui ». Par exemple : quelle est la plus grande taille de police pour que ce texte tienne dans la boîte ? On essaie le milieu, puis la moitié qui convient. C'est aussi ce que fait ~git bisect~ pour trouver le commit qui a introduit un bug.`],
['Les erreurs classiques',`Boucle infinie quand ~lo~ et ~hi~ ne bougent plus (oublier le +1 ou le −1), erreur d'une case sur les bornes, et liste triée selon un autre critère. Écris toujours le test d'un cas vide, d'un seul élément, et des deux extrémités.`]],
d:[[`Écris ~int FitFontSize(Func<int, bool> fits, int min, int max)~ qui trouve la plus grande taille pour laquelle ~fits~ renvoie vrai.`,`Même forme que LevelFor : on garde le dernier candidat qui convient.`],
[`Écris ~float Evaluate(float[] times, float[] values, float t)~ qui trouve par recherche binaire l'intervalle contenant t et interpole linéairement, comme une AnimationCurve simplifiée.`,`Trouve i tel que times[i] <= t < times[i+1], puis InverseLerp et Lerp.`]]},

'aleatoire':{
r:[`Même graine, même suite de nombres.`,`~Random.Range(int, int)~ exclut la borne haute.`,`Un ~System.Random~ dédié pour tout ce qui doit être reproductible.`],
m:[
['Le hasard perçu',`Les joueurs jugent le hasard injuste quand il est vraiment aléatoire. Un taux de critique de 20 % donne parfois 10 coups sans critique. Les jeux « trichent » souvent en faveur du joueur : chance qui augmente après chaque échec (pseudo-random distribution), sacs mélangés ([[melange-fisher-yates]]), ou un 90 % affiché qui vaut en réalité 95 %.`],
['Graines par système',`Un jeu procédural sérieux dérive plusieurs générateurs d'une graine principale : un pour la carte, un pour le butin, un pour les ennemis. Ainsi, changer la génération du butin ne modifie pas la carte, et deux joueurs avec la même graine ont le même monde.`,`var master = new System.Random(seed);
var mapRng  = new System.Random(master.Next());
var lootRng = new System.Random(master.Next());`],
['Unity.Mathematics.Random',`Dans les [[jobs-burst|jobs]], ~System.Random~ et ~UnityEngine.Random~ ne sont pas utilisables. ~Unity.Mathematics.Random~ est une petite struct rapide, qu'on initialise avec une graine différente par job ou par élément.`]],
d:[[`Écris un ~CritRoller~ à « distribution pseudo-aléatoire » : la chance de critique commence basse et augmente à chaque échec jusqu'à garantir un critique, en visant une moyenne proche de 20 %.`,`Chance = C × (nombre d'échecs + 1) ; ajuste C par essais pour obtenir 20 % en moyenne sur 100 000 tirages.`],
[`Écris un test qui vérifie que ~PickWeighted~ respecte à peu près les poids sur 100 000 tirages (écart de moins de 1 %).`,`Compte les résultats et compare chaque fréquence à poids / total.`]]},

'melange-fisher-yates':{
r:[`De la fin vers le début, échanger avec un élément pris parmi ceux qui restent.`,`Tous les ordres ont la même probabilité.`,`Le sac mélangé évite les longues séries malchanceuses.`],
m:[
['Pourquoi le faux mélange est biaisé',`Avec 3 éléments, le faux mélange (échange avec n'importe quelle position) a 3 × 3 × 3 = 27 déroulements possibles, mais il y a 6 ordres. 27 n'est pas divisible par 6 : certains ordres sortent forcément plus souvent que d'autres. Fisher-Yates a exactement 3 × 2 × 1 = 6 déroulements, un par ordre.`],
['Mélange partiel',`Pour tirer k éléments distincts parmi n (5 cartes dans un paquet de 52), on fait seulement les k premières étapes de Fisher-Yates : les k derniers éléments forment un tirage uniforme, sans mélanger tout le paquet.`]],
d:[[`Écris ~List<T> Sample<T>(IList<T> source, int k, System.Random rng)~ qui tire k éléments distincts sans modifier la source.`,`Copie la source, puis k étapes de Fisher-Yates depuis la fin.`],
[`Vérifie expérimentalement le biais du faux mélange : mélange [1, 2, 3] un million de fois avec chaque méthode et compte la fréquence de chacun des 6 ordres.`,`Un Dictionary<string, int> avec l'ordre comme clé.`]]},

'bfs-grille':{
r:[`Une file explore par couches : la première fois qu'on atteint une case, c'est au plus court.`,`~cameFrom~ permet de reconstruire le chemin.`,`Pour des coûts différents, passer à A*.`],
m:[
['Carte de distances (flow field)',`Au lieu de chercher un chemin par ennemi, on lance **un seul** BFS depuis le joueur sur toute la carte et on note la distance de chaque case. Chaque ennemi n'a plus qu'à aller vers la case voisine de plus petite distance. Avec des centaines d'ennemis, c'est des centaines de fois moins de calculs. Les jeux de type tower defense et les hordes l'utilisent beaucoup.`],
['Parcours en profondeur (DFS)',`Remplacer la file par une [[pile-file|pile]] donne un parcours en profondeur : il fonce dans une direction avant de revenir. Il ne trouve pas le plus court chemin, mais sert à générer des labyrinthes, détecter les zones reliées ou explorer un arbre.`],
['Composantes connexes',`En lançant un BFS depuis chaque case non visitée, on découvre les « îles » de la carte. Utile pour vérifier qu'un niveau généré est entièrement accessible, ou pour retirer les petites zones isolées.`]],
d:[[`Écris ~int[,] DistanceField(bool[,] walkable, Vector2Int target)~ (−1 pour inaccessible), puis ~Vector2Int NextStep(int[,] field, Vector2Int from)~ qui renvoie la voisine la plus proche de la cible.`,`Le même BFS que l'exercice, en notant distance[voisine] = distance[case] + 1.`],
[`Génère un labyrinthe parfait sur une grille avec un DFS à pile explicite (« recursive backtracker ») et affiche-le avec des cubes.`,`Les cases d'indices impairs sont des cellules, les autres des murs ; on casse le mur entre deux cellules en avançant.`]]},

'astar':{
r:[`f = g (coût réel) + h (estimation restante).`,`L'heuristique ne doit jamais surestimer.`,`File à priorité pour retirer vite la case la plus prometteuse.`],
m:[
['Choisir l\'heuristique',`4 directions : Manhattan. 8 directions avec coût diagonal √2 : la distance « octile ». Déplacement libre : la distance euclidienne. Une heuristique plus grande que la réalité (multipliée par 1,5) trouve des chemins **plus vite** mais pas toujours les plus courts : un compromis souvent acceptable en jeu.`],
['Lisser le chemin',`Un chemin sur grille fait des escaliers. On le lisse ensuite : on retire les points intermédiaires tant que la ligne droite entre deux points reste praticable (un test de ligne de vue sur la grille). Le personnage marche alors en diagonale naturelle.`],
['Sur de grandes cartes',`A* sur une carte de 1000 × 1000 explore beaucoup de cases. Les solutions : répartir le calcul sur plusieurs images, le faire dans un job, ou utiliser une recherche hiérarchique (d'abord entre régions, puis dans chaque région). Ou le [[navmesh]], qui travaille sur de grands polygones au lieu de petites cases.`]],
d:[[`Adapte ~AStar~ à 8 directions avec un coût diagonal de 1,414 × le coût de la case, et la distance octile comme heuristique (passe les coûts en float).`,`Octile : max(dx, dy) + (√2 − 1) × min(dx, dy).`],
[`Ajoute un lissage du chemin trouvé : parcours les points et retire ceux qu'on peut sauter en ligne droite sans traverser de mur (algorithme de Bresenham pour tester la ligne).`,`Garde le point courant ; avance tant que la ligne de vue vers le point suivant est libre.`]]}
});

/* Exercices 26 à 50 : katas célèbres, jeux de société et jeux classiques */
window.LESSONS=(window.LESSONS||[]).concat([
{id:'exo-bowling',cat:'exos',lvl:2,title:'Score au bowling',sum:'Le « Bowling Game Kata » de Robert C. Martin, l\'exercice de référence du développement piloté par les tests.',src:['Robert C. Martin : The Bowling Game Kata','http://butunclebob.com/ArticleS.UncleBob.TheBowlingGameKata'],
ex:`Écris une classe ~BowlingGame~ avec ~Roll(int pins)~ et ~int Score()~. Une partie a 10 frames. Un spare (10 quilles en deux lancers) rapporte en bonus le lancer suivant ; un strike (10 au premier lancer) rapporte les deux lancers suivants. La 10ᵉ frame donne droit aux lancers bonus. Une partie parfaite (12 strikes) vaut 300.`,
hint:`Stocke tous les lancers dans une liste. Pour le score, parcours 10 frames avec un index de lancer : strike = avance de 1, sinon avance de 2.`,
sol:`public class BowlingGame
{
    private readonly List<int> rolls = new List<int>();

    public void Roll(int pins) => rolls.Add(pins);

    public int Score()
    {
        int score = 0, i = 0;
        for (int frame = 0; frame < 10; frame++)
        {
            if (rolls[i] == 10)                       // strike
            {
                score += 10 + rolls[i + 1] + rolls[i + 2];
                i += 1;
            }
            else if (rolls[i] + rolls[i + 1] == 10)   // spare
            {
                score += 10 + rolls[i + 2];
                i += 2;
            }
            else
            {
                score += rolls[i] + rolls[i + 1];
                i += 2;
            }
        }
        return score;
    }
}`},

{id:'exo-tennis',cat:'exos',lvl:2,title:'Score au tennis',sum:'Le kata « Tennis » : traduire des points en « Quinze », « Égalité », « Avantage ».',src:['Emily Bache : Tennis Refactoring Kata','https://github.com/emilybache/Tennis-Refactoring-Kata'],
ex:`Écris ~string Score(int p1, int p2)~ qui renvoie le score d'un jeu en français à partir du nombre de points gagnés : « Zéro-Quinze », « Trente-A » (égalité sous 40), « Égalité » (à partir de 3-3), « Avantage joueur 1 », « Jeu joueur 2 ».`,
hint:`Traite d'abord les cas où un joueur a au moins 4 points : différence de 1 = avantage, de 2 ou plus = jeu. Sinon, égalité ou noms des points.`,
sol:`private static readonly string[] Names = { "Zéro", "Quinze", "Trente", "Quarante" };

public static string Score(int p1, int p2)
{
    if (p1 >= 4 || p2 >= 4)
    {
        int diff = p1 - p2;
        if (diff == 0) return "Égalité";
        if (diff == 1) return "Avantage joueur 1";
        if (diff == -1) return "Avantage joueur 2";
        return diff > 0 ? "Jeu joueur 1" : "Jeu joueur 2";
    }
    if (p1 == p2) return p1 >= 3 ? "Égalité" : Names[p1] + "-A";
    return Names[p1] + "-" + Names[p2];
}`},

{id:'exo-yams',cat:'exos',lvl:2,title:'Les combinaisons du Yams',sum:'Calculer le score des catégories du Yahtzee : brelan, full, suites, yams.',src:['Wikipédia : Yahtzee','https://fr.wikipedia.org/wiki/Yahtzee'],
ex:`Avec cinq dés (~int[] dice~), écris ~int Score(int[] dice, string category)~ pour : « brelan » (somme des dés si au moins 3 identiques), « carré » (pareil avec 4), « full » (25 points pour 3 + 2), « petite suite » (30 points pour 4 dés consécutifs), « grande suite » (40 points pour 5), « yams » (50 points), « chance » (la somme).`,
hint:`Un tableau de comptes ~counts[1..6]~ répond à presque tout. Pour les suites, cherche 1-2-3-4, 2-3-4-5 ou 3-4-5-6 dans les valeurs présentes.`,
sol:`public static int Score(int[] dice, string category)
{
    var counts = new int[7];
    foreach (int d in dice) counts[d]++;
    int sum = dice.Sum();
    bool Has(int v) => counts[v] > 0;
    bool Run(int from, int len) => Enumerable.Range(from, len).All(Has);

    switch (category)
    {
        case "brelan": return counts.Max() >= 3 ? sum : 0;
        case "carré": return counts.Max() >= 4 ? sum : 0;
        case "full": return counts.Contains(3) && counts.Contains(2) ? 25 : 0;
        case "petite suite": return Run(1, 4) || Run(2, 4) || Run(3, 4) ? 30 : 0;
        case "grande suite": return Run(1, 5) || Run(2, 5) ? 40 : 0;
        case "yams": return counts.Max() == 5 ? 50 : 0;
        case "chance": return sum;
        default: throw new ArgumentException("Catégorie inconnue : " + category);
    }
}`},

{id:'exo-blackjack',cat:'exos',lvl:1,title:'Valeur d\'une main de blackjack',sum:'Les as valent 1 ou 11 : trouver la meilleure valeur sans dépasser 21.',src:['Wikipédia : Blackjack','https://fr.wikipedia.org/wiki/Blackjack_(jeu)'],
ex:`Les cartes sont des chaînes : « 2 » à « 10 », « V », « D », « R » (10 points) et « A ». Écris ~int HandValue(IEnumerable<string> cards)~ qui renvoie la meilleure valeur possible, et ~bool IsBlackjack(List<string> cards)~ (exactement deux cartes qui font 21).`,
hint:`Compte tous les as comme 1, puis ajoute 10 une seule fois s'il y a au moins un as et que le total reste ≤ 21. (Deux as à 11 feraient 22.)`,
sol:`public static int HandValue(IEnumerable<string> cards)
{
    int total = 0;
    bool hasAce = false;
    foreach (string c in cards)
    {
        if (c == "A") { total += 1; hasAce = true; }
        else if (c == "V" || c == "D" || c == "R") total += 10;
        else total += int.Parse(c);
    }
    if (hasAce && total + 10 <= 21) total += 10;
    return total;
}

public static bool IsBlackjack(List<string> cards) => cards.Count == 2 && HandValue(cards) == 21;`},

{id:'exo-pierre-feuille-ciseaux',cat:'exos',lvl:1,title:'Pierre, feuille, ciseaux… lézard, Spock',sum:'Une règle par modulo qui s\'étend à cinq coups sans une seule condition imbriquée.',src:['Wikipédia : Pierre-papier-ciseaux (variantes)','https://fr.wikipedia.org/wiki/Pierre-papier-ciseaux'],
ex:`Avec un ~enum Move { Ciseaux, Lezard, Feuille, Spock, Pierre }~ dans cet ordre, écris ~int Winner(Move a, Move b)~ qui renvoie 1 si a gagne, −1 si b gagne, 0 en cas d'égalité, sans tableau de règles. (Chaque coup bat les deux qui le suivent dans le cercle.)`,
hint:`d = (b − a + 5) mod 5. Si d vaut 1 ou 2, b est « derrière » a dans le cercle… vérifie sur un exemple connu : Pierre (4) contre Ciseaux (0) doit faire gagner la pierre.`,
sol:`public enum Move { Ciseaux, Lezard, Feuille, Spock, Pierre }

public static int Winner(Move a, Move b)
{
    int d = ((int)b - (int)a + 5) % 5;
    if (d == 0) return 0;
    return d <= 2 ? 1 : -1;   // a bat les deux coups qui le suivent
}
// Ciseaux bat Lézard et Feuille, Lézard bat Feuille et Spock, Feuille bat Spock et Pierre…`},

{id:'exo-morpion',cat:'exos',lvl:1,title:'Qui a gagné au morpion ?',sum:'Détecter une ligne, une colonne ou une diagonale complète sur une grille 3 × 3.',src:['Wikipédia : Tic-tac-toe','https://fr.wikipedia.org/wiki/Tic-tac-toe'],
ex:`La grille est un ~char[3, 3]~ contenant 'X', 'O' ou ' '. Écris ~char Winner(char[,] g)~ qui renvoie 'X', 'O', 'N' (match nul : grille pleine sans gagnant) ou ' ' (partie en cours). Bonus : généralise à une grille n × n avec k pions alignés.`,
hint:`Liste les 8 alignements possibles sous forme de triplets de coordonnées, ou vérifie lignes, colonnes et les deux diagonales dans des boucles.`,
sol:`public static char Winner(char[,] g)
{
    int n = g.GetLength(0);
    char Line(Func<int, (int r, int c)> cell)
    {
        var (r0, c0) = cell(0);
        char first = g[r0, c0];
        if (first == ' ') return ' ';
        for (int i = 1; i < n; i++)
        {
            var (r, c) = cell(i);
            if (g[r, c] != first) return ' ';
        }
        return first;
    }

    for (int k = 0; k < n; k++)
    {
        char w = Line(i => (k, i));            // ligne k
        if (w != ' ') return w;
        w = Line(i => (i, k));                 // colonne k
        if (w != ' ') return w;
    }
    char d1 = Line(i => (i, i));
    if (d1 != ' ') return d1;
    char d2 = Line(i => (i, n - 1 - i));
    if (d2 != ' ') return d2;

    foreach (char c in g) if (c == ' ') return ' ';
    return 'N';
}`},

{id:'exo-puissance4',cat:'exos',lvl:2,title:'Puissance 4',sum:'Faire tomber un jeton dans une colonne et vérifier s\'il aligne quatre pions.',src:['Wikipédia : Puissance 4','https://fr.wikipedia.org/wiki/Puissance_4'],
ex:`Grille de 6 lignes et 7 colonnes (~int[,]~, 0 = vide, 1 ou 2 = joueur). Écris ~int Drop(int[,] g, int col, int player)~ qui place le jeton dans la case libre la plus basse et renvoie sa ligne (−1 si la colonne est pleine), puis ~bool Wins(int[,] g, int row, int col)~ qui vérifie seulement autour du dernier jeton posé.`,
hint:`Pour chacune des 4 directions (→, ↓, ↘, ↗), compte les jetons identiques dans un sens puis dans l'autre. 1 + avant + arrière ≥ 4 = victoire.`,
sol:`public static int Drop(int[,] g, int col, int player)
{
    for (int row = g.GetLength(0) - 1; row >= 0; row--)
        if (g[row, col] == 0)
        {
            g[row, col] = player;
            return row;
        }
    return -1;
}

public static bool Wins(int[,] g, int row, int col)
{
    int p = g[row, col];
    int[,] dirs = { { 0, 1 }, { 1, 0 }, { 1, 1 }, { 1, -1 } };
    for (int d = 0; d < 4; d++)
    {
        int count = 1;
        foreach (int sign in new[] { 1, -1 })
        {
            int r = row + dirs[d, 0] * sign, c = col + dirs[d, 1] * sign;
            while (r >= 0 && r < g.GetLength(0) && c >= 0 && c < g.GetLength(1) && g[r, c] == p)
            {
                count++;
                r += dirs[d, 0] * sign;
                c += dirs[d, 1] * sign;
            }
        }
        if (count >= 4) return true;
    }
    return false;
}`},

{id:'exo-mastermind',cat:'exos',lvl:2,title:'Mastermind',sum:'Compter les pions bien placés et mal placés, sans compter deux fois la même couleur.',src:['Wikipédia : Mastermind','https://fr.wikipedia.org/wiki/Mastermind'],
ex:`Le code secret et la proposition sont des ~int[]~ de 4 couleurs (0 à 5). Écris ~(int black, int white) Feedback(int[] secret, int[] guess)~ : noir = bonne couleur au bon endroit, blanc = bonne couleur mal placée. Secret [1,1,2,3] et proposition [1,2,1,1] donnent 1 noir et 2 blancs.`,
hint:`Compte d'abord les noirs. Pour les blancs : pour chaque couleur, min(occurrences dans le secret, occurrences dans la proposition), en tout, moins les noirs.`,
sol:`public static (int black, int white) Feedback(int[] secret, int[] guess)
{
    int black = 0;
    for (int i = 0; i < secret.Length; i++)
        if (secret[i] == guess[i]) black++;

    int common = 0;
    for (int color = 0; color < 6; color++)
        common += Math.Min(secret.Count(c => c == color), guess.Count(c => c == color));

    return (black, common - black);
}`},

{id:'exo-wordle',cat:'exos',lvl:2,title:'Les couleurs de Wordle',sum:'Vert, jaune ou gris : le piège, ce sont les lettres en double.',src:['Wikipédia : Wordle','https://fr.wikipedia.org/wiki/Wordle'],
ex:`Écris ~string Feedback(string answer, string guess)~ qui renvoie une chaîne de 5 caractères : 'V' (bonne lettre, bonne place), 'J' (lettre présente ailleurs), 'G' (absente). Avec la réponse « ARBRE » et la proposition « REGLE », on doit obtenir « JGGGV » : le R est jaune, et le premier E est gris car l'unique E de la réponse est déjà compté en vert à la fin.`,
hint:`Deux passes. D'abord les verts, en retirant ces lettres d'un compteur des lettres restantes de la réponse. Ensuite les jaunes, seulement s'il reste un exemplaire de la lettre dans le compteur.`,
sol:`public static string Feedback(string answer, string guess)
{
    var result = new char[guess.Length];
    var remaining = new Dictionary<char, int>();

    for (int i = 0; i < guess.Length; i++)
    {
        if (guess[i] == answer[i]) result[i] = 'V';
        else
        {
            remaining.TryGetValue(answer[i], out int c);
            remaining[answer[i]] = c + 1;
        }
    }
    for (int i = 0; i < guess.Length; i++)
    {
        if (result[i] == 'V') continue;
        if (remaining.TryGetValue(guess[i], out int c) && c > 0)
        {
            result[i] = 'J';
            remaining[guess[i]] = c - 1;
        }
        else result[i] = 'G';
    }
    return new string(result);
}`},

{id:'exo-sudoku-valide',cat:'exos',lvl:2,title:'Vérifier une grille de sudoku',sum:'Lignes, colonnes et carrés 3 × 3 sans doublon.',src:['Wikipédia : Sudoku','https://fr.wikipedia.org/wiki/Sudoku'],
ex:`Écris ~bool IsValid(int[,] grid)~ pour une grille 9 × 9 où 0 représente une case vide : aucune ligne, colonne ni région 3 × 3 ne doit contenir deux fois le même chiffre. Bonus : renvoie la liste des cases en conflit, pour les afficher en rouge.`,
hint:`Pour une case (r, c), sa région est (r / 3) * 3 + c / 3. Trois tableaux de 9 HashSet<int> (lignes, colonnes, régions) suffisent en un seul parcours.`,
sol:`public static bool IsValid(int[,] grid) => Conflicts(grid).Count == 0;

public static List<(int r, int c)> Conflicts(int[,] grid)
{
    var bad = new HashSet<(int, int)>();
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
        {
            int v = grid[r, c];
            if (v == 0) continue;
            for (int k = 0; k < 9; k++)
            {
                int br = r / 3 * 3 + k / 3, bc = c / 3 * 3 + k % 3;
                if (k != c && grid[r, k] == v) bad.Add((r, c));
                if (k != r && grid[k, c] == v) bad.Add((r, c));
                if ((br != r || bc != c) && grid[br, bc] == v) bad.Add((r, c));
            }
        }
    return bad.ToList();
}`},

{id:'exo-sudoku-solveur',cat:'exos',lvl:3,title:'Résoudre un sudoku',sum:'Le retour sur trace (backtracking) : essayer, avancer, revenir en arrière.',src:['Wikipédia : Algorithmes de résolution des sudokus','https://en.wikipedia.org/wiki/Sudoku_solving_algorithms'],
ex:`Écris ~bool Solve(int[,] grid)~ qui remplit la grille sur place et renvoie ~false~ si elle n'a pas de solution. Bonus : choisis à chaque étape la case vide qui a le moins de candidats possibles, et compare la vitesse.`,
hint:`Trouve une case vide ; pour chaque chiffre de 1 à 9 autorisé à cet endroit, place-le et appelle Solve récursivement. Si ça échoue, remets 0 et essaie le suivant.`,
sol:`private static bool CanPlace(int[,] g, int r, int c, int v)
{
    for (int k = 0; k < 9; k++)
    {
        if (g[r, k] == v || g[k, c] == v) return false;
        if (g[r / 3 * 3 + k / 3, c / 3 * 3 + k % 3] == v) return false;
    }
    return true;
}

public static bool Solve(int[,] g)
{
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
        {
            if (g[r, c] != 0) continue;
            for (int v = 1; v <= 9; v++)
            {
                if (!CanPlace(g, r, c, v)) continue;
                g[r, c] = v;
                if (Solve(g)) return true;
                g[r, c] = 0;                 // retour en arrière
            }
            return false;                    // aucun chiffre ne convient ici
        }
    return true;                             // plus de case vide
}`},

{id:'exo-jeu-de-la-vie',cat:'exos',lvl:2,title:'Le jeu de la vie',sum:'L\'automate cellulaire de John Conway : quatre règles simples, des comportements étonnants.',src:['Wikipédia : Jeu de la vie','https://fr.wikipedia.org/wiki/Jeu_de_la_vie'],
ex:`Écris ~bool[,] Step(bool[,] grid, bool wrap)~ qui calcule la génération suivante : une cellule vivante survit avec 2 ou 3 voisines, une cellule morte naît avec exactement 3 voisines. Avec ~wrap~, les bords se rejoignent (monde torique). Vérifie que le « planeur » se déplace d'une case en diagonale toutes les 4 générations.`,
hint:`Ne modifie jamais la grille que tu lis : écris dans une nouvelle grille. Pour le monde torique, ~(x + dx + w) % w~.`,
sol:`public static bool[,] Step(bool[,] grid, bool wrap)
{
    int h = grid.GetLength(0), w = grid.GetLength(1);
    var next = new bool[h, w];
    for (int y = 0; y < h; y++)
        for (int x = 0; x < w; x++)
        {
            int n = 0;
            for (int dy = -1; dy <= 1; dy++)
                for (int dx = -1; dx <= 1; dx++)
                {
                    if (dx == 0 && dy == 0) continue;
                    int yy = y + dy, xx = x + dx;
                    if (wrap) { yy = (yy + h) % h; xx = (xx + w) % w; }
                    else if (yy < 0 || yy >= h || xx < 0 || xx >= w) continue;
                    if (grid[yy, xx]) n++;
                }
            next[y, x] = grid[y, x] ? (n == 2 || n == 3) : n == 3;
        }
    return next;
}`},

{id:'exo-fourmi-langton',cat:'exos',lvl:2,title:'La fourmi de Langton',sum:'Deux règles, du chaos pendant 10 000 pas, puis une « autoroute » : un classique de la simulation.',src:['Wikipédia : Fourmi de Langton','https://fr.wikipedia.org/wiki/Fourmi_de_Langton'],
ex:`La fourmi est sur une grille infinie de cases blanches. Sur une case blanche, elle tourne de 90° à droite ; sur une noire, à gauche. Elle inverse la couleur de la case puis avance d'une case. Écris ~HashSet<(int x, int y)> Run(int steps)~ qui renvoie les cases noires, et dessine-les dans Unity avec des cubes ou une texture.`,
hint:`Un HashSet<(int, int)> représente la grille infinie : la case est noire si elle est dans l'ensemble. La direction est un entier 0 à 3, avec deux tableaux dx, dy.`,
sol:`public static HashSet<(int x, int y)> Run(int steps)
{
    var black = new HashSet<(int, int)>();
    int x = 0, y = 0, dir = 0;                 // 0 = haut, 1 = droite, 2 = bas, 3 = gauche
    int[] dx = { 0, 1, 0, -1 };
    int[] dy = { 1, 0, -1, 0 };

    for (int i = 0; i < steps; i++)
    {
        bool isBlack = black.Contains((x, y));
        dir = isBlack ? (dir + 3) % 4 : (dir + 1) % 4;   // gauche sur noir, droite sur blanc
        if (isBlack) black.Remove((x, y));
        else black.Add((x, y));
        x += dx[dir];
        y += dy[dir];
    }
    return black;
}`},

{id:'exo-demineur-chiffres',cat:'exos',lvl:1,title:'Démineur : les chiffres',sum:'Compter les mines autour de chaque case, première étape de tout démineur.',src:['Wikipédia : Démineur','https://fr.wikipedia.org/wiki/D%C3%A9mineur_(genre_de_jeu_vid%C3%A9o)'],
ex:`Le terrain est un ~string[]~ où '*' est une mine et '.' une case vide. Écris ~string[] Annotate(string[] field)~ qui remplace chaque case vide par le nombre de mines voisines (les 8 cases autour), ou laisse '.' s'il n'y en a aucune.`,
hint:`Pour chaque case vide, deux boucles de −1 à 1 en vérifiant que la voisine est dans la grille.`,
sol:`public static string[] Annotate(string[] field)
{
    int h = field.Length;
    var result = new string[h];
    for (int y = 0; y < h; y++)
    {
        var row = field[y].ToCharArray();
        for (int x = 0; x < row.Length; x++)
        {
            if (row[x] == '*') continue;
            int count = 0;
            for (int dy = -1; dy <= 1; dy++)
                for (int dx = -1; dx <= 1; dx++)
                {
                    int yy = y + dy, xx = x + dx;
                    if (yy >= 0 && yy < h && xx >= 0 && xx < field[yy].Length && field[yy][xx] == '*') count++;
                }
            row[x] = count == 0 ? '.' : (char)('0' + count);
        }
        result[y] = new string(row);
    }
    return result;
}`},

{id:'exo-demineur-revele',cat:'exos',lvl:2,title:'Démineur : révéler une zone',sum:'Cliquer sur une case sans mine voisine ouvre toute la zone : un remplissage par diffusion.',src:['Wikipédia : Algorithme de remplissage par diffusion','https://fr.wikipedia.org/wiki/Algorithme_de_remplissage_par_diffusion'],
ex:`Avec ~int[,] counts~ (−1 = mine, sinon nombre de mines voisines) et ~bool[,] revealed~, écris ~int Reveal(int x, int y)~ : révèle la case ; si elle vaut 0, révèle aussi toutes ses voisines, et ainsi de suite. Renvoie le nombre de cases révélées. N'utilise pas de récursivité (une grille 1000 × 1000 ferait déborder la pile).`,
hint:`Une Queue<(int, int)> : on y met la case de départ, et chaque case à 0 y ajoute ses voisines non révélées.`,
sol:`public static int Reveal(int[,] counts, bool[,] revealed, int x, int y)
{
    int w = counts.GetLength(0), h = counts.GetLength(1);
    if (revealed[x, y]) return 0;
    var queue = new Queue<(int x, int y)>();
    queue.Enqueue((x, y));
    revealed[x, y] = true;
    int opened = 0;

    while (queue.Count > 0)
    {
        var (cx, cy) = queue.Dequeue();
        opened++;
        if (counts[cx, cy] != 0) continue;          // un chiffre (ou une mine) : on s'arrête là
        for (int dx = -1; dx <= 1; dx++)
            for (int dy = -1; dy <= 1; dy++)
            {
                int nx = cx + dx, ny = cy + dy;
                if (nx < 0 || ny < 0 || nx >= w || ny >= h || revealed[nx, ny]) continue;
                revealed[nx, ny] = true;
                queue.Enqueue((nx, ny));
            }
    }
    return opened;
}`},

{id:'exo-2048-ligne',cat:'exos',lvl:2,title:'Glisser une ligne de 2048',sum:'Tasser, fusionner une seule fois, compter les points : le cœur du jeu de Gabriele Cirulli.',src:['Wikipédia : 2048 (jeu vidéo)','https://fr.wikipedia.org/wiki/2048_(jeu_vid%C3%A9o)'],
ex:`Écris ~(int[] row, int score) SlideLeft(int[] row)~ : [2, 2, 2, 0] donne [4, 2, 0, 0] ; [2, 2, 2, 2] donne [4, 4, 0, 0] (chaque tuile ne fusionne qu'une fois par coup) ; [4, 0, 4, 8] donne [8, 8, 0, 0]. Le score est la somme des tuiles créées par fusion. Bonus : déduis-en les trois autres directions sur une grille 4 × 4.`,
hint:`Retire d'abord les zéros. Parcours ensuite la liste : si deux voisins sont égaux, ajoute leur somme et saute le suivant. Complète avec des zéros.`,
sol:`public static (int[] row, int score) SlideLeft(int[] row)
{
    var tiles = row.Where(v => v != 0).ToList();
    var result = new List<int>();
    int score = 0;
    for (int i = 0; i < tiles.Count; i++)
    {
        if (i + 1 < tiles.Count && tiles[i] == tiles[i + 1])
        {
            int merged = tiles[i] * 2;
            result.Add(merged);
            score += merged;
            i++;                                 // la tuile suivante est absorbée
        }
        else result.Add(tiles[i]);
    }
    while (result.Count < row.Length) result.Add(0);
    return (result.ToArray(), score);
}
// Droite : inverser la ligne, SlideLeft, inverser. Haut/bas : même chose sur les colonnes.`},

{id:'exo-tetris-lignes',cat:'exos',lvl:2,title:'Tetris : effacer les lignes',sum:'Supprimer les lignes pleines, faire descendre le reste et compter les points.',src:['Wikipédia : Tetris','https://fr.wikipedia.org/wiki/Tetris'],
ex:`La pile est un ~bool[,] grid~ de 20 lignes × 10 colonnes, la ligne 0 en haut. Écris ~int ClearLines(bool[,] grid)~ qui supprime les lignes pleines, fait tomber celles du dessus et renvoie le nombre de lignes effacées. Puis ~int Points(int lines, int level)~ avec le barème : 100, 300, 500 ou 800 points pour 1 à 4 lignes, multipliés par le niveau.`,
hint:`Parcours de bas en haut avec deux index : ~read~ et ~write~. Une ligne non pleine est recopiée à ~write~, qui remonte ; une ligne pleine est simplement sautée. Vide ensuite les lignes restantes en haut.`,
sol:`public static int ClearLines(bool[,] grid)
{
    int rows = grid.GetLength(0), cols = grid.GetLength(1);
    int write = rows - 1, cleared = 0;
    for (int read = rows - 1; read >= 0; read--)
    {
        bool full = true;
        for (int c = 0; c < cols && full; c++) full = grid[read, c];
        if (full) { cleared++; continue; }
        if (write != read)
            for (int c = 0; c < cols; c++) grid[write, c] = grid[read, c];
        write--;
    }
    for (int r = write; r >= 0; r--)
        for (int c = 0; c < cols; c++) grid[r, c] = false;
    return cleared;
}

private static readonly int[] Table = { 0, 100, 300, 500, 800 };
public static int Points(int lines, int level) => Table[lines] * level;`},

{id:'exo-tetris-rotation',cat:'exos',lvl:2,title:'Tourner une pièce',sum:'La rotation de 90° d\'une matrice, utile pour Tetris comme pour les puzzles à tuiles.',
ex:`Écris ~bool[,] RotateClockwise(bool[,] m)~ qui tourne une matrice (pas forcément carrée) de 90° dans le sens horaire, puis ~RotateCounterClockwise~. Vérifie que quatre rotations rendent la pièce d'origine. Bonus : ~bool Fits(bool[,] grid, bool[,] piece, int row, int col)~.`,
hint:`Pour une rotation horaire d'une matrice h × w, la case (r, c) part en (c, h − 1 − r) dans une matrice w × h.`,
sol:`public static bool[,] RotateClockwise(bool[,] m)
{
    int h = m.GetLength(0), w = m.GetLength(1);
    var r = new bool[w, h];
    for (int y = 0; y < h; y++)
        for (int x = 0; x < w; x++)
            r[x, h - 1 - y] = m[y, x];
    return r;
}

public static bool[,] RotateCounterClockwise(bool[,] m)
    => RotateClockwise(RotateClockwise(RotateClockwise(m)));

public static bool Fits(bool[,] grid, bool[,] piece, int row, int col)
{
    for (int y = 0; y < piece.GetLength(0); y++)
        for (int x = 0; x < piece.GetLength(1); x++)
        {
            if (!piece[y, x]) continue;
            int gy = row + y, gx = col + x;
            if (gy < 0 || gx < 0 || gy >= grid.GetLength(0) || gx >= grid.GetLength(1)) return false;
            if (grid[gy, gx]) return false;
        }
    return true;
}`},

{id:'exo-match3',cat:'exos',lvl:2,title:'Détecter les alignements de match-3',sum:'Trouver toutes les gemmes alignées par 3 ou plus, comme dans Bejeweled ou Candy Crush.',src:['Wikipédia : Jeu de tuiles à associer','https://en.wikipedia.org/wiki/Tile-matching_video_game'],
ex:`La grille est un ~int[,]~ de couleurs (−1 = vide). Écris ~HashSet<(int x, int y)> FindMatches(int[,] g)~ qui renvoie toutes les cases faisant partie d'un alignement horizontal ou vertical d'au moins 3 cases de même couleur. Une forme en L ou en T doit renvoyer toutes ses cases.`,
hint:`Pour chaque ligne, parcours en mesurant la longueur de la série courante ; quand elle se termine et fait 3 ou plus, ajoute ses cases. Même chose pour chaque colonne. Le HashSet évite les doublons aux croisements.`,
sol:`public static HashSet<(int x, int y)> FindMatches(int[,] g)
{
    int w = g.GetLength(0), h = g.GetLength(1);
    var found = new HashSet<(int, int)>();

    for (int y = 0; y < h; y++)
        for (int x = 0; x < w; )
        {
            int end = x;
            while (end + 1 < w && g[end + 1, y] == g[x, y]) end++;
            if (g[x, y] >= 0 && end - x + 1 >= 3)
                for (int k = x; k <= end; k++) found.Add((k, y));
            x = end + 1;
        }

    for (int x = 0; x < w; x++)
        for (int y = 0; y < h; )
        {
            int end = y;
            while (end + 1 < h && g[x, end + 1] == g[x, y]) end++;
            if (g[x, y] >= 0 && end - y + 1 >= 3)
                for (int k = y; k <= end; k++) found.Add((x, k));
            y = end + 1;
        }
    return found;
}`},

{id:'exo-snake',cat:'exos',lvl:2,title:'La logique de Snake',sum:'Avancer, grandir, mourir : une file pour le corps et un ensemble pour les collisions.',src:['Wikipédia : Snake (genre de jeu vidéo)','https://fr.wikipedia.org/wiki/Snake_(genre_de_jeu_vid%C3%A9o)'],
ex:`Écris une classe ~Snake~ sur une grille w × h avec ~Turn(Vector2Int dir)~ (interdit de faire demi-tour) et ~StepResult Step(Vector2Int food)~ qui renvoie ~Moved~, ~Ate~ ou ~Died~ (mur ou propre corps). Le serpent grandit d'une case quand il mange.`,
hint:`Le corps est une LinkedList (tête au début). À chaque pas : calcule la nouvelle tête ; si elle ne mange pas, retire la queue AVANT de tester la collision (on peut entrer dans la case que la queue quitte).`,
sol:`public enum StepResult { Moved, Ate, Died }

public class Snake
{
    private readonly LinkedList<Vector2Int> body = new LinkedList<Vector2Int>();
    private readonly HashSet<Vector2Int> cells = new HashSet<Vector2Int>();
    private readonly int w, h;
    private Vector2Int dir = new Vector2Int(1, 0);

    public Snake(int w, int h, Vector2Int start)
    {
        this.w = w; this.h = h;
        body.AddFirst(start);
        cells.Add(start);
    }

    public IEnumerable<Vector2Int> Body => body;

    public void Turn(Vector2Int newDir)
    {
        if (newDir + dir != Vector2Int.zero) dir = newDir;   // pas de demi-tour
    }

    public StepResult Step(Vector2Int food)
    {
        Vector2Int head = body.First.Value + dir;
        bool eats = head == food;
        if (!eats)
        {
            cells.Remove(body.Last.Value);
            body.RemoveLast();
        }
        if (head.x < 0 || head.y < 0 || head.x >= w || head.y >= h || cells.Contains(head))
            return StepResult.Died;
        body.AddFirst(head);
        cells.Add(head);
        return eats ? StepResult.Ate : StepResult.Moved;
    }
}`},

{id:'exo-cavalier',cat:'exos',lvl:2,title:'Les sauts du cavalier',sum:'Le nombre minimal de coups d\'un cavalier d\'échecs : un parcours en largeur sur un plateau.',src:['Wikipédia : Cavalier (échecs)','https://fr.wikipedia.org/wiki/Cavalier_(%C3%A9checs)'],
ex:`Écris ~int KnightDistance(string from, string to)~ avec des cases en notation d'échecs (« a1 », « h8 ») qui renvoie le nombre minimal de coups pour aller de l'une à l'autre. De a1 à h8, il en faut 6. Bonus : renvoie aussi le chemin.`,
hint:`Parcours en largeur (voir la leçon [[bfs-grille]]) avec les 8 sauts possibles : (±1, ±2) et (±2, ±1).`,
sol:`public static int KnightDistance(string from, string to)
{
    (int x, int y) Parse(string s) => (s[0] - 'a', s[1] - '1');
    var start = Parse(from);
    var goal = Parse(to);
    int[] dx = { 1, 2, 2, 1, -1, -2, -2, -1 };
    int[] dy = { 2, 1, -1, -2, -2, -1, 1, 2 };

    var dist = new int[8, 8];
    for (int i = 0; i < 8; i++) for (int j = 0; j < 8; j++) dist[i, j] = -1;
    var queue = new Queue<(int x, int y)>();
    queue.Enqueue(start);
    dist[start.x, start.y] = 0;

    while (queue.Count > 0)
    {
        var (x, y) = queue.Dequeue();
        if ((x, y) == goal) return dist[x, y];
        for (int k = 0; k < 8; k++)
        {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx < 0 || ny < 0 || nx >= 8 || ny >= 8 || dist[nx, ny] >= 0) continue;
            dist[nx, ny] = dist[x, y] + 1;
            queue.Enqueue((nx, ny));
        }
    }
    return -1;
}`},

{id:'exo-huit-dames',cat:'exos',lvl:3,title:'Le problème des huit dames',sum:'Placer 8 dames sans qu\'aucune n\'en menace une autre : il y a exactement 92 solutions.',src:['Wikipédia : Problème des huit dames','https://fr.wikipedia.org/wiki/Probl%C3%A8me_des_huit_dames'],
ex:`Écris ~int CountSolutions(int n)~ qui compte les placements de n dames sur un échiquier n × n. Vérifie : n = 8 donne 92, n = 6 donne 4. Bonus : affiche la première solution.`,
hint:`Une dame par ligne. Garde trois tableaux de booléens : colonnes occupées, diagonales « ligne + colonne » et diagonales « ligne − colonne + n − 1 ».`,
sol:`public static int CountSolutions(int n)
{
    var cols = new bool[n];
    var diag1 = new bool[2 * n - 1];       // r + c
    var diag2 = new bool[2 * n - 1];       // r - c + n - 1
    return Place(0, n, cols, diag1, diag2);
}

private static int Place(int row, int n, bool[] cols, bool[] d1, bool[] d2)
{
    if (row == n) return 1;
    int count = 0;
    for (int c = 0; c < n; c++)
    {
        if (cols[c] || d1[row + c] || d2[row - c + n - 1]) continue;
        cols[c] = d1[row + c] = d2[row - c + n - 1] = true;
        count += Place(row + 1, n, cols, d1, d2);
        cols[c] = d1[row + c] = d2[row - c + n - 1] = false;
    }
    return count;
}`},

{id:'exo-elo',cat:'exos',lvl:2,title:'Classement Elo',sum:'Le système de classement des échecs, repris par de nombreux jeux compétitifs en ligne.',src:['Wikipédia : Classement Elo','https://fr.wikipedia.org/wiki/Classement_Elo'],
ex:`Écris ~double Expected(double ra, double rb)~ (probabilité que A batte B : 1 / (1 + 10^((rb − ra) / 400))) et ~(double, double) Update(double ra, double rb, double scoreA, double k = 32)~ où ~scoreA~ vaut 1 (victoire), 0,5 (nul) ou 0 (défaite). Un joueur à 1600 qui bat un joueur à 2000 gagne environ 29 points.`,
hint:`Nouveau classement = ancien + K × (score réel − score attendu). Ce que A gagne, B le perd.`,
sol:`public static double Expected(double ra, double rb) => 1.0 / (1.0 + Math.Pow(10, (rb - ra) / 400.0));

public static (double newA, double newB) Update(double ra, double rb, double scoreA, double k = 32)
{
    double ea = Expected(ra, rb);
    double delta = k * (scoreA - ea);
    return (ra + delta, rb - delta);
}
// Update(1600, 2000, 1) : A gagne 32 × (1 − 0,091) ≈ 29,1 points`},

{id:'exo-notation-des',cat:'exos',lvl:2,title:'Notation des dés « 3d6+2 »',sum:'Lire et lancer la notation des jeux de rôle, puis calculer la probabilité de chaque résultat.',src:['Wikipédia : Notation des dés','https://en.wikipedia.org/wiki/Dice_notation'],
ex:`Écris ~int Roll(string notation, System.Random rng)~ pour des formules comme « d20 », « 3d6+2 », « 2d8-1 ». Puis ~Dictionary<int, double> Distribution(int count, int sides)~ qui calcule la probabilité exacte de chaque total (pour 2d6, 7 a une probabilité de 6/36).`,
hint:`Une expression régulière : ~^(\\d*)d(\\d+)([+-]\\d+)?$~. Pour la distribution, convolue : commence avec {0: 1}, et pour chaque dé ajoute chaque face possible.`,
sol:`public static int Roll(string notation, System.Random rng)
{
    var m = Regex.Match(notation.Replace(" ", ""), @"^(\\d*)d(\\d+)([+-]\\d+)?$");
    if (!m.Success) throw new FormatException("Notation invalide : " + notation);
    int count = m.Groups[1].Value == "" ? 1 : int.Parse(m.Groups[1].Value);
    int sides = int.Parse(m.Groups[2].Value);
    int bonus = m.Groups[3].Success ? int.Parse(m.Groups[3].Value) : 0;

    int total = bonus;
    for (int i = 0; i < count; i++) total += rng.Next(1, sides + 1);
    return total;
}

public static Dictionary<int, double> Distribution(int count, int sides)
{
    var dist = new Dictionary<int, double> { { 0, 1.0 } };
    for (int i = 0; i < count; i++)
    {
        var next = new Dictionary<int, double>();
        foreach (var kv in dist)
            for (int face = 1; face <= sides; face++)
            {
                next.TryGetValue(kv.Key + face, out double p);
                next[kv.Key + face] = p + kv.Value / sides;
            }
        dist = next;
    }
    return dist;
}`},

{id:'exo-paquet-cartes',cat:'exos',lvl:1,title:'Un paquet de cartes',sum:'Créer 52 cartes, les mélanger équitablement et distribuer des mains.',src:['Wikipédia : Mélange de Fisher-Yates','https://fr.wikipedia.org/wiki/M%C3%A9lange_de_Fisher-Yates'],
ex:`Crée un ~struct Card { Suit suit; int rank; }~ (rangs 1 à 13) et une classe ~Deck~ avec ~Shuffle(System.Random rng)~, ~Card Draw()~ et ~List<List<Card>> Deal(int players, int cardsEach)~ qui distribue une carte à chaque joueur à tour de rôle. ~ToString~ doit afficher « Dame de cœur ».`,
hint:`Pour le mélange, reprends la leçon [[melange-fisher-yates]]. Une Stack<Card> rend ~Draw~ très simple.`,
sol:`public enum Suit { Pique, Coeur, Carreau, Trefle }

public struct Card
{
    public Suit suit;
    public int rank;
    private static readonly string[] Names = { "", "As", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Valet", "Dame", "Roi" };
    private static readonly string[] Suits = { "pique", "cœur", "carreau", "trèfle" };
    public override string ToString() => Names[rank] + " de " + Suits[(int)suit];
}

public class Deck
{
    private List<Card> cards = new List<Card>();

    public Deck()
    {
        foreach (Suit s in Enum.GetValues(typeof(Suit)))
            for (int r = 1; r <= 13; r++) cards.Add(new Card { suit = s, rank = r });
    }

    public int Count => cards.Count;

    public void Shuffle(System.Random rng)
    {
        for (int i = cards.Count - 1; i > 0; i--)
        {
            int j = rng.Next(i + 1);
            var tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp;
        }
    }

    public Card Draw()
    {
        var c = cards[cards.Count - 1];
        cards.RemoveAt(cards.Count - 1);
        return c;
    }

    public List<List<Card>> Deal(int players, int cardsEach)
    {
        var hands = Enumerable.Range(0, players).Select(_ => new List<Card>()).ToList();
        for (int k = 0; k < cardsEach; k++)
            foreach (var hand in hands) hand.Add(Draw());
        return hands;
    }
}`}
]);

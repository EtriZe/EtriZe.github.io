/* Exercices 1 à 25 : échauffement, texte et nombres */
window.LESSONS=(window.LESSONS||[]).concat([
{id:'exo-fizzbuzz',cat:'exos',lvl:1,title:'FizzBuzz',sum:'Le grand classique des entretiens d\'embauche, pour vérifier boucles et conditions.',src:['Wikipédia : Fizz buzz','https://en.wikipedia.org/wiki/Fizz_buzz'],
ex:`Écris ~List<string> FizzBuzz(int n)~ qui renvoie les nombres de 1 à n, en remplaçant les multiples de 3 par « Fizz », ceux de 5 par « Buzz » et ceux de 3 et 5 par « FizzBuzz ». Bonus : ajoute « Bang » pour les multiples de 7 sans réécrire de condition imbriquée.`,
hint:`Construis le texte morceau par morceau : commence par une chaîne vide, ajoute « Fizz » si divisible par 3, « Buzz » si divisible par 5. Si elle est encore vide, mets le nombre.`,
sol:`public static List<string> FizzBuzz(int n)
{
    var rules = new List<(int div, string word)> { (3, "Fizz"), (5, "Buzz"), (7, "Bang") };
    var result = new List<string>(n);
    for (int i = 1; i <= n; i++)
    {
        string s = "";
        foreach (var r in rules)
            if (i % r.div == 0) s += r.word;
        result.Add(s.Length > 0 ? s : i.ToString());
    }
    return result;
}`},

{id:'exo-multiples-3-5',cat:'exos',lvl:1,title:'Somme des multiples de 3 ou 5',sum:'Le tout premier problème de Project Euler, avec une version en temps constant.',src:['Project Euler, problème 1','https://projecteuler.net/problem=1'],
ex:`Écris ~long SumMultiples(int limit)~ qui renvoie la somme des entiers strictement inférieurs à ~limit~ multiples de 3 ou de 5. Fais une version avec une boucle, puis une version sans boucle qui fonctionne pour ~limit~ = 1 milliard.`,
hint:`La somme des multiples de k sous n vaut k × m × (m + 1) / 2 avec m = (n − 1) / k. Multiples de 3 + multiples de 5 − multiples de 15 (comptés deux fois).`,
sol:`public static long SumMultiplesLoop(int limit)
{
    long sum = 0;
    for (int i = 1; i < limit; i++)
        if (i % 3 == 0 || i % 5 == 0) sum += i;
    return sum;
}

private static long SumOf(long k, long limit)
{
    long m = (limit - 1) / k;          // nombre de multiples de k sous limit
    return k * m * (m + 1) / 2;
}

public static long SumMultiples(long limit)
    => SumOf(3, limit) + SumOf(5, limit) - SumOf(15, limit);
// SumMultiples(10) == 23`},

{id:'exo-palindrome',cat:'exos',lvl:1,title:'Palindrome',sum:'Lire une phrase dans les deux sens en ignorant espaces, ponctuation, majuscules et accents.',src:['Wikipédia : Palindrome','https://fr.wikipedia.org/wiki/Palindrome'],
ex:`Écris ~bool IsPalindrome(string text)~ qui ignore la casse, les espaces, la ponctuation et les accents. « Ésope reste ici et se repose » et « Engage le jeu que je le gagne » doivent renvoyer ~true~.`,
hint:`Normalise d'abord : ~Normalize(NormalizationForm.FormD)~ sépare les lettres de leurs accents, qu'on retire avec ~CharUnicodeInfo.GetUnicodeCategory~. Puis compare avec deux indices qui se rapprochent.`,
sol:`public static bool IsPalindrome(string text)
{
    var sb = new StringBuilder();
    foreach (char c in text.Normalize(NormalizationForm.FormD))
    {
        if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark) continue; // accent
        if (char.IsLetterOrDigit(c)) sb.Append(char.ToLowerInvariant(c));
    }
    string s = sb.ToString();
    for (int i = 0, j = s.Length - 1; i < j; i++, j--)
        if (s[i] != s[j]) return false;
    return true;
}`},

{id:'exo-anagrammes',cat:'exos',lvl:1,title:'Anagrammes',sum:'Deux mots utilisent-ils exactement les mêmes lettres ? Utile pour un jeu de lettres.',src:['Exercism : Anagram','https://exercism.org/tracks/csharp/exercises/anagram'],
ex:`Écris ~bool AreAnagrams(string a, string b)~ (« chien » et « niche » : vrai), sans tenir compte de la casse ni des espaces. Puis ~List<string> FindAnagrams(string word, IEnumerable<string> dictionary)~ qui renvoie les anagrammes d'un mot dans une liste, sans le mot lui-même.`,
hint:`Compte les lettres dans un Dictionary<char, int> : +1 pour chaque lettre de a, −1 pour chaque lettre de b. Tout doit revenir à zéro. Ou trie les lettres des deux mots et compare.`,
sol:`private static string Key(string s)
{
    var letters = s.ToLowerInvariant().Where(c => !char.IsWhiteSpace(c)).ToArray();
    Array.Sort(letters);
    return new string(letters);
}

public static bool AreAnagrams(string a, string b) => Key(a) == Key(b);

public static List<string> FindAnagrams(string word, IEnumerable<string> dictionary)
{
    string key = Key(word);
    return dictionary
        .Where(w => !string.Equals(w, word, StringComparison.OrdinalIgnoreCase) && Key(w) == key)
        .ToList();
}`},

{id:'exo-compter-mots',cat:'exos',lvl:1,title:'Les mots les plus fréquents',sum:'Compter les mots d\'un texte, par exemple pour analyser des dialogues.',src:['Exercism : Word Count','https://exercism.org/tracks/csharp/exercises/word-count'],
ex:`Écris ~List<(string word, int count)> TopWords(string text, int n)~ qui renvoie les n mots les plus fréquents, en minuscules, la ponctuation ignorée. En cas d'égalité, l'ordre alphabétique départage.`,
hint:`Découpe avec ~Regex.Matches(text, @"[\\p{L}']+")~ pour garder les lettres accentuées et les apostrophes, puis un dictionnaire de compteurs.`,
sol:`public static List<(string word, int count)> TopWords(string text, int n)
{
    var counts = new Dictionary<string, int>();
    foreach (Match m in Regex.Matches(text.ToLowerInvariant(), @"[\\p{L}']+"))
    {
        string w = m.Value.Trim('\\'');
        if (w.Length == 0) continue;
        counts.TryGetValue(w, out int c);
        counts[w] = c + 1;
    }
    return counts
        .OrderByDescending(p => p.Value)
        .ThenBy(p => p.Key, StringComparer.Ordinal)
        .Take(n)
        .Select(p => (p.Key, p.Value))
        .ToList();
}`},

{id:'exo-titre-majuscules',cat:'exos',lvl:1,title:'Mettre en forme un titre',sum:'Mettre une majuscule à chaque mot, sauf aux petits mots, comme les titres d\'un menu.',
ex:`Écris ~string ToTitle(string s)~ : « le seigneur des anneaux » devient « Le Seigneur des Anneaux ». Les petits mots (le, la, les, de, des, du, et, à, un, une) restent en minuscules, sauf s'ils sont le premier mot.`,
hint:`Découpe sur les espaces, traite chaque mot, puis ~string.Join(" ", ...)~. Un HashSet<string> rend la recherche des petits mots immédiate.`,
sol:`private static readonly HashSet<string> Small = new HashSet<string>
    { "le", "la", "les", "de", "des", "du", "et", "à", "un", "une" };

public static string ToTitle(string s)
{
    var words = s.ToLowerInvariant().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
    for (int i = 0; i < words.Length; i++)
    {
        if (i > 0 && Small.Contains(words[i])) continue;
        words[i] = char.ToUpperInvariant(words[i][0]) + words[i].Substring(1);
    }
    return string.Join(" ", words);
}`},

{id:'exo-cesar',cat:'exos',lvl:1,title:'Chiffre de César',sum:'Décaler les lettres de l\'alphabet : le plus vieux chiffrement connu, parfait pour une énigme de jeu.',src:['Wikipédia : Chiffrement par décalage','https://fr.wikipedia.org/wiki/Chiffrement_par_d%C3%A9calage'],
ex:`Écris ~string Caesar(string text, int shift)~ qui décale chaque lettre de ~shift~ positions (A+3 = D, Z+1 = A), garde la casse et laisse le reste intact. Un décalage négatif doit déchiffrer. Bonus : ~Crack(string cipher)~ retrouve le décalage le plus probable en supposant que « E » est la lettre la plus fréquente.`,
hint:`Pour une lettre majuscule : ~(char)('A' + Mod(c - 'A' + shift, 26))~, avec un modulo qui reste positif pour les décalages négatifs.`,
sol:`private static int Mod(int a, int m) => ((a % m) + m) % m;

public static string Caesar(string text, int shift)
{
    var sb = new StringBuilder(text.Length);
    foreach (char c in text)
    {
        if (c >= 'a' && c <= 'z') sb.Append((char)('a' + Mod(c - 'a' + shift, 26)));
        else if (c >= 'A' && c <= 'Z') sb.Append((char)('A' + Mod(c - 'A' + shift, 26)));
        else sb.Append(c);
    }
    return sb.ToString();
}

public static int Crack(string cipher)
{
    var counts = new int[26];
    foreach (char c in cipher.ToUpperInvariant())
        if (c >= 'A' && c <= 'Z') counts[c - 'A']++;
    int top = Array.IndexOf(counts, counts.Max());
    return Mod(top - ('E' - 'A'), 26);   // le décalage qui a transformé E en la lettre la plus fréquente
}`},

{id:'exo-rle',cat:'exos',lvl:2,title:'Compression RLE',sum:'Le codage par plages, utilisé par d\'anciens formats d\'image et pour compresser des niveaux en tuiles.',src:['Wikipédia : Run-length encoding','https://fr.wikipedia.org/wiki/Run-length_encoding'],
ex:`Écris ~string Encode(string s)~ (« WWWWBBBW » devient « 4W3B1W ») et ~string Decode(string s)~ qui fait l'inverse, y compris pour des nombres à plusieurs chiffres (« 12W »). Application : une ligne de niveau « ....###..... » se stocke en « 4.3#5. ».`,
hint:`À l'encodage, compte tant que le caractère suivant est le même. Au décodage, accumule les chiffres dans un nombre, puis répète le caractère.`,
sol:`public static string Encode(string s)
{
    var sb = new StringBuilder();
    for (int i = 0; i < s.Length; )
    {
        int j = i;
        while (j < s.Length && s[j] == s[i]) j++;
        sb.Append(j - i).Append(s[i]);
        i = j;
    }
    return sb.ToString();
}

public static string Decode(string s)
{
    var sb = new StringBuilder();
    int count = 0;
    foreach (char c in s)
    {
        if (char.IsDigit(c)) count = count * 10 + (c - '0');
        else
        {
            sb.Append(c, Math.Max(count, 1));
            count = 0;
        }
    }
    return sb.ToString();
}`},

{id:'exo-nombres-romains',cat:'exos',lvl:2,title:'Chiffres romains',sum:'Un kata très pratiqué en dojo de code, utile pour numéroter des chapitres ou des suites (Rocky IV).',src:['Wikipédia : Numération romaine','https://fr.wikipedia.org/wiki/Num%C3%A9ration_romaine'],
ex:`Écris ~string ToRoman(int n)~ pour 1 à 3999 (1994 donne MCMXCIV) et ~int FromRoman(string s)~ qui fait l'inverse.`,
hint:`Une table de valeurs triées du plus grand au plus petit, en incluant les cas soustractifs (900 = CM, 400 = CD, 90 = XC…). Pour la lecture : si un symbole est plus petit que le suivant, on le soustrait.`,
sol:`private static readonly int[] Values = { 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1 };
private static readonly string[] Symbols = { "M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I" };

public static string ToRoman(int n)
{
    if (n < 1 || n > 3999) throw new ArgumentOutOfRangeException(nameof(n));
    var sb = new StringBuilder();
    for (int i = 0; i < Values.Length; i++)
        while (n >= Values[i]) { sb.Append(Symbols[i]); n -= Values[i]; }
    return sb.ToString();
}

public static int FromRoman(string s)
{
    var v = new Dictionary<char, int> { {'I',1}, {'V',5}, {'X',10}, {'L',50}, {'C',100}, {'D',500}, {'M',1000} };
    int total = 0;
    for (int i = 0; i < s.Length; i++)
    {
        int cur = v[s[i]];
        bool smallerThanNext = i + 1 < s.Length && cur < v[s[i + 1]];
        total += smallerThanNext ? -cur : cur;
    }
    return total;
}`},

{id:'exo-luhn',cat:'exos',lvl:2,title:'Algorithme de Luhn',sum:'La formule qui vérifie les numéros de carte bancaire, idéale pour valider un code saisi.',src:['Wikipédia : Formule de Luhn','https://fr.wikipedia.org/wiki/Formule_de_Luhn'],
ex:`Écris ~bool IsValidLuhn(string number)~. Les espaces sont autorisés, tout autre caractère non numérique rend le numéro invalide, et il faut au moins deux chiffres. « 4539 3195 0343 6467 » est valide.`,
hint:`En partant de la droite, double un chiffre sur deux ; si le résultat dépasse 9, retire 9. La somme totale doit être un multiple de 10.`,
sol:`public static bool IsValidLuhn(string number)
{
    string digits = number.Replace(" ", "");
    if (digits.Length < 2 || !digits.All(char.IsDigit)) return false;

    int sum = 0;
    bool doubleIt = false;
    for (int i = digits.Length - 1; i >= 0; i--)
    {
        int d = digits[i] - '0';
        if (doubleIt)
        {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
        doubleIt = !doubleIt;
    }
    return sum % 10 == 0;
}`},

{id:'exo-isbn',cat:'exos',lvl:2,title:'Vérifier un ISBN-10',sum:'Une clé de contrôle pondérée, comme celles qui protègent les codes de sauvegarde à recopier.',src:['Wikipédia : ISBN','https://fr.wikipedia.org/wiki/International_Standard_Book_Number'],
ex:`Écris ~bool IsValidIsbn10(string isbn)~. Les tirets sont ignorés, il faut exactement 10 caractères, et le dernier peut être « X » (qui vaut 10). La somme des chiffres pondérés par 10, 9, 8… 1 doit être divisible par 11. « 3-598-21508-8 » est valide.`,
hint:`Parcours les 10 caractères avec un poids qui part de 10. Seul le dernier caractère a le droit d'être X.`,
sol:`public static bool IsValidIsbn10(string isbn)
{
    string s = isbn.Replace("-", "");
    if (s.Length != 10) return false;

    int sum = 0;
    for (int i = 0; i < 10; i++)
    {
        int value;
        if (char.IsDigit(s[i])) value = s[i] - '0';
        else if (i == 9 && (s[i] == 'X' || s[i] == 'x')) value = 10;
        else return false;
        sum += value * (10 - i);
    }
    return sum % 11 == 0;
}`},

{id:'exo-crible',cat:'exos',lvl:2,title:'Crible d\'Ératosthène',sum:'Trouver tous les nombres premiers jusqu\'à n, un algorithme vieux de plus de 2000 ans.',src:['Wikipédia : Crible d\'Ératosthène','https://fr.wikipedia.org/wiki/Crible_d%27%C3%89ratosth%C3%A8ne'],
ex:`Écris ~List<int> Primes(int n)~ avec le crible : on barre les multiples de chaque nombre premier en commençant par son carré. Compare son temps avec un test de primalité naïf pour n = 1 000 000.`,
hint:`Un tableau de booléens ~composite~ de taille n + 1. Pour chaque i tel que i × i ≤ n et non barré, barre i × i, i × i + i, …`,
sol:`public static List<int> Primes(int n)
{
    var composite = new bool[n + 1];
    var primes = new List<int>();
    for (int i = 2; i <= n; i++)
    {
        if (composite[i]) continue;
        primes.Add(i);
        for (long j = (long)i * i; j <= n; j += i)
            composite[j] = true;
    }
    return primes;
}`},

{id:'exo-facteurs-premiers',cat:'exos',lvl:2,title:'Facteurs premiers',sum:'Le kata « Prime Factors », popularisé par Robert C. Martin pour pratiquer le développement piloté par les tests.',src:['Wikipédia : Décomposition en produit de facteurs premiers','https://fr.wikipedia.org/wiki/D%C3%A9composition_en_produit_de_facteurs_premiers'],
ex:`Écris ~List<long> Factors(long n)~ : 360 donne [2, 2, 2, 3, 3, 5], 1 donne une liste vide. Il doit rester rapide pour 600 851 475 143 (Project Euler, problème 3).`,
hint:`Divise par 2 tant que possible, puis par 3, 5, 7… Arrête-toi quand le diviseur au carré dépasse n : ce qui reste (s'il est plus grand que 1) est premier.`,
sol:`public static List<long> Factors(long n)
{
    var result = new List<long>();
    for (long d = 2; d * d <= n; d++)
    {
        while (n % d == 0)
        {
            result.Add(d);
            n /= d;
        }
    }
    if (n > 1) result.Add(n);
    return result;
}`},

{id:'exo-collatz',cat:'exos',lvl:1,title:'Suite de Syracuse',sum:'Une conjecture célèbre et jamais démontrée : un bon terrain pour les boucles et la mise en cache.',src:['Wikipédia : Conjecture de Syracuse','https://fr.wikipedia.org/wiki/Conjecture_de_Syracuse'],
ex:`Écris ~int Steps(long n)~ : si n est pair, on le divise par 2, sinon on fait 3n + 1, jusqu'à atteindre 1 (Steps(6) = 8). Puis trouve le nombre de départ sous un million qui donne la suite la plus longue (Project Euler, problème 14), en mémorisant les résultats déjà calculés.`,
hint:`Un tableau ~cache~ de taille limite : quand la suite passe par un nombre déjà connu, on ajoute sa longueur et on s'arrête.`,
sol:`public static int Steps(long n)
{
    int steps = 0;
    while (n != 1)
    {
        n = n % 2 == 0 ? n / 2 : 3 * n + 1;
        steps++;
    }
    return steps;
}

public static int LongestStart(int limit)
{
    var cache = new int[limit];
    int best = 1, bestLen = 0;
    for (int start = 2; start < limit; start++)
    {
        long n = start;
        int len = 0;
        while (n != 1 && (n >= limit || cache[n] == 0))
        {
            n = n % 2 == 0 ? n / 2 : 3 * n + 1;
            len++;
        }
        len += n == 1 ? 0 : cache[n];
        cache[start] = len;
        if (len > bestLen) { bestLen = len; best = start; }
    }
    return best;   // 837799 pour limit = 1 000 000
}`},

{id:'exo-fibonacci',cat:'exos',lvl:1,title:'Fibonacci, trois façons',sum:'Récursif, mémorisé, itératif : comprendre pourquoi la version naïve explose.',src:['Wikipédia : Suite de Fibonacci','https://fr.wikipedia.org/wiki/Suite_de_Fibonacci'],
ex:`Écris trois versions de ~long Fib(int n)~ (Fib(0) = 0, Fib(1) = 1) : récursive naïve, récursive avec un dictionnaire de cache, et itérative. Mesure le temps de chacune pour n = 40 avec ~Stopwatch~. Jusqu'à quel n un ~long~ suffit-il ?`,
hint:`L'itérative garde seulement les deux derniers termes. Le ~long~ déborde après Fib(92).`,
sol:`public static long FibNaive(int n) => n < 2 ? n : FibNaive(n - 1) + FibNaive(n - 2);

private static readonly Dictionary<int, long> memo = new Dictionary<int, long>();
public static long FibMemo(int n)
{
    if (n < 2) return n;
    if (memo.TryGetValue(n, out long v)) return v;
    return memo[n] = FibMemo(n - 1) + FibMemo(n - 2);
}

public static long Fib(int n)
{
    long a = 0, b = 1;
    for (int i = 0; i < n; i++)
    {
        long next = a + b;
        a = b;
        b = next;
    }
    return a;   // exact jusqu'à n = 92
}`},

{id:'exo-pgcd',cat:'exos',lvl:1,title:'PGCD et format d\'écran',sum:'L\'algorithme d\'Euclide, appliqué à un vrai besoin : afficher 1920 × 1080 sous la forme 16:9.',src:['Wikipédia : Algorithme d\'Euclide','https://fr.wikipedia.org/wiki/Algorithme_d%27Euclide'],
ex:`Écris ~int Gcd(int a, int b)~ et ~int Lcm(int a, int b)~, puis ~string AspectRatio(int width, int height)~ : 1920 × 1080 donne « 16:9 », 2560 × 1080 donne « 64:27 », 1280 × 1024 donne « 5:4 ».`,
hint:`PGCD(a, b) = PGCD(b, a mod b), et PGCD(a, 0) = a. PPCM = a / PGCD × b (diviser d'abord évite les débordements).`,
sol:`public static int Gcd(int a, int b)
{
    while (b != 0)
    {
        int t = a % b;
        a = b;
        b = t;
    }
    return Math.Abs(a);
}

public static int Lcm(int a, int b) => a / Gcd(a, b) * b;

public static string AspectRatio(int width, int height)
{
    int g = Gcd(width, height);
    return $"{width / g}:{height / g}";
}`},

{id:'exo-binaire',cat:'exos',lvl:1,title:'Écrire en binaire',sum:'Convertir et compter les bits à la main, une base pour les masques de calques et les drapeaux.',
ex:`Sans ~Convert.ToString(n, 2)~, écris ~string ToBinary(int n)~ pour n ≥ 0 (13 donne « 1101 ») et ~int CountBits(int n)~ qui compte les bits à 1. Vérifie avec ~LayerMask~ : combien de calques sont dans le masque 0b1011 ?`,
hint:`Le dernier bit est ~n & 1~ (ou ~n % 2~) ; on décale ensuite avec ~n >> 1~. Astuce de Kernighan : ~n &= n - 1~ efface le bit à 1 le plus bas.`,
sol:`public static string ToBinary(int n)
{
    if (n == 0) return "0";
    var sb = new StringBuilder();
    while (n > 0)
    {
        sb.Insert(0, (n & 1) == 1 ? '1' : '0');
        n >>= 1;
    }
    return sb.ToString();
}

public static int CountBits(int n)
{
    int count = 0;
    while (n != 0)
    {
        n &= n - 1;      // retire le bit à 1 le plus bas
        count++;
    }
    return count;        // CountBits(0b1011) == 3
}`},

{id:'exo-pascal',cat:'exos',lvl:1,title:'Triangle de Pascal',sum:'Chaque nombre est la somme des deux au-dessus : listes imbriquées et coefficients binomiaux.',src:['Wikipédia : Triangle de Pascal','https://fr.wikipedia.org/wiki/Triangle_de_Pascal'],
ex:`Écris ~List<List<long>> Pascal(int rows)~ qui renvoie les premières lignes du triangle, puis ~string Pretty(List<List<long>> t)~ qui l'affiche centré. Quelle est la probabilité d'obtenir exactement 3 « pile » sur 5 lancers ? (Indice : ligne 5.)`,
hint:`Chaque ligne commence et finit par 1 ; l'élément k vaut ligne[k − 1] + ligne[k] de la ligne précédente. Probabilité : 10 / 32.`,
sol:`public static List<List<long>> Pascal(int rows)
{
    var t = new List<List<long>>();
    for (int r = 0; r < rows; r++)
    {
        var row = new List<long> { 1 };
        for (int k = 1; k < r; k++)
            row.Add(t[r - 1][k - 1] + t[r - 1][k]);
        if (r > 0) row.Add(1);
        t.Add(row);
    }
    return t;
}

public static string Pretty(List<List<long>> t)
{
    var lines = t.Select(r => string.Join(" ", r)).ToList();
    int width = lines.Last().Length;
    return string.Join("\\n", lines.Select(l => new string(' ', (width - l.Length) / 2) + l));
}`},

{id:'exo-hanoi',cat:'exos',lvl:2,title:'Tours de Hanoï',sum:'Le casse-tête de 1883, présent dans de nombreux jeux d\'énigmes, et l\'exemple parfait de récursivité.',src:['Wikipédia : Tours de Hanoï','https://fr.wikipedia.org/wiki/Tours_de_Hano%C3%AF'],
ex:`Écris ~List<(int disk, char from, char to)> Solve(int n)~ qui renvoie la liste des déplacements pour amener n disques de A vers C. Vérifie qu'il faut 2ⁿ − 1 coups. Bonus : écris une fonction qui vérifie qu'une liste de coups est légale (jamais un disque sur un plus petit).`,
hint:`Pour déplacer n disques de A vers C : déplace n − 1 disques de A vers B, puis le grand disque de A vers C, puis les n − 1 de B vers C.`,
sol:`public static List<(int disk, char from, char to)> Solve(int n)
{
    var moves = new List<(int, char, char)>();
    Move(n, 'A', 'C', 'B', moves);
    return moves;
}

private static void Move(int n, char from, char to, char via, List<(int, char, char)> moves)
{
    if (n == 0) return;
    Move(n - 1, from, via, to, moves);
    moves.Add((n, from, to));
    Move(n - 1, via, to, from, moves);
}

public static bool IsLegal(int n, List<(int disk, char from, char to)> moves)
{
    var pegs = new Dictionary<char, Stack<int>> { {'A', new Stack<int>()}, {'B', new Stack<int>()}, {'C', new Stack<int>()} };
    for (int d = n; d >= 1; d--) pegs['A'].Push(d);
    foreach (var m in moves)
    {
        if (pegs[m.from].Count == 0 || pegs[m.from].Peek() != m.disk) return false;
        if (pegs[m.to].Count > 0 && pegs[m.to].Peek() < m.disk) return false;
        pegs[m.to].Push(pegs[m.from].Pop());
    }
    return pegs['C'].Count == n;
}`},

{id:'exo-levenshtein',cat:'exos',lvl:3,title:'« Vouliez-vous dire… ? »',sum:'La distance de Levenshtein, pour suggérer une commande de console de débogage mal tapée.',src:['Wikipédia : Distance de Levenshtein','https://fr.wikipedia.org/wiki/Distance_de_Levenshtein'],
ex:`Écris ~int Distance(string a, string b)~ (le nombre minimal d'insertions, suppressions et substitutions : « chien » → « chiens » = 1, « kitten » → « sitting » = 3). Puis ~string Suggest(string input, IEnumerable<string> commands)~ qui renvoie la commande la plus proche si sa distance est d'au plus 2, sinon ~null~.`,
hint:`Programmation dynamique : d[i, j] = distance entre les i premières lettres de a et les j premières de b. d[i, j] = min(d[i−1, j] + 1, d[i, j−1] + 1, d[i−1, j−1] + (a[i−1] == b[j−1] ? 0 : 1)).`,
sol:`public static int Distance(string a, string b)
{
    var d = new int[a.Length + 1, b.Length + 1];
    for (int i = 0; i <= a.Length; i++) d[i, 0] = i;
    for (int j = 0; j <= b.Length; j++) d[0, j] = j;

    for (int i = 1; i <= a.Length; i++)
        for (int j = 1; j <= b.Length; j++)
        {
            int cost = a[i - 1] == b[j - 1] ? 0 : 1;
            d[i, j] = Math.Min(Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1), d[i - 1, j - 1] + cost);
        }
    return d[a.Length, b.Length];
}

public static string Suggest(string input, IEnumerable<string> commands)
{
    string best = null;
    int bestDist = int.MaxValue;
    foreach (var c in commands)
    {
        int dist = Distance(input.ToLowerInvariant(), c.ToLowerInvariant());
        if (dist < bestDist) { bestDist = dist; best = c; }
    }
    return bestDist <= 2 ? best : null;
}`},

{id:'exo-parentheses',cat:'exos',lvl:2,title:'Parenthèses équilibrées',sum:'Vérifier ( [ { } ] ) avec une pile : la base de tout analyseur de code ou de formule.',src:['Exercism : Matching Brackets','https://exercism.org/tracks/csharp/exercises/matching-brackets'],
ex:`Écris ~bool IsBalanced(string s)~ qui vérifie que les parenthèses, crochets et accolades sont bien appariés et imbriqués. Les autres caractères sont ignorés. « {[()()]} » est valide, « ([)] » ne l'est pas. Bonus : renvoie la position de la première erreur.`,
hint:`Empile chaque ouvrant. Pour chaque fermant, la pile ne doit pas être vide et son sommet doit être l'ouvrant correspondant. À la fin, la pile doit être vide.`,
sol:`public static bool IsBalanced(string s) => FirstError(s) == -1;

// -1 si tout va bien, sinon l'index du problème (ou s.Length s'il manque des fermants)
public static int FirstError(string s)
{
    var pairs = new Dictionary<char, char> { { ')', '(' }, { ']', '[' }, { '}', '{' } };
    var stack = new Stack<(char c, int index)>();
    for (int i = 0; i < s.Length; i++)
    {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') stack.Push((c, i));
        else if (pairs.ContainsKey(c))
        {
            if (stack.Count == 0 || stack.Peek().c != pairs[c]) return i;
            stack.Pop();
        }
    }
    return stack.Count == 0 ? -1 : s.Length;
}`},

{id:'exo-calculatrice-chaine',cat:'exos',lvl:2,title:'Kata « String Calculator »',sum:'Le kata de Roy Osherove, à faire étape par étape en écrivant un test avant chaque règle.',src:['Roy Osherove : TDD Kata 1','https://osherove.com/tdd-kata-1'],
ex:`Écris ~int Add(string numbers)~ en ajoutant les règles une par une : chaîne vide = 0 ; nombres séparés par des virgules ; les retours à la ligne comptent aussi comme séparateurs ; un séparateur personnalisé peut être déclaré au début avec « //;\\n1;2 » ; les nombres négatifs lèvent une exception qui les liste tous ; les nombres supérieurs à 1000 sont ignorés.`,
hint:`Commence par extraire l'éventuel séparateur personnalisé, puis ~Split~ avec un tableau de séparateurs. Rassemble les négatifs dans une liste avant de lever l'exception.`,
sol:`public static int Add(string numbers)
{
    if (string.IsNullOrEmpty(numbers)) return 0;

    var separators = new List<string> { ",", "\\n" };
    if (numbers.StartsWith("//"))
    {
        int end = numbers.IndexOf('\\n');
        separators.Add(numbers.Substring(2, end - 2));
        numbers = numbers.Substring(end + 1);
    }

    var values = numbers
        .Split(separators.ToArray(), StringSplitOptions.None)
        .Select(int.Parse)
        .ToList();

    var negatives = values.Where(v => v < 0).ToList();
    if (negatives.Count > 0)
        throw new ArgumentException("Nombres négatifs interdits : " + string.Join(", ", negatives));

    return values.Where(v => v <= 1000).Sum();
}`},

{id:'exo-retour-ligne',cat:'exos',lvl:2,title:'Retour à la ligne automatique',sum:'Le kata « Word Wrap » : découper un texte pour une boîte de dialogue de largeur fixe.',src:['Wikipédia : Retour à la ligne','https://en.wikipedia.org/wiki/Line_wrap_and_word_wrap'],
ex:`Écris ~List<string> Wrap(string text, int width)~ qui découpe un texte en lignes d'au plus ~width~ caractères, en coupant entre les mots. Un mot plus long que la largeur est coupé de force. Bonus : renvoie des « pages » de 3 lignes pour une boîte de dialogue de RPG.`,
hint:`Parcours les mots en gardant la ligne courante. Si ajouter le mot (avec un espace) dépasse la largeur, termine la ligne. Pour les mots trop longs, découpe-les en morceaux de ~width~.`,
sol:`public static List<string> Wrap(string text, int width)
{
    var lines = new List<string>();
    var line = new StringBuilder();
    foreach (string raw in text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries))
    {
        string word = raw;
        while (word.Length > width)                       // mot trop long : coupe forcée
        {
            if (line.Length > 0) { lines.Add(line.ToString()); line.Clear(); }
            lines.Add(word.Substring(0, width));
            word = word.Substring(width);
        }
        int needed = line.Length == 0 ? word.Length : line.Length + 1 + word.Length;
        if (needed > width) { lines.Add(line.ToString()); line.Clear(); }
        if (line.Length > 0) line.Append(' ');
        line.Append(word);
    }
    if (line.Length > 0) lines.Add(line.ToString());
    return lines;
}

public static List<List<string>> Pages(string text, int width, int linesPerPage = 3)
{
    var lines = Wrap(text, width);
    var pages = new List<List<string>>();
    for (int i = 0; i < lines.Count; i += linesPerPage)
        pages.Add(lines.Skip(i).Take(linesPerPage).ToList());
    return pages;
}`},

{id:'exo-chrono-speedrun',cat:'exos',lvl:1,title:'Chronomètre de speedrun',sum:'Formater un temps comme les outils de speedrun : minutes, secondes et centièmes.',
ex:`Écris ~string FormatTime(double seconds)~ : 83.456 donne « 1:23.45 », 3725.5 donne « 1:02:05.50 », et un temps négatif (en avance sur le record) s'affiche avec un signe moins : « -0:04.20 ». Les centièmes sont tronqués, pas arrondis.`,
hint:`Travaille en centièmes entiers : ~long cs = (long)Math.Floor(Math.Abs(seconds) * 100)~. Ensuite heures = cs / 360000, etc. N'affiche les heures que si elles sont non nulles.`,
sol:`public static string FormatTime(double seconds)
{
    string sign = seconds < 0 ? "-" : "";
    long cs = (long)Math.Floor(Math.Abs(seconds) * 100 + 1e-6);   // 1e-6 : évite 83.45999…
    long h = cs / 360000;
    long m = cs / 6000 % 60;
    long s = cs / 100 % 60;
    long c = cs % 100;
    return h > 0
        ? $"{sign}{h}:{m:00}:{s:00}.{c:00}"
        : $"{sign}{m}:{s:00}.{c:00}";
}`},

{id:'exo-grands-nombres',cat:'exos',lvl:1,title:'Grands nombres de jeu « idle »',sum:'Afficher 1 234 567 sous la forme « 1,23 M », comme dans Cookie Clicker et les jeux incrémentaux.',src:['Wikipédia : Jeu incrémental','https://fr.wikipedia.org/wiki/Jeu_incr%C3%A9mental'],
ex:`Écris ~string Short(double value)~ : sous 1000, le nombre entier ; ensuite k, M, Md (milliard), Bn (billion)… avec deux décimales et une virgule française : 1 234 567 donne « 1,23 M ». Au-delà des suffixes connus, passe en notation scientifique (« 1,5e21 »).`,
hint:`Divise par 1000 tant que la valeur dépasse 1000, en avançant dans un tableau de suffixes. Pour la virgule, utilise ~CultureInfo.GetCultureInfo("fr-FR")~.`,
sol:`private static readonly string[] Suffixes = { "", " k", " M", " Md", " Bn", " Bd" };
private static readonly CultureInfo Fr = CultureInfo.GetCultureInfo("fr-FR");

public static string Short(double value)
{
    double abs = Math.Abs(value);
    if (abs < 1000) return Math.Floor(value).ToString(Fr);

    int tier = 0;
    while (abs >= 1000 && tier < Suffixes.Length - 1)
    {
        abs /= 1000;
        tier++;
    }
    if (abs >= 1000) return value.ToString("0.##e0", Fr);   // trop grand pour les suffixes

    string sign = value < 0 ? "-" : "";
    return sign + abs.ToString("0.00", Fr) + Suffixes[tier];
}`}
]);

/* Exercices 76 à 100 : systèmes de jeu */
window.LESSONS=(window.LESSONS||[]).concat([
{id:'exo-points-de-vie',cat:'exos',lvl:1,title:'Points de vie avec événements',sum:'Une classe de santé propre, que l\'interface et les effets écoutent sans la connaître.',
ex:`Écris une classe C# simple ~Health~ (sans MonoBehaviour) : ~Max~, ~Current~, ~TakeDamage(int)~, ~Heal(int)~ (sans dépasser le max), une invulnérabilité de ~iFrames~ secondes après chaque coup gérée par ~Tick(float dt)~, et les événements ~Changed(int current, int max)~, ~Damaged(int amount)~ et ~Died~ (déclenché une seule fois). Voir [[delegues-evenements]].`,
hint:`Un minuteur ~invulnerableFor~ décrémenté dans Tick. Dans TakeDamage, ignore le coup si le minuteur est positif ou si la cible est déjà morte.`,
sol:`public class Health
{
    public int Max { get; }
    public int Current { get; private set; }
    public bool IsDead => Current <= 0;
    private readonly float iFrames;
    private float invulnerableFor;

    public event Action<int, int> Changed;
    public event Action<int> Damaged;
    public event Action Died;

    public Health(int max, float iFrames = 0.5f)
    {
        Max = Current = max;
        this.iFrames = iFrames;
    }

    public void Tick(float dt) => invulnerableFor = Math.Max(0f, invulnerableFor - dt);

    public bool TakeDamage(int amount)
    {
        if (amount <= 0 || IsDead || invulnerableFor > 0f) return false;
        Current = Math.Max(0, Current - amount);
        invulnerableFor = iFrames;
        Damaged?.Invoke(amount);
        Changed?.Invoke(Current, Max);
        if (IsDead) Died?.Invoke();
        return true;
    }

    public void Heal(int amount)
    {
        if (amount <= 0 || IsDead) return;
        Current = Math.Min(Max, Current + amount);
        Changed?.Invoke(Current, Max);
    }
}`},

{id:'exo-recharge',cat:'exos',lvl:1,title:'Temps de recharge et charges',sum:'Les compétences à charges multiples, comme les sorts de nombreux MOBA ou le dash de certains jeux d\'action.',
ex:`Écris une classe ~Ability~ avec ~maxCharges~ et ~rechargeTime~ : ~bool TryUse()~ consomme une charge, ~Tick(float dt)~ recharge une charge à la fois, et ~float Fill~ renvoie la progression de la charge en cours (0 à 1) pour l'icône. Quand toutes les charges sont pleines, le minuteur ne tourne pas.`,
hint:`Un compteur ~charges~ et un minuteur ~timer~. Dans Tick, si charges < max : timer += dt ; quand il dépasse rechargeTime, charges++ et timer -= rechargeTime (garde le reste).`,
sol:`public class Ability
{
    public int MaxCharges { get; }
    public float RechargeTime { get; }
    public int Charges { get; private set; }
    private float timer;

    public Ability(int maxCharges, float rechargeTime)
    {
        MaxCharges = Charges = maxCharges;
        RechargeTime = rechargeTime;
    }

    public float Fill => Charges >= MaxCharges ? 1f : timer / RechargeTime;

    public bool TryUse()
    {
        if (Charges == 0) return false;
        Charges--;
        return true;
    }

    public void Tick(float dt)
    {
        if (Charges >= MaxCharges) { timer = 0f; return; }
        timer += dt;
        while (timer >= RechargeTime && Charges < MaxCharges)
        {
            timer -= RechargeTime;
            Charges++;
        }
        if (Charges >= MaxCharges) timer = 0f;
    }
}`},

{id:'exo-inventaire-piles',cat:'exos',lvl:2,title:'Inventaire avec piles',sum:'Des emplacements qui empilent les objets jusqu\'à un maximum, comme dans Minecraft.',src:['Minecraft Wiki : Inventory','https://minecraft.wiki/w/Inventory'],
ex:`Un inventaire a n emplacements ; chaque objet a une taille de pile maximale (64 pour la terre, 16 pour les œufs, 1 pour une épée). Écris ~int Add(string item, int count)~ qui remplit d'abord les piles existantes, puis les emplacements vides, et renvoie le nombre d'objets qui n'ont pas pu entrer. Puis ~bool Remove(string item, int count)~, qui ne retire rien s'il n'y en a pas assez.`,
hint:`Un tableau de ~Slot { string item; int count; }~ (null = vide) et un dictionnaire des tailles de pile. Deux passes pour Add ; pour Remove, vérifie le total avant de toucher à quoi que ce soit.`,
sol:`public class Slot { public string item; public int count; }

public class Inventory
{
    private readonly Slot[] slots;
    private readonly Dictionary<string, int> maxStack;

    public Inventory(int size, Dictionary<string, int> maxStack)
    {
        slots = new Slot[size];
        this.maxStack = maxStack;
    }

    private int Max(string item) => maxStack.TryGetValue(item, out int m) ? m : 64;

    public int Add(string item, int count)
    {
        foreach (var s in slots)                                   // 1. compléter les piles
        {
            if (count == 0) break;
            if (s == null || s.item != item) continue;
            int room = Max(item) - s.count;
            int put = Math.Min(room, count);
            s.count += put; count -= put;
        }
        for (int i = 0; i < slots.Length && count > 0; i++)        // 2. emplacements vides
        {
            if (slots[i] != null) continue;
            int put = Math.Min(Max(item), count);
            slots[i] = new Slot { item = item, count = put };
            count -= put;
        }
        return count;                                              // ce qui reste dehors
    }

    public int CountOf(string item) => slots.Where(s => s != null && s.item == item).Sum(s => s.count);

    public bool Remove(string item, int count)
    {
        if (CountOf(item) < count) return false;
        for (int i = slots.Length - 1; i >= 0 && count > 0; i--)   // vide d'abord les dernières piles
        {
            if (slots[i] == null || slots[i].item != item) continue;
            int take = Math.Min(slots[i].count, count);
            slots[i].count -= take; count -= take;
            if (slots[i].count == 0) slots[i] = null;
        }
        return true;
    }
}`},

{id:'exo-inventaire-grille',cat:'exos',lvl:3,title:'Inventaire en grille',sum:'Ranger des objets de tailles différentes dans une mallette, façon Resident Evil 4 ou Diablo.',src:['Wikipédia : Resident Evil 4','https://fr.wikipedia.org/wiki/Resident_Evil_4'],
ex:`La mallette est une grille de w × h cases. Chaque objet occupe un rectangle (un pistolet 2 × 1, un fusil 4 × 1, une grenade 1 × 1). Écris ~bool CanPlace(int x, int y, int iw, int ih)~, ~bool Place(int id, int x, int y, int iw, int ih)~, ~void Remove(int id)~ et ~bool AutoPlace(int id, int iw, int ih)~ qui cherche la première place libre, en essayant aussi l'objet tourné de 90°.`,
hint:`Un tableau ~int[,] cells~ contenant l'identifiant de l'objet ou 0. AutoPlace parcourt toutes les positions ligne par ligne, puis recommence avec iw et ih échangés.`,
sol:`public class GridInventory
{
    private readonly int[,] cells;
    private readonly int w, h;

    public GridInventory(int w, int h) { this.w = w; this.h = h; cells = new int[w, h]; }

    public bool CanPlace(int x, int y, int iw, int ih)
    {
        if (x < 0 || y < 0 || x + iw > w || y + ih > h) return false;
        for (int i = x; i < x + iw; i++)
            for (int j = y; j < y + ih; j++)
                if (cells[i, j] != 0) return false;
        return true;
    }

    public bool Place(int id, int x, int y, int iw, int ih)
    {
        if (!CanPlace(x, y, iw, ih)) return false;
        for (int i = x; i < x + iw; i++)
            for (int j = y; j < y + ih; j++)
                cells[i, j] = id;
        return true;
    }

    public void Remove(int id)
    {
        for (int i = 0; i < w; i++)
            for (int j = 0; j < h; j++)
                if (cells[i, j] == id) cells[i, j] = 0;
    }

    public bool AutoPlace(int id, int iw, int ih)
    {
        foreach (var (sw, sh) in new[] { (iw, ih), (ih, iw) })
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                    if (Place(id, x, y, sw, sh)) return true;
        return false;
    }
}`},

{id:'exo-artisanat',cat:'exos',lvl:2,title:'Recettes d\'artisanat',sum:'Vérifier qu\'on a les ingrédients, les consommer et produire l\'objet, sans rien perdre en cas d\'échec.',
ex:`Une recette a des ingrédients (~Dictionary<string, int>~) et un résultat (objet et quantité). Avec l'inventaire de l'exercice des piles, écris ~bool CanCraft(Recipe r)~, ~bool Craft(Recipe r)~ (si le résultat ne rentre pas dans l'inventaire, rien n'est consommé), et ~List<Recipe> Available(IEnumerable<Recipe> all)~ pour griser les recettes impossibles.`,
hint:`CanCraft : pour chaque ingrédient, ~CountOf >= quantité~. Craft : retire les ingrédients, essaie d'ajouter le résultat ; s'il en reste dehors, retire ce qui a été ajouté et rends les ingrédients.`,
sol:`public class Recipe
{
    public Dictionary<string, int> ingredients = new Dictionary<string, int>();
    public string result;
    public int resultCount = 1;
}

public class Crafting
{
    private readonly Inventory inv;
    public Crafting(Inventory inv) => this.inv = inv;

    public bool CanCraft(Recipe r) => r.ingredients.All(kv => inv.CountOf(kv.Key) >= kv.Value);

    public bool Craft(Recipe r)
    {
        if (!CanCraft(r)) return false;
        foreach (var kv in r.ingredients) inv.Remove(kv.Key, kv.Value);

        int leftover = inv.Add(r.result, r.resultCount);
        if (leftover > 0)                                   // pas de place : on annule tout
        {
            inv.Remove(r.result, r.resultCount - leftover);
            foreach (var kv in r.ingredients) inv.Add(kv.Key, kv.Value);
            return false;
        }
        return true;
    }

    public List<Recipe> Available(IEnumerable<Recipe> all) => all.Where(CanCraft).ToList();
}`},

{id:'exo-boutique',cat:'exos',lvl:1,title:'Une boutique',sum:'Acheter un objet : argent, stock et niveau requis, avec une raison claire en cas de refus.',
ex:`Écris ~enum BuyResult { Ok, NotEnoughGold, OutOfStock, LevelTooLow }~ et une classe ~Shop~ avec des articles (prix, stock, niveau requis ; stock −1 = illimité). ~BuyResult Buy(Player p, string itemId)~ ne modifie rien si l'achat échoue. Bonus : une réduction de 10 % si le joueur a la carte de fidélité.`,
hint:`Vérifie toutes les conditions avant de modifier quoi que ce soit. Le prix final est calculé une seule fois et arrondi à l'entier.`,
sol:`public enum BuyResult { Ok, NotEnoughGold, OutOfStock, LevelTooLow, UnknownItem }

public class Player { public int gold; public int level; public bool loyaltyCard; public List<string> items = new List<string>(); }

public class ShopItem { public int price; public int stock = -1; public int requiredLevel = 1; }

public class Shop
{
    private readonly Dictionary<string, ShopItem> items = new Dictionary<string, ShopItem>();
    public void Add(string id, ShopItem item) => items[id] = item;

    public int PriceFor(Player p, ShopItem item)
        => p.loyaltyCard ? (int)Math.Round(item.price * 0.9) : item.price;

    public BuyResult Buy(Player p, string itemId)
    {
        if (!items.TryGetValue(itemId, out var item)) return BuyResult.UnknownItem;
        if (p.level < item.requiredLevel) return BuyResult.LevelTooLow;
        if (item.stock == 0) return BuyResult.OutOfStock;
        int price = PriceFor(p, item);
        if (p.gold < price) return BuyResult.NotEnoughGold;

        p.gold -= price;
        if (item.stock > 0) item.stock--;
        p.items.Add(itemId);
        return BuyResult.Ok;
    }
}`},

{id:'exo-modificateurs',cat:'exos',lvl:2,title:'Bonus et malus temporaires',sum:'Un système de modificateurs de statistiques : plats, en pourcentage, avec une durée.',
ex:`Écris une classe ~Stat~ avec une valeur de base et des modificateurs ~(float value, ModType type, float duration, object source)~. Valeur finale = (base + somme des plats) × (1 + somme des pourcentages). ~Tick(float dt)~ retire les modificateurs expirés ; ~RemoveFrom(object source)~ retire ceux d'un objet déséquipé. Une durée de 0 signifie « permanent ».`,
hint:`Une liste de modificateurs, et une valeur mise en cache recalculée seulement quand la liste change (un booléen ~dirty~).`,
sol:`public enum ModType { Flat, Percent }

public class Modifier
{
    public float value; public ModType type; public float remaining; public object source;
    public bool permanent;
}

public class Stat
{
    public float Base { get; set; }
    private readonly List<Modifier> mods = new List<Modifier>();
    private bool dirty = true;
    private float cached;

    public Stat(float baseValue) => Base = baseValue;

    public void Add(float value, ModType type, float duration = 0f, object source = null)
    {
        mods.Add(new Modifier { value = value, type = type, remaining = duration, source = source, permanent = duration <= 0f });
        dirty = true;
    }

    public void RemoveFrom(object source) { if (mods.RemoveAll(m => m.source == source) > 0) dirty = true; }

    public void Tick(float dt)
    {
        foreach (var m in mods)
            if (!m.permanent) m.remaining -= dt;
        if (mods.RemoveAll(m => !m.permanent && m.remaining <= 0f) > 0) dirty = true;
    }

    public float Value
    {
        get
        {
            if (!dirty) return cached;
            float flat = mods.Where(m => m.type == ModType.Flat).Sum(m => m.value);
            float pct = mods.Where(m => m.type == ModType.Percent).Sum(m => m.value);
            cached = (Base + flat) * (1f + pct);
            dirty = false;
            return cached;
        }
    }
}`},

{id:'exo-garde-etats',cat:'exos',lvl:2,title:'L\'IA d\'un garde',sum:'Patrouiller, poursuivre, chercher, abandonner : une machine à états testable sans Unity.',
ex:`Écris une classe ~GuardBrain~ avec les états Patrol, Chase, Search et Return. ~Update(float dt, bool seesPlayer)~ change d'état : voir le joueur → Chase ; le perdre de vue → Search pendant 5 secondes ; Search terminé → Return ; arrivé au poste (méthode ~ArrivedAtPost()~) → Patrol. Ajoute un événement ~StateChanged~ pour jouer les sons « ! » et « ? ». Voir [[machine-etats]].`,
hint:`Un enum et un minuteur d'état remis à zéro à chaque changement. Centralise les transitions dans une méthode ~Enter(State)~ qui déclenche l'événement.`,
sol:`public enum GuardState { Patrol, Chase, Search, Return }

public class GuardBrain
{
    public GuardState State { get; private set; } = GuardState.Patrol;
    public float SearchDuration { get; set; } = 5f;
    public event Action<GuardState, GuardState> StateChanged;
    private float timeInState;

    private void Enter(GuardState next)
    {
        if (next == State) return;
        var previous = State;
        State = next;
        timeInState = 0f;
        StateChanged?.Invoke(previous, next);
    }

    public void ArrivedAtPost()
    {
        if (State == GuardState.Return) Enter(GuardState.Patrol);
    }

    public void Update(float dt, bool seesPlayer)
    {
        timeInState += dt;
        if (seesPlayer) { Enter(GuardState.Chase); return; }

        switch (State)
        {
            case GuardState.Chase:
                Enter(GuardState.Search);
                break;
            case GuardState.Search:
                if (timeInState >= SearchDuration) Enter(GuardState.Return);
                break;
        }
    }
}`},

{id:'exo-vagues',cat:'exos',lvl:2,title:'Vagues d\'ennemis',sum:'Décrire les vagues dans des données et les faire apparaître dans le temps, comme dans un tower defense.',src:['Wikipédia : Tower defense','https://fr.wikipedia.org/wiki/Tower_defense'],
ex:`Une vague est une liste de groupes ~(string enemy, int count, float interval, float delay)~. Écris une classe ~WaveRunner~ avec ~List<string> Tick(float dt)~ qui renvoie les ennemis à faire apparaître pendant ce pas de temps, ~bool WaveFinished~, et ~NextWave()~. Les groupes d'une même vague démarrent chacun après leur ~delay~, et se déroulent en parallèle.`,
hint:`Pour chaque groupe, garde le nombre déjà apparu. Au temps t de la vague, un groupe doit avoir fait apparaître min(count, floor((t − delay) / interval) + 1) ennemis si t ≥ delay. La différence avec le compteur donne ceux à créer maintenant.`,
sol:`public class SpawnGroup { public string enemy; public int count; public float interval; public float delay; }

public class WaveRunner
{
    private readonly List<List<SpawnGroup>> waves;
    private int[] spawned;
    private float time;
    public int WaveIndex { get; private set; }

    public WaveRunner(List<List<SpawnGroup>> waves)
    {
        this.waves = waves;
        Start(0);
    }

    private void Start(int index)
    {
        WaveIndex = index;
        time = 0f;
        spawned = new int[waves[index].Count];
    }

    public bool WaveFinished => waves[WaveIndex].Select((g, i) => spawned[i] >= g.count).All(done => done);

    public bool NextWave()
    {
        if (WaveIndex + 1 >= waves.Count) return false;
        Start(WaveIndex + 1);
        return true;
    }

    public List<string> Tick(float dt)
    {
        time += dt;
        var result = new List<string>();
        var groups = waves[WaveIndex];
        for (int i = 0; i < groups.Count; i++)
        {
            var g = groups[i];
            if (time < g.delay) continue;
            int due = Math.Min(g.count, (int)Math.Floor((time - g.delay) / g.interval) + 1);
            for (; spawned[i] < due; spawned[i]++) result.Add(g.enemy);
        }
        return result;
    }
}`},

{id:'exo-manipulation',cat:'exos',lvl:2,title:'Détecter un quart de cercle',sum:'La manipulation « bas, bas-avant, avant + poing » des jeux de combat, avec une fenêtre de tolérance.',src:['Wikipédia : Street Fighter II','https://fr.wikipedia.org/wiki/Street_Fighter_II:_The_World_Warrior'],
ex:`Les entrées arrivent sous forme de ~(string input, float time)~ : « 2 » (bas), « 3 » (bas-avant), « 6 » (avant), « P » (poing), en notation pavé numérique. Écris une classe ~MotionReader~ avec ~Push(string input, float time)~ et ~bool Detect(string[] sequence, float window)~ : vrai si la séquence apparaît dans l'ordre parmi les entrées récentes, en moins de ~window~ secondes, même avec d'autres entrées intercalées.`,
hint:`Garde les entrées dans une liste et oublie celles qui ont plus d'une seconde. Pour Detect, parcours la séquence à l'envers depuis la dernière entrée : on cherche « P », puis un « 6 » avant, puis un « 3 » avant…`,
sol:`public class MotionReader
{
    private readonly List<(string input, float time)> buffer = new List<(string, float)>();
    private const float Memory = 1f;

    public void Push(string input, float time)
    {
        buffer.Add((input, time));
        buffer.RemoveAll(e => time - e.time > Memory);
    }

    public bool Detect(string[] sequence, float window)
    {
        if (buffer.Count == 0) return false;
        int k = sequence.Length - 1;
        float endTime = buffer[buffer.Count - 1].time;
        if (buffer[buffer.Count - 1].input != sequence[k]) return false;   // la dernière touche déclenche

        for (int i = buffer.Count - 1; i >= 0 && k >= 0; i--)
        {
            if (endTime - buffer[i].time > window) return false;
            if (buffer[i].input == sequence[k]) k--;
        }
        return k < 0;
    }
}
// Hadoken : reader.Detect(new[] { "2", "3", "6", "P" }, 0.5f)`},

{id:'exo-dialogues',cat:'exos',lvl:2,title:'Arbre de dialogue',sum:'Des répliques, des choix et des conditions, comme dans les RPG de BioWare ou Undertale.',
ex:`Écris ~DialogueNode { string id; string speaker; string text; List<Choice> choices; }~ et ~Choice { string text; string next; string requiresFlag; string setsFlag; }~. Une classe ~DialogueRunner~ garde un ensemble de drapeaux et propose ~Current~, ~List<Choice> VisibleChoices()~ (cache ceux dont le drapeau manque) et ~Choose(int index)~. Un nœud sans choix termine la conversation.`,
hint:`Un Dictionary<string, DialogueNode> pour retrouver les nœuds par id, et un HashSet<string> pour les drapeaux. Choose applique ~setsFlag~ puis va au nœud ~next~.`,
sol:`public class Choice { public string text, next, requiresFlag, setsFlag; }
public class DialogueNode { public string id, speaker, text; public List<Choice> choices = new List<Choice>(); }

public class DialogueRunner
{
    private readonly Dictionary<string, DialogueNode> nodes;
    public HashSet<string> Flags { get; } = new HashSet<string>();
    public DialogueNode Current { get; private set; }
    public bool Finished => Current == null || Current.choices.Count == 0;

    public DialogueRunner(IEnumerable<DialogueNode> all, string start)
    {
        nodes = all.ToDictionary(n => n.id);
        Current = nodes[start];
    }

    public List<Choice> VisibleChoices()
        => Current == null ? new List<Choice>()
         : Current.choices.Where(c => string.IsNullOrEmpty(c.requiresFlag) || Flags.Contains(c.requiresFlag)).ToList();

    public void Choose(int index)
    {
        var choice = VisibleChoices()[index];
        if (!string.IsNullOrEmpty(choice.setsFlag)) Flags.Add(choice.setsFlag);
        Current = choice.next != null && nodes.TryGetValue(choice.next, out var n) ? n : null;
    }
}`},

{id:'exo-quetes',cat:'exos',lvl:2,title:'Suivi des quêtes',sum:'« Tuer 10 loups, ramasser 5 herbes » : des objectifs mis à jour par des événements du jeu.',
ex:`Écris ~Objective { string type; string target; int required; int progress; }~ (types « kill », « collect », « talk ») et ~Quest { string title; List<Objective> objectives; }~. Une classe ~QuestLog~ reçoit des événements ~Report(string type, string target, int amount = 1)~, met à jour toutes les quêtes actives concernées, et déclenche ~QuestCompleted(Quest)~ une seule fois quand tous les objectifs sont remplis.`,
hint:`La progression est bornée par ~required~. Après chaque Report, vérifie les quêtes actives et déplace les terminées dans une liste à part pour ne pas les compléter deux fois.`,
sol:`public class Objective
{
    public string type, target; public int required, progress;
    public bool Done => progress >= required;
}

public class Quest
{
    public string title;
    public List<Objective> objectives = new List<Objective>();
    public bool Done => objectives.All(o => o.Done);
}

public class QuestLog
{
    public List<Quest> Active { get; } = new List<Quest>();
    public List<Quest> Completed { get; } = new List<Quest>();
    public event Action<Quest> QuestCompleted;

    public void Accept(Quest q) => Active.Add(q);

    public void Report(string type, string target, int amount = 1)
    {
        foreach (var q in Active)
            foreach (var o in q.objectives)
                if (o.type == type && o.target == target && !o.Done)
                    o.progress = Math.Min(o.required, o.progress + amount);

        foreach (var q in Active.Where(q => q.Done).ToList())
        {
            Active.Remove(q);
            Completed.Add(q);
            QuestCompleted?.Invoke(q);
        }
    }
}`},

{id:'exo-succes',cat:'exos',lvl:1,title:'Succès et trophées',sum:'Des compteurs qui débloquent des succès une seule fois, comme sur Steam ou les consoles.',
ex:`Écris une classe ~Achievements~ : ~Define(string id, string stat, int goal)~ (par exemple « 100 sauts »), ~Increment(string stat, int amount = 1)~ qui met à jour la statistique et débloque les succès atteints, l'événement ~Unlocked(string id)~, et ~float Progress(string id)~. Un succès débloqué ne se redéclenche jamais, même si la statistique est remise à zéro.`,
hint:`Un dictionnaire des statistiques, une liste des définitions et un HashSet des succès débloqués.`,
sol:`public class Achievements
{
    private readonly Dictionary<string, int> stats = new Dictionary<string, int>();
    private readonly Dictionary<string, (string stat, int goal)> defs = new Dictionary<string, (string, int)>();
    private readonly HashSet<string> unlocked = new HashSet<string>();
    public event Action<string> Unlocked;

    public void Define(string id, string stat, int goal) => defs[id] = (stat, goal);

    public int Get(string stat) => stats.TryGetValue(stat, out int v) ? v : 0;

    public void Increment(string stat, int amount = 1)
    {
        stats[stat] = Get(stat) + amount;
        foreach (var kv in defs)
            if (kv.Value.stat == stat && !unlocked.Contains(kv.Key) && stats[stat] >= kv.Value.goal)
            {
                unlocked.Add(kv.Key);
                Unlocked?.Invoke(kv.Key);
            }
    }

    public bool IsUnlocked(string id) => unlocked.Contains(id);

    public float Progress(string id)
    {
        var d = defs[id];
        return IsUnlocked(id) ? 1f : Math.Min(1f, Get(d.stat) / (float)d.goal);
    }
}`},

{id:'exo-migration-sauvegarde',cat:'exos',lvl:2,title:'Migrer une ancienne sauvegarde',sum:'Le jeu a changé, mais les sauvegardes des joueurs doivent toujours se charger.',
ex:`Une sauvegarde est un ~Dictionary<string, object>~ avec un champ ~"version"~. La version 1 stockait ~"hp"~ ; la version 2 l'a renommé ~"health"~ ; la version 3 a ajouté ~"difficulty"~ (par défaut « normal ») et stocke l'or en ~long~. Écris ~Dictionary<string, object> Migrate(Dictionary<string, object> save)~ qui applique les migrations une par une jusqu'à la version 3. Voir [[sauvegarde-json]].`,
hint:`Une liste de fonctions de migration indexée par version de départ, appliquées en boucle tant que la version est inférieure à la version courante. Ne modifie pas le dictionnaire reçu : travaille sur une copie.`,
sol:`public const int CurrentVersion = 3;

private static readonly Dictionary<int, Action<Dictionary<string, object>>> Steps =
    new Dictionary<int, Action<Dictionary<string, object>>>
{
    { 1, s => { s["health"] = s["hp"]; s.Remove("hp"); } },
    { 2, s =>
        {
            if (!s.ContainsKey("difficulty")) s["difficulty"] = "normal";
            if (s.TryGetValue("gold", out var g)) s["gold"] = Convert.ToInt64(g);
        } },
};

public static Dictionary<string, object> Migrate(Dictionary<string, object> save)
{
    var s = new Dictionary<string, object>(save);
    int version = s.TryGetValue("version", out var v) ? Convert.ToInt32(v) : 1;
    while (version < CurrentVersion)
    {
        Steps[version](s);
        version++;
        s["version"] = version;
    }
    return s;
}`},

{id:'exo-sokoban',cat:'exos',lvl:2,title:'Sokoban avec annulation',sum:'Pousser des caisses sur des cibles, et pouvoir annuler chaque coup.',src:['Wikipédia : Sokoban','https://fr.wikipedia.org/wiki/Sokoban'],
ex:`Le niveau est un ~string[]~ avec '#' (mur), '.' (cible), '$' (caisse), '@' (joueur). Écris une classe ~Sokoban~ avec ~bool Move(int dx, int dy)~ (le joueur pousse une caisse s'il y a de la place derrière, jamais deux), ~bool Undo()~ et ~bool Solved~. Voir [[command-undo]].`,
hint:`Stocke les murs et cibles à part (ils ne bougent pas), et l'état mobile (joueur, ensemble des caisses). Avant chaque coup réussi, empile une copie de cet état.`,
sol:`public class Sokoban
{
    private readonly HashSet<(int x, int y)> walls = new HashSet<(int, int)>();
    private readonly HashSet<(int x, int y)> targets = new HashSet<(int, int)>();
    private HashSet<(int x, int y)> boxes = new HashSet<(int, int)>();
    private (int x, int y) player;
    private readonly Stack<((int, int) player, HashSet<(int, int)> boxes)> history = new Stack<((int, int), HashSet<(int, int)>)>();

    public Sokoban(string[] level)
    {
        for (int y = 0; y < level.Length; y++)
            for (int x = 0; x < level[y].Length; x++)
            {
                char c = level[y][x];
                if (c == '#') walls.Add((x, y));
                if (c == '.' || c == '*' || c == '+') targets.Add((x, y));
                if (c == '$' || c == '*') boxes.Add((x, y));
                if (c == '@' || c == '+') player = (x, y);
            }
    }

    public bool Solved => boxes.SetEquals(targets);
    public int Moves => history.Count;

    public bool Move(int dx, int dy)
    {
        var next = (player.x + dx, player.y + dy);
        if (walls.Contains(next)) return false;
        if (boxes.Contains(next))
        {
            var behind = (next.Item1 + dx, next.Item2 + dy);
            if (walls.Contains(behind) || boxes.Contains(behind)) return false;
            history.Push((player, new HashSet<(int, int)>(boxes)));
            boxes.Remove(next);
            boxes.Add(behind);
        }
        else history.Push((player, new HashSet<(int, int)>(boxes)));
        player = next;
        return true;
    }

    public bool Undo()
    {
        if (history.Count == 0) return false;
        var (p, b) = history.Pop();
        player = p;
        boxes = b;
        return true;
    }
}`},

{id:'exo-dijkstra-terrain',cat:'exos',lvl:3,title:'Chemin le moins coûteux sur un terrain',sum:'L\'algorithme de Dijkstra quand la boue et la forêt ralentissent : le cœur des jeux de stratégie.',src:['Wikipédia : Algorithme de Dijkstra','https://fr.wikipedia.org/wiki/Algorithme_de_Dijkstra'],
ex:`Chaque case a un coût de passage (~int[,] cost~ : 1 = route, 3 = forêt, 5 = boue, −1 = infranchissable). Écris ~List<Vector2Int> CheapestPath(int[,] cost, Vector2Int start, Vector2Int goal)~ (4 directions) qui renvoie le chemin de coût total minimal. Bonus : ~Dictionary<Vector2Int, int> Reachable(…, int budget)~ pour afficher les cases accessibles avec un nombre de points de mouvement donné. Voir [[astar]].`,
hint:`Un SortedSet<(int cost, int x, int y)> sert de file de priorité : on retire toujours le plus petit. Garde la meilleure distance connue et le prédécesseur de chaque case.`,
sol:`public static List<Vector2Int> CheapestPath(int[,] cost, Vector2Int start, Vector2Int goal)
{
    int w = cost.GetLength(0), h = cost.GetLength(1);
    var dist = new Dictionary<Vector2Int, int> { { start, 0 } };
    var prev = new Dictionary<Vector2Int, Vector2Int>();
    var open = new SortedSet<(int d, int x, int y)> { (0, start.x, start.y) };
    var dirs = new[] { new Vector2Int(1, 0), new Vector2Int(-1, 0), new Vector2Int(0, 1), new Vector2Int(0, -1) };

    while (open.Count > 0)
    {
        var top = open.Min;
        open.Remove(top);
        var cur = new Vector2Int(top.x, top.y);
        if (top.d > dist[cur]) continue;                 // entrée périmée
        if (cur == goal) break;

        foreach (var d in dirs)
        {
            var n = cur + d;
            if (n.x < 0 || n.y < 0 || n.x >= w || n.y >= h || cost[n.x, n.y] < 0) continue;
            int nd = top.d + cost[n.x, n.y];
            if (dist.TryGetValue(n, out int old) && old <= nd) continue;
            dist[n] = nd;
            prev[n] = cur;
            open.Add((nd, n.x, n.y));
        }
    }

    if (!dist.ContainsKey(goal)) return null;
    var path = new List<Vector2Int> { goal };
    while (path[path.Count - 1] != start) path.Add(prev[path[path.Count - 1]]);
    path.Reverse();
    return path;
}`},

{id:'exo-labyrinthe',cat:'exos',lvl:3,title:'Générer un labyrinthe',sum:'L\'exploration avec retour arrière : un labyrinthe parfait, avec un seul chemin entre deux cases.',src:['Wikipédia : Modélisation mathématique d\'un labyrinthe','https://fr.wikipedia.org/wiki/Mod%C3%A9lisation_math%C3%A9matique_d%27un_labyrinthe'],
ex:`Écris ~bool[,] Generate(int w, int h, int seed)~ qui renvoie une grille de (2w + 1) × (2h + 1) cases où ~true~ est un mur. Les cellules sont aux coordonnées impaires ; on « casse » le mur entre deux cellules voisines en avançant. N'utilise pas de récursivité : une Stack suffit. Puis construis le labyrinthe en cubes dans Unity.`,
hint:`Pars d'une cellule, marque-la visitée et empile-la. Tant que la pile n'est pas vide : regarde la cellule du sommet ; si elle a des voisines non visitées, choisis-en une au hasard, casse le mur entre les deux, et empile-la ; sinon, dépile.`,
sol:`public static bool[,] Generate(int w, int h, int seed)
{
    var rng = new System.Random(seed);
    int W = 2 * w + 1, H = 2 * h + 1;
    var wall = new bool[W, H];
    for (int x = 0; x < W; x++) for (int y = 0; y < H; y++) wall[x, y] = true;

    var visited = new bool[w, h];
    var stack = new Stack<(int x, int y)>();
    stack.Push((0, 0));
    visited[0, 0] = true;
    wall[1, 1] = false;
    int[] dx = { 1, -1, 0, 0 }, dy = { 0, 0, 1, -1 };

    while (stack.Count > 0)
    {
        var (cx, cy) = stack.Peek();
        var options = new List<int>();
        for (int k = 0; k < 4; k++)
        {
            int nx = cx + dx[k], ny = cy + dy[k];
            if (nx >= 0 && ny >= 0 && nx < w && ny < h && !visited[nx, ny]) options.Add(k);
        }
        if (options.Count == 0) { stack.Pop(); continue; }

        int dir = options[rng.Next(options.Count)];
        int tx = cx + dx[dir], ty = cy + dy[dir];
        wall[2 * cx + 1 + dx[dir], 2 * cy + 1 + dy[dir]] = false;   // le mur entre les deux
        wall[2 * tx + 1, 2 * ty + 1] = false;
        visited[tx, ty] = true;
        stack.Push((tx, ty));
    }
    return wall;
}`},

{id:'exo-grottes',cat:'exos',lvl:3,title:'Des grottes par automate cellulaire',sum:'Remplir au hasard, puis lisser plusieurs fois : la technique classique des grottes de rogue-like.',src:['RogueBasin : Cellular Automata Method for Generating Random Cave-Like Levels','https://www.roguebasin.com/index.php/Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels'],
ex:`Écris ~bool[,] Caves(int w, int h, float fill, int steps, int seed)~ : remplis la carte de murs avec la probabilité ~fill~ (environ 0,45), les bords toujours en mur ; puis, à chaque étape, une case devient un mur si au moins 5 des 9 cases de son voisinage (elle comprise) sont des murs. Bonus : supprime les poches isolées en ne gardant que la plus grande zone ouverte (remplissage par diffusion).`,
hint:`Comme pour le jeu de la vie : calcule chaque étape dans une nouvelle grille. Les cases hors de la carte comptent comme des murs.`,
sol:`public static bool[,] Caves(int w, int h, float fill, int steps, int seed)
{
    var rng = new System.Random(seed);
    var map = new bool[w, h];
    for (int x = 0; x < w; x++)
        for (int y = 0; y < h; y++)
            map[x, y] = x == 0 || y == 0 || x == w - 1 || y == h - 1 || rng.NextDouble() < fill;

    for (int s = 0; s < steps; s++)
    {
        var next = new bool[w, h];
        for (int x = 0; x < w; x++)
            for (int y = 0; y < h; y++)
            {
                int walls = 0;
                for (int dx = -1; dx <= 1; dx++)
                    for (int dy = -1; dy <= 1; dy++)
                    {
                        int nx = x + dx, ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= w || ny >= h || map[nx, ny]) walls++;
                    }
                next[x, y] = walls >= 5;
            }
        map = next;
    }
    return map;
}`},

{id:'exo-jour-nuit',cat:'exos',lvl:1,title:'Cycle jour et nuit',sum:'Transformer le temps de jeu en heure du jour, en phase et en intensité de lumière.',
ex:`Une journée de jeu dure ~dayLength~ secondes réelles (par exemple 20 minutes, comme dans Minecraft). Écris ~float HourOfDay(float elapsed, float dayLength, float startHour = 6)~ (0 à 24), ~string Phase(float hour)~ (« aube » 5 h-8 h, « jour », « crépuscule » 18 h-21 h, « nuit ») et ~float SunIntensity(float hour)~ : 0 la nuit, 1 à midi, avec des transitions douces.`,
hint:`Heure = (startHour + elapsed / dayLength × 24) modulo 24. Intensité : une courbe en cosinus centrée sur midi, bornée à 0, par exemple max(0, −cos(heure / 24 × 2π)).`,
sol:`public static float HourOfDay(float elapsed, float dayLength, float startHour = 6f)
    => Mathf.Repeat(startHour + elapsed / dayLength * 24f, 24f);

public static string Phase(float hour)
{
    if (hour >= 5f && hour < 8f) return "aube";
    if (hour >= 8f && hour < 18f) return "jour";
    if (hour >= 18f && hour < 21f) return "crépuscule";
    return "nuit";
}

public static float SunIntensity(float hour)
{
    float x = -Mathf.Cos(hour / 24f * Mathf.PI * 2f);   // -1 à minuit, 1 à midi
    return Mathf.Clamp01(x * 1.2f);                       // un peu de plateau en journée
}`},

{id:'exo-combo-score',cat:'exos',lvl:1,title:'Multiplicateur de combo',sum:'Enchaîner les actions pour multiplier les points, perdre le combo si on s\'arrête trop longtemps.',
ex:`Écris une classe ~ComboScore~ : chaque ~Hit(int basePoints)~ augmente le combo ; le multiplicateur vaut 1 + combo / 10 (plafonné à ×5) ; sans coup pendant 2 secondes (~Tick(float dt)~), le combo retombe à zéro et l'événement ~ComboLost(int combo)~ est déclenché. Garde aussi le meilleur combo de la partie.`,
hint:`Un minuteur remis à 2 secondes à chaque coup. Le multiplicateur est calculé avant d'incrémenter ou après : décide et sois cohérent avec ton affichage.`,
sol:`public class ComboScore
{
    public int Score { get; private set; }
    public int Combo { get; private set; }
    public int BestCombo { get; private set; }
    public float Window { get; set; } = 2f;
    public event Action<int> ComboLost;
    private float timer;

    public float Multiplier => Math.Min(5f, 1f + Combo / 10f);

    public void Hit(int basePoints)
    {
        Combo++;
        BestCombo = Math.Max(BestCombo, Combo);
        Score += (int)Math.Round(basePoints * Multiplier);
        timer = Window;
    }

    public void Tick(float dt)
    {
        if (Combo == 0) return;
        timer -= dt;
        if (timer <= 0f)
        {
            ComboLost?.Invoke(Combo);
            Combo = 0;
        }
    }
}`},

{id:'exo-meilleurs-scores',cat:'exos',lvl:1,title:'Tableau des meilleurs scores',sum:'Garder les 10 meilleurs scores, avec des égalités départagées par la date.',
ex:`Écris une classe ~HighScores~ avec ~int Submit(string name, int score, DateTime date)~ qui renvoie le rang obtenu (1 à 10) ou −1 si le score n'entre pas dans le tableau. À score égal, le plus ancien reste devant. Bonus : sérialise le tableau avec ~JsonUtility~ (une classe d'enveloppe est nécessaire pour une liste).`,
hint:`Insère au bon endroit : la première position dont le score est strictement inférieur. Puis coupe la liste à 10.`,
sol:`[Serializable]
public class ScoreEntry { public string name; public int score; public long ticks; }

public class HighScores
{
    public List<ScoreEntry> entries = new List<ScoreEntry>();
    public int Capacity = 10;

    public int Submit(string name, int score, DateTime date)
    {
        int index = entries.FindIndex(e => e.score < score);   // les égalités restent devant
        if (index < 0) index = entries.Count;
        if (index >= Capacity) return -1;

        entries.Insert(index, new ScoreEntry { name = name, score = score, ticks = date.Ticks });
        if (entries.Count > Capacity) entries.RemoveAt(entries.Count - 1);
        return index + 1;
    }
}`},

{id:'exo-reserve-objets',cat:'exos',lvl:2,title:'Une réserve d\'objets générique',sum:'Réutiliser des objets au lieu de les recréer, avec une taille maximale et un préchauffage.',
ex:`Sans utiliser ~UnityEngine.Pool~, écris ~Pool<T> where T : class~ avec un constructeur qui prend une fonction de création, ~Prewarm(int n)~, ~T Get()~, ~Release(T item)~ (ignore les objets rendus deux fois), une taille maximale au-delà de laquelle les objets rendus sont abandonnés, et les compteurs ~CountActive~ / ~CountInactive~. Voir [[object-pooling]].`,
hint:`Une Stack<T> des objets libres et un HashSet<T> des objets sortis, pour détecter les doubles retours. Des callbacks optionnels ~onGet~ et ~onRelease~ servent à activer et désactiver les GameObject.`,
sol:`public class Pool<T> where T : class
{
    private readonly Func<T> create;
    private readonly Action<T> onGet, onRelease;
    private readonly Stack<T> free = new Stack<T>();
    private readonly HashSet<T> active = new HashSet<T>();
    private readonly int maxSize;

    public Pool(Func<T> create, Action<T> onGet = null, Action<T> onRelease = null, int maxSize = 100)
    {
        this.create = create; this.onGet = onGet; this.onRelease = onRelease; this.maxSize = maxSize;
    }

    public int CountActive => active.Count;
    public int CountInactive => free.Count;

    public void Prewarm(int n)
    {
        while (free.Count < Math.Min(n, maxSize)) free.Push(create());
    }

    public T Get()
    {
        T item = free.Count > 0 ? free.Pop() : create();
        active.Add(item);
        onGet?.Invoke(item);
        return item;
    }

    public void Release(T item)
    {
        if (!active.Remove(item)) return;          // pas sorti d'ici, ou déjà rendu
        onRelease?.Invoke(item);
        if (free.Count < maxSize) free.Push(item);
    }
}`},

{id:'exo-bus-evenements',cat:'exos',lvl:2,title:'Bus d\'événements typé',sum:'Publier un événement sans savoir qui l\'écoute : découpler les systèmes d\'un jeu.',
ex:`Écris une classe statique ~EventBus~ avec ~Subscribe<T>(Action<T> handler)~, ~Unsubscribe<T>(Action<T> handler)~ et ~Publish<T>(T evt)~, où T est une struct d'événement (~struct EnemyKilled { public int points; }~). Un abonné qui se désabonne pendant la publication ne doit pas faire planter la boucle. Voir [[event-bus-so]].`,
hint:`Un Dictionary<Type, Delegate>. ~Delegate.Combine~ et ~Delegate.Remove~ créent un nouveau délégué à chaque fois, ce qui rend la publication sûre même si la liste change pendant l'appel.`,
sol:`public static class EventBus
{
    private static readonly Dictionary<Type, Delegate> handlers = new Dictionary<Type, Delegate>();

    public static void Subscribe<T>(Action<T> handler)
    {
        handlers.TryGetValue(typeof(T), out var existing);
        handlers[typeof(T)] = Delegate.Combine(existing, handler);
    }

    public static void Unsubscribe<T>(Action<T> handler)
    {
        if (!handlers.TryGetValue(typeof(T), out var existing)) return;
        var remaining = Delegate.Remove(existing, handler);
        if (remaining == null) handlers.Remove(typeof(T));
        else handlers[typeof(T)] = remaining;
    }

    public static void Publish<T>(T evt)
    {
        if (handlers.TryGetValue(typeof(T), out var d))
            ((Action<T>)d)(evt);              // instantané : les désabonnements en cours ne gênent pas
    }

    public static void Clear() => handlers.Clear();   // à appeler au changement de scène
}`},

{id:'exo-localisation',cat:'exos',lvl:1,title:'Traduire les textes du jeu',sum:'Une table de traductions avec une langue de secours et des paramètres insérés dans les phrases.',
ex:`Écris une classe ~Localization~ chargée depuis des lignes CSV « clé;fr;en » : ~string Get(string key, params object[] args)~ renvoie le texte dans la langue courante, se rabat sur l'anglais s'il manque, puis affiche « #clé# » si la clé n'existe pas. Les paramètres remplacent {0}, {1}… (« Il te reste {0} vies »). Bonus : une règle de pluriel simple.`,
hint:`Un Dictionary<string, Dictionary<string, string>> : clé → langue → texte. ~string.Format~ insère les paramètres. Attention aux points-virgules dans les textes : pour un vrai projet, utilise un vrai lecteur CSV.`,
sol:`public class Localization
{
    private readonly Dictionary<string, Dictionary<string, string>> table = new Dictionary<string, Dictionary<string, string>>();
    private readonly string[] languages;
    public string Current { get; set; }
    public string Fallback { get; set; } = "en";

    public Localization(IEnumerable<string> csvLines)
    {
        using (var e = csvLines.GetEnumerator())
        {
            e.MoveNext();
            languages = e.Current.Split(';').Skip(1).ToArray();     // en-tête : key;fr;en
            Current = languages[0];
            while (e.MoveNext())
            {
                var cells = e.Current.Split(';');
                var row = new Dictionary<string, string>();
                for (int i = 1; i < cells.Length && i - 1 < languages.Length; i++)
                    if (cells[i].Length > 0) row[languages[i - 1]] = cells[i];
                table[cells[0]] = row;
            }
        }
    }

    public string Get(string key, params object[] args)
    {
        if (!table.TryGetValue(key, out var row)) return "#" + key + "#";
        if (!row.TryGetValue(Current, out var text) && !row.TryGetValue(Fallback, out text)) return "#" + key + "#";
        return args.Length > 0 ? string.Format(text, args) : text;
    }

    public string Plural(string key, int n) => Get(n > 1 ? key + ".many" : key + ".one", n);
}`},

{id:'exo-fantome',cat:'exos',lvl:3,title:'Fantôme de contre-la-montre',sum:'Enregistrer une course et la rejouer en fantôme, comme le mode contre-la-montre de Mario Kart.',
ex:`Écris une classe ~GhostRecorder~ qui enregistre ~(float time, Vector3 position, float rotationY)~ à intervalle fixe (par exemple toutes les 0,1 s, pas à chaque image), et ~GhostPlayer~ avec ~(Vector3 pos, float rotY) Sample(float time)~ qui interpole entre les deux échantillons qui encadrent ~time~. Garde le fantôme du meilleur temps uniquement.`,
hint:`L'enregistrement accumule le temps et ajoute un échantillon quand il dépasse l'intervalle. La lecture fait une recherche (binaire) de l'échantillon précédent, puis ~Vector3.Lerp~ et ~Mathf.LerpAngle~.`,
sol:`public struct GhostFrame { public float time; public Vector3 position; public float rotationY; }

public class GhostRecorder
{
    public List<GhostFrame> Frames { get; } = new List<GhostFrame>();
    private readonly float interval;
    private float time, nextSample;

    public GhostRecorder(float interval = 0.1f) => this.interval = interval;

    public void Record(float dt, Vector3 position, float rotationY)
    {
        time += dt;
        if (time < nextSample) return;
        Frames.Add(new GhostFrame { time = time, position = position, rotationY = rotationY });
        nextSample = time + interval;
    }
}

public class GhostPlayer
{
    private readonly List<GhostFrame> frames;
    public GhostPlayer(List<GhostFrame> frames) => this.frames = frames;

    public (Vector3 pos, float rotY) Sample(float time)
    {
        if (time <= frames[0].time) return (frames[0].position, frames[0].rotationY);
        var last = frames[frames.Count - 1];
        if (time >= last.time) return (last.position, last.rotationY);

        int lo = 0, hi = frames.Count - 1;                  // recherche binaire
        while (hi - lo > 1)
        {
            int mid = (lo + hi) / 2;
            if (frames[mid].time <= time) lo = mid; else hi = mid;
        }
        var a = frames[lo]; var b = frames[hi];
        float t = (time - a.time) / (b.time - a.time);
        return (Vector3.Lerp(a.position, b.position, t), Mathf.LerpAngle(a.rotationY, b.rotationY, t));
    }
}

public static class GhostStore
{
    public static List<GhostFrame> Best;
    public static float BestTime = float.MaxValue;

    public static void Submit(List<GhostFrame> run, float finishTime)
    {
        if (finishTime >= BestTime) return;
        BestTime = finishTime;
        Best = new List<GhostFrame>(run);
    }
}`}
]);

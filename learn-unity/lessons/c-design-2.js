window.COURSES=Object.assign(window.COURSES||{},{
'directeur-ia':{
lead:`Dans Left 4 Dead (Valve, 2008), quatre survivants traversent des niveaux envahis de zombies. Les vagues n'y sont pas placées à la main : un système appelé l'**AI Director** décide en direct quand et où les envoyer, selon l'état des joueurs. Michael Booth, son concepteur, l'a présenté en 2009 dans *The AI Systems of Left 4 Dead*. Son objectif déclaré : produire un **rythme dramatique**. C'est un des meilleurs exemples de rythme piloté par le code.`,
ch:[
['Le rythme, une affaire de contraste',
`Un film d'action n'est pas une explosion continue : il alterne des scènes calmes et des pics de tension. Un jeu, c'est pareil. Une action constante finit par fatiguer et par perdre son effet ; c'est le **contraste** entre tension et répit qui rend les pics mémorables.`,
`Dans un jeu linéaire, le level designer règle ce rythme à la main, rencontre par rencontre. Dans un jeu rejouable comme Left 4 Dead, où l'équipe et ses choix changent à chaque partie, Valve a choisi de le faire régler par un programme.`],
['Mesurer l\'intensité du joueur',
`Le directeur estime pour chaque survivant une **intensité émotionnelle**. Elle monte quand il se passe des choses stressantes (prendre des dégâts, être mis à terre, voir un ennemi mourir tout près), et redescend doucement avec le temps quand rien ne se passe.`,
{c:`public void OnPlayerDamaged(int amount) => Intensity = Mathf.Clamp01(Intensity + amount * 0.01f);
public void OnNearbyKill() => Intensity = Mathf.Clamp01(Intensity + 0.05f);

private void Update()
{
    Intensity = Mathf.Max(0f, Intensity - decayPerSecond * Time.deltaTime);
}`, t:`L'intensité : des événements qui la font monter, une décroissance continue`},
{n:`Le chiffre exact importe peu. Ce qui compte, c'est d'avoir une valeur qui monte avec le stress et redescend au calme. On la règle ensuite en observant des parties.`}],
['Les phases du rythme',
`À partir de cette intensité, le directeur passe par des phases. La présentation de Booth en décrit quatre : **montée** (les ennemis arrivent), **maintien du pic**, **retombée**, puis **relâche**, pendant laquelle les vagues cessent pour laisser souffler l'équipe avant la prochaine montée.`,
{tab:[['Phase','Le directeur…','Le joueur ressent…'],['Montée','envoie des ennemis','la pression qui augmente'],['Pic','maintient la pression quelques secondes','le moment intense'],['Retombée et relâche','coupe les vagues','le soulagement, le temps de se soigner et d\'explorer']]},
`C'est une [[machine-etats]] très simple. L'exercice la réduit à trois états, avec des conditions de sortie liées au temps et à l'intensité.`,
{w:`Le directeur ne doit pas être injuste. Il n'envoie pas de monstres là où les joueurs regardent, ni pendant qu'ils se soignent en relâche. Sa force est d'adapter la pression, pas de tricher.`}],
['Au-delà de Left 4 Dead',
`L'idée d'un directeur qui observe et ajuste se retrouve dans beaucoup de jeux : la créature d'Alien: Isolation, les tempêtes de RimWorld, dont le « narrateur » choisit les événements. Même sans directeur complet, mesurer une intensité et prévoir des **pauses forcées** après les pics améliore presque n'importe quel jeu d'action.`,
{u:`Le directeur peut activer ou couper le composant qui fait apparaître les ennemis (~enabled~), ou publier des événements que les spawners écoutent (voir [[delegues-evenements]]).`}]],
err:[[`De l'action sans pause`,`Sans relâche, le pic ne se distingue plus du reste. Prévois des moments calmes.`],[`Une intensité qui ne redescend jamais`,`Sans décroissance, le directeur reste bloqué au pic.`],[`Tricher visiblement`,`Des ennemis qui apparaissent sous les yeux du joueur cassent l'immersion.`]],
res:[`Le rythme vient du contraste entre tension et répit.`,`L'AI Director de Left 4 Dead mesure l'intensité vécue et règle les vagues.`,`Phases : montée, pic, retombée, relâche.`,`Une valeur qui monte au stress et redescend au calme suffit pour commencer.`],
quiz:[
[`Que fait le directeur de Left 4 Dead pendant la relâche ?`,[`Il envoie un boss`,`Il coupe les vagues pour laisser souffler`,`Il augmente les dégâts`,`Il termine le niveau`],1,`La relâche donne du contraste au prochain pic.`],
[`Pourquoi une action constante est-elle un problème ?`,[`Elle coûte cher en performance`,`Sans contraste, les pics perdent leur effet et le joueur se fatigue`,`Elle est interdite sur console`,`Elle rend le jeu trop facile`],1,`Le rythme vient de l'alternance.`],
[`Quel outil de programmation représente le mieux les phases du directeur ?`,[`Un tri`,`Une machine à états`,`Un dictionnaire`,`Un quaternion`],1,`Chaque phase est un état avec des conditions de passage.`]],
src:[[`Michael Booth (Valve) : The AI Systems of Left 4 Dead (2009, PDF)`,`https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf`]]},

'hasard-equitable':{
lead:`Un vrai tirage au hasard produit des séries : cinq fois la même pièce, vingt coffres sans objet rare. Mathématiquement, c'est normal ; pour le joueur, c'est vécu comme de la malchance, voire comme un jeu truqué. Beaucoup de jeux **contraignent** donc leur hasard. L'exemple le plus connu est le « sac de 7 » de Tetris.`,
ch:[
['Pourquoi le vrai hasard paraît injuste',
`Les humains jugent mal le hasard. On s'attend à ce qu'un résultat « rattrape son retard » après une longue absence, alors qu'un tirage indépendant n'a aucune mémoire. Avec une chance de 5 % par coffre, il y a environ 36 % de chances de ne rien obtenir en 20 coffres (0,95 puissance 20). Sur des milliers de joueurs, beaucoup vivront cette série, et beaucoup penseront que le jeu est cassé.`,
{n:`Le hasard « pur » reste bon quand l'incertitude est le plaisir même : un lancer de dés dans un jeu de plateau, un coup critique occasionnel. Il pose problème quand il bloque la progression.`}],
['Le sac de Tetris',
`Les versions modernes de Tetris utilisent un **générateur par sac** (appelé « Random Generator » dans les règles officielles). On met les sept pièces dans un sac, on les mélange, on les distribue une à une ; quand le sac est vide, on recommence. Conséquences : chaque pièce sort exactement une fois tous les sept tirages, il ne peut jamais y avoir plus de douze pièces entre deux barres I, ni plus de quatre S ou Z d'affilée.`,
`C'est exactement un [[melange-fisher-yates]] appliqué à une liste, puis lue dans l'ordre. Le joueur garde la surprise de l'ordre, sans les séries extrêmes.`,
{c:`var bag = new ShuffleBag<Piece>(allSevenPieces, seed);
Piece next = bag.Next();   // chaque pièce sort une fois par tour de sac`}],
['Le filet de sécurité',
`Pour les objets rares, on utilise souvent un **filet de sécurité** (on lit aussi « pity timer » en anglais) : après un certain nombre d'échecs, le succès est garanti. Une variante augmente progressivement la chance à chaque échec. Le joueur garde l'espoir à chaque tirage, et la pire série possible devient connue et bornée.`,
{tab:[['Technique','Garantie','Inconvénient'],['Tirage indépendant','aucune','séries très longues possibles'],['Sac mélangé','chaque élément une fois par tour','la fin du sac devient prévisible'],['Filet de sécurité','succès au plus tard au N-ième essai','le joueur peut compter'],['Chance croissante','séries courtes, plus rares','plus difficile à expliquer']]},
{w:`Si tu affiches une probabilité au joueur, elle doit être vraie. Annoncer 5 % et appliquer secrètement autre chose pose un problème de confiance, et dans certains pays de réglementation pour les achats aléatoires payants.`}],
['Hasard visible ou caché',
`Certains jeux trichent même **en faveur du joueur** sans le dire : des jeux de stratégie au tour par tour affichent un pourcentage de réussite mais calculent avec une chance un peu plus généreuse, parce que les joueurs vivent un échec à 90 % comme une injustice. C'est un choix de design assumé, mais il faut le savoir pour reconnaître ce que ressentent les joueurs.`,
{u:`Pour qu'un même tirage puisse être rejoué (tests, partage d'une graine), utilise un ~System.Random~ avec une graine plutôt que l'aléatoire global de Unity (voir [[aleatoire]]).`}]],
err:[[`Utiliser un tirage indépendant pour la progression`,`Un objet indispensable ne doit pas dépendre d'une chance de 5 % sans filet.`],[`Un sac partagé entre plusieurs systèmes`,`Chaque système doit avoir son propre sac, sinon les tirages se mélangent.`],[`Afficher une probabilité fausse`,`Le joueur finit par s'en apercevoir.`]],
res:[`Le vrai hasard produit des séries vécues comme injustes.`,`Le sac de Tetris : chaque pièce une fois par tour de sept.`,`Le filet de sécurité borne la pire série.`,`Le hasard peut rester pur quand l'incertitude est le plaisir.`],
quiz:[
[`Avec le sac de 7 de Tetris, combien de fois sort chaque pièce par tour de sac ?`,[`Au hasard`,`Exactement une fois`,`Deux fois`,`Au moins une fois`],1,`Le sac contient une seule copie de chaque pièce.`],
[`Avec 5 % de chance par coffre, combien de chances de rien obtenir en 20 coffres ?`,[`0 %`,`Environ 5 %`,`Environ 36 %`,`100 %`],2,`0,95 puissance 20 vaut environ 0,36.`],
[`Le filet de sécurité garantit…`,[`qu'on obtient toujours l'objet au premier essai`,`que la pire série a une longueur maximale connue`,`qu'il n'y a plus de hasard`,`que l'objet n'apparaît jamais`],1,`Après N échecs, le succès est forcé.`]],
src:[[`Tetris Wiki : Random Generator`,`https://tetris.fandom.com/wiki/Random_Generator`],[`Hard Drop Wiki : Bag`,`https://harddrop.com/wiki/Bag`]]},

'boucles-retroaction':{
lead:`Dans une partie de Monopoly, celui qui possède plus de rues touche plus de loyers, achète encore plus de rues, et finit par écraser les autres. Dans Mario Kart, celui qui est dernier reçoit de meilleurs objets que celui qui est premier. Ce sont deux **boucles de rétroaction**, de sens opposés. Savoir les reconnaître et les doser est un outil central du game design.`,
ch:[
['Boucle positive, boucle négative',
`Une boucle de rétroaction relie le résultat d'une action à la suite de la partie.`,
{tab:[['Boucle','Effet','Exemples'],['**Positive** (le succès renforce le succès)','creuse les écarts, accélère la fin de partie','Monopoly ; dans un jeu de stratégie, plus de territoire donne plus de ressources'],['**Négative** (le jeu aide celui qui est derrière)','resserre les écarts, prolonge la tension','objets de Mario Kart selon la position ; au football, l\'équipe qui encaisse un but récupère le ballon']]},
`« Positive » et « négative » ne veulent pas dire « bonne » et « mauvaise ». Une boucle positive donne de l'élan et permet de **conclure** une partie ; une boucle négative garde la partie **ouverte** jusqu'au bout.`],
['La carapace bleue',
`La carapace bleue, apparue dans Mario Kart 64, file vers le joueur en première position et le fait chuter. Elle illustre la boucle négative la plus célèbre : les meilleurs objets sont distribués aux joueurs de queue, et le premier reçoit surtout des objets défensifs. On parle aussi de **rubber banding** (effet élastique), terme qui désigne aussi les adversaires contrôlés par l'ordinateur qui accélèrent quand ils sont distancés.`,
`L'intérêt est clair dans un jeu entre amis de niveaux différents : tout le monde garde une chance, la course reste animée. Le prix aussi : un joueur excellent peut perdre sur un coup de malchance, ce qui frustre les compétiteurs.`,
{c:`float t = (position - 1) / (float)(racers - 1);           // 0 = premier, 1 = dernier
weights[i] = Mathf.Lerp(Items[i].front, Items[i].back, t); // poids selon la position`, t:`L'interpolation des poids, cœur de l'exercice (voir [[interpolation]])`}],
['Doser les boucles',
`Presque tous les jeux combinent les deux. Un jeu de stratégie laisse la boucle positive jouer (l'avance s'accumule) mais ajoute des freins : coûts d'entretien qui grandissent avec l'empire, rébellions, coalitions des autres joueurs. Un jeu de combat en ligne peut donner au joueur en difficulté une attaque spéciale plus puissante.`,
{l:[`Si les parties se décident trop tôt et que le perdant s'ennuie : trop de boucle positive.`,`Si le meilleur joueur ne gagne presque jamais : trop de boucle négative.`,`Si les parties s'éternisent : la boucle négative empêche de conclure.`]},
{n:`Une boucle négative est mieux acceptée quand elle est **visible et compréhensible** (le joueur voit qu'il reçoit un meilleur objet parce qu'il est dernier) que quand elle est cachée (des adversaires qui accélèrent sans raison).`}],
['Dans les données',
`Une boucle se règle par des chiffres : les poids de chaque objet selon la position, le coût d'entretien par ville. On les range dans des tables modifiables, idéalement dans des ScriptableObjects (voir [[scriptableobjects]]), puis on simule des parties pour observer les écarts. Un simple tableau des positions moyennes à l'arrivée en dit beaucoup.`]],
err:[[`Une boucle positive sans frein`,`Le premier gagne toujours ; la partie est jouée après quelques minutes.`],[`Une boucle négative trop forte`,`Bien jouer ne sert plus à rien.`],[`Une aide cachée et incohérente`,`Le joueur sent la manipulation sans la comprendre.`]],
res:[`Boucle positive : le succès renforce le succès et creuse les écarts.`,`Boucle négative : le jeu aide celui qui est derrière et resserre les écarts.`,`La carapace bleue de Mario Kart est une boucle négative célèbre.`,`On combine les deux et on règle par les données.`],
quiz:[
[`Dans Monopoly, posséder plus de rues donne plus d'argent pour en acheter d'autres. C'est une boucle…`,[`positive`,`négative`,`neutre`,`aléatoire`],0,`Le succès renforce le succès.`],
[`À quoi sert surtout une boucle négative ?`,[`À finir la partie vite`,`À garder la partie ouverte et serrée`,`À punir le dernier`,`À économiser de la mémoire`],1,`Elle aide celui qui est derrière.`],
[`Dans la fonction RollItem, que vaut t pour le premier ?`,[`0`,`0,5`,`1`,`le nombre de joueurs`],0,`(1 − 1) / (n − 1) = 0 : on prend les poids « en tête ».`]],
src:[[`Wikipédia (en) : Blue shell`,`https://en.wikipedia.org/wiki/Blue_shell`],[`Game Developer : Rubber-banding as a design requirement`,`https://gamedeveloper.com/design/rubber-banding-as-a-design-requirement`]]},

'camera-plateforme':{
lead:`Dans un jeu en 2D à défilement, la caméra décide de ce que le joueur voit, donc de ce qu'il peut anticiper. Une caméra mal réglée rend un bon jeu pénible : elle tremble à chaque petit saut, cache les ennemis devant, ou perd le joueur dans une chute. En 2015, Itay Keren (auteur de Mushroom 11) a recensé à la GDC les techniques utilisées depuis des décennies dans *Scroll Back: The Theory and Practice of Cameras in Side-Scrollers*. Ce cours en reprend les principales.`,
ch:[
['Ce que doit faire une caméra',
`Une caméra de jeu de plateforme a trois missions qui se contredisent souvent : **montrer** ce dont le joueur a besoin pour décider (surtout ce qui est devant lui), **bouger le moins possible** pour ne pas fatiguer les yeux, et **ne jamais perdre** le personnage.`,
`La caméra qui suit le joueur exactement, collée à lui, remplit la troisième mission mais rate les deux autres : chaque petit mouvement fait bouger tout l'écran. Les techniques ci-dessous sont des façons de relâcher ce lien.`],
['La fenêtre de caméra',
`On définit une zone au centre de l'écran. Tant que le joueur reste dedans, la caméra ne bouge pas ; quand il en sort, elle le pousse juste assez pour qu'il reste au bord. C'est la technique la plus simple, et elle supprime déjà la plupart des petits mouvements.`,
{c:`if (px > cam.x + halfWindow) cam.x = px - halfWindow;
else if (px < cam.x - halfWindow) cam.x = px + halfWindow;`, t:`Fenêtre horizontale : la caméra ne bouge que si le joueur sort de la zone`}],
['L\'accrochage aux plateformes',
`Verticalement, suivre chaque saut donne vite le mal de mer. La solution utilisée notamment par Super Mario World : la caméra ne change de hauteur que lorsque le joueur **atterrit** sur une nouvelle plateforme, et elle y va en douceur. Pendant le saut, l'horizon reste immobile, ce qui aide justement à viser l'atterrissage.`,
{w:`Il faut une exception pour les chutes : si le joueur tombe vite et sort de l'écran par le bas, la caméra doit le suivre directement, sinon il disparaît.`},
`Le déplacement en douceur utilise une interpolation indépendante du nombre d'images par seconde, comme dans [[smoothdamp-ressort]] ou avec un facteur exponentiel.`],
['Regarder devant',
`Un joueur qui court vers la droite a besoin de voir ce qui arrive à droite. On décale donc la caméra **dans la direction du mouvement** (on parle d'anticipation ou de « lookahead »). Pour éviter les allers-retours quand le joueur se retourne souvent, on attend qu'il ait parcouru une certaine distance dans la nouvelle direction avant de basculer. Keren décrit aussi des **zones d'attention** : un boss ou un objectif attire la caméra vers lui pour que le joueur le voie.`,
{tab:[['Technique','Problème résolu'],['Fenêtre','les petits mouvements font trembler l\'écran'],['Accrochage aux plateformes','les sauts font monter et descendre l\'horizon'],['Anticipation de direction','le joueur ne voit pas ce qui arrive'],['Zones d\'attention','un élément important reste hors de l\'écran'],['Suivi direct en chute','le joueur sort de l\'écran']]},
{u:`Dans Unity, le paquet Cinemachine propose une zone morte et des amortissements configurables qui reprennent plusieurs de ces idées. Écrire sa propre caméra une fois aide à comprendre ses réglages (voir aussi [[camera-suivi]]).`}]],
err:[[`Caméra collée au joueur`,`Chaque mouvement fait bouger l'écran ; c'est fatigant.`],[`Suivre chaque saut verticalement`,`L'horizon monte et descend sans cesse.`],[`Oublier les chutes rapides`,`Avec l'accrochage, le joueur peut sortir de l'écran par le bas.`],[`Déplacer la caméra dans Update`,`Elle doit bouger après le joueur : ~LateUpdate~.`]],
res:[`Une caméra montre ce qui compte, bouge peu et ne perd jamais le joueur.`,`Fenêtre : la caméra ne bouge que si le joueur sort d'une zone.`,`Accrochage : la hauteur change à l'atterrissage, sauf en chute rapide.`,`Anticipation et zones d'attention montrent ce qui arrive.`],
quiz:[
[`Avec une fenêtre de caméra, quand la caméra bouge-t-elle ?`,[`À chaque image`,`Quand le joueur sort de la zone centrale`,`Jamais`,`Quand le joueur saute`],1,`À l'intérieur de la fenêtre, elle reste immobile.`],
[`Pourquoi accrocher la hauteur aux plateformes ?`,[`Pour économiser des calculs`,`Pour que l'horizon reste stable pendant les sauts`,`Pour cacher les ennemis`,`Pour ralentir le joueur`],1,`Un horizon immobile aide à viser l'atterrissage.`],
[`Dans quelle méthode déplacer une caméra qui suit le joueur ?`,[`Awake`,`FixedUpdate`,`LateUpdate`,`OnEnable`],2,`Après que le joueur a bougé dans Update.`]],
src:[[`Game Developer : Itay Keren, Scroll Back, The Theory and Practice of Cameras in Side-Scrollers`,`https://www.gamedeveloper.com/design/scroll-back-the-theory-and-practice-of-cameras-in-side-scrollers`],[`Documentation Unity : Cinemachine`,`https://docs.unity3d.com/Packages/com.unity.cinemachine@latest`]]},

'accessibilite':{
lead:`L'accessibilité consiste à permettre au plus grand nombre de jouer : personnes malvoyantes, malentendantes, avec des difficultés motrices ou cognitives, mais aussi joueurs fatigués, qui jouent d'une main ou dans le bruit. Ce cours s'appuie sur les **Game Accessibility Guidelines**, une référence rédigée par des développeurs et des spécialistes, et sur l'exemple du mode Assistance de Celeste.`,
ch:[
['Une référence : les Game Accessibility Guidelines',
`Les Game Accessibility Guidelines classent leurs recommandations en trois niveaux : **basique** (simple à faire et utile à beaucoup), **intermédiaire** et **avancé**. Elles sont regroupées par domaine : moteur, vision, audition, cognition, parole et général. Le niveau basique est le bon point de départ : la plupart des recommandations coûtent peu si on y pense tôt.`,
{tab:[['Domaine','Exemples de recommandations'],['Moteur','pouvoir réattribuer les touches ; éviter les appuis maintenus ou proposer une bascule ; régler la vitesse du jeu'],['Vision','texte assez grand et contrasté ; ne pas transmettre une information par la couleur seule'],['Audition','sous-titres lisibles, avec le nom de qui parle ; indications visuelles des sons importants'],['Cognition','pouvoir revoir les tutoriels ; objectifs rappelés ; pas de limite de temps obligatoire'],['Général','options proposées dès le premier lancement ; réduire secousses et flashs']]}],
['Le mode Assistance de Celeste',
`Celeste est réputé très difficile, et propose pourtant un **mode Assistance** remarquable par sa finesse : vitesse du jeu réglable jusqu'à 50 %, endurance infinie pour s'accrocher aux murs, sauts aériens supplémentaires, invincibilité, et possibilité de passer des chapitres. Chaque option est indépendante : on peut ralentir le jeu sans devenir invincible.`,
`Le message du jeu est clair : la difficulté prévue par les auteurs est celle du mode normal, mais chacun peut adapter l'expérience pour y accéder. Le jeu ne perd rien pour les joueurs qui veulent le défi complet.`,
{n:`Des réglages **granulaires** (chacun à part) valent mieux qu'un seul mode « facile ». Un joueur qui a du mal avec la vitesse n'a pas forcément besoin de plus de vie.`}],
['Maintenir ou basculer',
`Maintenir un bouton longtemps (pour viser, courir, se baisser) est pénible et parfois impossible pour certaines personnes. La solution est très simple à coder : une option « maintenir ou basculer ». En mode basculer, chaque appui inverse l'état.`,
{c:`if (settings.aimToggle)
{
    if (Input.GetButtonDown("Fire2")) Aiming = !Aiming;   // un appui allume, le suivant éteint
}
else
{
    Aiming = Input.GetButton("Fire2");                    // actif tant qu'on maintient
}`},
{u:`Le nouvel Input System de Unity permet aussi la réattribution des touches à l'exécution et la sauvegarde des choix du joueur (voir [[input-system]]).`}],
['Régler la vitesse du jeu',
`Ralentir le jeu passe par ~Time.timeScale~ (voir [[time-scale-pause]]). Il faut alors penser à deux choses : réduire ~Time.fixedDeltaTime~ dans la même proportion pour garder une physique fluide, et ne pas écraser la pause (un ~timeScale~ à 0).`,
{w:`Toutes les options doivent être accessibles **avant** de jouer, et idéalement dès le premier écran. Une option enfouie derrière le premier niveau ne sert pas à la personne qui ne peut pas finir ce niveau.`},
`Ranger les réglages dans un ScriptableObject (voir [[scriptableobjects]]) les rend accessibles à tous les scripts, et faciles à sauvegarder.`]],
err:[[`Une information par la couleur seule`,`Ajoute une forme, une icône ou un son.`],[`Un seul mode facile`,`Propose des réglages séparés.`],[`Des options tardives`,`Le joueur doit pouvoir régler le jeu avant de commencer.`],[`Oublier fixedDeltaTime`,`En ralentissant le jeu, la physique devient saccadée.`]],
res:[`Les Game Accessibility Guidelines : niveaux basique, intermédiaire, avancé.`,`Réattribuer les touches, bascule au lieu de maintien, sous-titres, pas d'information par la couleur seule.`,`Le mode Assistance de Celeste : des réglages séparés, jusqu'à 50 % de vitesse.`,`La plupart des options coûtent peu si on y pense tôt.`],
quiz:[
[`Pourquoi proposer « basculer » au lieu de « maintenir » ?`,[`Pour la performance`,`Maintenir un bouton est pénible ou impossible pour certains joueurs`,`C'est obligatoire sur PC`,`Pour rendre le jeu plus dur`],1,`Une option simple qui aide beaucoup de joueurs.`],
[`Jusqu'à quelle vitesse le mode Assistance de Celeste permet-il de ralentir le jeu ?`,[`90 %`,`75 %`,`50 %`,`10 %`],2,`La vitesse peut descendre jusqu'à 50 %.`],
[`En ralentissant le jeu avec timeScale, que faut-il aussi ajuster ?`,[`La résolution`,`Time.fixedDeltaTime`,`Le volume`,`Rien`],1,`Sinon la physique est calculée moins souvent et paraît saccadée.`]],
src:[[`Game Accessibility Guidelines`,`https://gameaccessibilityguidelines.com/`],[`Game Accessibility Guidelines : le mode Assistance de Celeste`,`https://gameaccessibilityguidelines.com/celeste-assist-mode`],[`Game Developer : Celeste's remarkably granular assist options`,`https://gamedeveloper.com/design/check-out-i-celeste-s-i-remarkably-granular-assist-options`]]},

'economie-jeu':{
lead:`Dès qu'un jeu a une monnaie, des ressources ou de l'expérience, il a une **économie**. Si l'or arrive plus vite qu'il ne part, il perd sa valeur : tout devient abordable, et plus rien ne motive. S'il part trop vite, le joueur se sent bloqué. Les designers raisonnent pour cela en **sources** (en anglais *faucets*, les robinets) et en **puits** (*sinks*, les éviers).`,
ch:[
['Sources et puits',
`Une **source** fait entrer de la valeur dans le jeu : ennemis qui donnent de l'or, quêtes, coffres, récompenses quotidiennes. Un **puits** la fait sortir : achats chez un marchand, réparations, taxes, améliorations, objets consommables.`,
{tab:[['Sources (entrées)','Puits (sorties)'],['ennemis vaincus, butin','achats d\'équipement'],['quêtes et récompenses','réparations et entretien'],['vente d\'objets aux marchands','consommables : potions, munitions'],['récompenses de connexion','améliorations au coût croissant'],['production (fermes, mines)','frais, taxes, voyages']]},
`L'image de la baignoire aide : la quantité d'or dans les poches des joueurs est l'eau. Si les robinets coulent plus fort que l'évier n'évacue, la baignoire déborde : c'est l'**inflation**.`],
['L\'inflation dans les jeux en ligne',
`Dans un jeu en ligne persistant, les monstres réapparaissent sans fin : la source ne s'arrête jamais. Sans puits suffisants, la masse d'or augmente pour tout le monde, les prix entre joueurs explosent, et les nouveaux venus ne peuvent plus rien acheter. Simon Ludgate a décrit ce phénomène dans les jeux massivement multijoueurs ; les grands jeux en ligne y répondent par des puits réguliers : réparations, frais d'enchères, objets cosmétiques coûteux.`,
{n:`Un bon puits est **désiré**. Un joueur paie volontiers pour un bel objet ou une amélioration ; il paie à contrecœur une taxe. Les puits subis doivent rester faibles.`}],
['Simuler avant de jouer',
`Les guides de Unity sur l'économie de jeu recommandent de modéliser l'économie avant de l'implémenter : des feuilles de calcul ou un petit programme qui simule une heure de jeu minute par minute. C'est ce que fait l'~EconomySimulator~ de l'exercice : on voit tout de suite si les améliorations arrivent trop vite ou si le joueur stagne.`,
{c:`gold += income - repair;            // source moins puits subi
while (gold >= upgradeCost)          // puits désiré
{
    gold -= upgradeCost;
    level++;
    upgradeCost *= 1.35f;            // coût exponentiel : le rythme ralentit
}`, t:`Le cœur de la simulation`},
{w:`Avec des gains linéaires et des coûts exponentiels, le temps entre deux améliorations finit toujours par exploser. C'est voulu au début (le rythme ralentit), mais il faut vérifier que ça reste supportable en fin de partie.`}],
['Les autres ressources',
`Le raisonnement vaut pour tout ce qui s'accumule : l'expérience, les munitions, le bois et la pierre d'un jeu de construction, l'énergie d'un jeu mobile. Pour chaque ressource, pose-toi trois questions : d'où vient-elle, où part-elle, et que se passe-t-il au bout de dix heures ? Les valeurs vivent bien dans des ScriptableObjects (voir [[scriptableobjects]]), et la simulation se lance depuis un menu de l'éditeur (voir [[menuitem-contextmenu]]).`]],
err:[[`Des sources sans puits`,`L'or s'accumule et perd tout intérêt.`],[`Des puits uniquement punitifs`,`Payer sans rien recevoir frustre.`],[`Régler à la main en jouant`,`On ne joue jamais dix heures pour tester ; simule.`]],
res:[`Sources : la valeur entre. Puits : elle sort.`,`Sources plus fortes que les puits : inflation.`,`Les meilleurs puits sont désirés par le joueur.`,`On simule l'économie avant de la régler en jeu.`],
quiz:[
[`Une réparation d'équipement est…`,[`une source`,`un puits`,`ni l'un ni l'autre`,`une boucle positive`],1,`Elle fait sortir de l'or du jeu.`],
[`Que se passe-t-il si les sources dépassent durablement les puits ?`,[`Pénurie`,`Inflation : l'or perd sa valeur`,`Rien`,`Le jeu plante`],1,`La masse de monnaie augmente.`],
[`Pourquoi simuler l'économie dans un script ?`,[`Pour la performance`,`Pour voir des heures de jeu en un instant`,`C'est obligatoire dans Unity`,`Pour éviter les sauvegardes`],1,`On teste des réglages sans jouer des heures.`]],
src:[[`Unity : guide de conception d'économie de jeu, partie 2`,`https://unity.com/how-to/building-game-economy-guide-part-2`],[`Unity : Game economy design guide`,`https://unity.com/resources/game-economy-design-guide`],[`Game Developer : Simon Ludgate, The F Words of MMOs: Faucets`,`https://gamedeveloper.com/design/the-f-words-of-mmos-faucets`]]}
});
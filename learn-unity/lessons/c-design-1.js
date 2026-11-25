window.COURSES=Object.assign(window.COURSES||{},{
'mda':{
lead:`Pour parler d'un jeu avec précision, il faut un vocabulaire. Le cadre **MDA** (Mechanics, Dynamics, Aesthetics), publié en 2004 par Robin Hunicke, Marc LeBlanc et Robert Zubek, est le plus utilisé pour cela. Il a été enseigné pendant plusieurs années au Game Design and Tuning Workshop de la GDC. Son idée tient en une phrase : le designer agit sur les règles, mais le joueur ne vit que des émotions, et le lien entre les deux passe par ce qui se produit quand le jeu tourne.`,
ch:[
['Trois couches',
`MDA découpe un jeu en trois couches qui dépendent les unes des autres.`,
{tab:[['Couche','Ce que c\'est','Exemple dans un jeu de tir en arène'],['**Mécaniques**','Les règles et les données : actions possibles, chiffres, algorithmes','dégâts de chaque arme, temps de réapparition des bonus, vitesse de course'],['**Dynamiques**','Le comportement du jeu en marche, quand les mécaniques rencontrent les joueurs','les joueurs « campent » près du lance-roquettes, des duels autour des bonus'],['**Esthétiques**','Les émotions que le joueur ressent','la tension du duel, la fierté d\'un beau tir, le plaisir de jouer entre amis']]},
`Le point essentiel est le **sens de lecture**. Le designer part des mécaniques : il ne peut toucher qu'à elles. Le joueur part de l'autre bout : il ressent d'abord une émotion, puis comprend des dynamiques, et ne voit presque jamais les mécaniques. Quand un joueur dit « ce jeu est ennuyeux », il parle d'esthétique ; ton travail est de remonter jusqu'à la mécanique responsable.`,
{n:`Les dynamiques ne s'écrivent pas : elles **émergent**. Personne n'a programmé « les joueurs campent près du lance-roquettes ». C'est la conséquence d'une arme trop forte posée à un endroit fixe. C'est pour cela qu'on teste avec de vrais joueurs.`}],
['Les huit esthétiques',
`Plutôt que de dire qu'un jeu est « fun », MDA propose huit types de plaisir. Un jeu en vise souvent quelques-uns, rarement tous.`,
{tab:[['Esthétique','Le plaisir de…','Exemples de jeux'],['Sensation','percevoir : image, son, toucher','Rez, Tetris Effect'],['Fantasy','être quelqu\'un d\'autre, ailleurs','Skyrim, The Sims'],['Narrative','vivre une histoire','The Last of Us'],['Challenge','surmonter un obstacle','Celeste, Dark Souls'],['Fellowship','jouer avec les autres','Overcooked, Among Us'],['Discovery','explorer, découvrir','Outer Wilds, Zelda: Breath of the Wild'],['Expression','s\'exprimer, créer','Minecraft, Mario Maker'],['Submission','se détendre, passer le temps','Stardew Valley, les jeux mobiles « idle »']]},
`Choisir ses esthétiques **avant** de concevoir évite de mauvais compromis. Un jeu qui vise le challenge acceptera une forte punition à l'échec ; un jeu qui vise la submission la rendra presque nulle. Les deux choix sont bons, mais pas dans le même jeu.`],
['Remonter le fil : un exemple',
`Imaginons un jeu de plateforme. Les testeurs disent qu'ils « s'énervent » dans le niveau 3 (esthétique ratée : on voulait du challenge, on obtient de la frustration). On observe la dynamique : ils meurent beaucoup au même saut et refont une minute de niveau à chaque fois. On en déduit les mécaniques en cause : le point de sauvegarde est trop loin, et le saut demande une précision au pixel.`,
`On ne change pas l'esthétique directement : on rapproche le checkpoint (mécanique), ce qui raccourcit la boucle d'échec (dynamique), ce qui rend la difficulté acceptable (esthétique). C'est exactement ce que fait Celeste, où l'on réapparaît immédiatement au début de l'écran.`,
{u:`Pour observer les dynamiques, rien ne vaut des chiffres : où les joueurs meurent, combien de temps ils restent dans une zone. C'est l'objet de l'exercice : un petit système de télémétrie, qu'on pourra plus tard exporter en JSON (voir [[sauvegarde-json]]).`}],
['Les limites du cadre',
`MDA a été critiqué, et connaître ces critiques aide à bien l'utiliser. Il parle peu de l'histoire, du son et des graphismes, qui ne sont ni vraiment des mécaniques ni des dynamiques. La liste des huit esthétiques n'est pas exhaustive. Des variantes existent, comme DDE (Design, Dynamics, Experience). Retiens MDA comme une **lentille**, pas comme une loi : un moyen de poser les bonnes questions.`]],
err:[[`Concevoir à partir des émotions seulement`,`« Il faut que ce soit épique » ne dit pas quoi programmer. Traduis toujours une esthétique visée en mécaniques testables.`],[`Croire qu'on contrôle les dynamiques`,`Elles émergent. Prévois des tests avec des joueurs qui ne connaissent pas le jeu.`],[`Viser les huit esthétiques`,`Un jeu qui veut tout faire n'excelle nulle part. Choisis-en deux ou trois.`]],
res:[`Mécaniques : les règles. Dynamiques : ce qui se passe en jeu. Esthétiques : ce que ressent le joueur.`,`Le designer agit sur les mécaniques ; le joueur perçoit d'abord les esthétiques.`,`Huit esthétiques : sensation, fantasy, narrative, challenge, fellowship, discovery, expression, submission.`,`Un problème d'émotion se règle en remontant jusqu'à une mécanique.`],
quiz:[
[`Dans MDA, à quelle couche appartient « les joueurs se regroupent tous au même endroit de la carte » ?`,[`Mécanique`,`Dynamique`,`Esthétique`,`Aucune`],1,`C'est un comportement qui émerge quand le jeu tourne : une dynamique.`],
[`Par quelle couche le joueur aborde-t-il un jeu ?`,[`Les mécaniques`,`Les dynamiques`,`Les esthétiques`,`Le code source`],2,`Le joueur ressent d'abord ; il ne voit presque jamais les règles exactes.`],
[`Stardew Valley vise surtout…`,[`Challenge`,`Submission et Fantasy`,`Fellowship uniquement`,`Narrative uniquement`],1,`Un jeu détendant, où l'on vit une autre vie à la ferme.`]],
src:[[`Hunicke, LeBlanc, Zubek : MDA, A Formal Approach to Game Design and Game Research (2004, PDF)`,`https://users.cs.northwestern.edu/~hunicke/MDA.pdf`],[`Wikipédia (en) : MDA framework`,`https://en.wikipedia.org/wiki/MDA_framework`]]},

'choix-interessants':{
lead:`Sid Meier, créateur de Civilization, résume souvent le jeu vidéo ainsi : **un jeu est une suite de choix intéressants**. Il l'a formulé dès une conférence de 1989 et l'a détaillé dans une conférence à la GDC 2012. La phrase est célèbre, mais la partie utile est la suite : qu'est-ce qui rend un choix intéressant, et comment repérer ceux qui ne le sont pas ?`,
ch:[
['Un choix qui n\'en est pas un',
`Un choix n'est pas intéressant quand une option est **toujours** meilleure. Si l'épée A fait plus de dégâts, frappe plus vite et coûte moins cher que l'épée B, il n'y a rien à décider : l'épée B n'existe que pour encombrer l'inventaire. On dit que A **domine** B.`,
`Un choix n'est pas intéressant non plus quand le joueur n'a **aucune information** pour décider (deux portes identiques, l'une tue au hasard), ou quand le choix n'a **aucune conséquence** visible.`,
{l:[`**Option dominante** : une réponse est toujours la bonne. Le choix disparaît.`,`**Choix aveugle** : rien ne permet de raisonner. C'est un tirage au sort.`,`**Choix sans effet** : quoi qu'on fasse, la suite est la même.`]}],
['Les ingrédients d\'un bon choix',
`À l'inverse, un choix devient intéressant quand il combine plusieurs de ces éléments.`,
{tab:[['Ingrédient','Exemple'],['Un **compromis** : gagner quelque chose en perdant autre chose','Dans Civilization, construire une merveille ou une armée'],['Une **situation** qui change la bonne réponse','La même arme est excellente contre un ennemi, mauvaise contre un autre'],['Un **risque** à évaluer','Dans Slay the Spire, une salle d\'élite rapporte une relique mais peut coûter la partie'],['Une **conséquence** durable','Spécialiser son personnage ferme d\'autres voies'],['Assez d\'**information**','Les intentions affichées des ennemis de Slay the Spire permettent de prévoir']]},
`Le cas du risque contre la récompense est le plus courant : plus une option rapporte, plus elle doit coûter ou exposer. C'est ce que vérifie l'exercice, qui génère des offres dont aucune ne domine les autres.`],
['Détecter les dominations dans les données',
`Avec beaucoup d'objets, on ne voit plus les dominations à l'œil nu. On les cherche dans les données : pour deux options, si l'une est au moins aussi bonne sur tous les critères et strictement meilleure sur un, elle domine l'autre. C'est la notion d'**optimum de Pareto**.`,
{c:`foreach (var a in weapons)
    foreach (var b in weapons)
        if (a != b && b.damage >= a.damage && b.speed >= a.speed && b.cost <= a.cost
            && (b.damage > a.damage || b.speed > a.speed || b.cost < a.cost))
            Debug.LogWarning($"{b.name} domine {a.name} : {a.name} ne sera jamais choisi.");`, t:`Un test d'équilibrage qu'on peut lancer depuis un menu de l'éditeur`},
{u:`Ce genre de vérification se range très bien dans un outil d'éditeur qui valide les ScriptableObjects d'armes (voir [[validation-assets]]).`}],
['Moins de choix, mais meilleurs',
`Sid Meier insiste aussi sur la **quantité** : trop de choix noie le joueur, et il finit par cliquer au hasard ou chercher la réponse sur Internet. Trois options bien distinctes valent mieux que dix presque identiques. C'est pour cela que tant de jeux « roguelike » proposent exactement trois récompenses après un combat.`]],
err:[[`Équilibrer en rendant tout identique`,`Si toutes les armes ont les mêmes chiffres, le choix disparaît aussi. Chaque option doit avoir une force et une faiblesse.`],[`Cacher l'information`,`Un choix sans indice est un pari. Montre les chiffres ou les conséquences probables.`],[`Multiplier les options`,`Au-delà de quelques options, le joueur ne compare plus vraiment.`]],
res:[`Un jeu est une suite de choix intéressants (Sid Meier).`,`Un choix meurt s'il y a une option dominante, aucune information ou aucune conséquence.`,`Les bons choix reposent sur des compromis, des risques et des situations changeantes.`,`On peut détecter les dominations automatiquement dans les données.`],
quiz:[
[`L'arme A est meilleure que B sur tous les critères. Que dire ?`,[`Le choix est intéressant`,`A domine B : B ne sera jamais choisie`,`Il faut ajouter une arme C`,`Rien, c'est normal`],1,`Une option dominée n'est jamais un bon choix ; il faut lui donner un avantage réel.`],
[`Pourquoi beaucoup de jeux proposent-ils trois récompenses ?`,[`Pour économiser de la mémoire`,`Assez pour comparer, assez peu pour décider vite`,`C'est imposé par les consoles`,`Par hasard`],1,`Peu d'options bien distinctes rendent la comparaison possible.`],
[`Deux portes identiques, l'une mène à un piège mortel au hasard. Ce choix est…`,[`intéressant`,`aveugle`,`dominant`,`équilibré`],1,`Sans information, le joueur ne peut pas raisonner : c'est un tirage au sort.`]],
src:[[`GDC Vault : Sid Meier, Interesting Decisions (GDC 2012)`,`https://gdcvault.com/play/1015756/Interesting`],[`Game Developer : Sid Meier on how to see games as sets of interesting decisions`,`https://gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions`]]},

'game-feel':{
lead:`Prends deux jeux identiques sur le papier : mêmes règles, mêmes niveaux. Dans l'un, frapper un ennemi produit un léger arrêt, un flash, un son sec et une secousse ; dans l'autre, la barre de vie baisse simplement. Le premier paraît vivant, le second paraît vide. Cette différence porte un nom : le **game feel**. Ce cours s'appuie sur le livre de Steve Swink (2008) et sur deux conférences devenues des classiques.`,
ch:[
['Ce qu\'est le game feel',
`Steve Swink définit le game feel comme le **contrôle en temps réel d'objets virtuels dans un espace simulé, avec des interactions soulignées par du polish**. Les trois éléments comptent :`,
{l:[`**Contrôle en temps réel** : le joueur agit en continu et voit la réponse immédiatement, comme quand il conduit.`,`**Espace simulé** : les objets ont des positions, des collisions, une physique, même simplifiée.`,`**Polish** : les effets qui ne changent pas les règles mais rendent l'interaction convaincante.`]},
`Le polish est la partie la plus accessible pour un débutant. Swink le résume ainsi : si on retirait tout le polish, le jeu fonctionnerait pareil, mais le joueur le trouverait beaucoup moins convaincant.`],
['« Juice it or lose it »',
`En 2012, Martin Jonasson et Petri Purho ont présenté **Juice it or lose it** (GDC Europe, Independent Games Summit). Ils partent d'un casse-briques tout à fait basique et ajoutent un effet après l'autre : les briques apparaissent en tombant, la balle s'étire avec la vitesse, la raquette se déforme au contact, des particules, du son, de la musique. Le jeu ne change pas, mais il devient beaucoup plus agréable.`,
`Le **juice**, c'est cela : un retour généreux et immédiat à chaque action du joueur. Ce qui compte n'est pas un effet en particulier, mais la règle générale : **chaque action mérite une réaction**.`],
['« The Art of Screenshake »',
`Un an plus tard, Jan Willem Nijman (studio Vlambeer, auteur de Nuclear Throne) a montré la même idée sur un jeu de tir. Parmi ses techniques, plusieurs sont devenues des réflexes :`,
{tab:[['Technique','Effet sur le joueur'],['**Secousse de caméra**','l\'impact est ressenti physiquement'],['**Hit stop** (figer le jeu quelques centièmes de seconde)','le coup semble lourd, on a le temps de le « voir »'],['**Recul** (knockback) de l\'ennemi et du joueur','la force a une direction'],['**Flash** de l\'ennemi touché','on sait immédiatement qu\'on a touché'],['**Permanence** (douilles, corps, traces qui restent)','le monde garde la mémoire du combat'],['Gros projectiles, flash à la bouche du canon','le tir est lisible et puissant']]},
{w:`Le hit stop modifie ~Time.timeScale~. Il faut alors attendre en temps réel (~WaitForSecondsRealtime~), sinon la coroutine ne se termine jamais. Voir [[time-scale-pause]].`},
{c:`private static IEnumerator HitStop(float duration)
{
    Time.timeScale = 0f;
    yield return new WaitForSecondsRealtime(duration);
    Time.timeScale = 1f;
}`, t:`Le hit stop en quatre lignes`}],
['Le revers : trop de juice',
`Le juice a aussi ses critiques. Folmer Kelly, dans une conférence intitulée en réponse « Don't juice it or lose it », rappelle que les effets peuvent masquer un jeu creux, fatiguer les yeux ou noyer l'information. Une secousse permanente rend un jeu illisible, et peut rendre malade une partie des joueurs.`,
{n:`Règle pratique : un effet doit **renforcer** une information (« tu as touché », « c'était un gros coup »), pas la cacher. Et toute secousse ou flash fort doit pouvoir être réduit dans les options (voir [[accessibilite]]).`}]],
err:[[`Ajouter du juice à un jeu qui ne fonctionne pas`,`Les effets ne réparent pas une mécanique ennuyeuse. Règle d'abord le jeu, puis le ressenti.`],[`Le même effet pour tout`,`Si chaque action secoue l'écran autant, plus rien n'est important. Dose selon la force de l'action.`],[`Hit stop avec WaitForSeconds`,`Avec ~timeScale~ à 0, le temps de jeu ne passe plus : utilise le temps réel.`]],
res:[`Game feel : contrôle en temps réel, espace simulé, polish (Swink).`,`Le juice : chaque action du joueur reçoit une réaction généreuse.`,`Techniques classiques : secousse, hit stop, recul, flash, permanence.`,`Trop d'effets nuisent à la lisibilité ; prévois une option pour les réduire.`],
quiz:[
[`Que se passe-t-il si on retire tout le polish d'un jeu ?`,[`Il ne fonctionne plus`,`Il fonctionne pareil mais paraît moins convaincant`,`Il devient plus difficile`,`Il plante`],1,`Le polish ne change pas les règles, seulement la perception.`],
[`Le hit stop consiste à…`,[`ralentir le joueur après un coup`,`figer brièvement le jeu au moment de l'impact`,`arrêter la musique`,`empêcher les attaques trop rapprochées`],1,`Quelques centièmes de seconde suffisent à donner du poids au coup.`],
[`Pourquoi ~WaitForSecondsRealtime~ pour un hit stop ?`,[`C'est plus précis`,`Avec timeScale à 0, WaitForSeconds ne se terminerait jamais`,`C'est obligatoire dans les coroutines`,`Pour économiser des calculs`],1,`WaitForSeconds compte en temps de jeu, qui ne s'écoule plus.`]],
src:[[`Steve Swink : Game Feel, A Game Designer's Guide to Virtual Sensation (2008)`,`https://www.routledge.com/Game-Feel-A-Game-Designers-Guide-to-Virtual-Sensation/Swink/p/book/9780123743282`],[`GDC Vault : Jonasson et Purho, Juice It or Lose It (2012)`,`https://gdcvault.com/play/1016789/Juice-It-or-Lose`],[`Game Developer : les conseils de Jan Willem Nijman (Vlambeer) pour les jeux d'action`,`https://gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games`],[`Game Developer : Folmer Kelly, Don't juice it or lose it`,`https://gamedeveloper.com/design/video-indies-resist-the-urge-to-juice-it-or-lose-it-`],[`Wikipédia (en) : Game feel`,`https://en.wikipedia.org/wiki/Game_feel`]]},

'tolerance-controles':{
lead:`Un joueur qui rate un saut dans un jeu de plateforme pense presque toujours : « j'avais appuyé ! ». Souvent, il a raison à quelques images près. Les bons jeux de plateforme corrigent ces petits écarts en silence. Maddy Thorson, créatrice de Celeste, a détaillé ces corrections dans un article intitulé *Celeste & Forgiveness*. Ce cours les explique une par une, puis les implémente dans Unity.`,
ch:[
['Le principe : interpréter l\'intention',
`Le joueur ne voit pas les images une à une. Entre le moment où il décide d'agir et le moment où son doigt appuie, il s'écoule du temps ; l'écran lui-même a un peu de retard. Un jeu qui exige l'image exacte punit donc le joueur pour des choses qu'il ne peut pas percevoir. La **tolérance** consiste à accepter une petite fenêtre autour de l'instant idéal.`,
{n:`La tolérance ne rend pas un jeu facile. Celeste est très exigeant. Elle rend le jeu **juste** : quand on échoue, c'est qu'on a vraiment raté.`}],
['Le coyote time',
`Le nom vient du coyote des dessins animés qui court dans le vide avant de tomber. Pendant une courte durée après avoir quitté le bord d'une plateforme, le joueur peut **encore sauter** comme s'il était au sol. Sans cela, un joueur qui appuie juste un peu trop tard tombe, alors qu'il voyait ses pieds au bord.`,
{c:`sinceGrounded = grounded ? 0f : sinceGrounded + Time.deltaTime;
bool canJump = sinceGrounded <= coyoteTime;   // 0,1 s : quelques images`}],
['La mémoire d\'appui (jump buffer)',
`C'est le cas inverse : le joueur appuie sur saut **juste avant** de toucher le sol. Sans mémoire, l'appui est perdu et rien ne se passe. Avec une mémoire, le jeu se souvient de l'appui pendant une courte durée et déclenche le saut dès l'atterrissage.`,
{c:`sincePressed = Input.GetButtonDown("Jump") ? 0f : sincePressed + Time.deltaTime;
if (sincePressed <= bufferTime && sinceGrounded <= coyoteTime)
{
    Jump();
    sincePressed = sinceGrounded = 999f;   // l'appui est consommé
}`, t:`Les deux minuteurs se combinent dans une seule condition`},
{w:`N'oublie pas de « consommer » les minuteurs après le saut. Sinon, le coyote time permet un second saut en l'air.`}],
['Les autres corrections de Celeste',
`Maddy Thorson en décrit plusieurs autres. Elles ont toutes la même logique : corriger les cas où le joueur perçoit un résultat différent de ce que le jeu calcule.`,
{tab:[['Technique','Ce qu\'elle corrige'],['**Gravité réduite au sommet du saut** (quand on maintient le bouton)','donne plus de temps pour viser l\'atterrissage'],['**Correction de coin**','si la tête touche à peine le coin d\'un plafond, le personnage est décalé de quelques pixels au lieu d\'être stoppé'],['**Saut variable**','relâcher le bouton tôt donne un saut plus court : le joueur contrôle la hauteur'],['**Chute plus lourde que la montée**','le saut paraît moins flottant, plus nerveux']]},
`La gravité variable se règle simplement avec ~gravityScale~ du ~Rigidbody2D~ selon le signe de la vitesse verticale (voir [[rigidbody-forces]]).`],
['Ailleurs que dans les jeux de plateforme',
`Le même principe sert partout : une fenêtre d'« input buffer » dans les jeux de combat pour enchaîner les coups, une légère aide à la visée sur manette dans les jeux de tir, des boîtes de collision des balles ennemies plus petites que leur dessin dans les shoot'em up. Dans tous les cas, on penche en faveur du joueur.`,
{n:`La règle de base : les zones qui **blessent** le joueur peuvent être un peu plus petites que leur image ; les zones qui l'**aident** (bord d'une plateforme, objet à ramasser) un peu plus grandes.`}]],
err:[[`Une fenêtre trop large`,`Au-delà de quelques dixièmes de seconde, le joueur sent qu'il saute dans le vide. Reste autour de 0,1 s.`],[`Ne pas consommer les minuteurs`,`Le coyote time devient un double saut involontaire.`],[`Tester au clavier seulement`,`Une manette a d'autres délais : teste sur le matériel visé.`]],
res:[`Le jeu interprète l'intention du joueur plutôt que l'image exacte.`,`Coyote time : on peut sauter juste après avoir quitté le sol.`,`Mémoire d'appui : un saut demandé juste avant l'atterrissage est exécuté.`,`Autres aides : gravité réduite au sommet, correction de coin, saut variable.`,`Les zones dangereuses peuvent être plus petites que leur image, les zones utiles plus grandes.`],
quiz:[
[`Le coyote time permet…`,[`un double saut`,`de sauter peu après avoir quitté le bord`,`de courir plus vite`,`de planer`],1,`Une courte fenêtre après la chute où le saut reste possible.`],
[`Le joueur appuie sur saut 50 ms avant de toucher le sol. Que fait la mémoire d'appui ?`,[`Elle ignore l'appui`,`Elle déclenche le saut à l'atterrissage`,`Elle fait sauter en l'air`,`Elle ralentit le temps`],1,`L'appui est mémorisé brièvement puis exécuté.`],
[`Pourquoi remettre les minuteurs à une grande valeur après le saut ?`,[`Pour la performance`,`Pour éviter un deuxième saut grâce au coyote time`,`Pour réinitialiser la gravité`,`Ce n'est pas utile`],1,`Sinon les conditions restent vraies une image de plus.`]],
src:[[`Maddy Thorson : Celeste & Forgiveness`,`https://maddymakesgames.com/articles/celeste_and_forgiveness/`],[`Documentation Unity : Rigidbody2D.gravityScale`,`https://docs.unity3d.com/ScriptReference/Rigidbody2D-gravityScale.html`]]},

'telegraphie':{
lead:`Un ennemi qui frappe sans prévenir n'est pas difficile, il est injuste : le joueur ne peut éviter que ce qu'il voit venir. **Télégraphier** une attaque, c'est l'annoncer clairement avant qu'elle ne frappe. Les jeux réputés difficiles, comme Dark Souls ou Sekiro, sont justement ceux qui télégraphient le mieux. Ce cours décompose une attaque en trois phases et montre comment les régler.`,
ch:[
['Les trois phases d\'une attaque',
`Une analyse détaillée de Dark Souls 3 publiée sur Game Developer découpe chaque attaque en trois phases, que l'on retrouve dans presque tous les jeux d'action.`,
{tab:[['Phase','Ce que voit le joueur','Ce qu\'il doit faire'],['**Anticipation**','l\'ennemi lève son arme, se ramasse, brille','comprendre ce qui arrive et choisir : esquiver, parer, s\'éloigner'],['**Actif**','le coup part ; seule cette phase blesse','exécuter sa réponse au bon moment'],['**Récupération**','l\'ennemi est déséquilibré, revient en garde','punir : c\'est la fenêtre de riposte']]},
`L'anticipation vient directement des **12 principes de l'animation** de Disney : avant un mouvement important, le personnage prépare le geste dans la direction opposée. En jeu, ce principe devient une information de gameplay.`],
['Régler les durées',
`Les trois durées forment l'identité d'un ennemi. Une longue anticipation et une longue récupération donnent un ennemi lent et lourd, qu'on apprend vite à punir. Une anticipation courte donne un ennemi vif et dangereux. La récupération est la récompense : sans elle, le joueur ne peut que fuir.`,
{c:`[SerializeField] private float anticipation = 0.6f;  // lisible
[SerializeField] private float active = 0.15f;        // bref
[SerializeField] private float recovery = 0.8f;       // fenêtre de riposte`, t:`Des valeurs réglables dans l'inspecteur, pour équilibrer sans recompiler`},
{n:`Une longue anticipation ne rend pas toujours un coup plus facile. Les attaques « retardées » de certains boss gardent le bras levé plus longtemps que prévu pour piéger le joueur pressé. Ce piège est assumé et doit rester rare, sinon le joueur ne peut plus rien prévoir.`}],
['Les canaux de télégraphie',
`On peut annoncer une attaque de plusieurs façons, et les meilleurs jeux les combinent pour que l'information passe même si un canal est manqué.`,
{l:[`**Animation** : une posture exagérée, lisible en silhouette.`,`**Couleur** : un flash rouge, un contour, une zone au sol qui se remplit.`,`**Son** : un cri, un bruit métallique, un « tic » qui accélère.`,`**Symbole** : Sekiro affiche le caractère 危 (danger) avant les attaques qui demandent une réponse spéciale.`,`**Icône d'intention** : Slay the Spire affiche au-dessus de chaque ennemi ce qu'il fera au prochain tour.`]},
{w:`Ne compte jamais sur la couleur seule : une partie des joueurs distingue mal le rouge du vert. Ajoute une forme, un son ou une animation (voir [[accessibilite]]).`}],
['L\'implémenter dans Unity',
`Une coroutine enchaîne naturellement les trois phases (voir [[coroutines]]). On expose la phase courante dans une propriété pour que d'autres scripts puissent réagir : le joueur ne prend des dégâts que pendant ~Active~, l'ennemi prend des dégâts doublés pendant ~Recovery~. Pour un ennemi avec plusieurs attaques, une vraie [[machine-etats]] devient plus claire.`,
{u:`Le collider de dégâts n'est activé que pendant la phase active. On peut aussi piloter ces phases avec des événements d'animation, posés directement sur les images de l'animation dans l'Animator (voir [[animator-parametres]]).`}]],
err:[[`Des dégâts pendant l'anticipation`,`Le joueur est puni avant d'avoir pu lire l'attaque. Seule la phase active blesse.`],[`Pas de récupération`,`Sans fenêtre de riposte, le combat devient une fuite.`],[`Un seul canal`,`Si l'annonce n'est que visuelle, elle se perd dans le chaos ou hors de l'écran. Ajoute du son.`]],
res:[`Une attaque : anticipation, actif, récupération.`,`L'anticipation informe, la phase active blesse, la récupération récompense.`,`Les durées définissent le caractère d'un ennemi.`,`Combine plusieurs canaux : animation, couleur, son, symbole.`],
quiz:[
[`Pendant quelle phase le joueur doit-il punir l'ennemi ?`,[`Anticipation`,`Actif`,`Récupération`,`Aucune`],2,`L'ennemi est vulnérable après son coup.`],
[`D'où vient le principe d'anticipation ?`,[`Des échecs`,`Des 12 principes de l'animation`,`Du cinéma muet`,`Des jeux de cartes`],1,`Préparer un geste avant de l'exécuter est un principe classique d'animation.`],
[`Pourquoi ne pas annoncer une attaque uniquement par un flash rouge ?`,[`C'est trop joli`,`Une partie des joueurs distingue mal les couleurs, et le flash peut être hors écran`,`Unity ne gère pas le rouge`,`Ça coûte cher en performance`],1,`On combine les canaux pour que l'information passe toujours.`]],
src:[[`Game Developer : Anatomy of an Enemy Attack in Dark Souls 3`,`https://www.gamedeveloper.com/game-platforms/anatomy-of-an-enemy-attack-in-dark-souls-3`],[`Game Developer : Enemy Attacks and Telegraphing`,`https://gamedeveloper.com/design/enemy-attacks-and-telegraphing`],[`Game Developer : Designing for difficulty, readability in ARPGs`,`https://www.gamedeveloper.com/game-platforms/designing-for-difficulty-readability-in-arpgs`],[`Game Developer : Adding Weight to Your Game Design, Part 2: Anticipation`,`https://gamedeveloper.com/design/adding-weight-to-your-game-design-part-2-anticipation`]]},

'enseigner-sans-texte':{
lead:`Le premier niveau de Super Mario Bros. (1985), appelé **World 1-1**, est sans doute le tutoriel le plus étudié de l'histoire du jeu vidéo, alors qu'il ne contient pas une ligne d'explication. Shigeru Miyamoto et Takashi Tezuka l'ont conçu pour que le joueur découvre les règles en jouant. Ce cours tire de cet exemple des règles qu'on peut appliquer à n'importe quel jeu.`,
ch:[
['Ce que montre l\'écran de départ',
`Au début du niveau, Mario est placé à **gauche** de l'écran, avec beaucoup d'espace vide à droite : on comprend qu'il faut aller à droite. Quelques pas plus loin arrivent un bloc « ? » et le premier ennemi, un Goomba.`,
`Dans un entretien de 2015 avec Eurogamer, Miyamoto explique que le Goomba a été ajouté tard, parce que la tortue Koopa, prévue d'abord comme premier ennemi, était trop compliquée à comprendre et à vaincre. Le Goomba est simple : il avance vers toi, il te tue au contact, on l'écrase en sautant dessus. Miyamoto raconte aussi que le champignon devait d'abord ressembler à un Goomba, un « mauvais champignon », pour que le joueur hésite avant de comprendre qu'un champignon peut aussi être bon.`],
['Une idée à la fois, dans un endroit sûr',
`La première leçon de 1-1 est l'**introduction progressive** : chaque nouvelle règle arrive seule, dans une situation où l'échec coûte peu. Puis on la combine avec ce qu'on sait déjà, puis on la complique.`,
{tab:[['Étape','Dans 1-1','Règle générale'],['Introduire','un seul Goomba sur sol plat','une mécanique nouvelle, isolée'],['Pratiquer','plusieurs Goombas, puis entre des tuyaux','répéter avec de petites variations'],['Combiner','des ennemis au-dessus de trous','mélanger avec ce qui est connu'],['Tester','les escaliers et le grand saut final','une épreuve qui demande tout']]},
`Ce schéma en quatre temps se retrouve dans beaucoup de jeux, notamment chez Nintendo, où chaque niveau de Super Mario 3D World est souvent construit autour d'une seule idée qu'on explore jusqu'au bout.`],
['Laisser le joueur se tromper',
`1-1 laisse le joueur expérimenter. On peut frapper les blocs, tomber dans un trou, mourir au premier Goomba : la sanction est légère et la leçon claire. Le jeu montre au lieu de dire. Le niveau est aussi construit pour que les leçons arrivent même au joueur prudent : l'espace est étroit et les objets se déplacent, si bien qu'on les rencontre presque forcément.`,
{n:`Un bon test : observe un joueur qui découvre ton niveau **sans rien lui dire**. Chaque fois que tu as envie d'expliquer, note l'endroit : c'est là que le niveau n'enseigne pas assez.`}],
['Quand le texte devient nécessaire',
`Tous les jeux ne peuvent pas tout enseigner par le niveau, surtout ceux qui ont des menus ou des règles abstraites. La règle est alors d'aider **au bon moment** : une aide affichée quand le joueur en a besoin, pas avant. C'est le rôle du ~ContextualHint~ de l'exercice : il n'apparaît qu'après plusieurs échecs ou un blocage, et disparaît pour toujours une fois la chose apprise.`,
{u:`Mémoriser qu'une aide a été comprise peut se faire avec ~PlayerPrefs~ pour un prototype, ou dans la sauvegarde du joueur pour un vrai jeu (voir [[sauvegarde-json]]).`}]],
err:[[`Tout expliquer au début`,`Le joueur oublie un écran de règles. Il retient ce qu'il a fait.`],[`Introduire deux choses à la fois`,`S'il échoue, il ne sait pas laquelle il n'a pas comprise.`],[`Punir lourdement la découverte`,`Si apprendre coûte cher, le joueur n'ose plus essayer.`]],
res:[`World 1-1 enseigne sans texte : l'espace, les ennemis et les objets portent la leçon.`,`Introduire, pratiquer, combiner, tester.`,`L'échec en apprentissage doit coûter peu.`,`Une aide textuelle arrive au moment du besoin, puis disparaît.`],
quiz:[
[`Pourquoi le Goomba est-il le premier ennemi de Super Mario Bros. ?`,[`Il était le plus beau`,`Le Koopa était trop compliqué pour une première rencontre`,`Pour des raisons de mémoire`,`Par hasard`],1,`Miyamoto l'explique dans son entretien de 2015 : il fallait un ennemi simple.`],
[`Quelle est la bonne séquence pour introduire une mécanique ?`,[`Tester, puis introduire`,`Introduire, pratiquer, combiner, tester`,`Combiner tout de suite`,`Expliquer par texte, puis tester`],1,`Une idée seule et sûre, puis des variations, des mélanges, et une épreuve.`],
[`Quand afficher une aide textuelle ?`,[`Toujours au début du jeu`,`Quand le joueur montre qu'il en a besoin`,`Jamais`,`À chaque mort`],1,`Une aide au bon moment est retenue ; une aide trop tôt est oubliée.`]],
src:[[`Game Developer : How Miyamoto built Super Mario Bros.' legendary World 1-1`,`https://gamedeveloper.com/design/how-miyamoto-built-i-super-mario-bros-i-legendary-world-1-1`],[`Wikipédia (en) : World 1-1`,`https://en.wikipedia.org/wiki/World_1-1`]]},

'flow-difficulte':{
lead:`Trop facile, on s'ennuie ; trop difficile, on abandonne. Entre les deux, il existe un état où l'on oublie le temps qui passe : le psychologue Mihaly Csikszentmihalyi l'a appelé le **flow**. Le designer Jenova Chen en a fait le sujet de son mémoire de master à l'USC en 2006, et du jeu *flOw* qui l'accompagnait. Ce cours explique le canal de flow et les façons d'y garder le joueur.`,
ch:[
['Le canal de flow',
`On représente souvent le flow sur un graphique : en horizontal la compétence du joueur, en vertical la difficulté du défi. Le flow se trouve dans un **canal** en diagonale : la difficulté monte au même rythme que la compétence.`,
{tab:[['Situation','Ressenti'],['Défi bien plus haut que la compétence','anxiété, frustration'],['Défi au niveau de la compétence','flow : concentration, plaisir'],['Défi bien plus bas que la compétence','ennui']]},
`Ce canal n'est pas une ligne droite. Les bons jeux font **onduler** la difficulté : un pic (un boss), puis une période plus facile où le joueur savoure sa nouvelle compétence, puis une nouvelle montée. Une difficulté parfaitement constante finit elle aussi par lasser.`],
['Les joueurs ne sont pas tous au même endroit',
`Le vrai problème : chaque joueur a son propre canal. Un débutant et un expert ne peuvent pas être dans le flow avec la même difficulté. Les jeux ont plusieurs réponses à ce problème.`,
{l:[`**Modes de difficulté** au choix, le plus simple.`,`**Choix intégrés au jeu** : dans flOw, le joueur descend vers des couches plus dures quand il le veut, ou remonte. Jenova Chen parle d'ajustement de difficulté « intégré » plutôt que dynamique : c'est le joueur qui choisit, par le jeu lui-même.`,`**Défis optionnels** : des objets difficiles à atteindre pour les experts, un chemin principal accessible.`,`**Ajustement automatique** (DDA, *dynamic difficulty adjustment*) : le jeu mesure la réussite et s'adapte.`]}],
['L\'ajustement automatique, avec précautions',
`L'ajustement automatique mesure la réussite récente (morts, temps, dégâts reçus) et modifie des paramètres : nombre d'ennemis, dégâts, fréquence des soins. C'est ce que fait l'~AdaptiveSpawner~ de l'exercice, qui vise un taux de réussite de 70 % sur les dix dernières rencontres.`,
{c:`float rate = results.Count(r => r) / (float)results.Count;
if (rate > targetSuccess) Interval *= 0.95f;   // trop facile
else if (rate < targetSuccess) Interval *= 1.05f;
Interval = Mathf.Clamp(Interval, minInterval, maxInterval);`, t:`Petits pas, bornes fixes : le joueur ne doit pas sentir le réglage`},
{w:`Un ajustement trop visible est vécu comme une tricherie ou une punition : « je joue bien, donc le jeu me complique la vie ». Fais de petits pas, garde des bornes, et ne touche pas aux règles que le joueur peut observer directement.`},
{n:`Ajuster ce qui **aide** (plus de soins quand on est en difficulté) passe souvent mieux qu'ajuster ce qui **gêne** (des ennemis plus forts quand on gagne).`}],
['Mesurer avant de régler',
`Pour savoir si la courbe est bonne, il faut des données : temps passé par niveau, nombre de morts, endroits où les joueurs abandonnent. Un pic de morts à un endroit précis est un indice fort (voir la télémétrie dans [[mda]]). Ces réglages vivent bien dans un ScriptableObject par niveau de difficulté, modifiable sans toucher au code (voir [[scriptableobjects]]).`]],
err:[[`Une difficulté qui monte en ligne droite`,`Sans répits, le joueur s'épuise. Alterne pics et paliers.`],[`Un DDA brutal`,`Des sauts de difficulté visibles cassent la confiance. Petits pas et bornes.`],[`Régler la difficulté pour soi`,`Le développeur connaît le jeu par cœur : il est toujours trop fort. Teste avec des débutants.`]],
res:[`Flow : le défi correspond à la compétence (Csikszentmihalyi).`,`Le canal de flow monte avec le joueur, en ondulant.`,`Réponses : modes, choix intégrés (flOw), défis optionnels, ajustement automatique.`,`Un ajustement automatique doit être discret, borné et progressif.`],
quiz:[
[`Un défi bien plus faible que la compétence du joueur provoque…`,[`le flow`,`l'ennui`,`l'anxiété`,`la peur`],1,`Sans défi, l'attention décroche.`],
[`Dans flOw, comment la difficulté s'adapte-t-elle ?`,[`Elle est fixe`,`Le joueur choisit de descendre ou remonter dans des couches plus ou moins dures`,`Un algorithme secret change les ennemis`,`Par un menu de difficulté`],1,`Jenova Chen intègre le choix de difficulté au jeu lui-même.`],
[`Quel ajustement est le moins mal perçu ?`,[`Des ennemis plus forts quand on gagne`,`Plus d'aide quand on est en difficulté`,`Des changements soudains`,`Augmenter les dégâts de 50 %`],1,`Aider passe mieux que punir la réussite.`]],
src:[[`Wikipédia (en) : flOw (jeu vidéo)`,`https://en.wikipedia.org/wiki/Flow_(video_game)`],[`Engadget : entretien avec Jenova Chen (2006)`,`https://www.engadget.com/2006-09-18-joystiq-qanda-jenova-chen.html`],[`Wikipédia : Flow (psychologie)`,`https://fr.wikipedia.org/wiki/Flow_(psychologie)`]]}
});
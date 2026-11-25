window.EXTRA=Object.assign(window.EXTRA||{},{
'gameobject-composants':{
r:[`Un GameObject est un conteneur ; les composants font tout le travail.`,`~SetActive~ coupe l'objet et ses enfants, ~enabled~ un seul composant.`,`Éviter ~Find~ en jeu : références directes ou registres.`],
m:[
['Tags et layers',`Le **tag** est une étiquette textuelle unique par objet (~CompareTag("Player")~) ; le **layer** est un numéro de 0 à 31 utilisé par la physique, les caméras et les lumières pour filtrer (voir [[operations-bits]]). On utilise les layers pour « qui touche qui » et « qui voit quoi », et on évite de multiplier les tags : un composant marqueur (~class PlayerMarker : MonoBehaviour {}~) est souvent plus souple.`],
['Objets statiques',`Cocher « Static » sur un objet du décor qui ne bougera jamais permet au moteur de précalculer l'éclairage, l'occlusion et de regrouper les maillages. Déplacer ensuite un objet marqué statique ne marche pas comme prévu. Sépare clairement décor fixe et objets dynamiques dans la hiérarchie.`],
['Ordre et hiérarchie',`L'ordre des objets dans la hiérarchie ne garantit pas l'ordre d'appel de leurs ~Update~. Pour imposer un ordre entre deux scripts, Project Settings > Script Execution Order, ou mieux, un script qui appelle les autres explicitement (voir [[update-manager]]).`]],
d:[[`Écris un utilitaire d'éditeur qui liste tous les objets de la scène portant un tag donné, et ceux qui ont des composants manquants (« Missing Script »).`,`GameObjectUtility.GetMonoBehavioursWithMissingScriptCount(go).`],
[`Remplace un ~GameObject.FindWithTag("Player")~ utilisé par 10 ennemis par un registre static du joueur, rempli dans son OnEnable.`,`Voir la leçon static et instance.`]]},

'cycle-de-vie':{
r:[`Awake → OnEnable → Start → (FixedUpdate, Update, LateUpdate)… → OnDisable → OnDestroy.`,`Multiplier les vitesses par ~Time.deltaTime~.`,`Entrées dans Update, physique dans FixedUpdate, caméra dans LateUpdate.`],
m:[
['Awake ou Start',`Awake : prépare l'objet lui-même (références à ses propres composants, valeurs initiales). Start : ce qui dépend des **autres** objets, puisque tous les Awake de la scène sont passés. Respecter cette règle supprime la plupart des erreurs d'ordre d'initialisation. Start n'est appelé que si l'objet est actif ; Awake l'est à l'activation de l'objet même si le composant est désactivé.`],
['FixedUpdate en détail',`Unity accumule le temps écoulé et appelle FixedUpdate autant de fois que nécessaire pour rattraper : 0, 1 ou plusieurs fois par image. À 30 images/s avec une physique à 50 Hz, il y a parfois 2 FixedUpdate par image. Un appui lu dans FixedUpdate avec ~GetKeyDown~ peut donc être vu deux fois ou pas du tout : d'où la règle « entrée dans Update ».`],
['OnDestroy et la fermeture',`À la fermeture du jeu ou d'une scène, l'ordre de destruction des objets n'est pas garanti : un ~OnDestroy~ qui utilise un autre objet peut le trouver déjà détruit. Garde OnDestroy simple et défensif.`]],
d:[[`Écris un script qui journalise chaque méthode du cycle de vie avec le numéro d'image (~Time.frameCount~), place-le sur deux objets dont l'un est désactivé au départ, et explique l'ordre obtenu.`,`Awake, OnEnable, Start, FixedUpdate, Update, LateUpdate, OnDisable, OnDestroy.`],
[`Règle ~Time.fixedDeltaTime~ à 0,1 et observe un objet qui bouge par la physique, avec et sans interpolation du Rigidbody.`,`Rigidbody.interpolation = RigidbodyInterpolation.Interpolate.`]]},

'prefabs-instantiate':{
r:[`Un prefab est un modèle d'objet ; ses copies restent liées.`,`Typer le champ avec un composant : ~Instantiate~ le renvoie directement.`,`Variantes pour des déclinaisons, pooling pour la création en masse.`],
m:[
['Coût d\'Instantiate',`Instancier copie toute la hiérarchie, crée chaque composant et appelle leur Awake et OnEnable. Un prefab lourd (centaines d'enfants, particules, scripts) peut coûter plusieurs millisecondes. Instancier pendant un chargement, ou réutiliser via [[object-pooling]], évite les saccades en plein combat.`],
['Initialiser après Instantiate',`Awake et OnEnable s'exécutent **pendant** l'appel à Instantiate, avant que tu n'aies pu passer des paramètres. Si l'objet a besoin de données, on lui donne une méthode ~Init(...)~ appelée juste après, et on ne fait rien de dépendant dans Awake. Ou on instancie désactivé, on initialise, puis on active.`,`Enemy e = Instantiate(prefab, pos, rot);
e.Init(waveConfig, target);   // Start viendra après, avec les bonnes données`],
['Prefabs imbriqués et overrides',`Un override (valeur changée sur une copie) apparaît en gras dans l'inspecteur. Trop d'overrides rendent les mises à jour du prefab imprévisibles. Règle d'équipe courante : si plusieurs copies ont le même override, il mérite une variante.`]],
d:[[`Écris un ~Projectile~ avec ~Init(Vector3 velocity, int damage, GameObject owner)~ qui ignore les collisions avec son propriétaire, et un ~Weapon~ qui l'instancie et l'initialise.`,`Physics.IgnoreCollision(projectileCollider, ownerCollider).`],
[`Mesure avec un ProfilerMarker le coût d'instancier 200 ennemis en une image, puis répartis l'apparition sur 10 images et compare le pic.`,`Une coroutine qui instancie 20 ennemis puis yield return null.`]]},

'input-system':{
r:[`On lit des actions, pas des touches.`,`~ReadValue<T>()~ pour une valeur, ~WasPressedThisFrame()~ ou ~performed~ pour un appui.`,`Activer et désactiver les actions avec l'objet.`],
m:[
['Action maps',`Les actions sont regroupées en **maps** : « Gameplay », « UI », « Véhicule ». On active une seule map à la fois selon le contexte : en ouvrant le menu, on désactive Gameplay et on active UI, et le saut ne se déclenche plus en naviguant dans les options.`],
['Classe générée',`Cocher « Generate C# Class » sur l'asset d'actions crée une classe typée : ~controls.Gameplay.Jump.performed += ...~. Plus de chaînes ni de références à glisser, et une erreur de compilation si une action est renommée.`],
['Remappage et accessibilité',`~action.PerformInteractiveRebinding()~ laisse le joueur choisir sa touche. Les réglages se sauvegardent en JSON (~SaveBindingOverridesAsJson~). Le remappage est une attente forte des joueurs et une exigence d'accessibilité.`]],
d:[[`Mets en place deux action maps (Gameplay et UI) et un ~PauseManager~ qui bascule de l'une à l'autre.`,`playerInput.SwitchCurrentActionMap("UI") ou Disable/Enable sur les maps.`],
[`Écris un écran de remappage pour l'action Jump avec sauvegarde dans PlayerPrefs.`,`PerformInteractiveRebinding().OnComplete(op => { op.Dispose(); sauvegarder; }).Start().`]]},

'collisions-triggers':{
r:[`Collider normal : bloque, ~OnCollision~. Trigger : traverse, ~OnTrigger~.`,`Il faut un Rigidbody sur au moins un des deux.`,`Filtrer par layers dans la matrice de collisions, ~CompareTag~ pour les tags.`],
m:[
['Requêtes sans Rigidbody',`Pas besoin de trigger pour tout : ~Physics.OverlapSphere~, ~OverlapBox~ et ~CheckSphere~ interrogent la physique à un instant donné. Une attaque de mêlée n'a pas besoin d'un collider permanent : au moment du coup, on teste une sphère devant l'arme. Les versions ~NonAlloc~ réutilisent un tableau.`],
['Les colliders composés',`Un Rigidbody parent avec plusieurs colliders enfants forme un seul corps. Les messages arrivent sur le Rigidbody, et ~collision.collider~ dit quel enfant a été touché : c'est ainsi qu'on fait des dégâts localisés (tête, corps).`],
['OnTriggerStay et coût',`~OnTriggerStay~ est appelé chaque pas de physique pour chaque paire qui se chevauche. Avec beaucoup d'objets, c'est coûteux. Préfère Enter et Exit pour tenir une liste de ce qui est dedans.`]],
d:[[`Écris une ~Zone~ qui garde la liste des objets à l'intérieur (Enter et Exit), en gérant un objet détruit pendant qu'il est dedans.`,`Un HashSet ; nettoie les entrées nulles avant de l'utiliser (RemoveWhere(x => x == null)).`],
[`Écris une attaque de mêlée avec ~Physics.OverlapSphereNonAlloc~ au moment précis du coup, sans collider sur l'arme, qui ne touche chaque ennemi qu'une fois par coup.`,`Un tableau de Collider réutilisé et un HashSet vidé à chaque coup.`]]},

'rigidbody-forces':{
r:[`Avec un Rigidbody, on applique des forces ou des vitesses, on ne déplace pas le Transform.`,`Force, Acceleration, Impulse, VelocityChange.`,`Kinematic + MovePosition pour ce qui pousse sans être poussé.`],
m:[
['Masse, traînée, friction',`La **masse** compte dans les chocs entre objets (un rapport de plus de 10 entre deux objets qui se touchent rend la simulation instable). La **traînée** (linearDamping) ralentit dans l'air. La **friction** et le **rebond** se règlent sur un Physics Material appliqué au collider.`],
['Contrôleur physique ou CharacterController',`Un personnage avec Rigidbody réagit naturellement aux explosions et aux plateformes, mais il est plus difficile à rendre précis (glisse, rebonds sur les marches). Le ~CharacterController~ n'est pas physique : déplacement exact et gestion des marches et pentes, mais il faut coder soi-même gravité et poussées. Les jeux de plateforme précis utilisent souvent un contrôleur cinématique fait main.`],
['Le saut agréable',`Les sauts des bons jeux de plateforme « trichent » : gravité plus forte en descente, saut plus court si on relâche le bouton tôt, « coyote time » (on peut encore sauter quelques centièmes de seconde après avoir quitté le bord) et mémoire d'appui (le saut demandé juste avant d'atterrir est exécuté à l'atterrissage).`]],
d:[[`Ajoute au ~Jumper~ le coyote time (0,1 s), la mémoire d'appui (0,1 s) et une gravité 2 fois plus forte quand le personnage descend.`,`Deux timers ; en descente, AddForce(Physics.gravity × (multiplier − 1), ForceMode.Acceleration).`],
[`Fais une plateforme mobile kinematic qui transporte un joueur à Rigidbody sans qu'il glisse.`,`MovePosition pour la plateforme ; le joueur reçoit le déplacement de la plateforme à chaque FixedUpdate quand il est dessus.`]]},

'raycast':{
r:[`Origine + direction + distance maximale ; ~RaycastHit~ donne point, normale, collider.`,`Toujours un LayerMask, et ~1 << n~ pour un layer.`,`~NonAlloc~ pour les lancers fréquents.`],
m:[
['Les variantes',`~SphereCast~ et ~CapsuleCast~ lancent une forme épaisse (un personnage qui avance, une balle de gros calibre). ~Linecast~ teste entre deux points (ligne de vue). ~RaycastAll~ renvoie tous les objets traversés. ~QueryTriggerInteraction~ décide si les triggers comptent.`],
['Commencer à l\'intérieur',`Un rayon qui part de l'intérieur d'un collider ne le détecte pas. D'où le petit décalage vers le haut dans ~IsGrounded~ : le rayon part légèrement au-dessus des pieds pour ne pas commencer dans le sol.`],
['Lancers en lot',`Pour des centaines de rayons par image (une IA de foule, des capteurs), ~RaycastCommand~ les lance en lot dans un job, en parallèle. Voir [[jobs-burst]].`]],
d:[[`Écris un laser qui rebondit jusqu'à 5 fois sur les surfaces, dessiné avec un ~LineRenderer~.`,`À chaque contact, nouvelle origine = point, nouvelle direction = Reflect ; ajoute un point au LineRenderer.`],
[`Écris un test de ligne de vue entre un garde et le joueur qui vise la tête, le torse et les pieds, et considère le joueur visible si au moins deux des trois rayons passent.`,`Trois Linecast avec un masque qui exclut le garde lui-même.`]]},

'operations-bits':{
r:[`Un LayerMask est un int où chaque bit est un layer.`,`~|~ combine, ~&~ teste, ~1 << n~ crée le bit n.`,`~[Flags]~ pour des enums combinables.`],
m:[
['Lire un nombre en binaire',`~0b0101~ vaut 5 : bits 0 et 2 allumés. ~Convert.ToString(mask, 2)~ affiche un nombre en binaire, pratique pour déboguer un masque. ~LayerMask.GetMask("Ground", "Water")~ construit un masque par noms.`],
['Autres usages des bits',`Stocker 32 booléens dans un int (les succès débloqués, les murs d'une case de labyrinthe : 4 bits pour 4 côtés), compresser des données réseau, et des astuces rapides : ~x & (x - 1)~ éteint le bit le plus bas, ~(x & (x - 1)) == 0~ teste une puissance de deux.`],
['Décalages et signe',`~1 << 31~ donne un nombre négatif en ~int~ (le bit de signe). Pour manipuler les 32 bits sans surprise, utilise ~uint~. Décaler de 32 ou plus revient à décaler du reste modulo 32 : ~1 << 32~ vaut 1, pas 0.`]],
d:[[`Représente les murs d'un labyrinthe avec 4 bits par case (haut, droite, bas, gauche) dans un ~byte[,]~, avec des méthodes pour ouvrir un passage entre deux cases voisines.`,`Ouvrir : retirer le bit du côté concerné dans les deux cases.`],
[`Écris ~int CountBits(int mask)~ sans boucle sur les 32 bits (astuce x & (x − 1)).`,`Tant que x != 0 : x &= x − 1, compteur++.`]]},

'coroutines':{
r:[`~IEnumerator~ + ~yield return~, lancée par ~StartCoroutine~.`,`Pas un thread : tout tourne sur le thread principal.`,`S'arrête quand l'objet est désactivé.`],
m:[
['Enchaîner des coroutines',`~yield return StartCoroutine(Autre())~ attend la fin d'une autre coroutine : on compose des séquences (ouvrir la porte, puis faire entrer le PNJ, puis lancer le dialogue). C'est la force des coroutines pour la mise en scène.`],
['Coroutines et timeScale',`~WaitForSeconds~ respecte ~Time.timeScale~ : en pause (timeScale 0), elle n'avance plus. Pour une animation de menu de pause, ~WaitForSecondsRealtime~. Voir [[time-scale-pause]].`],
['Qui lance la coroutine',`Une coroutine appartient au MonoBehaviour sur lequel on appelle ~StartCoroutine~. Si un objet qui va être détruit doit lancer une séquence qui continue après lui (un ennemi qui meurt et fait apparaître un butin 1 seconde plus tard), lance-la sur un objet qui reste.`]],
d:[[`Écris une séquence de cinématique : la caméra se déplace (SmoothDamp), un texte apparaît lettre par lettre, on attend un appui, puis le contrôle revient au joueur. Chaque étape est une coroutine.`,`yield return StartCoroutine(Etape()) ; WaitUntil(() => Input.anyKeyDown).`],
[`Réécris ~HitFlash~ avec ~async Awaitable~ et ~destroyCancellationToken~, puis compare la lisibilité.`,`Voir la leçon async et await.`]]},

'time-scale-pause':{
r:[`~Time.timeScale~ : 1 normal, 0 pause.`,`~unscaledDeltaTime~ et ~WaitForSecondsRealtime~ pour ce qui continue en pause.`,`Au ralenti, réduire aussi ~fixedDeltaTime~.`],
m:[
['Hit stop',`Les jeux d'action figent le temps une fraction de seconde au moment d'un coup puissant (« hit stop » ou « hit freeze ») : quelques centièmes de seconde à timeScale 0 ou 0,05. L'impact paraît beaucoup plus lourd. Attention à le restaurer dans tous les cas, même si une autre pause intervient.`],
['Plusieurs demandes de ralenti',`Le menu de pause, un hit stop et un ralenti de visée peuvent vouloir modifier timeScale en même temps, et chacun écrase les autres. Un gestionnaire central qui reçoit des « demandes » et applique la plus petite valeur évite les conflits.`]],
d:[[`Écris un ~HitStop.Trigger(float duration)~ qui fige le temps sans casser une pause en cours, et qui prolonge la durée si un second coup arrive pendant le premier.`,`Coroutine en temps réel ; garde la date de fin la plus tardive.`],
[`Écris un ~TimeScaleManager~ où chaque système demande une échelle (~Request(object owner, float scale)~, ~Release(owner)~) ; l'échelle appliquée est le minimum des demandes.`,`Un Dictionary<object, float> et un recalcul à chaque changement.`]]},

'ui-canvas':{
r:[`Le Canvas contient l'UI ; les ancres font tenir l'interface sur tous les écrans.`,`~Image~ Filled + ~fillAmount~ pour une barre.`,`Séparer ce qui change souvent dans un Canvas à part.`],
m:[
['Les trois modes de Canvas',`**Screen Space Overlay** : dessiné par-dessus tout, le plus simple. **Screen Space Camera** : placé devant une caméra, permet des effets de post-traitement. **World Space** : un panneau dans le monde 3D (un écran d'ordinateur dans le jeu, une barre de vie au-dessus d'un ennemi).`],
['Canvas Scaler',`Réglé sur « Scale With Screen Size » avec une résolution de référence (1920 × 1080), l'interface garde les mêmes proportions sur tous les écrans. Le curseur « Match » choisit de privilégier la largeur ou la hauteur.`],
['UI Toolkit pour le jeu',`UI Toolkit, utilisé pour les outils (voir [[custom-inspector]]), sert aussi pour l'interface en jeu : mise en page façon CSS, feuilles de style, très efficace pour les menus riches en texte. uGUI reste plus simple pour l'UI dans le monde 3D et les effets animés.`]],
d:[[`Fais un menu d'options avec volume (slider), plein écran (toggle) et résolution (dropdown), qui sauvegarde et restaure les réglages.`,`Screen.resolutions pour la liste ; PlayerPrefs pour la sauvegarde.`],
[`Affiche des nombres de dégâts qui montent et disparaissent au-dessus des ennemis, avec un pool de textes.`,`Canvas World Space ou position écran via WorldToScreenPoint ; un pool de TMP_Text.`]]},

'audio':{
r:[`Clip = son, Source = haut-parleur, Listener = oreille.`,`~PlayOneShot~ pour les effets superposables.`,`Varier pitch et clip ; mixer en décibels.`],
m:[
['Réglages d\'import',`Un son court et fréquent : « Decompress On Load ». Une musique : « Streaming » (lue depuis le disque, peu de mémoire). Forcer le mono sur les effets 3D divise leur taille par deux. Ces réglages pèsent beaucoup sur la mémoire d'un jeu mobile.`],
['Priorité et nombre de voix',`Le moteur a un nombre limité de voix simultanées (32 par défaut). Au-delà, les sons de plus basse priorité sont coupés. Une explosion de 50 balles peut couper la musique si elle a une priorité trop basse : règle ~priority~ (0 = la plus importante).`],
['Middleware audio',`Les grosses productions utilisent souvent FMOD ou Wwise : les sound designers créent des événements sonores complexes (variations, couches, paramètres) dans leur outil, et le code se contente de déclencher « Explosion » avec une intensité.`]],
d:[[`Écris une musique dynamique à deux couches (calme et combat) qui fondent l'une dans l'autre en 2 secondes selon qu'un ennemi est proche.`,`Deux AudioSource synchronisées, volumes croisés avec MoveTowards.`],
[`Écris des sons de pas qui changent selon la surface (herbe, pierre, bois), détectée par un raycast vers le sol et un composant ~SurfaceType~.`,`Le raycast renvoie le collider ; TryGetComponent<SurfaceType> choisit la liste de clips.`]]},

'gizmos':{
r:[`~OnDrawGizmos~ et ~OnDrawGizmosSelected~ dessinent dans la vue Scene.`,`~Debug.DrawLine~ et ~DrawRay~ depuis n'importe où.`,`Visualiser un réglage vaut mieux que le deviner.`],
m:[
['Gizmos et performance de l\'éditeur',`OnDrawGizmos est appelé pour chaque objet à chaque rafraîchissement de la vue Scene. Des centaines d'objets qui dessinent des formes complexes ralentissent l'éditeur. Réserve le dessin détaillé à ~OnDrawGizmosSelected~.`],
['Outils de débogage en jeu',`Les Gizmos ne sont pas visibles dans un build. Pour déboguer sur la machine cible, on écrit des overlays : un texte au-dessus des ennemis avec leur état, une console de commandes, des graphiques de performance. Des paquets existent, mais un petit overlay maison est un excellent exercice.`]],
d:[[`Dessine en Gizmos le chemin trouvé par ton A* (lignes entre les cases) et les cases explorées (cubes semi-transparents).`,`Garde les cases explorées dans une liste exposée par le pathfinder.`],
[`Écris un ~DebugOverlay~ (en jeu) qui affiche un texte au-dessus de chaque objet enregistré, activable avec F1.`,`OnGUI avec GUI.Label et cam.WorldToScreenPoint (y inversé).`]]},

'camera-suivi':{
r:[`Mise à jour dans ~LateUpdate~.`,`SmoothDamp pour la douceur, anticipation dans le sens du mouvement.`,`Limites de niveau en tenant compte de la taille visible.`],
m:[
['La zone morte',`Beaucoup de jeux 2D utilisent une **zone morte** : la caméra ne bouge pas tant que le joueur reste dans un rectangle central, puis le suit. Les petits sauts et allers-retours ne font plus bouger l'image. En hauteur, on ne suit souvent qu'à l'atterrissage, pour ne pas suivre chaque saut.`],
['Caméras 3D',`Une caméra à la troisième personne tourne autour du joueur (lacet et tangage, voir [[angles-signes]]), et doit éviter les murs : un SphereCast du joueur vers la position voulue rapproche la caméra s'il touche quelque chose.`],
['Le mal des transports',`Accélérations brusques, roulis, champ de vision étroit et mouvements non contrôlés par le joueur donnent la nausée. Proposer d'atténuer les secousses et de régler le champ de vision fait partie des options d'accessibilité attendues.`]],
d:[[`Ajoute à ~FollowCamera~ une zone morte horizontale et un suivi vertical seulement quand le joueur est au sol.`,`Ne mets à jour la cible y qu'au sol ; ne déplace x que si l'écart dépasse la demi-largeur de la zone.`],
[`Écris une caméra à la troisième personne qui orbite à la souris, borne le tangage et se rapproche quand un mur est entre elle et le joueur.`,`SphereCast du point de visée vers la position voulue ; distance = hit.distance − marge.`]]},

'animator-parametres':{
r:[`L'Animator est une machine à états ; le code règle des paramètres.`,`~Animator.StringToHash~ une fois, en champ static.`,`Événements d'animation pour synchroniser son et dégâts.`],
m:[
['Blend trees',`Un **blend tree** mélange plusieurs animations selon un ou deux paramètres : marcher et courir selon la vitesse, ou 8 directions de marche selon deux axes. Le personnage passe en douceur d'une allure à l'autre sans transition explicite.`],
['Calques et masques',`Les **layers** de l'Animator jouent plusieurs animations à la fois : les jambes courent pendant que le haut du corps tire. Un **Avatar Mask** dit quelles parties du squelette chaque calque contrôle.`],
['Root motion',`Avec le root motion, c'est l'animation qui déplace le personnage : les pieds ne glissent jamais, mais le contrôle est moins réactif. Sans, le code déplace le personnage et l'animation suit, au risque de pieds qui patinent. Beaucoup de jeux mélangent : root motion pour les attaques, code pour la marche.`]],
d:[[`Crée un blend tree 2D (8 directions) piloté par la vitesse locale du personnage, pour un personnage qui vise la souris en se déplaçant.`,`Vitesse locale = transform.InverseTransformDirection(velocity) ; paramètres MoveX et MoveZ.`],
[`Écris un ~StateMachineBehaviour~ qui désactive le déplacement du joueur pendant l'état « Attaque » et le réactive à la sortie.`,`OnStateEnter et OnStateExit ; animator.GetComponent<Mover>().enabled.`]]},

'scriptableobjects':{
r:[`Un asset de données partagé, hors des scènes.`,`Modifié en Play Mode dans l'éditeur, il garde la valeur.`,`Données de conception, pas état de partie.`],
m:[
['Identité et références',`Un ScriptableObject a une identité : comparer deux références suffit pour savoir si c'est la même arme, sans comparer des noms. Il peut référencer d'autres assets (prefabs, sons, autres ScriptableObjects) et sert ainsi de base de données légère du jeu.`],
['Cloner pour l\'état',`Si un objet a besoin d'une copie modifiable des données (une arme qu'on améliore), on fait ~Instantiate(weaponData)~ au démarrage : une copie en mémoire, modifiable sans toucher à l'asset. Ou mieux, on garde les données de conception dans l'asset et l'état dans un objet séparé.`],
['Bases de données de contenu',`Les jeux riches en contenu (des centaines d'objets) génèrent souvent leurs ScriptableObjects à partir d'un tableur exporté en CSV, via un outil d'éditeur. Les designers travaillent dans le tableur, un bouton met à jour les assets (voir [[batch-assets]]).`]],
d:[[`Écris un importeur d'éditeur qui lit un CSV (nom, dégâts, cadence) et crée ou met à jour un ~WeaponData~ par ligne dans un dossier.`,`AssetDatabase.LoadAssetAtPath pour vérifier l'existence, sinon CreateInstance + CreateAsset ; EditorUtility.SetDirty.`],
[`Écris une ~WeaponDatabase~ (ScriptableObject) qui liste toutes les armes, avec ~Get(string id)~ en O(1) grâce à un dictionnaire construit au premier accès.`,`Le Dictionary n'est pas sérialisé : construis-le paresseusement depuis la liste.`]]},

'serialisation':{
r:[`Sérialisé : champs publics ou ~[SerializeField]~ de types supportés.`,`Pas de Dictionary, de propriétés, de static ni d'interfaces.`,`~[FormerlySerializedAs]~ pour renommer sans perdre les données.`],
m:[
['Le format des scènes',`Les scènes, prefabs et assets sont des fichiers texte YAML (avec « Force Text » dans les réglages). Chaque objet a un identifiant de fichier, et les références vers d'autres assets passent par le GUID du fichier ~.meta~. Perdre ou régénérer un ~.meta~ casse toutes les références vers cet asset : il faut toujours versionner les ~.meta~ avec leurs fichiers.`],
['Sérialiser un Dictionary',`Le contournement classique : deux listes (clés et valeurs) sérialisées, converties en dictionnaire avec ~ISerializationCallbackReceiver~ (~OnAfterDeserialize~ reconstruit le dictionnaire, ~OnBeforeSerialize~ remplit les listes).`],
['Limite de profondeur',`Unity limite la profondeur de sérialisation à 10 niveaux et ne gère pas les cycles de références avec ~[Serializable]~ (une copie par champ). ~[SerializeReference]~ gère les références partagées et les cycles.`]],
d:[[`Écris un ~SerializableDictionary<TKey, TValue>~ avec ~ISerializationCallbackReceiver~, utilisable dans un ScriptableObject.`,`Deux List sérialisées ; OnAfterDeserialize vide puis remplit le dictionnaire.`],
[`Utilise ~[SerializeReference]~ pour une liste d'effets (~IEffect~ avec ~DamageEffect~ et ~HealEffect~) et écris un petit inspecteur avec un bouton par type pour en ajouter.`,`TypeCache.GetTypesDerivedFrom<IEffect>() ; Activator.CreateInstance(type).`]]},

'sauvegarde-json':{
r:[`Une classe ~[Serializable]~, ~JsonUtility~, ~persistentDataPath~.`,`Écriture dans un fichier temporaire, puis remplacement.`,`Un numéro de version dès le départ.`],
m:[
['Que sauvegarder',`On sauvegarde l'**état** minimal qui permet de reconstruire la partie, pas les objets eux-mêmes : des identifiants (l'id de l'arme équipée, pas l'arme), des positions, des drapeaux de progression. Chaque objet sauvegardable a un identifiant stable (un GUID généré dans l'éditeur) pour retrouver qui est qui au chargement.`],
['Migration de versions',`Quand le format change, le chargement lit la version et applique des migrations successives (v1 vers v2, puis v2 vers v3). Les sauvegardes des joueurs ne sont jamais perdues, et chaque migration reste petite et testable.`,`if (data.version < 2) { data.gold = data.coins * 10; data.version = 2; }
if (data.version < 3) { data.unlocked ??= new List<string>(); data.version = 3; }`],
['Triche et intégrité',`Un fichier JSON se modifie au bloc-notes. Pour un jeu solo, ce n'est souvent pas grave. Pour détecter une modification, on ajoute une somme de contrôle (un hash du contenu avec une clé). Pour un jeu en ligne, la vérité doit être sur le serveur.`]],
d:[[`Ajoute à ~SaveSystem~ une rotation de 3 sauvegardes (save.json, save.bak1, save.bak2) et un chargement qui essaie la suivante si la première est illisible.`,`Avant d'écrire, décale bak1 vers bak2 et la sauvegarde actuelle vers bak1.`],
[`Écris un composant ~SaveableId~ qui génère un GUID unique dans l'éditeur (une seule fois, y compris pour les objets dupliqués) et un système qui sauvegarde la position de tous les objets qui en ont un.`,`OnValidate : si l'id est vide ou déjà utilisé par un autre objet de la scène, en générer un nouveau.`]]},

'chargement-scenes':{
r:[`~LoadSceneAsync~ pour charger sans bloquer.`,`~progress~ s'arrête à 0,9 avant l'activation.`,`Scènes additives : un « Core » permanent plus des niveaux.`],
m:[
['Passer des données entre scènes',`Plusieurs options : un objet ~DontDestroyOnLoad~, un ScriptableObject partagé (le niveau choisi, la configuration de la partie), ou un champ static. Le ScriptableObject reste le plus lisible et le plus facile à tester.`],
['Scène active',`Avec plusieurs scènes chargées, ~SceneManager.SetActiveScene~ décide où vont les objets créés par ~Instantiate~ et quel éclairage s'applique. Oublier de la régler fait apparaître les ennemis dans la scène Core, qui ne se décharge jamais.`],
['Chargement en continu',`Les mondes ouverts chargent et déchargent des morceaux de carte autour du joueur en scènes additives. Les difficultés : éviter les saccades (tout ne se charge pas en arrière-plan, l'activation coûte), et gérer ce qui traverse les frontières.`]],
d:[[`Mets en place une scène Bootstrap (services) qui charge additivement une scène Core puis le menu, et une méthode qui remplace le niveau courant par un autre sans toucher à Core.`,`UnloadSceneAsync de l'ancien niveau, LoadSceneAsync additif du nouveau, puis SetActiveScene.`],
[`Écris un système de zones : un trigger charge la scène de la zone suivante quand le joueur s'approche et décharge celle qu'il a quittée.`,`Deux triggers par frontière, ou une distance au centre de chaque zone.`]]},

'navmesh':{
r:[`~NavMeshSurface~ calcule les zones marchables ; ~NavMeshAgent~ s'y déplace.`,`Vérifier ~pathPending~ avant ~remainingDistance~.`,`~NavMesh.SamplePosition~ pour un point marchable proche.`],
m:[
['Obstacles et liens',`~NavMeshObstacle~ avec « Carve » creuse un trou dans le NavMesh pour un obstacle mobile (une caisse poussée, une porte fermée). Les ~NavMeshLink~ relient des zones séparées (un saut, une échelle). Les **areas** donnent des coûts différents (marcher dans l'eau coûte plus cher).`],
['Calculer un chemin sans bouger',`~NavMesh.CalculatePath(from, to, NavMesh.AllAreas, path)~ dit si un point est accessible et à quelle distance réelle, sans déplacer d'agent. Utile pour choisir la cible la plus proche **à pied**, qui n'est pas forcément la plus proche à vol d'oiseau.`],
['Agents nombreux',`Des centaines d'agents qui recalculent leur chemin chaque image saturent le processeur. On espace les ~SetDestination~ (pas plus de quelques fois par seconde), on ne les recalcule que si la cible a beaucoup bougé, et pour des foules on combine un seul calcul avec une [[bfs-grille|carte de distances]].`]],
d:[[`Écris ~Transform ClosestReachable(Vector3 from, List<Transform> targets)~ qui compare les longueurs de chemin réelles calculées par ~NavMesh.CalculatePath~.`,`Longueur du chemin : somme des distances entre path.corners consécutifs.`],
[`Fais un ennemi qui poursuit le joueur mais ne recalcule sa destination que si le joueur a bougé de plus de 1 m depuis le dernier calcul.`,`Mémorise la dernière destination envoyée.`]]},

'addressables':{
r:[`Charger à la demande par adresse, libérer quand on a fini.`,`Chaque chargement doit avoir son ~Release~.`,`Les groupes deviennent des paquets construits avant le build.`],
m:[
['Pourquoi pas Resources',`Le dossier ~Resources~ permet aussi de charger par nom (~Resources.Load~), mais tout ce qu'il contient part dans le build et une table de noms est chargée au démarrage. Unity déconseille de s'en servir à grande échelle. Les Addressables gèrent dépendances, mémoire et mises à jour à distance.`],
['Dépendances dupliquées',`Si deux groupes utilisent la même texture sans qu'elle soit elle-même adressable, elle est copiée dans les deux paquets : deux fois en mémoire. L'outil « Analyze » des Addressables détecte ces doublons. C'est un sujet fréquent d'optimisation mémoire en production.`],
['Préchargement',`On peut charger à l'avance les assets d'un niveau pendant l'écran de chargement (~LoadAssetsAsync~ par étiquette), pour qu'aucun chargement n'arrive en plein jeu. ~GetDownloadSizeAsync~ dit combien il faudra télécharger pour du contenu distant.`]],
d:[[`Précharge tous les assets étiquetés « Level1 » pendant un écran de chargement, avec une barre de progression, puis libère-les en quittant le niveau.`,`LoadAssetsAsync<Object>("Level1", null) ; PercentComplete ; Release du handle à la sortie.`],
[`Écris un petit gestionnaire qui compte les chargements et libérations par adresse et affiche dans un overlay ceux qui n'ont jamais été libérés.`,`Un Dictionary<string, int> incrémenté au chargement, décrémenté au Release.`]]}
});

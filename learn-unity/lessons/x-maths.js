window.EXTRA=Object.assign(window.EXTRA||{},{
'vecteurs':{
r:[`Un vecteur est une flèche : direction et longueur.`,`~B - A~ va de A vers B : « direction vers la cible = cible − moi ».`,`Position + vitesse × deltaTime = nouvelle position.`],
m:[
['Points et directions',`Mathématiquement, un point et une direction ne se comportent pas pareil : déplacer un objet change ses points mais pas ses directions. Unity utilise le même ~Vector3~ pour les deux, c'est à toi de savoir lequel tu manipules. C'est exactement la différence entre ~TransformPoint~ et ~TransformDirection~ (voir [[espaces-coordonnees]]). Additionner deux positions n'a pas de sens physique ; additionner une position et un déplacement, si.`],
['Penser en vecteurs plutôt qu\'en composantes',`Les débutants écrivent ~pos.x += speed.x * dt; pos.y += speed.y * dt; pos.z += ...~. Les développeurs aguerris écrivent ~pos += velocity * dt~. Moins de code, moins d'erreurs, et le même calcul marche en 2D et en 3D. Quand tu te retrouves à manipuler x, y et z séparément, demande-toi s'il existe une opération vectorielle qui fait la même chose.`],
['Vector2, Vector3, Vector2Int',`~Vector2~ se convertit implicitement en ~Vector3~ (z = 0), et inversement (z perdu). Cette conversion silencieuse est une source de bugs en 2D/3D mélangée, par exemple en vue de dessus où le sol est le plan XZ et non XY. ~Vector2Int~ et ~Vector3Int~ servent aux coordonnées de grille.`]],
d:[[`Écris ~Vector3 Steer(Vector3 velocity, Vector3 position, Vector3 target, float maxSpeed, float maxForce)~ : le comportement « seek » de Craig Reynolds (vitesse désirée vers la cible moins vitesse actuelle, limitée par maxForce).`,`desired = (target − position).normalized × maxSpeed ; steering = ClampMagnitude(desired − velocity, maxForce).`],
[`Ajoute « arrive » : la vitesse désirée diminue linéairement quand on est à moins de ~slowRadius~ de la cible, pour s'arrêter en douceur.`,`desired × (distance / slowRadius) quand distance < slowRadius.`]]},

'longueur-distance':{
r:[`~magnitude~ = Pythagore, ~sqrMagnitude~ évite la racine pour comparer.`,`Normaliser = diviser par la longueur, pour obtenir une direction pure.`,`~ClampMagnitude~ corrige la diagonale sans casser l'analogique.`],
m:[
['Autres distances',`La distance euclidienne n'est pas la seule. **Manhattan** (~|dx| + |dy|~) compte les déplacements sur une grille à 4 directions. **Chebyshev** (~max(|dx|, |dy|)~) correspond au roi des échecs, 8 directions. Elles servent d'heuristiques dans [[astar]] et de rayons « carrés » dans les jeux de tuiles.`],
['Normaliser un vecteur presque nul',`Normaliser un vecteur minuscule (un stick à peine touché, deux objets presque confondus) amplifie le bruit : une direction aléatoire qui change à chaque image. Ajoute toujours une **zone morte** : ignore la direction si la longueur est sous un seuil.`],
['Le coût réel',`Sur un processeur moderne, une racine carrée coûte quelques cycles : ce n'est plus le drame des années 90. ~sqrMagnitude~ reste une bonne habitude dans les boucles chaudes (des milliers de tests par image), mais ne sacrifie pas la lisibilité pour un seul calcul.`]],
d:[[`Écris ~Vector2 ApplyDeadzone(Vector2 stick, float dead)~ : renvoie zéro sous le seuil, et au-dessus remet l'amplitude à l'échelle de 0 à 1 (pour ne pas sauter brutalement à 0,2).`,`magnitude remappée : (m − dead) / (1 − dead), direction conservée.`],
[`Écris une méthode qui trie des ennemis par distance au joueur en utilisant ~sqrMagnitude~, et explique pourquoi l'ordre est le même qu'avec la vraie distance.`,`La fonction carré est croissante pour les nombres positifs.`]]},

'trigonometrie':{
r:[`Radians pour Mathf.Sin/Cos, ~Deg2Rad~ et ~Rad2Deg~ pour convertir.`,`(cos θ, sin θ) : un point sur le cercle de rayon 1.`,`~Atan2(y, x)~ : l'angle d'une direction, dans le bon quadrant.`],
m:[
['Ondes et game feel',`~Mathf.Sin~ dans le temps donne des oscillations douces ; ~Mathf.Abs(Mathf.Sin(t))~ des rebonds ; deux sinus de fréquences différentes additionnés, un mouvement moins mécanique. Une lumière qui vacille, une barque qui tangue, un ennemi qui flotte : souvent deux lignes de trigonométrie.`],
['Vitesse angulaire',`Un objet qui orbite à vitesse constante : on augmente l'angle de ~vitesse × deltaTime~ (en radians par seconde) et on recalcule la position. La vitesse linéaire sur le cercle vaut alors ~rayon × vitesse angulaire~ : pour garder la même vitesse au sol quand le rayon change, il faut diviser la vitesse angulaire par le rayon.`],
['Lois des sinus et cosinus',`Pour un triangle quelconque, la loi des cosinus (~c² = a² + b² − 2ab cos γ~) donne un angle à partir des trois côtés. C'est la base de la cinématique inverse à deux os (un bras, une jambe) : connaissant la longueur du bras, de l'avant-bras et la distance à la cible, on trouve l'angle du coude.`]],
d:[[`Écris un ~Orbiter~ qui tourne autour d'un centre à vitesse linéaire constante (m/s) quel que soit le rayon, avec un rayon qui oscille entre deux valeurs.`,`angle += (vitesse / rayon) × dt.`],
[`Écris ~float ElbowAngle(float upper, float lower, float distance)~ avec la loi des cosinus, en gérant le cas où la cible est hors de portée.`,`Borne la distance à upper + lower ; acos de (u² + l² − d²) / (2ul).`]]},

'modulo-repetition':{
r:[`~%~ fait boucler, mais garde le signe : ~((a % b) + b) % b~ pour les négatifs.`,`~Mathf.Repeat~ boucle, ~Mathf.PingPong~ fait des allers-retours.`,`Pour la plus petite différence d'angles, ~DeltaAngle~.`],
m:[
['Indices circulaires partout',`Un menu qui boucle, une file de joueurs à tour de rôle, une animation de sprites, un tampon circulaire ([[pile-file]]), un carrousel : tous utilisent ~(i + 1) % n~ pour avancer et le modulo sûr pour reculer.`],
['Temps qui boucle et précision',`~Time.time~ grandit sans fin ; après des heures de jeu, sa précision en float se dégrade et une animation basée sur ~Mathf.Sin(Time.time * 50)~ devient saccadée. Garder son propre compteur qui boucle (~t = Mathf.Repeat(t + dt, période)~) évite le problème sur les jeux qui tournent longtemps (bornes d'arcade, serveurs).`]],
d:[[`Écris une animation de sprites ~SpriteFlipbook~ (un tableau de sprites, des images par seconde) en mode boucle, en mode aller-retour (PingPong) et en mode une seule fois.`,`Indice = (int)(t × fps) ; boucle : % longueur ; aller-retour : PingPong sur longueur − 1.`],
[`Écris un menu circulaire où haut et bas font défiler les options en boucle, avec le modulo sûr.`,`index = Wrap(index ± 1, options.Length).`]]},

'produit-scalaire':{
r:[`~Dot = |A||B|cos θ~ : un nombre, pas un vecteur.`,`Vecteurs normalisés : 1 même sens, 0 perpendiculaire, −1 opposés.`,`Comparer au cosinus d'un angle plutôt que calculer l'angle.`],
m:[
['La projection, cœur du dot',`Avec un vecteur unitaire u, ~Dot(v, u)~ est la longueur de l'ombre de v sur l'axe u. Toute une famille de calculs en découle : la vitesse vers l'avant d'une voiture (~Dot(velocity, forward)~), la part d'une force qui pousse contre un mur, la composante verticale d'un mouvement. Voir [[projection-vecteurs]].`],
['Le dot en rendu',`L'éclairage le plus simple (Lambert) vaut ~max(0, Dot(normale, directionLumière))~ : une surface face à la lumière est éclairée, de biais un peu, de dos pas du tout. Les shaders font des milliards de dot par seconde. L'effet « fresnel » (les bords qui brillent) utilise le dot entre la normale et la direction de la caméra.`],
['Détecter une pente',`~Dot(normaleDuSol, Vector3.up)~ vaut 1 sur un sol plat et diminue avec la pente. Comparer à ~Mathf.Cos(45° en radians)~ dit si la pente est trop raide pour marcher. Le ~CharacterController~ fait ce test avec son « Slope Limit ».`]],
d:[[`Écris un ~CarSpeedometer~ qui affiche la vitesse vers l'avant (positive) ou en marche arrière (négative), et la vitesse de dérapage latéral, à partir d'un Rigidbody.`,`Dot(velocity, transform.forward) et Dot(velocity, transform.right).`],
[`Écris ~bool CanWalkOn(Vector3 normal, float maxSlopeDegrees)~ sans calculer d'angle, puis utilise-le dans un contrôleur pour empêcher de grimper les pentes trop raides.`,`Dot(normal, up) >= cos(maxSlope).`]]},

'produit-vectoriel':{
r:[`Cross donne un vecteur perpendiculaire aux deux autres.`,`L'ordre compte ; en main gauche, ~Cross(up, forward) = right~.`,`Signe de ~Cross(forward, versCible).y~ : droite ou gauche.`],
m:[
['La règle de la main gauche',`Unity utilise un repère « main gauche » : pouce = x (droite), index = y (haut), majeur = z (avant). Pour ~Cross(a, b)~, pointe les doigts vers a, plie-les vers b : le pouce donne le résultat. Beaucoup de formules trouvées en ligne viennent de repères « main droite » (OpenGL, Blender) : le signe du résultat est inversé.`],
['L\'aire',`La longueur de ~Cross(a, b)~ est l'aire du parallélogramme formé par a et b ; la moitié donne l'aire du triangle. Utile pour répartir des points uniformément sur un maillage (on choisit un triangle selon son aire) ou pour détecter un triangle dégénéré (aire presque nulle).`],
['Le produit vectoriel 2D',`En 2D, on garde seulement ~a.x * b.y - a.y * b.x~, un nombre (parfois appelé « perp dot »). Son signe dit si b est à gauche ou à droite de a. C'est la base des tests « ce point est-il dans ce triangle ? » et de l'intersection de deux segments.`]],
d:[[`Écris ~bool PointInTriangle(Vector2 p, Vector2 a, Vector2 b, Vector2 c)~ avec le produit vectoriel 2D : le point est dedans si les trois signes sont identiques.`,`Calcule le cross 2D de (b − a, p − a), (c − b, p − b), (a − c, p − c).`],
[`Écris ~Vector3 RandomPointOnMesh(Mesh mesh, System.Random rng)~ qui choisit un triangle selon son aire puis un point uniforme dedans.`,`Aires par Cross ; tirage pondéré ; dans le triangle : si u + v > 1, alors u = 1 − u, v = 1 − v.`]]},

'projection-vecteurs':{
r:[`~Project(v, d)~ garde la part de v dans la direction d.`,`~ProjectOnPlane(v, n)~ retire la part le long de la normale.`,`Pentes, glissades le long des murs, déplacement relatif à la caméra.`],
m:[
['Glisser le long d\'un mur',`Quand un personnage avance vers un mur en biais, on veut qu'il glisse le long au lieu de s'arrêter net. On projette le mouvement sur le plan du mur : la part qui va dans le mur disparaît, la part parallèle reste. C'est ce que fait en interne le ~CharacterController~ à chaque contact.`],
['Rejet',`Le **rejet** est le complément de la projection : ~v - Project(v, d)~, la part de v perpendiculaire à d. Exemple : la distance d'un point à une droite est la longueur du rejet du vecteur (point − origine de la droite) sur la direction de la droite.`]],
d:[[`Écris ~float DistancePointToSegment(Vector3 p, Vector3 a, Vector3 b)~ : projette sur le segment, borne le paramètre entre 0 et 1, puis mesure.`,`t = Dot(p − a, b − a) / sqrMagnitude(b − a), Clamp01, point = a + t(b − a).`],
[`Écris un déplacement de personnage qui glisse le long des murs : lance un SphereCast dans la direction du mouvement, et en cas de contact, remplace le mouvement par sa projection sur le plan du mur.`,`Physics.SphereCast, puis Vector3.ProjectOnPlane(move, hit.normal).`]]},

'angles-signes':{
r:[`~Angle~ : de combien. ~SignedAngle~ : de combien et de quel côté.`,`~DeltaAngle~ : la plus courte différence, entre −180 et 180.`,`~MoveTowardsAngle~ et ~LerpAngle~ passent par le plus court chemin.`],
m:[
['Le piège des eulerAngles',`~transform.eulerAngles~ est **recalculé** à partir du quaternion à chaque lecture : tu peux écrire (0, 190, 0) et relire (0, −170, 0) ou (180, 10, 180) qui représentent la même orientation. Ne lis jamais un angle d'Euler pour le modifier et le réécrire chaque image sur plusieurs axes ; garde tes propres angles dans des champs (lacet, tangage) et reconstruis la rotation.`,`yaw += input.x * sensitivity;
pitch = Mathf.Clamp(pitch - input.y * sensitivity, -80f, 80f);
transform.rotation = Quaternion.Euler(pitch, yaw, 0f);`],
['Lacet, tangage, roulis',`Le **lacet** (yaw) tourne autour de l'axe vertical (regarder à gauche ou à droite), le **tangage** (pitch) autour de l'axe droit (regarder en haut ou en bas), le **roulis** (roll) autour de l'axe avant (pencher la tête). Une caméra à la première personne garde lacet et tangage séparés, et borne le tangage.`]],
d:[[`Écris une caméra à la première personne : souris pour lacet et tangage (borné à ±80°), le lacet tourne le corps, le tangage seulement la caméra.`,`Deux Transform : corps (yaw) et caméra enfant (pitch).`],
[`Écris ~float AngleDifference(Transform a, Transform b)~ qui renvoie l'écart de lacet le plus court entre deux objets, puis utilise-le pour qu'un PNJ tourne la tête vers le joueur seulement si l'écart est sous 70°.`,`Mathf.DeltaAngle(a.eulerAngles.y, b.eulerAngles.y) ; ou SignedAngle sur leurs forward avec Vector3.up.`]]},

'interpolation':{
r:[`~Lerp(a, b, t) = a + (b − a) × t~.`,`~InverseLerp~ retrouve t ; les deux enchaînés font un remap.`,`Lerp vers une cible chaque image : ~t = 1 − exp(−vitesse × dt)~.`],
m:[
['Lerp borné ou non',`~Mathf.Lerp~ borne t entre 0 et 1. ~Mathf.LerpUnclamped~ ne le borne pas : t = 1,2 dépasse la cible de 20 %, utile pour des effets d'anticipation ou d'élan. Même chose pour ~Vector3.Lerp~ et ~LerpUnclamped~.`],
['Interpoler des couleurs',`~Color.Lerp~ mélange les composantes rouge, vert, bleu. Entre rouge et vert, le milieu est un marron terne. Passer par l'espace HSV (~Color.RGBToHSV~ puis ~Color.HSVToRGB~) donne un passage par le jaune, plus naturel pour une barre de vie. Pour des dégradés éditables par les designers, ~Gradient.Evaluate(t)~.`],
['Pourquoi l\'exponentielle',`Rattraper 10 % de l'écart par image revient à multiplier l'écart restant par 0,9 à chaque image : après n images, il reste 0,9ⁿ. Pour que le résultat dépende du **temps** et non du nombre d'images, on remplace « n images » par « t secondes » : il reste ~exp(−k × t)~. D'où ~1 − exp(−k × dt)~ comme fraction à rattraper à chaque image.`]],
d:[[`Écris une barre de vie dont la couleur passe de vert à jaune à rouge en HSV selon le ratio, et compare avec ~Color.Lerp~ direct.`,`Lerp sur la teinte H de 0,33 (vert) à 0 (rouge).`],
[`Vérifie numériquement que ton ~Damp~ donne la même position après 1 seconde à 30 images/s et à 144 images/s, alors que le Lerp naïf à 0,1 ne la donne pas.`,`Simule deux boucles avec dt = 1/30 et dt = 1/144 et compare.`]]},

'easing':{
r:[`L'easing transforme t avant le Lerp.`,`Ease out pour ce qui arrive, ease in pour ce qui part.`,`~AnimationCurve~ pour laisser les designers dessiner la courbe.`],
m:[
['Le game feel en pratique',`Le célèbre exposé « Juice it or lose it » montre un même jeu transformé par des détails : easing sur chaque mouvement, petites secousses, particules, sons. Un menu qui apparaît en 0,25 s avec un ease out paraît réactif et soigné ; le même en linéaire paraît bon marché. Dans un studio, cette sensibilité est très recherchée.`],
['Durées',`Les animations d'interface durent souvent entre 0,15 et 0,35 s. Plus long, le joueur attend ; plus court, il ne voit rien. Les animations de gameplay peuvent être plus longues, mais l'entrée du joueur doit toujours pouvoir les interrompre.`],
['Bibliothèques',`DOTween, LeanTween et PrimeTween fournissent des centaines d'easings et un enchaînement facile (~transform.DOMove(target, 0.3f).SetEase(Ease.OutBack)~). Savoir écrire les fonctions toi-même te permet de comprendre et d'adapter ce qu'elles font.`]],
d:[[`Écris ~OutElastic(t)~ et ~OutBounce(t)~ (formules disponibles sur easings.net), puis une petite scène de test qui anime 6 cubes côte à côte, un par easing, pour les comparer.`,`Une coroutine par cube avec la même durée, chacun avec sa fonction.`],
[`Écris un ~Tween~ minimal : ~Tween.Move(Transform t, Vector3 to, float duration, Func<float, float> ease)~ qui renvoie un objet qu'on peut annuler.`,`Une coroutine lancée par un MonoBehaviour hôte ; l'objet renvoyé garde la Coroutine pour StopCoroutine.`]]},

'smoothdamp-ressort':{
r:[`~SmoothDamp~ suit une cible comme un ressort amorti, sans dépasser.`,`La vitesse (~ref velocity~) est un champ conservé entre les images.`,`Un ressort : force = raideur × écart − amortissement × vitesse.`],
m:[
['Amortissement critique',`Un ressort peut être **sous-amorti** (il oscille), **sur-amorti** (il arrive lentement) ou **critique** (il arrive le plus vite possible sans dépasser). SmoothDamp approxime le cas critique. Pour un ressort à toi, l'amortissement critique vaut ~2 × √(raideur)~ (masse 1).`],
['Stabilité',`L'intégration simple du ressort (vitesse puis position) peut exploser si la raideur est forte et l'image longue (un ralentissement de 100 ms) : l'objet part à l'infini. Solutions : borner ~dt~, découper en plusieurs petits pas, ou utiliser une formule exacte. C'est un vrai bug qu'on rencontre quand le jeu a un pic de lag.`]],
d:[[`Ajoute à ~Spring~ un découpage en sous-pas de 1/120 s maximum, et vérifie qu'il reste stable même avec dt = 0,2.`,`Boucle tant que le temps restant est positif, avec un pas = min(restant, 1/120).`],
[`Écris un ~Spring3~ (vecteur) et utilise-le pour un réticule de visée qui suit la souris avec un léger effet élastique.`,`Même formule appliquée au Vector3.`]]},

'courbes-bezier':{
r:[`Une Bézier, ce sont des Lerp imbriqués.`,`Cubique : deux extrémités et deux poignées.`,`t régulier ne donne pas une vitesse régulière.`],
m:[
['Splines',`Une seule courbe a peu de contrôle. On en enchaîne plusieurs pour former une **spline**. Pour qu'elle soit lisse, la poignée de sortie d'une courbe et la poignée d'entrée de la suivante doivent être alignées avec leur point commun. Les splines Catmull-Rom passent par tous leurs points de contrôle, pratique pour un chemin de patrouille. Unity fournit le paquet Splines.`],
['Tangente',`La dérivée de la courbe donne la **tangente**, la direction de déplacement en chaque point : on s'en sert pour orienter un wagon ou un projectile le long de sa trajectoire (~Quaternion.LookRotation(tangente)~).`,`Vector3 CubicTangent(Vector3 a, Vector3 b, Vector3 c, Vector3 d, float t)
{
    float u = 1f - t;
    return 3f * u * u * (b - a) + 6f * u * t * (c - b) + 3f * t * t * (d - c);
}`]],
d:[[`Écris un ~ArcLengthTable~ qui échantillonne une cubique en 100 points, cumule les longueurs, et donne ~float TAtDistance(float d)~ pour avancer à vitesse constante.`,`Recherche binaire dans le tableau des longueurs cumulées, puis interpolation entre deux échantillons.`],
[`Fais avancer un wagon sur une spline de plusieurs cubiques, orienté selon la tangente, à vitesse constante.`,`Combine la table de longueurs de chaque segment et CubicTangent.`]]},

'collisions-formes':{
r:[`Cercles : distance au carré contre somme des rayons au carré.`,`AABB : chevauchement sur chaque axe.`,`Cercle contre boîte : point le plus proche par Clamp.`],
m:[
['Le théorème des axes séparateurs',`Deux formes convexes ne se touchent pas s'il existe un axe sur lequel leurs projections ne se chevauchent pas. Pour des rectangles tournés (OBB), on teste les axes de chacun. C'est la généralisation du test AABB, et la base des moteurs de collision.`],
['Tunneling',`Un objet rapide peut traverser un mur fin entre deux images sans jamais le chevaucher. Solutions : tester le **segment** parcouru plutôt que la position (raycast ou balayage), réduire le pas, ou activer la détection continue (« Continuous ») sur le Rigidbody pour les balles.`],
['Phase large et phase étroite',`Les moteurs physiques travaillent en deux temps : une phase large rapide (boîtes englobantes, [[partition-spatiale]]) élimine les paires trop éloignées, puis une phase étroite précise teste les rares paires restantes. Reprends ce schéma dans tes propres systèmes.`]],
d:[[`Écris ~bool SegmentCircle(Vector2 a, Vector2 b, Vector2 c, float r)~ (un projectile rapide touche-t-il un cercle entre deux images ?).`,`Distance du centre au segment (voir projection) comparée au rayon.`],
[`Fais un mini shoot'em up 2D sans physique Unity : 300 balles et 50 ennemis, collisions cercle contre cercle, et mesure le temps de la boucle de collision avant et après une grille de partition.`,`La grille de la leçon Partition spatiale, en 2D.`]]},

'point-aleatoire-forme':{
r:[`Pour un disque uniforme : rayon = R × √(aléatoire).`,`Unity fournit ~insideUnitCircle~, ~insideUnitSphere~, ~onUnitSphere~.`,`Anneau : racine d'un lerp entre les carrés des rayons.`],
m:[
['Échantillonnage par rejet',`Pour une forme compliquée, on tire un point dans une boîte qui l'englobe et on recommence tant qu'il n'est pas dedans. Simple et uniforme, mais lent si la forme occupe peu de la boîte. Pour un disque, environ 79 % des tirages sont acceptés.`],
['Répartitions sans amas',`Le vrai hasard fait des amas et des trous. Pour disposer des arbres ou des rochers naturellement, l'échantillonnage de Poisson (disque de Poisson) garantit une distance minimale entre les points. L'algorithme de Bridson le fait rapidement, avec une grille d'accélération.`]],
d:[[`Écris ~Vector3 InCone(Vector3 forward, float angleDegrees, System.Random rng)~ qui renvoie une direction aléatoire uniforme dans un cône (dispersion d'une arme).`,`Tire un point dans un disque à la base du cône (rayon tan(angle)), ajoute forward, normalise, puis oriente avec LookRotation.`],
[`Écris un échantillonnage de Poisson simple (Bridson) dans un rectangle avec une distance minimale, et place des arbres avec.`,`Grille de cellules de taille r/√2 ; pour chaque point actif, essaie k = 30 candidats dans l'anneau [r, 2r].`]]},

'bruit-perlin':{
r:[`Valeurs aléatoires mais continues : deux points proches ont des valeurs proches.`,`Fréquence et octaves pour régler le détail.`,`Tremblement de caméra : Perlin sur le temps, une ligne par axe.`],
m:[
['Comment ça marche',`Perlin place une grille et tire une direction aléatoire (un gradient) à chaque intersection. Pour un point donné, il regarde les 4 coins de sa case, fait le [[produit-scalaire]] entre chaque gradient et le vecteur vers le point, puis interpole ces 4 valeurs avec une courbe douce. Le résultat ondule de façon organique.`],
['Utiliser le bruit pour générer',`Un terrain : hauteur = bruit fractal. Des biomes : un second bruit de basse fréquence pour l'humidité, un troisième pour la température. Des grottes : bruit 3D seuillé. Le « domain warping » (décaler les coordonnées avec un autre bruit) donne des formes plus naturelles encore.`],
['Simplex et autres bruits',`Le bruit Simplex (également de Ken Perlin) a moins d'artefacts en grille et coûte moins en 3D. ~Unity.Mathematics.noise~ fournit ~snoise~ et ~cnoise~ (cellulaire, pour des motifs en cellules comme des pierres ou de la peau de lézard), utilisables dans les [[jobs-burst|jobs]].`]],
d:[[`Génère un terrain avec un maillage de 100×100 sommets dont la hauteur vient de ~Fractal~, avec des couleurs de sommet selon l'altitude (eau, sable, herbe, roche, neige).`,`Construis vertices, triangles et colors, puis mesh.RecalculateNormals().`],
[`Ajoute une graine au terrain et un « domain warping » : décale x et y par un second bruit avant de calculer la hauteur. Compare visuellement.`,`x' = x + Perlin(x + 5,2, y + 1,3) × force.`]]},

'espaces-coordonnees':{
r:[`Chaque Transform est un repère : origine, axes, échelle.`,`~TransformPoint~ (point), ~TransformDirection~ (direction), ~TransformVector~ (vecteur avec échelle).`,`En local, z > 0 = devant, x > 0 = à droite.`],
m:[
['Les autres espaces',`Au-delà du local et du monde, le rendu passe par l'espace **vue** (relatif à la caméra), l'espace **écran** (pixels) et l'espace **viewport** (0 à 1). ~Camera.WorldToScreenPoint~ place une barre de vie d'UI au-dessus d'un ennemi ; ~ViewportToWorldPoint~ trouve les bords de l'écran dans le monde.`],
['Hiérarchies et performance',`Chaque fois qu'un Transform bouge, Unity doit recalculer celui de tous ses enfants. Une hiérarchie très profonde d'objets qui bougent coûte cher. Les objets dynamiques nombreux (balles, ennemis) gagnent à être à la racine de la scène ou sous un parent qui ne bouge pas.`]],
d:[[`Affiche une barre de vie d'UI qui suit un ennemi : position écran au-dessus de sa tête, cachée s'il est derrière la caméra.`,`WorldToScreenPoint ; si z < 0, l'objet est derrière la caméra.`],
[`Écris ~Vector3 ClampToScreen(Camera cam, Vector3 world, float margin)~ qui garde un objet à l'intérieur de l'écran (un vaisseau dans un shoot'em up).`,`Passe en viewport, Clamp entre margin et 1 − margin, puis reviens en monde.`]]},

'matrices':{
r:[`~Matrix4x4.TRS~ combine position, rotation et échelle.`,`~MultiplyPoint3x4~ pour un point, ~MultiplyVector~ pour une direction.`,`Multiplier deux matrices enchaîne les transformations ; l'ordre compte.`],
m:[
['Pourquoi 4×4 pour de la 3D',`Une matrice 3×3 sait tourner et mettre à l'échelle, mais pas déplacer. En ajoutant une 4e coordonnée (1 pour un point, 0 pour une direction), le déplacement devient une multiplication comme les autres. C'est aussi pour ça qu'une direction (w = 0) n'est pas affectée par la translation.`],
['Projection',`La caméra utilise aussi une matrice de **projection**, qui transforme l'espace vue en coordonnées d'écran. En perspective, elle divise par la profondeur : ce qui est loin paraît plus petit. ~cam.projectionMatrix~ et ~cam.worldToCameraMatrix~ permettent des effets avancés (miroirs, portails, caméras obliques).`]],
d:[[`Dessine en ~Gizmos~ un cube tourné et mis à l'échelle à l'aide de ~Gizmos.matrix = Matrix4x4.TRS(...)~, puis le même cube enfant d'un autre en multipliant les matrices.`,`Gizmos.matrix = parentMatrix * childMatrix ; DrawWireCube(Vector3.zero, Vector3.one).`],
[`Anime les 200 objets de ~RingRenderer~ (chacun monte et descend avec un sinus décalé) en recalculant seulement les matrices, sans aucun GameObject.`,`Recalcule matrices[i] dans Update avec un y = sin(t + i × 0,1).`]]},

'plans-intersections':{
r:[`Un plan = une normale + un point.`,`~t = Dot(P − O, N) / Dot(D, N)~ ; parallèle si le dénominateur vaut 0.`,`Viser le sol sans collider ni physique.`],
m:[
['Plan et frustum',`Le volume visible d'une caméra (le frustum) est délimité par 6 plans. ~GeometryUtility.CalculateFrustumPlanes(cam)~ les donne, et ~TestPlanesAABB~ dit si une boîte est visible : c'est ainsi qu'on ignore les objets hors champ (culling) dans un système maison.`],
['Rayon contre sphère',`Autre intersection très utile : substituer ~O + tD~ dans l'équation de la sphère donne une équation du second degré en t. Discriminant négatif : raté. Sinon, la plus petite racine positive est le point d'entrée. C'est le cœur de nombreux tests de visée sans physique.`]],
d:[[`Écris ~bool RaySphere(Ray ray, Vector3 center, float radius, out float t)~ avec la formule du second degré.`,`oc = O − C ; b = Dot(oc, D) ; c = |oc|² − r² ; disc = b² − c ; t = −b − √disc.`],
[`Écris un outil de sélection par rectangle (comme un jeu de stratégie) : convertis le rectangle tracé à l'écran en 4 plans et sélectionne les unités dont la position est du bon côté des 4.`,`Plan passant par la caméra et deux coins du rectangle : normale = Cross des deux rayons.`]]},

'quaternions':{
r:[`Euler : lisible mais gimbal lock et interpolation bizarre.`,`On construit les quaternions (~Euler~, ~AngleAxis~, ~LookRotation~), on ne les écrit pas à la main.`,`~q1 * q2~ : q2 puis q1 ; ~q * v~ fait tourner v.`],
m:[
['Rotation locale ou mondiale',`~transform.rotation = transform.rotation * q~ applique q dans l'espace **local** de l'objet (tourner autour de son propre axe). ~transform.rotation = q * transform.rotation~ l'applique dans l'espace **monde**. C'est la cause de beaucoup de rotations « bizarres ».`],
['Différence entre deux rotations',`La rotation qui va de a à b vaut ~b * Quaternion.Inverse(a)~. ~Quaternion.Angle(a, b)~ donne l'écart en degrés. ~q.ToAngleAxis(out angle, out axis)~ décompose une rotation en angle et axe, utile pour convertir en vitesse angulaire de Rigidbody.`],
['Le double recouvrement',`q et −q représentent la même orientation. Slerp choisit automatiquement le chemin le plus court, mais si tu interpoles des quaternions à la main (ou dans un shader), vérifie le signe du produit scalaire entre les deux et inverse l'un s'il est négatif.`]],
d:[[`Écris ~Vector3 AngularVelocityTo(Quaternion from, Quaternion to, float dt)~ qui donne la vitesse angulaire (rad/s) pour passer de from à to en dt secondes, et utilise-la sur un Rigidbody qui suit l'orientation d'une main en VR.`,`delta = to × Inverse(from) ; ToAngleAxis ; si angle > 180, angle −= 360 ; axis × angle × Deg2Rad / dt.`],
[`Fais un objet qui s'aligne sur la normale du sol tout en gardant sa direction de marche (un véhicule sur un terrain bosselé).`,`Quaternion.FromToRotation(transform.up, normal) * transform.rotation, puis Slerp pour lisser.`]]}
});

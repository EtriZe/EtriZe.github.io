window.EXTRA=Object.assign(window.EXTRA||{},{
'menuitem-contextmenu':{
r:[`~[MenuItem]~ sur une méthode static ajoute une commande aux menus.`,`Une méthode de validation grise la commande quand elle n'a pas de sens.`,`Toute modification passe par ~Undo~.`],
m:[
['Ce qui fait un bon petit outil',`Les meilleurs outils de studio sont souvent minuscules : une commande qui fait en une seconde ce qu'un artiste fait 50 fois par jour en dix clics. Pour les trouver, observe et demande : « Qu'est-ce que tu fais souvent et qui t'ennuie ? ». Un Tools Programmer passe autant de temps à écouter qu'à coder.`],
['Sauvegarder les modifications',`Une modification faite par script sur un objet de scène doit marquer la scène comme modifiée (~EditorSceneManager.MarkSceneDirty~), sinon Unity peut ne pas proposer de l'enregistrer. ~Undo.RecordObject~ s'en charge pour les objets qu'il suit.`],
['Raccourcis et conflits',`Les raccourcis déclarés dans un MenuItem peuvent entrer en conflit avec ceux de Unity ou d'autres outils. Le Shortcut Manager (Edit > Shortcuts) permet à chacun de les réassigner. Documente les raccourcis de tes outils dans le menu lui-même (le nom affiché).`]],
d:[[`Écris une commande « Assets/Créer un dossier de fonctionnalité » qui crée, dans le dossier sélectionné, la structure Scripts, Prefabs, Materials, Textures.`,`AssetDatabase.GetAssetPath(Selection.activeObject), puis AssetDatabase.CreateFolder.`],
[`Écris une commande « GameObject/Aligner sur le sol » qui fait tomber chaque objet sélectionné sur la surface en dessous (raycast) et l'oriente selon la normale, avec Undo.`,`Physics.Raycast vers le bas ; Undo.RecordObject(t, ...) avant de changer position et rotation.`]]},

'custom-inspector':{
r:[`~[CustomEditor(typeof(X))]~ + ~CreateInspectorGUI~ en UI Toolkit.`,`Le code d'éditeur vit hors du build (dossier Editor ou assembly éditeur).`,`Passer par ~SerializedObject~ pour l'Undo, la multi-sélection et les prefabs.`],
m:[
['Multi-sélection',`~[CanEditMultipleObjects]~ autorise l'édition de plusieurs objets à la fois. Avec ~SerializedProperty~, c'est automatique : un champ affiche « — » quand les valeurs diffèrent, et une modification s'applique à tous. Écrire directement dans ~target~ ne touche qu'un seul objet : encore une raison de passer par les propriétés sérialisées.`],
['UI Toolkit avec UXML et USS',`Pour un inspecteur riche, on décrit la mise en page dans un fichier UXML (comme du HTML) et le style dans un USS (comme du CSS), et le C# ne fait que charger et brancher. L'UI Builder permet de dessiner l'interface visuellement. Les designers d'outils et les programmeurs peuvent ainsi travailler séparément.`],
['Ne pas trop en faire',`Un inspecteur personnalisé doit être maintenu à chaque nouveau champ. Avant d'en écrire un, vérifie si des attributs suffisent (~[Header]~, ~[Tooltip]~, ~[Range]~, ~[Min]~) ou un [[property-drawer]] réutilisable.`]],
d:[[`Rends ~WeaponDataEditor~ compatible avec la multi-sélection et ajoute un avertissement (~HelpBox~) quand le DPS dépasse 200.`,`[CanEditMultipleObjects] ; new HelpBox("...", HelpBoxMessageType.Warning) dont on change display dans Refresh.`],
[`Recrée l'inspecteur de ~WeaponData~ avec un fichier UXML et une feuille USS, chargés par ~AssetDatabase.LoadAssetAtPath<VisualTreeAsset>~.`,`visualTree.CloneTree(root) puis root.Bind(serializedObject).`]]},

'property-drawer':{
r:[`Un drawer change l'affichage d'un type ou d'un attribut partout.`,`On navigue avec ~FindPropertyRelative~.`,`Attribut hors du dossier Editor, drawer dedans.`],
m:[
['Decorator drawers',`Un ~DecoratorDrawer~ ajoute quelque chose autour d'un champ sans le remplacer : un séparateur, un titre coloré, une aide. C'est ce que font ~[Header]~ et ~[Space]~.`],
['Valider dans le drawer',`Un drawer peut afficher l'état du champ : un ~[Required]~ qui encadre en rouge les références vides, un ~[Scene]~ qui affiche un menu des scènes du build au lieu d'un texte, un ~[Layer]~ qui affiche un menu des layers au lieu d'un nombre. Chaque erreur évitée dans l'inspecteur est un bug en moins en QA.`]],
d:[[`Écris un attribut ~[Layer]~ pour un champ ~int~ et son drawer qui affiche un ~LayerField~ (menu des layers).`,`new LayerField(property.displayName) avec BindProperty.`],
[`Écris un attribut ~[Required]~ dont le drawer ajoute une bordure rouge et un message quand la référence est vide, mis à jour en direct.`,`TrackPropertyValue(property, _ => Refresh()) ; style.borderLeftColor et borderLeftWidth.`]]},

'editor-window':{
r:[`Une fenêtre ancrable, ouverte depuis un ~[MenuItem]~.`,`~AssetDatabase.FindAssets("t:Type")~ pour trouver des assets.`,`L'outil idéal pour ce qui concerne tout le projet.`],
m:[
['Garder l\'état de la fenêtre',`Les champs d'une ~EditorWindow~ marqués ~[SerializeField]~ survivent aux recompilations et à la fermeture de l'éditeur (la fenêtre est sérialisée). Sans ça, l'utilisateur perd sa recherche ou sa sélection à chaque modification de code, ce qui rend l'outil pénible.`],
['ListView pour les longues listes',`Créer un bouton par élément convient pour 50 armes, pas pour 5 000 assets. ~ListView~ d'UI Toolkit ne crée que les lignes visibles et les recycle en faisant défiler (virtualisation). C'est la même idée que le [[object-pooling]].`],
['Réagir aux changements du projet',`~EditorApplication.projectChanged~ et ~AssetPostprocessor.OnPostprocessAllAssets~ préviennent quand des assets sont ajoutés, supprimés ou modifiés : la fenêtre peut se rafraîchir toute seule.`]],
d:[[`Réécris ~WeaponOverviewWindow~ avec un champ de recherche, une ~ListView~ virtualisée et une colonne par propriété, et garde le texte de recherche entre deux recompilations.`,`ListView avec makeItem et bindItem ; [SerializeField] string search.`],
[`Écris une fenêtre « Références manquantes » qui parcourt tous les prefabs et liste les composants dont un champ objet pointe vers un asset supprimé.`,`SerializedObject et SerializedProperty.NextVisible ; une référence cassée a objectReferenceValue == null mais objectReferenceInstanceIDValue != 0.`]]},

'handles-scene':{
r:[`Les Handles se dessinent et se manipulent dans la vue Scene.`,`~OnSceneGUI~ dans un éditeur personnalisé.`,`~BeginChangeCheck~ / ~EndChangeCheck~ puis ~Undo.RecordObject~.`],
m:[
['Overlays et outils de scène',`Depuis Unity 2021, on peut ajouter ses propres **outils** à la barre d'outils de la vue Scene (~EditorTool~) et des panneaux flottants (~Overlay~). Un outil de placement de points de patrouille devient alors un vrai mode d'édition, comme les outils de déplacement intégrés.`],
['Interactions souris',`~Event.current~ donne le clic, la touche et la position de la souris. ~HandleUtility.GUIPointToWorldRay~ transforme la souris en rayon : on peut ajouter un point là où l'on clique sur le sol (avec ~Physics.Raycast~). Penser à ~Event.current.Use()~ pour que Unity ne traite pas le clic une seconde fois (sélection d'un autre objet).`]],
d:[[`Ajoute à ~PatrolPathEditor~ : Maj+clic sur le sol ajoute un point à la fin, Ctrl+clic sur un point le supprime.`,`HandleUtility.GUIPointToWorldRay(Event.current.mousePosition) ; Event.current.shift ; Event.current.Use().`],
[`Écris un ~EditorTool~ « Pinceau » qui place des instances d'un prefab là où l'on clique et glisse sur le sol, avec un espacement minimal.`,`[EditorTool("Pinceau")] ; dans OnToolGUI, raycast et PrefabUtility.InstantiatePrefab + Undo.RegisterCreatedObjectUndo.`]]},

'batch-assets':{
r:[`~StartAssetEditing~ / ~StopAssetEditing~ dans un try/finally.`,`~LoadPrefabContents~ pour modifier un prefab, ~SetDirty~ pour un ScriptableObject.`,`Barre de progression annulable et résumé final.`],
m:[
['Mode simulation',`Un bon outil de masse propose un mode « essai à blanc » qui liste ce qu'il **ferait** sans rien modifier. On vérifie la liste, puis on lance pour de vrai. C'est simple à ajouter (un bool) et cela évite les catastrophes.`],
['Renommer et déplacer',`~AssetDatabase.RenameAsset~ et ~MoveAsset~ gardent le GUID, donc toutes les références restent valides. Renommer ou déplacer un fichier en dehors de Unity (explorateur, script Python) sans son ~.meta~ casse les références. C'est une erreur classique d'automatisation externe.`],
['Python ou C# ?',`Ce qui touche aux assets Unity (prefabs, références, réglages d'import) se fait en C# dans l'éditeur, qui comprend le format. Ce qui se passe autour (copier des builds, analyser des logs, appeler des API) se fait bien en Python. Les deux se combinent : Python lance Unity en ligne de commande avec ~-executeMethod~ (voir [[build-ligne-commande]]).`]],
d:[[`Écris un renommeur en masse : préfixe selon le type (~T_~ textures, ~M_~ matériaux, ~SM_~ maillages, ~P_~ prefabs) pour tout un dossier, avec un mode simulation qui affiche la liste avant d'agir.`,`AssetDatabase.GetMainAssetTypeAtPath ; AssetDatabase.RenameAsset.`],
[`Écris un outil qui trouve les assets inutilisés : ceux dont aucun asset des scènes du build ne dépend.`,`AssetDatabase.GetDependencies(scènes, recursive: true), puis comparer avec la liste de tous les assets.`]]},

'validation-assets':{
r:[`Une erreur trouvée à l'import coûte zéro ; trouvée en QA, beaucoup plus.`,`~AssetPostprocessor~ : corriger automatiquement ou signaler.`,`Une validation en CI qui échoue avec un code de sortie.`],
m:[
['Des règles lisibles par tous',`Écrire les règles en dur dans le code oblige à passer par un programmeur pour chaque changement. Les studios mettent souvent les règles dans un ScriptableObject (dossier, taille maximale, compression, préfixe) que les directeurs techniques artistiques modifient eux-mêmes.`],
['Ne pas bloquer le travail',`Un postprocessor qui annule l'import ou lève des erreurs à chaque fichier exaspère les artistes. Corrige silencieusement ce qui peut l'être, avertis pour le reste, et réserve les échecs bloquants à la CI, avec un rapport clair qui dit **quoi** corriger et **comment**.`],
['Validation à la demande',`En plus de l'import, une commande « Valider le projet » et un passage automatique avant chaque build (voir [[build-hooks]]) attrapent les problèmes des assets importés avant l'ajout de la règle.`]],
d:[[`Déplace les règles de ~TextureRules~ dans un ScriptableObject ~TextureRuleSet~ (liste de dossiers, avec taille maximale et type pour chacun), lu par le postprocessor.`,`Charge l'asset de règles avec AssetDatabase.FindAssets("t:TextureRuleSet").`],
[`Fais écrire à ~ValidateAll~ un rapport JUnit XML que GitLab affiche comme des résultats de tests dans la merge request.`,`Un testsuite avec un testcase par asset et un élément failure pour chaque erreur ; artifacts:reports:junit dans .gitlab-ci.yml.`]]},

'assembly-definitions':{
r:[`Un ~.asmdef~ crée un module compilé séparément.`,`Les références sont explicites : pas de dépendances cachées ni circulaires.`,`Un assembly réservé à l'éditeur remplace les dossiers Editor.`],
m:[
['Mesurer le gain',`Le gain dépend de la structure : il n'y en a presque pas si tout dépend d'un énorme assembly central qu'on modifie sans cesse. On découpe pour que le code qui change souvent (gameplay) soit en bout de chaîne, et le code stable (utilitaires, moteur maison) en amont.`],
['Define constraints et versions',`Un asmdef peut n'être compilé que si un symbole est défini (~ENABLE_INPUT_SYSTEM~), ou si un paquet est présent dans une version donnée (« Version Defines »). On écrit ainsi du code optionnel qui ne casse pas un projet où le paquet est absent.`]],
d:[[`Découpe un petit projet en ~Game.Core~ (logique pure), ~Game.Unity~ (MonoBehaviour), ~Game.Editor~ (outils) et ~Game.Tests~, et vérifie que Core ne référence pas UnityEngine.`,`Cocher « No Engine References » sur Core.`],
[`Ajoute un code optionnel compilé seulement si le paquet Addressables est installé, avec une Version Define.`,`Dans l'asmdef : Version Defines, ressource com.unity.addressables, symbole USE_ADDRESSABLES.`]]},

'tests-unitaires':{
r:[`Un test vérifie automatiquement un comportement, à chaque modification.`,`Edit Mode pour la logique pure, Play Mode pour le moteur.`,`Le code testable reçoit ses dépendances au lieu de les chercher.`],
m:[
['Bien nommer et structurer',`Un nom de test dit le comportement attendu (~Spend_RefusesWhenTooPoor~). Chaque test suit le schéma Préparer, Agir, Vérifier, et teste une seule chose. Quand un test échoue, son nom doit suffire pour comprendre ce qui est cassé.`],
['Tester le temps et le hasard',`Un code qui lit ~Time.deltaTime~ ou ~Random.value~ en direct ne se teste pas de façon fiable. On lui passe le temps en paramètre (comme ~Timer.Tick(dt)~) et un générateur avec graine (voir [[aleatoire]]) : le test devient reproductible.`],
['Tests de non-régression',`Quand un bug est trouvé, on écrit d'abord un test qui le reproduit (il échoue), puis on corrige (il passe). Le bug ne pourra plus revenir sans qu'on le sache. Une équipe qui fait ça systématiquement voit ses bugs diminuer d'un projet à l'autre.`]],
d:[[`Écris des tests pour ~LevelFor~ (recherche binaire) : xp nul, xp exactement sur un seuil, au-delà du dernier seuil, et un tableau d'un seul élément.`,`[TestCase(0, 1)], [TestCase(100, 2)] permettent plusieurs cas dans un seul test.`],
[`Écris un test Play Mode qui instancie un Rigidbody au-dessus d'un sol, attend 2 secondes, et vérifie qu'il s'est posé.`,`[UnityTest] renvoyant IEnumerator ; yield return new WaitForSeconds(2f).`]]},

'build-ligne-commande':{
r:[`~-batchmode -quit -executeMethod Classe.Methode~.`,`~BuildPipeline.BuildPlayer~ et vérification du ~BuildReport~.`,`~EditorApplication.Exit(code)~ pour que la CI voie l'échec.`],
m:[
['Un pipeline GitLab type',`Étapes habituelles : **validate** (validation des assets, tests Edit Mode), **build** (un job par plateforme, en parallèle), **test** (tests Play Mode sur le build), **deploy** (envoi sur Steam ou à la QA). Le cache de la ~Library~ entre les jobs évite de réimporter tout le projet à chaque fois, et c'est souvent le plus gros gain de temps.`,`build-windows:
  stage: build
  script:
    - unity -batchmode -nographics -quit -projectPath . -executeMethod BuildScript.BuildWindows -buildPath Builds/Game.exe -logFile -
  cache:
    key: library-windows
    paths: [Library/]
  artifacts:
    paths: [Builds/]`],
['Licences et machines',`Unity en ligne de commande a besoin d'une licence activée sur la machine de build. Les studios utilisent des machines dédiées (runners), parfois des images Docker préparées avec la bonne version de Unity, et un serveur de licences.`],
['Builds reproductibles',`Un build doit pouvoir être refait à l'identique : version de Unity fixée dans le dépôt (~ProjectSettings/ProjectVersion.txt~), paquets verrouillés (~packages-lock.json~), et numéro de version issu du commit. Quand un bug arrive d'un joueur, on sait exactement quel code il exécutait.`]],
d:[[`Écris un ~BuildScript.Build(string target)~ générique qui accepte Windows, macOS et Linux via un argument ~-buildTarget~, et choisit le bon nom de fichier de sortie.`,`Un switch sur la chaîne vers BuildTarget ; extension .exe, .app ou rien.`],
[`Écris le ~.gitlab-ci.yml~ complet avec trois étapes (tests Edit Mode, build Windows, envoi d'une archive en artefact), avec cache de la Library.`,`unity -runTests -testPlatform EditMode -testResults results.xml pour l'étape de tests.`]]},

'build-hooks':{
r:[`~IPreprocessBuildWithReport~ avant, ~IPostprocessBuildWithReport~ après.`,`~BuildFailedException~ pour arrêter proprement.`,`~callbackOrder~ règle l'ordre entre plusieurs crochets.`],
m:[
['Les autres crochets',`~IProcessSceneWithReport~ est appelé pour chaque scène pendant le build : on peut y retirer des objets de débogage (tous ceux qui portent un tag « EditorOnly » le sont déjà automatiquement). ~IPreprocessShaders~ permet de filtrer les variantes de shaders, un levier important pour réduire le temps de build et la taille.`],
['Nettoyer après soi',`Un crochet qui modifie le projet (écrire un fichier, changer un réglage) doit le restaurer après le build, même en cas d'échec. Sinon, le build suivant (ou le poste du développeur) hérite d'un état modifié. Le post-traitement n'est pas appelé si le build échoue : utilise ~BuildPlayerProcessor~ ou un try/finally autour de ton propre script de build.`]],
d:[[`Écris un ~IProcessSceneWithReport~ qui supprime de chaque scène tous les objets ayant un composant ~DebugOnly~, seulement dans les builds non « Development ».`,`report.summary.options & BuildOptions.Development ; Object.DestroyImmediate sur les objets trouvés.`],
[`Écris un post-traitement qui copie un fichier ~README.txt~ et le journal des modifications à côté de l'exécutable produit.`,`Path.GetDirectoryName(report.summary.outputPath).`]]}
});

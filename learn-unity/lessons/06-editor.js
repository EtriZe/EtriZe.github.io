window.LESSONS=(window.LESSONS||[]).concat([
{id:'menuitem-contextmenu',cat:'editor',lvl:1,title:'MenuItem et ContextMenu',sum:'Ajouter des commandes aux menus de l\'éditeur en une ligne.',
body:[
['L\'idée',`Le plus petit outil d'éditeur possible : une méthode static marquée ~[MenuItem("Tools/Ma commande")]~ apparaît dans la barre de menus. ~[ContextMenu("Réinitialiser")]~ sur une méthode d'un composant l'ajoute au menu ⋮ de ce composant dans l'inspecteur, sans dossier Editor.`],
['Raccourcis et validation',`Le chemin peut finir par un raccourci : ~"Tools/Grouper %g"~ (% = Ctrl ou Cmd, # = Maj, & = Alt). Une seconde méthode avec ~[MenuItem("Tools/Grouper", true)]~ renvoie un bool qui grise la commande quand elle n'a pas de sens (rien de sélectionné).`],
['Agir sur la sélection',`~Selection.gameObjects~ et ~Selection.activeObject~ donnent ce que l'utilisateur a sélectionné. Toute modification passe par ~Undo~ pour que Ctrl+Z fonctionne : ~Undo.RegisterCreatedObjectUndo~, ~Undo.SetTransformParent~, ~Undo.RecordObject~.`],
['Les emplacements',`~"GameObject/..."~ ajoute aussi la commande au clic droit dans la Hierarchy, ~"Assets/..."~ au clic droit dans le panneau Project, ~"CONTEXT/Rigidbody/..."~ au menu d'un composant précis. Pour des outils plus riches, voir [[editor-window]].`]],
ex:`Écris une commande « GameObject/Grouper la sélection » (raccourci Ctrl+G) qui crée un parent vide au centre des objets sélectionnés, y range ces objets, sélectionne le groupe et reste annulable. Elle est grisée si moins de deux objets sont sélectionnés.`,
hint:`Centre : moyenne des positions. Undo.RegisterCreatedObjectUndo pour le parent, Undo.SetTransformParent pour chaque enfant.`,
sol:`// Dans un dossier Editor/
public static class GroupSelection
{
    [MenuItem("GameObject/Grouper la sélection %g", false, 0)]
    private static void Group()
    {
        GameObject[] selected = Selection.gameObjects;
        Vector3 center = Vector3.zero;
        foreach (GameObject go in selected) center += go.transform.position;
        center /= selected.Length;

        var group = new GameObject("Groupe");
        Undo.RegisterCreatedObjectUndo(group, "Grouper");
        group.transform.position = center;
        group.transform.SetParent(selected[0].transform.parent, true);

        foreach (GameObject go in selected)
            Undo.SetTransformParent(go.transform, group.transform, "Grouper");

        Selection.activeGameObject = group;
    }

    [MenuItem("GameObject/Grouper la sélection %g", true)]
    private static bool CanGroup() => Selection.gameObjects.Length >= 2;
}`},

{id:'property-drawer',cat:'editor',lvl:2,title:'PropertyDrawer',sum:'Changer l\'affichage d\'un type ou d\'un attribut partout dans l\'inspecteur.',
body:[
['L\'idée',`Un [[custom-inspector]] change l'affichage d'**un composant entier**. Un ~PropertyDrawer~ change l'affichage d'**un type de champ** ou d'**un attribut**, partout où il apparaît. Écrit une fois, il sert dans tout le projet.`],
['Deux usages',`Pour un type ~[Serializable]~ : afficher une ~FloatRange~ (min, max) sur une seule ligne avec un curseur double. Pour un attribut : ~[ReadOnly]~, ~[Required]~ en rouge si vide (voir [[attributs-reflexion]]), ~[ShowIf("useGravity")]~.`],
['UI Toolkit',`On hérite de ~PropertyDrawer~ et on renvoie un ~VisualElement~ depuis ~CreatePropertyGUI(SerializedProperty property)~. ~PropertyField~ dessine un champ comme Unity le ferait. Pour un attribut, on crée la classe d'attribut en dehors du dossier Editor et le drawer dedans.`],
['Le piège',`Le drawer reçoit une ~SerializedProperty~, pas l'objet C# : on navigue avec ~FindPropertyRelative("min")~. Les modifications passent par la propriété pour bénéficier de l'Undo et du multi-édition. Voir [[serialisation]].`]],
ex:`Crée un attribut ~[ReadOnly]~ et son drawer UI Toolkit qui affiche le champ grisé et non modifiable, puis un type ~[Serializable] FloatRange~ (min, max) avec un drawer qui affiche les deux nombres sur une ligne avec le nom du champ.`,
hint:`ReadOnly : un PropertyField avec SetEnabled(false). FloatRange : une ligne flex-direction row avec deux FloatField liés via BindProperty.`,
sol:`// Runtime (hors dossier Editor)
public class ReadOnlyAttribute : PropertyAttribute { }

[Serializable]
public struct FloatRange
{
    public float min, max;
    public float Random() => UnityEngine.Random.Range(min, max);
}

// Editor/
[CustomPropertyDrawer(typeof(ReadOnlyAttribute))]
public class ReadOnlyDrawer : PropertyDrawer
{
    public override VisualElement CreatePropertyGUI(SerializedProperty property)
    {
        var field = new PropertyField(property);
        field.SetEnabled(false);
        return field;
    }
}

[CustomPropertyDrawer(typeof(FloatRange))]
public class FloatRangeDrawer : PropertyDrawer
{
    public override VisualElement CreatePropertyGUI(SerializedProperty property)
    {
        var row = new VisualElement { style = { flexDirection = FlexDirection.Row } };
        row.Add(new Label(property.displayName) { style = { width = 150 } });

        var min = new FloatField("min") { style = { flexGrow = 1 } };
        min.BindProperty(property.FindPropertyRelative("min"));
        var max = new FloatField("max") { style = { flexGrow = 1 } };
        max.BindProperty(property.FindPropertyRelative("max"));

        row.Add(min);
        row.Add(max);
        return row;
    }
}`},

{id:'handles-scene',cat:'editor',lvl:2,title:'Handles dans la vue Scene',sum:'Des poignées qu\'on attrape à la souris pour éditer des points directement dans la scène.',
body:[
['L\'idée',`Les [[gizmos]] dessinent ; les ~Handles~ dessinent **et se manipulent**. Une liste de points de patrouille devient beaucoup plus agréable à régler quand chaque point est une poignée qu'on déplace dans la scène, plutôt que trois nombres à taper dans l'inspecteur.`],
['Où les écrire',`Dans un [[custom-inspector]], la méthode ~OnSceneGUI()~ est appelée pour l'objet sélectionné. ~Handles.PositionHandle(p, rotation)~ affiche les flèches de déplacement et renvoie la nouvelle position ; ~Handles.FreeMoveHandle~, ~Handles.RadiusHandle~ et ~Handles.Label~ complètent la boîte à outils.`],
['Détecter le changement',`On entoure les poignées de ~EditorGUI.BeginChangeCheck()~ et ~EndChangeCheck()~. Si quelque chose a bougé, ~Undo.RecordObject(target, "...")~ puis on écrit la nouvelle valeur : Ctrl+Z fonctionne et l'objet est marqué modifié.`],
['Espace local',`Si les points sont stockés en local (ils suivent l'objet quand on le déplace), on les convertit avec ~transform.TransformPoint~ pour la poignée et ~InverseTransformPoint~ pour l'enregistrement. Voir [[espaces-coordonnees]].`]],
ex:`Pour un composant ~PatrolPath~ qui a ~List<Vector3> points~ en espace local, écris un éditeur qui affiche une poignée de déplacement par point, relie les points par une ligne, affiche leur numéro, et enregistre les déplacements avec Undo.`,
hint:`Dans OnSceneGUI : pour chaque point, conversion monde, PositionHandle, puis si changement, RecordObject et InverseTransformPoint.`,
sol:`public class PatrolPath : MonoBehaviour
{
    public List<Vector3> points = new List<Vector3>();
}

// Editor/
[CustomEditor(typeof(PatrolPath))]
public class PatrolPathEditor : Editor
{
    private void OnSceneGUI()
    {
        var path = (PatrolPath)target;
        Transform t = path.transform;

        for (int i = 0; i < path.points.Count; i++)
        {
            Vector3 world = t.TransformPoint(path.points[i]);

            EditorGUI.BeginChangeCheck();
            Vector3 moved = Handles.PositionHandle(world, Quaternion.identity);
            if (EditorGUI.EndChangeCheck())
            {
                Undo.RecordObject(path, "Déplacer un point");
                path.points[i] = t.InverseTransformPoint(moved);
            }

            Handles.Label(world + Vector3.up * 0.4f, (i + 1).ToString());

            if (i > 0)
                Handles.DrawLine(t.TransformPoint(path.points[i - 1]), world, 2f);
        }
    }
}`},

{id:'assembly-definitions',cat:'editor',lvl:2,title:'Assembly Definitions',sum:'Découper le code en modules pour compiler plus vite et séparer proprement éditeur et jeu.',
body:[
['L\'idée',`Par défaut, tous les scripts du projet sont compilés ensemble dans ~Assembly-CSharp~ : modifier une ligne recompile tout. Un fichier ~.asmdef~ dans un dossier crée un **assembly** séparé pour ce dossier. Seuls les assemblies touchés (et ceux qui en dépendent) sont recompilés.`],
['Les références',`Un assembly ne voit que ceux qu'il référence explicitement. ~Game.Core~ ne doit pas dépendre de ~Game.UI~ : l'outil rend visibles les dépendances et empêche les cycles. C'est une bonne discipline d'architecture, pas seulement un gain de temps.`],
['Éditeur et tests',`Un ~.asmdef~ réglé sur la plateforme « Editor » seulement contient le code d'outils : il n'entre jamais dans le build, ce qui remplace la règle des dossiers « Editor » (voir [[custom-inspector]]). Les [[tests-unitaires]] ont aussi leur propre assembly.`],
['Pièges',`Un script hors de tout ~.asmdef~ ne peut pas être vu d'un assembly. Ajouter des asmdef dans un vieux projet demande de démêler les dépendances. ~[assembly: InternalsVisibleTo("Game.Tests")]~ donne aux tests l'accès aux membres ~internal~.`]],
ex:`Écris un outil d'éditeur ~AsmdefReport~ (menu « Tools/Rapport des assemblies ») qui liste tous les assemblies du projet avec leur nombre de fichiers source et leurs références, en utilisant ~CompilationPipeline.GetAssemblies()~.`,
hint:`CompilationPipeline est dans UnityEditor.Compilation. Chaque Assembly a name, sourceFiles et assemblyReferences.`,
sol:`// Editor/
public static class AsmdefReport
{
    [MenuItem("Tools/Rapport des assemblies")]
    private static void Report()
    {
        var sb = new StringBuilder();
        var assemblies = CompilationPipeline.GetAssemblies(AssembliesType.Editor)
            .OrderByDescending(a => a.sourceFiles.Length);

        foreach (UnityEditor.Compilation.Assembly a in assemblies)
        {
            string refs = string.Join(", ", a.assemblyReferences.Select(r => r.name));
            sb.AppendLine($"{a.name} : {a.sourceFiles.Length} fichiers");
            sb.AppendLine($"    dépend de : {(refs.Length > 0 ? refs : "rien")}");
        }

        Debug.Log(sb.ToString());
    }
}`},

{id:'tests-unitaires',cat:'editor',lvl:2,title:'Tests automatisés',sum:'Vérifier son code avec le Unity Test Framework, en mode éditeur et en mode jeu.',
body:[
['L\'idée',`Un test est une petite méthode qui appelle ton code et **vérifie** le résultat : ~Assert.AreEqual(20, wallet.Amount)~. Une fois écrit, il tourne à chaque modification, en quelques secondes, et signale tout de suite si une correction en a cassé une autre. Le Unity Test Framework repose sur NUnit.`],
['Edit Mode et Play Mode',`Les tests **Edit Mode** testent du C# pur et des outils d'éditeur, très vite. Les tests **Play Mode** lancent le moteur : on peut instancier des objets, attendre des images avec ~[UnityTest]~ et ~yield return null~, et tester la physique.`,`[Test]
public void Spend_RefusesWhenTooPoor()
{
    int gold = 10;
    Assert.IsFalse(Economy.TrySpend(ref gold, 30));
    Assert.AreEqual(10, gold);
}`],
['Rendre le code testable',`Le code facile à tester est du C# ordinaire sans dépendance cachée : une logique séparée de l'affichage (voir [[separation-donnees-vue]]), des services passés en paramètre plutôt que des [[singleton|singletons]], un temps passé en argument plutôt que ~Time.deltaTime~ lu à l'intérieur.`],
['Dans la CI',`Unity lance les tests en ligne de commande avec ~-runTests -testPlatform EditMode -testResults results.xml~. Le pipeline lit le fichier de résultats et bloque la fusion si un test échoue. Voir [[build-ligne-commande]].`]],
ex:`Écris une classe de tests Edit Mode pour la classe ~Timer~ de la leçon [[classes-objets]] : le minuteur ne se termine pas avant sa durée, se termine une seule fois, a une progression correcte à mi-parcours, et ~Reset~ le remet à zéro. Ajoute un test qui vérifie qu'une durée nulle lève une exception.`,
hint:`Un test par comportement, avec un nom qui le décrit. Assert.Throws<ArgumentOutOfRangeException>(() => new Timer(0f)).`,
sol:`public class TimerTests
{
    [Test]
    public void DoesNotFinishBeforeDuration()
    {
        var t = new Timer(1f);
        Assert.IsFalse(t.Tick(0.5f));
        Assert.IsFalse(t.Tick(0.4f));
    }

    [Test]
    public void FinishesExactlyOnce()
    {
        var t = new Timer(1f);
        Assert.IsTrue(t.Tick(1.2f));
        Assert.IsFalse(t.Tick(1f));
    }

    [Test]
    public void ProgressIsHalfAtMidpoint()
    {
        var t = new Timer(2f);
        t.Tick(1f);
        Assert.AreEqual(0.5f, t.Progress, 1e-5f);
    }

    [Test]
    public void ResetStartsOver()
    {
        var t = new Timer(1f);
        t.Tick(2f);
        t.Reset();
        Assert.AreEqual(0f, t.Progress);
        Assert.IsTrue(t.Tick(1f));
    }

    [Test]
    public void ZeroDurationThrows()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new Timer(0f));
    }
}`},

{id:'batch-assets',cat:'editor',lvl:2,title:'Modifier des assets en masse',sum:'Traiter des centaines d\'assets d\'un coup, vite, avec une barre de progression et sans tout réimporter à chaque fois.',
body:[
['L\'idée',`Renommer 300 textures, changer un réglage sur tous les prefabs, ajouter un composant à tous les ennemis : à la main, c'est une journée et des erreurs ; en script, quelques secondes. ~AssetDatabase~ et ~PrefabUtility~ donnent accès à tout le projet.`],
['Grouper les opérations',`Chaque modification d'asset peut déclencher un réimport. Entourer le traitement de ~AssetDatabase.StartAssetEditing()~ et ~StopAssetEditing()~ (dans un ~finally~ !) regroupe tout en un seul passage. ~AssetDatabase.SaveAssets()~ à la fin écrit les fichiers.`],
['Modifier un prefab',`~PrefabUtility.LoadPrefabContents(path)~ ouvre un prefab dans une scène cachée, on le modifie comme un GameObject normal, puis ~SaveAsPrefabAsset~ et ~UnloadPrefabContents~. Pour un ScriptableObject, on modifie l'objet puis ~EditorUtility.SetDirty~.`],
['Informer et pouvoir annuler',`~EditorUtility.DisplayCancelableProgressBar~ montre l'avancement et permet d'arrêter. Afficher un résumé à la fin (combien de fichiers modifiés, lesquels ignorés). Et toujours travailler sur un projet versionné : un script de masse peut aussi faire des dégâts en masse.`]],
ex:`Écris une commande « Tools/Ajouter Health aux ennemis » qui parcourt tous les prefabs du dossier ~Assets/Prefabs/Enemies~, ajoute un composant ~Health~ à ceux qui n'en ont pas, avec une barre de progression annulable, et affiche le nombre de prefabs modifiés.`,
hint:`FindAssets("t:Prefab", new[] { dossier }). LoadPrefabContents / SaveAsPrefabAsset / UnloadPrefabContents dans un try/finally.`,
sol:`// Editor/
public static class AddHealthToEnemies
{
    [MenuItem("Tools/Ajouter Health aux ennemis")]
    private static void Run()
    {
        string[] guids = AssetDatabase.FindAssets("t:Prefab", new[] { "Assets/Prefabs/Enemies" });
        int changed = 0;

        try
        {
            for (int i = 0; i < guids.Length; i++)
            {
                string path = AssetDatabase.GUIDToAssetPath(guids[i]);
                if (EditorUtility.DisplayCancelableProgressBar("Ennemis", path, (float)i / guids.Length))
                    break;

                GameObject root = PrefabUtility.LoadPrefabContents(path);
                try
                {
                    if (root.GetComponent<Health>() != null) continue;
                    root.AddComponent<Health>();
                    PrefabUtility.SaveAsPrefabAsset(root, path);
                    changed++;
                }
                finally
                {
                    PrefabUtility.UnloadPrefabContents(root);
                }
            }
        }
        finally
        {
            EditorUtility.ClearProgressBar();
        }

        Debug.Log($"{changed} prefab(s) modifié(s) sur {guids.Length}.");
    }
}`},

{id:'build-hooks',cat:'editor',lvl:3,title:'Crochets de build',sum:'Exécuter du code automatiquement avant et après chaque build : vérifications, numéros de version, nettoyage.',
body:[
['L\'idée',`Une classe qui implémente ~IPreprocessBuildWithReport~ est appelée par Unity **avant chaque build**, qu'il soit lancé depuis le menu ou en ligne de commande. ~IPostprocessBuildWithReport~ est appelée après. On y place ce qui ne doit jamais être oublié.`],
['Usages',`Bloquer un build si une [[validation-assets|validation]] échoue, écrire le numéro de version et le commit dans un fichier lu par le jeu, retirer des scènes de test, copier des fichiers à côté de l'exécutable, envoyer un résumé à l'équipe.`],
['Faire échouer le build',`Lever une ~BuildFailedException~ dans le prétraitement arrête le build avec un message clair. C'est bien plus sûr qu'un avertissement dans la Console que personne ne lit.`],
['L\'ordre',`~callbackOrder~ décide de l'ordre quand plusieurs crochets existent : le plus petit passe en premier. ~report.summary~ donne la plateforme, le chemin de sortie, et après le build, le résultat et la taille. Voir [[build-ligne-commande]].`]],
ex:`Écris un crochet de prétraitement qui fait échouer le build si une scène activée dans les Build Settings contient « Test » dans son nom, puis écrit un fichier ~Resources/build_info.txt~ avec la date et la version. Écris aussi le crochet de post-traitement qui affiche la taille du build en Mo.`,
hint:`EditorBuildSettings.scenes pour les scènes. File.WriteAllText puis AssetDatabase.Refresh. Taille : report.summary.totalSize.`,
sol:`// Editor/
public class BuildChecks : IPreprocessBuildWithReport, IPostprocessBuildWithReport
{
    public int callbackOrder => 0;

    public void OnPreprocessBuild(BuildReport report)
    {
        foreach (EditorBuildSettingsScene scene in EditorBuildSettings.scenes)
        {
            if (scene.enabled && Path.GetFileNameWithoutExtension(scene.path).Contains("Test"))
                throw new BuildFailedException($"Scène de test dans le build : {scene.path}");
        }

        Directory.CreateDirectory("Assets/Resources");
        string info = $"version={PlayerSettings.bundleVersion}\ndate={DateTime.UtcNow:yyyy-MM-dd HH:mm}";
        File.WriteAllText("Assets/Resources/build_info.txt", info);
        AssetDatabase.Refresh();
    }

    public void OnPostprocessBuild(BuildReport report)
    {
        ulong mb = report.summary.totalSize / (1024 * 1024);
        Debug.Log($"Build {report.summary.platform} : {mb} Mo, {report.summary.result}");
    }
}`}
]);

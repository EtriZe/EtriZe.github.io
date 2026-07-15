(function () {
  // Applique le titre personnalisé
  document.getElementById("siteTitle").textContent = SITE.title;
  document.getElementById("eyebrow").textContent = SITE.tagline;
  document.getElementById("footTitle").textContent = SITE.title;
  document.title = SITE.title;

  const grid = document.getElementById("grid");
  const state = document.getElementById("state");
  const searchInput = document.getElementById("search");
  const visibleCount = document.getElementById("visibleCount");
  const siteCount = document.getElementById("siteCount");

  const FEATHER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/></svg>';

  let birds = [];

  function notice(title, html) {
    grid.innerHTML = "";
    state.innerHTML =
      '<div class="notice"><h2>' + title + "</h2><div>" + html + "</div></div>";
  }

  function render(list) {
    state.innerHTML = "";
    grid.innerHTML = "";
    if (!list.length) {
      visibleCount.textContent = "";
      state.innerHTML =
        '<div class="notice"><h2>Aucun résultat</h2><div>Aucun oiseau ne correspond à cette recherche.</div></div>';
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach((bird, i) => {
      const globalIndex = birds.indexOf(bird) + 1; // numéro fixe = rang alphabétique
      const img = firstImage(bird);
      const a = document.createElement("a");
      a.className = "card";
      a.href = "bird.html?slug=" + encodeURIComponent(bird.slug);
      a.style.animationDelay = Math.min(i * 30, 400) + "ms";
      a.innerHTML =
        '<div class="card__thumb ' + (img ? "" : "card__thumb--empty") + '">' +
        '<span class="card__num">N° ' + padNum(globalIndex) + "</span>" +
        (img
          ? '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(bird.name) + '" loading="lazy">'
          : FEATHER) +
        "</div>" +
        '<div class="card__body">' +
        '<h2 class="card__name">' + escapeHtml(bird.name) + "</h2>" +
        '<span class="card__hint">Voir la fiche →</span>' +
        "</div>";
      frag.appendChild(a);
    });
    grid.appendChild(frag);
    visibleCount.textContent = list.length + (list.length > 1 ? " fiches" : " fiche");
  }

  function applySearch() {
    const q = slugify(searchInput.value);
    if (!q) return render(birds);
    const filtered = birds.filter((b) => slugify(b.name).includes(q));
    render(filtered);
  }

  async function load() {
    if (!configOk()) {
      siteCount.textContent = "";
      notice(
        "Configuration requise",
        "Ouvre le fichier <code>assets/config.js</code> et renseigne l'URL de ton projet Supabase ainsi que la clé <code>anon</code>. Les instructions complètes sont dans le <code>README.md</code>."
      );
      return;
    }

    const client = getClient();
    const { data, error } = await client
      .from("birds")
      .select("id, name, slug, media");

    if (error) {
      siteCount.textContent = "";
      notice(
        "Impossible de charger la collection",
        "Vérifie ta configuration Supabase et que la table <code>birds</code> existe. Détail : " +
          escapeHtml(error.message)
      );
      return;
    }

    birds = sortByNameFr(data || []);
    siteCount.textContent =
      birds.length + (birds.length > 1 ? " espèces répertoriées" : " espèce répertoriée");

    if (!birds.length) {
      notice(
        "Collection vide",
        'Aucun oiseau pour l\'instant. Rends-toi dans l\'<a href="admin.html">espace de gestion</a> pour ajouter ta première fiche.'
      );
      return;
    }
    render(birds);
  }

  searchInput.addEventListener("input", applySearch);
  load();
})();

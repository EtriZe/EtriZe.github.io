(function () {
  document.getElementById("siteTitle").textContent = SITE.title;
  document.getElementById("eyebrow").textContent = SITE.tagline;
  document.getElementById("footTitle").textContent = SITE.title;

  const content = document.getElementById("content");
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");

  function notice(title, html) {
    content.innerHTML =
      '<div class="notice"><h2>' + title + "</h2><div>" + html + "</div></div>";
  }

  function renderMedia(media) {
    if (!media || !media.length) return "";
    const items = media
      .map((m) => {
        if (!m || !m.url) return "";
        if (m.type === "instagram") {
          return (
            '<div class="media media--ig">' +
            '<iframe src="' + escapeHtml(instagramEmbedUrl(m.url)) +
            '" loading="lazy" allowtransparency="true" scrolling="no" allow="encrypted-media"></iframe>' +
            "</div>"
          );
        }
        return (
          '<div class="media"><img src="' + escapeHtml(m.url) +
          '" alt="" loading="lazy"></div>'
        );
      })
      .join("");
    return '<div class="gallery">' + items + "</div>";
  }

  function field(label, value) {
    const body = textToParagraphs(value);
    if (!body) return "";
    return (
      '<section class="field">' +
      '<h3 class="field__label">' + label + "</h3>" +
      '<div class="field__body">' + body + "</div>" +
      "</section>"
    );
  }

  async function computeNumber(client, bird) {
    // Numéro = rang alphabétique dans toute la collection
    const { data } = await client.from("birds").select("name, slug");
    if (!data) return null;
    const sorted = sortByNameFr(data);
    const idx = sorted.findIndex((b) => b.slug === bird.slug);
    return idx >= 0 ? idx + 1 : null;
  }

  async function load() {
    if (!configOk()) {
      notice(
        "Configuration requise",
        "Renseigne d'abord Supabase dans <code>assets/config.js</code>."
      );
      return;
    }
    if (!slug) {
      notice("Fiche introuvable", 'Aucun oiseau demandé. <a href="index.html">Retour à la collection</a>.');
      return;
    }

    const client = getClient();
    const { data, error } = await client
      .from("birds")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      notice("Erreur de chargement", escapeHtml(error.message));
      return;
    }
    if (!data) {
      notice("Fiche introuvable", 'Cet oiseau n\'existe pas (ou plus). <a href="index.html">Retour à la collection</a>.');
      return;
    }

    document.title = data.name + " — " + SITE.title;
    const num = await computeNumber(client, data);
    const numLabel = num ? "N° " + padNum(num) : "";

    content.innerHTML =
      renderMedia(data.media) +
      '<div class="specimen__head">' +
      (numLabel ? '<span class="specimen__num">' + numLabel + "</span>" : "") +
      '<h2 class="specimen__name">' + escapeHtml(data.name) + "</h2>" +
      "</div>" +
      (textToParagraphs(data.description)
        ? '<div class="lede">' + textToParagraphs(data.description) + "</div>"
        : "") +
      '<div class="fields">' +
      field("Alimentation", data.diet) +
      field("Comportement", data.behavior) +
      "</div>";
  }

  load();
})();

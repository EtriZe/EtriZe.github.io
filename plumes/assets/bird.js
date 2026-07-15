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
    const items = (media || []).filter((m) => m && m.url);
    if (!items.length) return "";

    const slides = items
      .map((m) => {
        if (m.type === "instagram") {
          return (
            '<div class="slide slide--ig">' +
            '<iframe src="' + escapeHtml(instagramEmbedUrl(m.url)) +
            '" loading="lazy" allowtransparency="true" allow="encrypted-media"></iframe>' +
            "</div>"
          );
        }
        return '<div class="slide"><img src="' + escapeHtml(m.url) + '" alt="" loading="lazy"></div>';
      })
      .join("");

    const single = items.length === 1;
    const nav = single
      ? ""
      : '<button class="carousel__nav carousel__nav--prev" type="button" aria-label="Média précédent">\u2039</button>' +
        '<button class="carousel__nav carousel__nav--next" type="button" aria-label="Média suivant">\u203A</button>';
    const dots = single
      ? ""
      : '<div class="carousel__dots">' +
        items
          .map((_, i) => '<button class="dot' + (i === 0 ? " is-active" : "") + '" type="button" data-i="' + i + '" aria-label="Aller au média ' + (i + 1) + '"></button>')
          .join("") +
        "</div>";

    return (
      '<div class="carousel"' + (single ? ' data-single="1"' : "") + ">" +
      '<div class="carousel__viewport">' +
      '<div class="carousel__track">' + slides + "</div>" +
      nav +
      "</div>" +
      dots +
      "</div>"
    );
  }

  function setupCarousel(car) {
    const viewport = car.querySelector(".carousel__viewport");
    const track = car.querySelector(".carousel__track");
    const slides = Array.prototype.slice.call(car.querySelectorAll(".slide"));
    const dots = Array.prototype.slice.call(car.querySelectorAll(".dot"));
    let index = 0;

    function setHeight() {
      const active = slides[index];
      if (!active) return;
      const h = active.offsetHeight;
      if (h) viewport.style.height = h + "px";
    }
    function go(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      dots.forEach((d, k) => d.classList.toggle("is-active", k === index));
      setHeight();
    }

    // Les images arrivent de façon asynchrone : on recadre à leur chargement
    slides.forEach((s) => {
      const img = s.querySelector("img");
      if (img) img.addEventListener("load", () => { if (slides[index] === s) setHeight(); });
    });
    // Toute variation de taille d'un média (iframe Insta qui se déploie…) recadre
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => setHeight());
      slides.forEach((s) => ro.observe(s));
    }

    const prev = car.querySelector(".carousel__nav--prev");
    const next = car.querySelector(".carousel__nav--next");
    if (prev) prev.addEventListener("click", () => go(index - 1));
    if (next) next.addEventListener("click", () => go(index + 1));
    dots.forEach((d) => d.addEventListener("click", () => go(parseInt(d.dataset.i, 10))));

    // Navigation clavier
    car.tabIndex = 0;
    car.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    });

    // Swipe tactile
    let x0 = null;
    viewport.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
      x0 = null;
    });

    window.addEventListener("resize", setHeight);
    requestAnimationFrame(setHeight);
    setTimeout(setHeight, 1000); // filet de sécurité pour l'iframe Instagram
  }

  function initCarousels(root) {
    root.querySelectorAll(".carousel").forEach(setupCarousel);
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

    initCarousels(content);
  }

  load();
})();

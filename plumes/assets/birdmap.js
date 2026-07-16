/* =========================================================================
   birdmap.js — Carte de répartition (données GBIF)
   -------------------------------------------------------------------------
   Ajoute une carte du monde en bas de chaque fiche oiseau, sous les
   sections description / alimentation / comportement.

   INSTALLATION
   1. Dépose ce fichier dans le dossier  assets/
   2. Dans bird.html, ajoute cette ligne À LA FIN, juste après bird.js :
        <script src="assets/birdmap.js"></script>
   3. Dans Supabase (SQL Editor), ajoute la colonne du nom latin :
        alter table birds add column if not exists nom_scientifique text;
   4. Renseigne le nom scientifique de chaque oiseau (ex. "Erithacus rubecula")
      via l'admin ou directement dans le Table Editor de Supabase.

   Aucune autre modification n'est nécessaire. Si un oiseau n'a pas de nom
   scientifique, aucune carte n'est affichée (pas de bloc cassé).
   ========================================================================= */
(function () {
  "use strict";

  // --- Style de la couche GBIF -------------------------------------------
  // "poly"  = hexagones remplis, effet "zones" facon oiseaux.fr (par défaut)
  // Pour des points facon Merlin, remplace la ligne GBIF_STYLE par :
  //   const GBIF_STYLE = "&style=scaled.circles";
  const GBIF_STYLE = "&bin=hex&hexPerTile=32&style=classic.poly";

  const PALETTE = { line: "#26362c", muted: "#8ca394", accent: "#6fbf73", mapbg: "#0b120e" };

  // Charge une feuille de style / un script externe et attend qu'il soit prêt
  function loadCss(href) {
    return new Promise((res) => {
      if (document.querySelector('link[href="' + href + '"]')) return res();
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = href; l.onload = res; l.onerror = res;
      document.head.appendChild(l);
    });
  }
  function loadJs(src) {
    return new Promise((res, rej) => {
      if (window.L) return res();
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // Injecte le peu de CSS nécessaire (pas besoin de toucher style.css)
  function injectStyles() {
    if (document.getElementById("birdmap-css")) return;
    const css = `
      .bird-range__map{height:380px;border-radius:12px;border:1px solid ${PALETTE.line};
        background:${PALETTE.mapbg};margin-top:6px}
      .bird-range__legend{display:flex;align-items:center;gap:8px;margin-top:10px;
        font-family:"Space Mono",ui-monospace,monospace;font-size:12px;color:${PALETTE.muted}}
      .bird-range__legend .d{width:11px;height:11px;border-radius:50%;background:${PALETTE.accent};opacity:.5}
      .bird-range__legend .d.hi{opacity:1}
      .bird-range__credit{font-family:"Space Mono",ui-monospace,monospace;font-size:11px;
        color:${PALETTE.muted};margin-top:8px}
      .bird-range__credit a{color:${PALETTE.muted}}
      .leaflet-container{background:${PALETTE.mapbg}}
    `;
    const tag = document.createElement("style");
    tag.id = "birdmap-css"; tag.textContent = css;
    document.head.appendChild(tag);
  }

  // Va chercher le nom scientifique de l'oiseau courant dans Supabase
  async function fetchScientificName() {
    if (typeof configOk !== "function" || !configOk()) return null;
    const slug = new URLSearchParams(location.search).get("slug");
    if (!slug) return null;
    try {
      const { data, error } = await getClient()
        .from("birds")
        .select("nom_scientifique")
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return null;
      const n = (data.nom_scientifique || "").trim();
      return n || null;
    } catch (e) { return null; }
  }

  // Nom latin -> identifiant GBIF (taxonKey)
  async function matchTaxonKey(name) {
    try {
      const r = await fetch("https://api.gbif.org/v1/species/match?name=" + encodeURIComponent(name));
      const m = await r.json();
      return m && m.usageKey ? m.usageKey : null;
    } catch (e) { return null; }
  }

  // Construit le bloc "Répartition" (mêmes classes que les autres sections)
  function buildSection() {
    const main = document.querySelector("main.specimen") || document.querySelector("main");
    const content = document.getElementById("content");
    if (!main) return null;

    const section = document.createElement("section");
    section.className = "field bird-range";
    section.innerHTML =
      '<h3 class="field__label">Répartition</h3>' +
      '<div class="field__body">' +
        '<div class="bird-range__map" id="bird-range-map"></div>' +
        '<div class="bird-range__legend"><span class="d"></span><span class="d hi"></span>' +
          " observations rares → fréquentes</div>" +
        '<p class="bird-range__credit">Données : ' +
          '<a href="https://www.gbif.org" target="_blank" rel="noopener">GBIF.org</a></p>' +
      "</div>";

    // On place le bloc juste après le contenu de la fiche
    if (content && content.parentNode === main) {
      content.insertAdjacentElement("afterend", section);
    } else {
      main.appendChild(section);
    }
    return section;
  }

  function initMap(taxonKey) {
    const map = L.map("bird-range-map", { worldCopyJump: true, scrollWheelZoom: false })
      .setView([25, 10], 1);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap, © CARTO", subdomains: "abcd", maxZoom: 12
    }).addTo(map);

    const url = "https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png"
      + "?srs=EPSG:3857" + GBIF_STYLE + "&taxonKey=" + taxonKey;
    L.tileLayer(url, { opacity: 0.9, maxZoom: 12 }).addTo(map);

    // Recalcule la taille une fois le conteneur bien peint
    setTimeout(() => map.invalidateSize(), 200);
  }

  async function run() {
    const name = await fetchScientificName();
    if (!name) return;                 // pas de nom latin -> pas de carte
    const taxonKey = await matchTaxonKey(name);
    if (!taxonKey) return;             // espèce absente de GBIF -> pas de carte

    injectStyles();
    await loadCss("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css");
    await loadJs("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js");

    if (!buildSection()) return;
    initMap(taxonKey);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
/* =========================================================================
   birdmap.js — Carte de répartition (données GBIF)
   -------------------------------------------------------------------------
   Ajoute une carte du monde en bas de chaque fiche oiseau, sous les
   sections description / alimentation / comportement — dans le MÊME groupe
   de fields (bien alignée, pas en dehors).

   INSTALLATION
   1. Dépose ce fichier dans le dossier  assets/  (remplace l'ancien)
   2. Dans bird.html, à la fin, juste après bird.js :
        <script src="assets/birdmap.js"></script>
   3. Dans Supabase (SQL Editor) :
        alter table birds add column if not exists nom_scientifique text;
   4. Renseigne le nom scientifique de chaque oiseau (ex. "Erithacus rubecula").

   Si un oiseau n'a pas de nom scientifique, aucune carte n'est affichée.
   ========================================================================= */
(function () {
  "use strict";

  // "poly" = hexagones remplis, effet "zones" (par défaut).
  // Pour des points facon Merlin :  const GBIF_STYLE = "&style=scaled.circles";
  const GBIF_STYLE = "&bin=hex&hexPerTile=32&style=classic.poly";

  const PALETTE = { line: "#26362c", muted: "#8ca394", accent: "#6fbf73", mapbg: "#0b120e" };

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
      return (data.nom_scientifique || "").trim() || null;
    } catch (e) { return null; }
  }

  async function matchTaxonKey(name) {
    try {
      const r = await fetch("https://api.gbif.org/v1/species/match?name=" + encodeURIComponent(name));
      const m = await r.json();
      return m && m.usageKey ? m.usageKey : null;
    } catch (e) { return null; }
  }

  // Attend que bird.js ait fini de rendre les fields dans #content
  function waitForFields(timeout) {
    return new Promise((resolve) => {
      const content = document.getElementById("content");
      if (!content) return resolve(null);
      if (content.querySelector(".field")) return resolve(content);
      const obs = new MutationObserver(() => {
        if (content.querySelector(".field")) { obs.disconnect(); resolve(content); }
      });
      obs.observe(content, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); resolve(content); }, timeout || 4000);
    });
  }

  // Construit le bloc "Répartition" et le place APRÈS le dernier field,
  // à l'intérieur du même groupe (pas en dehors de #content).
  function buildSection(content) {
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

    const fields = content.querySelectorAll(".field");
    const last = fields[fields.length - 1];
    if (last) {
      last.insertAdjacentElement("afterend", section);   // juste après comportement
    } else {
      content.appendChild(section);                      // repli : dans #content
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

    setTimeout(() => map.invalidateSize(), 200);
  }

  async function run() {
    const name = await fetchScientificName();
    if (!name) return;
    const taxonKey = await matchTaxonKey(name);
    if (!taxonKey) return;

    injectStyles();
    await loadCss("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css");
    await loadJs("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js");

    const content = await waitForFields();
    if (!content) return;
    buildSection(content);
    initMap(taxonKey);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
/* =========================================================================
   CONFIGURATION — À REMPLIR
   =========================================================================
   1. Crée un projet sur https://supabase.com
   2. Dans le tableau de bord : Project Settings > API
   3. Copie l'URL du projet et la clé "anon public" ci-dessous.
   La clé "anon" peut être publique sans danger : c'est le contrôle d'accès
   (RLS) côté Supabase qui empêche les visiteurs de modifier quoi que ce soit.
   ========================================================================= */

const SUPABASE_URL = "https://fcivbftlbizpoopgmdry.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjaXZiZnRsYml6cG9vcGdtZHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMDc1NjMsImV4cCI6MjA5OTY4MzU2M30.pRePYR_-WuzEjMz7dsuJaq-vFZ5LTCPYZOAs0XI50eA";

/* Personnalise le titre du site ici */
const SITE = {
  title: "Le Cabinet des Plumes",
  tagline: "Répertoire ornithologique personnel",
};

/* ========================================================================= */
/* À partir d'ici, rien à modifier.                                          */
/* ========================================================================= */

let _client = null;
function getClient() {
  if (!window.supabase) return null;
  if (!_client) {
    _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

function configOk() {
  return (
    SUPABASE_URL &&
    !SUPABASE_URL.includes("VOTRE-PROJET") &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_ANON_KEY.includes("VOTRE_CLE")
  );
}

/* Transforme un nom en identifiant d'URL (gère les accents) */
function slugify(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* Numéro de spécimen : 1 -> "042" */
function padNum(n) {
  return String(n).padStart(3, "0");
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* Convertit du texte brut en paragraphes HTML (respecte les sauts de ligne) */
function textToParagraphs(text) {
  if (!text || !text.trim()) return "";
  return text
    .trim()
    .split(/\n{2,}/)
    .map((block) => "<p>" + escapeHtml(block).replace(/\n/g, "<br>") + "</p>")
    .join("");
}

/* Transforme une URL de post Instagram en URL d'intégration (iframe) */
function instagramEmbedUrl(url) {
  try {
    const u = new URL(url.trim());
    let path = u.pathname.replace(/\/+$/, "");
    if (!/\/embed$/.test(path)) path += "/embed";
    return "https://www.instagram.com" + path + "/captioned";
  } catch (e) {
    return url;
  }
}

/* Tri alphabétique correct pour le français (é, è, à…) */
function sortByNameFr(list) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
}

/* Première image d'un oiseau, pour la vignette de la liste */
function firstImage(bird) {
  const media = bird.media || [];
  const img = media.find((m) => m.type === "image" && m.url);
  return img ? img.url : null;
}

// ── LANGUAGE SYSTEM ──
// Détecte la langue du navigateur au premier visit, puis mémorise le choix.
// Exposé globalement (pas de defer) pour que les boutons inline puissent appeler setLang().

(function () {

  function getInitialLang() {
    var saved = localStorage.getItem('vb_lang');
    if (saved === 'fr' || saved === 'en') return saved;
    var browserLang = (navigator.language || navigator.userLanguage || 'fr').toLowerCase();
    return browserLang.startsWith('fr') ? 'fr' : 'en';
  }

  // Applique la langue à un nœud DOM (page principale ou contenu injecté dans la modale)
  function applyLangToNode(root, lang) {
    // Blocs .lang-fr / .lang-en
    root.querySelectorAll('.lang-fr').forEach(function (el) {
      el.style.display = lang === 'fr' ? '' : 'none';
    });
    root.querySelectorAll('.lang-en').forEach(function (el) {
      el.style.display = lang === 'en' ? '' : 'none';
    });

    // Éléments avec data-fr / data-en (textes courts)
    root.querySelectorAll('[data-fr][data-en]').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + lang);
    });
  }

  window.setLang = function (lang) {
    if (lang !== 'fr' && lang !== 'en') return;
    localStorage.setItem('vb_lang', lang);
    document.documentElement.lang = lang;

    // Applique sur toute la page
    applyLangToNode(document, lang);

    // Applique aussi sur le contenu de la modale projet si elle est ouverte
    var modalContent = document.querySelector('project-page content');
    if (modalContent) applyLangToNode(modalContent, lang);

    // Boutons actifs
    var btnFr = document.getElementById('btn-fr');
    var btnEn = document.getElementById('btn-en');
    if (btnFr) btnFr.classList.toggle('active', lang === 'fr');
    if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  };

  // Appelée par script.js après avoir injecté le HTML d'un projet dans la modale
  window.applyCurrentLangToModal = function () {
    var lang = localStorage.getItem('vb_lang') || getInitialLang();
    var modalContent = document.querySelector('project-page content');
    if (modalContent) applyLangToNode(modalContent, lang);
  };

  // Init au chargement
  document.addEventListener('DOMContentLoaded', function () {
    setLang(getInitialLang());
  });

})();
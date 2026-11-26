/* Application installable : service worker, bouton « Installer », aide pour iPhone */
(function () {
  // 1. Service worker (seulement en HTTPS ou en local, jamais en ouvrant le fichier directement)
  const secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && secure) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // 2. Couleur de la barre du téléphone accordée au mode clair / sombre
  const theme = document.querySelector('meta[name="theme-color"]');
  function syncTheme() {
    if (theme) theme.setAttribute('content', document.documentElement.dataset.mode === 'dark' ? '#121a30' : '#ffffff');
  }
  syncTheme();
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

  if (standalone) return; // déjà installée : pas de bouton ni d'aide

  // 3. Android, Chrome, Edge : bouton « Installer » quand le navigateur le permet
  const btn = document.getElementById('install');
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e;
    if (btn) btn.hidden = false;
  });
  if (btn) {
    btn.addEventListener('click', async () => {
      if (!deferred) return;
      deferred.prompt();
      await deferred.userChoice.catch(() => null);
      deferred = null;
      btn.hidden = true;
    });
  }
  window.addEventListener('appinstalled', () => {
    if (btn) btn.hidden = true;
  });

  // 4. iPhone et iPad (Safari) : pas d'installation automatique, on explique comment faire
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let dismissed = false;
  try { dismissed = localStorage.getItem('cs-ios-hint') === '1'; } catch (e) {}
  if (ios && !dismissed) {
    const box = document.createElement('div');
    box.className = 'ioshint';
    box.setAttribute('role', 'note');
    box.innerHTML =
      '<p><b>Installer l’appli :</b> touche <span class="share" aria-label="Partager">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>' +
      '</span> Partager, puis «&nbsp;Sur l’écran d’accueil&nbsp;».</p>' +
      '<button type="button" aria-label="Fermer">×</button>';
    box.querySelector('button').addEventListener('click', () => {
      box.remove();
      try { localStorage.setItem('cs-ios-hint', '1'); } catch (e) {}
    });
    document.body.appendChild(box);
  }
})();

/* Service worker du site : rend le site installable et utilisable hors ligne.
   Stratégie : le réseau d'abord (les mises à jour apparaissent tout de suite),
   le cache en secours quand il n'y a pas de connexion.
   Après avoir ajouté ou renommé un fichier, ajoute-le à FILES et change VERSION. */
const VERSION = 'v3';
const CACHE = 'cours-csharp-' + VERSION;
const FONTS = 'cours-csharp-fonts';
const FILES = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "pwa.js",
  "favicon.svg",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "lessons/00-base.js",
  "lessons/01-csharp.js",
  "lessons/02-poo.js",
  "lessons/03-algo.js",
  "lessons/04-maths.js",
  "lessons/05-unity.js",
  "lessons/06-editor.js",
  "lessons/07-perf.js",
  "lessons/08-design.js",
  "lessons/09-exos-1.js",
  "lessons/09-exos-2.js",
  "lessons/09-exos-3.js",
  "lessons/09-exos-4.js",
  "lessons/c-csharp-1.js",
  "lessons/c-csharp-2.js",
  "lessons/c-csharp-3.js",
  "lessons/c-design-1.js",
  "lessons/c-design-2.js",
  "lessons/x-algo.js",
  "lessons/x-csharp.js",
  "lessons/x-editor.js",
  "lessons/x-maths.js",
  "lessons/x-perf.js",
  "lessons/x-poo.js",
  "lessons/x-unity.js"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Polices Google : servies depuis le cache, rafraîchies en arrière-plan
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONTS).then(cache =>
        cache.match(req).then(hit => {
          const net = fetch(req).then(res => {
            if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
            return res;
          }).catch(() => hit);
          return hit || net;
        })
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Fichiers du site : réseau d'abord, cache en secours
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then(hit =>
          hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())
        )
      )
  );
});

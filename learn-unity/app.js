{
/* ---------- catégories et ordre des leçons ---------- */
const CATS = [
  {id:'csharp', name:'Bases du C#', color:'#4f46e5', d:'Le langage lui-même, vu avec les yeux de quelqu’un qui code dans Unity.',
   order:['variables-types','conditions-boucles','methodes-parametres','chaines-texte','enums-switch','collections','proprietes','static-instance','struct-vs-class','null-securite','exceptions','delegues-evenements','lambdas-closures','linq','generiques','iterateurs-yield','pattern-matching','idisposable-using','attributs-reflexion','async-await']},
  {id:'poo', name:'Objets et patterns', color:'#8b5cf6', d:'Organiser son code : classes, interfaces, composition et patterns classiques.',
   order:['classes-objets','heritage-polymorphisme','interfaces','composition','separation-donnees-vue','singleton','service-locator','machine-etats','strategy','command-undo','event-bus-so']},
  {id:'algo', name:'Algorithmes', color:'#eab308', d:'Structures de données et algorithmes qu’on croise dans tous les jeux.',
   order:['complexite','pile-file','grille-2d','recursion','tri','recherche-binaire','aleatoire','melange-fisher-yates','bfs-grille','astar']},
  {id:'maths', name:'Maths du jeu', color:'#f97316', d:'Vecteurs, angles, courbes et rotations : la géométrie de tous les jours.',
   order:['vecteurs','longueur-distance','trigonometrie','modulo-repetition','produit-scalaire','produit-vectoriel','projection-vecteurs','angles-signes','interpolation','easing','smoothdamp-ressort','courbes-bezier','collisions-formes','point-aleatoire-forme','bruit-perlin','espaces-coordonnees','matrices','plans-intersections','quaternions']},
  {id:'unity', name:'Unity', color:'#0ea5e9', d:'Le moteur : objets, physique, interface, audio, scènes et données.',
   order:['gameobject-composants','cycle-de-vie','prefabs-instantiate','input-system','collisions-triggers','rigidbody-forces','raycast','operations-bits','coroutines','time-scale-pause','ui-canvas','audio','gizmos','camera-suivi','animator-parametres','scriptableobjects','serialisation','sauvegarde-json','chargement-scenes','navmesh','addressables']},
  {id:'editor', name:'Outils éditeur et CI', color:'#14b8a6', d:'Étendre l’éditeur et automatiser : menus, inspecteurs, tests, builds.',
   order:['menuitem-contextmenu','custom-inspector','property-drawer','editor-window','handles-scene','batch-assets','validation-assets','assembly-definitions','tests-unitaires','build-ligne-commande','build-hooks']},
  {id:'perf', name:'Performance', color:'#ec4899', d:'Garder le jeu fluide : mesurer, éviter les allocations, paralléliser.',
   order:['profiler-markers','cache-references','allocations-gc','object-pooling','update-manager','partition-spatiale','jobs-burst']}
];
const LV = ['Tous','Débutant','Intermédiaire','Avancé'];

/* ---------- données ---------- */
const RAW = window.LESSONS || [];
const byId = {};
RAW.forEach(l => { byId[l.id] = l; });
const LESSONS = [];
CATS.forEach(c => {
  const seen = new Set();
  c.order.forEach(id => { if (byId[id] && byId[id].cat === c.id) { LESSONS.push(byId[id]); seen.add(id); } });
  RAW.forEach(l => { if (l.cat === c.id && !seen.has(l.id)) LESSONS.push(l); });
});
LESSONS.forEach((l, i) => { l.i = i; });
const usedBy = {};
LESSONS.forEach(l => {
  const txt = l.body.map(b => b[1]).join(' ') + ' ' + l.ex;
  const refs = new Set();
  txt.replace(/\[\[([a-z0-9-]+)/g, (m, id) => { refs.add(id); return m; });
  l.refs = [...refs].filter(r => byId[r] && r !== l.id);
  l.refs.forEach(r => (usedBy[r] = usedBy[r] || []).push(l.id));
});

/* ---------- stockage local ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
let done = new Set(store.get('cs-done', []));
let lvlFilter = 0, query = '', tab = 'code';

/* ---------- rendu du texte et du code ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function md(s) {
  let h = esc(s);
  h = h.replace(/~([^~]+)~/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  h = h.replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, id, lab) => byId[id] ? '<a href="#' + id + '">' + (lab || esc(byId[id].title)) + '</a>' : (lab || id));
  return h;
}
const KW = 'abstract|as|base|bool|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|event|explicit|false|finally|float|for|foreach|get|if|implicit|in|int|interface|internal|is|long|namespace|new|null|object|out|override|private|protected|public|readonly|ref|return|sealed|set|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|using|var|virtual|void|when|where|while|yield|async|await|and|or|not|nameof';
const TOK = new RegExp('(//[^\\n]*)|(\\$?@?"(?:[^"\\\\]|\\\\.)*")|\\b(\\d+(?:\\.\\d+)?(?:e-?\\d+)?f?)\\b|\\b(' + KW + ')\\b|\\b([A-Z][A-Za-z0-9_]*)\\b', 'g');
function hl(code) {
  let out = '', last = 0;
  code.replace(TOK, (m, c, s, n, k, t, off) => {
    out += esc(code.slice(last, off));
    const cls = c ? 'k5' : s ? 'k3' : n ? 'k4' : k ? 'k1' : 'k2';
    out += '<span class="' + cls + '">' + esc(m) + '</span>';
    last = off + m.length;
    return m;
  });
  return out + esc(code.slice(last));
}
const badge = n => '<span class="badge l' + n + '">' + LV[n] + '</span>';
const checkSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
const codeBlock = (c, copy) => '<div class="pre">' + (copy ? '' : '') + '<pre><code>' + hl(c) + '</code></pre></div>';
const match = l => (!lvlFilter || l.lvl === lvlFilter) && (!query || (l.title + ' ' + l.sum + ' ' + CATS.find(c => c.id === l.cat).name).toLowerCase().includes(query));

const view = document.getElementById('view');
const prog = document.getElementById('prog');
const navbtn = document.getElementById('navbtn');
function updateProg() { prog.textContent = done.size + ' / ' + LESSONS.length + ' leçons terminées'; }

/* ---------- accueil ---------- */
function viewHome() {
  document.title = 'Carnet C# Unity';
  navbtn.classList.remove('show');
  const pct = Math.round(done.size / LESSONS.length * 100);
  const lastId = store.get('cs-last', null);
  const resume = byId[lastId] || LESSONS.find(l => !done.has(l.id)) || LESSONS[0];
  const total = LESSONS.filter(match).length;
  view.innerHTML =
    '<section class="hero"><div class="txt"><h1>Apprendre le C# de Unity, une notion à la fois</h1>' +
    '<p>' + LESSONS.length + ' leçons en ' + CATS.length + ' thèmes. Lis l’explication, écris ta réponse à côté, puis compare avec la solution. Chaque notion renvoie vers celles dont elle a besoin.</p></div>' +
    '<div class="progcard"><div class="row"><span>Ta progression</span><b>' + pct + ' %</b></div><div class="track"><i style="width:' + pct + '%"></i></div>' +
    '<a class="resume" href="#' + resume.id + '"><span>' + (lastId && byId[lastId] ? 'Reprendre : ' : 'Commencer : ') + esc(resume.title) + '</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></section>' +
    '<div class="bar"><span class="lab">Niveau</span>' + LV.map((n, i) => '<button class="pill" data-lv="' + i + '" aria-pressed="' + (i === lvlFilter) + '">' + n + '</button>').join('') +
    '<span class="lab" style="margin-left:auto">' + total + ' leçon' + (total > 1 ? 's' : '') + '</span></div>' +
    '<div class="bar cats"><span class="lab">Aller à</span>' + CATS.map(c => '<button class="pill" data-jump="' + c.id + '"><span class="dot" style="background:' + c.color + '"></span>' + c.name + '</button>').join('') + '</div>' +
    '<div class="grid">' + CATS.map(c => {
      const ls = LESSONS.filter(l => l.cat === c.id && match(l));
      return '<section class="cat" id="cat-' + c.id + '"><div class="hd"><span class="dot" style="background:' + c.color + '"></span><h2>' + c.name + '</h2><span class="n">' + ls.length + ' leçon' + (ls.length > 1 ? 's' : '') + '</span></div>' +
        '<p>' + esc(c.d) + '</p>' +
        (ls.length ? ls.map(l => '<a class="item" href="#' + l.id + '"><span class="check' + (done.has(l.id) ? ' on' : '') + '" aria-label="' + (done.has(l.id) ? 'Terminée' : 'À faire') + '">' + (done.has(l.id) ? checkSvg : '') + '</span><span class="t">' + esc(l.title) + '</span>' + badge(l.lvl) + '</a>').join('') : '<p class="empty">Aucune leçon pour ce filtre.</p>') +
        '</section>';
    }).join('') + '</div>';
}

/* ---------- page de leçon ---------- */
function viewLesson(l) {
  document.title = l.title + ' · Carnet C# Unity';
  store.set('cs-last', l.id);
  navbtn.classList.add('show');
  tab = 'code';
  const x = (window.EXTRA || {})[l.id] || {};
  const cat = CATS.find(c => c.id === l.cat);
  const prev = LESSONS[l.i - 1], next = LESSONS[l.i + 1];
  const siblings = LESSONS.filter(x => x.cat === l.cat);
  const refs = l.refs.map(r => '<a class="chip" href="#' + r + '">' + esc(byId[r].title) + '</a>').join('');
  const back = (usedBy[l.id] || []).map(r => '<a class="chip soft" href="#' + r + '">' + esc(byId[r].title) + '</a>').join('');
  view.innerHTML =
    '<div class="lesson">' +
    '<aside class="side" id="side"><div class="stick"><h4>' + cat.name + '</h4><nav aria-label="' + esc(cat.name) + '">' +
      siblings.map(x => '<a href="#' + x.id + '"' + (x.id === l.id ? ' aria-current="page"' : '') + '><span class="mini' + (done.has(x.id) ? ' on' : '') + '"></span>' + esc(x.title) + '</a>').join('') + '</nav>' +
      '<div class="other"><h4>Autres thèmes</h4>' + CATS.filter(c => c.id !== l.cat).map(c => { const f = LESSONS.find(x => x.cat === c.id); return '<a href="#' + f.id + '"><span class="dot" style="width:7px;height:7px;background:' + c.color + '"></span>' + c.name + '</a>'; }).join('') +
      '<a href="#">← Toutes les leçons</a></div></div></aside>' +
    '<div class="main">' +
      '<div class="crumb"><a href="#">Sommaire</a> / ' + cat.name + '</div>' +
      '<div class="ttl"><h1>' + esc(l.title) + '</h1>' + badge(l.lvl) + '</div>' +
      '<p class="sum">' + esc(l.sum) + '</p>' +
      (x.r ? '<section class="keep"><h3>À retenir</h3><ul>' + x.r.map(t => '<li>' + md(t) + '</li>').join('') + '</ul></section>' : '') +
      (l.diag ? '<section class="diag"><div class="fig"><svg role="img" aria-label="Schéma interactif : fais glisser les points"></svg></div><div class="readout"></div></section>' : '') +
      '<div class="cols"><article class="prose">' + l.body.map(b => '<section><h2>' + esc(b[0]) + '</h2><p>' + md(b[1]) + '</p>' + (b[2] ? codeBlock(b[2]) : '') + '</section>').join('') +
        (x.m ? '<div class="deeper">Pour aller plus loin</div>' + x.m.map(b => '<section><h2>' + esc(b[0]) + '</h2><p>' + md(b[1]) + '</p>' + (b[2] ? codeBlock(b[2]) : '') + '</section>').join('') : '') + '</article>' +
      '<div class="aside">' + (refs ? '<div><h3>Notions utilisées</h3><div class="chips">' + refs + '</div></div>' : '') +
        (back ? '<div><h3>Réutilisée dans</h3><div class="chips">' + back + '</div></div>' : '') +
        (!refs && !back ? '<div><h3>Notions liées</h3><p style="margin:0;color:var(--mute);font-size:14px">Cette leçon se suffit à elle-même.</p></div>' : '') + '</div></div>' +
      '<section class="ex"><h2>À toi de coder</h2><p>' + md(l.ex) + '</p>' + (l.exCode ? codeBlock(l.exCode) : '') +
        '<button class="hintbtn" id="hintbtn" aria-expanded="false">Besoin d’un indice ?</button><p class="hint" id="hint" hidden>' + md(l.hint) + '</p>' +
        '<div class="tabs" role="tablist" aria-label="Code"><button role="tab" data-tab="code" aria-selected="true">Ton code</button><button role="tab" data-tab="sol" aria-selected="false">Solution</button></div>' +
        '<div class="work">' +
          '<div class="pane cur" id="p-code"><div class="ph"><b>Ton code</b><span class="sp"></span><span id="saved"></span><button class="small" id="clear">Effacer</button></div>' +
          '<label class="sr" for="ed">Ton code</label><textarea id="ed" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="// Écris ta solution ici. Tab insère 4 espaces.\n// Ton brouillon est gardé sur cet appareil."></textarea></div>' +
          '<div class="pane" id="p-sol"><div class="ph"><b>Solution</b><span class="sp"></span></div><div class="lock"><span class="ic" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span><p>La solution reste cachée tant que tu n’as pas essayé.</p><button class="cta" id="reveal">Afficher la solution</button></div></div>' +
        '</div>' +
        (x.d ? '<div class="defis"><h3>Défis supplémentaires</h3><ol>' + x.d.map(d => '<li><p>' + md(d[0]) + '</p>' + (d[1] ? '<details><summary>Indice</summary><p>' + md(d[1]) + '</p></details>' : '') + '</li>').join('') + '</ol></div>' : '') +
        '<label class="done"><input type="checkbox" id="donebox"' + (done.has(l.id) ? ' checked' : '') + '> Leçon terminée</label>' +
      '</section>' +
      '<nav class="pager" aria-label="Leçons voisines">' + (prev ? '<a href="#' + prev.id + '"><span>← Précédente</span><b>' + esc(prev.title) + '</b></a>' : '<span></span>') + (next ? '<a class="n" href="#' + next.id + '"><span>Suivante →</span><b>' + esc(next.title) + '</b></a>' : '') + '</nav>' +
    '</div></div>';

  const ed = document.getElementById('ed'), saved = document.getElementById('saved');
  ed.value = store.get('cs-note-' + l.id, '');
  ed.addEventListener('input', () => { store.set('cs-note-' + l.id, ed.value); saved.textContent = 'Brouillon gardé'; });
  ed.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || e.shiftKey) return;
    e.preventDefault();
    const a = ed.selectionStart, b = ed.selectionEnd;
    ed.value = ed.value.slice(0, a) + '    ' + ed.value.slice(b);
    ed.selectionStart = ed.selectionEnd = a + 4;
    ed.dispatchEvent(new Event('input'));
  });
  document.getElementById('clear').addEventListener('click', () => { ed.value = ''; store.set('cs-note-' + l.id, ''); saved.textContent = ''; });
  document.getElementById('reveal').addEventListener('click', () => revealSolution(l));
  const hb = document.getElementById('hintbtn'), hint = document.getElementById('hint');
  hb.addEventListener('click', () => { const open = hint.hidden; hint.hidden = !open; hb.setAttribute('aria-expanded', String(open)); hb.textContent = open ? 'Masquer l’indice' : 'Besoin d’un indice ?'; });
  document.getElementById('donebox').addEventListener('change', e => {
    e.target.checked ? done.add(l.id) : done.delete(l.id);
    store.set('cs-done', [...done]);
    updateProg();
    const mini = view.querySelector('.side a[aria-current=page] .mini');
    if (mini) mini.classList.toggle('on', e.target.checked);
  });
  const d = view.querySelector('.diag');
  if (d) mountDiag(d, l.diag);
}
function revealSolution(l) {
  const p = document.getElementById('p-sol');
  p.innerHTML = '<div class="ph"><b>Solution</b><span class="sp"></span><button class="small" id="copy">Copier</button></div>' + codeBlock(l.sol);
  document.getElementById('copy').addEventListener('click', e => {
    const b = e.currentTarget;
    const done = t => { b.textContent = t; setTimeout(() => { b.textContent = 'Copier'; }, 1600); };
    try { navigator.clipboard.writeText(l.sol).then(() => done('Copié'), () => done('Copie refusée')); } catch (err) { done('Copie refusée'); }
  });
  setTab('sol');
}
function setTab(t) {
  tab = t;
  view.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  const pc = document.getElementById('p-code'), ps = document.getElementById('p-sol');
  if (pc) pc.classList.toggle('cur', t === 'code');
  if (ps) ps.classList.toggle('cur', t === 'sol');
}

/* ---------- schémas interactifs ---------- */
let diagRO = null;
function mountDiag(box, mode) {
  const svg = box.querySelector('svg'), out = box.querySelector('.readout');
  const st = {a:{x:3, y:1}, b:{x:1, y:3}, t:.35};
  if (mode === 'len') st.a = {x:3, y:2};
  if (mode === 'lerp') { st.a = {x:-3.5, y:-1.5}; st.b = {x:3, y:2.5}; }
  if (mode === 'trig') st.a = {x:4 * Math.cos(.6), y:4 * Math.sin(.6)};
  if (mode === 'dot') { st.a = {x:4, y:0}; st.b = {x:2, y:3}; }
  let W = 0, H = 0, S = 1, cx = 0, cy = 0, drag = null;
  const X = v => cx + v * S, Y = v => cy - v * S;
  const f = n => (Math.abs(n) < .005 ? 0 : n).toFixed(2);
  const vec = p => '(' + f(p.x) + ' ; ' + f(p.y) + ')';
  const C = {a:'var(--orange)', b:'var(--accent)', ink:'var(--ink)', soft:'var(--mute)', teal:'var(--teal)'};
  function arrow(x1, y1, x2, y2, col, w, dash) {
    const px1 = X(x1), py1 = Y(y1), px2 = X(x2), py2 = Y(y2), a = Math.atan2(py2 - py1, px2 - px1), L = Math.hypot(px2 - px1, py2 - py1);
    if (L < 2) return '';
    const hs = Math.min(13, L * .5), bx = px2 - Math.cos(a) * hs, by = py2 - Math.sin(a) * hs;
    const p1 = (bx + Math.sin(a) * hs * .45) + ',' + (by - Math.cos(a) * hs * .45), p2 = (bx - Math.sin(a) * hs * .45) + ',' + (by + Math.cos(a) * hs * .45);
    return '<line x1="' + px1 + '" y1="' + py1 + '" x2="' + bx + '" y2="' + by + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="6 6"' : '') + '/><polygon points="' + px2 + ',' + py2 + ' ' + p1 + ' ' + p2 + '" fill="' + col + '"/>';
  }
  const dashed = (x1, y1, x2, y2, col) => '<line x1="' + X(x1) + '" y1="' + Y(y1) + '" x2="' + X(x2) + '" y2="' + Y(y2) + '" stroke="' + col + '" stroke-width="1.5" stroke-dasharray="4 5"/>';
  const label = (x, y, t, col, dx, dy) => '<text x="' + (X(x) + (dx || 10)) + '" y="' + (Y(y) + (dy || -10)) + '" fill="' + col + '">' + t + '</text>';
  const handle = (p, col) => '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="8" fill="var(--card)" stroke="' + col + '" stroke-width="3"/>';
  const circle = (r, col) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r * S + '" fill="none" stroke="' + col + '" stroke-width="1.5"/>';
  const row = (k, v, cls) => '<div><div class="k">' + k + '</div><div class="' + (cls || 'v') + '">' + v + '</div></div>';
  function grid() {
    let g = '';
    const n = Math.ceil(Math.max(W, H) / S / 2) + 1;
    for (let i = -n; i <= n; i++) g += '<line x1="' + X(i) + '" y1="0" x2="' + X(i) + '" y2="' + H + '" stroke="var(--line2)" stroke-width="1" opacity=".7"/><line x1="0" y1="' + Y(i) + '" x2="' + W + '" y2="' + Y(i) + '" stroke="var(--line2)" stroke-width="1" opacity=".7"/>';
    return g + '<line x1="0" y1="' + cy + '" x2="' + W + '" y2="' + cy + '" stroke="var(--mute)" stroke-width="1.2" opacity=".6"/><line x1="' + cx + '" y1="0" x2="' + cx + '" y2="' + H + '" stroke="var(--mute)" stroke-width="1.2" opacity=".6"/>';
  }
  function draw() {
    W = svg.clientWidth; H = svg.clientHeight;
    if (!W || !H) return;
    S = Math.min(W, H) / 11.5; cx = W / 2; cy = H / 2;
    let g = grid(), r = '';
    const a = st.a, b = st.b;
    if (mode === 'add') {
      const s = {x:a.x + b.x, y:a.y + b.y};
      g += arrow(0, 0, b.x, b.y, C.b, 2, true) + arrow(0, 0, s.x, s.y, C.ink, 4) + arrow(0, 0, a.x, a.y, C.a, 4) + arrow(a.x, a.y, s.x, s.y, C.b, 3, true) +
        label(a.x, a.y, 'A', C.a) + label(b.x, b.y, 'B', C.b) + label(s.x, s.y, 'A + B', C.ink) + handle(a, C.a) + handle(b, C.b);
      r = row('A + B', vec(s), 'big') + row('A', vec(a)) + row('B', vec(b)) + row('B − A, la flèche de A vers B', vec({x:b.x - a.x, y:b.y - a.y})) + '<p class="note">Fais glisser les pointes de A et de B.</p>';
    }
    if (mode === 'len') {
      const m = Math.hypot(a.x, a.y) || 1e-9, n = {x:a.x / m, y:a.y / m};
      g += circle(1, C.soft) + dashed(0, 0, a.x, 0, C.soft) + dashed(a.x, 0, a.x, a.y, C.soft) + arrow(0, 0, a.x, a.y, C.a, 4) + arrow(0, 0, n.x, n.y, C.b, 5) +
        label(a.x, a.y, 'v', C.a) + label(n.x, n.y, 'normalized', C.b, 8, 22) + label(a.x / 2, 0, 'x', C.soft, -4, 22) + label(a.x, a.y / 2, 'y', C.soft, 8, 4) + handle(a, C.a);
      r = row('magnitude = √(x² + y²)', f(Math.hypot(a.x, a.y)), 'big') + row('sqrMagnitude = x² + y²', f(a.x * a.x + a.y * a.y)) + row('v', vec(a)) + row('normalized (longueur 1)', vec(n)) + '<p class="note">Fais glisser la pointe de v : la flèche normalisée reste sur le cercle de rayon 1.</p>';
    }
    if (mode === 'dot') {
      const ma = Math.hypot(a.x, a.y) || 1e-9, mb = Math.hypot(b.x, b.y) || 1e-9, na = {x:a.x / ma, y:a.y / ma}, nb = {x:b.x / mb, y:b.y / mb};
      const d = na.x * nb.x + na.y * nb.y, proj = b.x * na.x + b.y * na.y, p = {x:na.x * proj, y:na.y * proj};
      const col = d > .05 ? 'var(--accent)' : d < -.05 ? 'var(--orange)' : 'var(--mute)';
      g += dashed(-na.x * 6, -na.y * 6, na.x * 6, na.y * 6, 'var(--line2)') + dashed(b.x, b.y, p.x, p.y, C.soft) +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + X(p.x) + '" y2="' + Y(p.y) + '" stroke="' + col + '" stroke-width="10" stroke-linecap="round" opacity=".35"/>' +
        arrow(0, 0, a.x, a.y, C.ink, 4) + arrow(0, 0, b.x, b.y, C.a, 4) + label(a.x, a.y, 'A · forward', C.ink) + label(b.x, b.y, 'B · vers la cible', C.a) + handle(a, C.ink) + handle(b, C.a);
      const verdict = d > .05 ? 'Devant : même sens' : d < -.05 ? 'Derrière : sens opposés' : 'Perpendiculaires';
      r = row('Dot(A, B) normalisés', f(d), 'big') + '<div style="font-weight:500;color:' + col + '">' + verdict + '</div>' + row('Angle entre A et B', (Math.acos(Math.max(-1, Math.min(1, d))) * 180 / Math.PI).toFixed(1) + '°') + row('Dot(A, B) brut', f(a.x * b.x + a.y * b.y)) + row('Projection de B sur A', f(proj)) + '<p class="note">La barre épaisse est l’ombre de B sur la direction de A.</p>';
    }
    if (mode === 'lerp') {
      const t = st.t, p = {x:a.x + (b.x - a.x) * t, y:a.y + (b.y - a.y) * t};
      g += '<line x1="' + X(a.x) + '" y1="' + Y(a.y) + '" x2="' + X(b.x) + '" y2="' + Y(b.y) + '" stroke="var(--line2)" stroke-width="6" stroke-linecap="round"/>';
      [.25, .5, .75].forEach(k => { g += '<circle cx="' + X(a.x + (b.x - a.x) * k) + '" cy="' + Y(a.y + (b.y - a.y) * k) + '" r="3" fill="var(--mute)"/>'; });
      g += '<line x1="' + X(a.x) + '" y1="' + Y(a.y) + '" x2="' + X(p.x) + '" y2="' + Y(p.y) + '" stroke="var(--orange)" stroke-width="6" stroke-linecap="round"/><circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="10" fill="var(--orange)"/>' +
        label(p.x, p.y, 'Lerp(a, b, t)', C.a, 14, -14) + label(a.x, a.y, 'a', C.ink, -24, -10) + label(b.x, b.y, 'b', C.ink) + handle(a, C.ink) + handle(b, C.ink);
      r = row('t', '<span id="tval">' + t.toFixed(2) + '</span>', 'big') + '<input type="range" id="tslider" min="0" max="1" step="0.01" value="' + t + '" aria-label="Valeur de t">' + row('a + (b − a) × t', '<span id="pval">' + vec(p) + '</span>') + row('a', vec(a)) + row('b', vec(b)) + '<p class="note">Fais glisser t, ou déplace a et b.</p>';
    }
    if (mode === 'trig') {
      const ang = Math.atan2(a.y, a.x), c = Math.cos(ang), s = Math.sin(ang), sweep = ang >= 0 ? 0 : 1;
      g += circle(4, C.soft) + dashed(a.x, a.y, a.x, 0, C.b) + dashed(a.x, a.y, 0, a.y, C.teal) +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + X(a.x) + '" y2="' + cy + '" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" opacity=".55"/>' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + Y(a.y) + '" stroke="var(--teal)" stroke-width="6" stroke-linecap="round" opacity=".55"/>' +
        '<path d="M' + (cx + 1.2 * S) + ' ' + cy + ' A' + (1.2 * S) + ' ' + (1.2 * S) + ' 0 0 ' + sweep + ' ' + (cx + Math.cos(ang) * 1.2 * S) + ' ' + (cy - Math.sin(ang) * 1.2 * S) + '" fill="none" stroke="var(--orange)" stroke-width="3"/>' +
        arrow(0, 0, a.x, a.y, C.a, 4) + label(a.x / 2, 0, 'cos', C.b, -14, a.y >= 0 ? 22 : -10) + label(0, a.y / 2, 'sin', C.teal, a.x >= 0 ? -40 : 8, 4) + label(a.x, a.y, '(cos θ, sin θ) × r', C.a) + handle(a, C.a);
      r = row('Angle θ', (ang * 180 / Math.PI).toFixed(1) + '°', 'big') + row('En radians', f(ang)) + row('cos θ', f(c)) + row('sin θ', f(s)) + row('Mathf.Atan2(y, x)', (ang * 180 / Math.PI).toFixed(1) + '° une fois converti') + '<p class="note">Fais tourner le point sur le cercle.</p>';
    }
    svg.innerHTML = g;
    const sl = out.querySelector('#tslider');
    if (sl && document.activeElement === sl) {
      const p = {x:a.x + (b.x - a.x) * st.t, y:a.y + (b.y - a.y) * st.t};
      out.querySelector('#tval').textContent = st.t.toFixed(2);
      out.querySelector('#pval').textContent = vec(p);
    } else {
      out.innerHTML = r;
      const ns = out.querySelector('#tslider');
      if (ns) ns.addEventListener('input', e => { st.t = +e.target.value; draw(); });
    }
  }
  const handles = () => mode === 'len' || mode === 'trig' ? ['a'] : ['a', 'b'];
  const toUnits = e => { const rc = svg.getBoundingClientRect(); return {x:Math.round((e.clientX - rc.left - cx) / S * 10) / 10, y:Math.round((cy - (e.clientY - rc.top)) / S * 10) / 10}; };
  function move(e) {
    if (!drag) return;
    let u = toUnits(e);
    u.x = Math.max(-5.5, Math.min(5.5, u.x)); u.y = Math.max(-5.5, Math.min(5.5, u.y));
    if (mode === 'trig') { const an = Math.atan2(u.y, u.x); u = {x:4 * Math.cos(an), y:4 * Math.sin(an)}; }
    st[drag] = u; draw();
  }
  svg.addEventListener('pointerdown', e => {
    const u = toUnits(e); let best = null, bd = 1e9;
    handles().forEach(k => { const d = Math.hypot(st[k].x - u.x, st[k].y - u.y) * S; if (d < bd) { bd = d; best = k; } });
    if (bd < 40 || mode === 'trig') { drag = best; svg.setPointerCapture(e.pointerId); move(e); }
  });
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerup', () => { drag = null; });
  svg.addEventListener('pointercancel', () => { drag = null; });
  diagRO = new ResizeObserver(draw);
  diagRO.observe(svg);
  draw();
}

/* ---------- navigation ---------- */
function route() {
  const id = location.hash.slice(1);
  if (diagRO) { diagRO.disconnect(); diagRO = null; }
  document.body.classList.remove('nav');
  navbtn.setAttribute('aria-expanded', 'false');
  if (byId[id]) viewLesson(byId[id]); else viewHome();
  updateProg();
  window.scrollTo(0, 0);
}
document.addEventListener('click', e => {
  const lv = e.target.closest('[data-lv]');
  if (lv) { lvlFilter = +lv.dataset.lv; viewHome(); return; }
  const jump = e.target.closest('[data-jump]');
  if (jump) { const el = document.getElementById('cat-' + jump.dataset.jump); if (el) el.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); return; }
  const t = e.target.closest('[data-tab]');
  if (t) { setTab(t.dataset.tab); return; }
});
document.getElementById('q').addEventListener('input', e => {
  query = e.target.value.trim().toLowerCase();
  if (byId[location.hash.slice(1)]) { location.hash = ''; return; }
  viewHome();
});
navbtn.addEventListener('click', () => {
  const on = document.body.classList.toggle('nav');
  navbtn.setAttribute('aria-expanded', String(on));
});
window.addEventListener('hashchange', route);
route();
}

/**
 * ball.js — Rolling Ball Physics
 * Valentin Barrère · valentin-barrere.dev
 *
 * Contrôles : Q = gauche | D = droite | ESPACE = sauter
 *
 * ── Ajouter des murs / rampes ────────────────────────────────────────────────
 * Après avoir inclus ball.js, appelle BALL_ADD_SURFACE(x1, y1, x2, y2)
 * Les coordonnées sont en pixels depuis le coin haut-gauche du canvas de jeu.
 * Le sol est à Y = BALL_CANVAS_H (280 par défaut).
 *
 * Exemples :
 *   BALL_ADD_SURFACE(300, 280, 500, 200);   // rampe montante
 *   BALL_ADD_SURFACE(600, 280, 600, 180);   // mur vertical
 *   BALL_ADD_SURFACE(200, 200, 450, 200);   // plateforme horizontale
 */

(function () {
  'use strict';

  // ── Constantes physiques ──────────────────────────────────────────────────
  const BALL_R      = 14;    // rayon de la balle (px)
  const GRAVITY     = 0.50;  // accélération gravitationnelle par frame
  const ACCEL       = 0.45;  // poussée par frame quand touche enfoncée
  const FRICTION    = 0.82;  // facteur de décélération au sol (sans input)
  const AIR_RES     = 0.997; // résistance de l'air (en saut)
  const MAX_VX      = 9;     // vitesse horizontale max
  const JUMP_V      = 12;    // impulsion de saut
  const RESTITUTION = 0.08;  // rebond sur les surfaces (0 = aucun)
  const COYOTE_T    = 7;     // frames de "coyote time" après un bord
  const JUMP_BUF    = 8;     // frames de buffer pour le saut anticipé
  const CANVAS_H    = window.innerHeight;   // hauteur de la zone de jeu

  // ── Canvas ────────────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.id = 'ball-canvas';
  Object.assign(canvas.style, {
    position:      'fixed',
    bottom:        '0',
    left:          '0',
    width:         '100%',
    height:        CANVAS_H + 'px',
    pointerEvents: 'none',
    zIndex:        '9000',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // ── Surfaces de collision (segments) ─────────────────────────────────────
  // surfaces[0] = sol, toujours recalculé au resize
  const surfaces = [null];

  function resetGround() {
    surfaces[0] = { x1: -9999, y1: canvas.height, x2: 99999, y2: canvas.height };
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = CANVAS_H;
    resetGround();
  }
  resize();
  window.addEventListener('resize', resize);

  // API publique pour ajouter des surfaces
  window.BALL_CANVAS_H    = CANVAS_H;
  window.BALL_ADD_SURFACE = (x1, y1, x2, y2) => surfaces.push({ x1, y1, x2, y2 });

  // ── État de la balle ──────────────────────────────────────────────────────
  const ball = {
    x: 160, y: CANVAS_H - BALL_R,
    vx: 0,  vy: 0,
    angle: 0,     // angle de rotation visuelle
  };

  let onGround    = false;
  let coyote      = 0;   // frames restantes de coyote time
  let jumpBuffer  = 0;   // frames restantes de jump buffer

  // ── Clavier ───────────────────────────────────────────────────────────────
  const keys      = {};
  let   prevSpace = false;

  document.addEventListener('keydown', e => {
    if (e.code === 'Space') e.preventDefault();
    keys[e.code] = true;
  });
  document.addEventListener('keyup', e => { keys[e.code] = false; });

  // ── Géométrie : point le plus proche sur un segment ───────────────────────
  function closestPt(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-6) return { x: ax, y: ay };
    const t = Math.max(0, Math.min(1, ((px-ax)*dx + (py-ay)*dy) / len2));
    return { x: ax + t*dx, y: ay + t*dy };
  }

  // ── Résolution collision balle ↔ segment ─────────────────────────────────
  // Retourne la normale de collision, ou null si pas de collision.
  function resolveSegment(seg) {
    const cp   = closestPt(ball.x, ball.y, seg.x1, seg.y1, seg.x2, seg.y2);
    const dx   = ball.x - cp.x;
    const dy   = ball.y - cp.y;
    const d2   = dx*dx + dy*dy;

    if (d2 < BALL_R * BALL_R && d2 > 1e-6) {
      const dist = Math.sqrt(d2);
      const nx   = dx / dist;
      const ny   = dy / dist;

      // Séparation
      ball.x = cp.x + nx * BALL_R;
      ball.y = cp.y + ny * BALL_R;

      // Correction de vitesse le long de la normale
      const vDotN = ball.vx * nx + ball.vy * ny;
      if (vDotN < 0) {
        ball.vx -= (1 + RESTITUTION) * vDotN * nx;
        ball.vy -= (1 + RESTITUTION) * vDotN * ny;
      }
      return { nx, ny };
    }
    return null;
  }

  // ── Mise à jour physique ──────────────────────────────────────────────────
  function update() {
    const goLeft  = !!keys['KeyA'];   // Q sur AZERTY = code KeyA
    const goRight = !!keys['KeyD'];
    const spaceNow = !!keys['Space'];
    const jumpPressed = spaceNow && !prevSpace; // front montant
    prevSpace = spaceNow;

    // Buffer de saut : si on appuie un peu avant d'atterrir
    if (jumpPressed) jumpBuffer = JUMP_BUF;
    else             jumpBuffer = Math.max(0, jumpBuffer - 1);

    // ── Input horizontal ──
    if (goLeft)  ball.vx -= ACCEL;
    if (goRight) ball.vx += ACCEL;
    ball.vx = Math.max(-MAX_VX, Math.min(MAX_VX, ball.vx));

    // ── Gravité ──
    ball.vy += GRAVITY;

    // ── Déplacement ──
    ball.x += ball.vx;
    ball.y += ball.vy;

    // ── Collisions ──
    onGround = false;
    for (const seg of surfaces) {
      if (!seg) continue;
      const hit = resolveSegment(seg);
      if (hit && hit.ny < -0.25) {   // normale vers le haut = surface praticable
        onGround = true;
      }
    }

    // ── Coyote time ──
    if (onGround) coyote = COYOTE_T;
    else          coyote = Math.max(0, coyote - 1);

    const canJump = coyote > 0;

    // ── Saut ──
    if (jumpBuffer > 0 && canJump) {
      ball.vy  = -JUMP_V;
      coyote   = 0;
      jumpBuffer = 0;
      onGround = false;
    }

    // ── Friction / résistance ──
    if (onGround) {
      // Au sol sans input → friction forte (s'arrête assez vite)
      if (!goLeft && !goRight) ball.vx *= FRICTION;
    } else {
      // En l'air → légère résistance horizontale
      ball.vx *= AIR_RES;
    }

    // ── Limites latérales ──
    if (ball.x - BALL_R < 0)             { ball.x = BALL_R;                ball.vx = Math.abs(ball.vx) * 0.4; }
    if (ball.x + BALL_R > canvas.width)   { ball.x = canvas.width - BALL_R; ball.vx = -Math.abs(ball.vx) * 0.4; }

    // ── Rotation visuelle ──
    ball.angle += ball.vx / BALL_R;
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────
  function drawBall() {
    const cx = ball.x, cy = ball.y, r = BALL_R;

    // Ombre projetée sur le sol
    const shadowY = canvas.height - 3;
    const shadowDist = Math.max(0.1, 1 - (shadowY - cy) / (CANVAS_H * 0.9));
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, shadowY, r * shadowDist * 1.1, 4 * shadowDist, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${0.22 * shadowDist})`;
    ctx.fill();
    ctx.restore();

    // Dégradé radial de la balle
    const grad = ctx.createRadialGradient(
      cx - r * 0.35, cy - r * 0.38, r * 0.08,
      cx,            cy,            r
    );
    grad.addColorStop(0.00, '#dff0ff');
    grad.addColorStop(0.20, '#6ab8f7');
    grad.addColorStop(0.65, '#1d6cc8');
    grad.addColorStop(1.00, '#0a2a5e');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Reflet brillant (petit arc en haut à gauche)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const shine = ctx.createRadialGradient(
      cx - r * 0.3, cy - r * 0.38, 0,
      cx - r * 0.3, cy - r * 0.38, r * 0.45
    );
    shine.addColorStop(0,   'rgba(255,255,255,0.70)');
    shine.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    // Point de rotation (indique que la balle roule)
    const dotX = cx + Math.cos(ball.angle) * r * 0.56;
    const dotY = cy + Math.sin(ball.angle) * r * 0.56;
    ctx.beginPath();
    ctx.arc(dotX, dotY, r * 0.20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(5, 25, 80, 0.72)';
    ctx.fill();
  }

  // ── Dessin d'une brique Mario ─────────────────────────────────────────────
  const BW = 26;        // largeur d'une brique (px, dans l'espace du segment)
  const BH = 14;        // hauteur d'une brique
  const BD = 3;         // épaisseur des joints de mortier
  const BRICK_ROWS = 2; // profondeur (nombre de rangées)

  function drawBrick(x, y, w, h) {
    ctx.fillStyle = '#6B1200';                               // joint foncé
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#C83818';                               // face principale
    ctx.fillRect(x + BD, y + BD, w - BD*2, h - BD*2);
    ctx.fillStyle = '#E04C2A';                               // reflet haut-gauche
    ctx.fillRect(x + BD,     y + BD,         w - BD*2, 3);
    ctx.fillRect(x + BD,     y + BD,         3,         h - BD*2);
    ctx.fillStyle = '#9A2208';                               // ombre bas-droite
    ctx.fillRect(x + BD,     y + h - BD - 3, w - BD*2, 3);
    ctx.fillRect(x + w-BD-3, y + BD,         3,         h - BD*2);
  }

  function drawSurfaces() {
    
    for (let i = 1; i < surfaces.length; i++) {
      const s = surfaces[i];
      if (!s) continue;

      const dx  = s.x2 - s.x1;
      const dy  = s.y2 - s.y1;
      const len = Math.sqrt(dx*dx + dy*dy);
      if (len < 1) continue;

      ctx.save();
      ctx.translate(s.x1, s.y1);
      ctx.rotate(Math.atan2(dy, dx));

      // Clip au rectangle du segment pour ne pas déborder des extrémités
      ctx.beginPath();
      ctx.rect(0, -1, len, BRICK_ROWS * BH + 2);
      ctx.clip();

      const cols = Math.ceil(len / BW) + 2;
      for (let row = 0; row < BRICK_ROWS; row++) {
        const offset = (row % 2 === 0) ? 0 : BW / 2;  // décalage alterné
        for (let col = -1; col <= cols; col++) {
          drawBrick(col * BW - offset, row * BH, BW, BH);
        }
      }

      ctx.restore();
    }
  }

  // ── Boucle principale ─────────────────────────────────────────────────────
  function loop() {
    update();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSurfaces();
    drawBall();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  // ── Hint ──────────────────────────────────────────────────────────────────
  const hint = document.createElement('div');
  hint.innerHTML = '🎮&nbsp; Q &nbsp;/&nbsp; D &nbsp;+&nbsp; Espace';
  Object.assign(hint.style, {
    position:      'fixed',
    bottom:        '10px',
    right:         '14px',
    color:         'rgba(255,255,255,0.5)',
    fontSize:      '11px',
    fontFamily:    'monospace',
    letterSpacing: '0.5px',
    pointerEvents: 'none',
    zIndex:        '9001',
    transition:    'opacity 1.5s',
    background:    'rgba(0,0,0,0.35)',
    padding:       '3px 8px',
    borderRadius:  '4px',
  });
  document.body.appendChild(hint);
  setTimeout(() => { hint.style.opacity = '0'; }, 6000);

})();
/* PLAUSCH — Discokugel Close-up
   Nahaufnahme einer rotierenden Discokugel. Jedes Spiegelplättchen ist
   leicht verkippt und verdreht, spiegelt den "Club" mit Verlauf über die
   Fläche und hat eine Glaskante → funkelt individuell wie eine echte Kugel. */
(() => {
  const canvas = document.getElementById('ball');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GAP = 0.9;            // Anteil Plättchen vs. Fuge
  const CAM = 2.4;            // Kameradistanz (in Kugelradien) → Verlauf über die Plättchen
  let W = 0, H = 0, DPR = 1, R = 0, cx = 0, cy = 0;
  let tiles = [];
  let phi = 0, last = 0, running = true, rafId = 0;
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  let spots = [];

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const norm = (x, y, z) => { const l = Math.hypot(x, y, z); return [x / l, y / l, z / l]; };

  // Lichtquellen im "Club": breite Farbflächen + viele kleine, harte Spots
  const LIGHTS = [
    { d: norm(-0.45, 0.55, 0.70), c: [1.00, 0.96, 0.90], k: 260, s: 3.6 },  // Key-Spot
    { d: norm(0.62, 0.22, 0.75),  c: [1.00, 0.20, 0.58], k: 28,  s: 0.55 }, // Magenta-Wash
    { d: norm(-0.18, -0.38, 0.9), c: [0.25, 0.48, 1.00], k: 24,  s: 0.5 },  // Blau-Wash
    { d: norm(0.25, 0.80, 0.55),  c: [1.00, 0.74, 0.42], k: 140, s: 1.5 },  // Amber
    { d: [0, 0, 1],               c: [1.00, 1.00, 1.00], k: 360, s: 2.8 },  // bewegter Spot
  ];
  (function addPinLights() {
    const rnd = mulberry32(99);
    for (let i = 0; i < 16; i++) {
      const warm = rnd() < 0.6;
      LIGHTS.push({
        d: norm((rnd() - 0.5) * 1.6, rnd() * 1.1 - 0.2, 0.35 + rnd() * 0.8),
        c: warm ? [1, 0.93, 0.85] : (rnd() < 0.5 ? [1, 0.55, 0.85] : [0.7, 0.8, 1]),
        k: 700 + rnd() * 900, s: 1.6 + rnd() * 1.6,
      });
    }
  })();

  // Stern-Flare Sprite
  const flare = document.createElement('canvas');
  (function makeFlare() {
    const S = 256; flare.width = flare.height = S;
    const f = flare.getContext('2d');
    const c = S / 2;
    const g = f.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.05, 'rgba(255,250,242,0.95)');
    g.addColorStop(0.16, 'rgba(255,240,228,0.3)');
    g.addColorStop(0.45, 'rgba(255,230,222,0.06)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    f.fillStyle = g; f.fillRect(0, 0, S, S);
    const ray = (ang, len, w, a) => {
      f.save(); f.translate(c, c); f.rotate(ang);
      const lg = f.createLinearGradient(-len, 0, len, 0);
      lg.addColorStop(0, 'rgba(255,255,255,0)');
      lg.addColorStop(0.5, `rgba(255,255,255,${a})`);
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      f.fillStyle = lg;
      f.beginPath(); f.moveTo(-len, 0); f.lineTo(0, -w); f.lineTo(len, 0); f.lineTo(0, w); f.closePath(); f.fill();
      f.restore();
    };
    ray(0, c, 2.8, 1); ray(Math.PI / 2, c, 2.8, 1);
    ray(Math.PI / 4, c * 0.5, 1.4, 0.5); ray(-Math.PI / 4, c * 0.5, 1.4, 0.5);
  })();

  // weicher Lichtpunkt für Reflexionen an der "Wand"
  const dot = document.createElement('canvas');
  (function makeDot() {
    const S = 64; dot.width = dot.height = S;
    const d = dot.getContext('2d');
    const g = d.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    d.fillStyle = g; d.fillRect(0, 0, S, S);
  })();

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const portrait = H > W;
    // stark reingezoomt: Kugel füllt das Bild, nur oben links ist noch die Wölbung zu ahnen
    R = portrait ? H * 1.0 : Math.max(W, H) * 1.05;
    cx = portrait ? W * 0.78 : W * 0.66;
    cy = portrait ? H * 1.0 : H * 1.28;
    build();
    buildSpots();
    if (reduceMotion || !running) draw(performance.now());
  }

  function build() {
    const tilePx = W < 700 ? 30 : 46;
    const ang = tilePx / R;
    const rows = Math.floor(Math.PI / ang);
    const rnd = mulberry32(11);
    tiles = [];
    for (let i = 0; i < rows; i++) {
      const lat = -Math.PI / 2 + (i + 0.5) * Math.PI / rows;
      const cl = Math.cos(lat), sl = Math.sin(lat);
      const n = Math.max(4, Math.round(2 * Math.PI * cl / ang));
      const off = rnd() * Math.PI * 2;
      const hw = (Math.PI / n) * cl * GAP;       // halbe Breite
      const hh = (Math.PI / rows) * 0.5 * GAP;   // halbe Höhe
      for (let j = 0; j < n; j++) {
        const sz = 0.95 + rnd() * 0.07;
        const rot = (rnd() - 0.5) * 0.09;
        tiles.push({
          cl, sl, lon: off + j * 2 * Math.PI / n, hw: hw * sz, hh: hh * sz,
          cr: Math.cos(rot), sr: Math.sin(rot),
          jx: (rnd() - 0.5) * 0.12, jy: (rnd() - 0.5) * 0.12,
          tone: 0.45 + rnd() * 1.1, sheen: rnd() * 1.1, hue: rnd(), ph: rnd() * 6.283,
        });
      }
    }
  }

  function buildSpots() {
    const rnd = mulberry32(3);
    spots = Array.from({ length: W < 700 ? 40 : 70 }, () => ({
      x: rnd(), y: rnd(), s: 3 + rnd() * 9, a: 0.12 + rnd() * 0.35, sp: 0.6 + rnd() * 0.8, ph: rnd() * 6.28,
    }));
  }

  const tm = (v) => Math.round((1 - Math.exp(-v * 1.9)) * 255);

  // Spiegelung eines Plättchens: Normale q, Blickvektor v → Farbe
  const out = [0, 0, 0, 0];
  function shade(qx, qy, qz, vx, vy, vz, tl, t) {
    const dn = qx * vx + qy * vy + qz * vz;
    const rx = 2 * dn * qx - vx, ry = 2 * dn * qy - vy, rz = 2 * dn * qz - vz;
    // Raum: dunkel, Decke leicht heller, Strukturen (Truss, Wände)
    const wave = Math.sin(rx * 4.6 + ry * 1.9 + 1.3) * Math.sin(ry * 3.8 - rz * 2.6 + t * 0.03);
    const w2 = Math.max(0, wave);
    let room = 0.004 + 0.28 * w2 * w2 + 0.05 * Math.max(0, ry)
      + 0.03 * Math.pow((Math.sin(rx * 19 + rz * 11) + 1) * 0.5, 3) + 0.012 * (Math.sin(ry * 23 - rx * 7) + 1);
    let r = room * 0.94, g = room * 0.96, b = room * 1.1;
    if (tl.hue < 0.03) { r += room * 0.9; b += room * 0.4; }
    else if (tl.hue > 0.97) { g += room * 0.3; b += room * 1.0; }
    let peak = 0;
    for (let k = 0; k < LIGHTS.length; k++) {
      const L = LIGHTS[k];
      const d = rx * L.d[0] + ry * L.d[1] + rz * L.d[2];
      if (d < 0.86) continue;
      const v = Math.pow(d, L.k) * L.s;
      if (v < 0.002) continue;
      r += L.c[0] * v; g += L.c[1] * v; b += L.c[2] * v;
      if (v > peak) peak = v;
    }
    out[0] = r; out[1] = g; out[2] = b; out[3] = peak;
    return out;
  }

  function draw(now) {
    const t = now / 1000;
    mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;

    // Hintergrund (nur sichtbar, wo die Kugel das Bild nicht füllt)
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const bg = ctx.createRadialGradient(W * 0.1, 0, 0, W * 0.1, 0, Math.max(W, H));
    bg.addColorStop(0, '#1a171d'); bg.addColorStop(1, '#050506');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    for (const s of spots) {
      const x = ((s.x + phi * 0.9 * s.sp) % 1) * (W + 60) - 30;
      const y = s.y * H + Math.sin(phi * 3 + s.ph) * 12;
      ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(t * 1.3 + s.ph));
      const sz = s.s * 2;
      ctx.drawImage(dot, x - sz, y - sz, sz * 2, sz * 2);
    }
    ctx.globalAlpha = 1;

    // Kugel-Grund = Fugen
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#08080a';
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.002, 0, Math.PI * 2); ctx.fill();

    // Rotationsmatrix (Neigung der Achse + Parallax)
    const ax = 0.34 + my * 0.04, az = 0.42 + mx * 0.04;
    const cax = Math.cos(ax), sax = Math.sin(ax), caz = Math.cos(az), saz = Math.sin(az);
    const m00 = caz, m01 = -saz * cax, m02 = saz * sax;
    const m10 = saz, m11 = caz * cax, m12 = -caz * sax;
    const m20 = 0, m21 = sax, m22 = cax;

    LIGHTS[4].d = norm(Math.sin(t * 0.35) * 0.75, 0.25 + 0.3 * Math.cos(t * 0.22), 0.65);

    const cphi = Math.cos(phi), sphi = Math.sin(phi);
    const flares = [];
    const pad = 60;
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';

    for (let i = 0; i < tiles.length; i++) {
      const tl = tiles[i];
      const sl0 = Math.sin(tl.lon), cl0 = Math.cos(tl.lon);
      const s = sl0 * cphi + cl0 * sphi, c = cl0 * cphi - sl0 * sphi;
      const bx = tl.cl * s, by = tl.sl, bz = tl.cl * c;
      const pz = m20 * bx + m21 * by + m22 * bz;
      if (pz < 0.02) continue;
      const px = m00 * bx + m01 * by + m02 * bz;
      const py = m10 * bx + m11 * by + m12 * bz;
      const sx = cx + R * px, sy = cy - R * py;
      if (sx < -pad || sx > W + pad || sy < -pad || sy > H + pad) continue;

      // Tangenten Ost / Nord (Welt), leicht verdreht → unregelmässig verlegt
      const ex0 = c, ez0 = -s;
      const nx0 = -tl.sl * s, ny0 = tl.cl, nz0 = -tl.sl * c;
      let ex = m00 * ex0 + m02 * ez0, ey = m10 * ex0 + m12 * ez0, ez = m20 * ex0 + m22 * ez0;
      let nx = m00 * nx0 + m01 * ny0 + m02 * nz0, ny = m10 * nx0 + m11 * ny0 + m12 * nz0, nz = m20 * nx0 + m21 * ny0 + m22 * nz0;
      const ex2 = ex * tl.cr + nx * tl.sr, ey2 = ey * tl.cr + ny * tl.sr, ez2 = ez * tl.cr + nz * tl.sr;
      nx = -ex * tl.sr + nx * tl.cr; ny = -ey * tl.sr + ny * tl.cr; nz = -ez * tl.sr + nz * tl.cr;
      ex = ex2; ey = ey2; ez = ez2;

      // verkippte Normale
      let qx = px + ex * tl.jx + nx * tl.jy, qy = py + ey * tl.jx + ny * tl.jy, qz = pz + ez * tl.jx + nz * tl.jy;
      const ql = Math.hypot(qx, qy, qz); qx /= ql; qy /= ql; qz /= ql;

      // Ecken (Welt) A = +E+N, C = −E−N → Blickvektoren der Kamera für Verlauf
      const hw = tl.hw, hh = tl.hh;
      const axw = px + ex * hw + nx * hh, ayw = py + ey * hw + ny * hh, azw = pz + ez * hw + nz * hh;
      const cxw = px - ex * hw - nx * hh, cyw = py - ey * hw - ny * hh, czw = pz - ez * hw - nz * hh;
      let v = norm(-axw * 0.35, -ayw * 0.35, CAM - azw);
      shade(qx, qy, qz, v[0], v[1], v[2], tl, t);
      const shadeF = (0.5 + 0.5 * Math.sqrt(pz)) * tl.tone;
      const ar = out[0] * shadeF, ag = out[1] * shadeF, ab = out[2] * shadeF, pa = out[3];
      v = norm(-cxw * 0.35, -cyw * 0.35, CAM - czw);
      shade(qx, qy, qz, v[0], v[1], v[2], tl, t);
      const sh = 1 + tl.sheen;
      const cr = out[0] * shadeF * sh, cg = out[1] * shadeF * sh, cb = out[2] * shadeF * sh, pc = out[3];

      // Bildschirm-Ecken
      const hwR = hw * R, hhR = hh * R;
      const ax1 = ex * hwR, ay1 = ey * hwR, bx1 = nx * hhR, by1 = ny * hhR;
      const x1 = sx + ax1 + bx1, y1 = sy - ay1 - by1;   // A (+E+N)
      const x2 = sx - ax1 + bx1, y2 = sy + ay1 - by1;   // (−E+N)
      const x3 = sx - ax1 - bx1, y3 = sy + ay1 + by1;   // C (−E−N)
      const x4 = sx + ax1 - bx1, y4 = sy - ay1 + by1;   // (+E−N)

      const grad = ctx.createLinearGradient(x1, y1, x3, y3);
      grad.addColorStop(0, `rgb(${tm(ar)},${tm(ag)},${tm(ab)})`);
      grad.addColorStop(1, `rgb(${tm(cr)},${tm(cg)},${tm(cb)})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4);
      ctx.closePath();
      ctx.fill();

      // Glaskante: Licht oben/links, Schatten unten/rechts
      const lum = Math.min(1, (ar + ag + ab + cr + cg + cb) / 3);
      ctx.strokeStyle = `rgba(255,255,255,${0.05 + lum * 0.35})`;
      ctx.beginPath(); ctx.moveTo(x4, y4); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.stroke();

      const peak = Math.max(pa, pc);
      if (peak > 0.9 && pz > 0.1) flares.push({ x: sx, y: sy, v: peak, ph: tl.ph });
    }

    // Funkeln
    ctx.globalCompositeOperation = 'lighter';
    flares.sort((a, b) => b.v - a.v);
    const maxF = W < 700 ? 16 : 28;
    const base = W < 700 ? 90 : 140;
    for (let i = 0; i < Math.min(maxF, flares.length); i++) {
      const f = flares[i];
      const tw = 0.6 + 0.4 * Math.sin(t * 4 + f.ph * 3);
      const sz = base * Math.min(2.2, 0.35 + f.v * 0.3) * tw;
      ctx.globalAlpha = Math.min(1, 0.45 + f.v * 0.22);
      ctx.drawImage(flare, f.x - sz / 2, f.y - sz / 2, sz, sz);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // oberer Teil der Kugel läuft ins Schwarz aus
    const fade = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    fade.addColorStop(0, 'rgba(5,5,6,1)');
    fade.addColorStop(0.3, 'rgba(5,5,6,0.82)');
    fade.addColorStop(0.65, 'rgba(5,5,6,0.35)');
    fade.addColorStop(1, 'rgba(5,5,6,0)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H * 0.55);
  }

  function loop(now) {
    const dt = Math.min(50, now - (last || now)); last = now;
    phi += dt * 0.00004;
    draw(now);
    if (running) rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    tmx = (e.clientX / W - 0.5) * 2; tmy = (e.clientY / H - 0.5) * 2;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) api.pause(); else if (api.wanted) api.play();
  });

  const api = {
    wanted: true,
    play() { this.wanted = true; if (reduceMotion || running) return; running = true; last = 0; rafId = requestAnimationFrame(loop); },
    pause() { running = false; cancelAnimationFrame(rafId); },
    stop() { this.wanted = false; this.pause(); },
  };
  window.discoBall = api;

  resize();
  if (reduceMotion) { running = false; draw(performance.now()); }
  else rafId = requestAnimationFrame(loop);
})();

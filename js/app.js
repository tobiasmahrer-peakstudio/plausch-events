(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const body = document.body;

  /* ---------- Events (Daten in js/events.js) ---------- */
  const EVENTS = window.PLAUSCH_EVENTS || [];
  const DEF = window.PLAUSCH_DEFAULTS || { infos: [], qa: [] };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function renderEvents() {
    const grid = $('#eventsGrid');
    // alle Events einheitlich: Cover, Art, Name, Link zur Highlight-Seite
    grid.innerHTML = EVENTS.map((e) => `
        <article class="ev${e.locked ? ' ev--locked' : ''}" style="--hue:${e.hue}">
          ${e.locked ? '' : `<a class="ev__link" href="#event/${e.slug}" aria-label="${e.upcoming ? 'Tickets & Infos zu' : 'Highlights von'} ${esc(e.name)} ansehen"></a>`}
          <div class="ev__art">
            ${e.upcoming ? `<div class="ev__ticker" aria-label="Upcoming"><div class="ev__ticker-track" aria-hidden="true">${'<span>Upcoming</span><i>✦</i>'.repeat(12)}</div></div>` : ''}
            <div class="ev__blur" style="background-image:url('${e.cover}')"></div>
            <img class="ev__cover" src="${e.cover}" alt="Cover ${esc(e.name)}" loading="lazy">
          </div>
          <div class="ev__body">
            <span class="ev__tag">${[e.tag, (e.date || '').replace(/^\w{2},\s*/, '')].filter(Boolean).map(esc).join(' · ')}</span>
            <h3 class="ev__name">${esc(e.name)}</h3>
          </div>
        </article>`).join('');
  }
  renderEvents();

  /* ---------- Event-Highlights (Detailseite) ---------- */
  // Titel im Stil des jeweiligen Event-Sujets
  function eventTitle(e) {
    if (e.font === 'ransom') {
      const looks = ['r1', 'r2', 'r3', 'r4', 'r5'];
      let k = 0;
      return [...e.name].map((ch) => (ch === ' ' ? '<span class="rs"> </span>' : `<span class="rl ${looks[(k++ * 3) % looks.length]}">${esc(ch)}</span>`)).join('');
    }
    return esc(e.name);
  }

  /* ---------- Album-Fotos ----------
     Echte Fotos aus e.album (ohne Sujet) + optional e.albumDemo Platzhalter
     mit Farbverlauf im Event-Farbton, damit man die Aufteilung sieht. */
  function hexHsl(hex) {
    const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0; const sat = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, sat * 100, l * 100];
  }
  function demoPhoto(hue, i) {
    const [h, sat] = hexHsl(hue);
    const R = [[3, 4], [4, 3], [1, 1], [2, 3], [3, 2], [4, 5]][(i * 7 + 3) % 6];
    const W = R[0] * 300, H = R[1] * 300;
    const a = `hsl(${(h + (i * 23) % 60 - 30 + 360) % 360} ${Math.min(90, sat + 10)}% ${38 + (i * 13) % 24}%)`;
    const b = `hsl(${(h + 200 + (i * 17) % 80) % 360} ${Math.max(25, sat - 20)}% ${10 + (i * 11) % 14}%)`;
    const ang = (i * 47) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" gradientTransform="rotate(${ang} .5 .5)"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><radialGradient id="r" cx="${20 + (i * 29) % 60}%" cy="${15 + (i * 19) % 50}%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#r)"/></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  function albumOf(e) {
    const real = (e.album || []).filter((src) => src !== e.cover);
    return real.concat(Array.from({ length: e.albumDemo || 0 }, (_, i) => demoPhoto(e.hue, i)));
  }

  /* ---------- Album-Unterseite ---------- */
  function renderAlbum(e) {
    const album = albumOf(e);
    const dm = (e.date || '').match(/^(\w{2}),\s*(.+)$/);
    const el = $('#panel-event');
    el.style.setProperty('--hue', e.hue);
    el.style.setProperty('--ebg', e.bg || '#0d0d0f');
    el.dataset.font = e.font || 'sans';
    $('#eventDetail').innerHTML = `
      <a class="evd-back" href="#event/${e.slug}"><span aria-hidden="true">←</span> Zurück zu ${esc(e.name)}</a>
      <header class="alb-head">
        <span class="evd-tag">Event Bilder${e.date ? ' · ' + esc(dm ? dm[2] : e.date) : ''}</span>
        <h2 class="evd-title">${eventTitle(e)}</h2>
        <p class="alb-count">${album.length} ${album.length === 1 ? 'Foto' : 'Fotos'}</p>
      </header>
      ${album.length ? `
      <div class="alb-grid">
        ${album.map((src, n) => `<button type="button" class="alb-ph" data-lb="${n}"><img src="${src}" alt="Foto ${n + 1} von ${esc(e.name)}" loading="lazy"></button>`).join('')}
      </div>` : '<p class="evd-muted">Die Fotos folgen in Kürze.</p>'}
      <a class="evd-back alb-back" href="#event/${e.slug}"><span aria-hidden="true">←</span> Zurück zu ${esc(e.name)}</a>
      <footer class="panel__foot"><span>© PLAUSCH Events</span></footer>`;
    $$('[data-lb]', el).forEach((b) => b.addEventListener('click', () => openLightbox(album, +b.dataset.lb, e.name)));
  }

  function renderEventDetail(e) {
    // Liste ist neu → alt sortiert: „Nächstes“ = neueres Event, „Vorheriges“ = älteres
    // Gesperrte Events werden angezeigt, sind aber nicht klickbar
    const idx = EVENTS.indexOf(e);
    const prev = EVENTS[idx + 1];
    const next = EVENTS[idx - 1];
    // Sujet nicht wiederholen: es ist schon in der Übersicht zu sehen
    const album = albumOf(e);
    const infos = e.infos || DEF.infos;
    const dm = (e.date || '').match(/^(\w{2}),\s*(.+)$/);
    // Infos als Dropdown: [Titel, Text] oder einfacher Text
    const infoItems = infos.map((t) => (Array.isArray(t) ? t : [t, '']));

    const acts = e.acts && e.acts.length ? e.acts : null;
    const up = !!e.upcoming;
    const nav = (up
      ? [acts && ['acts', 'Line-up'], ['wichtig', 'Wichtige Infos'], ['anreise', 'Ort & Anreise']]
      : [acts && ['acts', 'Line-up'], ['aftermovie', 'Aftermovie'], ['album', 'Album'], e.press && ['presse', 'Nachbericht'], !e.noInfos && ['infos', 'Infos'], !e.noInfos && ['anreise', 'Ort & Anreise']]).filter(Boolean);

    const el = $('#panel-event');
    el.style.setProperty('--hue', e.hue);
    el.style.setProperty('--ebg', e.bg || '#0d0d0f');
    el.dataset.font = e.font || 'sans';

    $('#eventDetail').innerHTML = `
      <a class="evd-back" href="#events"><span aria-hidden="true">←</span> Alle Events</a>

      <header class="evd-hero">
        <div class="evd-hero__bg" style="background-image:url('${e.cover}')" aria-hidden="true"></div>
        <div class="evd-hero__text">
          <span class="evd-tag">${[e.tag, dm ? dm[2] : e.date].filter(Boolean).map(esc).join(' · ')}</span>
          <h2 class="evd-title">${eventTitle(e)}</h2>
          ${e.intro ? `<p class="evd-intro">${esc(e.intro)}</p>` : ''}
          ${up ? '<a class="evd-album__more evd-ticket" href="#tickets"><span>Tickets sichern</span><span aria-hidden="true">→</span></a>' : ''}
        </div>
      </header>

      ${up ? '' : `<nav class="evd-nav" aria-label="Inhalt">${nav.map(([id, label]) => `<a href="#evd-${id}" data-jump="evd-${id}">${label}</a>`).join('')}</nav>`}

      ${acts ? `
      <section class="evd-sec" id="evd-acts">
        <h3 class="evd-h">Unser Line-up</h3>
        <ul class="team__grid evd-lineup">
          ${acts.map((a) => `
            <li class="member" style="--hue:${e.hue}">
              <div class="member__img" aria-hidden="true">${a.img ? `<img class="member__photo" src="${a.img}" alt="" loading="lazy">` : '<canvas class="member__ball"></canvas>'}</div>
              <p class="member__name">${esc(a.name)}</p>
              <p class="member__role">${esc(a.label || a.role || '')}</p>
            </li>`).join('')}
        </ul>
      </section>` : ''}

      ${up ? '' : `
      <section class="evd-sec" id="evd-aftermovie">
        <h3 class="evd-h">Aftermovie</h3>
        <button type="button" class="evd-movie" data-movie>
          <span class="evd-movie__bg" style="background-image:url('${album[0] || e.cover}')" aria-hidden="true"></span>
          <span class="evd-movie__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
          <span class="evd-movie__label">Aftermovie ${esc(e.name)}</span>
        </button>
      </section>

      <section class="evd-sec" id="evd-album">
        <h3 class="evd-h">Event Bilder</h3>
        ${album.length ? `
        <div class="evd-album">
          ${album.map((src, n) => `<button type="button" class="evd-ph" data-lb="${n}"><img src="${src}" alt="Foto ${n + 1} von ${esc(e.name)}" loading="lazy"></button>`).join('')}
        </div>
        <a class="evd-album__more" href="${e.albumUrl || `#event/${e.slug}/album`}"${e.albumUrl ? ' target="_blank" rel="noopener"' : ''}><span>Alle Fotos ansehen</span><span aria-hidden="true">→</span></a>`
        : '<p class="evd-muted">Die Fotos folgen in Kürze.</p>'}
      </section>`}

      ${e.press ? `
      <section class="evd-sec" id="evd-presse">
        <h3 class="evd-h">Nachbericht</h3>
        <a class="evd-press" href="${e.press.url}" target="_blank" rel="noopener">
          <span class="evd-press__src">${esc(e.press.source)} · ${esc(e.press.date)}</span>
          <span class="evd-press__t">${esc(e.press.title)}</span>
          <span class="evd-press__txt">${esc(e.press.teaser)}</span>
          <span class="evd-press__more">Artikel lesen ↗${e.press.author ? `<small>Text: ${esc(e.press.author)}</small>` : ''}</span>
        </a>
      </section>` : ''}

      ${e.noInfos ? '' : `
      <section class="evd-sec" id="evd-wichtig">
        <h3 class="evd-h">Wichtige Infos</h3>
        <ul class="evd-list evd-infolist">${infoItems.map(([t, d]) => `<li><b>${esc(t)}</b>${d ? ` – ${esc(d)}` : ''}</li>`).join('')}</ul>
      </section>

      <section class="evd-sec" id="evd-anreise">
        <h3 class="evd-h">Ort &amp; Anreise</h3>
        ${e.travel ? `
        <ul class="evd-list evd-infolist">
          <li><b>Adresse</b> – ${esc(e.travel.address)} · <a class="evd-maplink" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.travel.map || e.travel.address)}" target="_blank" rel="noopener">Route ↗</a></li>
          ${e.travel.oev ? `<li><b>Mit dem ÖV</b> – ${esc(e.travel.oev)}</li>` : ''}
          ${e.travel.auto ? `<li><b>Mit dem Auto</b> – ${esc(e.travel.auto)}</li>` : ''}
        </ul>` : '<p class="evd-muted">Ort und Anreise werden mit der Eventankündigung bekanntgegeben.</p>'}
      </section>`}

      <nav class="evd-pager" aria-label="Weitere Events">
        ${prev
          ? (prev.locked
            ? `<div class="evd-pager__off"><small>← Vorheriges Event</small><span>${esc(prev.name)}</span></div>`
            : `<a href="#event/${prev.slug}" style="--h:${prev.hue}"><small>← Vorheriges Event</small><span>${esc(prev.name)}</span></a>`)
          : `<a href="#events"><small>← Übersicht</small><span>Alle Events</span></a>`}
        ${next && !next.locked
          ? `<a href="#event/${next.slug}" style="--h:${next.hue}"><small>Nächstes Event →</small><span>${esc(next.name)}</span></a>`
          : `<div class="evd-pager__soon"><small>Nächstes Event</small><span>Coming Soon</span></div>`}
      </nav>
      <footer class="panel__foot"><span>© PLAUSCH Events</span></footer>`;

    // Album → Lightbox
    $$('[data-lb]', el).forEach((b) => b.addEventListener('click', () => openLightbox(album, +b.dataset.lb, e.name)));
    // Aftermovie-Platzhalter
    $('[data-movie]', el)?.addEventListener('click', () => say('Aftermovie folgt – wird hier direkt abgespielt.'));
    // Sprungmarken innerhalb der Seite
    $$('[data-jump]', el).forEach((a) => a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const t = document.getElementById(a.dataset.jump);
      if (t && t.tagName === 'DETAILS') t.open = true; // Dropdown gleich aufklappen
      t?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  /* ---------- Lightbox ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = `
    <button type="button" class="lb-close" aria-label="Schliessen">×</button>
    <button type="button" class="lb-nav lb-prev" aria-label="Vorheriges Foto">‹</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button type="button" class="lb-nav lb-next" aria-label="Nächstes Foto">›</button>`;
  document.body.appendChild(lb);
  let lbList = [], lbI = 0, lbName = '';
  function lbShow() {
    $('img', lb).src = lbList[lbI];
    $('img', lb).alt = `Foto ${lbI + 1} von ${lbName}`;
    $('figcaption', lb).textContent = `${lbName} · ${lbI + 1} / ${lbList.length}`;
    lb.classList.toggle('lb--single', lbList.length < 2);
  }
  function openLightbox(list, i, name) {
    lbList = list; lbI = i; lbName = name;
    lbShow();
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('is-on'));
    $('.lb-close', lb).focus();
  }
  function closeLightbox() { lb.classList.remove('is-on'); setTimeout(() => { lb.hidden = true; }, 250); }
  $('.lb-close', lb).addEventListener('click', closeLightbox);
  $('.lb-prev', lb).addEventListener('click', () => { lbI = (lbI - 1 + lbList.length) % lbList.length; lbShow(); });
  $('.lb-next', lb).addEventListener('click', () => { lbI = (lbI + 1) % lbList.length; lbShow(); });
  lb.addEventListener('click', (ev) => { if (ev.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (ev) => {
    if (lb.hidden) return;
    if (ev.key === 'Escape') closeLightbox();
    if (ev.key === 'ArrowLeft') $('.lb-prev', lb).click();
    if (ev.key === 'ArrowRight') $('.lb-next', lb).click();
  });

  /* ---------- Menü ---------- */
  const menu = $('#menu');
  const menuBtn = $('#menuBtn');

  function setOrigin() {
    const r = menuBtn.getBoundingClientRect();
    const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
    menu.style.setProperty('--ox', ox + 'px');
    menu.style.setProperty('--oy', oy + 'px');
    menu.style.setProperty('--rad', Math.hypot(Math.max(ox, innerWidth - ox), Math.max(oy, innerHeight - oy)) + 20 + 'px');
  }

  function openMenu() {
    setOrigin();
    body.classList.add('menu-open');
    menu.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Menü schliessen');
    setTimeout(() => $('.menu__list a', menu)?.focus({ preventScroll: true }), 350);
  }
  function closeMenu() {
    body.classList.remove('menu-open');
    menu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Menü öffnen');
  }
  menuBtn.addEventListener('click', () => (body.classList.contains('menu-open') ? closeMenu() : openMenu()));
  window.addEventListener('resize', setOrigin);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) { closeMenu(); menuBtn.focus(); }
    // Fokus im Menü halten
    if (e.key === 'Tab' && body.classList.contains('menu-open')) {
      const f = [menuBtn, ...$$('a', menu)];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- Routing (Hash) ---------- */
  const PANELS = ['events', 'tickets', 'partner', 'qa', 'jobs', 'kontakt'];
  let current = null;     // sichtbares Panel
  let currentKey = null;  // vollständige Route (z. B. event/eclipse-ride)

  function show(route) {
    // Unteradresse wie kontakt/formular → Panel öffnen und zum Abschnitt scrollen
    let anchor = null;
    if (route.startsWith('kontakt/')) { anchor = route.slice(8); route = 'kontakt'; }
    let next = PANELS.includes(route) ? route : null;
    let ev = null;
    if (route.startsWith('event/')) {
      const [slug, sub] = route.slice(6).split('/');
      ev = EVENTS.find((x) => x.slug === slug && !x.locked);
      if (ev) { next = 'event'; ev = { e: ev, album: sub === 'album' }; }
    }
    const key = next ? route : null;
    const toAnchor = () => {
      const t = anchor && document.getElementById('kontakt-' + anchor);
      if (!t) return;
      const sc = $('[data-panel="kontakt"] .panel__scroll');
      sc.scrollTo({ top: t.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 90, behavior: 'smooth' });
    };
    if (key === currentKey) { closeMenu(); toAnchor(); return; }
    const prevEl = current && $(`[data-panel="${current}"]`);
    const nextEl = next && $(`[data-panel="${next}"]`);

    if (ev) { if (ev.album) renderAlbum(ev.e); else renderEventDetail(ev.e); }
    if (next === 'kontakt') requestAnimationFrame(() => { drawTeamBalls(); ballsDrawn = true; });
    if (next === 'event') requestAnimationFrame(() => { drawTeamBalls(); ballsDrawn = true; });

    if (prevEl && prevEl !== nextEl) {
      prevEl.classList.remove('is-in');
      setTimeout(() => { if (!prevEl.classList.contains('is-in')) prevEl.hidden = true; }, 600);
    }
    if (nextEl) {
      nextEl.hidden = false;
      $('.panel__scroll', nextEl).scrollTop = 0;
      if (prevEl === nextEl) { nextEl.classList.remove('is-in'); void nextEl.offsetWidth; }
      requestAnimationFrame(() => requestAnimationFrame(() => nextEl.classList.add('is-in')));
      if (anchor) setTimeout(toAnchor, 450);
    }
    current = next;
    currentKey = key;
    body.dataset.view = next || 'home';
    const menuKey = next === 'event' ? 'events' : next === 'jobs' ? 'kontakt' : next;
    $$('.menu__list a').forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + menuKey));
    const label = ev ? (ev.album ? `Event Bilder ${ev.e.name}` : ev.e.name) : nextEl && (nextEl.querySelector('h2')?.textContent || nextEl.getAttribute('aria-label'));
    document.title = next ? `${label} — PLAUSCH Events` : 'PLAUSCH Events — yes, we event.';

    // Discokugel nur auf dem Startbild animieren
    if (window.discoBall) {
      if (next) setTimeout(() => current && window.discoBall.stop(), 650);
      else window.discoBall.play();
    }
    closeMenu();
  }

  const route = () => show(location.hash.replace('#', ''));
  window.addEventListener('hashchange', route);
  $('.brand').addEventListener('click', (e) => {
    e.preventDefault();
    if (location.hash) history.pushState('', '', location.pathname + location.search);
    show('');
  });
  // gleiche Route erneut anklicken → Menü schliessen
  $$('.menu__list a').forEach((a) => a.addEventListener('click', () => {
    if (a.getAttribute('href') === '#' + current) closeMenu();
  }));
  route();

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  let toastT;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('is-on'), 2800);
  }

  /* ---------- Team: Füllbild = kleine Discokugel im Farbton der Person ---------- */
  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
  function drawMiniBall(cv, hue) {
    const box = cv.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = box.width, H = box.height;
    if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const [hr, hg, hb] = hexRgb(hue);
    const hueCss = (a) => `rgba(${hr * 255 | 0},${hg * 255 | 0},${hb * 255 | 0},${a})`;

    // Hintergrund: dunkel mit Farbschein
    c.fillStyle = '#0e0e10'; c.fillRect(0, 0, W, H); // = Kartenfarbe, damit das Bild nahtlos ausläuft
    const R = Math.min(W, H) * 0.36, cx = W / 2, cy = H * 0.56;
    let g = c.createRadialGradient(cx, cy, R * 0.5, cx, cy, Math.min(W, H) * 0.62);
    g.addColorStop(0, hueCss(0.5)); g.addColorStop(0.55, hueCss(0.18)); g.addColorStop(1, hueCss(0));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // Lichtpunkte an der Wand
    let seed = hue.length * 97 + hr * 1000;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed % 1000) / 1000; };
    for (let i = 0; i < 40; i++) {
      const x = rnd() * W, y = rnd() * H, r = 1 + rnd() * 2.2;
      c.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.55)' : hueCss(0.8);
      c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    }
    // Aufhängung
    c.strokeStyle = 'rgba(200,200,210,.5)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, cy - R); c.stroke();
    c.fillStyle = '#6d6d75'; c.fillRect(cx - 4, cy - R - 5, 8, 6);

    // Kugel
    c.fillStyle = '#050506'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
    const rows = 20, tilt = 0.32, ct = Math.cos(tilt), st = Math.sin(tilt);
    const L = [
      { d: [-0.5, 0.55, 0.67], col: [1, 0.97, 0.92], k: 60, s: 2.2 },
      { d: [0.62, -0.35, 0.7], col: [hr, hg, hb], k: 10, s: 1.3 },
      { d: [0.35, 0.6, 0.72], col: [hr, hg, hb], k: 30, s: 1.1 },
    ].map((l) => { const n = Math.hypot(...l.d); l.d = l.d.map((v) => v / n); return l; });
    const tm = (v) => Math.round((1 - Math.exp(-v * 1.9)) * 255);
    const flares = [];
    for (let i = 0; i < rows; i++) {
      const lat = -Math.PI / 2 + (i + 0.5) * Math.PI / rows;
      const cl = Math.cos(lat), sl = Math.sin(lat);
      const n = Math.max(4, Math.round(rows * 2 * cl));
      const hw = Math.PI / n * cl * 0.86, hh = Math.PI / rows * 0.43;
      for (let k = 0; k < n; k++) {
        const lon = (k + (i % 2) * 0.5) * 2 * Math.PI / n + 0.4;
        const s0 = Math.sin(lon), c0 = Math.cos(lon);
        // Kugelpunkt, um X geneigt
        const bx = cl * s0, by0 = sl, bz0 = cl * c0;
        const by = by0 * ct - bz0 * st, bz = by0 * st + bz0 * ct;
        if (bz < 0.03) continue;
        const ex = c0, ey = 0 * ct - (-s0) * st, ez = 0 * st + (-s0) * ct;
        const nx0 = -sl * s0, ny0 = cl, nz0 = -sl * c0;
        const nx = nx0, ny = ny0 * ct - nz0 * st, nz = ny0 * st + nz0 * ct;
        // leicht verkippte Normale → Funkeln
        const jx = (rnd() - 0.5) * 0.16, jy = (rnd() - 0.5) * 0.16;
        let qx = bx + ex * jx + nx * jy, qy = by + ey * jx + ny * jy, qz = bz + ez * jx + nz * jy;
        const ql = Math.hypot(qx, qy, qz); qx /= ql; qy /= ql; qz /= ql;
        const rx = 2 * qz * qx, ry = 2 * qz * qy, rz = 2 * qz * qz - 1;
        const room = 0.05 + 0.1 * Math.max(0, Math.sin(rx * 5 + ry * 2) * Math.sin(ry * 4 - rz * 3)) + 0.04 * Math.max(0, ry);
        let r = room, gg = room, b = room * 1.08, peak = 0;
        for (const l of L) {
          const d = rx * l.d[0] + ry * l.d[1] + rz * l.d[2];
          if (d <= 0) continue;
          const v = Math.pow(d, l.k) * l.s;
          r += l.col[0] * v; gg += l.col[1] * v; b += l.col[2] * v;
          if (l.k >= 60 && v > peak) peak = v;
        }
        const tone = (0.55 + 0.45 * Math.sqrt(bz)) * (0.7 + rnd() * 0.6);
        c.fillStyle = `rgb(${tm(r * tone)},${tm(gg * tone)},${tm(b * tone)})`;
        const sx = cx + R * bx, sy = cy - R * by;
        const ax = ex * hw * R, ay = ey * hw * R, px = nx * hh * R, py = ny * hh * R;
        c.beginPath();
        c.moveTo(sx + ax + px, sy - ay - py); c.lineTo(sx - ax + px, sy + ay - py);
        c.lineTo(sx - ax - px, sy + ay + py); c.lineTo(sx + ax - px, sy - ay + py);
        c.closePath(); c.fill();
        if (peak > 1.2) flares.push([sx, sy, peak]);
      }
    }
    // Glanzkante
    g = c.createRadialGradient(cx - R * 0.35, cy - R * 0.4, 0, cx - R * 0.35, cy - R * 0.4, R * 0.9);
    g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
    // Sterne auf den hellsten Plättchen
    c.globalCompositeOperation = 'lighter';
    flares.sort((a, b) => b[2] - a[2]).slice(0, 4).forEach(([x, y, v]) => {
      const sz = 10 + Math.min(18, v * 6);
      const rg = c.createRadialGradient(x, y, 0, x, y, sz);
      rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(0.25, 'rgba(255,255,255,.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = rg; c.fillRect(x - sz, y - sz, sz * 2, sz * 2);
      c.fillStyle = 'rgba(255,255,255,.8)';
      c.fillRect(x - sz * 1.4, y - 0.6, sz * 2.8, 1.2); c.fillRect(x - 0.6, y - sz * 1.4, 1.2, sz * 2.8);
    });
    c.globalCompositeOperation = 'source-over';
  }
  function drawTeamBalls() { $$('.member').forEach((m) => { const cv = $('.member__ball', m); if (cv) drawMiniBall(cv, m.style.getPropertyValue('--hue').trim()); }); }
  let ballsDrawn = false, teamT;
  window.addEventListener('resize', () => { clearTimeout(teamT); teamT = setTimeout(() => { if (ballsDrawn) drawTeamBalls(); }, 200); });

  /* ---------- Team: E-Mail & WhatsApp ---------- */
  $$('.member__btn').forEach((a) => {
    const mail = a.dataset.mail, wa = a.dataset.wa;
    if (mail) a.href = `mailto:${mail}`;
    else if (wa) { a.href = `https://wa.me/${wa.replace(/\D/g, '')}`; a.target = '_blank'; a.rel = 'noopener'; }
    else a.addEventListener('click', (e) => { e.preventDefault(); say('Direktkontakt folgt bald – bis dahin gerne über das Formular.'); });
  });

  /* ---------- Kontaktformular ---------- */
  const form = $('#contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('#formErr');
    const bad = $$('[required]', form).filter((f) => (f.type === 'checkbox' ? !f.checked : !f.value.trim()) || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value)));
    $$('.field', form).forEach((f) => f.classList.remove('is-bad'));
    bad.forEach((f) => f.closest('.field')?.classList.add('is-bad'));
    if (bad.length) {
      err.textContent = bad.some((f) => f.type === 'email' && f.value) ? 'Bitte eine gültige E-Mail-Adresse angeben.' : 'Bitte alle Pflichtfelder ausfüllen.';
      bad[0].focus();
      return;
    }
    err.textContent = '';
    // TODO: an Formular-Backend / Mailservice anbinden
    form.hidden = true;
    $('#formOk').hidden = false;
  });
})();

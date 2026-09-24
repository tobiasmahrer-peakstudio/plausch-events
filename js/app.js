(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const body = document.body;
  const IG = 'https://www.instagram.com/';

  /* ---------- Events (gemäss Instagram-Highlights & Posts) ---------- */
  const EVENTS = [
    {
      name: 'Eclipse Ride', feature: true, poster: 'assets/ig/eclipse-poster.jpg',
      date: 'Mi 12.08.2026', place: 'Glacier 3000', tag: 'Sunset Session',
      lines: ['Sound by Blueäm & Rici', '18:45 ↑ · 21:45 ↓'],
      hue: '#e0773b', ig: 'stories/highlights/18553329238073319/',
    },
    {
      name: 'Plausch × Menuhin', feature: true, poster: 'assets/ig/menuhin-poster.jpg',
      date: 'Do 06.08.2026', place: 'Berghaus Eggli, Terrasse', tag: 'Mountain Spirit',
      lines: ["The Swingin' Hermlins", 'Natascha Polké', 'Kellerkind (Stil vor Talent)'],
      artists: ['assets/ig/artist-hermlins.jpg', 'assets/ig/artist-polke.jpg', 'assets/ig/artist-kellerkind.jpg'],
      hue: '#f0662c', ig: 'stories/highlights/18081236786302810/',
    },
    { name: 'ON:TOP', sub: 'Daydance', cover: 'assets/ig/hl_ontop.jpg', tag: 'Daydance', hue: '#7fa3d6', ig: 'stories/highlights/17902994094402050/' },
    { name: 'Montreux Jazz', cover: 'assets/ig/hl_montreux.jpg', date: '07.–18.07.', place: 'Montreux', tag: 'Festival', hue: '#e98a3c', ig: 'stories/highlights/17857883895680131/' },
    { name: 'Wasserngrat', cover: 'assets/ig/hl_wasserngrat.jpg', place: 'Gstaad', tag: 'Mountain Party', hue: '#5f8f4e', ig: 'stories/highlights/18127207801549665/' },
    { name: 'Pasa Daydance', cover: 'assets/ig/hl_pasa.jpg', tag: 'Winter Daydance', hue: '#a9b8c8', ig: 'stories/highlights/17872967625523808/' },
    { name: 'The Old Station', cover: 'assets/ig/hl_oldstation.jpg', tag: 'Night', hue: '#9fb6cc', ig: 'stories/highlights/18082267187174222/' },
    { name: 'Force of Nature', cover: 'assets/ig/hl_force.jpg', place: 'Gstaad', tag: '× Menuhin Festival', hue: '#8e2a6a', ig: 'stories/highlights/18070739209817696/' },
    { name: 'ON:TOP 25', sub: 'Daydance', cover: 'assets/ig/hl_ontop25.jpg', date: '2025', tag: 'Daydance', hue: '#9ccc3c', ig: 'stories/highlights/18079050382727539/' },
    { name: 'Jungle Fever', cover: 'assets/ig/hl_jungle.jpg', tag: 'Night', hue: '#1f5a45', ig: 'stories/highlights/18076498672986033/' },
  ];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function renderEvents() {
    const grid = $('#eventsGrid');
    // alle Events einheitlich: Cover, Art, Name, Link zu den Highlights
    grid.innerHTML = EVENTS.map((e) => {
      const cover = e.cover || e.poster;
      return `
        <article class="ev" style="--hue:${e.hue}">
          <a class="ev__link" href="${IG + e.ig}" target="_blank" rel="noopener" aria-label="${esc(e.name)} auf Instagram ansehen"></a>
          <div class="ev__art">
            <div class="ev__blur" style="background-image:url('${cover}')"></div>
            <img class="ev__cover" src="${cover}" alt="Cover ${esc(e.name)}" loading="lazy">
          </div>
          <div class="ev__body">
            <span class="ev__tag">${esc(e.tag)}</span>
            <h3 class="ev__name">${esc(e.name)}</h3>
            <span class="ev__ig">Highlights ↗</span>
          </div>
        </article>`;
    }).join('');
  }
  renderEvents();

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
  const PANELS = ['events', 'merch', 'tickets', 'partner', 'jobs'];
  let current = null;

  function show(route) {
    const next = PANELS.includes(route) ? route : null;
    if (next === current) { closeMenu(); return; }
    const prevEl = current && $(`[data-panel="${current}"]`);
    const nextEl = next && $(`[data-panel="${next}"]`);

    if (prevEl) {
      prevEl.classList.remove('is-in');
      setTimeout(() => { if (!prevEl.classList.contains('is-in')) prevEl.hidden = true; }, 600);
    }
    if (nextEl) {
      nextEl.hidden = false;
      $('.panel__scroll', nextEl).scrollTop = 0;
      requestAnimationFrame(() => requestAnimationFrame(() => nextEl.classList.add('is-in')));
    }
    current = next;
    body.dataset.view = next || 'home';
    $$('.menu__list a').forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + next));
    document.title = next ? `${nextEl.querySelector('h2')?.textContent || nextEl.getAttribute('aria-label')} — PLAUSCH Events` : 'PLAUSCH Events — yes, we event.';

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
  // Ankerlink innerhalb eines Panels (Partner → Formular)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#partner-form"]');
    if (!a) return;
    e.preventDefault();
    $('#partner-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
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

  /* ---------- Merch ---------- */
  let cartCount = 0;
  $$('.product').forEach((p) => {
    const stage = $('.product__stage', p);
    $$('.sw', p).forEach((b) => b.addEventListener('click', () => {
      $$('.sw', p).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', x === b); });
      stage.dataset.variant = b.dataset.variant;
    }));
    $$('.sizes button', p).forEach((b) => b.addEventListener('click', () => {
      $$('.sizes button', p).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', x === b); });
    }));
    $('.btn--add', p).addEventListener('click', (e) => {
      const btn = e.currentTarget;
      cartCount++;
      const c = $('#cart b'); c.textContent = cartCount;
      $('#cart').classList.remove('bump'); void $('#cart').offsetWidth; $('#cart').classList.add('bump');
      btn.classList.add('is-done');
      setTimeout(() => btn.classList.remove('is-done'), 1400);
      say(`${p.dataset.product} ist im Warenkorb — Checkout folgt mit Shop-Launch.`);
    });
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

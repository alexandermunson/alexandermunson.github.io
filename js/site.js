/*
 * site.js — behaviour for alexandermunson.com
 * Three small things, all progressive enhancement:
 *   1. Mobile navigation toggle
 *   2. Current-section marking in the nav (aria-current)
 *   3. Lightbox for figures (native <dialog>; the links still work without JS)
 * No dependencies.
 */

const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

/* ---------- 0. Solid header once the page scrolls past the hero top ---------- */
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- 1. Mobile navigation ---------- */
if (header && navToggle && nav) {
  const setOpen = (open) => {
    header.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };

  navToggle.addEventListener('click', () => {
    setOpen(!header.classList.contains('nav-open'));
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) {
      setOpen(false);
      navToggle.focus();
    }
  });
}

/* ---------- 2. Current section in nav ---------- */
if (nav && 'IntersectionObserver' in window) {
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const sections = Array.from(byId.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let current = null;
  const setCurrent = (id) => {
    if (id === current) return;
    current = id;
    links.forEach((a) => a.removeAttribute('aria-current'));
    const link = byId.get(id);
    if (link) link.setAttribute('aria-current', 'location');
  };

  // Track which sections cross a band in the middle of the viewport and
  // mark the top-most one.
  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      const top = sections.find((s) => visible.has(s.id));
      if (top) setCurrent(top.id);
      else if (window.scrollY < 200) setCurrent(null);
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach((s) => observer.observe(s));
}

/* ---------- 3. Lightbox ---------- */
// Links with [data-lightbox] open in a native <dialog>. Arrow keys (and the
// prev/next buttons) step through the other images in the same project card.
const lightbox = document.getElementById('lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const fig = lightbox.querySelector('.lightbox-fig');

  const makeButton = (cls, label, text) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `lightbox-nav ${cls}`;
    b.setAttribute('aria-label', label);
    b.textContent = text;
    lightbox.appendChild(b);
    return b;
  };
  const prevButton = makeButton('lightbox-prev', 'Previous image', '‹');
  const nextButton = makeButton('lightbox-next', 'Next image', '›');
  const counter = document.createElement('span');
  counter.className = 'lightbox-count';
  fig.querySelector('figcaption').after(counter);

  let group = [];
  let index = 0;
  let opener = null;

  const captionFor = (link) => {
    const figcaption = link.closest('figure')?.querySelector('figcaption');
    const sheetId = link.querySelector('.sheet-id');
    const sheetName = link.querySelector('.sheet-name');
    if (figcaption) return figcaption.textContent.trim().replace(/\s+/g, ' ');
    if (sheetId && sheetName) return `${sheetId.textContent} — ${sheetName.textContent}`;
    return '';
  };

  const preload = (link) => {
    if (link) new Image().src = link.href;
  };

  const show = (i) => {
    index = (i + group.length) % group.length;
    const link = group[index];
    const thumb = link.querySelector('img');
    img.src = link.href;
    img.alt = thumb ? thumb.alt : '';
    caption.textContent = captionFor(link);
    const many = group.length > 1;
    counter.textContent = many ? `${index + 1} / ${group.length}` : '';
    prevButton.hidden = nextButton.hidden = !many;
    if (many) {
      preload(group[(index + 1) % group.length]);
      preload(group[(index - 1 + group.length) % group.length]);
    }
  };

  // Returning focus to the clicked image would draw a focus ring even after a
  // mouse click, so mouse-opened images are marked until they lose focus.
  const open = (link, viaKeyboard) => {
    const container = link.closest('.card, .figs');
    group = Array.from((container || document).querySelectorAll('a[data-lightbox]'));
    opener = link;
    if (!viaKeyboard) link.classList.add('no-ring');
    show(group.indexOf(link));
    lightbox.showModal();
  };

  document.querySelectorAll('a[data-lightbox]').forEach((link) => {
    link.addEventListener('click', (event) => {
      // Modified clicks (open in new tab, etc.) keep their normal behaviour.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      open(link, event.detail === 0); // detail 0 = activated from the keyboard
    });
  });

  prevButton.addEventListener('click', () => show(index - 1));
  nextButton.addEventListener('click', () => show(index + 1));
  closeButton.addEventListener('click', () => lightbox.close());

  // Drop the no-ring marker when the image loses focus after the dialog has closed.
  document.querySelectorAll('a[data-lightbox]').forEach((link) => {
    link.addEventListener('blur', () => {
      if (!lightbox.open) link.classList.remove('no-ring');
    });
  });

  lightbox.addEventListener('keydown', (event) => {
    if (group.length < 2) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
  });

  // A click on the backdrop (outside the figure and buttons) closes the dialog.
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener('close', () => {
    img.removeAttribute('src');
    img.alt = '';
    if (opener) {
      opener.focus();
      opener = null;
    }
  });
}

/* ---------- 4. Project filter ---------- */
// Chips filter the cards. Exiting cards fade, the rest glide to their new
// spots (FLIP), entering cards fade up in turn, and a pill slides between chips.
const filterBar = document.querySelector('.filters');
const cardGrid = document.querySelector('.cards');
if (filterBar && cardGrid) {
  filterBar.hidden = false;
  const chips = Array.from(filterBar.querySelectorAll('.filter'));
  const pill = filterBar.querySelector('.filter-pill');
  const cards = Array.from(cardGrid.querySelectorAll('.card'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const EASE = 'cubic-bezier(.2, .7, .2, 1)';

  const matches = (card, name) =>
    name === 'all' || (card.dataset.tags || '').split(/\s+/).includes(name);

  // Show how many projects each chip holds.
  chips.forEach((chip) => {
    const n = cards.filter((c) => matches(c, chip.dataset.filter)).length;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = String(n);
    chip.appendChild(count);
  });

  const movePill = (chip) => {
    pill.style.width = `${chip.offsetWidth}px`;
    pill.style.height = `${chip.offsetHeight}px`;
    pill.style.transform = `translate(${chip.offsetLeft}px, ${chip.offsetTop}px)`;
  };
  const activeChip = () => chips.find((c) => c.getAttribute('aria-pressed') === 'true');

  // Place the pill without animating it, then enable its transition.
  pill.style.transition = 'none';
  movePill(activeChip());
  requestAnimationFrame(() => requestAnimationFrame(() => { pill.style.transition = ''; }));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => movePill(activeChip()));
  window.addEventListener('resize', () => {
    pill.style.transition = 'none';
    movePill(activeChip());
    requestAnimationFrame(() => { pill.style.transition = ''; });
  });

  let run = 0;
  const apply = async (name) => {
    const mine = ++run;
    cards.forEach((c) => c.getAnimations().forEach((a) => a.cancel()));

    const wasVisible = cards.filter((c) => !c.hidden);
    const first = new Map(wasVisible.map((c) => [c, c.getBoundingClientRect()]));
    const leaving = wasVisible.filter((c) => !matches(c, name));

    if (!reduceMotion.matches && leaving.length) {
      await Promise.all(leaving.map((c) =>
        c.animate(
          [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }],
          { duration: 180, easing: 'ease-in', fill: 'forwards' }
        ).finished.catch(() => {})
      ));
      if (mine !== run) return;
    }

    cards.forEach((c) => {
      c.getAnimations().forEach((a) => a.cancel());
      c.hidden = !matches(c, name);
    });
    if (reduceMotion.matches) return;

    let entering = 0;
    cards.forEach((c) => {
      if (c.hidden) return;
      if (first.has(c)) {
        const from = first.get(c);
        const to = c.getBoundingClientRect();
        const dx = from.left - to.left;
        const dy = from.top - to.top;
        if (dx || dy) {
          c.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
            { duration: 520, easing: EASE }
          );
        }
      } else {
        c.animate(
          [{ opacity: 0, transform: 'translateY(18px) scale(.97)' }, { opacity: 1, transform: 'none' }],
          { duration: 480, delay: 60 + entering++ * 70, easing: EASE, fill: 'backwards' }
        );
      }
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.getAttribute('aria-pressed') === 'true') return;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      movePill(chip);
      apply(chip.dataset.filter);
    });
  });
}

/* ---------- 5. Scroll reveal ---------- */
// Home page sections fade up as they scroll into view. Elements already in
// view at load show immediately; with JS off everything is simply visible.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const targets = Array.from(document.querySelectorAll('.home-text, .work .page-title, .work-card, .work-all'));
  if (targets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    targets.forEach((el, i) => {
      el.classList.add('reveal');
      if (el.classList.contains('work-card')) el.style.setProperty('--d', `${(i % 3) * 90}ms`);
      io.observe(el);
    });
  }
}

/* ---------- 6. Background glow that follows the pointer ---------- */
// Two soft gradients on GPU-composited layers: a red one that chases the
// cursor and a wider warm one that lags behind. With no pointer (or on touch)
// they drift on their own. Reduced-motion visitors get a static glow.
{
  const glow = document.createElement('div');
  glow.className = 'bg-glow';
  glow.setAttribute('aria-hidden', 'true');
  glow.innerHTML = '<i class="b"></i><i class="a"></i>';
  document.body.prepend(glow);
  const [layerB, layerA] = glow.children;

  const place = (el, x, y, scale = 1) => {
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    place(layerA, window.innerWidth * 0.72, window.innerHeight * 0.22);
    place(layerB, window.innerWidth * 0.6, window.innerHeight * 0.35);
  } else {
    // Resume where the previous page left off so navigating doesn't reset the glow.
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem('bg-glow')); } catch (e) { /* storage unavailable */ }
    const ok = saved && ['tx', 'ty', 'ax', 'ay', 'bx', 'by', 'moved'].every((k) => Number.isFinite(saved[k]));

    let tx = ok ? saved.tx : window.innerWidth * 0.7;                   // target
    let ty = ok ? saved.ty : window.innerHeight * 0.25;
    let ax = ok ? saved.ax : tx, ay = ok ? saved.ay : ty;               // fast layer
    let bx = ok ? saved.bx : tx, by = ok ? saved.by : ty;               // slow layer
    let lastMove = ok ? saved.moved : -Infinity;                        // wall-clock ms
    let raf = 0;

    const save = () => {
      try {
        sessionStorage.setItem('bg-glow', JSON.stringify({ tx, ty, ax, ay, bx, by, moved: lastMove }));
      } catch (e) { /* ignore */ }
    };
    window.addEventListener('pagehide', save);

    window.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      tx = event.clientX;
      ty = event.clientY;
      lastMove = Date.now();
    }, { passive: true });

    const frame = () => {
      const wall = Date.now();
      // After a few idle seconds, wander along a slow loop instead. The loop
      // depends only on the wall clock, so every page follows the same path.
      if (wall - lastMove > 4000) {
        const t = wall / 1000;
        tx = window.innerWidth * (0.5 + 0.3 * Math.sin(t * 0.21));
        ty = window.innerHeight * (0.4 + 0.25 * Math.sin(t * 0.17 + 1.3));
      }
      const pax = ax, pay = ay;
      ax += (tx - ax) * 0.09;
      ay += (ty - ay) * 0.09;
      bx += (tx - bx) * 0.025;
      by += (ty - by) * 0.025;
      const speed = Math.hypot(ax - pax, ay - pay);
      place(layerA, ax, ay, 1 + Math.min(speed / 60, 0.3)); // swells a little when moving fast
      place(layerB, bx, by);
      raf = requestAnimationFrame(frame);
    };

    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { save(); stop(); } else start();
    });
    place(layerA, ax, ay);
    place(layerB, bx, by); // no flash in the corner before the first frame
    start();
  }
}

/* ---------- 7. Theme switch (dark / light green) ---------- */
{
  const root = document.documentElement;
  const KEY = 'theme';
  const meta = document.querySelector('meta[name="theme-color"]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isLight = () => root.dataset.theme === 'light';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-switch';
  btn.setAttribute('role', 'switch');
  btn.setAttribute('aria-label', 'Light theme');
  btn.innerHTML =
    '<span class="track"><span class="thumb">' +
    '<svg class="ico moon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
    '<svg class="ico sun" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
    '</span></span><span class="label"></span>';
  const label = btn.querySelector('.label');
  (document.querySelector('.sidebar') || document.body).appendChild(btn);

  const sync = () => {
    btn.setAttribute('aria-checked', String(isLight()));
    label.textContent = isLight() ? 'Light' : 'Dark';
    if (meta) meta.setAttribute('content', isLight() ? '#F3ECDC' : '#110B09');
  };

  const setTheme = (light, remember = true) => {
    if (light) root.dataset.theme = 'light';
    else delete root.dataset.theme;
    if (remember) {
      try { localStorage.setItem(KEY, light ? 'light' : 'dark'); } catch (e) { /* ignore */ }
    }
    sync();
  };

  btn.addEventListener('click', () => {
    const next = !isLight();
    if (reduceMotion.matches) { setTheme(next); return; }

    if (typeof document.startViewTransition === 'function') {
      const r = btn.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const transition = document.startViewTransition(() => setTheme(next));
      transition.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(.4, 0, .2, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(() => {});
    } else {
      root.classList.add('theme-fade');
      setTheme(next);
      setTimeout(() => root.classList.remove('theme-fade'), 450);
    }
  });

  // Keep other open tabs in step.
  window.addEventListener('storage', (event) => {
    if (event.key === KEY) setTheme(event.newValue === 'light', false);
  });

  // Back/forward can restore a page frozen in the browser's page cache, with
  // whatever theme it had when you left. Re-read the saved choice when it returns.
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* ignore */ }
    const light = saved === 'light';
    if (light !== isLight()) setTheme(light, false);
  });

  sync();
}

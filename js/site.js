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

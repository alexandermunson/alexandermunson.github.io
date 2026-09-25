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
const lightbox = document.getElementById('lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const closeButton = lightbox.querySelector('.lightbox-close');
  let opener = null;

  const open = (link) => {
    const thumb = link.querySelector('img');
    const figure = link.closest('figure');
    const figcaption = figure ? figure.querySelector('figcaption') : null;
    const sheetId = link.querySelector('.sheet-id');
    const sheetName = link.querySelector('.sheet-name');

    img.src = link.href;
    img.alt = thumb ? thumb.alt : '';
    if (figcaption) {
      caption.textContent = figcaption.textContent.trim().replace(/\s+/g, ' ');
    } else if (sheetId && sheetName) {
      caption.textContent = `${sheetId.textContent} — ${sheetName.textContent}`;
    } else {
      caption.textContent = '';
    }

    opener = link;
    lightbox.showModal();
  };

  document.querySelectorAll('a[data-lightbox]').forEach((link) => {
    link.addEventListener('click', (event) => {
      // Modified clicks (open in new tab, etc.) keep their normal behaviour.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      open(link);
    });
  });

  closeButton.addEventListener('click', () => lightbox.close());

  // A click on the backdrop (outside the figure) closes the dialog.
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


# alexandermunson.com

Portfolio site for Alexander Munson — mechanical engineering, robotics, aerospace.
Plain HTML, CSS, and a little JavaScript. No build step, no framework, no dependencies.

## Layout

```
.
├── index.html              the whole site (one page, six numbered sections)
├── 404.html                not-found page, served automatically by GitHub Pages
├── css/
│   ├── site.css            all styling: tokens, type, layout, components
│   └── print.css           print-only overrides (loaded with media="print")
├── js/
│   └── site.js             mobile nav, current-section marking, figure lightbox
├── assets/
│   ├── fonts/              Archivo (variable) + IBM Plex Mono, self-hosted, OFL licences alongside
│   └── images/             web-sized images (see "Images" below) and favicon/
├── site.webmanifest
├── CNAME                   custom domain for GitHub Pages
├── .nojekyll               tells Pages not to run Jekyll
└── .github/workflows/deploy.yml   uploads the repo root to Pages on every push to main
```

## Editing

Everything a recruiter reads lives in `index.html`. Each section is marked with a
banner comment (`01 · ABOUT`, `02 · EXPERIENCE`, ...). Copy is plain HTML; there is
no templating.

**Add a project.** Projects sit in two groups. A major project is an
`<article class="project">` inside the first `.project-group`: text and a detail list on
the left, a small figure grid on the right. A smaller project is an `<article class="mini">`
inside `.minis`: a short paragraph and a strip of thumbnails. Copy the nearest existing
block, then change the `id`, the `aria-labelledby` / heading `id` pair, the number in
`<span class="num">`, and the figure numbers.

**Add a figure.** Wrap the `<img>` in `<a class="fig-link" href="…full-size…" data-lightbox>`
so it opens in the lightbox. Always set `width`, `height`, `alt`, and `loading="lazy"`
(the hero image is the only one that should not be lazy).

**Add the résumé.** Put the PDF at `assets/Alexander-Munson-Resume.pdf` and uncomment
the `Résumé` row in the Contact section of `index.html`.

**Bump the revision.** The footer title block carries `Rev 2026-09`. Update it when you
make a meaningful content change; it is the only date on the page that is not content.

## Images

Source photos are not in the repo; only web-sized derivatives are. Naming convention
is `<subject>-<variant>-<width>.<ext>`, with the width in pixels:

- Photos: JPEG, quality 72–82, at 800 px for inline use and 1200–2000 px for the lightbox
  and 2× displays. EXIF is stripped and orientation is baked in.
- Drawings: PNG at 1000 px (inline) and 2000 px (lightbox). Line art stays crisp in PNG.
- CAD renders and plots that were already small are copied as-is.

Anything that ends up larger than about 600 KB should be resized or re-encoded before
it goes in.

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static server
(for example `python -m http.server` from the repo root) so the JS module loads without
file-URL restrictions in stricter browsers.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which uploads the repository root
to GitHub Pages. The Pages source must be set to **GitHub Actions** in the repository
settings. The custom domain comes from `CNAME`.

## Design notes

- Rev 2026-09 redesign: dark editorial treatment modelled on reds.press. Warm near-black
  ground (`#110B09`), cream type (`#ECE4D2`), one signal red (`#C4291F`; `#E5584A` for small
  red text so it passes WCAG AA). A light film-grain overlay sits on top of the page.
- Type: Playfair Display (900, with red italic accent words) for headings, DM Sans for body,
  IBM Plex Mono (self-hosted) for dates, figure numbers, course codes and the title block.
  Playfair and DM Sans load from Google Fonts.
- Structure: full-bleed darkened hero photo with a rotating seal, a scrolling ticker, a
  full-bleed arena photo break with a pull quote, and bordered card grids for the smaller
  projects and skills. Figure numbers, the parameter table and the title-block footer are kept
  from the drawing-package design.
- The previous design is kept in `_previous-design/` for reference and can be deleted.
- Fonts are licensed under the SIL Open Font License.

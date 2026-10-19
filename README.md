# VANNAM

A React site (Vite + React 18 + React Router 6) with three routes:

- `/` home: hero, marquee, "the little things" edit, our story, reviews, contact
- `/shop` the store: filters, search, sort
- `/product/:slug` a product page: auto-sliding photos, details, similar products

## Run

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # production build in dist/ (also writes dist/404.html)
    npm run preview    # serve the production build locally

## Deploy

Any static host works. Because `/shop` and `/product/...` are client-side routes, the host must send unknown paths to `index.html`. Config is included:

| Host | What to do |
|---|---|
| Cloudflare Pages / Netlify | build `npm run build`, output `dist`. `public/_redirects` and `public/_headers` are picked up automatically (SPA fallback and long caching) |
| Vercel | import the repo; `vercel.json` handles rewrites and caching |
| GitHub Pages | publish `dist`; `dist/404.html` makes deep links work on reload. Under `/repo-name/` set `base: '/repo-name/'` in `vite.config.js` and a `basename` on the router in `src/main.jsx` |

## What you can do on the site

- **Peek inside:** move the mouse over any product photo (shop, edit, similar products) and a stitched lens follows the cursor, opening onto the inside of the pouch. On touch screens a small eye button reveals it. Keyboard focus reveals it fully. Clicking opens the product page and the photo morphs into that page's gallery (View Transitions API; other browsers just navigate).
- **Product page:** the photos slide on their own, slowly (6 s each, with a slow zoom), pause while you hover, focus or drag, and stop for a few seconds after you move them yourself. Arrows, thumbnails and swipe/drag always land exactly on a slide. Below, "You may also love" shows similar pieces: same kind of pouch first, then shared tags and close price.
- **Sliders line up:** the reviews, edit and similar-products rails size their cards from the rail width, so every step lands a card on the same left edge, including the last one (on phones too).

## Motion design

First-visit curtain (wordmark, a sewn running stitch, ruffled lift) · kinetic headlines that rise out of masks, with a hand-drawn underline · words that light up as the story paragraph scrolls · an iris wipe between story chapters · a marquee that speeds up and reverses with your scroll · ruffle (scallop) edges between sections · quilt, gingham and polka patterns · a zipper down the right edge that closes as you read · a soft cursor ring with labels and magnetic buttons (mouse only). All of it respects `prefers-reduced-motion`.

## Why it stays smooth

- **Route-level code splitting:** shop and product pages load only when opened. First load is about 90 KB of gzipped JavaScript.
- **Images are pre-optimised WebP**, two sizes each with `srcset`, lazy loaded, width/height set. The peek effect is a clip-path on a second image, not a filter or blend mode.
- **Hero video:** the WebP poster paints first, the video starts after the page has loaded and the browser is idle, phones get a 520 KB version, and it is skipped for reduced-motion and Save-Data visitors. It pauses off-screen.
- **Ripple effect:** the WebGL context and shader are created on the first hover/tap; nothing is drawn or looped unless a ripple is alive (about one second).
- **Scroll effects** use IntersectionObserver, and the few scroll handlers only run while their element is on screen, one rAF per frame, touching a single CSS variable on a small element.
- Fonts are self-hosted, three preloaded; hashed JS/CSS and all media are cached for a year.

## Where things are

    src/main.jsx, App.jsx             router (data router, lazy pages), layout, scroll/hash handling
    src/pages/                        Home, Shop, Product
    src/sections/                     Hero, Marquee, Edit, Story, Reviews, Contact
    src/components/                   Nav (floating pill), PeekTile, Rail, Gallery, ProductCard, Split (kinetic headline),
                                      ScrollWords, Cursor, ZipProgress, Preloader, Scallop, BagDrawer, Footer ...
    src/lib/shop.jsx                  bag state (saved in localStorage)
    src/lib/data.js                   catalogue helpers, similar-products scoring
    src/lib/ripple.js                 hero water-ripple (lazy WebGL)
    src/data/products.json            the catalogue (generated image fields; edit text freely)
    src/styles/                       base tokens, nav, hero, sections, motion (new components), shop, product, overlays
    public/img, public/video          generated WebP images, posters, hero video
    scripts/make-images.py            builds every image from your original photos (see below)

## Images: how the peek works

For each product `make-images.py` writes: `rest` (the outside photo shown at rest, with the script text that was baked into the lifestyle photos removed), `peek` (the pastel studio shot revealed under the cursor), `tile` (4:5 pastel tile for the story and bag) and a `gallery` (rest, peek, then the remaining original photos such as the 360 sheets).

- 8 of the 12 products have a true inside photo (hair tool pouches, napkin, meadow, cherry) and say **Peek inside**. The navy, pink chess, cheetah and polka pouches have no open-pouch photo, so their lens shows another studio look and says **Another look**.
- The hair tool pouches "Polka & Lace" and "Red Gingham" have no outside photo at all, so their resting image is already an open-pouch shot.
- A few photos still show faint leftovers of the removed doodles (the meadow and polka ones).
- To add a product: add it to `products.json`, set its colour in the `TINT` map and (if the lifestyle photo has text) its text area in `TEXT`, then run
  `python3 scripts/make-images.py <folder-with-original-photos> <products.json>` (needs `pip install pillow numpy scipy opencv-python-headless`).

## Before launch

- **Reviews are sample copy.** The six reviews in `REVIEWS` (`src/sections/Reviews.jsx`) are placeholder text written for the template. Replace them with real customer reviews.
- **Story chapters** are in `CHAPTERS` (`src/sections/Story.jsx`).
- **Colours:** the pastel palette and dark tones are CSS variables at the top of `src/styles/base.css`.
- **Checkout:** there is no payment/order backend. The bag offers "Copy order summary" to paste into Instagram.
- **Contact:** only Instagram is known. The form validates, copies the message and says it was NOT sent.
- **Product sizes:** the `dimensions` field is empty in the catalogue, so none are shown.
- The hero clip carries a small "Veo" watermark in the bottom-right; a clean export would remove it.
- The infographic photos in each product gallery still contain their own printed text (they are the "details" sheets).

## Accessibility

Keyboard-operable nav, carousels (arrow keys) and dialogs; visible focus rings; skip link; real links for every product. `prefers-reduced-motion` turns off the curtain, marquee, reveals, sticker spin, gallery and review auto-slide, the story iris and view transitions, and the hero stays on its poster.

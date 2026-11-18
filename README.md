# AUREL TIMEPIECES - Phase 2B

A responsive luxury watch storefront and product details experience built with Next.js 16 App Router, TypeScript, Tailwind CSS v4 and the installed Deneb UI 2.0.131. The existing ARC identity, strict Fivora manifest v2, static export configuration and `SiteDataProvider` are preserved. No packages were added.

## Development and export

```sh
npm run dev
npx tsc --noEmit
npm run build
npx deneb doctor
npm run validate
```

The production export is `out/`. `NEXT_PUBLIC_SITE_BASE_PATH` remains supported. Fonts and imagery are served locally; builds do not fetch Google Fonts or image services. Deneb validation creates empty-content and probe-content builds; a normal `npm run build` restores the real content export after an in-place diagnostic run.

## Homepage

Announcement, responsive navigation, editorial hero, three benefits, four featured watches, four collections, brand story, four new arrivals, three testimonials, demo newsletter and footer. There is live catalog search, mobile navigation, collection filtering, links to watch details and a preview-only shopping bag notice. `/404` has an explicit fallback.

`/shop/` provides name search, collection/price/availability filters, featured/newest/price sorting, result counts, empty states and filter reset. Filters are stored in the query string, so collection links and copied URLs open the same selection. `/collections/` presents the four shared collections with distinct local imagery and links to the appropriately filtered Shop. Header and footer navigation use these routes; About and Contact continue to point to homepage sections. Homepage collection filtering and newsletter behavior are preserved; product cards and search results now open the selected watch details.

Product links retain Deneb's stable `/products/detail/?id=...` route and native `platformProductDetailHref(id)` fallback. The page uses `usePlatformProductDetail` against the shared live catalog, with remote lookup disabled. Existing IDs and `home.products` / `home.arrivals` paths are preserved. All eight homepage cards, Shop cards, global search and related-watch links open the watch details. A bare details URL previews the first watch; unknown or removed IDs show an editable recovery state. `trailingSlash: true` preserves Fivora's directory-index routing. Cart, Checkout and payments remain deferred.

## Watch details

The split editorial layout includes a thumbnail gallery, enlarged-image dialog, keyboard arrow navigation, product name, reference, price, stock status, concise and full descriptions, specification rows, personal concierge enquiry and related watches. Related watches prefer the same collection and exclude the current product. Layouts adapt from 320px to desktop and support the existing light/dark theme.

Each existing product record now has `reference`, `details`, `gallery` (image, alternative text, caption) and `specifications` (label, value). Prices and availability are read from the same fields as the catalog. The gallery always includes the catalog's primary image; optional images and specification lists may be added, reordered or removed live. Sample additional views reuse crops of the existing reference photograph; merchants should replace these with their own product photography. No new dependencies or external image requests were added.

The enquiry button opens an accessible dialog for the selected watch. Valid `common.business.email` and/or `common.business.whatsapp` values enable email and WhatsApp links with the watch name/reference prefilled. These links open the visitor's external contact client; the site never claims a message was sent. With no configured channel, the dialog explicitly states that this is a demo and no message has been sent. No contact or payment backend is connected.

Static HTML presents the catalog as a readable detail folio, including exact nested editing targets. Hydration selects one watch by query ID; browser history and live catalog changes remain reactive. No per-product build-time route generation is used.

The catalog adapter reads the two existing, disjoint `home.products` and `home.arrivals` lists. It does not copy product records into Shop content, and it deduplicates stable IDs. Existing field paths remain intact. The lists are grouped as shared catalog sections in the editor schema, with Watch Details as their canonical editing page. Stable IDs, sample catalog-added dates and featured sort order are configurable fields; displayed prices remain the single source for price filtering and sorting. Missing prices sort last and display “Price on request.”

## Fivora editing

- `src/data/site-data.json`: merchant identity, theme, content and styles.
- `fivora-template.json`: supported object/list editor fields, palette and strict visual contract.
- `src/app/providers.tsx`: explicit client boundary for Deneb's CommonJS exports, with live theme tokens synchronized to the existing dark/light toggle after preview snapshots.
- `src/components/storefront/editable.tsx`: Deneb `EditableText`, `EditableImage`, `useSiteData`, `useComponentStyle`, base-path-safe assets and safe destination fallbacks.
- `WatchBindings.tsx`: explicit dynamic field paths for featured and arrival lists; `WatchCard.tsx` supplies shared presentation.
- `catalog.ts`: shared catalog normalization, stable IDs and native Fivora routing.
- `WatchDetailBindings.tsx`: explicit featured/arrival field, gallery and specification paths.
- `WatchDetailView.tsx`: shared detail presentation, gallery, concierge dialog and related watches.
- `SiteChrome.tsx`: shared announcement, header, mobile navigation, search, footer and bag notice.
- `Shop.tsx` and `Collections.tsx`: editable catalog controls and editorial collection pages.
- `Storefront.tsx`: Deneb `EditableSection` and `EditableIcon`, semantic page structure and homepage interactions.

Existing homepage keys are retained with watch-specific values: `home.title`, `home.subtitle`, `home.pageTsx` (hero eyebrow), `home.heroBackgroundImage` (hero background), the independent `home.heroWatch1Image`, `home.heroWatch2Image`, and `home.heroWatch3Image` cutouts with per-watch scale, X/Y position, rotation, and visibility controls, `home.vercelLogomarkImage` (story image), and the existing CTA label/URL pairs. Old style keys remain. New brand, navigation, section, catalog, collection, review, newsletter and footer fields are registered in `editorSchema`.

Lists use `data-preview-list-path`, indexed `data-preview-item-path` and exact field markers. Text, card, button and section targets use supported style kinds and consume Deneb CSS variables. Adding/reordering items is driven by the current `useSiteData()` array. Empty arrays retain their list containers. Empty text, images and URLs use safe fallbacks. Nonvisual configuration, image alternative text and conditional control messages use supported `controlOnlyPaths`; visible merchant content uses field markers. Watch Details labels are registered as conditional controls because the entire product view is absent for an empty catalog or unknown ID. They still render exact editable field/style markers when a watch is selected, and remain customizable through the editor schema. Legacy routing labels are retained as control fields. Unrelated vehicle editor sections were removed because they had no corresponding content or watch-storefront use.

Deneb's source scanner can issue advisory messages for marker forwarding inside reusable components; concrete exported markers and explicit list bindings are validated by the strict preflight. Doctor can also suggest generic swatch/compare-price fields that this Phase 1 design does not use. Do not run `deneb init` or `doctor --fix` over the authored template.

## Demo boundaries

Catalog prices, references, specifications, availability, reference photography, service promises and customer stories are illustrative. The newsletter validates email and displays an explicit demo confirmation; it never transmits or stores addresses. Concierge is a demo until the merchant configures email or WhatsApp; delivery/returns, social destinations and shopping bag remain preview behavior. No payments or subscription backend are connected.

## Browser verification

On Windows with Chrome installed in its standard location:

```sh
npm run build
node scripts/verify-homepage.mjs
```

The dependency-free QA helpers serve the export temporarily and launch hidden headless Chrome. The homepage suite checks rendering, image loading, local anchors, mobile navigation, filtering, search-to-details navigation, demo newsletter validation, theme switching and Fivora postMessage updates. Screenshots and JSON results are written under `.deneb/qa/` (Git-ignored). Helpers stop their server and Chrome when done.

Run `node scripts/verify-phase2a.mjs` for Shop/Collections search, combined filters, all sort modes, reset, URL filters, four collection destinations, native product-detail navigation, mobile menus, empty arrays, missing optional fields and live content/style changes. It also checks a product added after the static build. Shop and Collections screenshots are saved at 320, 390, 768 and 1440px, plus full desktop captures. `browser-session.mjs` supports both flat and directory-index exports and optional `NEXT_PUBLIC_SITE_BASE_PATH` verification.

Run `node scripts/verify-phase2b.mjs` for all eight IDs, responsive layouts at 320/390/768/1024/1440px, local images, gallery/zoom keyboard controls, enquiry fallback and contact links, related navigation, history, unknown/missing/removed IDs, optional data fallbacks, nested-list edits/reordering, live styles, and a product added after the static build. Screenshots and `phase2b-results.json` are saved under `.deneb/qa/`. Tests inspect external enquiry links without sending messages. Run the homepage and Phase 2A suites for regression coverage.

To reuse installed dependencies during a local Fivora diagnostic, run `npm run validate -- --skip-install`; it still builds and validates empty and probe fixtures. Skip-install validation is not proof of a clean upload-ready ZIP. Restore the normal export with `npm run build` afterward.

## Local assets and credits

Watch photographs are reference images downloaded from [Unsplash](https://unsplash.com/license), converted to WebP and committed under `public/images/`. These are not photographs of manufactured AUREL products and do not imply a relationship with the brands depicted.

| Local file | Unsplash original |
| --- | --- |
| `watch-hero.webp` | [Photo 1524805444758-089113d48a6d](https://images.unsplash.com/photo-1524805444758-089113d48a6d) |
| `watch-classic.webp` | [Photo 1490367532201-b9bc1dc483f6](https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6) |
| `watch-sport.webp` | [Photo 1547996160-81dfa63595aa](https://images.unsplash.com/photo-1547996160-81dfa63595aa) |
| `watch-chrono.webp` | [Photo 1533139502658-0198f920d8e8](https://images.unsplash.com/photo-1533139502658-0198f920d8e8) |
| `watch-limited.webp` | [Photo 1508057198894-247b23fe5ade](https://images.unsplash.com/photo-1508057198894-247b23fe5ade) |
| `watch-editorial.webp` | [Photo 1434056886845-dac89ffe9b56](https://images.unsplash.com/photo-1434056886845-dac89ffe9b56) |

Manrope is self-hosted under `public/fonts/` (SIL Open Font License; see `public/fonts/OFL.txt`). Inter uses the existing `@fontsource/inter` installation. `scripts/prepare-assets.mjs` refreshes the original local demo assets and requires network access; it is not part of installation or production builds.

## Homepage campaign repair — 18 November 2026

The hero's field paths were already present in the schema and forwarded by `Photo`. The actual selection failure was DOM hit testing: at 1440px, the centre of the background and every watch hit the full-size `.hero-content` div instead of an image. Fivora's installed selection bridge walks up from the clicked element; it cannot select an image in a covered sibling layer. Also, Deneb 2.0.131's `EditableImage` defaults to inline `object-fit: cover`, which overrode the hero's CSS `contain` declaration. Different absolute positions, unequal frame dimensions, additional 0.72/0.66 scales and the blue PNG's transparent margins compounded the visual imbalance.

The hero now uses four direct `EditableImage` bindings with literal paths on real IMG elements: `home.heroBackgroundImage`, `home.heroWatch1Image` (centre), `home.heroWatch2Image` (left), and `home.heroWatch3Image` (right). Watches explicitly pass `fit="contain"`; the separate background uses `cover`. Source changes retain the IMG nodes rather than key-remounting them. Each image has its own base-path-safe fallback. A shared grid balances watch sizes and centres, keeps the copy separate, and stacks the campaign below the copy on tablet/mobile. Empty layout space and decorative layers pass pointer hits through, while image and copy targets remain interactive. Only the supplied blue asset receives compensation for its transparent padding; replacing it restores ordinary contain sizing. Numeric settings retain zero values, and the seed transforms are neutral. Existing field names, image assets, routes and static-export configuration remain intact.

The initial `out/` contained `/uploads/generated-sites/template-preview/simulation` asset paths left by Deneb validation. That output is unsuitable for a normal root preview. A fresh `npm run build` restores the normal export. Fivora's provider also applies incoming complete editor snapshots and its session cache over seed data: changing this checkout's JSON cannot update an already imported template or override a saved merchant snapshot. No authenticated Fivora session was available, so the version and saved data in the user's actual editor could not be inspected or refreshed.

Run `node scripts/verify-hero.mjs` after building. It serves the real static export in Chrome, loads the installed Deneb CLI selection bridge, dispatches native mouse clicks to all four images at 320/390/768/1024/1440px, and checks exact image-selection payloads. It also checks independent replacements with different decoded assets, stable selection nodes, separate fallbacks, zero-valued positioning and layout overlap. Desktop/mobile screenshots and `hero-results.json` are saved in `.deneb/qa/`; that report explicitly records `actualFivoraEditorVerified: false`. These checks verify the rendered template and local Deneb bridge, not an authenticated Fivora image picker, upload, save or reload. Earlier homepage checks only sent preview snapshots (including assigning the same image paths already in the seed); passing them did not prove visual selection or a visible change in Fivora.

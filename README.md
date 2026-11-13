# AUREL TIMEPIECES — Phase 2A

A responsive luxury watch homepage built with Next.js 16 App Router, TypeScript, Tailwind CSS v4 and the installed Deneb UI 2.0.131. The existing ARC identity, strict Fivora manifest v2, static export configuration and `SiteDataProvider` are preserved. No packages were added.

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

Announcement, responsive navigation, editorial hero, three benefits, four featured watches, four collections, brand story, four new arrivals, three testimonials, demo newsletter and footer. There is live catalog search, mobile navigation, collection filtering, an enquiry selection notice and a preview-only shopping bag notice. `/404` has an explicit fallback.

`/shop/` provides name search, collection/price/availability filters, featured/newest/price sorting, result counts, empty states and filter reset. Filters are stored in the query string, so collection links and copied URLs open the same selection. `/collections/` presents the four shared collections with distinct local imagery and links to the appropriately filtered Shop. Header and footer navigation use these routes; About and Contact continue to point to homepage sections. Existing homepage collection filtering, search, enquiries and newsletter behavior are preserved.

Product links use Deneb's `platformProductDetailHref(id)` and its stable `/products/detail/?id=...` URL. The explicitly approved compatibility route uses `usePlatformProductDetail` with remote lookup disabled and hands the ID back to `/shop/?id=...`, where the matching catalog card is focused and highlighted. This route contains no Watch Details UI. `trailingSlash: true` exports the directory index required by Fivora's routing validator. Watch Details, Cart, Checkout and payments remain deferred.

The catalog adapter reads the two existing, disjoint `home.products` and `home.arrivals` lists. It does not copy product records into Shop content, and it deduplicates stable IDs. Existing field paths remain intact. The lists are grouped as shared catalog sections in the editor schema. Stable IDs, sample catalog-added dates and featured sort order are configurable fields; displayed prices remain the single source for price filtering and sorting. Missing prices sort last and display “Price on request.”

## Fivora editing

- `src/data/site-data.json`: merchant identity, theme, content and styles.
- `fivora-template.json`: supported object/list editor fields, palette and strict visual contract.
- `src/app/providers.tsx`: explicit client boundary for Deneb's CommonJS exports.
- `src/components/storefront/editable.tsx`: Deneb `EditableText`, `EditableImage`, `useSiteData`, `useComponentStyle`, base-path-safe assets and safe destination fallbacks.
- `WatchBindings.tsx`: explicit dynamic field paths for featured and arrival lists; `WatchCard.tsx` supplies shared presentation.
- `catalog.ts`: shared catalog normalization, stable IDs and native Fivora routing.
- `SiteChrome.tsx`: shared announcement, header, mobile navigation, search, footer and bag notice.
- `Shop.tsx` and `Collections.tsx`: editable catalog controls and editorial collection pages.
- `Storefront.tsx`: Deneb `EditableSection` and `EditableIcon`, semantic page structure and homepage interactions.

Existing homepage keys are retained with watch-specific values: `home.title`, `home.subtitle`, `home.pageTsx` (hero eyebrow), `home.nextJsLogoImage` (hero image), `home.vercelLogomarkImage` (story image), and the existing CTA label/URL pairs. Old style keys remain. New brand, navigation, section, catalog, collection, review, newsletter and footer fields are registered in `editorSchema`.

Lists use `data-preview-list-path`, indexed `data-preview-item-path` and exact field markers. Text, card, button and section targets use supported style kinds and consume Deneb CSS variables. Adding/reordering items is driven by the current `useSiteData()` array. Empty arrays retain their list containers. Empty text, images and URLs use safe fallbacks. Nonvisual configuration, image alternative text and conditional control messages use supported `controlOnlyPaths`; visible merchant content uses field markers. Unrelated vehicle editor sections were removed because they had no corresponding content or watch-storefront use.

Deneb's source scanner can issue advisory messages for marker forwarding inside reusable components; concrete exported markers and explicit list bindings are validated by the strict preflight. Doctor can also suggest generic swatch/compare-price fields that this Phase 1 design does not use. Do not run `deneb init` or `doctor --fix` over the authored template.

## Demo boundaries

Catalog prices, availability, reference photography, service promises and customer stories are illustrative. The newsletter validates email and displays an explicit demo confirmation; it never transmits or stores addresses. Concierge, delivery/returns, social destinations and shopping bag are clearly presented as preview behavior. No payments or subscription backend are connected.

## Browser verification

On Windows with Chrome installed in its standard location:

```sh
npm run build
node scripts/verify-homepage.mjs
```

The dependency-free QA helpers serve the export temporarily and launch hidden headless Chrome. The homepage suite checks rendering, image loading, local anchors, mobile navigation, filtering, search, enquiry selection, demo newsletter validation, theme switching and Fivora postMessage updates. Screenshots and JSON results are written under `.deneb/qa/` (Git-ignored). Helpers stop their server and Chrome when done.

Run `node scripts/verify-phase2a.mjs` for Shop/Collections search, combined filters, all sort modes, reset, URL filters, four collection destinations, the native product-link handoff, mobile menus, empty arrays, missing optional fields and live content/style changes. It also checks a product added after the static build. Shop and Collections screenshots are saved at 320, 390, 768 and 1440px, plus full desktop captures. `browser-session.mjs` supports both flat and directory-index exports and optional `NEXT_PUBLIC_SITE_BASE_PATH` verification.

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

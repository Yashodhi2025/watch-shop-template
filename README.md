# AUREL TIMEPIECES — Phase 1

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

Only `/` is declared in the Fivora manifest. Home, Shop, Collections, About and Contact currently navigate to homepage sections. Product links select a watch and navigate to the demo concierge in the footer. Collection links filter featured watches. Social and support links safely target the concierge until merchants configure actual destinations. Shop, product detail, cart and checkout pages are intentionally deferred.

## Fivora editing

- `src/data/site-data.json`: merchant identity, theme, content and styles.
- `fivora-template.json`: supported object/list editor fields, palette and strict visual contract.
- `src/app/providers.tsx`: explicit client boundary for Deneb's CommonJS exports.
- `src/components/storefront/editable.tsx`: Deneb `EditableText`, `EditableImage`, `useSiteData`, `useComponentStyle`, base-path-safe assets and safe destination fallbacks.
- `WatchBindings.tsx`: explicit dynamic field paths for featured and arrival lists; `WatchCard.tsx` supplies shared presentation.
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

The dependency-free QA helper serves the export temporarily and launches hidden headless Chrome. It checks rendering, image loading, local anchors, mobile navigation, filtering, search, enquiry selection, demo newsletter validation, theme switching and Fivora postMessage updates for text/images/styles/list additions and reordering. Screenshots at 320, 390, 768, 1024 and 1440px, a full-page screenshot and a JSON report are written under `.deneb/qa/` (Git-ignored). The helper stops its server and Chrome when done.

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

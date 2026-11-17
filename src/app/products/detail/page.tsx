"use client";

import { usePlatformProductDetail } from "@deneb-ui/ui";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useCatalog } from "@/components/storefront/catalog";
import { EditLink, Text, useContent } from "@/components/storefront/editable";
import SiteChrome from "@/components/storefront/SiteChrome";
import { ArrivalDetail, FeaturedDetail } from "@/components/storefront/WatchDetailBindings";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function ProductDetailPage() {
  const entries = useCatalog();
  const { text } = useContent();
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const products = useMemo(() => entries.map(entry => ({ id: entry.id, name: entry.name })), [entries]);
  const { productId, status } = usePlatformProductDetail({ products, catalogUrl: null });
  const selected = productId ? entries.find(entry => entry.id === productId) : entries[0];
  const title = `${selected?.name || text("productDetails.pageTitle", "Timepiece details")} | ${text("common.websiteTitle", "AUREL")} ${text("common.wordmarkSubtitle", "TIMEPIECES")}`;
  useEffect(() => {
    // Next's streamed layout metadata can arrive after client ID resolution.
    const syncTitle = () => { if (document.title !== title) document.title = title; };
    syncTitle();
    const observer = new MutationObserver(syncTitle);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);
  // Static HTML is a readable catalog folio. The browser selects one view by ID.
  // Every nested list retains exact editable targets in the static export.
  const visible = hydrated ? (selected ? [selected] : []) : entries;
  return <SiteChrome page="product_link">
    <main id="watch-details">
      <div data-preview-list-path="home.products">{visible.filter(entry => entry.source === "products").map(entry => <FeaturedDetail key={entry.id} entry={entry} entries={entries} />)}</div>
      <div data-preview-list-path="home.arrivals">{visible.filter(entry => entry.source === "arrivals").map(entry => <ArrivalDetail key={entry.id} entry={entry} entries={entries} />)}</div>
      {((hydrated && !selected) || !entries.length) && <section className="detail-state shell" aria-live="polite">
        <Text data-preview-field-path="productDetails.eyebrow" className="eyebrow" />
        <Text data-preview-field-path={status === "loading" ? "productDetails.loadingTitle" : "productDetails.missingTitle"} as="h1" />
        <Text data-preview-field-path="productDetails.missingDescription" as="p" />
        <EditLink hrefPath="productDetails.backUrl" labelPath="productDetails.backLabel" fallbackHref="/shop/" className="button button-navy" arrow />
      </section>}
    </main>
  </SiteChrome>;
}

"use client";

import { usePlatformProductDetail, withBasePath } from "@deneb-ui/ui";
import { useEffect, useMemo } from "react";
import { catalogSelectionHref, useCatalog } from "@/components/storefront/catalog";
import { Text, safeHref, useContent } from "@/components/storefront/editable";

// Routing compatibility only, explicitly approved for Phase 2A.
// No Watch Details UI, cart actions, remote lookup or payment functionality.
export default function ProductLinkHandoff() {
  const entries = useCatalog();
  const { text } = useContent();
  const products = useMemo(() => entries.map(entry => ({ id: entry.id, name: entry.name })), [entries]);
  const { productId, status } = usePlatformProductDetail({ products, catalogUrl: null });
  useEffect(() => {
    if (!productId && status === "loading") return;
    window.location.replace(productId ? catalogSelectionHref(productId) : withBasePath("/shop/"));
  }, [productId, status]);
  return <main className="not-found-page" data-preview-page-key="product_link">
    <Text data-preview-field-path="common.routingLabel" as="h1" fallback="Opening the catalog…" />
    <Text data-preview-field-path="common.routingNote" as="p" />
    <a href={safeHref(text("common.navUrls.shop"), "/shop/")} className="button button-navy" data-preview-field-path="common.navUrls.shop"><Text data-preview-field-path="common.routingCta" fallback="Continue to Shop" /></a>
  </main>;
}

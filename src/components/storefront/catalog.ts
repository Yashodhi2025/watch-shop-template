"use client";

import { platformProductDetailHref, withBasePath } from "@deneb-ui/ui";
import { useMemo } from "react";
import { useContent } from "./editable";

export type CatalogEntry = {
  id: string;
  name: string;
  collection: string;
  price: number | null;
  availability: "available" | "limited" | "unavailable" | "enquire";
  addedAt: number;
  featuredOrder: number;
  source: "products" | "arrivals";
  index: number;
  path: string;
};

export function priceValue(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const normalized = value.replace(/[$,\s]/g, "");
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

// Keep the original editable paths: the two existing, disjoint lists form one catalog.
// No copied product records are stored under the Shop page.
export function useCatalog(): CatalogEntry[] {
  const { data } = useContent();
  return useMemo(() => {
    const home = data?.content?.home;
    const seen = new Set<string>();
    const result: CatalogEntry[] = [];
    for (const source of ["products", "arrivals"] as const) {
      const rows: unknown = home?.[source];
      if (!Array.isArray(rows)) continue;
      rows.forEach((row: unknown, index: number) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) return;
        const item = row as Record<string, unknown>;
        const name = typeof item.name === "string" && item.name.trim() ? item.name : "Timepiece";
        const configuredId = typeof item.id === "string" ? item.id.trim() : typeof item.id === "number" && Number.isFinite(item.id) ? String(item.id) : "";
        const id = configuredId || `${source}-${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`;
        if (seen.has(id)) return;
        seen.add(id);
        const status = typeof item.availability === "string" ? item.availability.trim().toLowerCase() : "";
        const availability = /unavailable|sold out|out of stock/.test(status) ? "unavailable" : /limited/.test(status) ? "limited" : /^(available|in stock)$/.test(status) ? "available" : "enquire";
        const date = typeof item.addedAt === "string" ? Date.parse(item.addedAt) : NaN;
        result.push({ id, name, collection: typeof item.collection === "string" ? item.collection : "", price: priceValue(item.price), availability, addedAt: Number.isFinite(date) ? date : 0, featuredOrder: typeof item.featuredOrder === "number" && Number.isFinite(item.featuredOrder) ? item.featuredOrder : result.length, source, index, path: `home.${source}[${index}]` });
      });
    }
    return result;
  }, [data?.content]);
}

// Native query routing supports products added after the static export.
export function catalogProductHref(id: string) {
  return platformProductDetailHref(id);
}

export function catalogSelectionHref(id: string) {
  return `${withBasePath("/shop/")}?id=${encodeURIComponent(id)}#watch-${encodeURIComponent(id)}`;
}

export function collectionShopRoute(name: string, base = "/shop/") {
  try {
    const target = new URL(base || "/shop/", "https://aurel.invalid");
    target.searchParams.set("collection", name);
    return target.origin === "https://aurel.invalid" ? `${target.pathname}${target.search}${target.hash}` : target.href;
  } catch {
    return `/shop/?collection=${encodeURIComponent(name)}`;
  }
}

"use client";

import { EditableSection, useComponentStyle } from "@deneb-ui/ui";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import SiteChrome from "./SiteChrome";
import { ArrivalWatch, FeaturedWatch } from "./WatchBindings";
import { Arrow, Text, safeHref, useContent } from "./editable";
import { useCatalog } from "./catalog";

const QUERY_EVENT = "aurel-catalog-query";
function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(QUERY_EVENT, callback);
  return () => { window.removeEventListener("popstate", callback); window.removeEventListener(QUERY_EVENT, callback); };
}
const browserQuery = () => window.location.search;
const serverQuery = () => "";

export default function Shop() {
  const { text, list } = useContent();
  const entries = useCatalog();
  const queryString = useSyncExternalStore(subscribe, browserQuery, serverQuery);
  const params = useMemo(() => new URLSearchParams(queryString), [queryString]);
  const query = params.get("q") || "";
  const collection = params.get("collection") || "";
  const availability = params.get("availability") || "";
  const minimum = params.get("min") || "";
  const maximum = params.get("max") || "";
  const sorting = params.get("sort") || "featured";
  const selectedId = params.get("id") || "";
  const selected = entries.find(entry => entry.id === selectedId);
  const { cssVars } = useComponentStyle("shop.grid", "grid");
  const collections = list("home.collections");

  const filtered = useMemo(() => {
    const min = minimum && Number.isFinite(Number(minimum)) ? Math.max(0, Number(minimum)) : 0;
    const max = maximum && Number.isFinite(Number(maximum)) ? Math.max(0, Number(maximum)) : Infinity;
    const hasPriceRange = !!minimum || !!maximum;
    const matches = entries.filter(entry =>
      entry.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) &&
      (!collection || entry.collection.toLocaleLowerCase() === collection.toLocaleLowerCase()) &&
      (!availability || entry.availability === availability) &&
      (!hasPriceRange || (entry.price !== null && entry.price >= min && entry.price <= max))
    );
    return matches.sort((first, second) => {
      if (sorting === "newest") return second.addedAt - first.addedAt || first.featuredOrder - second.featuredOrder;
      if (sorting === "price-asc" || sorting === "price-desc") {
        if (first.price === null) return second.price === null ? 0 : 1;
        if (second.price === null) return -1;
        return sorting === "price-asc" ? first.price - second.price : second.price - first.price;
      }
      return first.featuredOrder - second.featuredOrder;
    });
  }, [entries, query, collection, availability, minimum, maximum, sorting]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(window.location.search);
    next.delete("id");
    if (!value || (key === "sort" && value === "featured")) next.delete(key);
    else next.set(key, value);
    const suffix = next.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${suffix ? `?${suffix}` : ""}`);
    window.dispatchEvent(new Event(QUERY_EVENT));
  };
  const reset = () => {
    window.history.replaceState(window.history.state, "", window.location.pathname);
    window.dispatchEvent(new Event(QUERY_EVENT));
  };
  useEffect(() => {
    if (!selected) return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(`watch-${selected.id}`);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "center", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [selected]);

  return <SiteChrome page="shop">
    <main>
      <EditableSection name="shop-intro" padding="none" className="catalog-intro" aria-labelledby="shop-title">
        <div className="shell">
          <div className="page-breadcrumb"><a href={safeHref(text("common.homeUrl"), "/")} data-preview-field-path="common.homeUrl"><Text data-preview-field-path="common.navLabels.home" /></a><span aria-hidden="true">/</span><Text data-preview-field-path="common.navLabels.shop" /></div>
          <div className="catalog-intro-row"><div><Text data-preview-field-path="shop.eyebrow" className="eyebrow" /><Text data-preview-field-path="shop.title" as="h1" id="shop-title" className="catalog-title" fallback="Find your next chapter." /></div><Text data-preview-field-path="shop.description" as="p" className="catalog-description" /></div>
          <Text data-preview-field-path="shop.note" as="p" className="catalog-note" />
        </div>
      </EditableSection>

      <EditableSection name="shop-catalog" id="catalog" padding="none" className="catalog-section" aria-labelledby="catalog-controls-title">
        <div className="shell">
          <form className="catalog-controls" onSubmit={event => event.preventDefault()}>
            <div className="catalog-control catalog-search"><label htmlFor="catalog-search" id="catalog-controls-title"><Text data-preview-field-path="shop.searchLabel" /></label><div className="catalog-search-input"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input id="catalog-search" name="q" type="search" value={query} onChange={event => update("q", event.target.value)} placeholder={text("shop.searchPlaceholder", "Search by watch name")} data-preview-field-path="shop.searchPlaceholder" autoComplete="off" /></div></div>
            <div className="catalog-control"><label htmlFor="catalog-collection"><Text data-preview-field-path="shop.collectionLabel" /></label><select id="catalog-collection" value={collection} onChange={event => update("collection", event.target.value)}><option value="" data-preview-field-path="shop.allCollectionsLabel">{text("shop.allCollectionsLabel", "All collections")}</option>{collection && !collections.some(item => item.name === collection) && <option value={collection} data-preview-static="active-query-collection">{collection}</option>}{collections.map((_, index) => <option key={index} value={text(`home.collections[${index}].name`)} data-preview-field-path={`home.collections[${index}].name`}>{text(`home.collections[${index}].name`, "Collection")}</option>)}</select></div>
            <fieldset className="catalog-control catalog-price"><legend><Text data-preview-field-path="shop.priceLabel" /></legend><div className="catalog-price-inputs"><label><Text data-preview-field-path="shop.minimumPriceLabel" className="price-input-label" /><input name="min" type="number" min="0" step="0.01" inputMode="decimal" value={minimum} onChange={event => update("min", event.target.value)} placeholder={text("shop.minimumPlaceholder", "From")} data-preview-field-path="shop.minimumPlaceholder" /></label><span aria-hidden="true">–</span><label><Text data-preview-field-path="shop.maximumPriceLabel" className="price-input-label" /><input name="max" type="number" min="0" step="0.01" inputMode="decimal" value={maximum} onChange={event => update("max", event.target.value)} placeholder={text("shop.maximumPlaceholder", "To")} data-preview-field-path="shop.maximumPlaceholder" /></label></div></fieldset>
            <div className="catalog-control"><label htmlFor="catalog-availability"><Text data-preview-field-path="shop.availabilityLabel" /></label><select id="catalog-availability" value={availability} onChange={event => update("availability", event.target.value)}><option value="" data-preview-field-path="shop.allAvailabilityLabel">{text("shop.allAvailabilityLabel", "All availability")}</option><option value="available" data-preview-field-path="shop.availabilityOptions.available">{text("shop.availabilityOptions.available", "Available")}</option><option value="limited" data-preview-field-path="shop.availabilityOptions.limited">{text("shop.availabilityOptions.limited", "Limited availability")}</option><option value="unavailable" data-preview-field-path="shop.availabilityOptions.unavailable">{text("shop.availabilityOptions.unavailable", "Unavailable")}</option><option value="enquire" data-preview-field-path="shop.availabilityOptions.enquire">{text("shop.availabilityOptions.enquire", "Enquire for availability")}</option></select></div>
          </form>

          <div className="catalog-toolbar"><div className="catalog-result-count" role="status" aria-live="polite"><span data-preview-static="filtered-catalog-count">{filtered.length}</span><Text data-preview-field-path="shop.resultsLabel" /></div><Text data-preview-field-path="shop.filterSummary" className="catalog-filter-summary" /><button type="button" className="text-link catalog-reset" onClick={reset}><Text data-preview-field-path="shop.resetLabel" /><span aria-hidden="true">↺</span></button><label className="catalog-sort"><Text data-preview-field-path="shop.sortLabel" /><select id="catalog-sort" value={sorting} onChange={event => update("sort", event.target.value)}><option value="featured" data-preview-field-path="shop.sortOptions.featured">{text("shop.sortOptions.featured", "Featured")}</option><option value="newest" data-preview-field-path="shop.sortOptions.newest">{text("shop.sortOptions.newest", "Newest")}</option><option value="price-asc" data-preview-field-path="shop.sortOptions.priceAsc">{text("shop.sortOptions.priceAsc", "Price: low to high")}</option><option value="price-desc" data-preview-field-path="shop.sortOptions.priceDesc">{text("shop.sortOptions.priceDesc", "Price: high to low")}</option></select></label></div>

          {selected && <div className="catalog-selection" role="status"><span><Text data-preview-field-path="shop.selectedLabel" /><Text path={`${selected.path}.name`} as="strong" /></span><Text data-preview-field-path="shop.selectionNote" as="p" /></div>}
          <div className="watch-grid catalog-grid" style={cssVars} data-preview-style-target="shop.grid" data-preview-style-type="grid">
            {filtered.map(entry => entry.source === "products"
              ? <div key={entry.id} data-preview-item-path={`home.products[${entry.index}]`}><FeaturedWatch index={entry.index} catalogId={entry.id} selected={entry.id === selectedId} /></div>
              : <div key={entry.id} data-preview-item-path={`home.arrivals[${entry.index}]`}><ArrivalWatch index={entry.index} catalogId={entry.id} selected={entry.id === selectedId} /></div>)}
          </div>
          {!filtered.length && <div className="catalog-empty" role="status"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg><Text data-preview-field-path="shop.emptyTitle" as="h2" /><Text data-preview-field-path="shop.emptyDescription" as="p" /><button type="button" className="button button-navy" onClick={reset}><Text data-preview-field-path="shop.resetLabel" /><Arrow /></button></div>}
        </div>
      </EditableSection>
    </main>
  </SiteChrome>;
}

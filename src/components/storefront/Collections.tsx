"use client";

import { EditableSection, useComponentStyle } from "@deneb-ui/ui";
import SiteChrome from "./SiteChrome";
import { Arrow, EditLink, Photo, Text, safeHref, useContent } from "./editable";
import { collectionShopRoute, useCatalog } from "./catalog";

export default function Collections() {
  const { text, list } = useContent();
  const entries = useCatalog();
  const { cssVars: linkStyles } = useComponentStyle("collectionsPage.collectionCta", "button");
  return <SiteChrome page="collections">
    <main>
      <EditableSection name="collections-intro" padding="none" className="collections-intro" aria-labelledby="collections-page-title">
        <div className="shell"><div className="page-breadcrumb"><a href={safeHref(text("common.homeUrl"), "/")} data-preview-field-path="common.homeUrl"><Text data-preview-field-path="common.navLabels.home" /></a><span aria-hidden="true">/</span><Text data-preview-field-path="common.navLabels.collections" /></div>
          <div className="collections-intro-grid"><div><Text data-preview-field-path="collectionsPage.eyebrow" className="eyebrow" /><Text data-preview-field-path="collectionsPage.title" as="h1" id="collections-page-title" className="catalog-title" fallback="Find your expression." /><Text data-preview-field-path="collectionsPage.description" as="p" className="catalog-description" /><EditLink hrefPath="collectionsPage.ctaUrl" labelPath="collectionsPage.ctaLabel" fallbackHref="/shop/" className="text-link" arrow /></div><Photo data-preview-field-path="collectionsPage.image" altPath="collectionsPage.imageAlt" className="collections-intro-image" eager /></div>
        </div>
      </EditableSection>
      <EditableSection name="collections-edit" id="collection-edit" padding="none" className="collection-edit-section">
        <div className="shell"><div className="collection-editorial-grid" data-preview-list-path="home.collections">{list("home.collections").map((_, index) => {
          const name = text(`home.collections[${index}].name`, "Collection");
          const destination = safeHref(collectionShopRoute(name, text(`home.collections[${index}].shopHref`, "/shop/")), "/shop/");
          const count = entries.filter(entry => entry.collection.toLowerCase() === name.toLowerCase()).length;
          return <article className="collection-editorial-card" key={index} data-preview-item-path={`home.collections[${index}]`}>
            <a href={destination} className="collection-editorial-image" data-preview-field-path={`home.collections[${index}].shopHref`}><Photo data-preview-field-path={`home.collections[${index}].image`} altPath={`home.collections[${index}].imageAlt`} /><span className="collection-editorial-index" data-preview-static="collection-index">{String(index + 1).padStart(2, "0")}</span></a>
            <div className="collection-editorial-copy"><div><Text data-preview-field-path={`home.collections[${index}].name`} as="h2" /><Text data-preview-field-path={`home.collections[${index}].description`} as="p" /><span className="collection-catalog-count"><span data-preview-static="derived-collection-count">{count}</span><Text data-preview-field-path="collectionsPage.countLabel" /></span></div><a href={destination} className="text-link edit-link" style={linkStyles} data-preview-style-target="collectionsPage.collectionCta" data-preview-style-type="button" data-preview-field-path={`home.collections[${index}].shopHref`}><Text data-preview-field-path="collectionsPage.collectionCta" /><Arrow /></a></div>
          </article>;
        })}</div><Text data-preview-field-path="collectionsPage.note" as="p" className="catalog-note collection-page-note" /></div>
      </EditableSection>
    </main>
  </SiteChrome>;
}

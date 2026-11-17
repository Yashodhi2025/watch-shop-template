"use client";

import { type CatalogEntry } from "./catalog";
import { Photo, Text, useContent } from "./editable";
import WatchDetailView from "./WatchDetailView";

// Keep both existing source lists explicit for strict Fivora nested-list editing.
export function FeaturedDetail({ entry, entries }: { entry: CatalogEntry; entries: CatalogEntry[] }) {
  const { list } = useContent();
  const index = entry.index;
  return <WatchDetailView entry={entry} entries={entries} data-preview-item-path={`home.products[${index}]`} fields={{
    name: <Text data-preview-field-path={`home.products[${index}].name`} as="h1" id={`watch-title-${entry.id}`} className="detail-title" fallback="Timepiece" />,
    collection: <Text data-preview-field-path={`home.products[${index}].collection`} className="eyebrow" fallback="The AUREL selection" />,
    price: <Text data-preview-field-path={`home.products[${index}].price`} className="detail-price" fallback="Price on request" />,
    availability: <Text data-preview-field-path={`home.products[${index}].availability`} fallback="Enquire for availability" />,
    reference: <Text data-preview-field-path={`home.products[${index}].reference`} fallback={entry.id} />,
    description: <Text data-preview-field-path={`home.products[${index}].description`} as="p" className="detail-summary" fallback="A considered expression of fine watchmaking." />,
    details: <Text data-preview-field-path={`home.products[${index}].details`} as="p" className="detail-description" fallback="Discover the character of this timepiece with our concierge." />,
    gallery: (active, select) => <div className="detail-gallery-list" data-preview-list-path={`home.products[${index}].gallery`}>{list(`home.products[${index}].gallery`).map((_, galleryIndex) => <div key={galleryIndex} data-preview-item-path={`home.products[${index}].gallery[${galleryIndex}]`}>
      <button type="button" className={`detail-thumbnail detail-crop-${(galleryIndex + 1) % 3}`} aria-pressed={active === galleryIndex + 1} onClick={() => select(galleryIndex + 1)}>
        <Photo data-preview-field-path={`home.products[${index}].gallery[${galleryIndex}].image`} altPath={`home.products[${index}].gallery[${galleryIndex}].imageAlt`} />
        <Text data-preview-field-path={`home.products[${index}].gallery[${galleryIndex}].caption`} fallback="Detail" />
      </button>
    </div>)}</div>,
    specifications: <dl data-preview-list-path={`home.products[${index}].specifications`} className="detail-spec-list">{list(`home.products[${index}].specifications`).map((_, specIndex) => <div key={specIndex} data-preview-item-path={`home.products[${index}].specifications[${specIndex}]`}>
      <dt><Text data-preview-field-path={`home.products[${index}].specifications[${specIndex}].label`} fallback="Detail" /></dt>
      <dd><Text data-preview-field-path={`home.products[${index}].specifications[${specIndex}].value`} fallback="Available on enquiry" /></dd>
    </div>)}</dl>,
  }} />;
}

export function ArrivalDetail({ entry, entries }: { entry: CatalogEntry; entries: CatalogEntry[] }) {
  const { list } = useContent();
  const index = entry.index;
  return <WatchDetailView entry={entry} entries={entries} data-preview-item-path={`home.arrivals[${index}]`} fields={{
    name: <Text data-preview-field-path={`home.arrivals[${index}].name`} as="h1" id={`watch-title-${entry.id}`} className="detail-title" fallback="Timepiece" />,
    collection: <Text data-preview-field-path={`home.arrivals[${index}].collection`} className="eyebrow" fallback="The AUREL selection" />,
    price: <Text data-preview-field-path={`home.arrivals[${index}].price`} className="detail-price" fallback="Price on request" />,
    availability: <Text data-preview-field-path={`home.arrivals[${index}].availability`} fallback="Enquire for availability" />,
    reference: <Text data-preview-field-path={`home.arrivals[${index}].reference`} fallback={entry.id} />,
    description: <Text data-preview-field-path={`home.arrivals[${index}].description`} as="p" className="detail-summary" fallback="A considered expression of fine watchmaking." />,
    details: <Text data-preview-field-path={`home.arrivals[${index}].details`} as="p" className="detail-description" fallback="Discover the character of this timepiece with our concierge." />,
    gallery: (active, select) => <div className="detail-gallery-list" data-preview-list-path={`home.arrivals[${index}].gallery`}>{list(`home.arrivals[${index}].gallery`).map((_, galleryIndex) => <div key={galleryIndex} data-preview-item-path={`home.arrivals[${index}].gallery[${galleryIndex}]`}>
      <button type="button" className={`detail-thumbnail detail-crop-${(galleryIndex + 1) % 3}`} aria-pressed={active === galleryIndex + 1} onClick={() => select(galleryIndex + 1)}>
        <Photo data-preview-field-path={`home.arrivals[${index}].gallery[${galleryIndex}].image`} altPath={`home.arrivals[${index}].gallery[${galleryIndex}].imageAlt`} />
        <Text data-preview-field-path={`home.arrivals[${index}].gallery[${galleryIndex}].caption`} fallback="Detail" />
      </button>
    </div>)}</div>,
    specifications: <dl data-preview-list-path={`home.arrivals[${index}].specifications`} className="detail-spec-list">{list(`home.arrivals[${index}].specifications`).map((_, specIndex) => <div key={specIndex} data-preview-item-path={`home.arrivals[${index}].specifications[${specIndex}]`}>
      <dt><Text data-preview-field-path={`home.arrivals[${index}].specifications[${specIndex}].label`} fallback="Detail" /></dt>
      <dd><Text data-preview-field-path={`home.arrivals[${index}].specifications[${specIndex}].value`} fallback="Available on enquiry" /></dd>
    </div>)}</dl>,
  }} />;
}

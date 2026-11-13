"use client";

import WatchCard from "./WatchCard";
import { Photo, Text } from "./editable";

// Explicit JSX paths let Fivora validate list addition and reordering statically,
// while WatchCard owns the shared presentation and behaviour.
type Props = { index: number; onEnquire: (name: string) => void };

export function FeaturedWatch({ index, onEnquire }: Props) {
  return <WatchCard path={`home.products[${index}]`} data-preview-field-path={`home.products[${index}].href`} onEnquire={onEnquire} fields={{
    image: <Photo data-preview-field-path={`home.products[${index}].image`} altPath={`home.products[${index}].imageAlt`} className="watch-image" />,
    badge: <Text data-preview-field-path={`home.products[${index}].badge`} fallback="THE AUREL EDIT" className="watch-badge" />,
    collection: <Text data-preview-field-path={`home.products[${index}].collection`} className="eyebrow watch-collection" />,
    name: <Text data-preview-field-path={`home.products[${index}].name`} as="h3" className="watch-name" />,
    description: <Text data-preview-field-path={`home.products[${index}].description`} as="p" className="watch-description" fallback="A considered expression of fine watchmaking." />,
    price: <Text data-preview-field-path={`home.products[${index}].price`} className="watch-price" fallback="Price on request" />,
    availability: <Text data-preview-field-path={`home.products[${index}].availability`} fallback="Enquire for availability" />,
  }} />;
}

export function ArrivalWatch({ index, onEnquire }: Props) {
  return <WatchCard path={`home.arrivals[${index}]`} data-preview-field-path={`home.arrivals[${index}].href`} onEnquire={onEnquire} fields={{
    image: <Photo data-preview-field-path={`home.arrivals[${index}].image`} altPath={`home.arrivals[${index}].imageAlt`} className="watch-image" />,
    badge: <Text data-preview-field-path={`home.arrivals[${index}].badge`} fallback="THE AUREL EDIT" className="watch-badge" />,
    collection: <Text data-preview-field-path={`home.arrivals[${index}].collection`} className="eyebrow watch-collection" />,
    name: <Text data-preview-field-path={`home.arrivals[${index}].name`} as="h3" className="watch-name" />,
    description: <Text data-preview-field-path={`home.arrivals[${index}].description`} as="p" className="watch-description" fallback="A considered expression of fine watchmaking." />,
    price: <Text data-preview-field-path={`home.arrivals[${index}].price`} className="watch-price" fallback="Price on request" />,
    availability: <Text data-preview-field-path={`home.arrivals[${index}].availability`} fallback="Enquire for availability" />,
  }} />;
}

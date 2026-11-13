"use client";

import { useComponentStyle } from "@deneb-ui/ui";
import type { ReactNode } from "react";
import { Arrow, Text, safeHref, useContent } from "./editable";
import { catalogProductHref } from "./catalog";

type Fields = Record<"image" | "badge" | "collection" | "name" | "description" | "price" | "availability", ReactNode>;

export default function WatchCard({ path, "data-preview-field-path": hrefPath, fields, onEnquire, catalogId, selected = false }: { path: string; "data-preview-field-path": string; fields: Fields; onEnquire?: (name: string) => void; catalogId?: string; selected?: boolean }) {
  const { text } = useContent();
  const { cssVars } = useComponentStyle(path, "card", { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, borderRadius: 0 });
  const destination = catalogId ? catalogProductHref(catalogId) : safeHref(text(hrefPath));
  const actionPath = catalogId ? `${path}.id` : hrefPath;
  const select = () => onEnquire?.(text(`${path}.name`, "Selected timepiece"));
  return <article id={catalogId ? `watch-${catalogId}` : undefined} tabIndex={catalogId ? -1 : undefined} className={`deneb-card watch-card${selected ? " is-selected" : ""}`} style={cssVars} data-preview-style-target={path} data-preview-style-type="card">
    <a href={destination} className="watch-image-link" data-preview-field-path={actionPath} onClick={select}>
      {fields.image}{fields.badge}
      <span className="watch-reveal"><Text path={catalogId ? "shop.actionLabel" : "home.enquireLabel"} fallback={catalogId ? "View in catalog" : "Enquire about this watch"} /><Arrow /></span>
    </a>
    <div className="watch-info">
      {fields.collection}
      <a href={destination} onClick={select} data-preview-field-path={actionPath}>{fields.name}</a>
      {fields.description}
      <div className="watch-meta">{fields.price}<span className="watch-stock"><i />{fields.availability}</span></div>
    </div>
  </article>;
}

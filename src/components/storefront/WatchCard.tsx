"use client";

import { useComponentStyle } from "@deneb-ui/ui";
import type { ReactNode } from "react";
import { Arrow, Text, safeHref, useContent } from "./editable";

type Fields = Record<"image" | "badge" | "collection" | "name" | "description" | "price" | "availability", ReactNode>;

export default function WatchCard({ path, "data-preview-field-path": hrefPath, fields, onEnquire }: { path: string; "data-preview-field-path": string; fields: Fields; onEnquire: (name: string) => void }) {
  const { text } = useContent();
  const { cssVars } = useComponentStyle(path, "card", { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, borderRadius: 0 });
  return <article className="deneb-card watch-card" style={cssVars} data-preview-style-target={path} data-preview-style-type="card">
    <a href={safeHref(text(hrefPath))} className="watch-image-link" data-preview-field-path={hrefPath} onClick={() => onEnquire(text(`${path}.name`, "Selected timepiece"))}>
      {fields.image}{fields.badge}
      <span className="watch-reveal"><Text data-preview-field-path="home.enquireLabel" fallback="Enquire about this watch" /><Arrow /></span>
    </a>
    <div className="watch-info">
      {fields.collection}
      <a href={safeHref(text(hrefPath))} onClick={() => onEnquire(text(`${path}.name`, "Selected timepiece"))} data-preview-field-path={hrefPath}>{fields.name}</a>
      {fields.description}
      <div className="watch-meta">{fields.price}<span className="watch-stock"><i />{fields.availability}</span></div>
    </div>
  </article>;
}

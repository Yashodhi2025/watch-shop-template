"use client";

import { EditableImage, EditableText, useComponentStyle, useSiteData, withBasePath } from "@deneb-ui/ui";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

export function atPath(value: unknown, path: string): unknown {
  return path.replace(/\[(\d+)\]/g, ".$1").split(".").reduce<unknown>((current, key) =>
    current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined, value);
}

export function useContent() {
  const data = useSiteData();
  const text = (path: string, fallback = "") => {
    const value = atPath(data?.content, path);
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return typeof value === "string" && value.trim() ? value : fallback;
  };
  const list = (path: string): Record<string, unknown>[] => {
    const value = atPath(data?.content, path);
    return Array.isArray(value) ? value.map((item) => item && typeof item === "object" && !Array.isArray(item) ? item : {}) : [];
  };
  return { data, text, list };
}

export function Text({ path: suppliedPath, "data-preview-field-path": fieldPath, fallback = "Discover", id, ...props }: Omit<ComponentProps<typeof EditableText>, "id"> & { path?: string; fallback?: string; id?: string }) {
  const path = fieldPath || suppliedPath || "";
  const { text } = useContent();
  const element = <EditableText {...props} data-preview-field-path={path}>{text(path, fallback)}</EditableText>;
  return id ? <div id={id} style={{ display: "contents" }}>{element}</div> : element;
}

const anchors = new Set(["#top", "#featured", "#collections", "#story", "#arrivals", "#reviews", "#newsletter", "#contact", "#watch-story"]);
export function safeHref(raw: string, fallback = "#contact") {
  if (anchors.has(raw)) return raw;
  if (/^\/(?:shop\/?|collections\/?|products\/detail\/?)?(?:[?#].*)?$/.test(raw)) return withBasePath(raw);
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(raw)) return raw;
  return fallback;
}

export function EditLink({ hrefPath, labelPath, fallbackHref = "#featured", className = "", arrow = false, onClick, children }: {
  hrefPath: string; labelPath: string; fallbackHref?: string; className?: string; arrow?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>; children?: ReactNode;
}) {
  const { text } = useContent();
  const { cssVars } = useComponentStyle(labelPath, "button");
  return <a href={safeHref(text(hrefPath), fallbackHref)} className={`edit-link ${className}`} style={cssVars} onClick={onClick}
    data-preview-field-path={hrefPath} data-preview-style-target={labelPath} data-preview-style-type="button">
    <Text path={labelPath} />{children}{arrow && <Arrow />}
  </a>;
}

export function Photo({ path: suppliedPath, "data-preview-field-path": fieldPath, altPath, className = "", eager = false, style }: { path?: string; "data-preview-field-path"?: string; altPath: string; className?: string; eager?: boolean; style?: CSSProperties }) {
  const path = fieldPath || suppliedPath || "";
  const { text } = useContent();
  const fallback = "/images/watch-hero.webp";
  return <EditableImage key={text(path, fallback)} data-preview-field-path={path} src={text(path, fallback)} fallbackSrc={fallback}
    alt={text(altPath, "A finely crafted luxury timepiece")} className={className} style={style}
    loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async"
    onError={(event) => { const image = event.currentTarget; if (image.dataset.fallback !== "true") { image.dataset.fallback = "true"; image.src = withBasePath(fallback); } }} />;
}

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"} /></svg>;
}

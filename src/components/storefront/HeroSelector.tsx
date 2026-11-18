"use client";

import { EditableImage, EditableSection, withBasePath } from "@deneb-ui/ui";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type SyntheticEvent } from "react";
import { atPath, EditLink, Text, useContent } from "./editable";

function recoverImage(event: SyntheticEvent<HTMLImageElement>, fallback: string) {
  const image = event.currentTarget;
  const source = withBasePath(fallback);
  if (image.getAttribute("src") !== source) image.src = source;
}

export default function HeroSelector() {
  const { data, text } = useContent();
  const [selection, setSelection] = useState(0);
  const [editing, setEditing] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [rotationReset, setRotationReset] = useState(0);
  const thumbnails = useRef<HTMLDivElement>(null);
  const navigation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(media.matches);
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncMotion(); syncVisibility();
    media.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => { media.removeEventListener("change", syncMotion); document.removeEventListener("visibilitychange", syncVisibility); };
  }, []);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (event.data?.type === "FIVORA_PREVIEW_EDIT_MODE") setEditing(event.data.editMode === true);
      if (event.data?.type === "FIVORA_PREVIEW_FOCUS_PAGE") {
        const match = /^home\.heroWatch([123])Image$/.exec(event.data.fieldPath || "");
        if (match) setSelection(Number(match[1]) - 1);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  const settings = (index: number) => {
    const prefix = `home.heroWatch${index}`;
    const numeric = (suffix: string, fallback: number, min: number, max: number) => {
      const value = Number.parseFloat(text(prefix + suffix, String(fallback)));
      return Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback));
    };
    const visibility = atPath(data?.content, prefix + "Visible");
    return {
      visible: visibility !== false && String(visibility).toLowerCase() !== "false",
      style: {
        "--hero-watch-scale": numeric("Scale", 1, .45, 1.35),
        "--hero-watch-x": numeric("X", 0, -18, 18) + "%",
        "--hero-watch-y": numeric("Y", 0, -16, 16) + "%",
        "--hero-watch-rotation": numeric("Rotation", 0, -18, 18) + "deg",
      } as CSSProperties,
    };
  };
  const watches = [settings(1), settings(2), settings(3)];
  const available = watches.flatMap((watch, index) => watch.visible ? [index] : []);
  const active = available.includes(selection) ? selection : (available[0] ?? -1);
  const availableKey = available.join(",");
  const rotating = autoplay && !editing && !reducedMotion && pageVisible && available.length > 1;
  useEffect(() => {
    if (!rotating) return;
    const indices = availableKey.split(",").map(Number);
    const timeout = window.setTimeout(() => setSelection(indices[(indices.indexOf(active) + 1) % indices.length]), 4000);
    return () => window.clearTimeout(timeout);
  }, [active, availableKey, rotating, rotationReset]);
  const choose = (index: number) => { setSelection(index); setRotationReset(value => value + 1); };
  const labels = [text("home.heroWatch1Label", "Black chronograph"), text("home.heroWatch2Label", "Silver edition"), text("home.heroWatch3Label", "Blue chronograph")];
  const move = (step: number, focus = false) => {
    if (!available.length) return;
    const next = available[(available.indexOf(active) + step + available.length) % available.length];
    choose(next);
    if (focus) thumbnails.current?.querySelector<HTMLButtonElement>(`[data-watch-index="${next}"]`)?.focus();
  };
  useEffect(() => {
    if (!editing) return;
    // The document-level editor bridge can promote even a static arrow click
    // to its containing section. Handle only these navigation buttons first;
    // all image/text clicks still reach Deneb's normal selection bridge.
    const onNavigation = (event: MouseEvent) => {
      const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-hero-step]") : null;
      if (!button || !navigation.current?.contains(button) || button.disabled) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      move(Number(button.dataset.heroStep));
    };
    window.addEventListener("click", onNavigation, true);
    return () => window.removeEventListener("click", onNavigation, true);
  });
  const onThumbnailKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).isContentEditable || !available.length) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1, true);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home" ? available[0] : available[available.length - 1];
      choose(next);
      thumbnails.current?.querySelector<HTMLButtonElement>(`[data-watch-index="${next}"]`)?.focus();
    }
  };
  return <EditableSection name="hero" padding="none" className="hero hero-selector" aria-labelledby="hero-title" data-hero-editing={editing ? "true" : "false"} data-autoplay={rotating ? "true" : "false"}
  >
    <div className="hero-image-wrap">
      <EditableImage data-preview-field-path="home.heroBackgroundImage" src={text("home.heroBackgroundImage", "/images/hero-background.webp")} alt={text("home.heroBackgroundImageAlt", "Navy campaign backdrop")} fallbackSrc="/images/hero-background.webp" onError={event => recoverImage(event, "/images/hero-background.webp")} fit="cover" className="hero-background-image" loading="eager" fetchPriority="high" />
      <div className="hero-light hero-light-one" aria-hidden="true" /><div className="hero-light hero-light-two" aria-hidden="true" /><div className="hero-shade" aria-hidden="true" />
    </div>
    <div className="hero-content shell">
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow"><span /><Text data-preview-field-path="home.pageTsx" fallback="THE ART OF TIME" /></div>
        <Text data-preview-field-path="home.title" fallback="Timeless by Design." as="h1" id="hero-title" className="hero-title" />
        <Text data-preview-field-path="home.subtitle" as="p" className="hero-description" fallback="Exceptional timepieces for the moments that matter." />
        <div className="hero-ctas"><EditLink hrefPath="home.templatesUrl" labelPath="home.templatesLabel" className="button button-gold" arrow /><EditLink hrefPath="home.learningUrl" labelPath="home.learningLabel" fallbackHref="#story" className="text-link hero-story" /></div>
      </div>
      <div id="hero-featured-watch" className="hero-timepieces" data-active-watch={active}>
        <div className="hero-watch-wrap hero-watch-one" data-active={active === 0} style={watches[0].style} aria-hidden={active !== 0} inert={active !== 0}>
          <div className="hero-watch-motion"><EditableImage data-preview-static="hero-watch-1-image" src={text("home.heroWatch1Image", "/images/watch-black.png")} alt={text("home.heroWatch1ImageAlt", labels[0])} fallbackSrc="/images/watch-black.png" onError={event => recoverImage(event, "/images/watch-black.png")} fit="contain" className="hero-watch-image" loading="eager" decoding="async" /></div>
        </div>
        <div className="hero-watch-wrap hero-watch-two" data-active={active === 1} style={watches[1].style} aria-hidden={active !== 1} inert={active !== 1}>
          <div className="hero-watch-motion"><EditableImage data-preview-static="hero-watch-2-image" src={text("home.heroWatch2Image", "/images/watch-silver.png")} alt={text("home.heroWatch2ImageAlt", labels[1])} fallbackSrc="/images/watch-silver.png" onError={event => recoverImage(event, "/images/watch-silver.png")} fit="contain" className="hero-watch-image" loading="eager" decoding="async" /></div>
        </div>
        <div className="hero-watch-wrap hero-watch-three" data-active={active === 2} style={watches[2].style} aria-hidden={active !== 2} inert={active !== 2}>
          <div className="hero-watch-motion"><EditableImage data-preview-static="hero-watch-3-image" src={text("home.heroWatch3Image", "/images/watch-blue.png")} alt={text("home.heroWatch3ImageAlt", labels[2])} fallbackSrc="/images/watch-blue.png" onError={event => recoverImage(event, "/images/watch-blue.png")} fit="contain" className="hero-watch-image" loading="eager" decoding="async" /></div>
        </div>
      </div>
      <div className="hero-selection">
        <div className="hero-thumbnails" ref={thumbnails} onKeyDown={onThumbnailKey}>
          <button type="button" className="hero-thumbnail" data-watch-index="0" aria-pressed={active === 0} aria-controls="hero-featured-watch" aria-label={`Feature ${labels[0]}`} data-preview-field-path="home.heroWatch1Label" onClick={() => choose(0)}>
            <span className="hero-thumbnail-frame" data-preview-field-path="home.heroWatch1Thumbnail"><EditableImage data-preview-field-path="home.heroWatch1Image" src={text("home.heroWatch1Thumbnail", text("home.heroWatch1Image", "/images/watch-black.png"))} alt={text("home.heroWatch1ThumbnailAlt", labels[0])} fallbackSrc="/images/watch-black.png" onError={event => recoverImage(event, "/images/watch-black.png")} fit="contain" className="hero-thumbnail-image" /></span>
            <Text fallback="Black chronograph" />
          </button>
          <button type="button" className="hero-thumbnail" data-watch-index="1" aria-pressed={active === 1} aria-controls="hero-featured-watch" aria-label={`Feature ${labels[1]}`} data-preview-field-path="home.heroWatch2Label" onClick={() => choose(1)}>
            <span className="hero-thumbnail-frame" data-preview-field-path="home.heroWatch2Thumbnail"><EditableImage data-preview-field-path="home.heroWatch2Image" src={text("home.heroWatch2Thumbnail", text("home.heroWatch2Image", "/images/watch-silver.png"))} alt={text("home.heroWatch2ThumbnailAlt", labels[1])} fallbackSrc="/images/watch-silver.png" onError={event => recoverImage(event, "/images/watch-silver.png")} fit="contain" className="hero-thumbnail-image" /></span>
            <Text fallback="Silver edition" />
          </button>
          <button type="button" className="hero-thumbnail" data-watch-index="2" aria-pressed={active === 2} aria-controls="hero-featured-watch" aria-label={`Feature ${labels[2]}`} data-preview-field-path="home.heroWatch3Label" onClick={() => choose(2)}>
            <span className="hero-thumbnail-frame" data-preview-field-path="home.heroWatch3Thumbnail"><EditableImage data-preview-field-path="home.heroWatch3Image" src={text("home.heroWatch3Thumbnail", text("home.heroWatch3Image", "/images/watch-blue.png"))} alt={text("home.heroWatch3ThumbnailAlt", labels[2])} fallbackSrc="/images/watch-blue.png" onError={event => recoverImage(event, "/images/watch-blue.png")} fit="contain" className="hero-thumbnail-image" /></span>
            <Text fallback="Blue chronograph" />
          </button>
        </div>
        <div className="hero-selector-arrows" ref={navigation}>
          <button type="button" aria-label="Previous featured watch" data-hero-step="-1" data-preview-static="hero-previous-watch" disabled={available.length < 2} onClick={() => move(-1)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6" /></svg></button>
          <button type="button" aria-label="Next featured watch" data-hero-step="1" data-preview-static="hero-next-watch" disabled={available.length < 2} onClick={() => move(1)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg></button>
          <button type="button" className="hero-autoplay-toggle" aria-label={text(autoplay ? "home.heroPauseLabel" : "home.heroPlayLabel", autoplay ? "Pause watch rotation" : "Resume watch rotation")} aria-pressed={!autoplay} data-preview-static="hero-autoplay-toggle" disabled={editing || reducedMotion || available.length < 2} onClick={() => setAutoplay(value => !value)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{autoplay ? <path d="M8 5v14M16 5v14" /> : <path d="m9 5 11 7-11 7Z" />}</svg>
          </button>
        </div>
      </div>
      <p className="hero-selector-status" role="status" aria-live={rotating ? "off" : "polite"} aria-atomic="true" data-preview-static="hero-selector-status">{active >= 0 ? `Featured timepiece: ${labels[active]}` : "No featured timepiece available"}</p>
      <div className="hero-bottom"><Text data-preview-field-path="home.heroEdition" /><span className="hero-line" /><Text data-preview-field-path="home.heroCaption" /><span className="hero-scroll" aria-hidden="true">&darr;</span></div>
    </div>
  </EditableSection>;
}

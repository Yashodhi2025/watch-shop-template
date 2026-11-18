"use client";
import { EditableIcon, EditableSection } from "@deneb-ui/ui";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Arrow, EditLink, Photo, Text, safeHref, useContent } from "./editable";
import { ArrivalWatch, FeaturedWatch } from "./WatchBindings";
import SiteChrome from "./SiteChrome";
import HeroSelector from "./HeroSelector";
import { useCatalog } from "./catalog";
import { safeIntroColor } from "./IntroAnimation";
function BenefitGlyph({ children }: { children: React.ReactNode }) {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}
const benefitIcons = {
  "shield-check": <BenefitGlyph><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></BenefitGlyph>,
  lock: <BenefitGlyph><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></BenefitGlyph>,
  truck: <BenefitGlyph><path d="M2 5h12v13H2zM14 10h5l3 4v4h-8" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></BenefitGlyph>,
};


export default function Storefront() {
  const { text, list } = useContent();
  const [activeCollection, setActiveCollection] = useState("");
  const [selectedWatch, setSelectedWatch] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [introEditing, setIntroEditing] = useState(false);
  const emailInput = useRef<HTMLInputElement>(null);
  const introGateStarted = useRef(false);
  const introDuration = Math.max(1, Math.min(10, Number(text("home.introDuration", "3")) || 3));
  useEffect(() => {
    if (introGateStarted.current) return;
    introGateStarted.current = true;
    const key = "aurel-cinematic-intro-v1";
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    try {
      if (sessionStorage.getItem(key) === "seen" || media.matches) setIntroVisible(false);
      else sessionStorage.setItem(key, "seen");
    } catch {}
  }, []);
  useEffect(() => {
    const onEditMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (event.data?.type === "FIVORA_PREVIEW_EDIT_MODE") {
        const editing = event.data.editMode === true;
        setIntroEditing(editing);
        if (editing) setIntroVisible(false);
      }
    };
    window.addEventListener("message", onEditMessage);
    return () => window.removeEventListener("message", onEditMessage);
  }, []);
  useEffect(() => {
    if (!introVisible || introEditing) return;
    const timeout = window.setTimeout(() => setIntroVisible(false), introDuration * 1000);
    return () => window.clearTimeout(timeout);
  }, [introVisible, introEditing, introDuration]);
  const products = list("home.products");
  const arrivals = list("home.arrivals");
  const catalog = useCatalog();
  const enquire = (name: string) => setSelectedWatch(name);
  const introBackground = safeIntroColor(text("home.introBackgroundColor", "#080d18"), "#080d18");
  const introDial = safeIntroColor(text("home.introDialColor", "#c4a46a"), "#c4a46a");
  const introStyles = {"--intro-background":introBackground,"--intro-dial":introDial,"--intro-duration":`${introDuration}s`} as CSSProperties;
  return <SiteChrome page="home" selectedWatch={selectedWatch} onEnquire={enquire}>
    <main>
      {introVisible && !introEditing && <div className="aurel-cinematic-intro" style={introStyles}>
        <div className="aurel-intro-glow" aria-hidden="true" />
        <svg className="aurel-intro-dial" viewBox="0 0 220 220">
          <circle className="aurel-dial-ring" cx="110" cy="110" r="94" data-preview-field-path="home.introDialColor" />
          <circle className="aurel-dial-ring aurel-dial-ring-inner" cx="110" cy="110" r="76" />
          {Array.from({ length: 12 }, (_, index) => <line key={index} className="aurel-dial-tick" x1="110" y1="22" x2="110" y2={index % 3 === 0 ? "36" : "30"} transform={`rotate(${index * 30} 110 110)`} />)}
          <line className="aurel-hour-hand" x1="110" y1="112" x2="110" y2="68" />
          <line className="aurel-minute-hand" x1="110" y1="112" x2="110" y2="48" />
          <g className="aurel-second-hand">
            <line x1="110" y1="132" x2="110" y2="43" />
            <circle cx="110" cy="110" r="4" />
          </g>
        </svg>
        <div className="aurel-intro-logo">
          <Text data-preview-field-path="home.introLogo" fallback="AUREL" className="aurel-intro-name" />
          <Text data-preview-field-path="home.introTagline" fallback="TIMEPIECES" className="aurel-intro-subtitle" />
        </div>
        <button type="button" className="aurel-intro-skip" data-preview-field-path="home.introDuration" onClick={() => setIntroVisible(false)}><span data-preview-field-path="home.introBackgroundColor">Skip</span></button>
      </div>}
      <HeroSelector />

      <EditableSection name="benefits" padding="none" className="benefits">
        <div className="benefit-grid shell" data-preview-list-path="home.benefits">{list("home.benefits").map((_, index) => <div key={index} className="benefit" data-preview-item-path={`home.benefits[${index}]`}>
          <EditableIcon iconMap={benefitIcons} aria-hidden={false} data-preview-field-path={`home.benefits[${index}].icon`} fieldPath={`home.benefits[${index}].icon`} name={text(`home.benefits[${index}].icon`, "shield-check")} size={28} strokeWidth={1.2} />
          <div><Text data-preview-field-path={`home.benefits[${index}].title`} as="h2" /><Text data-preview-field-path={`home.benefits[${index}].text`} as="p" /></div>
        </div>)}</div>
      </EditableSection>

      <EditableSection name="featured" padding="none" className="section-pad" aria-labelledby="featured-title">
        <div className="shell"><div className="section-heading"><div><Text data-preview-field-path="home.featuredEyebrow" className="eyebrow" /><Text data-preview-field-path="home.featuredTitle" as="h2" id="featured-title" className="section-title" /><Text data-preview-field-path="home.featuredDescription" as="p" className="section-description" /></div><EditLink hrefPath="home.documentationUrl" labelPath="home.documentationLabel" className="text-link" arrow onClick={() => setActiveCollection("")} /></div>
          {activeCollection && <div className="filter-status"><span>{activeCollection}</span><button type="button" className="text-link" onClick={() => setActiveCollection("")}><Text data-preview-field-path="home.allLabel" /><span aria-hidden="true">&times;</span></button></div>}
          <div className="watch-grid" data-preview-list-path="home.products">{products.map((watch, index) => <div key={index} hidden={!!activeCollection && watch.collection !== activeCollection} data-preview-item-path={`home.products[${index}]`}><FeaturedWatch index={index} catalogId={catalog.find(entry => entry.source === "products" && entry.index === index)?.id} /></div>)}</div>
        </div>
      </EditableSection>

      <EditableSection name="collections" padding="none" className="collections-section section-pad" aria-labelledby="collections-title">
        <div className="shell"><div className="section-heading"><div><Text data-preview-field-path="home.collectionsEyebrow" className="eyebrow" /><Text data-preview-field-path="home.collectionsTitle" as="h2" id="collections-title" className="section-title" /></div><span className="collection-count" data-preview-static="collection-count">01 &mdash; 04</span></div>
          <div className="collection-grid" data-preview-list-path="home.collections">{list("home.collections").map((_, index) => <article className="collection-card" key={index} data-preview-item-path={`home.collections[${index}]`}>
            <a href={safeHref(text(`home.collections[${index}].href`), "#featured")} data-preview-field-path={`home.collections[${index}].href`} onClick={() => setActiveCollection(text(`home.collections[${index}].name`))}>
              <Photo data-preview-field-path={`home.collections[${index}].image`} altPath={`home.collections[${index}].imageAlt`} /><div className="collection-overlay" />
              <span className="collection-index" data-preview-static="collection-index">0{index + 1}</span>
              <div className="collection-copy"><Text data-preview-field-path={`home.collections[${index}].name`} as="h3" /><Text data-preview-field-path={`home.collections[${index}].description`} as="p" /><span className="collection-action"><Text data-preview-field-path="home.collectionCta" /><Arrow diagonal /></span></div>
            </a>
          </article>)}</div>
        </div>
      </EditableSection>

      <EditableSection name="story" padding="none" className="story-section" aria-labelledby="story-title">
        <div className="story-image"><Photo data-preview-field-path="home.vercelLogomarkImage" altPath="home.storyImageAlt" /><span className="story-image-caption"><Text data-preview-field-path="home.storyCaption" /></span></div>
        <div className="story-copy"><Text data-preview-field-path="home.storyEyebrow" className="eyebrow" /><Text data-preview-field-path="home.storyTitle" as="h2" id="story-title" className="section-title" /><Text data-preview-field-path="home.storyDescription" as="p" /><Text data-preview-field-path="home.storyDetail" as="p" className="story-detail" /><EditLink hrefPath="home.storyUrl" labelPath="home.storyLabel" fallbackHref="#story" className="text-link" arrow /></div>
      </EditableSection>

      <EditableSection name="arrivals" padding="none" className="section-pad" aria-labelledby="arrivals-title">
        <div className="shell"><div className="section-heading"><div><Text data-preview-field-path="home.arrivalsEyebrow" className="eyebrow" /><Text data-preview-field-path="home.arrivalsTitle" as="h2" id="arrivals-title" className="section-title" /><Text data-preview-field-path="home.arrivalsDescription" as="p" className="section-description" /></div><EditLink hrefPath="home.deployNowUrl" labelPath="home.deployNowLabel" fallbackHref="#arrivals" className="text-link" arrow /></div>
          <div className="watch-grid" data-preview-list-path="home.arrivals">{arrivals.map((_, index) => <div key={index} data-preview-item-path={`home.arrivals[${index}]`}><ArrivalWatch index={index} catalogId={catalog.find(entry => entry.source === "arrivals" && entry.index === index)?.id} /></div>)}</div>
        </div>
      </EditableSection>

      <EditableSection name="reviews" padding="none" className="reviews-section section-pad" aria-labelledby="reviews-title">
        <div className="shell"><div className="center-heading"><Text data-preview-field-path="home.reviewsEyebrow" className="eyebrow" /><Text data-preview-field-path="home.reviewsTitle" as="h2" id="reviews-title" className="section-title" /></div>
          <div className="review-grid" data-preview-list-path="home.reviews">{list("home.reviews").map((_, index) => <figure className="review-card" key={index} data-preview-item-path={`home.reviews[${index}]`}>
            <Text data-preview-field-path={`home.reviews[${index}].rating`} className="review-stars" fallback="★★★★★" /><Text data-preview-field-path={`home.reviews[${index}].quote`} as="blockquote" /><figcaption><Text data-preview-field-path={`home.reviews[${index}].name`} as="p" /><Text data-preview-field-path={`home.reviews[${index}].detail`} as="p" /></figcaption>
          </figure>)}</div><Text data-preview-field-path="home.reviewsNote" as="p" className="demo-note center-note" />
        </div>
      </EditableSection>

      <EditableSection name="newsletter" padding="none" className="newsletter-section section-pad" aria-labelledby="newsletter-title">
        <div className="shell newsletter-inner"><div><Text data-preview-field-path="home.newsletterEyebrow" className="eyebrow" /><Text data-preview-field-path="home.newsletterTitle" as="h2" id="newsletter-title" className="section-title" /><Text data-preview-field-path="home.newsletterDescription" as="p" /></div>
          <form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); if (emailInput.current?.checkValidity()) { setSubscribed(true); emailInput.current.value = ""; } }}>
            <label htmlFor="newsletter-email" className="email-label"><Text data-preview-field-path="home.emailLabel" fallback="Email address" /></label>
            <div className="newsletter-input-row"><input ref={emailInput} type="email" id="newsletter-email" name="email" data-preview-field-path="home.emailPlaceholder" placeholder={text("home.emailPlaceholder", "Enter your email address")} required autoComplete="email" maxLength={254} onChange={() => setSubscribed(false)} /><button type="submit"><Text data-preview-field-path="home.newsletterButton" fallback="Join the list" /><Arrow /></button></div>
            <Text data-preview-field-path="home.newsletterDemo" as="p" className="demo-note" />
            <div className="newsletter-status" role="status">{subscribed && <Text data-preview-field-path="home.newsletterSuccess" />}</div>
          </form>
        </div>
      </EditableSection>
    </main>


  </SiteChrome>;
}

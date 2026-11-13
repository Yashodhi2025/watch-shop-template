"use client";

import { EditableIcon, EditableSection } from "@deneb-ui/ui";
import { useEffect, useRef, useState } from "react";
import { Arrow, EditLink, Photo, Text, safeHref, useContent } from "./editable";
import { ArrivalWatch, FeaturedWatch } from "./WatchBindings";

const nav = [["home", "#top"], ["shop", "#featured"], ["collections", "#collections"], ["about", "#story"], ["contact", "#contact"]];
function BenefitGlyph({ children }: { children: React.ReactNode }) {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}
const benefitIcons = {
  "shield-check": <BenefitGlyph><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></BenefitGlyph>,
  lock: <BenefitGlyph><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></BenefitGlyph>,
  truck: <BenefitGlyph><path d="M2 5h12v13H2zM14 10h5l3 4v4h-8" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></BenefitGlyph>,
};

function Mark() {
  return <svg className="brand-mark" width="32" height="36" viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="m3 29 13-24 13 24M8 22h16M11 29l5-10 5 10M16 0v5M0 32h32" stroke="currentColor" strokeWidth="1.25" /></svg>;
}

function Brand() {
  const { text } = useContent();
  return <a className="brand" href={safeHref(text("common.homeUrl"), "#top")} data-preview-field-path="common.homeUrl" aria-label={`${text("common.websiteTitle", "AUREL")} home`}>
    {text("common.logoUrl") ? <Photo data-preview-field-path="common.logoUrl" altPath="common.websiteTitle" className="brand-logo" /> : <Mark />}
    <span className="brand-type"><Text data-preview-field-path="common.websiteTitle" fallback="AUREL" /><Text data-preview-field-path="common.wordmarkSubtitle" fallback="TIMEPIECES" className="brand-subtitle" /></span>
  </a>;
}

export default function Storefront() {
  const { text, list } = useContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState("");
  const [selectedWatch, setSelectedWatch] = useState("");
  const [query, setQuery] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const bagDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const products = list("home.products");
  const arrivals = list("home.arrivals");
  const allProducts = [...products.map((watch, index) => ({ watch, path: `home.products[${index}]` })), ...arrivals.map((watch, index) => ({ watch, path: `home.arrivals[${index}]` }))];
  const results = allProducts.filter(({ watch }) => `${watch.name || ""} ${watch.collection || ""}`.toLowerCase().includes(query.toLowerCase().trim()));

  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, []);

  const enquire = (name: string) => { setSelectedWatch(name); searchDialog.current?.close(); setMenuOpen(false); };
  const closeOnBackdrop = (event: React.MouseEvent<HTMLDialogElement>) => { if (event.target === event.currentTarget) event.currentTarget.close(); };

  return <div id="top" className="storefront" data-preview-page-key="home">
    <a className="skip-link" href="#featured" data-preview-static="accessibility">Skip to timepieces</a>
    <div className="announcement" data-design-section="announcement"><span className="announcement-spacer" /><Text data-preview-field-path="common.announcement" fallback="Discover the AUREL collection" /><span className="announcement-detail"><Text data-preview-field-path="common.announcementDetail" /></span></div>
    <header className="site-header" data-design-section="navigation">
      <div className="header-inner shell">
        <Brand />
        <nav className="desktop-nav">{nav.map(([key, href]) => <a key={key} href={safeHref(text(`common.navUrls.${key}`), href)} data-preview-field-path={"common.navUrls." + key} onClick={() => setActiveCollection("")} className={key === "home" ? "nav-current" : ""}><Text path={`common.navLabels.${key}`} fallback={key} /></a>)}</nav>
        <div className="header-actions">
          <button type="button" className="icon-button" data-preview-field-path="common.searchLabel" aria-label={text("common.searchLabel", "Search timepieces")} onClick={() => { searchDialog.current?.showModal(); searchInput.current?.focus(); }}><EditableIcon name="search" size={21} strokeWidth={1.4} /></button>
          <button type="button" className="icon-button bag-button" data-preview-field-path="common.bagLabel" aria-label={text("common.bagLabel", "Shopping bag")} onClick={() => bagDialog.current?.showModal()}><svg width="21" height="24" viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 8h16l1 15H3L4 8Z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></svg><span className="bag-count" data-preview-static="bag-count">0</span></button>
          <button type="button" className="icon-button mobile-toggle" data-preview-field-path="common.menuLabel" aria-label={text("common.menuLabel", "Toggle navigation")} aria-expanded={menuOpen} aria-controls={menuOpen ? "mobile-navigation" : undefined} onClick={() => setMenuOpen(!menuOpen)}><svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d={menuOpen ? "m6 6 12 12M6 18 18 6" : "M3 7h18M3 12h18M3 17h18"} /></svg></button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" className="mobile-nav">{nav.map(([key, href]) => <a key={key} href={safeHref(text(`common.navUrls.${key}`), href)} data-preview-field-path={"common.navUrls." + key} onClick={() => { setMenuOpen(false); setActiveCollection(""); }}><Text path={`common.navLabels.${key}`} fallback={key} /><Arrow /></a>)}</nav>}
    </header>

    <main>
      <EditableSection name="hero" padding="none" className="hero" aria-labelledby="hero-title">
        <div className="hero-image-wrap"><Photo data-preview-field-path="home.nextJsLogoImage" altPath="home.heroImageAlt" className="hero-image" eager /><div className="hero-shade" /></div>
        <div className="hero-content shell"><div className="hero-copy">
          <div className="eyebrow hero-eyebrow"><span /><Text data-preview-field-path="home.pageTsx" fallback="THE ART OF TIME" /></div>
          <Text data-preview-field-path="home.title" fallback="Timeless by Design." as="h1" id="hero-title" className="hero-title" />
          <Text data-preview-field-path="home.subtitle" as="p" className="hero-description" fallback="Exceptional timepieces for the moments that matter." />
          <div className="hero-ctas"><EditLink hrefPath="home.templatesUrl" labelPath="home.templatesLabel" className="button button-gold" arrow /><EditLink hrefPath="home.learningUrl" labelPath="home.learningLabel" fallbackHref="#story" className="text-link hero-story" /></div>
        </div><div className="hero-bottom"><Text data-preview-field-path="home.heroEdition" /><span className="hero-line" /><Text data-preview-field-path="home.heroCaption" /><span className="hero-scroll" aria-hidden="true">&darr;</span></div></div>
      </EditableSection>

      <EditableSection name="benefits" padding="none" className="benefits">
        <div className="benefit-grid shell" data-preview-list-path="home.benefits">{list("home.benefits").map((_, index) => <div key={index} className="benefit" data-preview-item-path={`home.benefits[${index}]`}>
          <EditableIcon iconMap={benefitIcons} aria-hidden={false} data-preview-field-path={`home.benefits[${index}].icon`} fieldPath={`home.benefits[${index}].icon`} name={text(`home.benefits[${index}].icon`, "shield-check")} size={28} strokeWidth={1.2} />
          <div><Text data-preview-field-path={`home.benefits[${index}].title`} as="h2" /><Text data-preview-field-path={`home.benefits[${index}].text`} as="p" /></div>
        </div>)}</div>
      </EditableSection>

      <EditableSection name="featured" padding="none" className="section-pad" aria-labelledby="featured-title">
        <div className="shell"><div className="section-heading"><div><Text data-preview-field-path="home.featuredEyebrow" className="eyebrow" /><Text data-preview-field-path="home.featuredTitle" as="h2" id="featured-title" className="section-title" /><Text data-preview-field-path="home.featuredDescription" as="p" className="section-description" /></div><EditLink hrefPath="home.documentationUrl" labelPath="home.documentationLabel" className="text-link" arrow onClick={() => setActiveCollection("")} /></div>
          {activeCollection && <div className="filter-status"><span>{activeCollection}</span><button type="button" className="text-link" onClick={() => setActiveCollection("")}><Text data-preview-field-path="home.allLabel" /><span aria-hidden="true">&times;</span></button></div>}
          <div className="watch-grid" data-preview-list-path="home.products">{products.map((watch, index) => <div key={index} hidden={!!activeCollection && watch.collection !== activeCollection} data-preview-item-path={`home.products[${index}]`}><FeaturedWatch index={index} onEnquire={enquire} /></div>)}</div>
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
          <div className="watch-grid" data-preview-list-path="home.arrivals">{arrivals.map((_, index) => <div key={index} data-preview-item-path={`home.arrivals[${index}]`}><ArrivalWatch index={index} onEnquire={enquire} /></div>)}</div>
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

    <footer id="contact" className="site-footer" data-design-section="footer">
      <div className="shell"><div className="footer-main"><div className="footer-brand"><Brand /><Text data-preview-field-path="common.shortDescription" as="p" /><EditLink className="text-link" hrefPath="common.headerCtaUrl" labelPath="common.headerCtaLabel" fallbackHref="#contact" arrow /><Text data-preview-field-path="common.enquiryNote" as="p" className="demo-note" />
          {selectedWatch && <div className="enquiry-status" role="status"><Text data-preview-field-path="common.enquiryPrefix" /><strong>{selectedWatch}</strong></div>}
        </div>
          <div className="footer-column"><Text data-preview-field-path="common.footerShopLabel" as="h2" /><ul data-preview-list-path="common.footerLinks">{list("common.footerLinks").map((_, index) => <li key={index} data-preview-item-path={`common.footerLinks[${index}]`}><a href={safeHref(text(`common.footerLinks[${index}].href`))} data-preview-field-path={`common.footerLinks[${index}].href`}><Text data-preview-field-path={`common.footerLinks[${index}].label`} /></a></li>)}</ul></div>
          <div className="footer-column"><Text data-preview-field-path="common.footerSupportLabel" as="h2" /><ul data-preview-list-path="common.supportLinks">{list("common.supportLinks").map((_, index) => <li key={index} data-preview-item-path={`common.supportLinks[${index}]`}><a href={safeHref(text(`common.supportLinks[${index}].href`))} data-preview-field-path={`common.supportLinks[${index}].href`}><Text data-preview-field-path={`common.supportLinks[${index}].label`} /></a></li>)}</ul></div>
          <div className="footer-column"><Text data-preview-field-path="common.footerSocialLabel" as="h2" /><ul data-preview-list-path="common.socialLinks">{list("common.socialLinks").map((_, index) => <li key={index} data-preview-item-path={`common.socialLinks[${index}]`}><a href={safeHref(text(`common.socialLinks[${index}].href`))} data-preview-field-path={`common.socialLinks[${index}].href`}><Text data-preview-field-path={`common.socialLinks[${index}].label`} /></a></li>)}</ul><Text data-preview-field-path="common.socialNote" as="p" className="demo-note" /></div>
        </div><div className="footer-bottom"><Text data-preview-field-path="common.copyright" as="p" /><Text data-preview-field-path="common.footerNote" as="p" /></div>
      </div>
    </footer>

    <dialog ref={searchDialog} className="store-dialog search-dialog" onClick={closeOnBackdrop} aria-labelledby="search-title">
      <div className="dialog-head"><Text data-preview-field-path="common.searchLabel" as="h2" id="search-title" /><button type="button" className="icon-button" data-preview-field-path="common.closeLabel" aria-label={text("common.closeLabel", "Close")} onClick={() => searchDialog.current?.close()}><span aria-hidden="true">&times;</span></button></div>
      <label className="sr-only" htmlFor="watch-search"><Text data-preview-field-path="common.searchLabel" /></label><input id="watch-search" ref={searchInput} type="search" data-preview-field-path="common.searchPlaceholder" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text("common.searchPlaceholder", "Search watches")} autoComplete="off" />
      <div className="search-results" aria-live="polite">{results.length ? results.map(({ path }) => <a key={path} href="#contact" data-preview-field-path={path + ".href"} onClick={() => enquire(text(`${path}.name`))}><Photo path={`${path}.image`} altPath={`${path}.imageAlt`} /><span><Text path={`${path}.name`} as="strong" /><Text path={`${path}.collection`} as="span" /></span><Text path={`${path}.price`} /></a>) : <Text data-preview-field-path="common.searchEmpty" as="p" />}</div>
    </dialog>
    <dialog ref={bagDialog} className="store-dialog bag-dialog" onClick={closeOnBackdrop} aria-labelledby="bag-title">
      <div className="dialog-head"><Text data-preview-field-path="common.bagLabel" as="h2" /><button type="button" className="icon-button" data-preview-field-path="common.closeLabel" aria-label={text("common.closeLabel", "Close")} onClick={() => bagDialog.current?.close()}><span aria-hidden="true">&times;</span></button></div><Mark /><Text data-preview-field-path="common.bagTitle" as="h3" id="bag-title" /><Text data-preview-field-path="common.bagDescription" as="p" /><button type="button" className="button button-navy" onClick={() => bagDialog.current?.close()}><Text data-preview-field-path="common.bagCta" /><Arrow /></button>
    </dialog>
  </div>;
}


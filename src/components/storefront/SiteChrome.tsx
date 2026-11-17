"use client";
import { useBag } from "./bag";
import { EditableIcon } from "@deneb-ui/ui";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Arrow, EditLink, Photo, Text, safeHref, useContent } from "./editable";
import { catalogProductHref, useCatalog } from "./catalog";
const nav = [["home", "/"], ["shop", "/shop/"], ["collections", "/collections/"], ["about", "/about/"], ["contact", "/#contact"]];
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


export default function SiteChrome({ page, selectedWatch = "", onEnquire, children }: { page: "home" | "shop" | "collections" | "product_link" | "cart" | "checkout" | "about"; selectedWatch?: string; onEnquire?: (name: string) => void; children: ReactNode }) {
  const { text, list } = useContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchDialog = useRef<HTMLDialogElement>(null);
  const bagDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const allProducts = useCatalog();
  const bag = useBag();
  const bagCount = allProducts.reduce((n,p)=>n+(bag.quantities[p.id]||0),0);
  const results = allProducts.filter(entry => (entry.name + " " + entry.collection).toLowerCase().includes(query.toLowerCase().trim()));
  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, []);
  const enquire = (name: string) => { onEnquire?.(name); searchDialog.current?.close(); setMenuOpen(false); };
  const closeOnBackdrop = (event: React.MouseEvent<HTMLDialogElement>) => { if (event.target === event.currentTarget) event.currentTarget.close(); };
  return <div id="top" className="storefront" data-preview-page-key={page}>
    <a className="skip-link" href={page === "about" ? "#about" : page === "checkout" ? "#checkout" : page === "cart" ? "#cart" : page === "home" ? "#featured" : page === "shop" ? "#catalog" : page === "product_link" ? "#watch-details" : "#collection-edit"} data-preview-static="accessibility">Skip to content</a>
    <div className="announcement" data-design-section="announcement"><span className="announcement-spacer" /><Text data-preview-field-path="common.announcement" fallback="Discover the AUREL collection" /><span className="announcement-detail"><Text data-preview-field-path="common.announcementDetail" /></span></div>
    <header className="site-header" data-design-section="navigation">
      <div className="header-inner shell">
        <Brand />
        <nav className="desktop-nav">{nav.map(([key, href]) => <a key={key} href={safeHref(text(`common.navUrls.${key}`), href)} data-preview-field-path={"common.navUrls." + key} onClick={() => setMenuOpen(false)} className={key === page ? "nav-current" : ""}><Text path={`common.navLabels.${key}`} fallback={key} /></a>)}</nav>
        <div className="header-actions">
          <button type="button" className="icon-button" data-preview-field-path="common.searchLabel" aria-label={text("common.searchLabel", "Search timepieces")} onClick={() => { searchDialog.current?.showModal(); searchInput.current?.focus(); }}><EditableIcon name="search" size={21} strokeWidth={1.4} /></button>
          <button type="button" className="icon-button bag-button" data-preview-field-path="common.bagLabel" aria-label={text("common.bagLabel", "Shopping bag")} onClick={() => { window.location.href = safeHref("/cart/", "/cart/"); }}><svg width="21" height="24" viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 8h16l1 15H3L4 8Z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></svg><span className="bag-count" data-preview-static="bag-count">{bagCount}</span></button>
          <button type="button" className="icon-button mobile-toggle" data-preview-field-path="common.menuLabel" aria-label={text("common.menuLabel", "Toggle navigation")} aria-expanded={menuOpen} aria-controls={menuOpen ? "mobile-navigation" : undefined} onClick={() => setMenuOpen(!menuOpen)}><svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d={menuOpen ? "m6 6 12 12M6 18 18 6" : "M3 7h18M3 12h18M3 17h18"} /></svg></button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" className="mobile-nav">{nav.map(([key, href]) => <a key={key} href={safeHref(text(`common.navUrls.${key}`), href)} data-preview-field-path={"common.navUrls." + key} onClick={() => setMenuOpen(false)}><Text path={`common.navLabels.${key}`} fallback={key} /><Arrow /></a>)}</nav>}
    </header>


    {children}
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
      <div className="search-results" aria-live="polite">{results.length ? results.map(({ path, id }) => <a key={path} href={catalogProductHref(id)} data-preview-field-path={path + ".id"} onClick={() => enquire(text(`${path}.name`))}><Photo path={`${path}.image`} altPath={`${path}.imageAlt`} /><span><Text path={`${path}.name`} as="strong" /><Text path={`${path}.collection`} as="span" /></span><Text path={`${path}.price`} /></a>) : <Text data-preview-field-path="common.searchEmpty" as="p" />}</div>
    </dialog>
    <dialog ref={bagDialog} className="store-dialog bag-dialog" onClick={closeOnBackdrop} aria-labelledby="bag-title">
      <div className="dialog-head"><Text data-preview-field-path="common.bagLabel" as="h2" /><button type="button" className="icon-button" data-preview-field-path="common.closeLabel" aria-label={text("common.closeLabel", "Close")} onClick={() => bagDialog.current?.close()}><span aria-hidden="true">&times;</span></button></div><Mark /><Text data-preview-field-path="common.bagTitle" as="h3" id="bag-title" /><Text data-preview-field-path="common.bagDescription" as="p" /><button type="button" className="button button-navy" onClick={() => bagDialog.current?.close()}><Text data-preview-field-path="common.bagCta" /><Arrow /></button>
    </dialog>

  </div>;
}

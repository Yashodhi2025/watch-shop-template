"use client";
import {sriLankaPhone} from "./localization";

import { EditableSection, useComponentStyle } from "@deneb-ui/ui";
import { useRef, useState, type ReactNode } from "react";
import { catalogProductHref, type CatalogEntry } from "./catalog";
import { ArrivalWatch, FeaturedWatch } from "./WatchBindings";
import { useBag } from "./bag";
import { Arrow, EditLink, Photo, Text, safeHref, useContent } from "./editable";

export type DetailBindings = {
  name: ReactNode; collection: ReactNode; price: ReactNode; availability: ReactNode;
  reference: ReactNode; description: ReactNode; details: ReactNode; specifications: ReactNode;
  gallery: (active: number, select: (index: number) => void) => ReactNode;
};

export default function WatchDetailView({ entry, entries, fields, "data-preview-item-path": itemPath }: { entry: CatalogEntry; entries: CatalogEntry[]; fields: DetailBindings; "data-preview-item-path": string }) {
  const { text, list } = useContent();
  const bag = useBag();
  const [added,setAdded] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const zoom = useRef<HTMLDialogElement>(null);
  const enquiry = useRef<HTMLDialogElement>(null);
  const gallery = list(`${entry.path}.gallery`);
  const active = Math.min(imageIndex, gallery.length);
  const imagePath = active ? `${entry.path}.gallery[${active - 1}].image` : `${entry.path}.image`;
  const altPath = active ? `${entry.path}.gallery[${active - 1}].imageAlt` : `${entry.path}.imageAlt`;
  const captionPath = active ? `${entry.path}.gallery[${active - 1}].caption` : "productDetails.primaryImageLabel";
  const hrefPath = `${entry.path}.href`;
  const { cssVars: enquiryStyles } = useComponentStyle("productDetails.enquireLabel", "button");
  const { cssVars: gridStyles } = useComponentStyle("productDetails.relatedGrid", "grid");
  const email = text("common.business.email").trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phone = sriLankaPhone(text("common.business.whatsapp"));
  const validPhone = !!phone;
  const message = `${text("productDetails.enquiryMessage", "I would like to know more about")} ${entry.name} (${text(`${entry.path}.reference`, entry.id)}).`;
  const related = entries.filter(item => item.id !== entry.id).sort((a, b) => Number(b.collection === entry.collection) - Number(a.collection === entry.collection) || a.featuredOrder - b.featuredOrder).slice(0, 4);
  const changeImage = (step: number) => setImageIndex((active + step + gallery.length + 1) % (gallery.length + 1));
  const closeOnBackdrop = (event: React.MouseEvent<HTMLDialogElement>) => { if (event.currentTarget === event.target) event.currentTarget.close(); };

  return <article className="detail-product" data-product-id={entry.id}>
    <EditableSection name="watch-overview" padding="none" className="detail-overview">
      <div className="shell">
        <nav className="page-breadcrumb detail-breadcrumb" aria-labelledby={`watch-title-${entry.id}`}>
          <a href={safeHref(text("common.homeUrl"), "/")} data-preview-field-path="common.homeUrl"><Text data-preview-field-path="common.navLabels.home" /></a><span aria-hidden="true">/</span>
          <EditLink hrefPath="productDetails.backUrl" labelPath="common.navLabels.shop" fallbackHref="/shop/" /><span aria-hidden="true">/</span>
          <Text path={`${entry.path}.name`} fallback="Timepiece" />
        </nav>
        <div className="detail-layout">
          <div className="detail-gallery" onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); changeImage(event.key === "ArrowRight" ? 1 : -1); } }}>
            <button type="button" className={`detail-main-image detail-crop-${active % 3}`} onClick={() => zoom.current?.showModal()} aria-label={text("productDetails.zoomLabel", "Enlarge image")} data-preview-field-path="productDetails.zoomLabel">
              <Photo path={imagePath} altPath={altPath} className="detail-image" eager />
              <Text path={`${entry.path}.badge`} fallback="THE AUREL EDIT" className="detail-badge" />
              <span className="detail-zoom-hint"><Text data-preview-field-path="productDetails.zoomLabel" /><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6" /></svg></span>
            </button>
            <div className="detail-gallery-caption" id={`gallery-caption-${entry.id}`} aria-live="polite"><Text path={captionPath} /><span data-preview-static="gallery-position">{String(active + 1).padStart(2, "0")} / {String(gallery.length + 1).padStart(2, "0")}</span></div>
            <div className="detail-thumbnails" role="group" aria-labelledby={`gallery-caption-${entry.id}`}>
              <button className="detail-thumbnail" type="button" aria-pressed={active === 0} onClick={() => setImageIndex(0)}><Photo path={`${entry.path}.image`} altPath={`${entry.path}.imageAlt`} /><Text data-preview-field-path="productDetails.primaryImageLabel" /></button>
              {fields.gallery(active, setImageIndex)}
            </div>
          </div>
          <div className="detail-info" data-preview-item-path={itemPath}>
            <div className="detail-collection">{fields.collection}<span aria-hidden="true" /></div>
            {fields.name}
            <div className="detail-reference"><Text data-preview-field-path="productDetails.referenceLabel" /><a href={catalogProductHref(entry.id)} data-preview-field-path={hrefPath}>{fields.reference}</a></div>
            {fields.description}
            <div className="detail-price-row">{fields.price}<span className={`detail-stock detail-stock-${entry.availability}`}><i />{fields.availability}</span></div>
            <Text data-preview-field-path="productDetails.priceNote" as="p" className="detail-price-note" />
            <button className="button button-navy edit-link detail-enquire" type="button" style={enquiryStyles} data-preview-style-target="productDetails.enquireLabel" data-preview-style-type="button" onClick={() => enquiry.current?.showModal()}><Text data-preview-field-path="productDetails.enquireLabel" /><Arrow /></button>
            <button type="button" className="button button-gold detail-enquire bag-add" disabled={entry.price===null || entry.availability==="unavailable"} onClick={()=>{bag.add(entry.id);setAdded(true);}}><Text data-preview-field-path="cart.addLabel"/></button>
            {added && <p role="status" className="bag-added-status"><Text data-preview-field-path="cart.addedLabel"/></p>}
            <Text data-preview-field-path="productDetails.enquiryNote" as="p" className="detail-enquiry-note" />
            <div className="detail-service"><svg width="24" height="26" viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="m12 2 9 4v7c0 6-9 10-9 10S3 19 3 13V6l9-4Z" /><path d="m8 12 3 3 5-6" /></svg><div><Text data-preview-field-path="productDetails.serviceTitle" as="h2" /><Text data-preview-field-path="productDetails.serviceDescription" as="p" /></div></div>
            <a href={safeHref(text("productDetails.discoverUrl"), "#watch-story")} data-preview-field-path="productDetails.discoverUrl" className="text-link detail-discover"><Text data-preview-field-path="productDetails.discoverLabel" /><span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </div>
    </EditableSection>

    <EditableSection name="watch-story" id="watch-story" padding="none" className="detail-story">
      <div className="shell detail-story-grid">
        <div className="detail-story-copy"><Text data-preview-field-path="productDetails.eyebrow" className="eyebrow" /><Text data-preview-field-path="productDetails.descriptionTitle" as="h2" className="section-title" />{fields.details}<Text data-preview-field-path="productDetails.demoNote" as="p" className="detail-demo-note" /></div>
        <div className="detail-specifications"><Text data-preview-field-path="productDetails.specificationsTitle" as="h2" className="detail-spec-title" />{fields.specifications}{!list(`${entry.path}.specifications`).length && <Text data-preview-field-path="productDetails.specificationsEmpty" as="p" className="detail-spec-empty" />}</div>
      </div>
    </EditableSection>

    <EditableSection name="watch-related" padding="none" className="detail-related section-pad">
      <div className="shell"><div className="section-heading"><div><Text data-preview-field-path="productDetails.relatedEyebrow" className="eyebrow" /><Text data-preview-field-path="productDetails.relatedTitle" as="h2" className="section-title" /></div><EditLink hrefPath="productDetails.backUrl" labelPath="productDetails.backLabel" fallbackHref="/shop/" className="text-link" arrow /></div>
        <div className="watch-grid detail-related-grid" style={gridStyles} data-preview-style-target="productDetails.relatedGrid" data-preview-style-type="grid">{related.map(item => <div key={item.id}>{item.source === "products" ? <FeaturedWatch index={item.index} catalogId={item.id} /> : <ArrivalWatch index={item.index} catalogId={item.id} />}</div>)}</div>
        {!related.length && <Text data-preview-field-path="productDetails.relatedEmpty" as="p" />}
      </div>
    </EditableSection>

    <dialog ref={zoom} className="store-dialog detail-zoom-dialog" data-preview-field-path="productDetails.zoomLabel" onClick={closeOnBackdrop} aria-label={text("productDetails.zoomLabel", "Enlarge image")} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); changeImage(event.key === "ArrowRight" ? 1 : -1); } }}>
      <div className="dialog-head"><Text path={`${entry.path}.name`} as="h2" /><button type="button" className="icon-button" onClick={() => zoom.current?.close()} aria-label={text("common.closeLabel", "Close")} data-preview-field-path="common.closeLabel"><span aria-hidden="true">×</span></button></div>
      <Photo path={imagePath} altPath={altPath} className="detail-zoom-image" />
      <div className="detail-zoom-controls"><button type="button" className="text-link" onClick={() => changeImage(-1)}><span aria-hidden="true">←</span><Text data-preview-field-path="productDetails.previousLabel" /></button><Text path={captionPath} /><button type="button" className="text-link" onClick={() => changeImage(1)}><Text data-preview-field-path="productDetails.nextLabel" /><span aria-hidden="true">→</span></button></div>
    </dialog>
    <dialog ref={enquiry} className="store-dialog detail-enquiry-dialog" onClick={closeOnBackdrop} aria-labelledby={`enquiry-${entry.id}`}>
      <div className="dialog-head"><Text data-preview-field-path="productDetails.enquiryTitle" as="h2" id={`enquiry-${entry.id}`} /><button type="button" className="icon-button" onClick={() => enquiry.current?.close()} aria-label={text("common.closeLabel", "Close")} data-preview-field-path="common.closeLabel"><span aria-hidden="true">×</span></button></div>
      <Text path={`${entry.path}.name`} as="h3" className="section-title" /><Text path={`${entry.path}.reference`} as="p" className="detail-enquiry-reference" />
      <Text data-preview-field-path="productDetails.enquiryDescription" as="p" />
      <div className="detail-contact-actions">
        {validEmail && <a className="button button-navy" href={`mailto:${email}?subject=${encodeURIComponent(`${text("productDetails.enquiryTitle")} — ${entry.name}`)}&body=${encodeURIComponent(message)}`} data-preview-field-path="common.business.email"><Text data-preview-field-path="productDetails.emailLabel" /><Arrow /></a>}
        {validPhone && <a className="button button-gold" href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" data-preview-field-path="common.business.whatsapp"><Text data-preview-field-path="productDetails.whatsappLabel" /><Arrow /></a>}
      </div>
      {!validEmail && !validPhone && <Text data-preview-field-path="productDetails.enquiryDemo" as="p" className="detail-enquiry-demo" />}
      <button type="button" className="text-link" onClick={() => enquiry.current?.close()}><Text data-preview-field-path="productDetails.closeEnquiryLabel" /><Arrow /></button>
    </dialog>
  </article>;
}

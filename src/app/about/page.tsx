"use client";
import { EditableSection } from "@deneb-ui/ui";
import SiteChrome from "@/components/storefront/SiteChrome";
import { Text, Photo, EditLink } from "@/components/storefront/editable";
export default function AboutPage() {
 return <SiteChrome page="about"><main id="about">
  <EditableSection name="about-hero" padding="none" className="about-cinema">
   <Photo data-preview-field-path="about.heroImage" altPath="about.heroImageAlt" className="about-cinema-image" eager />
   <div className="about-cinema-shade" />
   <div className="shell about-cinema-content"><div className="about-gold-rule" aria-hidden="true"/><Text data-preview-field-path="about.eyebrow" className="eyebrow"/><Text data-preview-field-path="about.title" as="h1" className="about-title"/><Text data-preview-field-path="about.introduction" as="p" className="about-introduction"/><div className="about-cinema-foot" aria-hidden="true"><span data-preview-static="decorative-monogram">A / T</span><span/><span>01</span></div></div>
  </EditableSection>
  <EditableSection name="about-philosophy" padding="none" className="about-edit">
   <div className="shell">
    <article className="about-editorial-row"><figure className="about-image-frame"><Photo data-preview-field-path="about.craftImage" altPath="about.craftImageAlt"/><span className="about-image-index" aria-hidden="true">01</span></figure><div className="about-editorial-copy"><Text data-preview-field-path="about.craftEyebrow" className="eyebrow"/><Text data-preview-field-path="about.craftTitle" as="h2" className="about-editorial-title"/><div className="about-copy-rule" aria-hidden="true"/><Text data-preview-field-path="about.craftDescription" as="p" className="about-editorial-description"/></div></article>
    <article className="about-editorial-row about-editorial-reverse"><figure className="about-image-frame"><Photo data-preview-field-path="about.designImage" altPath="about.designImageAlt"/><span className="about-image-index" aria-hidden="true">02</span></figure><div className="about-editorial-copy"><Text data-preview-field-path="about.designEyebrow" className="eyebrow"/><Text data-preview-field-path="about.designTitle" as="h2" className="about-editorial-title"/><div className="about-copy-rule" aria-hidden="true"/><Text data-preview-field-path="about.designDescription" as="p" className="about-editorial-description"/></div></article>
   </div>
  </EditableSection>
  <EditableSection name="about-editorial" padding="none" className="about-lifestyle"><figure className="shell about-lifestyle-spread"><div className="about-lifestyle-image"><Photo data-preview-field-path="about.editorialImage" altPath="about.editorialImageAlt"/></div><figcaption><span className="about-gold-rule" aria-hidden="true"/><Text data-preview-field-path="about.imageCaption" as="h2"/><span className="about-lifestyle-signature" data-preview-static="decorative-wordmark" aria-hidden="true">A U R E L</span></figcaption></figure></EditableSection>
  <EditableSection name="about-invitation" padding="none" className="about-invitation"><div className="shell"><div className="about-invitation-row"><div><Text data-preview-field-path="about.ctaTitle" as="h2"/><Text data-preview-field-path="about.ctaDescription" as="p"/></div><EditLink hrefPath="about.ctaUrl" labelPath="about.ctaLabel" fallbackHref="/collections/" className="button button-gold" arrow/></div><Text data-preview-field-path="about.demoNote" as="p" className="about-demo-note"/></div></EditableSection>
 </main></SiteChrome>;
}

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { openBrowserSession } from './browser-session.mjs';

const seed = JSON.parse(await readFile('src/data/site-data.json', 'utf8'));
const browser = await openBrowserSession({ basePath: process.env.NEXT_PUBLIC_SITE_BASE_PATH || '' });
const { navigate, evaluate, send, pause, errors, reportDir } = browser;
const findings = [];
const products = [...seed.content.home.products, ...seed.content.home.arrivals];
const mutate = async data => { await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(data)},full:true},location.origin)`); await pause(350); };
const detail = id => navigate('/products/detail/?id=' + encodeURIComponent(id));
const click = async selector => { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); await pause(200); };
const waitForDetail = async id => {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (await evaluate(`document.querySelectorAll('.detail-product').length === 1 && document.querySelector('.detail-product')?.dataset.productId === ${JSON.stringify(id)} && document.title.includes(document.querySelector('.detail-title')?.textContent)`)) return;
    await pause(100);
  }
  assert.fail('Details did not load for ' + id + ': ' + JSON.stringify(await evaluate('({id:document.querySelector(".detail-product")?.dataset.productId,title:document.title,heading:document.querySelector(".detail-title")?.textContent,titles:Array.from(document.querySelectorAll("title"),el=>el.textContent)})')));
};
const imagesLoad = async () => {
  await evaluate('Promise.all(Array.from(document.images).map(image=>{image.loading="eager";return image.decode().catch(()=>{});}))');
  assert.deepEqual(await evaluate('Array.from(document.images).filter(image=>!image.complete||image.naturalWidth===0).map(image=>image.src)'), []);
};
const keyboard = async key => {
  const keyCode = { Enter: 13, Escape: 27, ArrowLeft: 37, ArrowRight: 39 }[key];
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: keyCode });
  if (key === 'Enter') await send('Input.dispatchKeyEvent', { type: 'char', text: '\r', key, code: key, windowsVirtualKeyCode: keyCode });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: keyCode });
  await pause(150);
};

try {
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  for (const product of products) {
    await detail(product.id);
    await waitForDetail(product.id);
    assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
    assert.equal(await evaluate('document.querySelector(".detail-title").textContent'), product.name);
    assert.equal(await evaluate('document.querySelector(".detail-price").textContent'), product.price);
    assert.equal(await evaluate('document.querySelectorAll(".detail-spec-list > div").length'), product.specifications.length);
    assert.ok(await evaluate(`document.title.includes(${JSON.stringify(product.name)})`));
    assert.equal(await evaluate('new URL(location.href).searchParams.get("id")'), product.id);
    assert.ok(await evaluate(`Array.from(document.querySelectorAll('.detail-related-grid a')).every(link=>new URL(link.href).searchParams.get('id')!==${JSON.stringify(product.id)})`));
    assert.equal(await evaluate('document.querySelector(".detail-related-grid .watch-collection").textContent'), product.collection);
  }
  findings.push('All eight stable query IDs resolve to the correct name, price, specifications, title and related collection; current watch is excluded.');

  await detail(products[0].id);
  for (const width of [1440, 1024, 768, 390, 320]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 800 });
    await imagesLoad();
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Page overflows at ' + width);
    assert.ok(await evaluate('document.querySelector(".detail-enquire").getBoundingClientRect().height >= 44'));
    const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(join(reportDir, `details-${width}.png`), Buffer.from(screenshot.data, 'base64'));
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  const metrics = await send('Page.getLayoutMetrics');
  const full = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: metrics.cssContentSize.height, scale: 1 } });
  await writeFile(join(reportDir, 'details-full.png'), Buffer.from(full.data, 'base64'));
  findings.push('Local images load and layouts fit 320, 390, 768, 1024 and 1440px; responsive and full-page screenshots saved.');

  await click('.detail-gallery-list .detail-thumbnail');
  assert.equal(await evaluate('document.querySelector(".detail-gallery-caption > span").textContent'), products[0].gallery[0].caption);
  assert.equal(await evaluate('document.querySelectorAll(".detail-thumbnail[aria-pressed=true]").length'), 1);
  await evaluate('document.querySelector(".detail-gallery-list .detail-thumbnail").focus()');
  await keyboard('ArrowRight');
  assert.match(await evaluate('document.querySelector(".detail-gallery-caption").textContent'), /03 \/ 03/);
  await evaluate('document.querySelector(".detail-main-image").focus()');
  await keyboard('Enter');
  assert.equal(await evaluate('document.querySelector(".detail-zoom-dialog").open'), true);
  await keyboard('ArrowRight');
  assert.equal(await evaluate('document.querySelector(".detail-gallery-caption > span").textContent'), seed.content.productDetails.primaryImageLabel);
  await keyboard('Escape');
  assert.equal(await evaluate('document.querySelector(".detail-zoom-dialog").open'), false);
  assert.equal(await evaluate('document.activeElement.classList.contains("detail-main-image")'), true);
  findings.push('Gallery selection, arrow-key cycling, keyboard zoom, Escape dismissal and focus restoration pass.');

  await click('.detail-enquire');
  assert.equal(await evaluate('document.querySelector(".detail-enquiry-dialog").open'), true);
  assert.match(await evaluate('document.querySelector(".detail-enquiry-dialog").textContent'), /Heritage Automatic/);
  assert.match(await evaluate('document.querySelector(".detail-enquiry-demo").textContent'), /No message has been sent/);
  assert.equal(await evaluate('document.querySelectorAll(".detail-contact-actions a").length'), 0);
  await keyboard('Escape');
  const contact = structuredClone(seed);
  contact.content.common.business.email = 'concierge@example.com';
  contact.content.common.business.whatsapp = '+94 (77) 123-4567';
  await mutate(contact);
  await click('.detail-enquire');
  const destinations = await evaluate('Array.from(document.querySelectorAll(".detail-contact-actions a"),a=>a.href)');
  assert.match(destinations[0], /^mailto:concierge@example.com\?/);
  assert.match(decodeURIComponent(destinations[0]), /Heritage Automatic/);
  assert.match(decodeURIComponent(destinations[0]), /HA-038-01/);
  assert.match(destinations[1], /^https:\/\/wa.me\/94771234567\?text=/);
  await keyboard('Escape');
  contact.content.common.business.email = 'javascript:alert(1)';
  contact.content.common.business.whatsapp = 'https://invalid.example';
  await mutate(contact);
  await click('.detail-enquire');
  assert.equal(await evaluate('document.querySelectorAll(".detail-contact-actions a").length'), 0);
  await keyboard('Escape');
  await mutate(seed);
  findings.push('Enquiry demo is honest; configured email/WhatsApp links contain the selected reference and reject invalid contact values. No messages are sent by the test.');

  const edited = structuredClone(seed);
  const watch = edited.content.home.products[0];
  watch.name = 'Live Heritage'; watch.price = '$2,999'; watch.details = 'A live-edited watch description.';
  watch.availability = 'Sold out';
  watch.gallery.reverse(); watch.gallery[0].image = '/images/watch-sport.webp'; watch.gallery[0].caption = 'Live gallery caption';
  watch.specifications.reverse(); watch.specifications[0].value = 'Edited reserve';
  edited.content.productDetails.enquireLabel = 'Ask our boutique';
  await mutate(edited);
  assert.equal(await evaluate('document.querySelector(".detail-title").textContent'), 'Live Heritage');
  assert.equal(await evaluate('document.querySelector(".detail-price").textContent'), '$2,999');
  assert.match(await evaluate('document.querySelector(".detail-description").textContent'), /live-edited/);
  assert.equal(await evaluate('document.querySelector(".detail-stock").classList.contains("detail-stock-unavailable")'), true);
  assert.match(await evaluate('document.querySelector(".detail-spec-list dd").textContent'), /Edited reserve/);
  await click('.detail-gallery-list .detail-thumbnail');
  assert.match(await evaluate('document.querySelector(".detail-main-image img").src'), /watch-sport.webp/);
  assert.equal(await evaluate('document.querySelector(".detail-main-image img").dataset.previewFieldPath'), 'home.products[0].gallery[0].image');
  assert.equal(await evaluate('document.querySelector(".detail-spec-list dd span").dataset.previewFieldPath'), 'home.products[0].specifications[0].value');
  edited.content.home.products.reverse();
  await mutate(edited);
  assert.equal(await evaluate('document.querySelector(".detail-title").dataset.previewFieldPath'), 'home.products[3].name');
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'home.products[3].name',styleType:'text',properties:{color:'#68532F'}},location.origin)`);
  await pause(150);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".detail-title")).color'), 'rgb(104, 83, 47)');
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'productDetails.enquireLabel',styleType:'button',properties:{backgroundColor:'#C4A46A'}},location.origin)`);
  await pause(350);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".detail-enquire")).backgroundColor'), 'rgb(196, 164, 106)');
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'watch-overview.section',styleType:'section',properties:{paddingTop:'45px'}},location.origin)`);
  await pause(150);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#watch-overview")).paddingTop'), '45px');
  await mutate(seed);
  findings.push('Live text, price, stock, description, image, gallery/specification reorder and product reorder preserve exact editable paths; text/button/section styles update.');

  const partial = structuredClone(seed);
  for (const key of ['image','imageAlt','price','availability','reference','description','details','gallery','specifications']) delete partial.content.home.products[0][key];
  await mutate(partial);
  assert.match(await evaluate('document.querySelector(".detail-price").textContent'), /Price on request/);
  assert.match(await evaluate('document.querySelector(".detail-stock").textContent'), /Enquire for availability/);
  assert.equal(await evaluate('document.querySelectorAll(".detail-thumbnail").length'), 1);
  assert.ok(await evaluate('!!document.querySelector(".detail-spec-empty")'));
  await imagesLoad();
  await mutate(seed);
  await click('.detail-gallery-list > div:last-child button');
  const reduced = structuredClone(seed); reduced.content.home.products[0].gallery = [];
  await mutate(reduced);
  assert.equal(await evaluate('document.querySelector(".detail-gallery-caption > span").textContent'), seed.content.productDetails.primaryImageLabel);
  await mutate(seed);
  const empty = structuredClone(seed); empty.content.home.products = []; empty.content.home.arrivals = [];
  await mutate(empty);
  assert.equal(await evaluate('document.querySelectorAll(".detail-product").length'), 0);
  assert.ok(await evaluate('!!document.querySelector(".detail-state h1")'));
  await mutate(seed);
  const expanded = structuredClone(seed);
  const future = { id: 'future / limited & 09', name: 'Future AUREL', collection: 'Classic', price: '$3,000', gallery: [], specifications: [] };
  expanded.content.home.arrivals.push(future);
  await mutate(expanded); await pause(850);
  await navigate('/shop/');
  await evaluate(`Array.from(document.querySelectorAll('.catalog-grid .watch-card')).find(card=>card.textContent.includes('Future AUREL')).querySelector('a').click()`);
  await waitForDetail(future.id);
  assert.equal(await evaluate('document.querySelector(".detail-title").textContent'), future.name);
  await mutate(seed);
  assert.ok(await evaluate('!!document.querySelector(".detail-state")'));
  await navigate('/products/detail/?id=unknown-watch');
  assert.equal(await evaluate('document.querySelectorAll(".detail-product").length'), 0);
  await navigate('/products/detail/');
  await waitForDetail(products[0].id);
  findings.push('Missing optional fields, empty and shrinking galleries/specs, empty catalogs, removed/unknown/missing IDs and an encoded post-build product ID all behave safely.');

  await navigate('/');
  assert.equal(await evaluate('Array.from(document.querySelectorAll("#featured .watch-image-link, #arrivals .watch-image-link")).every(a=>new URL(a.href).pathname.endsWith("/products/detail/"))'), true);
  await click('#featured .watch-image-link'); await waitForDetail(products[0].id);
  await click('.detail-related-grid .watch-image-link'); await waitForDetail('heritage-reserve');
  await navigate('/');
  await click('.header-actions button');
  await evaluate(`(() => {const input=document.querySelector('#watch-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'Navigator');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await pause(200); await click('.search-results a'); await waitForDetail('navigator-steel');
  await evaluate('history.pushState(null,"","?id=heritage-automatic");dispatchEvent(new PopStateEvent("popstate"))');
  await waitForDetail('heritage-automatic');
  await evaluate('history.back()'); await waitForDetail('navigator-steel');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await click('.mobile-toggle');
  assert.ok(await evaluate('document.querySelector("#mobile-navigation").getBoundingClientRect().width <= innerWidth'));
  await click('.mobile-nav a:nth-child(2)'); await pause(800);
  assert.ok(await evaluate('location.pathname.endsWith("/shop/")'));
  findings.push('Homepage featured/arrival links, search, related-watch navigation, browser history and mobile details-to-Shop navigation pass.');

  await detail(products[0].id);
  const themed = structuredClone(seed);
  themed.theme.accentColor = '#A78A54';
  themed.theme.dark.textColor = '#FFF7E8';
  await mutate(themed);
  await click('.theme-switcher');
  assert.ok(await evaluate('document.documentElement.classList.contains("dark")'));
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".detail-title")).color'), 'rgb(255, 247, 232)');
  await imagesLoad();
  const dark = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(join(reportDir, 'details-dark-390.png'), Buffer.from(dark.data, 'base64'));
  await click('.theme-switcher');
  await mutate(seed);
  assert.deepEqual(errors, []);
  findings.push('Dark theme and live palette updates remain functional after editing; no browser runtime exceptions occurred.');
  await writeFile(join(reportDir, 'phase2b-results.json'), JSON.stringify({ passed: true, findings }, null, 2));
  console.log(findings.join('\n'));
} finally { browser.close(); }

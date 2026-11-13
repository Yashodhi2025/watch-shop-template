import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { openBrowserSession } from './browser-session.mjs';

const browser = await openBrowserSession({ basePath: process.env.NEXT_PUBLIC_SITE_BASE_PATH || '' });
const { send, evaluate, pause, navigate, reportDir, errors } = browser;
const seed = JSON.parse(await readFile('src/data/site-data.json', 'utf8'));
const findings = [];
const names = () => evaluate('Array.from(document.querySelectorAll(".catalog-grid .watch-name"),el=>el.textContent.trim())');
const set = async (selector, value) => {
  await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); const prototype = element.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype,'value').set.call(element,${JSON.stringify(value)}); element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input',{bubbles:true})); })()`);
  await pause(130);
};
const reset = async () => { await evaluate('document.querySelector(".catalog-reset").click()'); await pause(120); };
const mutate = async data => { await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(data)},full:true},location.origin)`); await pause(180); };
const waitForPath = async expected => {
  for (let i = 0; i < 40; i++) { await pause(100); if (await evaluate(`location.pathname.endsWith(${JSON.stringify(expected)}) && document.readyState === 'complete' && !!document.querySelector('.site-header')`)) { await pause(300); return; } }
  assert.fail('Navigation did not reach ' + expected);
};
try {
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  for (const page of ['shop', 'collections']) {
    await navigate('/' + page + '/');
    assert.equal(await evaluate('document.querySelector(".storefront").dataset.previewPageKey'), page);
    assert.ok(await evaluate('!!document.querySelector("h1")'));
    await evaluate('Promise.all(Array.from(document.images).map(image=>{image.loading="eager";return image.decode().catch(()=>{});} ))');
    assert.deepEqual(await evaluate('Array.from(document.images).filter(image=>!image.complete||image.naturalWidth===0).map(image=>image.src)'), []);
    for (const width of [1440, 768, 390, 320]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 800 });
      await pause(120);
      assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `${page} overflows at ${width}px`);
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(join(reportDir, `${page}-${width}.png`), Buffer.from(screenshot.data, 'base64'));
    }
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    const metrics = await send('Page.getLayoutMetrics');
    const full = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: metrics.cssContentSize.height, scale: 1 } });
    await writeFile(join(reportDir, `${page}-full.png`), Buffer.from(full.data, 'base64'));
  }
  findings.push('Shop and Collections render, load local images and fit 320, 390, 768 and 1440px; screenshots saved.');

  await navigate('/shop/');
  assert.equal((await names()).length, 8);
  await set('#catalog-search', 'Navigator'); assert.deepEqual(await names(), ['Navigator Steel']);
  await set('#catalog-search', 'not-a-watch'); assert.equal((await names()).length, 0);
  assert.match(await evaluate('document.querySelector(".catalog-empty").textContent'), /No timepieces match/);
  await reset(); assert.equal((await names()).length, 8);
  await set('#catalog-collection', 'Sport'); assert.equal((await names()).length, 2);
  await set('input[name=min]', '3000'); await set('input[name=max]', '4000'); assert.deepEqual(await names(), ['Navigator Steel']);
  await set('#catalog-availability', 'limited'); assert.equal((await names()).length, 0);
  await reset();
  await set('#catalog-availability', 'limited'); assert.equal((await names()).length, 2);
  await set('#catalog-availability', 'available'); assert.equal((await names()).length, 6);
  await set('#catalog-availability', 'unavailable'); assert.equal((await names()).length, 0);
  await reset();
  await set('#catalog-sort', 'newest'); assert.equal((await names())[0], 'Méridian Rose');
  await set('#catalog-sort', 'price-asc'); assert.equal((await names())[0], 'Heritage Automatic');
  await set('#catalog-sort', 'price-desc'); assert.equal((await names())[0], 'Atelier No. 01');
  await set('#catalog-sort', 'featured'); assert.equal((await names())[0], 'Heritage Automatic');
  await set('input[name=min]', '9000'); await set('input[name=max]', '1000'); assert.equal((await names()).length, 0);
  await reset();
  assert.equal(await evaluate('location.search'), '');
  findings.push('Name search, combined collection/price/availability filters, all four sort modes, empty results and reset pass.');
  await navigate('/shop/?collection=Chronograph&min=4000&sort=price-desc');
  assert.deepEqual(await names(), ['Méridian Rose']);
  findings.push('Direct URL filters survive a page load.');

  await navigate('/collections/');
  const collectionLinks = await evaluate('Array.from(document.querySelectorAll(".collection-editorial-copy .text-link"),link=>link.href)');
  const collectionNames = seed.content.home.collections.map(collection => collection.name);
  assert.equal(new Set(await evaluate('Array.from(document.querySelectorAll(".collection-editorial-image img"),image=>image.src)')).size, 4);
  for (let index = 0; index < collectionLinks.length; index++) {
    const target = new URL(collectionLinks[index]);
    assert.equal(target.searchParams.get('collection'), collectionNames[index]);
    await navigate(target.pathname.replace(process.env.NEXT_PUBLIC_SITE_BASE_PATH || '', '') + target.search);
    assert.equal((await names()).length, 2);
    assert.ok(await evaluate(`Array.from(document.querySelectorAll('.catalog-grid .watch-collection')).every(el=>el.textContent.trim()===${JSON.stringify(collectionNames[index])})`));
  }
  findings.push('All four distinct collection images and collection-to-Shop filter destinations pass.');

  await navigate('/shop/');
  const links = await evaluate('Array.from(document.querySelectorAll(".catalog-grid .watch-image-link"),link=>link.href)');
  assert.equal(new Set(links.map(link => new URL(link).searchParams.get('id'))).size, 8);
  assert.ok(links.every(link => new URL(link).pathname.endsWith('/products/detail/')));
  await evaluate('document.querySelector(".catalog-grid .watch-image-link").click()'); await waitForPath('/shop/');
  assert.equal(await evaluate('document.querySelectorAll(".watch-card.is-selected").length'), 1);
  assert.equal(await evaluate('document.activeElement.id'), 'watch-heritage-automatic');
  assert.match(await evaluate('document.querySelector(".catalog-selection").textContent'), /Heritage Automatic/);
  findings.push('All eight product links use native Fivora query URLs; the routing-only handoff returns to Shop and focuses the correct catalog card.');

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 1000, deviceScaleFactor: 1, mobile: true });
  await evaluate('document.querySelector(".mobile-toggle").click()');
  assert.equal(await evaluate('document.querySelector(".mobile-toggle").ariaExpanded'), 'true');
  await evaluate('document.querySelector(".mobile-nav a:nth-child(3)").click()'); await waitForPath('/collections/');
  await evaluate('document.querySelector(".mobile-toggle").click()');
  await evaluate('document.querySelector(".mobile-nav a:nth-child(2)").click()'); await waitForPath('/shop/');
  assert.equal(await evaluate('document.querySelector(".mobile-toggle").ariaExpanded'), 'false');
  findings.push('Mobile menu opens, navigates between both pages and closes after navigation.');

  const partial = structuredClone(seed);
  for (const key of ['id', 'image', 'imageAlt', 'price', 'collection', 'description', 'availability', 'badge', 'addedAt', 'featuredOrder']) delete partial.content.home.products[0][key];
  await mutate(partial);
  assert.equal((await names()).length, 8);
  assert.match(await evaluate('document.querySelector(".catalog-grid .watch-card").textContent'), /Price on request/);
  assert.match(await evaluate('document.querySelector(".catalog-grid .watch-card").textContent'), /Enquire for availability/);
  await evaluate('Promise.all(Array.from(document.images).map(image=>{image.loading="eager";return image.decode().catch(()=>{});} ))');
  assert.deepEqual(await evaluate('Array.from(document.images).filter(image=>!image.complete||image.naturalWidth===0).map(image=>image.src)'), []);
  const edited = structuredClone(seed);
  edited.content.home.products[0].name = 'Updated AUREL Watch';
  edited.content.shop.title = 'A live catalog edit';
  await mutate(edited);
  assert.equal((await names())[0], 'Updated AUREL Watch');
  assert.equal(await evaluate('document.querySelector("h1").textContent'), 'A live catalog edit');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'shop-intro.section',styleType:'section',properties:{paddingTop:'40px'}},location.origin)`);
  await pause(120);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#shop-intro")).paddingTop'), '40px');
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'shop.title',styleType:'text',properties:{color:'#68532F'}},location.origin)`);
  await pause(120);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("h1")).color'), 'rgb(104, 83, 47)');
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'shop.grid',styleType:'grid',properties:{columns:3}},location.origin)`);
  await pause(120);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".catalog-grid")).gridTemplateColumns.split(" ").length'), 3);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 1000, deviceScaleFactor: 1, mobile: true });
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'shop.grid',styleType:'grid',properties:{columns:1}},location.origin)`);
  await pause(120);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".catalog-grid")).gridTemplateColumns.split(" ").length'), 1);
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  const expanded = structuredClone(seed);
  expanded.content.home.arrivals.push({ id: 'future-aurel-watch', name: 'Future AUREL Watch', collection: 'Classic', price: '$2,900', availability: 'Available' });
  await mutate(expanded); await pause(850);
  assert.equal((await names()).length, 9);
  await evaluate('document.getElementById("watch-future-aurel-watch").querySelector("a").click()'); await waitForPath('/shop/');
  assert.equal(await evaluate('document.activeElement.id'), 'watch-future-aurel-watch');
  await mutate(seed); await pause(850);
  const empty = structuredClone(seed);
  empty.content.home.products = []; empty.content.home.arrivals = [];
  await mutate(empty); assert.equal((await names()).length, 0);
  assert.ok(await evaluate('!!document.querySelector(".catalog-empty")'));
  await mutate(seed);
  await navigate('/collections/');
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'collectionsPage.collectionCta',styleType:'button',properties:{backgroundColor:'#C4A46A'}},location.origin)`);
  await pause(350);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".collection-editorial-copy .text-link")).backgroundColor'), 'rgb(196, 164, 106)');
  await mutate(empty);
  assert.ok(await evaluate('Array.from(document.querySelectorAll(".collection-catalog-count > span:first-child")).every(el=>el.textContent==="0")'));
  empty.content.home.collections = [];
  await mutate(empty);
  assert.equal(await evaluate('document.querySelectorAll(".collection-editorial-card").length'), 0);
  assert.ok(await evaluate('!!document.querySelector(".collection-editorial-grid")'));
  await mutate(seed);
  findings.push('Missing optional fields/IDs, fallback images/prices/availability, empty catalog/collections and live Fivora content/style edits pass.');
  findings.push('A product added after the static build can navigate through the compatibility handoff and be selected in Shop.');

  await navigate('/');
  assert.equal(await evaluate('document.querySelectorAll(".watch-card").length'), 8);
  await evaluate('document.querySelector(".collection-card a").click()'); await pause(150);
  assert.equal(await evaluate('document.querySelectorAll("#featured .watch-grid > div:not([hidden])").length'), 1);
  await evaluate('document.querySelector(".filter-status button").click()');
  await evaluate('document.querySelector(".header-actions button").click()');
  await set('#watch-search', 'Navigator');
  await evaluate('document.querySelector(".search-results a").click()');
  assert.match(await evaluate('document.querySelector(".enquiry-status").textContent'), /Navigator Steel/);
  findings.push('Homepage collection filtering, search and enquiry selection remain functional.');
  assert.deepEqual(errors, []);
  findings.push('No browser runtime exceptions.');
  await writeFile(join(reportDir, 'phase2a-results.json'), JSON.stringify({ passed: true, findings }, null, 2));
  console.log(findings.join('\n'));
} finally { browser.close(); }

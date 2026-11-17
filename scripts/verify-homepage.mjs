import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { openBrowserSession } from './browser-session.mjs';
const browser = await openBrowserSession({ basePath: process.env.NEXT_PUBLIC_SITE_BASE_PATH || '' });
const { url, reportDir, send, evaluate, pause, errors: runtimeErrors } = browser;
const findings = [];
try {
  const inspectReadability = () => evaluate(`(() => {
    const rgb = value => (value.match(/[\\d.]+/g) || []).map(Number);
    const luminance = channels => channels.slice(0,3).map(v => {
      v /= 255;
      return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
    }).reduce((total, value, index) => total + value * [.2126,.7152,.0722][index], 0);
    const checks = [];
    for (const element of document.querySelectorAll('.watch-name, .watch-price, .watch-collection, .watch-stock > .deneb-text, .watch-description, .story-copy > p, .story-copy .text-link')) {
      const style = getComputedStyle(element);
      let background = element;
      while (background.parentElement) {
        const channels = rgb(getComputedStyle(background).backgroundColor);
        if (channels.length === 3 || channels[3] > 0) break;
        background = background.parentElement;
      }
      const foregroundLuminance = luminance(rgb(style.color));
      const backgroundLuminance = luminance(rgb(getComputedStyle(background).backgroundColor));
      const contrast = (Math.max(foregroundLuminance,backgroundLuminance) + .05) / (Math.min(foregroundLuminance,backgroundLuminance) + .05);
      let visible = !!element.getClientRects().length;
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
        const computed = getComputedStyle(ancestor);
        visible &&= computed.display !== 'none' && computed.visibility !== 'hidden' && Number(computed.opacity) > 0;
      }
      checks.push({ text: element.textContent.trim(), contrast, visible, fontSize: parseFloat(style.fontSize), color: style.color, background: getComputedStyle(background).backgroundColor });
    }
    return checks;
  })()`);
  const assertReadability = async label => {
    const checks = await inspectReadability();
    assert.equal(checks.length, 43, 'Every watch field and Brand Story text is checked');
    for (const check of checks) {
      assert.ok(check.text && check.visible, label + ': text is visible without hovering: ' + check.text);
      assert.ok(check.contrast >= 4.5, label + ': contrast below 4.5:1 for ' + check.text + ' (' + check.contrast.toFixed(2) + ', ' + check.color + ' on ' + check.background + ')');
      assert.ok(check.fontSize >= 10, label + ': small product or story text: ' + check.text);
    }
    return Math.min(...checks.map(check => check.contrast)).toFixed(2);
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await pause(1800);
  await evaluate('document.fonts.ready');
  assert.match(await evaluate('document.querySelector("h1").textContent'), /Timeless by Design/);
  assert.equal(await evaluate('document.querySelectorAll(".watch-card").length'), 8);
  assert.equal(await evaluate('document.querySelectorAll(".collection-card").length'), 4);
  findings.push('Homepage hydrated: hero, 8 watches and 4 collections.');
  for (const width of [1440, 1024, 768, 390, 320]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 800 });
    await pause(120);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), `Horizontal overflow at ${width}px`);
    await assertReadability(width + 'px');
    const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(join(reportDir, `homepage-${width}.png`), Buffer.from(screenshot.data, 'base64'));
  }
  findings.push('No horizontal overflow at 320, 390, 768, 1024 and 1440px; screenshots saved.');
  findings.push('Product fields remain visible without hover; product and Brand Story copy meet 4.5:1 contrast at all five widths.');
  await evaluate('document.querySelector(".mobile-toggle").click()');
  assert.equal(await evaluate('document.querySelector(".mobile-toggle").ariaExpanded'), 'true');
  await evaluate('document.querySelector(".mobile-nav a:first-child").click()');
  await pause(900);
  assert.equal(await evaluate('document.querySelector(".mobile-toggle").ariaExpanded'), 'false');
  await evaluate('document.querySelector(".collection-card a").click()');
  assert.equal(await evaluate('document.querySelectorAll("#featured .watch-grid > div:not([hidden])").length'), 1);
  await evaluate('document.querySelector(".filter-status button").click()');
  assert.equal(await evaluate('document.querySelectorAll("#featured .watch-grid > div:not([hidden])").length'), 4);
  await evaluate('document.querySelector(".header-actions button").click()');
  assert.equal(await evaluate('document.querySelector(".search-dialog").open'), true);
  await evaluate(`(() => { const input = document.querySelector('#watch-search'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; set.call(input,'Navigator'); input.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await pause(150);
  assert.equal(await evaluate('document.querySelectorAll(".search-results > a").length'), 1);
  await evaluate('document.querySelector(".search-results a").click()');
  for (let attempt = 0; attempt < 50; attempt++) {
    if (await evaluate('document.querySelector(".detail-product")?.dataset.productId === "navigator-steel"')) break;
    await pause(100);
  }
  assert.match(await evaluate('document.querySelector(".detail-title").textContent'), /Navigator Steel/);
  await browser.navigate('/');
  await evaluate('document.querySelector(".bag-button").click()');
  await pause(1200);
  assert.ok(await evaluate('location.pathname.endsWith("/cart/")'));
  await browser.navigate('/');
  findings.push('Mobile navigation, collection filtering, search-to-details navigation and bag notice work.');
  assert.equal(await evaluate(`(() => { const input = document.querySelector('#newsletter-email'); input.value='invalid'; return input.checkValidity(); })()`), false);
  await evaluate(`(() => { const input = document.querySelector('#newsletter-email'); input.value='client@example.com'; document.querySelector('.newsletter-form').requestSubmit(); })()`);
  await pause(100);
  assert.match(await evaluate('document.querySelector(".newsletter-status").textContent'), /not subscribed or stored/);
  findings.push('Newsletter rejects invalid email and reports demo-only success without network submission.');
  const missingAnchors = await evaluate(`Array.from(document.querySelectorAll('a')).map(a=>a.getAttribute('href')).filter(h=>h?.startsWith('#')&&!document.getElementById(h.slice(1)))`);
  assert.deepEqual(missingAnchors, []);
  await evaluate(`Promise.all(Array.from(document.images).map(image => { image.loading='eager'; return image.decode().catch(()=>{}); }))`);
  assert.deepEqual(await evaluate(`Array.from(document.images).filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)`), []);
  findings.push('Every local anchor resolves and every image loads.');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate('window.scrollTo(0,0)');
  await pause(150);
  const fullSize = await send('Page.getLayoutMetrics');
  const fullScreenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: fullSize.cssContentSize.height, scale: 1 } });
  await writeFile(join(reportDir, 'homepage-full.png'), Buffer.from(fullScreenshot.data, 'base64'));
  const fontFamily = await evaluate('getComputedStyle(document.querySelector("h1")).fontFamily');
  assert.match(fontFamily, /Manrope/);
  await evaluate('document.querySelector(".theme-switcher").click()');
  assert.equal(await evaluate('document.documentElement.classList.contains("dark")'), true);
  await evaluate('document.querySelector(".theme-switcher").click()');
  assert.equal(await evaluate('document.documentElement.classList.contains("dark")'), false);
  findings.push('Self-hosted Manrope and the preserved Deneb theme toggle work.');
  await evaluate('document.querySelector(".theme-switcher").click()');
  const darkContrast = await assertReadability('Dark mode');
  await evaluate('document.querySelector(".theme-switcher").click()');
  await evaluate('document.querySelector(".story-copy .text-link").focus()');
  await pause(300);
  await assertReadability('Keyboard focus');
  await evaluate('document.activeElement.blur()');
  const storyLinkBox = await evaluate('JSON.parse(JSON.stringify(document.querySelector(".story-copy .text-link").getBoundingClientRect()))');
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: storyLinkBox.x + 8, y: storyLinkBox.y + 8 });
  await pause(300);
  await assertReadability('Story CTA hover');
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 });
  findings.push('Dark-mode and story CTA hover/focus contrast pass; minimum dark contrast is ' + darkContrast + ':1.');
  const seed = JSON.parse(await readFile('src/data/site-data.json', 'utf8'));
  // The installed provider expects complete content snapshots, as Fivora sends.
  const titleEdited = structuredClone(seed);
  titleEdited.content.home.title = 'Live editor title';
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(titleEdited)},full:true},location.origin)`);
  await pause(150);
  assert.equal(await evaluate('document.querySelector("h1").textContent'), 'Live editor title');
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'home.title',styleType:'text',properties:{color:'#C4A46A'}},location.origin)`);
  await pause(150);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("h1")).color'), 'rgb(196, 164, 106)');
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'story.section',styleType:'section',properties:{backgroundColor:'#172B43'}},location.origin)`);
  await pause(100);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#story")).backgroundColor'), 'rgb(23, 43, 67)');
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'home.products[0]',styleType:'card',properties:{backgroundColor:'#EFEBE3',borderRadius:'4px'}},location.origin)`);
  await pause(100);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".watch-card")).backgroundColor'), 'rgb(239, 235, 227)');
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_STYLE_PATCH',targetPath:'home.templatesLabel',styleType:'button',properties:{backgroundColor:'#DCC394'}},location.origin)`);
  await pause(350);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".hero-ctas .button")).backgroundColor'), 'rgb(220, 195, 148)');
  const reordered = [...seed.content.home.products].reverse();
  reordered.push({ ...reordered[0], name: 'Editor-added timepiece' });
  const listEdited = structuredClone(seed);
  listEdited.content.home.products = reordered;
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(listEdited)},full:true},location.origin)`);
  await pause(150);
  assert.equal(await evaluate('document.querySelectorAll("#featured .watch-card").length'), 5);
  assert.match(await evaluate('document.querySelector("#featured .watch-name").textContent'), /Atelier No. 01/);
  listEdited.content.home.nextJsLogoImage = '/images/watch-sport.webp';
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(listEdited)},full:true},location.origin)`);
  await pause(150);
  assert.match(await evaluate('document.querySelector(".hero-image").src'), /watch-sport.webp/);
  await evaluate(`window.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(seed)},full:true},location.origin)`);
  findings.push('Fivora postMessage edits update text, styles, images, and added/reordered product rows live.');
  assert.deepEqual(runtimeErrors, []);
  findings.push('No browser runtime exceptions.');
  await writeFile(join(reportDir, 'browser-results.json'), JSON.stringify({ url, passed: true, findings }, null, 2));
  console.log(findings.join('\n'));

} finally { browser.close(); }

import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {openBrowserSession} from './browser-session.mjs';
const b=await openBrowserSession();const {navigate,evaluate,pause,send}=b;
try{
 await navigate('/checkout/');assert.match(await evaluate('document.querySelector("main").textContent'),/bag is empty/);
 await evaluate('localStorage.setItem("aurel-bag-v1",JSON.stringify({"heritage-automatic":2}));dispatchEvent(new Event("aurel-bag-change"))');
 await pause(150);assert.equal(await evaluate('document.querySelector("[data-preview-static=estimated-subtotal]").textContent'),'$4,900.00');
 const seed=JSON.parse(await readFile('src/data/site-data.json','utf8'));seed.content.checkout.whatsappNumber='invalid';
 const update=async()=>{await evaluate('window.postMessage('+JSON.stringify({type:'FIVORA_PREVIEW_SITE_DATA',siteData:seed,full:true})+',location.origin)');await pause(200);};await update();assert.ok(await evaluate('document.querySelector("button[type=submit]").disabled'));assert.ok(await evaluate('!!document.querySelector(".checkout-setup")'));
 assert.equal(await evaluate('document.querySelector(".checkout-business-number")'),null);seed.content.checkout.whatsappNumber='';await update();assert.ok(await evaluate('document.querySelector("button[type=submit]").disabled'));assert.equal(await evaluate('document.querySelector(".checkout-business-number")'),null);
 seed.content.checkout.whatsappNumber='+94 (77) 123-4567';await update();assert.equal(await evaluate('document.querySelector("button[type=submit]").disabled'),false);
 await evaluate('window.open=(url)=>{window.checkoutDestination=url;return null};document.querySelector("form").requestSubmit()');assert.equal(await evaluate('window.checkoutDestination'),undefined);assert.ok(await evaluate('!document.querySelector("form").checkValidity()'));
 await evaluate('document.querySelector("[name=name]").value="Ada & Co";document.querySelector("[name=phone]").value="+94771234567";document.querySelector("[name=address]").value="12 Gold Lane";document.querySelector("[name=notes]").value="Gift & delivery?";document.querySelector("form").requestSubmit()');
 assert.equal(await evaluate('document.querySelector(".checkout-business-number").textContent'),'+94 77 123 4567');
 const url=await evaluate('window.checkoutDestination');assert.ok(url.startsWith('https://wa.me/94771234567?text='));const message=new URL(url).searchParams.get('text');for(const part of ['Ada & Co','12 Gold Lane','Gift & delivery?','heritage-automatic','x 2','$4,900.00','not a confirmed order'])assert.ok(message.includes(part),part);
 seed.content.checkout.whatsappNumber='94779876543';await update();assert.equal(await evaluate('document.querySelector(".checkout-business-number").textContent'),'+94 77 987 6543');await evaluate('document.querySelector("form").requestSubmit()');assert.ok((await evaluate('window.checkoutDestination')).startsWith('https://wa.me/94779876543?text='));
 assert.equal(await evaluate('JSON.parse(localStorage.getItem("aurel-bag-v1"))["heritage-automatic"]'),2);
 for(const width of [320,390,768,1440]){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<800});await pause(100);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));assert.ok(await evaluate('Array.from(document.querySelectorAll(".checkout-field input,.checkout-field textarea")).every(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>150&&r.height>=50&&s.display!=="none"&&parseFloat(s.borderTopWidth)>=1&&s.backgroundColor!=="rgba(0, 0, 0, 0)"})'));assert.equal(await evaluate('getComputedStyle(document.querySelector(".checkout-item")).gridTemplateColumns.split(" ").length'),2);}
 await send('Emulation.setFocusEmulationEnabled',{enabled:true});await evaluate('document.querySelector("[name=name]").focus()');await pause(100);assert.ok(await evaluate('getComputedStyle(document.querySelector("[name=name]")).outlineStyle!=="none"'));
 await navigate('/cart/');assert.ok(await evaluate('Array.from(document.querySelectorAll("a")).some(a=>new URL(a.href).pathname.endsWith("/checkout/"))'));assert.deepEqual(b.errors,[]);console.log('Checkout validation, live number display/destination updates, message encoding, estimates, persistence and responsive checks passed. No message sent.');
}finally{b.close();}

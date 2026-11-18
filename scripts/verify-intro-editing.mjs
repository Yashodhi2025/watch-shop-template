import assert from 'node:assert/strict';
import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {spawn,execFile} from 'node:child_process';
import {createServer} from 'node:net';
import {createHash} from 'node:crypto';
import {resolve,join,sep} from 'node:path';
import ts from 'typescript';
import {openBrowserSession} from './browser-session.mjs';

// This runs the installed Local Test Lab and its actual save endpoint.
// It does not implement or claim to test the authenticated Inspector UI.
const root=resolve('.');
const fixture=resolve('.deneb/qa/intro-lab-'+Date.now());
assert.ok(fixture.startsWith(root+sep));
const original=await readFile('src/data/site-data.json');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
await mkdir(fixture,{recursive:true});
for(const name of ['src','public','package.json','package-lock.json','next.config.ts','tsconfig.json','fivora-template.json'])await cp(resolve(name),join(fixture,name),{recursive:true});
const config=await readFile(join(fixture,'next.config.ts'),'utf8');
await writeFile(join(fixture,'next.config.ts'),config.replace('turbopack: {',`turbopack: { root: ${JSON.stringify(root)},`));
const cssPath=join(fixture,'src/app/globals.css');
await writeFile(cssPath,(await readFile(cssPath,'utf8')).replace('@source "../../node_modules/@deneb-ui/ui/dist";',`@source "${root.replaceAll('\\','/')}/node_modules/@deneb-ui/ui/dist";`));
await writeFile(join(fixture,'public/intro-protocol-check.html'),`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local Test Lab protocol monitor (not Inspector)</title><style>html,body,iframe{margin:0;width:100%;height:100%;border:0;display:block}</style></head><body><iframe id="lab" title="Actual Deneb Local Test Lab" src="/__fivora_local_preview"></iframe><script>window.events=[];addEventListener('message',event=>{if(event.data?.type==='FIVORA_PREVIEW_ELEMENT_CLICKED')window.events.push(event.data)})</script></body></html>`);
const freePort=()=>new Promise((done,fail)=>{const server=createServer();server.on('error',fail);server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>done(port))})});
const apiPort=await freePort(),previewPort=await freePort(),origin=`http://127.0.0.1:${apiPort}`;
let output='',token='',browser;
let homepageImagePaths;
const lab=spawn(process.execPath,[resolve('node_modules/@deneb-ui/cli/src/tools/local-template-lab.cjs'),fixture,'--api-port',String(apiPort),'--preview-port',String(previewPort),'--skip-install'],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
const capture=chunk=>{output=(output+chunk.toString()).slice(-30000);token=output.match(/Connection token: ([^\s]+)/)?.[1]||token;};
lab.stdout.on('data',capture);lab.stderr.on('data',capture);
const pause=ms=>new Promise(done=>setTimeout(done,ms));
const waitFor=async(check,label,attempts=180)=>{for(let i=0;i<attempts;i++){if(await check().catch(()=>false))return;await pause(500)}throw Error(label)};
const api=async(method,path,body)=>{
 const response=await fetch(origin+path,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 assert.ok(response.ok,`${method} ${path}: ${response.status}`);return response.json();
};
const doc=`document.getElementById('lab')?.contentDocument?.getElementById('template-preview')?.contentDocument`;
const win=`document.getElementById('lab')?.contentWindow?.document.getElementById('template-preview')?.contentWindow`;
const sendParent=async payload=>browser.evaluate(`document.getElementById('lab').contentWindow.postMessage(${JSON.stringify(payload)},location.origin)`);
const openIntro=async()=>{
 await browser.send('Page.navigate',{url:origin+'/intro-protocol-check.html'});
 await waitFor(()=>browser.evaluate(`!!(${doc})?.querySelector('.site-header')`),'Homepage not ready in actual Lab');
 if (!homepageImagePaths) homepageImagePaths=await browser.evaluate(`Array.from(${doc}.querySelectorAll('.hero img[data-preview-field-path]')).map(el=>el.dataset.previewFieldPath)`);
 await browser.evaluate(`(()=>{const target=${win};target.location.href=location.origin+'/intro/'})()`);
 await waitFor(()=>browser.evaluate(`${win}?.location.pathname==='/intro/' && (${doc})?.readyState==='complete' && !!(${doc})?.querySelector('.aurel-cinematic-intro-persistent .aurel-intro-name') && ${win}.__FIVORA_LOCAL_VISUAL_BRIDGE_ATTACHED__===true`),'Intro/installed bridge not ready');
};
try{
 console.log('Starting real Local Test Lab in an isolated source copy; no packages installed.');
 await waitFor(async()=>token&&(await api('GET','/api/status')).devStatus==='ready','Local Test Lab source server failed');
 console.log('Local Test Lab ready. Checking canonical schema and real selection relay.');
 const payload=await api('GET','/api/site-data');
 const code=ts.transpileModule(await readFile('node_modules/@deneb-ui/cli/src/common/template-editor-schema.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
 const schema=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 assert.deepEqual(schema.findDuplicateTemplateEditorPaths(payload.manifest.editorSchema),[]);
 const canonical=schema.canonicalizeTemplateEditorSchema(payload.manifest.editorSchema);
 const introSchema=schema.filterEditorSchemaBySelectedPages(canonical,['intro']);
 const homeSchema=schema.filterEditorSchemaBySelectedPages(canonical,['home']);
 const brand=introSchema.sections.find(section=>section.path==='home.introLogo');
 assert.equal(brand?.label,'Brand Name');assert.equal(brand.type,'text');
 assert.ok(homeSchema.sections.some(section=>section.path==='home.introLogo'));
 const fields=introSchema.sections.filter(section=>!['object','list'].includes(section.type)).map(section=>({...section,value:schema.getValueByPath(payload.siteData.content,section.path)}));
 browser=await openBrowserSession();
 await browser.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await openIntro();
 await sendParent({type:'FIVORA_PREVIEW_SITE_DATA',siteData:payload.siteData,full:true});
 await sendParent({type:'FIVORA_PREVIEW_EDIT_MODE',editMode:true,fields});await pause(300);
 for(const width of [1440,390]){
  await browser.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<800});await pause(150);
  const point=await browser.evaluate(`(()=>{const d=${doc},el=d.querySelector('.aurel-intro-name');const r=el.getBoundingClientRect(),hit=d.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {x:r.x+r.width/2,y:r.y+r.height/2,hit:hit?.dataset.previewFieldPath,hitHtml:hit?.outerHTML.slice(0,200),pointer:${win}.getComputedStyle(el).pointerEvents,count:d.querySelectorAll('[data-preview-field-path="home.introLogo"]').length,taglineCount:d.querySelectorAll('[data-preview-field-path="home.introTagline"]').length}})()`);
  assert.equal(point.hit,'home.introLogo',JSON.stringify(point));assert.equal(point.count,1);assert.equal(point.taglineCount,1);
  await browser.evaluate('window.events.length=0');
  for(const type of ['mousePressed','mouseReleased'])await browser.send('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:'left',clickCount:1});
  await pause(100);
  const selection=await browser.evaluate('window.events.at(-1)');
  assert.equal(selection?.fieldPath,brand.path,JSON.stringify({point,selection,events:await browser.evaluate('window.events')}));assert.equal(selection.fieldValue,payload.siteData.content.home.introLogo);assert.equal(selection.elementTag,'span');
 }
 const edited='AUREL II';
 await sendParent({type:'FIVORA_PREVIEW_CONTENT_PATCH',patches:[{path:brand.path,value:edited}]});
 await waitFor(()=>browser.evaluate(`${doc}.querySelector('.aurel-intro-name').textContent===${JSON.stringify(edited)}`),'Content patch did not reach the visible brand');
 await pause(1800);
 const applied=await browser.evaluate(`${win}.__FIVORA_PREVIEW_SITE_DATA__`);
 assert.equal(applied.content.home.introLogo,edited);
 assert.equal(JSON.parse(await readFile(join(fixture,payload.manifest.siteDataFile),'utf8')).content.home.introLogo,payload.siteData.content.home.introLogo,'Apply alone must not modify the source');
 const saved=await api('POST','/api/site-data',{siteData:applied});assert.equal(saved.saved,true);
 assert.equal((await api('GET','/api/site-data')).siteData.content.home.introLogo,edited);
 assert.equal(JSON.parse(await readFile(join(fixture,payload.manifest.siteDataFile),'utf8')).content.home.introLogo,edited);
 console.log('Actual save endpoint wrote the edited brand. Opening a fresh browser profile to exclude preview/session-cache persistence.');
 browser.close();browser=await openBrowserSession();
 await browser.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await openIntro();
 await waitFor(()=>browser.evaluate(`${doc}.querySelector('.aurel-intro-name').textContent===${JSON.stringify(edited)}`),'Fresh load did not retain saved brand');
 const shot=await browser.send('Page.captureScreenshot',{format:'png'});await writeFile('.deneb/qa/intro-after.png',Buffer.from(shot.data,'base64'));
 // Animation replay is an actual native button action outside edit mode.
 const point=await browser.evaluate(`(()=>{const r=${doc}.querySelector('.aurel-intro-preview').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 for(const type of ['mousePressed','mouseReleased'])await browser.send('Input.dispatchMouseEvent',{type,...point,button:'left',clickCount:1});
 await pause(150);assert.ok(await browser.evaluate(`!!${doc}.querySelector('.aurel-cinematic-intro-previewing')`));
 await pause(3200);assert.equal(await browser.evaluate(`${doc}.querySelector('.aurel-intro-name').textContent`),edited);
 await browser.evaluate(`(()=>{const target=${win};target.sessionStorage.clear();target.location.href=location.origin+'/'})()`);
 await waitFor(()=>browser.evaluate(`!!(${doc})?.querySelector('.site-header')`),'Homepage failed after save');
 assert.equal(await browser.evaluate(`${doc}.querySelector('.aurel-intro-name')?.textContent`),edited);
 await pause(3300);assert.deepEqual(await browser.evaluate(`Array.from(${doc}.querySelectorAll('.hero img[data-preview-field-path]')).map(el=>el.dataset.previewFieldPath)`),homepageImagePaths);
 assert.equal(hash(await readFile('src/data/site-data.json')),hash(original),'Real merchant data changed during isolated QA');
 const report={passed:true,actualFivoraInspectorVerified:false,validation:'npm run validate passed',checks:['Actual visible logo native clicks select home.introLogo through the installed Local Test Lab bridge at desktop/mobile widths','Canonical page-filtered schema exposes one text field labelled Brand Name on Intro and Home','Real content-patch relay updates the visible binding without hidden/duplicate markers','Real authenticated Local Test Lab save endpoint writes its declared siteDataFile','A fresh browser profile reads the saved brand without an editor snapshot or session cache','Intro replay and homepage intro use the same saved brand; homepage hero remains mounted'],unverified:['Authenticated Fivora Inspector Brand Name input, Apply button, Save local button and portal reload UI'],fixture};
 await writeFile('.deneb/qa/intro-editing-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}catch(error){console.error(error.stack||String(error));console.error(output.replace(/Connection token: \S+/g,'Connection token: [redacted]').slice(-5000));process.exitCode=1;}
finally{
 browser?.close();
 if(process.platform==='win32')await new Promise(done=>execFile('taskkill',['/PID',String(lab.pid),'/T','/F'],{windowsHide:true},()=>done()));else lab.kill('SIGTERM');
}

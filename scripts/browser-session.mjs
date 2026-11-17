import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve, join, extname } from 'node:path';

export async function openBrowserSession({ basePath = '' } = {}) {
  const root = resolve('out');
  const reportDir = resolve('.deneb/qa');
  await mkdir(reportDir, { recursive: true });
  const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain' };
  const server = createServer(async (req, res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (basePath) {
        if (pathname !== basePath && !pathname.startsWith(basePath + '/')) throw Error('Wrong base path');
        pathname = pathname.slice(basePath.length) || '/';
      }
      const relative = pathname.replace(/^\/+/, '').replace(/\/$/, '');
      const candidates = relative ? [relative, relative + '.html', relative + '/index.html'] : ['index.html'];
      let served = false;
      for (const candidate of candidates) {
        const file = resolve(root, candidate);
        if (!file.startsWith(root + '\\') && !file.startsWith(root + '/')) continue;
        try {
          const content = await readFile(file);
          res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }); res.end(content); served = true; break;
        } catch { /* Try the next static export format. */ }
      }
      if (!served) { res.writeHead(404); res.end('Not found'); }
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${join(reportDir, `chrome-profile-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let socket;
  const close = () => { socket?.close(); chrome.kill(); server.close(); };
  try {
    const endpoint = await new Promise((done, reject) => {
      const timeout = setTimeout(() => reject(Error('Chrome debugging timeout')), 20000);
      chrome.on('error', reject);
      chrome.stderr.on('data', chunk => { const match = chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) { clearTimeout(timeout); done(match[1]); } });
    });
    const pages = await (await fetch(`http://127.0.0.1:${new URL(endpoint).port}/json`)).json();
    socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise((done, reject) => { socket.onopen = done; socket.onerror = reject; });
    let serial = 0;
    const pending = new Map();
    const errors = [];
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      if (!message.id) return;
      const entry = pending.get(message.id);
      if (!entry) return;
      pending.delete(message.id);
      if (message.error) entry.reject(Error(JSON.stringify(message.error)));
      else entry.resolve(message.result);
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const pause = milliseconds => new Promise(done => setTimeout(done, milliseconds));
    const navigate = async path => {
      await send('Page.navigate', { url: origin + basePath + path });
      for (let attempt = 0; attempt < 50; attempt++) {
        await pause(100);
        if (await evaluate('document.readyState === "complete" && !!document.querySelector(".site-header")')) break;
      }
      await pause(300);
      await evaluate('document.fonts.ready');
    };
    await send('Page.enable'); await send('Runtime.enable');
    return { origin, url: origin + basePath, reportDir, send, evaluate, pause, navigate, errors, close };
  } catch (error) { close(); throw error; }
}

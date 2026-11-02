import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename, extname } from 'node:path';

// Follow Parcel's hashed references from Clef, including CSS fonts and SVG
// symbols. Do not cache unrelated pages or the site's large audio collection.
const output = new URL('../../docs/', import.meta.url);
const files = await readdir(output, { recursive: true });
const candidates = files.map(file => file.replaceAll('\\', '/'))
  .filter(file => /\.(?:js|css|webmanifest|png|ico|svg|jpg|jpeg|webp|woff2?|ttf|otf)$/.test(file) && !file.endsWith('/sw.js'));
const assets = new Set(['clef/index.html']);
const queue = ['clef/index.html'];
const hash = createHash('sha256');
while (queue.length) {
  const file = queue.shift();
  const content = await readFile(new URL(file, output));
  hash.update(file).update(content);
  if (!['.html', '.js', '.css', '.webmanifest'].includes(extname(file))) continue;
  const text = content.toString();
  for (const candidate of candidates) {
    if (!assets.has(candidate) && text.includes(basename(candidate))) {
      assets.add(candidate);
      queue.push(candidate);
    }
  }
}
const version = hash.digest('hex').slice(0, 16);
const urls = [...assets].map(file => '/' + file);
urls.push('/clef/');
const worker = `// Generated from this build's complete Clef asset graph.
const CACHE = 'clef-offline-${version}';
const ASSETS = ${JSON.stringify(urls)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('clef-offline-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data === 'CLEF_OFFLINE_STATUS') event.source?.postMessage({type: 'CLEF_OFFLINE_READY'});
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    // Serve the HTML belonging to this cache version so its hashed assets match.
    if (url.pathname === '/clef/' || url.pathname === '/clef/index.html') {
      event.respondWith(caches.open(CACHE).then(cache => cache.match('/clef/index.html')));
    }
    return;
  }
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(url.pathname)) || fetch(event.request)));
  }
});
`;
await writeFile(new URL('clef/sw.js', output), worker);
console.log(`Clef offline: ${assets.size} assets, version ${version}`);

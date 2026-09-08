// A real static server with no SPA fallback: exercises GitHub Pages constraints.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../docs/', import.meta.url));
const mount = '/nala-catalogue/';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/nala-catalogue') { response.writeHead(301, { Location: mount }).end(); return; }
    if (!pathname.startsWith(mount)) { response.writeHead(404).end('Not found'); return; }
    const path = resolve(root, pathname.slice(mount.length) || 'index.html');
    if (!path.startsWith(resolve(root) + sep)) { response.writeHead(403).end(); return; }
    const file = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(file);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(4175, '127.0.0.1', () => console.log(`Vista estática: http://127.0.0.1:4175${mount}`));

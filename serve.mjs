// A tiny static server for the guide, for local use only: `node serve.mjs`
// serves app/ at http://localhost:8080 (or --port <n>, --host <h>). It
// sends the MIME types a browser needs, answers HEAD as well as GET,
// refuses any path outside app/, logs each request in one line, and does
// nothing else — this is a development convenience, not a web server for
// the internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const args = process.argv.slice(2);

function flagValue(flag, fallback) {
  const at = args.indexOf(flag);
  return at === -1 ? fallback : args[at + 1];
}

const wantedPort = Number(flagValue('--port', '8080'));
const port = Number.isInteger(wantedPort) && wantedPort > 0 && wantedPort < 65536 ? wantedPort : 8080;
const host = flagValue('--host', '127.0.0.1') || '127.0.0.1';
const quiet = args.includes('--quiet');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function logLine(status, method, pathname) {
  if (quiet) return;
  const stamp = new Date().toISOString().slice(11, 19);
  console.log(`${stamp} ${status} ${method} ${pathname}`);
}

createServer((request, response) => {
  const method = request.method ?? 'GET';
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    logLine(400, method, url.pathname);
    response.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(appRoot, normalize(pathname)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    logLine(403, method, pathname);
    response.writeHead(403).end('forbidden');
    return;
  }
  let size;
  try {
    const stats = statSync(file);
    if (!stats.isFile()) throw new Error('not a file');
    size = stats.size;
  } catch {
    logLine(404, method, pathname);
    response.writeHead(404).end('not found');
    return;
  }
  const headers = {
    'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
  };
  if (method === 'HEAD') {
    logLine(200, method, pathname);
    response.writeHead(200, headers).end();
    return;
  }
  if (method !== 'GET') {
    logLine(405, method, pathname);
    response.writeHead(405).end('method not allowed');
    return;
  }
  logLine(200, method, pathname);
  response.writeHead(200, headers);
  createReadStream(file).pipe(response);
}).listen(port, host, () => {
  console.log(`Leonida Ledger is on http://${host}:${port} (serving ${appRoot})`);
});

/** سيرفر ثابت للمعاينة المحلية فقط — لا يُستخدم في الإنتاج. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist');
const PORT = Number(process.env.PORT || 4173);
const HOST = '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2'
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';

  // منع الخروج من dist
  const target = path.join(DIST, rel);
  if (!target.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let file = target;
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (fs.existsSync(`${file}.html`)) file = `${file}.html`;
    else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p>الصفحة غير موجودة. جرّب <a href="/">الصفحة الرئيسية</a>.</p>');
      return;
    }
  }

  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, HOST, () => {
  console.log(`\n\x1b[36m▸ المعاينة:\x1b[0m http://${HOST}:${PORT}\n`);
});

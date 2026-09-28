// `npm run build` のあとに dist/ を点検する（`npm run check`）。
//   1. 決まったページが全部あるか（アプリはコレクションのフォルダから数える）
//   2. 内部リンク（href / src）が dist の中の実在のファイルを指しているか（#id も確かめる）
//   3. 外部の URL を読み込んでいないか（<link> / <script> / <img> / <source> / <iframe> と CSS の url()）
// 問題があれば一覧を出して終了コード 1。
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const problems = [];

if (!existsSync(dist)) {
  console.error('dist/ がありません。先に npm run build を。');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = walk(dist);
const rel = (p) => relative(dist, p).split(sep).join('/');

// 1. ページ
const slugs = readdirSync(join(root, 'src/content/apps')).filter((n) =>
  existsSync(join(root, 'src/content/apps', n, 'index.md')),
);
const expected = [
  'index.html',
  'privacy/index.html',
  '404.html',
  'CNAME',
  '.nojekyll',
  'robots.txt',
  ...slugs.flatMap((s) => [`apps/${s}/index.html`, `apps/${s}/privacy/index.html`, `apps/${s}/support/index.html`]),
];
for (const e of expected) if (!existsSync(join(dist, e))) problems.push(`ページが無い: ${e}`);

// URL の path → dist のファイル
function resolveTarget(pathname) {
  const p = decodeURIComponent(pathname).replace(/^\//, '');
  const candidates = p === '' ? ['index.html'] : p.endsWith('/') ? [`${p}index.html`] : [p];
  return candidates.map((c) => join(dist, c)).find((f) => existsSync(f) && statSync(f).isFile());
}

const idsCache = new Map();
function idsOf(file) {
  if (!idsCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    idsCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
}

const htmlFiles = files.filter((f) => f.endsWith('.html'));
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + rel(file).replace(/index\.html$/, '');

  // 3. 外部の読み込み
  const loadTags = /<(link|script|img|source|iframe|video|audio|embed|object)\b[^>]*>/gi;
  for (const [tag] of html.matchAll(loadTags)) {
    const attrs = [...tag.matchAll(/\s(href|src|srcset|data)="([^"]*)"/gi)];
    for (const [, name, value] of attrs) {
      if (/(^|[\s,])(https?:)?\/\//i.test(value)) {
        problems.push(`${rel(file)}: 外部の読み込み <${tag.slice(1, tag.indexOf(' '))} ${name}="${value}">`);
      }
    }
  }

  // 2. 内部リンク
  for (const [, attr, value] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    if (/^(mailto:|tel:|https?:|data:|\/\/)/i.test(value)) continue;
    if (value === '#') continue; // 準備中のストアボタン
    const url = new URL(value, `https://hitoma.works${page}`);
    const target = url.pathname === page && value.startsWith('#') ? file : resolveTarget(url.pathname);
    if (!target) {
      problems.push(`${rel(file)}: リンク切れ ${attr}="${value}"`);
      continue;
    }
    const id = decodeURIComponent(url.hash.slice(1));
    if (id && target.endsWith('.html') && !idsOf(target).has(id)) {
      problems.push(`${rel(file)}: #${id} が ${rel(target)} に無い`);
    }
  }
}

// CSS の url() も外部を指していないか
for (const file of files.filter((f) => f.endsWith('.css'))) {
  const css = readFileSync(file, 'utf8');
  for (const [, u] of css.matchAll(/url\(\s*['"]?([^'")]+)/g)) {
    if (/^(https?:)?\/\//i.test(u)) problems.push(`${rel(file)}: 外部の url(${u})`);
    else if (!u.startsWith('data:') && !resolveTarget(new URL(u, `https://hitoma.works/${rel(file)}`).pathname))
      problems.push(`${rel(file)}: url(${u}) が無い`);
  }
}

const size = files.reduce((n, f) => n + statSync(f).size, 0);
const fonts = files.filter((f) => /\.woff2?$/.test(f));
const fontSize = fonts.reduce((n, f) => n + statSync(f).size, 0);
const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
console.log(`HTML ${htmlFiles.length} ページ / 全 ${files.length} ファイル ${mb(size)}（うちフォント ${fonts.length} 個 ${mb(fontSize)}）`);

if (problems.length) {
  console.error(`\n問題 ${problems.length} 件:\n` + problems.map((p) => '  - ' + p).join('\n'));
  process.exit(1);
}
console.log('OK: ページはそろっていて、内部リンクは全部あり、外部の読み込みはありません。');

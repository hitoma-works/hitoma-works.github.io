// @fontsource の CSS から「日本語（分割）＋ラテン」の @font-face だけを抜き出して
// src/styles/fonts.css を作る。キリル文字・ラテン拡張・ベトナム語の面と .woff の予備は落とす。
// フォントや太さを変えたとき、@fontsource を更新したときに `npm run fonts` で作り直してコミットする。
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FACES = [
  { pkg: 'noto-sans-jp', weights: [400, 700] },
  { pkg: 'zen-kaku-gothic-new', weights: [900] },
];
const DROP = /-(cyrillic|cyrillic-ext|latin-ext|vietnamese|greek)-\d+-normal \*\//;

const root = new URL('../', import.meta.url);
const out = ['/* 自動生成：scripts/fonts.mjs（手で直さない。`npm run fonts` で作り直す） */'];

for (const { pkg, weights } of FACES) {
  for (const w of weights) {
    const css = readFileSync(new URL(`node_modules/@fontsource/${pkg}/${w}.css`, root), 'utf8');
    const blocks = css.split(/(?=\/\* )/).filter((b) => b.includes('@font-face'));
    let kept = 0;
    for (const block of blocks) {
      if (DROP.test(block)) continue;
      out.push(
        block
          .trim()
          .replace(/url\(\.\/files\//g, `url(../../node_modules/@fontsource/${pkg}/files/`)
          .replace(/,\s*url\([^)]*\.woff\) format\('woff'\)/g, ''),
      );
      kept++;
    }
    if (kept === 0) throw new Error(`${pkg} ${w}: @font-face が見つかりません`);
    console.log(`${pkg} ${w}: ${kept} faces`);
  }
}

writeFileSync(fileURLToPath(new URL('src/styles/fonts.css', root)), out.join('\n') + '\n');

# hitoma works — 公式サイト（Astro）

個人開発の屋号「hitoma works」の公式サイト。GitHub Pages（リポジトリ `hitoma-works/hitoma-works.github.io`、独自ドメイン `hitoma.works`）で公開する。
用途は、App Store／Google Play の組織アカウントに要る「事業を表す公開サイト」と、アプリごとの紹介・プライバシーポリシー・サポートのページ。

**Astro（静的サイト）でビルドする**。素の HTML を直接書くのではなく、`src/` を直して `npm run build` で `dist/` を作る。公開は GitHub Actions がやる。

## 作業の前後（Windows と Mac の両方から編集する）
- Windows（`D:\Claude_code\hitoma-works.github.io`）と Mac の両方の Claude Code から編集する。
- **作業を始める前に必ず `git pull`**。`package.json` か `package-lock.json` が変わっていたら `npm ci`。
- **コミットしたらすぐ `git push`**。手元に溜めない（もう一方の端末と食い違う）。
- `master` に push すると GitHub Actions（`.github/workflows/deploy.yml`）がビルドして Pages に出す（数分）。失敗したら Actions のログを見る。
- **`package-lock.json` は必ずコミットする**（両方の端末と Actions で同じ版を使うため）。**`node_modules/`・`dist/`・`.astro/` はコミットしない**（`.gitignore` 済み）。
- パッケージを足す・上げるときは `npm install <pkg>` で、`package.json` と `package-lock.json` を一緒にコミット。
- 改行は LF（`.gitattributes`）。

## コマンド
```
npm ci            # 初回・pull で依存が変わったとき（Node 22.12 以上。手元は 25 でよい）
npm run dev       # http://localhost:4321/ で確かめながら編集
npm run build     # dist/ を作り、続けて scripts/check-dist.mjs で点検（ページの有無・リンク切れ・外部の読み込み）
npm run preview   # dist/ を http://localhost:4321/ で見る
npm run fonts     # フォントの太さを変えた・@fontsource を上げたときだけ（src/styles/fonts.css を作り直す）
```
**push の前に `npm run build` が通ること**を必ず確かめる（Actions でも同じ点検が走り、落ちると公開されない）。

## 決まり
- **外部から何も読み込まない**：CDN・Google Fonts・解析・広告・埋め込み（YouTube、SNS ボタン等）・Cookie は入れない（`/privacy/` にそう書いてある）。ストアや各社のポリシーへの普通の `<a>` リンクは可。
- フォントは npm の `@fontsource/zen-kaku-gothic-new`（見出し 900）と `@fontsource/noto-sans-jp`（本文 400・700）を同梱。日本語（分割）＋ラテンの面だけを `src/styles/fonts.css`（自動生成、手で直さない）に入れている。
- Tailwind・React などの UI ライブラリは入れない。スタイルは `src/styles/global.css` の CSS 変数と共通の型、ページ・部品ごとの scoped `<style>`。色は変数を使い、直書きしない。
- 見た目（2026-09-28 Ko：A 案＋コーラル）：白地 `#FFFFFF`、文字 `#111827`、薄い文字 `#4B5563`／`#6B7280`、カード `#F3F4F6`、線 `#E5E7EB`、アクセントはコーラル `#FF6B5B`。コーラルの上の文字は `#3B1A14`、リンクは `#C8473A`。モバイル優先・1 カラム・最大幅 720px。ダークモードは対応しない。幅 375px で横にはみ出さないこと。
- **文言は日本語、です・ます**。
- URL は末尾スラッシュのディレクトリ形式（`/apps/nagara-eitango/privacy/`）。内部リンクは `/` から始まる絶対パスで、末尾に `/` を付ける。**公開後はストアに URL が登録されるので、slug とパスは変えない**。
- `public/CNAME`（`hitoma.works`）と `public/.nojekyll` は消さない。

## ファイル構成
```
src/content.config.ts                 コレクションの定義（apps と appDocs）
src/content/apps/<slug>/index.md      アプリの紹介（frontmatter ＋ 本文は特長の箇条書き）
src/content/apps/<slug>/privacy.md    アプリのプライバシーポリシーの本文（ストアに登録する URL）
src/content/apps/<slug>/support.md    アプリのサポートの本文（ストアに登録する URL）
src/assets/apps/<slug>.png            アプリのアイコン（置けば使われる。無ければ名前の 1 文字目の文字アイコン）
src/assets/apps/<slug>/*.png          スクリーンショット（index.md の screenshots に並べる）
src/pages/index.astro                 ホーム（ヒーロー・アプリ一覧・お問い合わせ）
src/pages/apps/[slug]/index.astro     /apps/<slug>/
src/pages/apps/[slug]/privacy.astro   /apps/<slug>/privacy/
src/pages/apps/[slug]/support.astro   /apps/<slug>/support/
src/pages/privacy.astro               /privacy/（サイト全体のポリシー。アプリの一覧は自動）
src/pages/404.astro                   404.html
src/layouts/Base.astro                共通の <head>・ヘッダー（屋号／アプリ／お問い合わせ）・フッター
src/components/                       AppCard・AppIcon・StoreButtons・Screenshots
src/lib/apps.ts, src/lib/site.ts      コレクションの読み出し・URL・日付の書式／屋号・連絡先
src/styles/global.css                 色・文字・共通の型
src/styles/fonts.css                  @font-face（npm run fonts で自動生成）
public/                               CNAME・.nojekyll・robots.txt・favicon.svg（そのまま出る）
scripts/check-dist.mjs                ビルド後の点検
scripts/fonts.mjs                     fonts.css を作る
```

## アプリを 1 つ足す手順
1. `git pull`（→ 必要なら `npm ci`）。
2. slug を決める（英小文字とハイフン。例：`nagara-eitango`）。URL になり、公開後は変えない。
3. `src/content/apps/nagara-eitango/` のフォルダを丸ごと `src/content/apps/<slug>/` に写す。
4. `index.md` の frontmatter を書き換える：
   - `name`（アプリ名）、`tagline`（一言）、`description`（説明。カードとページの meta description）
   - `platforms`（`[Android, iOS]` のどちらか・両方）
   - `storeLinks`（公開前は `{}` のまま＝「準備中」のボタン。公開したら `googlePlay:`／`appStore:` に URL）
   - `screenshots`（公開前は `[]`＝枠だけ。画像は `src/assets/apps/<slug>/` に置き、`- src: ../../../assets/apps/<slug>/1.png` と `alt:` を並べる）
   - `requirements`（対応 OS の一文）、`notice`（商標の表記など。無ければ行ごと消す）
   - `privacyEstablished`（制定日）、`privacyUpdated`（最終改定日）、`order`（一覧の並び。小さい順）
   - 本文は特長の箇条書き：`- **見出し**説明の文。`
5. `privacy.md` をアプリの実際の挙動（集める情報・通信・解析・広告・バックアップ）と一つずつ突き合わせて書き直し、ストアの申告（データセーフティ／App のプライバシー）と揃える。`description` も直す。
6. `support.md` のよくある質問を書き直す（`<details><summary>質問</summary>` … `</details>`。中身の前後は空行）。
7. アイコンがあれば `src/assets/apps/<slug>.png`（正方形、512px 以上）に置く。角丸は CSS で付くので四角のままでよい。
8. ホームの一覧・`/privacy/` のアプリの一覧・ページは自動でできる。`npm run build` が通ることを確かめ、`npm run dev` か `npm run preview` で見る。
9. コミットしてすぐ push。

プライバシーポリシーを改定したら `privacyUpdated` を上げる。

## 仮置き（公開前に直す）
- 連絡先 `info@hitoma.works`（`src/lib/site.ts` と各 md）。メールが受け取れることを確かめる。
- ストアのボタンは `#` の「準備中」、中身は文字の仮置き。公開したら URL を `storeLinks` に入れ、公式のバッジ画像（Google Play・Apple の配布物、各社のガイドラインに従う）に `src/components/StoreButtons.astro` を差し替える。
- スクリーンショットは枠だけ。アイコンは文字「な」。

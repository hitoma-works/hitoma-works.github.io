# hitoma works — 公式サイト

個人開発の屋号「hitoma works」の公式サイト。GitHub Pages（リポジトリ `hitoma-works/hitoma-works.github.io`、独自ドメイン `hitoma.works`）で公開する。
用途は、App Store／Google Play の組織アカウントに要る「事業を表す公開サイト」と、アプリごとの紹介・プライバシーポリシー・サポートのページ。

## 作業の前後（Windows と Mac の両方から編集する）
- このリポジトリは Windows（`D:\Claude_code\hitoma-works.github.io`）と Mac の両方の Claude Code から編集する。
- **作業を始める前に必ず `git pull`**。
- **コミットしたらすぐ `git push`**。手元に溜めない（もう一方の端末と食い違う）。
- `master` に push すれば GitHub Pages に自動で出る（数分かかる）。ビルドの手順は無い。

## 決まり
- **ビルド無し・素の HTML と CSS だけ**。静的サイトジェネレーター、npm、JS のライブラリは入れない。
- **外部の CSS・JS・フォントは読み込まない**（オフラインでも表示できるように）。フォントはシステムフォント。アクセス解析・Cookie・広告も入れない（`privacy.html` にそう書いてある）。
- スタイルは `assets/site.css` の 1 枚だけ。ページに `<style>` や `style=""` を書かない。
- 色は生成り `#FFF6E9` の地、文字 `#2B2B2B`、アクセントはコーラル `#FF6B5B`（控えめに）。ダークモードは対応しない。モバイル優先・1 カラム・最大幅 720px。
- **文言は日本語、です・ます**。
- **画像は `assets/img/`** に置く。
- 各ページは共通のヘッダー（屋号 → ホーム）とフッター（© 2026 hitoma works、`privacy.html` へのリンク）を持つ。`<html lang="ja">`、`viewport`、`<title>`、`description` を必ず入れる。
- ページ間のリンクは相対パスで、`index.html` まで書く（`apps/foo/index.html`）。ファイルを直接開いても辿れるように。
  例外は `404.html`：GitHub Pages がどの階層の URL にも返すので、`/` から始まる絶対パスで書く。
- `CNAME`（`hitoma.works`）と `.nojekyll` は消さない。

## ファイル構成
```
index.html                 ホーム（屋号・事業内容・アプリ一覧・連絡先）
privacy.html               サイト全体のプライバシーポリシー
404.html                   見つからないとき（絶対パス）
assets/site.css            スタイル 1 枚
assets/img/                画像
apps/<id>/index.html       アプリ紹介
apps/<id>/privacy.html     アプリのプライバシーポリシー（ストアに登録する URL）
apps/<id>/support.html     アプリのサポート（ストアに登録する URL）
apps/_template/            上の 3 枚のひな型（robots.txt で除外）
CNAME / .nojekyll / robots.txt
```

## アプリを 1 つ足す手順
1. `git pull`。
2. アプリの id を決める（英小文字とハイフン。例：`nagara-eitango`）。公開後は URL がストアに登録されるので変えない。
3. `apps/_template/` の `index.html`・`privacy.html`・`support.html` の 3 枚を `apps/<id>/` に写す。
4. 3 枚の `【】` を全部埋め、先頭のひな型用のコメントを消す。プライバシーポリシーはアプリの実際の挙動（集める情報・通信・解析・広告）と一つずつ突き合わせ、ストアの申告（データセーフティ／App のプライバシー）と揃える。
5. `index.html`（ホーム）の「アプリ」の一覧に `<li>` を 1 つ足す（既存の行を写して直す）。
6. `privacy.html`（サイト全体）の「アプリごとのプライバシーポリシー」に 1 行足す。
7. リンク切れが無いかを確かめる（相対リンクがすべて実在のファイルを指しているか）。
8. コミットしてすぐ push。

## 仮置き（公開前に直す）
- 連絡先 `info@hitoma.works` は仮。メールが受け取れる状態になったら確かめる。
- ストアのリンクは `#`、バッジは文字の仮置き。公開したら公式のバッジ画像（Google Play・Apple の配布物、各社のガイドラインに従う）を `assets/img/` に置いて差し替える。
- スクリーンショットは枠だけ。

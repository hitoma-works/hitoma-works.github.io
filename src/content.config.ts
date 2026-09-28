import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// アプリ 1 つ = src/content/apps/<slug>/ のフォルダ 1 つ。
//   index.md    紹介（frontmatter ＋ 本文は特長の箇条書き）
//   privacy.md  プライバシーポリシーの本文
//   support.md  サポート（よくある質問・問い合わせ）の本文
// <slug> がそのまま URL になる（/apps/<slug>/）。

const apps = defineCollection({
  loader: glob({
    base: './src/content/apps',
    pattern: '*/index.md',
    generateId: ({ entry }) => entry.split('/')[0]!,
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** 一言（カードと紹介ページの見出しの下） */
      tagline: z.string(),
      /** 説明（カードの本文と、紹介ページの meta description） */
      description: z.string(),
      platforms: z.array(z.enum(['Android', 'iOS'])).min(1),
      /** 空なら「準備中」のボタンになる */
      storeLinks: z
        .object({
          googlePlay: z.url().optional(),
          appStore: z.url().optional(),
        })
        .default({}),
      /** 画面の画像（src は md からの相対パス）。空なら枠だけ出す */
      screenshots: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      /** 対応 OS などの一文（ダウンロードの下に出す） */
      requirements: z.string().optional(),
      /** 商標の表記など（ページの下に小さく出す） */
      notice: z.string().optional(),
      privacyEstablished: z.coerce.date(),
      privacyUpdated: z.coerce.date(),
      /** 一覧の並び順（小さい順） */
      order: z.number().default(100),
    }),
});

const appDocs = defineCollection({
  loader: glob({
    base: './src/content/apps',
    pattern: '*/{privacy,support}.md',
  }),
  schema: z.object({
    /** meta description */
    description: z.string(),
  }),
});

export const collections = { apps, appDocs };

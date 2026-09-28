import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

export type App = CollectionEntry<'apps'>;

/** 並び順（order → 名前）で全アプリ */
export async function getApps(): Promise<App[]> {
  const apps = await getCollection('apps');
  return apps.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name, 'ja'));
}

/** privacy.md / support.md。無ければビルドを止める */
export async function getAppDoc(slug: string, kind: 'privacy' | 'support') {
  const doc = await getEntry('appDocs', `${slug}/${kind}`);
  if (!doc) throw new Error(`src/content/apps/${slug}/${kind}.md がありません`);
  return doc;
}

// アイコンは src/assets/apps/<slug>.png（.jpg/.webp も可）を置くだけで使われる。無ければ文字のアイコン。
const icons = import.meta.glob<{ default: ImageMetadata }>('/src/assets/apps/*.{png,jpg,jpeg,webp}', {
  eager: true,
});

export function getAppIcon(slug: string): ImageMetadata | undefined {
  const hit = Object.entries(icons).find(([path]) => path.replace(/^.*\/|\.[^.]+$/g, '') === slug);
  return hit?.[1].default;
}

export const appUrl = (slug: string) => `/apps/${slug}/`;
export const privacyUrl = (slug: string) => `/apps/${slug}/privacy/`;
export const supportUrl = (slug: string) => `/apps/${slug}/support/`;

/** 2026-09-28 → 2026年9月28日 */
export function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
}

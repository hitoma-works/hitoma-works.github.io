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

/** privacy.en.md / support.en.md（英語版）。無ければ undefined */
export async function getAppDocEn(slug: string, kind: 'privacy' | 'support') {
  return getEntry('appDocs', `${slug}/${kind}.en`);
}

/** 英語版のプライバシーポリシーとサポートが両方あるか（片方だけなら止める） */
export async function hasEnglishDocs(slug: string): Promise<boolean> {
  const [privacy, support] = await Promise.all([getAppDocEn(slug, 'privacy'), getAppDocEn(slug, 'support')]);
  if (!!privacy !== !!support) {
    throw new Error(`src/content/apps/${slug}/ の privacy.en.md と support.en.md は両方そろえてください`);
  }
  return !!privacy;
}

/** 英語版のあるアプリだけ（英語の名前 nameEn が無ければビルドを止める） */
export async function getAppsWithEnglishDocs(): Promise<App[]> {
  const apps = await getApps();
  const hits: App[] = [];
  for (const app of apps) {
    if (!(await hasEnglishDocs(app.id))) continue;
    if (!app.data.nameEn) throw new Error(`src/content/apps/${app.id}/index.md に nameEn（英語のアプリ名）がありません`);
    hits.push(app);
  }
  return hits;
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
export const privacyEnUrl = (slug: string) => `/apps/${slug}/en/privacy/`;
export const supportEnUrl = (slug: string) => `/apps/${slug}/en/support/`;

/** 2026-09-28 → 2026年9月28日 */
export function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
}

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** 2026-10-16 → October 16, 2026（英語版のページ） */
export function formatDateEn(d: Date): string {
  return `${MONTHS_EN[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

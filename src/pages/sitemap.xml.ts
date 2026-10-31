import type { APIRoute } from 'astro';
import { appUrl, getApps, getAppsWithEnglishDocs, privacyEnUrl, privacyUrl, supportEnUrl, supportUrl } from '../lib/apps';

// サイトマップ（Search Console に登録する。robots.txt にも書いてある）。
// 載せるのは noindex でないページだけ＝トップ・プライバシー・各アプリの 3 ページ（英語版があればその 2 ページも）。
export const GET: APIRoute = async ({ site }) => {
  const apps = await getApps();
  const appsEn = await getAppsWithEnglishDocs();
  const paths = [
    '/',
    '/privacy/',
    ...apps.flatMap((app) => [appUrl(app.id), privacyUrl(app.id), supportUrl(app.id)]),
    ...appsEn.flatMap((app) => [privacyEnUrl(app.id), supportEnUrl(app.id)]),
  ];
  const urls = paths
    .map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

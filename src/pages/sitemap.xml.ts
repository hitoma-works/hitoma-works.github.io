import type { APIRoute } from 'astro';
import { appUrl, getApps, privacyUrl, supportUrl } from '../lib/apps';

// サイトマップ（Search Console に登録する。robots.txt にも書いてある）。
// 載せるのは noindex でないページだけ＝トップ・プライバシー・各アプリの 3 ページ。
export const GET: APIRoute = async ({ site }) => {
  const apps = await getApps();
  const paths = [
    '/',
    '/privacy/',
    ...apps.flatMap((app) => [appUrl(app.id), privacyUrl(app.id), supportUrl(app.id)]),
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

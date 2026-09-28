// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://hitoma.works',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // 外部への通信・読み込みはしない（解析・CDN・埋め込み無し）
  devToolbar: { enabled: false },
});

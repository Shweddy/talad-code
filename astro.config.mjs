import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  // เปลี่ยนเป็นโดเมนจริงของคุณ
  site: 'https://taladcode.dev',

  trailingSlash: 'never',

  build: {
    inlineStylesheets: 'auto',
  },

  adapter: cloudflare()
});
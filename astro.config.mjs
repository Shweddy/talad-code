import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://taladcode.dev', // เปลี่ยนเป็นโดเมนจริงของคุณ
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
});

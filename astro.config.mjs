import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://elviajeseguro.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { smartypants: false },
});

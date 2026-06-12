// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://hyemin.pages.dev',
  output: 'server',
  adapter: cloudflare(),
  vite: {
    server: {
      watch: {
        usePolling: true
      }
    }
  }
});
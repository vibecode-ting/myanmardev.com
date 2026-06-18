// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [
    react(),
  ],
  output: 'static',
  site: 'https://myanmardev.com',
  base: '/myanmardev.com/',
  vite: {
    css: {
      postcss: './postcss.config.mjs',
    },
  },
});

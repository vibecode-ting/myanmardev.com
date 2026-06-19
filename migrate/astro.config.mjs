// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
  ],
  output: 'static',
  site: 'https://myanmardev.com',
  base: '/personal_project_for_ch-3/',
  vite: {
    css: {
      postcss: './postcss.config.mjs',
    },
  },

});

// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://beauty-wellness-oase.ch',
  integrations: [
    vue({
      devtools: true,
    }),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
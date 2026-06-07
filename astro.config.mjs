import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dream-ai-lab.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
});

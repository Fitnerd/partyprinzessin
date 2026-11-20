// @ts-check
import { defineConfig } from 'astro/config';

// TODO: echte Domain eintragen, sobald registriert.
export default defineConfig({
  site: 'https://www.partyprinzessin.de',
  trailingSlash: 'never',
  build: { format: 'file' },
});

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import node from "@astrojs/node";

export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: vercel({
    analytics: true,
  }),
});
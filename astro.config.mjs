// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://devpins.org',
	integrations: [mdx(), sitemap()],
	redirects: {
		'/about': '/',
	},
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: 'IBM Plex Serif',
			cssVariable: '--font-plex-serif',
			weights: [400],
			styles: ['normal'],
			fallbacks: ['serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'IBM Plex Sans',
			cssVariable: '--font-plex-sans',
			weights: [400, 500],
			styles: ['normal'],
			fallbacks: ['sans-serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'IBM Plex Mono',
			cssVariable: '--font-plex-mono',
			weights: [400, 500],
			styles: ['normal'],
			fallbacks: ['monospace'],
		},
	],
});

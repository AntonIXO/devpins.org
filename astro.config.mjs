// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://devpins.org',
	integrations: [mdx(), sitemap()],
	redirects: {
		'/about': '/cv',
	},
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: 'Geist',
			cssVariable: '--font-geist',
			weights: ['400 700'],
			styles: ['normal'],
			fallbacks: ['sans-serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'Geist Mono',
			cssVariable: '--font-geist-mono',
			weights: ['400 500'],
			styles: ['normal'],
			fallbacks: ['monospace'],
		},
	],
});

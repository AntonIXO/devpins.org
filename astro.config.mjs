// @ts-check

import { copyFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

/** @type {import('astro').AstroIntegration} */
const sitemapXmlAlias = {
	name: 'sitemap-xml-alias',
	hooks: {
		'astro:build:done': async ({ dir, logger }) => {
			const src = new URL('sitemap-0.xml', dir);
			try {
				await access(src);
			} catch {
				logger.warn('sitemap-0.xml missing; skip /sitemap.xml alias');
				return;
			}
			await copyFile(src, new URL('sitemap.xml', dir));
			logger.info(`wrote ${fileURLToPath(new URL('sitemap.xml', dir))}`);
		},
	},
};

// https://astro.build/config
export default defineConfig({
	site: 'https://devpins.org',
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => {
				const { pathname } = new URL(page);
				return pathname !== '/about' && pathname !== '/about/' && !pathname.startsWith('/api/');
			},
			serialize(item) {
				const { pathname } = new URL(item.url);
				if (pathname === '/') {
					item.changefreq = 'weekly';
					item.priority = 1;
				} else if (pathname === '/blog/') {
					item.changefreq = 'weekly';
					item.priority = 0.8;
				} else if (pathname.startsWith('/blog/')) {
					item.changefreq = 'monthly';
					item.priority = 0.7;
				} else if (pathname === '/cv/') {
					item.changefreq = 'monthly';
					item.priority = 0.6;
				}
				return item;
			},
		}),
		sitemapXmlAlias,
	],
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

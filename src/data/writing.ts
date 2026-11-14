import type { CollectionEntry } from 'astro:content';
import { getPublishedPosts } from './nav';

export type WritingPost = {
	id: string;
	data: Pick<CollectionEntry<'blog'>['data'], 'title' | 'pubDate' | 'language'>;
	href?: string;
	publication?: string;
};

// Listing metadata only: external articles must not generate local routes,
// alternate-language links, RSS entries or sitemap URLs.
const externalPosts: WritingPost[] = [
	{
		id: 'whoop-vs-fitbit',
		data: {
			title: 'WHOOP vs Fitbit: Real-World Data (N=97)',
			pubDate: new Date('2026-10-25'),
			language: 'en',
		},
		href: 'https://optihealth.devpins.org/blog/whoop-vs-fitbit',
		publication: 'optiHealth',
	},
];

export async function getWritingPosts(): Promise<WritingPost[]> {
	return [...await getPublishedPosts(), ...externalPosts].sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}

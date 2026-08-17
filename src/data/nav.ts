import { getCollection } from 'astro:content';
import type { ProjectKey } from './projects';

export interface NavRow {
	n: string;
	title: string;
	tag: string;
	date: string;
	k: ProjectKey | 'note';
	href: string;
}

const projectLabel: Record<ProjectKey, string> = {
	oh: 'optiHealth',
	mb: 'MineBit',
	k: 'K',
};

export async function getPublishedPosts() {
	return (await getCollection('blog', ({ data }) => data.draft !== true)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}

export async function getNavRows(): Promise<NavRow[]> {
	const posts = await getPublishedPosts();

	return posts.map((post, index) => ({
		n: String(index + 1).padStart(2, '0'),
		title: post.data.title,
		tag: post.data.project ? projectLabel[post.data.project] : 'Note',
		date: post.data.pubDate.toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'short',
		}),
		k: post.data.project ?? 'note',
		href: `/blog/${post.id}/`,
	}));
}

import { getCollection } from 'astro:content';
import { projects, type ProjectKey } from './projects';

export interface NavRow {
	n: string;
	title: string;
	tag: string;
	date: string;
	k: ProjectKey;
	href: string;
}

const projectToKey: Record<string, ProjectKey> = {
	oh: 'oh',
	mb: 'mb',
	k: 'k',
};

export async function getNavRows(): Promise<NavRow[]> {
	const posts = (
		await getCollection('blog', ({ data }) => data.draft !== true)
	).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	const projectRows: NavRow[] = projects.map((project) => ({
		n: project.n,
		title: project.title,
		tag: project.tag,
		date: project.date,
		k: project.k,
		href: project.href,
	}));

	const postRows: NavRow[] = posts
		.filter((post) => post.data.project)
		.map((post, index) => ({
			n: String(projectRows.length + index + 1).padStart(2, '0'),
			title: post.data.title,
			tag: post.data.project === 'oh' ? 'optiHealth' : post.data.project === 'mb' ? 'MineBit' : 'K',
			date: post.data.pubDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' }),
			k: projectToKey[post.data.project ?? 'k'],
			href: `/blog/${post.id}/`,
		}));

	return [...projectRows, ...postRows];
}

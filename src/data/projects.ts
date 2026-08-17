export type ProjectKey = 'oh' | 'mb' | 'k';

export interface ProjectEntry {
	id: string;
	n: string;
	title: string;
	tag: string;
	date: string;
	k: ProjectKey;
	href: string;
	summary?: string;
	period?: string;
	featured?: boolean;
}

export const projects: ProjectEntry[] = [
	{
		id: 'optihealth',
		n: '01',
		title: 'optiHealth — demo account',
		tag: 'optiHealth',
		date: 'live',
		k: 'oh',
		href: 'https://optihealth.devpins.org/demo',
		summary:
			'Continuous sleep, EEG, HR and HRV in one personal database — six months of history syncs in twenty seconds.',
		period: '2025 — present',
		featured: true,
	},
	{
		id: 'slm',
		n: '02',
		title: 'Sensor Language Models — research in progress',
		tag: 'optiHealth',
		date: '2026',
		k: 'oh',
		href: 'https://scholar.google.com/citations?user=hOxcaCcAAAAJ&hl=ru',
	},
	{
		id: 'minebit',
		n: '03',
		title: 'MineBit — voxel builds as NFTs on TON',
		tag: 'MineBit',
		date: '2024',
		k: 'mb',
		href: 'https://t.me/MineBitServer_bot/MineBit?startapp=EQBvVYfI8q5yNnzD4xxLMatNFcKMWHEX_F7oubxxe7mfs_F9',
		summary:
			'Voxel builds minted as NFTs on TON — custom Minestom server, Go bridge, FunC contracts, Telegram web app.',
		period: '2024 · The Open League',
		featured: true,
	},
	{
		id: 'aireader',
		n: '04',
		title: 'AI Reader — LLMs inside the reading flow',
		tag: 'K',
		date: '2025',
		k: 'k',
		href: 'https://devpost.com/software/konspecterai',
	},
	{
		id: 'sailfish',
		n: '05',
		title: 'SailfishOS on a Xiaomi ARM phone',
		tag: 'K',
		date: '2021—25',
		k: 'k',
		href: 'https://github.com/SailfishOS-miatoll',
		summary:
			'A full GNU/Linux system on ARM Android hardware via libhybris. 2,000+ downloads, a 200-user community.',
		period: '2021 — 2025',
		featured: true,
	},
];

export const featuredWork = projects.filter((project) => project.featured);

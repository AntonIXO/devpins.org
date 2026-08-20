export interface CvLink {
	label: string;
	href: string;
}

export interface CvEducation {
	title: string;
	period: string;
	meta?: string;
	metaHref?: string;
	bullets?: string[];
}

export interface CvProject {
	title: string;
	href?: string;
	period: string;
	lede: string;
	bullets: string[];
}

export interface CvAward {
	mark: string;
	text: string;
	note?: string;
}

export interface CvSkillGroup {
	label: string;
	items: string[];
}

export const cvIntro =
	'Applied maths and AI student building health-data infrastructure — from ARM kernel ports to vector embeddings of my own biometrics.';

export const cvLinks: CvLink[] = [
	{ label: 'antonix@devpins.org', href: 'mailto:antonix@devpins.org' },
	{ label: 'X · @9Rasp', href: 'https://x.com/9Rasp' },
	{ label: 'GitHub · AntonIXO', href: 'https://github.com/AntonIXO' },
	{ label: 'Telegram · AntonlX', href: 'https://t.me/AntonlX' },
];

export const education: CvEducation[] = [
	{
		title: 'ITMO University — BSc, Applied Mathematics and Informatics',
		period: 'Sept 2025 – June 2029',
		meta: 'AI360 Program · St. Petersburg, Russia',
		metaHref: 'https://360-ai.ru/',
		bullets: [
			'Elite AI & maths track built to grow fundamental AI researchers.',
			'Mathematical analysis, linear algebra, discrete maths, probability theory, algorithms.',
		],
	},
	{
		title: 'Y Combinator — Online Startup School',
		period: 'Course',
	},
];

export const cvProjects: CvProject[] = [
	{
		title: 'Sensor Language Models (SLM) research',
		period: 'Jan 2026 – present',
		lede: 'In progress: reimplementing Sensor Language Models on a custom biometric dataset for mental-state detection.',
		bullets: [
			'Using the optiHealth platform infrastructure for continuous physiological data collection.',
			'Research in collaboration with Yuri Rykov (scholar profile).',
		],
	},
	{
		title: 'optiHealth — personal N-of-1 biohacking platform',
		href: 'https://optihealth.devpins.org/demo',
		period: 'July 2025 – present',
		lede: 'Full-stack data collection and analytics system tracking continuous health metrics (sleep, EEG, HR, HRV) to evaluate nootropic and training effects.',
		bullets: [
			'Sync engine on Health Connect and Supabase Edge Functions with Zstandard compression — six months of HR, steps and sleep data in 20 seconds.',
			'Automated analysis engine over the stored data in Python.',
			'Next.js site for visualisation with interactive charts.',
			'Currently building an “everything is a vector” paradigm: daily embeddings of user data for deeper, less biased insight.',
		],
	},
	{
		title: 'Dream Walker — LLM-driven retro dream thriller',
		href: 'https://dreamwalker.devpins.org',
		period: 'Feb 2026 – present',
		lede: 'Interactive retro pixel-art dream mystery powered by autonomous LLM reasoning agents.',
		bullets: [
			'Custom PixiJS engine with dynamic tilemaps, shaders, and real-time state manipulation.',
			'Self-contained agent runtime using Gemini 3.7 reasoning models for contextual NPC dialogue and world reactions.',
		],
	},
	{
		title: 'AI Reader PWA',
		href: 'https://devpost.com/software/konspecterai',
		period: 'Oct 2024 – Jan 2025',
		lede: 'Open-source progressive web app that folds LLMs into the reading flow.',
		bullets: [
			'RAG-based book search and automated quiz generation with the Vercel AI SDK and Supabase Edge Functions.',
			'Built during the ChromeOS × Sirius Education Center hackathon.',
		],
	},
	{
		title: 'MineBit — NFT marketplace for Minecraft builds (TON)',
		href: 'https://t.me/MineBitServer_bot/MineBit?startapp=EQBvVYfI8q5yNnzD4xxLMatNFcKMWHEX_F7oubxxe7mfs_F9',
		period: 'May 2024 – July 2024',
		lede: 'Decentralised marketplace letting creators mint and sell voxel builds as NFTs.',
		bullets: [
			'Reimplemented custom server logic with Minestom and Kotlin, replacing the official Microsoft codebase.',
			'Go helper microservice for blockchain and FunC smart-contract integration.',
			'Telegram bot using Web-App technology so users view their 3D builds on-device.',
			'Highlighted at The Open League Hackathon.',
		],
	},
	{
		title: 'Low-level system engineering — Linux on mobile',
		href: 'https://github.com/SailfishOS-miatoll',
		period: 'Oct 2021 – May 2025',
		lede: 'Ported a complete GNU/Linux (SailfishOS) system to an ARM Android smartphone.',
		bullets: [
			'Adapted proprietary Binder-based Android drivers to glibc through libhybris — every subsystem functional.',
			'Over 2,000 downloads and a 200+ user community.',
		],
	},
];

export const awards: CvAward[] = [
	{
		mark: 'Winner',
		text: 'HSE University CS Research Project Competition, with the Linux port',
		note: 'full BSc scholarship',
	},
	{
		mark: 'Top 5%',
		text: 'National prizewinner, Tier 1 “Vysshaya Proba” and Tier 2 “Technocup” informatics olympiads',
		note: 'full BSc scholarship',
	},
	{
		mark: 'Winner',
		text: 'National project competitions: Big Challenges, Higher Pilot, Step into the Future',
	},
	{
		mark: '1st place',
		text: 'MEPhI Nuclear Hack · Central University Hackathon · OctusBridge deployment hackathon (Everscale)',
	},
];

export const skills: CvSkillGroup[] = [
	{
		label: 'Languages',
		items: ['Python', 'C++', 'Go', 'Kotlin', 'TypeScript', 'Java', 'FunC', 'Bash'],
	},
	{
		label: 'Technologies',
		items: ['Linux', 'Low-level Android OS', 'LLM applications', 'Prompt engineering', 'RAG'],
	},
	{
		label: 'Domains',
		items: ['Biohacking & health analytics', 'Tech startups', 'Blockchain', 'Smart contracts'],
	},
	{
		label: 'Sport',
		items: ['Marathon training', 'Rock climbing'],
	},
];

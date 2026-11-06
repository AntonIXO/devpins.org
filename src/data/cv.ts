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
	id: string;
	team?: string;
	title: string;
	href?: string;
	period: string;
	lede: string;
	bullets: string[];
}

export interface CvMiscProject {
	id: string;
	title: string;
	href: string;
	lede: string;
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

export const cvInterests =
	'Audiophilia · modern art · biohacking · half-marathons · real rock climbing · mycology · cyberpunk.';

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
		id: 'sensorlm',
		title: 'Sensor Language Models (SLM) research',
		period: 'Jan 2026 – present',
		lede: 'In progress: reimplementing Sensor Language Models on a custom biometric dataset for mental-state detection.',
		bullets: [
			'Using the optiHealth platform infrastructure for continuous physiological data collection.',
			'Research in collaboration with Yuri Rykov (scholar profile).',
		],
		team: "much honors to my team, here they are: claude, gpt, xiomi mimo, gemini"
	},
	{
		id: 'player',
		title: 'Player — bit-perfect music player in Rust',
		href: 'https://github.com/AntonIXO/player',
		period: 'May 2026 – present',
		lede: 'Hi-fi music player for Linux and postmarketOS that writes lossless audio directly to ALSA hardware without resampling, mixing, dither, or software volume.',
		bullets: [
			'Rust workspace with a headless playback engine, gapless queues, DSD/DoP support, library search, and a GTK shell.',
			'Target hardware is a Poco F1 running postmarketOS with a Chord Mojo 2 USB DAC.',
		],
	},
	{
		id: 'optihealth',
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
		id: 'dreamwalker',
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
		id: 'aireader',
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
		id: 'minebit',
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
		id: 'sailfish',
		title: 'Low-level system engineering — Linux on mobile',
		href: 'https://github.com/SailfishOS-miatoll',
		period: 'Oct 2021 – May 2025',
		lede: 'Ported a complete GNU/Linux (SailfishOS) system to an ARM Android smartphone.',
		bullets: [
			'Adapted proprietary Binder-based Android drivers to glibc through libhybris — every subsystem functional.',
			'Over 2,000 downloads and a 200+ user community.',
			'With this project I won multiple national competitions'
		],
	},
	{
		id: 'firmware',
		title: 'Development of custom firmware for Android devices',
		href: 'https://www.youtube.com/watch?v=YW6hTkQDYFQ&t=1s&pp=0gcJCSkMAYcqIYzv',
		period: 'Jan 2021 – May 2021',
		lede: 'Worked on improving stock features of my phone and hifi player to make it work faster and sound better.',
		bullets: [
			'Participated in community of 4pda. https://4pda.to/forum/index.php?showuser=5432820# over 500 posts and 100 repo.',
			'',
		],
	},
];

export const miscVibecode: CvMiscProject[] = [
	{
		id: 'matan2',
		title: 'matan2 — mathematical analysis exam notes',
		href: 'https://github.com/AntonIXO/matan2',
		lede: 'Typst study guide that extracts theorem proofs from lecture subtitles and links the mathematical-analysis syllabus into one navigable chain.',
	},
	{
		id: 'deep-sleep-cube-app',
		title: 'Deep Sleep Cube app',
		href: 'https://github.com/AntonIXO/Deep-Sleep-Cube-app',
		lede: 'Open-source Android alternative to the Deep Sleep Cube app.',
	},
	{
		id: 'vibescience-mcp',
		title: 'vibescience-mcp',
		href: 'https://github.com/AntonIXO/vibescience-mcp',
		lede: 'Scientific experiment-log MCP server for AI coding and research agents, with Markdown as the source of truth and a queryable causal map.',
	},
	{
		id: 'iherb-api',
		title: 'iherb-api',
		href: 'https://github.com/AntonIXO/iherb-api',
		lede: 'Typed, unofficial iHerb product search and supplement-label extraction package for Bun and Node.js.',
	},
	{
		id: 'unblock',
		title: 'unblock',
		href: 'https://github.com/AntonIXO/unblock',
		lede: 'Fabric mod that lets Minecraft connect to servers banned by Mojang.',
	},
	{
		id: 'exist-activitywatch',
		title: 'exist-activitywatch',
		href: 'https://github.com/AntonIXO/exist-activitywatch',
		lede: 'Python sync service that pushes ActivityWatch metrics and focus analysis to Exist.io.',
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

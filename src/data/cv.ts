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
	preview?: 'vibescience';
	video?: {
		src: string;
		webm: string;
		poster: string;
		label: string;
	};
}

export interface CvMiscProject {
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
	'CS student obsessed with health optimization and analysis. Having fun building cool projects.';

export const cvProjectsNote = 'All projects listed here were completed independently.';

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
		meta: 'Computer Science Program · St. Petersburg, Russia',
		bullets: [
			'Foundational track built to grow elite engineers.',
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
		title: 'optiHealth — personal N-of-1 biohacking platform',
		href: 'https://optihealth.devpins.org/',
		period: 'July 2025 – present',
		lede: 'A single place to bring together all my health data (vitals, sleep, training, tags, supplements, location, and more) and search it for insights.',
		bullets: [
			'Web app, Android app, scalable database, and analysis-engine architecture.',
			'Classical statistical analysis engine using Spearman correlation and BH-FDR.',
			'Some interesting findings: my mood follows an hourly curve, and each later hour of bedtime costs 5 minutes of deep sleep (despite total sleep length);',
			'Polygala, GABA, and NAC ↔ Oura sleep score.',
			'Multivitamins ↔ HRV.',
			'<a href="https://optihealth.devpins.org/i/euWHqwAeaHymU5DfG9ELng" target="_blank" rel="noopener noreferrer" data-umami-event="cv-insight-click" data-umami-event-insight="cerebrolysin-sleep-1">Cerebrolysin ↔ Sleep</a> · <a href="https://optihealth.devpins.org/i/tPmuyOxOgCdT5OVwkYMBgw" target="_blank" rel="noopener noreferrer" data-umami-event="cv-insight-click" data-umami-event-insight="cerebrolysin-sleep-2">Cerebrolysin ↔ RHR</a>.',
		],
	},
	{
		title: 'BHWiki — PubMed literature review and drug-interaction graph',
		href: 'https://bhwiki.devpins.org/',
		period: 'September 2026 – present',
		lede: 'A source-linked scientific knowledge base that turns PubMed literature into a structured wiki of substances, mechanisms, effects, and documented interactions.',
		bullets: [
			'PubMed literature-review server discovers papers, matches them to the canonical substance corpus, and produces auditable suggestions for human review before publication.',
			'Role-bearing relationships and Cytoscape.js graph views connect drugs and other substances to biological mechanisms, outcomes, and evidence sources without inventing unsupported interactions.',
			'OptiHealth integration maps canonical substance identities and leaves a privacy-preserving boundary for curated aggregates; raw personal health rows and outcomes are not published into the wiki.',
			'Links: <a href="https://bhwiki.devpins.org/" target="_blank" rel="noopener noreferrer" data-umami-event="cv-project-link" data-umami-event-project="bhwiki-site">live wiki</a> · <a href="https://github.com/AntonIXO/BHWiki" target="_blank" rel="noopener noreferrer" data-umami-event="cv-project-link" data-umami-event-project="bhwiki-repository">source repository</a>.',
		],
	},
	{
		title: 'Sensor Language Models (SLM) research',
		period: 'March 2026 – present',
		lede: 'Implementing SLMs — LLMs capable of understanding time-series data from wearables.',
		preview: 'vibescience',
		bullets: [
			'Using the optiHealth platform infrastructure for continuous physiological data collection.',
			'Research in collaboration with Yuri Rykov (scholar profile).',
			'Applied autoresearch with <a href="/vibescience/" data-umami-event="cv-vibescience-click">vibescience</a> <- graph.',
		],
	},
	{
		title: 'LightSem — audio-to-stage-lighting fun',
		href: 'https://github.com/AntonIXO/lightsem',
		period: 'Sept 2026 – present',
		lede: 'I don\'t like stage lighting, especially algorithmic lighting, so I tried to build one learned from dancing.',
		bullets: [
			'Pulled all the Just Dance from YouTube, extracted the motions, and wired up <a href="https://github.com/tencent-ailab/muq" target="_blank" rel="noopener noreferrer">MuQ</a> alongside other features.',
			'Though it did not work well and collapsed. I\'ll fix it in my free time.',
		],
	},
	{
		title: 'Player — bit-perfect music player in Rust',
		href: 'https://github.com/AntonIXO/player',
		period: 'May 2026 – June 2026',
		lede: 'High-end music player for postmarketOS on a Poco F1 running a mainline Linux kernel.',
		bullets: [
			'Writes audio bits directly to the kernel, shortest path 🙏. Inspired by <a href="https://github.com/sam0402/ArchQ" target="_blank" rel="noopener noreferrer">ArchQ</a>.',
			'Target hardware: a Poco F1 running postmarketOS with a mainline Linux kernel and a Chord Mojo 2.',
			'Inner audiophile is finally happy.',
		],
	},
	{
		title: 'Dream Walker — LLM-driven retro dream thriller',
		href: 'https://dreamwalker.devpins.org',
		period: 'June 2026 – Sep 2026',
		lede: 'Anton Dream Simulator powered by AI NPC agents.',
		bullets: [
			'Custom PixiJS engine with dynamic tilemaps, shaders, and real-time state manipulation.',
			'Self-contained agent runtime for contextual NPC dialogue and world reactions.',
			'Using jev for NPC decisions.',
		],
	},
	{
		title: 'AI Reader PWA',
		href: 'https://devpost.com/software/konspecterai',
		period: 'Oct 2024 – Jan 2025',
		lede: 'Open-source progressive web app that folds LLMs into the reading flow.',
		bullets: [
			'RAG-based book search and automated quiz generation with the Vercel AI SDK and Supabase Edge Functions.',
			'Built during the ChromeAI and Sirius education center hackathon.',
		],
	},
	{
		title: 'MineBit — NFT marketplace for Minecraft builds',
		href: 'https://t.me/MineBitServer_bot/MineBit?startapp=EQBvVYfI8q5yNnzD4xxLMatNFcKMWHEX_F7oubxxe7mfs_F9',
		period: 'May 2024 – August 2024',
		lede: 'Marketplace letting creators mint and sell builds as NFTs.',
		bullets: [
			'Implemented custom server logic with Minestom and Kotlin, replacing the official Microsoft codebase.',
			'Go microservice for blockchain integration.',
			'Telegram bot with Next.js to show 3D builds in a mini app.',
			'Highlighted at The Open League Hackathon. Received very good feedback from the crypto community.',
			'NFTs in Minecraft were banned by Mojang, so development stopped.',
			'Hand-coded during the pre-AI era 😮‍💨.',
		],
	},
	{
		title: 'Low-level system engineering — Linux on mobile',
		href: 'https://github.com/SailfishOS-miatoll',
		period: 'Oct 2021 – May 2025',
		lede: 'Ported a complete GNU/Linux (SailfishOS) system to an ARM Android smartphone.',
		bullets: [
			'Adapted proprietary Android HAL drivers to glibc through libhybris — every subsystem functional.',
			'Over 2,000 downloads and a 200+ user community on <a href="https://t.me/Sailfish_miatoll" target="_blank" rel="noopener noreferrer">Telegram</a>.',
		],
	},
	{
		title: 'Android hacking',
		href: 'https://www.youtube.com/watch?v=YW6hTkQDYFQ&t=1s&pp=0gcJCSkMAYcqIYzv',
		period: 'Jan 2021 – May 2021',
		lede: 'Improved my phone\'s and hi-fi player\'s features with custom firmware and Magisk modules to make them run faster and sound better.',
		bullets: [
			'<a href="https://4pda.to/forum/index.php?showuser=5432820#" target="_blank" rel="noopener noreferrer" data-umami-event="cv-4pda-click">Participated in the 4pda community — over 500 posts and 100 repositories.</a>',
		],
	},
];

export const miscVibeProjects: CvMiscProject[] = [
	{
		title: 'math.devpins.org — mathematical analysis notes',
		href: 'https://math.devpins.org',
		lede: 'A compact, navigable home for mathematical-analysis notes, proofs, and exam preparation.',
	},
	{
		title: 'Deep sleep cube  (Schumann-wave machine) app',
		href: 'https://github.com/AntonIXO/Deep-Sleep-Cube-app',
		lede: 'The official one was broken, so I vibed my own.',
	},
	{
		title: 'vibescience-mcp',
		href: 'https://github.com/AntonIXO/vibescience-mcp',
		lede: 'Scientific experiment-log MCP server for agents. with Markdown as the source of truth and a obsidian compatible vault.',
	},
	{
		title: 'iherb-api',
		href: 'https://github.com/AntonIXO/iherb-api',
		lede: 'iHerb product search used in optiHealth.',
	},
	{
		title: 'unblock',
		href: 'https://github.com/AntonIXO/unblock',
		lede: 'Minecraft mod that lets users connect to blocked servers.',
	},
	{
		title: 'exist-activitywatch',
		href: 'https://github.com/AntonIXO/exist-activitywatch',
		lede: 'Python service that pushes ActivityWatch data to Exist.io.',
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

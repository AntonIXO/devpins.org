import itmoLogo from '../assets/cv/itmo-logo.png';

export interface CvLink {
	label: string;
	href: string;
}

export interface CvEducation {
	title: string;
	period: string;
	institution?: { logo: ImageMetadata; logoAlt: string; suffix: string; href: string };
	meta?: string;
	metaHref?: string;
	bullets?: string[];
}

export interface CvProject {
	title: string;
	href?: string;
	period?: string;
	lede: string;
	bullets?: string[];
	insights?: (CvLink & { trackingId?: string; note?: string })[];
	preview?: 'vibescience';
	diagram?: string[];
	videoEmbed?: string;
	image?: { src: string; alt: string; href?: string };
	screenshots?: { src: string; alt: string; width: number; height: number }[];
	video?: {
		src: string;
		webm?: string;
		poster: string;
		label: string;
		note?: string;
		captions?: {
			src: string;
			lang: string;
			label: string;
			kind: 'captions' | 'subtitles';
			default?: boolean;
		}[];
	};
}

export interface CvAward {
	mark: string;
	parts: (string | {
		label: string;
		href?: string;
		diploma?: string;
	})[];
	note?: string;
}

export interface CvSkillGroup {
	label: string;
	items: string[];
}

export const cvIntro =
	'CS student obsessed with health optimization to increase throughput for one goal: having fun building cool projects.';

export const cvProjectsNote = 'All projects listed here were completed independently.';

export const cvLinks: CvLink[] = [
	{ label: 'antonix@devpins.org', href: 'mailto:antonix@devpins.org' },
	{ label: 'X · @9Rasp', href: 'https://x.com/9Rasp' },
	{ label: 'GitHub · AntonIXO', href: 'https://github.com/AntonIXO' },
	{ label: 'Telegram · AntonlX', href: 'https://t.me/AntonlX' },
];

export const education: CvEducation[] = [
	{
		title: 'BSc, Applied Mathematics and Informatics',
		period: 'Sept 2025 – June 2029',
		// Alexey Minaev, CC BY 4.0. Cropped transparent margins and resized.
		// https://commons.wikimedia.org/wiki/File:ITMO_University_logo.png
		// https://creativecommons.org/licenses/by/4.0/
		institution: {
			logo: itmoLogo,
			logoAlt: 'ITMO',
			suffix: 'University',
			href: 'https://www.google.com/search?q=ITMO+University+CT',
		},
		meta: 'Computer Science · St. Petersburg, Russia',
		bullets: [
			'Foundational track to grow exceptional engineers.',
			'Mathematical analysis, linear algebra, discrete math, probability theory, algorithms...',
		],
	}
];

export const cvProjects: CvProject[] = [
	{
		title: 'optiHealth — personal N-of-1 biohacking platform',
		href: 'https://optihealth.devpins.org/',
		period: 'July 2025 – present',
		lede: 'Ultimate platform to search for insight in your health data.',
		bullets: [
			'Sync data from wearables to an OrioleDB database.',
			'Add supplements, tags, geo from Android and iOS apps.',
			'Running analysis with ~235 million permutations + BH-FDR to filter out noise.',
			'Considering usage in clinical trials.'
		],
		insights: [
			{
				label: 'Two-Per-Day Multivitamin ↔ HRV (RMSSD)',
				href: 'https://optihealth.devpins.org/i/S3Bn0dwACRCZLwajX7cYIg',
				trackingId: 'multivitamin-hrv',
			},
			{
				label: 'Polygala tenuifolia ↔ Oura sleep score',
				href: 'https://optihealth.devpins.org/i/JdlvzVz8bbxlYpJo8T2z0A',
				trackingId: 'polygala-oura-sleep-score',
				note: 'Stack effects could not be separated.',
			},
			{
				label: 'Strattera ↔ REM sleep',
				href: 'https://optihealth.devpins.org/i/k9nWlwdddKfEPzPF1qRf1A',
				trackingId: 'cerebrolysin-sleep-1',
			},
			{
				label: 'Lithium carbonate ↔ HRV',
				href: 'https://optihealth.devpins.org/i/BUD_d79zsr5SXmhUK89kWw',
				trackingId: 'cerebrolysin-sleep-2',
			},
			{
				label: 'WHOOP vs Fitbit: Real-World Data (N = 97)',
				href: 'https://optihealth.devpins.org/blog/whoop-vs-fitbit',
			},
		],
	},
	{
		title: 'Sensor Language Models (SLM) research',
		href: '/vibescience/',
		period: 'March 2026 – present',
		lede: 'Implementing SLMs - LLMs capable of understanding time-series data from wearables.\nWith open datasets, on my younger brother\'s RTX 5070',
		preview: 'vibescience',
		bullets: [
			'14041 days, 24 channels (Accelerometer, HR, HRV, sleep s, RR...).',
			'PatchTST -> TimeLLM CrossModalProjector -> LoRA on top of soft-tokens over MedGemma 1.5 4b.',
			'Currently exploring problem of LLM data extraction from soft tokens (attention head MAE: 0.8 bpm, LLM MAE: 3.8 bpm, Trivial MAE: 12 bpm)',
			'Using the optiHealth infrastructure for personal data collection.',
			'Starting ML in second semester was a "top-down learning": my advisor was Perplexity deep research, Gemini explained ML,',
			'Claude ran experiments: with <a href="/vibescience/" data-umami-event="cv-vibescience-click">vibescience</a> <- graph.',
			'While LLMs are good at running specific idea/paper verification, they struggle with past experience. <a href="https://github.com/AntonIXO/vibescience-mcp" target="_blank" rel="noopener noreferrer">vibescience-mcp</a> is an attempt to fix that.',
		],
	},
	{
		title: 'Low-level system engineering — Linux on mobile',
		video: {
			src: '/projects/sailfish-demo.mp4',
			poster: '/projects/sailfish-demo.webp',
			label: 'Sailfish OS demo on the Redmi Note 9 Pro',
			note: 'old video (the only one I have). Issues mentioned were fixed.',
			captions: [
				{ src: '/projects/sailfish-demo.en.vtt', lang: 'en', label: 'English', kind: 'captions', default: true },
			],
		},
		href: 'https://github.com/SailfishOS-miatoll',
		period: 'Oct 2021 – May 2025',
		lede: 'Ported a complete GNU/Linux (SailfishOS) system to an ARM Android (Xiaomi Redmi Note 9 Pro) smartphone.',
		bullets: [
			'Adapted proprietary Android HAL drivers to glibc through libhybris — every subsystem functional. End-to-end.',
			'Over 2,000 downloads and a 200+ user community on <a href="https://t.me/Sailfish_miatoll" target="_blank" rel="noopener noreferrer">Telegram</a>.',
			'Occasionally entered this project in national competitions and won most of them ↓.'
		],
	},
	{
		title: 'MineBit — NFT marketplace for Minecraft builds',
		video: {
			src: '/projects/minebit-demo.mp4',
			poster: '/projects/minebit-demo.webp',
			label: 'MineBit pitch at The Open League Hackathon',
			captions: [
				{ src: '/projects/minebit-demo.en.vtt', lang: 'en', label: 'English', kind: 'subtitles', default: true },
				{ src: '/projects/minebit-demo.ru.vtt', lang: 'ru', label: 'Русский', kind: 'captions' },
			],
		},
		href: 'https://t.me/MineBitServer_bot/MineBit?startapp=EQBvVYfI8q5yNnzD4xxLMatNFcKMWHEX_F7oubxxe7mfs_F9',
		period: 'May 2024 – August 2024',
		lede: 'Letting creators sell their work as NFTs.',
		bullets: [
			'Implemented custom server logic with Minestom and Kotlin, replacing the official Microsoft codebase.',
			'microservice in Go for blockchain integration.',
			'Telegram bot with Next.js to show 3D builds in a mini app.',
			'Highlighted at The Open League Hackathon. Received very good feedback from the crypto community.'
		],
	},
	{
		title: 'BHWiki — open and modern BioHacking Wiki',
		image: {
			src: '/projects/bhwiki-graph.webp',
			alt: 'Explore the BHWiki knowledge graph',
			href: 'https://bhwiki.devpins.org/graph',
		},
		href: 'https://bhwiki.devpins.org/',
		period: 'October 2026 – present',
		lede: 'Turns medical publications into a graph of linked wiki pages.',
		bullets: [
			'Checks drug interactions by using a graph of mechanisms and targets.',
			'Linked to optiHealth outcomes and DB. Developing them in parallel.',
			'Open and available for contributions: <a href="https://bhwiki.devpins.org/" target="_blank" rel="noopener noreferrer" data-umami-event="cv-project-link" data-umami-event-project="bhwiki-site">live wiki</a> · <a href="https://github.com/AntonIXO/BHWiki" target="_blank" rel="noopener noreferrer" data-umami-event="cv-project-link" data-umami-event-project="bhwiki-repository">repository</a>.',
		],
	},
	{
		title: 'LightSem — audio-to-stage-lighting fun',
		video: {
			src: '/projects/lightsem-demo.mp4',
			webm: '/projects/lightsem-demo.webm',
			poster: '/projects/lightsem-demo.jpg',
			label: 'LightSem stage lighting demo',
			note: 'Though it didn’t work well and collapsed, I’ll fix it in my free time',
		},
		href: 'https://github.com/AntonIXO/lightsem',
		period: 'Sept 2026 – present',
		lede: 'I don\'t like stage lighting, so I tried to build a lighting system that learns from dance.',
		bullets: [
			'Pulled 70gb of the Just Dance from YouTube, extracted the motions, and wired up <a href="https://github.com/tencent-ailab/muq" target="_blank" rel="noopener noreferrer">MuQ</a> alongside other features.',
		],
	},
	{
		title: 'Player — bit-perfect music player in Rust',
		screenshots: [
			{ src: '/projects/player-library.webp', alt: 'Player music library', width: 640, height: 1330 },
			{ src: '/projects/player-now-playing.webp', alt: 'Now Playing screen with bit-perfect output indicator', width: 640, height: 1330 },
			{ src: '/projects/player-queue.webp', alt: 'Player playback queue', width: 640, height: 1330 },
		],
		href: 'https://github.com/AntonIXO/player',
		period: 'May 2026 – June 2026',
		lede: 'High-end music player for postmarketOS on a Poco F1 running a mainline Linux kernel.',
		bullets: [
			'Writes audio bits directly to the kernel, shortest path 🙏. Inspired by <a href="https://github.com/sam0402/ArchQ" target="_blank" rel="noopener noreferrer">ArchQ</a>.',
			'Target hardware: a Poco F1 running postmarketOS with a mainline Linux kernel and a Chord Mojo 2. LTO + PGO + BOLT optimized',
			'Inner audiophile is finally happy.',
		],
	},
	{
		title: 'KonspecterAI PWA',
		videoEmbed: 'https://www.youtube-nocookie.com/embed/EK9oM1SHyf4',
		href: 'https://devpost.com/software/konspecterai',
		period: 'Oct 2024 – Jan 2025',
		lede: 'Open-source progressive web app that folds LLMs into the reading flow.',
		bullets: [
			'Book chat with RAG, quiz generation. Using the Vercel AI SDK and Supabase Edge Functions.',
			'Built during the Google ChromeAI and Sirius education center hackathons.',
			'Mostly web education project.'
		],
	},
	{
		title: 'Android hacking',
		videoEmbed: 'https://www.youtube-nocookie.com/embed/YW6hTkQDYFQ',
		href: 'https://www.youtube.com/watch?v=YW6hTkQDYFQ',
		period: 'Jan 2021 – May 2021',
		lede: 'Improved my phone\'s and hi-fi player\'s features with custom firmware and Magisk modules to make them run faster and sound better.',
		bullets: [
			'<a href="https://4pda.to/forum/index.php?showuser=5432820#" target="_blank" rel="noopener noreferrer" data-umami-event="cv-4pda-click">Participated in the 4pda community — over 500 posts and 100 upvotes.</a>',
			'<a href="https://4pda.to/forum/index.php?showtopic=908413&amp;view=findpost&amp;p=103737943" target="_blank" rel="noopener noreferrer">Audio player firmware</a>',
			'<a href="https://4pda.to/forum/index.php?showtopic=931217&amp;view=findpost&amp;p=101878251" target="_blank" rel="noopener noreferrer">Phone mods</a>',
			'23k views on YouTube ->'
		],
	},
];

export const miscVibeProjects: CvProject[] = [
	{
		title: 'math.devpins.org — mathematical analysis notes',
		href: 'https://math.devpins.org',
		screenshots: [
			{ src: '/projects/math-proofs.webp', alt: 'Pages from the notes on Hölder’s and Minkowski’s inequalities', width: 1323, height: 1743 },
			{ src: '/projects/math-polar-area.webp', alt: 'Interactive visualization of area in polar coordinates', width: 2344, height: 1589 },
		],
		lede: 'Mathematical analysis resources for exam preparation.',
		bullets: ['Parsed lectures + hand fixes to 70 theorem proofs in PDF.',
			'Used by many peers on the course!'
		],
	},
	{
		title: 'Dream Walker — LLM-driven retro dream thriller',
		href: 'https://dreamwalker.devpins.org',
		image: {
			src: '/projects/dream-walker.webp',
			alt: 'Dream Walker gameplay showing a pixel-art house from above',
		},
		lede: 'Anton Dream Emulator powered by LLM and jev — world, npc, events...',
		bullets: [
			'Used to have many write-ups of my dreams. Decided to turn the most insane of them into a game',
			'Created a story, generated the assets...',
			'Agent-driven games aren’t here, yet.'

		]
	},
	{
		title: 'Deep sleep cube (Schumann-wave machine) app',
		href: 'https://github.com/AntonIXO/Deep-Sleep-Cube-app',
		lede: 'The official one was broken, so I vibed my own.',
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
		lede: 'Python service that pushes ActivityWatch data to <a href="https://exist.io" target="_blank" rel="noopener noreferrer">exist.io</a>.',
	},
	{
		title: 'Telegram graph',
		image: {
			src: '/projects/telegram-graph.webp',
			alt: 'Telegram groups and their participants visualized as a network in Obsidian',
		},
		href: 'https://github.com/AntonIXO/telegram-group-graph-obsidian',
		lede: 'Exports a graph of participants in your Telegram chats.',
		bullets: ['Visualizes shared group memberships in Obsidian.'],
	},
];

export const awards: CvAward[] = [
	{
		mark: 'Winner',
		parts: [
			{ label: 'HSE University CS Research Project Competition', diploma: 'hse-cs-research' },
			', with the Linux port',
		],
		note: 'full BSc scholarship',
	},
	{
		mark: 'Top 5%',
		parts: [
			'Winner of national competitive programming olympiads: Tier 1 ',
			{ label: '“Vysshaya Proba”', href: 'https://olymp.hse.ru/mmo/it', diploma: 'vysshaya-proba' },
			' and Tier 2 ',
			{ label: '“Technocup”', href: 'https://cups.online/ru/contests/technocup-25', diploma: 'technocup' },
		],
		note: 'full BSc scholarship',
	},
	{
		mark: 'Winner of project competitions',
		parts: [
			{ label: 'Sirius Big Challenges', href: 'https://bigchallenges.ru/', diploma: 'sirius-big-challenges' },
			', ',
			{ label: 'HSE Higher Pilot', href: 'https://pilotazh.hse.ru/', diploma: 'hse-higher-pilot' },
			', ',
			{ label: 'BMSTU Step into the Future', href: 'https://energo.bmstu.ru/step-into-the-future' },
		],
	},
	{
		mark: 'Hackathons winner',
		parts: [
			{ label: 'OctusBridge deployment hackathon (Everscale)', href: 'https://github.com/AntonIXO/octusbridge-ansible' },
			' · ',
			{ label: 'MEPhI Nuclear Hack', href: 'https://goit.mephi.ru/nuclear-hack', diploma: 'nuclear-hack' },
			' · Central University Hackathon (team hack)',
		],
	},
];

export const skills: CvSkillGroup[] = [
	{
		label: 'Languages',
		items: ['Python', 'C++', 'Go', 'Kotlin', 'TypeScript', 'Java', 'FunC', 'Bash'],
	},
	{
		label: 'Technologies',
		items: ['Linux', 'Low-level Android OS', "Multimodal Time-Series & Embeddings", 'LLM applications', 'Distributed Systems'],
	},
	{
		label: 'Domains',
		items: ['Biohacking & health analytics', 'Startups', 'Blockchain/Smart contracts'],
	},
	{
		label: 'Sport',
		items: ['Running (half a marathon)', 'Rock climbing (6b+ outdoors)'],
	},
];

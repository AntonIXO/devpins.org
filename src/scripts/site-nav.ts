import { bindThemeControls, readTheme, THEME_EVENT } from './theme';

document.addEventListener('astro:page-load', () => {
	bindThemeControls();
});

// Follow the OS/browser theme live while no explicit choice is stored.
// A manual toggle wins until the user clears site data (applyTheme persists it).
const system = matchMedia('(prefers-color-scheme: light)');
system.addEventListener('change', (event) => {
	let stored: string | null = null;
	try {
		stored = localStorage.getItem('devpins-theme');
	} catch {
		/* private mode */
	}
	if (stored === 'light' || stored === 'dark') return;
	const next = event.matches ? 'light' : 'dark';
	document.documentElement.dataset.theme = next;
	document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
	syncMeta(next);
});

function syncMeta(theme: 'dark' | 'light'): void {
	document
		.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
		.forEach((meta) => meta.setAttribute('content', theme === 'dark' ? '#070708' : '#f6eeeb'));
}

readTheme();

export const THEME_KEY = 'devpins-theme';
export const THEME_EVENT = 'themechange';

export type Theme = 'dark' | 'light';

export function readTheme(): Theme {
	const stored = document.documentElement.dataset.theme;
	if (stored === 'light' || stored === 'dark') return stored;
	try {
		const saved = localStorage.getItem(THEME_KEY);
		if (saved === 'light' || saved === 'dark') return saved;
	} catch {
		// private mode
	}
	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(THEME_KEY, theme);
	} catch {
		// private mode
	}
	document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
	syncToggle(theme);
}

export function toggleTheme(): Theme {
	const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
	applyTheme(next);
	return next;
}

function syncToggle(theme: Theme): void {
	document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((button) => {
		button.textContent = theme === 'dark' ? 'White' : 'Black';
		button.setAttribute('aria-label', theme === 'dark' ? 'Switch to white' : 'Switch to black');
	});
}

export function bindThemeControls(root: ParentNode = document): void {
	const theme = readTheme();
	if (document.documentElement.dataset.theme !== theme) {
		document.documentElement.dataset.theme = theme;
	}
	syncToggle(theme);
	root.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((button) => {
		if (button.dataset.bound === '1') return;
		button.dataset.bound = '1';
		button.addEventListener('click', () => toggleTheme());
	});
}

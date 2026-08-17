import { animate, stagger } from 'motion';
import { prefersReducedMotion } from './reduced-motion';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const ROTATE = { type: 'spring', bounce: 0, duration: 0.35 } as const;
const STAGGER = 0.045;

type Tab = 'all' | 'oh' | 'mb' | 'k';

class SiteNav extends HTMLElement {
	#open = false;
	#tab: Tab = 'all';
	#toggle: HTMLButtonElement | null = null;
	#glyph: HTMLElement | null = null;
	#bound = false;

	connectedCallback(): void {
		this.#toggle = this.querySelector('[data-toggle]');
		this.#glyph = this.querySelector('.d__glyph');

		if (!this.#bound) {
			this.#bound = true;
			this.#toggle?.addEventListener('click', () => this.toggle());
			this.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => {
				button.addEventListener('click', () => this.pick((button.dataset.filter ?? 'all') as Tab));
			});
			document.addEventListener('keydown', (event) => {
				if (event.key === 'Escape' && this.#open) this.setOpen(false, { instant: true });
			});
			document.addEventListener('astro:page-load', () => this.syncPage());
		}

		this.syncPage();
		this.applyFilter();
		this.syncChips();
		this.snap(this.#open);
	}

	toggle(): void {
		this.setOpen(!this.#open);
	}

	setOpen(open: boolean, options: { instant?: boolean } = {}): void {
		this.#open = open;
		this.#toggle?.setAttribute('aria-expanded', String(open));
		this.classList.toggle('is-open', open);
		this.classList.toggle('is-instant', Boolean(options.instant));
		this.setInert(open);
		this.rotateGlyph(open, options.instant);

		if (open && !options.instant) this.staggerRows();
		if (!options.instant) {
			requestAnimationFrame(() => this.classList.remove('is-instant'));
		}
	}

	pick(tab: Tab): void {
		this.#tab = this.#tab === tab && tab !== 'all' ? 'all' : tab;
		this.applyFilter();
		this.syncChips();
		this.setOpen(true);
		this.staggerRows();
	}

	private applyFilter(): void {
		this.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
			row.hidden = this.#tab !== 'all' && row.dataset.k !== this.#tab;
		});
	}

	private rotateGlyph(open: boolean, instant = false): void {
		if (!this.#glyph) return;
		const deg = open ? 90 : 0;
		if (instant || prefersReducedMotion()) {
			this.#glyph.style.transform = `rotate(${deg}deg)`;
			return;
		}
		animate(this.#glyph, { transform: `rotate(${deg}deg)` }, ROTATE);
	}

	private syncChips(): void {
		this.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => {
			const on = button.dataset.filter === this.#tab;
			button.setAttribute('aria-pressed', String(on));
			button.classList.toggle('is-on', on);
		});
	}

	private syncPage(): void {
		const path = window.location.pathname.replace(/\/+$/, '') || '/';
		this.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((link) => {
			const href = link.getAttribute('href') ?? '';
			const current = href.replace(/\/+$/, '') || '/';
			link.classList.toggle('is-current', current === path);
		});
	}

	private visibleRows(): HTMLElement[] {
		return [...this.querySelectorAll<HTMLElement>('[data-row]')].filter((row) => !row.hidden);
	}

	private staggerRows(): void {
		const rows = this.visibleRows();
		if (!rows.length) return;

		if (prefersReducedMotion()) {
			for (const row of rows) {
				row.style.opacity = '1';
				row.style.transform = 'none';
			}
			return;
		}

		for (const row of rows) {
			row.style.opacity = '0';
			row.style.transform = 'translateY(8px) scale(0.98)';
		}

		animate(
			rows,
			{ opacity: 1, transform: 'translateY(0px) scale(1)' },
			{
				duration: 0.2,
				easing: EASE_OUT,
				delay: stagger(STAGGER),
			},
		);
	}

	private setInert(open: boolean): void {
		const drawer = this.querySelector('[data-drawer]');
		if (!(drawer instanceof HTMLElement)) return;
		drawer.toggleAttribute('inert', !open);
		drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
	}

	private snap(open: boolean): void {
		this.classList.toggle('is-open', open);
		this.setInert(open);
		this.rotateGlyph(open, true);
	}
}

if (!customElements.get('site-nav')) {
	customElements.define('site-nav', SiteNav);
}

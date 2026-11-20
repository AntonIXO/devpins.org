import { animate } from 'motion/mini';
import { prefersReducedMotion } from './reduced-motion';

function mountProjects() {
	const list = document.querySelector<HTMLElement>('.projects');
	if (!list || list.hasAttribute('data-hover-ready')) return;
	list.setAttribute('data-hover-ready', '');

	const actions = new Map<HTMLDetailsElement, (open: boolean) => void>();
	const hover = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
	for (const card of list.querySelectorAll<HTMLDetailsElement>('[data-cv-project]')) {
		const summary = card.querySelector('summary')!;
		const panel = card.querySelector<HTMLElement>('.project__panel')!;
		let expanded = card.open;
		let animation: ReturnType<typeof animate> | undefined;

		function reveal(next: boolean, immediate = false) {
			if (expanded === next) return;
			expanded = next;
			const start = card.getBoundingClientRect();
			animation?.stop();
			animation = undefined;

			if (!next) {
				if (panel.contains(document.activeElement)) summary.focus({ preventScroll: true });
				panel.querySelector('video')?.pause();
			}
			panel.inert = !next;
			const settle = () => {
				card.open = next;
				card.style.removeProperty('height');
				card.style.removeProperty('width');
				animation = undefined;
			};
			if (immediate || prefersReducedMotion() || !card.animate) {
				settle();
				return;
			}

			// Measure the native end state before paint. The inner columns keep their
			// final widths while the outer box reveals them and moves the next row.
			card.style.removeProperty('height');
			card.style.removeProperty('width');
			card.open = next;
			const end = card.getBoundingClientRect();
			card.open = true;
			const running = animate(card, {
				width: [`${start.width}px`, `${end.width}px`],
				height: [`${start.height}px`, `${end.height}px`],
			}, { duration: next ? 0.28 : 0.22, ease: [0.25, 0.1, 0.25, 1] });
			animation = running;
			void running.finished.then(() => {
				if (animation === running) settle();
			});
		}

		actions.set(card, reveal);
		summary.addEventListener('click', event => {
			if (event.target instanceof Element && event.target.closest('a')) return;
			event.preventDefault();
			if (event.detail === 0 || !(event instanceof PointerEvent && event.pointerType === 'mouse' && hover.matches)) {
				reveal(!expanded, event.detail === 0);
			}
		});
		card.addEventListener('keydown', event => {
			if (event.key === 'Escape') reveal(false, true);
		});
		card.addEventListener('focusout', event => {
			if (!card.contains(event.relatedTarget as Node) && !card.matches(':hover')) reveal(false, true);
		});
	}

	let active: HTMLDetailsElement | null = null;
	let entryBounds: DOMRect | undefined;
	let lastX = NaN;
	let lastY = NaN;

	function select(card: HTMLDetailsElement | null) {
		if (active === card) return;
		// Capture the incoming row before the outgoing panel starts shrinking.
		entryBounds = active && card ? card.getBoundingClientRect() : undefined;
		if (active) actions.get(active)?.(false);
		active = card;
		if (card) actions.get(card)?.(true);
	}

	const listeners = new AbortController();
	const options = { signal: listeners.signal };
	document.addEventListener('pointermove', event => {
		if (event.pointerType !== 'mouse' || !hover.matches) return;
		const { clientX: x, clientY: y } = event;
		if (x === lastX && y === lastY) return;
		lastX = x;
		lastY = y;
		const target = event.target;
		if (!(target instanceof Element)) return;

		// The grid gap belongs to the handoff. Closing here would pull the next
		// header away before the pointer could reach it.
		if (target === list) return;
		const card = target.closest<HTMLDetailsElement>('[data-cv-project]');
		if (entryBounds) {
			if (x >= entryBounds.left && x < entryBounds.right && y >= entryBounds.top && y < entryBounds.bottom) return;
			entryBounds = undefined;
		}
		select(card && actions.has(card) ? card : null);
	}, options);

	function leave() {
		select(null);
		lastX = lastY = NaN;
	}
	document.addEventListener('pointerout', event => {
		if (event.pointerType === 'mouse' && !event.relatedTarget) leave();
	}, options);
	window.addEventListener('blur', leave, options);
	// Scrolling is intentional movement too. Close a panel that has scrolled
	// away without automatically opening a different project under the mouse.
	window.addEventListener('scroll', () => {
		entryBounds = undefined;
		if (active && !active.contains(document.elementFromPoint(lastX, lastY))) leave();
	}, { ...options, passive: true });
	document.addEventListener('astro:before-swap', () => listeners.abort(), { once: true });
}

mountProjects();
document.addEventListener('astro:page-load', mountProjects);

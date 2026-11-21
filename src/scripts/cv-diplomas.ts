function mountDiplomas() {
	const preview = document.querySelector<HTMLElement>('[data-cv-diploma-preview]');
	const image = preview?.querySelector('img');
	if (!preview?.showPopover || !image || preview.dataset.ready) return;
	preview.dataset.ready = 'true';

	const listeners = new AbortController();
	const options = { signal: listeners.signal };
	let active: HTMLAnchorElement | undefined;
	let closeTimer: number | undefined;

	const close = () => {
		window.clearTimeout(closeTimer);
		active = undefined;
		preview.hidePopover();
	};

	const place = () => {
		if (!active || !image.complete || !image.naturalWidth) return;
		const anchor = active.getBoundingClientRect();
		const { clientWidth, clientHeight } = document.documentElement;
		if (anchor.bottom < 0 || anchor.top > clientHeight) {
			close();
			return;
		}

		const edge = 12;
		const top = anchor.bottom + 5;
		const imageHeight = clientHeight - top - edge - 10;
		if (imageHeight < 64) {
			preview.hidePopover();
			return;
		}

		preview.style.top = `${top}px`;
		preview.style.setProperty('--diploma-image-height', `${imageHeight}px`);
		preview.showPopover();
		preview.style.left = `${Math.max(edge, Math.min(anchor.left, clientWidth - preview.offsetWidth - edge))}px`;
	};

	const scheduleClose = () => {
		window.clearTimeout(closeTimer);
		closeTimer = window.setTimeout(() => {
			if (!active?.matches(':hover, :focus-visible') && !preview.matches(':hover')) close();
		}, 120);
	};

	for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-cv-diploma]')) {
		const source = link.dataset.cvDiploma;
		if (!source) continue;
		const open = (pointer: boolean) => {
			window.clearTimeout(closeTimer);
			active = link;
			preview.toggleAttribute('data-pointer', pointer);
			if (image.getAttribute('src') !== source) {
				preview.hidePopover();
				image.src = source;
			}
			place();
		};
		link.addEventListener('pointerenter', event => {
			if (event.pointerType === 'mouse') open(true);
		}, options);
		link.addEventListener('focus', () => {
			if (link.matches(':focus-visible')) open(false);
		}, options);
		link.addEventListener('pointerleave', scheduleClose, options);
		link.addEventListener('blur', scheduleClose, options);
		link.addEventListener('click', close, options);
	}

	image.addEventListener('load', place, options);
	preview.addEventListener('pointerenter', () => window.clearTimeout(closeTimer), options);
	preview.addEventListener('pointerleave', scheduleClose, options);
	window.addEventListener('scroll', place, { ...options, passive: true });
	window.addEventListener('resize', place, options);
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape' && active) close();
	}, options);
	document.addEventListener('astro:before-swap', () => {
		close();
		listeners.abort();
	}, { once: true });
}

mountDiplomas();
document.addEventListener('astro:page-load', mountDiplomas);

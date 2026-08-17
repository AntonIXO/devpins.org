const NAME = 'cv-orb';

function sources(): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>('[data-cv-orb]')];
}

function claim(el: HTMLElement): void {
	for (const node of sources()) {
		node.style.viewTransitionName = node === el ? NAME : 'none';
	}
}

function bind(): void {
	for (const el of sources()) {
		if (el.dataset.cvOrbBound === '1') continue;
		el.dataset.cvOrbBound = '1';
		el.addEventListener('pointerdown', () => claim(el));
	}
}

document.addEventListener('astro:page-load', bind);

interface PortraitStyle {
	charset: string;
	columns: number;
	ink: string;
	paper: string;
	overlay?: boolean;
}

const portraitStyles: readonly PortraitStyle[] = [
	{ charset: ' .:-=+*#%@', columns: 47, ink: '#eae5d6', paper: '#141515' },
	{ charset: ' ░▒▓█', columns: 57, ink: 'source', paper: '#15131a' },
	{ charset: ' .:;-=+*#%@', columns: 64, ink: '#ffd18a', paper: '#1e160c', overlay: true },
	{ charset: '  .01', columns: 52, ink: '#96e1ab', paper: '#0c1a15' },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function renderAscii(source: HTMLImageElement, canvas: HTMLCanvasElement, style: PortraitStyle) {
	const width = 480;
	const height = Math.round(width * source.naturalHeight / source.naturalWidth);
	const cellWidth = width / style.columns;
	const rows = Math.round(height / (cellWidth * 1.68));
	const cellHeight = height / rows;
	const sample = document.createElement('canvas');
	sample.width = style.columns;
	sample.height = rows;
	const pixels = sample.getContext('2d');
	const context = canvas.getContext('2d');
	if (!pixels || !context) return false;

	pixels.drawImage(source, 0, 0, style.columns, rows);
	const { data } = pixels.getImageData(0, 0, style.columns, rows);
	canvas.width = width;
	canvas.height = height;
	if (style.overlay) {
		context.filter = 'grayscale(1) sepia(0.55)';
		context.drawImage(source, 0, 0, width, height);
		context.filter = 'none';
		context.globalAlpha = 0.76;
	}
	context.fillStyle = style.paper;
	context.fillRect(0, 0, width, height);
	context.globalAlpha = style.overlay ? 0.68 : 1;
	context.font = `${cellHeight}px monospace`;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillStyle = style.ink;

	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < style.columns; x++) {
			const offset = (y * style.columns + x) * 4;
			const red = data[offset];
			const green = data[offset + 1];
			const blue = data[offset + 2];
			const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
			const tone = clamp((luminance - 0.08) / 0.72);
			const character = style.charset[Math.round(tone * (style.charset.length - 1))];
			if (character === ' ') continue;

			if (style.ink === 'source') {
				context.fillStyle = `rgb(${red + 18} ${green + 18} ${blue + 18})`;
			}
			context.fillText(character, (x + 0.5) * cellWidth, (y + 0.55) * cellHeight);
		}
	}
	return true;
}

function mountPortraits(article: HTMLElement) {
	const intro = article.querySelector<HTMLElement>('[data-cv-intro]');
	const outro = article.querySelector<HTMLElement>('[data-cv-outro]');
	const portraits = [...article.querySelectorAll<HTMLElement>('[data-cv-portrait]')].map((element) => ({
		pointing: element.dataset.cvPortrait === 'pointing',
		image: element.querySelector('img')!,
		layers: [...element.querySelectorAll('canvas')],
	}));
	const wide = window.matchMedia('(min-width: 1120px) and (min-height: 450px)');
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	const rendered = new WeakSet<HTMLCanvasElement>();
	const listeners = new AbortController();
	const { signal } = listeners;
	let scrollEnd = 0;
	let pointingStart = 0;
	let frame = 0;

	function update() {
		frame = 0;
		const articleBounds = article.getBoundingClientRect();
		for (const { pointing, image, layers } of portraits) {
			const active = !reduced.matches && (pointing ? window.scrollY >= pointingStart : wide.matches) && image.naturalWidth > 0;
			if (!active) {
				layers.forEach((layer) => { layer.hidden = true; });
				continue;
			}

			const progress = pointing
				? (scrollEnd - window.scrollY) / Math.max(1, scrollEnd - pointingStart)
				: -articleBounds.top / Math.max(1, articleBounds.height - window.innerHeight * 0.85);
			const position = clamp(progress) * layers.length;

			layers.forEach((layer, index) => {
				// Hold each preset briefly, then reveal the next from the top down.
				const reveal = clamp((position - index - 0.18) / 0.55);
				const covered = position >= index + 1.73;
				if (reveal > 0 && !covered && !rendered.has(layer) && renderAscii(image, layer, portraitStyles[index])) {
					rendered.add(layer);
				}
				layer.hidden = reveal === 0 || covered || !rendered.has(layer);
				if (!layer.hidden) {
					const inset = `${(1 - reveal) * 100}%`;
					layer.style.clipPath = pointing ? `inset(${inset} 0 0 0)` : `inset(0 0 ${inset} 0)`;
				}
			});
		}
	}

	function schedule() {
		if (!frame) frame = window.requestAnimationFrame(update);
	}

	function measureTrack() {
		if (intro) article.style.setProperty('--portrait-height', `${intro.getBoundingClientRect().height}px`);
		if (!outro) return;
		const viewport = window.innerHeight;
		const height = document.documentElement.scrollHeight;
		const bounds = outro.getBoundingClientRect();
		scrollEnd = Math.max(0, height - viewport);
		pointingStart = Math.ceil(scrollEnd * 0.7);
		// Put the top of the sticky area at the viewport's bottom at 70% scroll.
		outro.style.setProperty('--pointing-start', `${pointingStart + viewport - (bounds.top + window.scrollY)}px`);
		// The desktop gutter can keep the portrait pinned alongside the footer.
		outro.style.setProperty('--pointing-end', `${bounds.bottom + window.scrollY - height}px`);
		schedule();
	}

	const observer = new ResizeObserver(measureTrack);
	observer.observe(article);
	observer.observe(document.body);
	if (intro) observer.observe(intro);
	for (const { image } of portraits) image.addEventListener('load', schedule, { signal });
	window.addEventListener('scroll', schedule, { passive: true, signal });
	window.addEventListener('resize', measureTrack, { signal });
	reduced.addEventListener('change', schedule, { signal });
	measureTrack();

	document.addEventListener('astro:before-swap', () => {
		listeners.abort();
		observer.disconnect();
		window.cancelAnimationFrame(frame);
	}, { once: true });
}

document.addEventListener('astro:page-load', () => {
	const article = document.querySelector<HTMLElement>('.cv');
	if (article) mountPortraits(article);
});

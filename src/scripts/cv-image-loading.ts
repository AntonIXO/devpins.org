let scheduledPage: Element | null = null;

function warmCvImages() {
	const page = document.querySelector('.cv');
	if (!page || page === scheduledPage) return;
	scheduledPage = page;

	const images = page.querySelectorAll<HTMLImageElement>('img[data-cv-warm-image]');
	const queue = images.values();

	function scheduleNext() {
		if (!page?.isConnected) return;
		if (window.requestIdleCallback) {
			window.requestIdleCallback(loadNext, { timeout: 1000 });
		} else {
			window.setTimeout(loadNext, 100);
		}
	}

	async function loadNext() {
		if (!page?.isConnected) return;
		const { value: image, done } = queue.next();
		if (done) return;
		if (!image.complete) {
			image.loading = 'eager';
			await image.decode().catch(() => undefined);
		}
		scheduleNext();
	}

	if (document.readyState === 'complete') scheduleNext();
	else window.addEventListener('load', scheduleNext, { once: true });
}

document.addEventListener('astro:page-load', warmCvImages);

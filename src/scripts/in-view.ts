import { animate, inView } from 'motion';
import { prefersReducedMotion } from './reduced-motion';

const readyAttr = 'data-motion-ready';

export function revealInView(root: ParentNode = document): void {
	const nodes = root.querySelectorAll<HTMLElement>('[data-reveal]');
	if (!nodes.length) return;

	if (prefersReducedMotion()) {
		nodes.forEach((node) => {
			node.style.opacity = '1';
			node.style.transform = 'none';
		});
		return;
	}

	inView(
		nodes,
		(element) => {
			if (!(element instanceof HTMLElement) || element.hasAttribute(readyAttr)) return;
			element.setAttribute(readyAttr, '');
			animate(
				element,
				{ opacity: [0, 1], y: [16, 0] },
				{ type: 'spring', bounce: 0, duration: 0.4 },
			);
		},
		{ amount: 0.2 },
	);
}

export function drawSparklines(root: ParentNode = document): void {
	const lines = root.querySelectorAll<SVGGeometryElement>('[data-spark]');
	if (!lines.length) return;

	lines.forEach((line) => {
		if (line.hasAttribute(readyAttr)) return;
		const length = line.getTotalLength();
		line.style.strokeDasharray = `${length}`;
		line.style.strokeDashoffset = `${length}`;
		if (prefersReducedMotion()) {
			line.style.strokeDashoffset = '0';
			line.setAttribute(readyAttr, '');
			return;
		}
	});

	const wraps = root.querySelectorAll('[data-spark-wrap]');
	if (!wraps.length) return;

	inView(
		wraps,
		(element) => {
			if (!(element instanceof Element)) return;
			const line = element.querySelector<SVGGeometryElement>('[data-spark]');
			if (!line || line.hasAttribute(readyAttr)) return;
			line.setAttribute(readyAttr, '');
			animate(line, { strokeDashoffset: 0 }, { duration: 1.2, easing: 'ease-out' });
		},
		{ amount: 0.4 },
	);
}

export function bindPageMotion(): void {
	revealInView();
	drawSparklines();
}

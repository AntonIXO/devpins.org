import ForceGraph, { type LinkObject, type NodeObject } from 'force-graph';

type PreviewNode = NodeObject & {
	id: string;
	label: string;
	degree: number;
	val: number;
	color: string;
};

type PreviewLink = LinkObject<PreviewNode> & {
	source: string;
	target: string;
	weight: number;
};

type PreviewData = {
	nodes: PreviewNode[];
	links: PreviewLink[];
};

type PreviewRoot = HTMLElement & {
	__vibesciencePreviewCleanup?: () => void;
};

const parseData = (root: HTMLElement): PreviewData | null => {
	const script = root.querySelector<HTMLScriptElement>('[data-vibescience-preview-data]');
	if (!script?.textContent) return null;
	try {
		return JSON.parse(script.textContent) as PreviewData;
	} catch {
		return null;
	}
};

const kindColor = (node: PreviewNode): string => node.color || '#c4a15b';

export function mountVibesciencePreview(): (() => void) | undefined {
	const root = document.querySelector<PreviewRoot>('[data-vibescience-preview]');
	if (!root) return undefined;
	root.__vibesciencePreviewCleanup?.();

	const canvasRoot = root.querySelector<HTMLElement>('[data-vibescience-preview-canvas]');
	const data = parseData(root);
	if (!canvasRoot || !data) return undefined;

	const graph = new ForceGraph<PreviewNode, PreviewLink>(canvasRoot);
	graph
		.width(canvasRoot.clientWidth)
		.height(canvasRoot.clientHeight)
		.nodeId('id')
		.nodeRelSize(2.8)
		.nodeVal((node) => node.val)
		.nodeColor(kindColor)
		.nodeLabel((node) => node.label)
		.nodeCanvasObjectMode(() => 'replace')
		.nodeCanvasObject((node, ctx, globalScale) => {
			const radius = Math.max(1.5, Math.sqrt(Math.max(1, node.val)) * 1.15);
			ctx.beginPath();
			ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
			ctx.globalAlpha = 0.88;
			ctx.fillStyle = kindColor(node);
			ctx.fill();
			if (globalScale > 1.7 && node.degree > 10) {
				ctx.globalAlpha = 0.72;
				ctx.font = `${Math.max(8, 8 / globalScale)}px IBM Plex Mono, monospace`;
				ctx.fillStyle = 'rgba(237, 236, 232, 0.82)';
				ctx.textAlign = 'left';
				ctx.textBaseline = 'middle';
				ctx.fillText(node.label.slice(0, 26), (node.x ?? 0) + radius + 3 / globalScale, node.y ?? 0);
			}
			ctx.globalAlpha = 1;
		})
		.linkColor(() => 'rgba(180, 185, 198, 0.2)')
		.linkWidth((link) => Math.min(0.45 + link.weight * 0.12, 1.1))
		.enableNodeDrag(false)
		.enableZoomInteraction(false)
		.enablePanInteraction(false)
		.autoPauseRedraw(true)
		.warmupTicks(0)
		.cooldownTicks(0)
		.zoom(0.5)
		.graphData(data);

		const fit = () => graph.zoomToFit(0, 22);
		requestAnimationFrame(fit);

		const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => {
			graph.width(canvasRoot.clientWidth).height(canvasRoot.clientHeight);
			fit();
		});
		resizeObserver?.observe(canvasRoot);

		const cleanup = () => {
			resizeObserver?.disconnect();
			graph._destructor();
			if (root.__vibesciencePreviewCleanup === cleanup) delete root.__vibesciencePreviewCleanup;
		};
		root.__vibesciencePreviewCleanup = cleanup;
		return cleanup;
}

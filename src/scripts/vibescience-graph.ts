import ForceGraph, { type LinkObject, type NodeObject } from 'force-graph';

type VaultNode = NodeObject & {
	id: string;
	label: string;
	path: string;
	kind: string;
	status: string;
	degree: number;
	val: number;
	color: string;
};

type VaultLink = LinkObject<VaultNode> & {
	source: string;
	target: string;
	weight: number;
};

type VaultGraphData = {
	source: {
		noteCount: number;
		edgeCount: number;
	};
	nodes: Array<{
		id: string;
		label: string;
		path: string;
		kind: string;
		status: string;
		x: number;
		y: number;
		degree: number;
		size: number;
	}>;
	edges: Array<{
		source: string;
		target: string;
		weight: number;
	}>;
};

type Palette = {
	ink: string;
	muted: string;
	dim: string;
	line: string;
	panel: string;
	accent: string;
};

type GraphStage = HTMLElement & {
	__vibescienceGraphCleanup?: () => void;
};

const KIND_LABELS: Record<string, string> = {
	diagnostics: 'Diagnostics',
	experiments: 'Experiments',
	hypotheses: 'Hypotheses',
	interventions: 'Interventions',
	papers: 'Papers',
	problems: 'Problems',
	rule_outs: 'Rule-outs',
	runbooks: 'Runbooks',
	tags: 'Tags',
	root: 'Root',
};

const KIND_COLORS: Record<string, string> = {
	diagnostics: '#c28b5a',
	experiments: '#c4a15b',
	hypotheses: '#8f83c1',
	interventions: '#7fb29e',
	papers: '#6e9eae',
	problems: '#c46c6c',
	rule_outs: '#b37c9e',
	runbooks: '#7898c1',
	tags: '#8b8e97',
	root: '#c9c2b4',
};

const readPalette = (stage: HTMLElement): Palette => {
	const styles = getComputedStyle(stage);
	return {
		ink: styles.getPropertyValue('--vault-fg').trim() || '#eeeae2',
		muted: styles.getPropertyValue('--vault-muted').trim() || '#8c8a86',
		dim: styles.getPropertyValue('--vault-dim').trim() || '#575960',
		line: styles.getPropertyValue('--vault-border').trim() || 'rgba(237, 236, 232, 0.13)',
		panel: styles.getPropertyValue('--vault-panel-strong').trim() || 'rgba(22, 24, 30, 0.95)',
		accent: styles.getPropertyValue('--vault-accent').trim() || '#d6aa5b',
	};
};

const labelForKind = (kind: string): string => KIND_LABELS[kind] ?? kind;

const parseData = (): VaultGraphData | null => {
	const element = document.getElementById('vibescience-graph-data');
	if (!element?.textContent) return null;
	try {
		return JSON.parse(element.textContent) as VaultGraphData;
	} catch {
		return null;
	}
};

const nodeId = (value: string | number | VaultNode | undefined): string => {
	if (typeof value === 'object' && value) return String(value.id);
	return String(value ?? '');
};

const shortLabel = (label: string, maxLength = 44): string => {
	if (label.length <= maxLength) return label;
	return `${label.slice(0, maxLength - 1).trimEnd()}…`;
};

export function mountVibescienceGraph(): (() => void) | undefined {
	const stage = document.querySelector<GraphStage>('[data-vibescience-graph]');
	const data = parseData();
	if (!stage || !data) return undefined;
	stage.__vibescienceGraphCleanup?.();

	const graphShell = stage.closest<HTMLElement>('.graph-stage');
	const loading = graphShell?.querySelector<HTMLElement>('[data-vault-loading]');
	const error = graphShell?.querySelector<HTMLElement>('[data-vault-error]');
	const page = stage.closest<HTMLElement>('.vault-page');
	if (!page) return undefined;

	const search = page.querySelector<HTMLInputElement>('[data-vault-search]');
	const searchCount = page.querySelector<HTMLElement>('[data-vault-search-count]');
	const visibleCount = page.querySelector<HTMLElement>('[data-vault-visible]');
	const filters = [...page.querySelectorAll<HTMLButtonElement>('[data-vault-filter]')];
	const emptyDetail = page.querySelector<HTMLElement>('[data-vault-empty]');
	const detailContent = page.querySelector<HTMLElement>('[data-vault-content]');
	const detailKind = page.querySelector<HTMLElement>('[data-vault-kind]');
	const detailTitle = page.querySelector<HTMLElement>('[data-vault-title]');
	const detailPath = page.querySelector<HTMLElement>('[data-vault-path]');
	const detailStatus = page.querySelector<HTMLElement>('[data-vault-status]');
	const detailDegree = page.querySelector<HTMLElement>('[data-vault-degree]');
	const neighborCount = page.querySelector<HTMLElement>('[data-vault-neighbor-count]');
	const neighborList = page.querySelector<HTMLElement>('[data-vault-neighbors]');

	const nodes: VaultNode[] = data.nodes.map((node) => ({
		id: node.id,
		label: node.label,
		path: node.path,
		kind: node.kind,
		status: node.status,
		x: node.x,
		y: node.y,
		degree: node.degree,
		val: node.size,
		color: KIND_COLORS[node.kind] ?? KIND_COLORS.root,
	}));
	const links: VaultLink[] = data.edges.map((edge) => ({
		source: edge.source,
		target: edge.target,
		weight: edge.weight,
	}));

	const nodeById = new Map(nodes.map((node) => [node.id, node]));
	const neighborsById = new Map<string, Set<string>>();
	for (const node of nodes) neighborsById.set(node.id, new Set());
	for (const link of links) {
		neighborsById.get(link.source)?.add(link.target);
		neighborsById.get(link.target)?.add(link.source);
	}

	let palette = readPalette(stage);
	let selectedNode: string | null = null;
	let hoveredNode: string | null = null;
	let filter = 'all';
	let query = '';
	let neighborhood = new Set<string>();

	const nodeMatches = (node: VaultNode): boolean => {
		const inFilter = filter === 'all' || node.kind === filter;
		if (!inFilter) return false;
		if (!query) return true;
		return `${node.label} ${node.path} ${node.kind}`.toLowerCase().includes(query);
	};

	const isHighlighted = (node: VaultNode): boolean => {
		if (selectedNode) return node.id === selectedNode || neighborhood.has(node.id);
		if (hoveredNode) return node.id === hoveredNode || neighborhood.has(node.id);
		return false;
	};

	const linkIsHot = (link: VaultLink): boolean => {
		const source = nodeId(link.source);
		const target = nodeId(link.target);
		return Boolean(selectedNode || hoveredNode) && (neighborhood.has(source) || neighborhood.has(target) || source === selectedNode || target === selectedNode || source === hoveredNode || target === hoveredNode);
	};

	const nodeRadius = (node: VaultNode): number => Math.max(1.8, Math.sqrt(Math.max(1, node.val)) * 1.38);

	const paintNode = (node: VaultNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
		const active = isHighlighted(node);
		const faded = Boolean(selectedNode || hoveredNode) && !active;
		const radius = nodeRadius(node);
		ctx.save();
		ctx.globalAlpha = faded ? 0.15 : 0.96;
		ctx.beginPath();
		ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = node.color;
		ctx.fill();

		if (active) {
			ctx.globalAlpha = 0.34;
			ctx.beginPath();
			ctx.arc(node.x ?? 0, node.y ?? 0, radius * 1.9, 0, 2 * Math.PI, false);
			ctx.strokeStyle = palette.accent;
			ctx.lineWidth = 1.2 / globalScale;
			ctx.stroke();
		}

		const shouldLabel = active || (globalScale > 1.2 && node.degree >= 5);
		if (shouldLabel) {
			const fontSize = Math.max(9, 10 / globalScale);
			ctx.globalAlpha = active ? 1 : 0.72;
			ctx.font = `${fontSize}px IBM Plex Mono, monospace`;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = active ? palette.ink : palette.muted;
			ctx.fillText(shortLabel(node.label), (node.x ?? 0) + radius + 4 / globalScale, node.y ?? 0);
		}
		ctx.restore();
	};

	const paintPointerArea = (node: VaultNode, color: string, ctx: CanvasRenderingContext2D) => {
		ctx.beginPath();
		ctx.arc(node.x ?? 0, node.y ?? 0, nodeRadius(node) + 2.5, 0, 2 * Math.PI, false);
		ctx.fillStyle = color;
		ctx.fill();
	};

	let renderer: ForceGraph<VaultNode, VaultLink>;
	try {
		renderer = new ForceGraph<VaultNode, VaultLink>(stage);
	} catch {
		if (loading) loading.hidden = true;
		if (error) error.hidden = false;
		return undefined;
	}
	renderer.width(stage.clientWidth).height(stage.clientHeight);
	const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => {
		renderer.width(stage.clientWidth).height(stage.clientHeight);
	});
	resizeObserver?.observe(stage);

	const refresh = () => {
		const visible = nodes.reduce((count, node) => count + (nodeMatches(node) ? 1 : 0), 0);
		if (visibleCount) visibleCount.textContent = `${visible} shown`;
		if (searchCount) searchCount.textContent = query ? `${visible}` : '';

		// These accessors redraw the canvas without restarting the force engine.
		renderer
			.nodeVisibility(nodeMatches)
			.linkVisibility((link) => nodeMatches(nodeById.get(nodeId(link.source))!) && nodeMatches(nodeById.get(nodeId(link.target))!))
			.nodeColor((node) => node.color)
			.nodeVal((node) => node.val)
			.nodeCanvasObject(paintNode)
			.nodePointerAreaPaint(paintPointerArea)
			.linkColor((link) => linkIsHot(link) ? palette.accent : (selectedNode || hoveredNode ? 'rgba(140, 145, 160, 0.08)' : palette.line))
			.linkWidth((link) => linkIsHot(link) ? Math.max(1.2, Math.min(2.8, link.weight * 0.45 + 0.8)) : Math.min(0.6 + link.weight * 0.16, 1.35))
			.resumeAnimation();
	};

	const showDetails = (nodeIdValue: string | null) => {
		selectedNode = nodeIdValue;
		if (!nodeIdValue) {
			neighborhood = new Set<string>();
			if (emptyDetail) emptyDetail.hidden = false;
			if (detailContent) detailContent.hidden = true;
			refresh();
			return;
		}

		neighborhood = new Set(neighborsById.get(nodeIdValue) ?? []);
		const node = nodeById.get(nodeIdValue);
		if (!node) return;
		if (emptyDetail) emptyDetail.hidden = true;
		if (detailContent) detailContent.hidden = false;
		if (detailKind) detailKind.textContent = labelForKind(node.kind);
		if (detailTitle) detailTitle.textContent = node.label;
		if (detailPath) detailPath.textContent = node.path;
		if (detailStatus) detailStatus.textContent = node.status || 'no status';
		if (detailDegree) detailDegree.textContent = `${node.degree} links`;

		const neighbors = [...neighborhood]
			.sort((a, b) => (nodeById.get(b)?.degree ?? 0) - (nodeById.get(a)?.degree ?? 0))
			.slice(0, 12);
		if (neighborCount) neighborCount.textContent = `${neighborhood.size}`;
		if (neighborList) {
			neighborList.replaceChildren();
			for (const neighborId of neighbors) {
				const neighbor = nodeById.get(neighborId);
				if (!neighbor) continue;
				const button = document.createElement('button');
				button.type = 'button';
				button.dataset.vaultNeighbor = neighbor.id;
				button.textContent = neighbor.label;
				neighborList.append(button);
			}
		}
		refresh();
	};

	const focusNode = (nodeIdValue: string) => {
		const node = nodeById.get(nodeIdValue);
		if (!node) return;
		showDetails(nodeIdValue);
		renderer.centerAt(node.x ?? 0, node.y ?? 0, 460).zoom(1.35, 460);
	};

	const onSearch = () => {
		query = search?.value.trim().toLowerCase() ?? '';
		selectedNode = null;
		neighborhood = new Set<string>();
		if (emptyDetail) emptyDetail.hidden = false;
		if (detailContent) detailContent.hidden = true;
		refresh();
	};
	const onSearchKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Enter') return;
		const first = nodes.find(nodeMatches);
		if (first) focusNode(first.id);
	};
	search?.addEventListener('input', onSearch);
	search?.addEventListener('keydown', onSearchKeydown);

	const onFilter = (event: Event) => {
		const button = event.currentTarget as HTMLButtonElement;
		filter = button.dataset.vaultFilter ?? 'all';
		selectedNode = null;
		neighborhood = new Set<string>();
		filters.forEach((item) => item.classList.toggle('is-active', item === button));
		if (emptyDetail) emptyDetail.hidden = false;
		if (detailContent) detailContent.hidden = true;
		refresh();
		if (nodes.some(nodeMatches)) renderer.zoomToFit(420, 48, nodeMatches);
	};
	filters.forEach((button) => button.addEventListener('click', onFilter));

	const onNeighborClick = (event: Event) => {
		const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-vault-neighbor]');
		if (button?.dataset.vaultNeighbor) focusNode(button.dataset.vaultNeighbor);
	};
	neighborList?.addEventListener('click', onNeighborClick);

	const onEnter = (node: VaultNode | null) => {
		hoveredNode = node?.id ?? null;
		if (node) neighborhood = new Set(neighborsById.get(node.id) ?? []);
		else if (selectedNode) neighborhood = new Set(neighborsById.get(selectedNode) ?? []);
		else neighborhood = new Set<string>();
		refresh();
	};
	const onClick = (node: VaultNode) => focusNode(node.id);
	const onBackgroundClick = () => showDetails(null);
	renderer.onNodeHover(onEnter).onNodeClick(onClick).onBackgroundClick(onBackgroundClick);

	const actionButtons = [...page.querySelectorAll<HTMLButtonElement>('[data-vault-action]')];
	const onAction = (event: Event) => {
		const action = (event.currentTarget as HTMLButtonElement).dataset.vaultAction;
		if (action === 'reset') {
			showDetails(null);
			renderer.zoomToFit(420, 48, nodeMatches);
		} else if (action === 'zoom-in') {
			renderer.zoom(renderer.zoom() * 1.38, 220);
		} else if (action === 'zoom-out') {
			renderer.zoom(renderer.zoom() / 1.38, 220);
		}
	};
	actionButtons.forEach((button) => button.addEventListener('click', onAction));

	const onThemeChange = () => {
		palette = readPalette(stage);
		refresh();
	};
	document.addEventListener('themechange', onThemeChange);

	renderer
		.nodeId('id')
		.nodeLabel((node) => node.label)
		.nodeRelSize(3.2)
		.nodeCanvasObjectMode(() => 'replace')
		.linkSource('source')
		.linkTarget('target')
		.linkHoverPrecision(5)
		.enableNodeDrag(true)
		.enableZoomInteraction(true)
		.enablePanInteraction(true)
		.autoPauseRedraw(true)
		.warmupTicks(0)
		.cooldownTicks(0)
		// Keep force-graph's default node-count zoom from replacing the
		// precomputed vault framing during the first data update.
		.zoom(0.5)
		.graphData({ nodes, links });

	const reveal = () => {
		loading?.classList.add('is-hidden');
		if (loading) loading.hidden = true;
		renderer.zoomToFit(420, 48, nodeMatches);
	};
	renderer.onEngineStop(reveal);
	refresh();
	requestAnimationFrame(reveal);

	const cleanup = () => {
		search?.removeEventListener('input', onSearch);
		search?.removeEventListener('keydown', onSearchKeydown);
		filters.forEach((button) => button.removeEventListener('click', onFilter));
		neighborList?.removeEventListener('click', onNeighborClick);
		actionButtons.forEach((button) => button.removeEventListener('click', onAction));
		document.removeEventListener('themechange', onThemeChange);
		resizeObserver?.disconnect();
		renderer._destructor();
		if (stage.__vibescienceGraphCleanup === cleanup) delete stage.__vibescienceGraphCleanup;
	};
	stage.__vibescienceGraphCleanup = cleanup;
	return cleanup;
}

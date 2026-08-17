import fragmentSource from '../shaders/neuro-noise.frag?raw';
import vertexSource from '../shaders/fullscreen.vert?raw';
import {
	FALLBACK_HRV,
	FALLBACK_RESTING_HR,
	FALLBACK_SLEEP_HOURS,
	parseVitals,
	type Vitals,
} from '../data/metrics';
import { prefersReducedMotion } from './reduced-motion';
import { readTheme, THEME_EVENT, type Theme } from './theme';

const TIME_SCALE = 0.28;
const COLOR_COUNT = 4;
const INTENSITY = 0.86;
const CURSOR_STRENGTH = 0.22;
const CURSOR_RADIUS = 0.38;
const THEME_LERP_MS = 400;
const BPM_LERP_MS = 1000;
const CACHE_KEY = 'devpins-vitals';
const DPR_CAP = 1.5;

const DARK_PALETTE = [
	[0.55, 0.09, 0.28],
	[0.14, 0.03, 0.2],
	[0.027, 0.012, 0.051],
	[1.0, 0.855, 0.475],
] as const;

const LIGHT_PALETTE = [
	[0.965, 0.94, 0.932],
	[0.78, 0.5, 0.48],
	[0.4, 0.1, 0.12],
	[0.74, 0.16, 0.15],
] as const;

type Vec3 = readonly [number, number, number];

interface Locs {
	colors: WebGLUniformLocation;
	scene: WebGLUniformLocation;
	shape: WebGLUniformLocation;
	surface: WebGLUniformLocation;
	finish: WebGLUniformLocation;
	transform: WebGLUniformLocation;
	space: WebGLUniformLocation;
	cursor: WebGLUniformLocation;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.warn('[neuro-field]', gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function link(gl: WebGLRenderingContext, vert: string, frag: string): WebGLProgram | null {
	const vs = compile(gl, gl.VERTEX_SHADER, vert);
	const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
	if (!vs || !fs) return null;
	const program = gl.createProgram();
	if (!program) return null;
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.bindAttribLocation(program, 0, 'a_pos');
	gl.linkProgram(program);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.warn('[neuro-field]', gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

function paletteFor(theme: Theme): readonly Vec3[] {
	return theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE;
}

function mixPalette(a: readonly Vec3[], b: readonly Vec3[], t: number): number[] {
	const out = new Array<number>(8 * 3).fill(0);
	for (let i = 0; i < COLOR_COUNT; i++) {
		out[i * 3] = a[i][0] + (b[i][0] - a[i][0]) * t;
		out[i * 3 + 1] = a[i][1] + (b[i][1] - a[i][1]) * t;
		out[i * 3 + 2] = a[i][2] + (b[i][2] - a[i][2]) * t;
	}
	return out;
}

function beat(phase: number, start: number, end: number, amp: number): number {
	if (phase < start || phase > end) return 0;
	const t = (phase - start) / (end - start);
	const env = t < 0.22 ? t / 0.22 : Math.exp(-(t - 0.22) * 11);
	return amp * env;
}

function cardiac(phase: number): number {
	return Math.max(beat(phase, 0, 0.16, 1), beat(phase, 0.2, 0.34, 0.42));
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

const SLEEP_REF = FALLBACK_SLEEP_HOURS;

function sleepDelta(hours: number): number {
	return clamp((hours - SLEEP_REF) / 2.4, -1, 1);
}

function hrvAmount(ms: number): number {
	return clamp((ms - 20) / 70, 0, 1);
}

function shadeBySleep(colors: number[], delta: number): number[] {
	const out = colors.slice();
	if (delta < 0) {
		const t = -delta;
		for (let i = 0; i < COLOR_COUNT; i++) {
			const k = i === 3 ? t * 0.35 : t * 0.55;
			out[i * 3] *= 1 - k;
			out[i * 3 + 1] *= 1 - k;
			out[i * 3 + 2] *= 1 - k;
		}
		return out;
	}
	for (let i = 0; i < COLOR_COUNT; i++) {
		const k = delta * (i === 0 ? 0.22 : 0.12);
		out[i * 3] += (1 - out[i * 3]) * k;
		out[i * 3 + 1] += (1 - out[i * 3 + 1]) * k * 0.6;
		out[i * 3 + 2] += (1 - out[i * 3 + 2]) * k * 0.6;
	}
	return out;
}

function readCachedVitals(): Vitals | null {
	try {
		const raw = sessionStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		return parseVitals(JSON.parse(raw));
	} catch {
		return null;
	}
}

function writeCachedVitals(data: unknown): void {
	try {
		sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
	} catch {
		// quota / private mode
	}
}

function vitalsUrl(): string {
	const live = import.meta.env.PUBLIC_VITALS_URL;
	return typeof live === 'string' && live.length > 0 ? live : '/api/vitals.json';
}

function whenIdle(fn: () => void): () => void {
	const ric = window.requestIdleCallback?.bind(window);
	if (ric) {
		const id = ric(() => fn(), { timeout: 1500 });
		return () => window.cancelIdleCallback?.(id);
	}
	const id = window.setTimeout(fn, 0);
	return () => window.clearTimeout(id);
}

function paperRgb(theme: Theme, delta: number): [number, number, number] {
	const base: [number, number, number] =
		theme === 'light' ? [0.965, 0.94, 0.932] : [0.55, 0.09, 0.28];
	if (delta < 0) {
		const t = 1 + delta * 0.45;
		return [base[0] * t, base[1] * t, base[2] * t];
	}
	const lift = theme === 'light' ? 0.16 : 0.18;
	return [
		base[0] + (1 - base[0]) * delta * lift,
		base[1] + (1 - base[1]) * delta * lift * 0.55,
		base[2] + (1 - base[2]) * delta * lift * 0.55,
	];
}

export function mountNeuroField(canvas: HTMLCanvasElement): () => void {
	const gl = canvas.getContext('webgl', {
		alpha: false,
		antialias: false,
		depth: false,
		stencil: false,
		premultipliedAlpha: false,
		powerPreference: 'low-power',
	});
	if (!gl) {
		canvas.hidden = true;
		return () => undefined;
	}

	const program = link(gl, vertexSource, fragmentSource);
	if (!program) {
		canvas.hidden = true;
		return () => undefined;
	}

	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	gl.useProgram(program);

	const locs: Locs = {
		colors: gl.getUniformLocation(program, 'u_colors')!,
		scene: gl.getUniformLocation(program, 'u_scene')!,
		shape: gl.getUniformLocation(program, 'u_shape')!,
		surface: gl.getUniformLocation(program, 'u_surface')!,
		finish: gl.getUniformLocation(program, 'u_finish')!,
		transform: gl.getUniformLocation(program, 'u_transform')!,
		space: gl.getUniformLocation(program, 'u_space')!,
		cursor: gl.getUniformLocation(program, 'u_cursor')!,
	};

	const reduced = prefersReducedMotion();
	const start = performance.now();
	let theme: Theme = readTheme();
	let fromPalette = paletteFor(theme);
	let toPalette = fromPalette;
	let themeT = 1;
	let themeFrom = 0;
	let pointerX = 0;
	let pointerY = 0;
	let presence = 0;
	let presenceTarget = 0;
	const cached = readCachedVitals();
	let bpm = cached?.bpm ?? FALLBACK_RESTING_HR;
	let hrv = cached?.hrv ?? FALLBACK_HRV;
	let sleepHours = cached?.sleepHours ?? FALLBACK_SLEEP_HOURS;
	let bpmFrom = bpm;
	let bpmTo = bpm;
	let hrvFrom = hrv;
	let hrvTo = hrv;
	let sleepFrom = sleepHours;
	let sleepTo = sleepHours;
	let vitalsStarted = 0;
	let frame = 0;
	let running = true;
	let visible = !document.hidden;

	const resize = () => {
		const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
		const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
		const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}
		gl.viewport(0, 0, width, height);
	};

	const setVitals = (next: Vitals) => {
		bpmFrom = bpm;
		bpmTo = next.bpm;
		hrvFrom = hrv;
		hrvTo = next.hrv;
		sleepFrom = sleepHours;
		sleepTo = next.sleepHours;
		vitalsStarted = performance.now();
	};

	const draw = (now: number) => {
		if (!running) return;
		resize();

		const elapsed = (now - start) / 1000;
		if (themeT < 1) {
			themeT = clamp((now - themeFrom) / THEME_LERP_MS, 0, 1);
		}
		if (bpmFrom !== bpmTo || hrvFrom !== hrvTo || sleepFrom !== sleepTo) {
			const u = clamp((now - vitalsStarted) / BPM_LERP_MS, 0, 1);
			bpm = bpmFrom + (bpmTo - bpmFrom) * u;
			hrv = hrvFrom + (hrvTo - hrvFrom) * u;
			sleepHours = sleepFrom + (sleepTo - sleepFrom) * u;
			if (u >= 1) {
				bpmFrom = bpmTo;
				hrvFrom = hrvTo;
				sleepFrom = sleepTo;
			}
		}

		const rest = sleepDelta(sleepHours);
		const tone = hrvAmount(hrv);
		const colors = shadeBySleep(mixPalette(fromPalette, toPalette, themeT), rest);
		const paper = paperRgb(theme, rest);
		gl.clearColor(paper[0], paper[1], paper[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		const pulse = reduced ? 0 : cardiac(((elapsed * bpm) / 60) % 1);
		const flash = 0.65 + 0.5 * tone;
		const brightness =
			(theme === 'light' ? 0.02 + 0.07 * pulse : 0.02 + 0.1 * pulse) * flash + rest * 0.06;
		const contrast = 1 + 0.16 * pulse * flash;
		const paramA = 0.32 + 0.38 * pulse * flash;
		const warp = 0.04 + 0.1 * tone;
		const detail = 2.05 + 0.9 * tone;
		presence += (presenceTarget - presence) * 0.08;
		if (Math.abs(presence - presenceTarget) < 0.001) presence = presenceTarget;

		gl.uniform3fv(locs.colors, colors);
		gl.uniform4f(locs.scene, canvas.width, canvas.height, elapsed * TIME_SCALE, COLOR_COUNT);
		gl.uniform4f(locs.shape, 1.92, INTENSITY, paramA, warp);
		gl.uniform4f(locs.surface, detail, contrast, brightness, 1.0);
		const grain = theme === 'light' ? 0.035 : 0.09;
		gl.uniform4f(locs.finish, 0.0, 0.0, 0.0, grain);
		gl.uniform4f(locs.transform, 1.0, 1.94, 0.0, 0.0);
		gl.uniform4f(locs.space, 0.0, 0.0, pointerX, pointerY);
		gl.uniform4f(locs.cursor, reduced ? 0 : presence, 2.0, CURSOR_STRENGTH, CURSOR_RADIUS);
		gl.drawArrays(gl.TRIANGLES, 0, 3);

		syncCaption(bpm, hrv, sleepHours);

		if (!reduced && visible) {
			frame = requestAnimationFrame(draw);
		}
	};

	const onPointer = (event: PointerEvent) => {
		const rect = canvas.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;
		pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		pointerY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
		presenceTarget = reduced ? 0 : 1;
	};

	const onLeave = () => {
		presenceTarget = 0;
	};

	const snapshotPalette = (): Vec3[] => {
		const flat = mixPalette(fromPalette, toPalette, themeT);
		return [0, 1, 2, 3].map((i) => [flat[i * 3], flat[i * 3 + 1], flat[i * 3 + 2]] as Vec3);
	};

	const onTheme = (event: Event) => {
		const next =
			event instanceof CustomEvent && (event.detail === 'light' || event.detail === 'dark')
				? event.detail
				: readTheme();
		fromPalette = snapshotPalette();
		toPalette = paletteFor(next);
		theme = next;
		themeT = 0;
		themeFrom = performance.now();
		if (reduced || !visible) draw(performance.now());
	};

	const onVisibility = () => {
		visible = !document.hidden;
		if (visible && running && !reduced) {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(draw);
		}
	};

	const cancelIdle = whenIdle(() => {
		void fetchVitals().then((next) => {
			if (!running || next == null) return;
			setVitals(next);
		});
	});

	window.addEventListener('pointermove', onPointer, { passive: true });
	window.addEventListener('pointerleave', onLeave);
	document.addEventListener(THEME_EVENT, onTheme);
	document.addEventListener('visibilitychange', onVisibility);
	const observer = new ResizeObserver(() => {
		if (reduced || !visible) draw(performance.now());
	});
	observer.observe(canvas);

	draw(performance.now());

	return () => {
		running = false;
		cancelIdle();
		cancelAnimationFrame(frame);
		observer.disconnect();
		window.removeEventListener('pointermove', onPointer);
		window.removeEventListener('pointerleave', onLeave);
		document.removeEventListener(THEME_EVENT, onTheme);
		document.removeEventListener('visibilitychange', onVisibility);
		gl.deleteBuffer(buffer);
		gl.deleteProgram(program);
		const ext = gl.getExtension('WEBGL_lose_context');
		ext?.loseContext();
	};
}

async function fetchVitals(): Promise<Vitals | null> {
	try {
		const response = await fetch(vitalsUrl(), { headers: { accept: 'application/json' } });
		if (!response.ok) return null;
		const data: unknown = await response.json();
		const parsed = parseVitals(data);
		if (!parsed) return null;
		writeCachedVitals(parsed);
		return parsed;
	} catch {
		return null;
	}
}

function syncCaption(bpm: number, hrvMs: number, sleep: number): void {
	const line = `resting ${Math.round(bpm)} · hrv ${Math.round(hrvMs)} · sleep ${sleep.toFixed(1)}`;
	document.querySelectorAll<HTMLElement>('[data-bpm]').forEach((node) => {
		node.hidden = false;
		node.textContent = line;
	});
}

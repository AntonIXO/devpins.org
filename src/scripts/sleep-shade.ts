/**
 * Sleep only retints the neuro-field filaments. Index 0 is the field wash
 * (most pixels, and what backdrop-filter cards sample) — leaving it alone
 * keeps page content at the same brightness when last night was short.
 */
export const WASH_STOP = 0;
export const FILAMENT_STOPS = [1, 2, 3] as const;
export const COLOR_COUNT = 4;

export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function sleepDelta(hours: number, ref: number): number {
	return clamp((hours - ref) / 2.4, -1, 1);
}

export function shadeBySleep(colors: number[], delta: number): number[] {
	const out = colors.slice();
	if (delta < 0) {
		const t = -delta;
		for (const i of FILAMENT_STOPS) {
			const k = i === 3 ? t * 0.55 : t * 0.25;
			out[i * 3] *= 1 - k;
			out[i * 3 + 1] *= 1 - k;
			out[i * 3 + 2] *= 1 - k;
		}
		return out;
	}
	for (const i of FILAMENT_STOPS) {
		const k = delta * (i === 3 ? 0.22 : 0.12);
		out[i * 3] += (1 - out[i * 3]) * k;
		out[i * 3 + 1] += (1 - out[i * 3 + 1]) * k * 0.6;
		out[i * 3 + 2] += (1 - out[i * 3 + 2]) * k * 0.6;
	}
	return out;
}

export function paperRgb(theme: 'dark' | 'light'): [number, number, number] {
	return theme === 'light' ? [0.965, 0.94, 0.932] : [0.55, 0.09, 0.28];
}

export function fieldBrightness(
	theme: 'dark' | 'light',
	pulse: number,
	flash: number,
): number {
	return (theme === 'light' ? 0.02 + 0.07 * pulse : 0.02 + 0.1 * pulse) * flash;
}

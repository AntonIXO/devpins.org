import { clamp } from './sleep-shade';

export const DARK_PALETTE = [
	[0.55, 0.09, 0.28],
	[0.14, 0.03, 0.2],
	[0.027, 0.012, 0.051],
	[1.0, 0.855, 0.475],
] as const;

function beat(phase: number, start: number, end: number, amp: number): number {
	if (phase < start || phase > end) return 0;
	const t = (phase - start) / (end - start);
	const env = t < 0.22 ? t / 0.22 : Math.exp(-(t - 0.22) * 11);
	return amp * env;
}

export function cardiac(phase: number): number {
	return Math.max(beat(phase, 0, 0.16, 1), beat(phase, 0.2, 0.34, 0.42));
}

export function hrvAmount(ms: number): number {
	return clamp((ms - 20) / 70, 0, 1);
}


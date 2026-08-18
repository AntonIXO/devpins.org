import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	fieldBrightness,
	paperRgb,
	shadeBySleep,
	sleepDelta,
} from './sleep-shade';

const WASH = [0.55, 0.09, 0.28, 0.14, 0.03, 0.2, 0.027, 0.012, 0.051, 1, 0.855, 0.475];

describe('sleepDelta', () => {
	test('2.6 h against a 7.2 h ref is a full deficit', () => {
		expect(sleepDelta(2.6, 7.2)).toBe(-1);
	});

	test('the ref itself is zero', () => {
		expect(sleepDelta(7.2, 7.2)).toBe(0);
	});
});

describe('shadeBySleep', () => {
	test('a full deficit leaves the wash stop (index 0) untouched', () => {
		const out = shadeBySleep(WASH, -1);
		expect(out.slice(0, 3)).toEqual(WASH.slice(0, 3));
	});

	test('a full deficit darkens the filament stops, not the wash', () => {
		const out = shadeBySleep(WASH, -1);
		expect(out[9]!).toBeLessThan(WASH[9]!);
		expect(out[3]!).toBeLessThan(WASH[3]!);
	});

	test('zero delta is a no-op', () => {
		expect(shadeBySleep(WASH, 0)).toEqual(WASH);
	});
});

describe('paper and brightness stay off the sleep axis', () => {
	test('paperRgb does not take a sleep argument', () => {
		expect(paperRgb('dark')).toEqual([0.55, 0.09, 0.28]);
		expect(paperRgb('light')).toEqual([0.965, 0.94, 0.932]);
	});

	test('fieldBrightness ignores sleep — same pulse/flash is the same value', () => {
		const a = fieldBrightness('dark', 0.4, 0.8);
		const b = fieldBrightness('dark', 0.4, 0.8);
		expect(a).toBe(b);
		expect(a).toBeCloseTo((0.02 + 0.1 * 0.4) * 0.8);
	});
});

describe('public/favicon.svg', () => {
	const svg = readFileSync(join(import.meta.dir, '../../public/favicon.svg'), 'utf8');

	test('is the OH mark, not the Astro logo', () => {
		expect(svg).toContain('stroke="#4ADE80"');
		expect(svg).not.toMatch(/astro|constellation/i);
	});

	test('plate is a full-bleed square (no rx leaking white corners)', () => {
		const plate = svg.match(/<rect\b[^>]*\bwidth="120"[^>]*\bheight="120"[^>]*>/);
		expect(plate).not.toBeNull();
		expect(plate![0]).toMatch(/fill="#0F1211"/);
		expect(plate![0]).not.toMatch(/\brx=/);
	});
});

describe('public/favicon.ico', () => {
	const bytes = readFileSync(join(import.meta.dir, '../../public/favicon.ico'));

	test('is a real ICO, not the stock Astro PNG renamed .ico', () => {
		expect(bytes.subarray(0, 4)).toEqual(Buffer.from([0, 0, 1, 0]));
		expect(bytes.subarray(0, 4)).not.toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
	});
});

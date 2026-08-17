export interface Metric {
	id: string;
	label: string;
	value: string;
	unit: string;
	color: string;
	kind: 'line' | 'bars';
	points: string;
}

export const metrics: Metric[] = [
	{
		id: 'hrv',
		label: 'HRV rMSSD',
		value: '62',
		unit: 'ms',
		color: '#4ade80',
		kind: 'line',
		points: '0,30 18,26 36,33 54,20 72,24 90,14 108,22 126,12 144,18 162,9 180,15 200,7',
	},
	{
		id: 'sleep',
		label: 'Sleep, 7-day mean',
		value: '7.2',
		unit: 'h',
		color: '#60a5fa',
		kind: 'bars',
		points: '',
	},
	{
		id: 'hr',
		label: 'Resting HR',
		value: '49',
		unit: 'bpm',
		color: '#c084fc',
		kind: 'line',
		points: '0,14 20,18 40,12 60,22 80,17 100,26 120,20 140,30 160,24 180,32 200,28',
	},
	{
		id: 'km',
		label: 'Weekly mileage',
		value: '54',
		unit: 'km',
		color: '#facc15',
		kind: 'line',
		points: '0,36 25,32 50,34 75,25 100,27 125,18 150,21 175,12 200,8',
	},
];

export const primaryMetric = metrics[0];

export const FALLBACK_RESTING_HR = 49;
export const FALLBACK_HRV = 62;
export const FALLBACK_SLEEP_HOURS = 7.2;

export interface Vitals {
	bpm: number;
	hrv: number;
	sleepHours: number;
	asOf: string | null;
	source: 'optihealth' | 'fallback';
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | null {
	for (const key of keys) {
		const value = Number(record[key]);
		if (Number.isFinite(value)) return value;
	}
	return null;
}

export function parseVitals(data: unknown): Vitals | null {
	if (!data || typeof data !== 'object') return null;
	const record = data as Record<string, unknown>;
	const bpm = readNumber(record, ['bpm']);
	if (bpm == null || bpm < 20 || bpm > 220) return null;
	const hrv = readNumber(record, ['hrv', 'hrvRmssd', 'rmssd']) ?? FALLBACK_HRV;
	const sleepHours =
		readNumber(record, ['sleepHours', 'sleep', 'sleepH']) ?? FALLBACK_SLEEP_HOURS;
	if (hrv < 5 || hrv > 250) return null;
	if (sleepHours < 1 || sleepHours > 16) return null;
	const source = record.source === 'optihealth' ? 'optihealth' : 'fallback';
	const asOf = typeof record.asOf === 'string' ? record.asOf : null;
	return { bpm, hrv, sleepHours, asOf, source };
}

export const FALLBACK_VITALS: Vitals = {
	bpm: FALLBACK_RESTING_HR,
	hrv: FALLBACK_HRV,
	sleepHours: FALLBACK_SLEEP_HOURS,
	asOf: null,
	source: 'fallback',
};

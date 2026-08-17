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

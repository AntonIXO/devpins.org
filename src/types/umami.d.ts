interface UmamiPayload {
	website?: string;
	hostname?: string;
	screen?: string;
	language?: string;
	title?: string;
	url?: string;
	referrer?: string;
	tag?: string;
	name?: string;
	data?: Record<string, unknown>;
	[key: string]: unknown;
}

interface UmamiTracker {
	track: {
		(payload?: UmamiPayload | ((props: UmamiPayload) => UmamiPayload)): Promise<void>;
		(eventName: string, eventData?: Record<string, unknown>): Promise<void>;
	};
	identify: (data: Record<string, unknown> | string) => Promise<void>;
	getSession?: () => { cache?: string; website?: string };
}

declare global {
	interface Window {
		umami?: UmamiTracker;
	}
}

export {};

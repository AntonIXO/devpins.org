import type { APIRoute } from 'astro';
import { FALLBACK_VITALS, parseVitals, type Vitals } from '../../data/metrics';

function json(body: Vitals, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=60',
		},
	});
}

export const GET: APIRoute = async () => {
	const upstream = import.meta.env.PUBLIC_VITALS_URL;
	if (typeof upstream === 'string' && upstream.length > 0) {
		try {
			const response = await fetch(upstream, { headers: { accept: 'application/json' } });
			if (response.ok) {
				const parsed = parseVitals(await response.json());
				if (parsed) return json({ ...parsed, source: 'optihealth' });
			}
		} catch {
			// stay on fallback
		}
	}
	return json(FALLBACK_VITALS);
};

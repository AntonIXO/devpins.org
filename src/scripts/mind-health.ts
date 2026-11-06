import { FALLBACK_VITALS, parseVitals, type Vitals } from '../data/metrics';
import { DARK_PALETTE, LIGHT_PALETTE, cardiac, hrvAmount } from './health-visual';
import { shadeBySleep, sleepDelta } from './sleep-shade';
import { FALLBACK_SLEEP_HOURS } from '../data/metrics';

export { cardiac };
export function healthStyle(vitals: Vitals, theme: 'dark' | 'light' = 'dark') {
 const colors = shadeBySleep((theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE).flat(), sleepDelta(vitals.sleepHours, FALLBACK_SLEEP_HOURS));
 return { tone: hrvAmount(vitals.hrv), rest: sleepDelta(vitals.sleepHours, FALLBACK_SLEEP_HOURS),
  middle: colors.slice(6, 9), low: colors.slice(3, 6), high: colors.slice(9, 12), wash: colors.slice(0, 3) };
}

export function watchMindVitals(update: (v: Vitals, cached: boolean) => void) {
 let disposed = false;
 let current = FALLBACK_VITALS;
 try { current = parseVitals(JSON.parse(sessionStorage.getItem('devpins-vitals') ?? 'null')) ?? current; } catch {}
 update(current, current.source !== 'fallback');
 async function refresh() {
  try {
   const response = await fetch(import.meta.env.PUBLIC_VITALS_URL || '/api/vitals.json', {
    headers: {accept: 'application/json'}, cache: 'no-cache', signal: AbortSignal.timeout(8000),
   });
   if (!response.ok) throw new Error('Vitals unavailable');
   const next = parseVitals(await response.json());
   if (!next) throw new Error('Invalid vitals');
   if (disposed) return;
   // A fallback response must not overwrite a previously received optiHealth snapshot.
   if (next.source === 'fallback' && current.source === 'optihealth') { update(current, true); return; }
   current = next;
   try { sessionStorage.setItem('devpins-vitals', JSON.stringify(next)); } catch {}
   update(next, false);
  } catch { if (!disposed) update(current, true); }
 }
 void refresh();
 const timer = setInterval(() => {if (!document.hidden) void refresh();}, 60_000);
 return () => {disposed = true; clearInterval(timer);};
}

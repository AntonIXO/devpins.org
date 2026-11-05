import { describe, expect, test } from 'bun:test';
import { healthStyle, cardiac } from './mind-health';
import { FALLBACK_VITALS } from '../data/metrics';
describe('health-driven scene', () => {
 test('sleep retints filaments but preserves background wash and HRV flow', () => {
  const rested=healthStyle({...FALLBACK_VITALS,sleepHours:8});
  const tired=healthStyle({...FALLBACK_VITALS,sleepHours:4});
  expect(tired.wash).toEqual(rested.wash);
  expect(tired.tone).toBe(rested.tone);
  expect(tired.high[0]).toBeLessThan(rested.high[0]);
 });
 test('HRV flow is bounded without changing sleep palette', () => {
  const low=healthStyle({...FALLBACK_VITALS,hrv:5});
  const high=healthStyle({...FALLBACK_VITALS,hrv:250});
  expect(low.tone).toBe(0);expect(high.tone).toBe(1);
  expect(low.high).toEqual(high.high);
 });
 test('cardiac envelope has two bounded pulses and a quiet interval', () => {
  expect(cardiac(.035)).toBeGreaterThan(.9);
  expect(cardiac(.23)).toBeGreaterThan(.3);
  expect(cardiac(.6)).toBe(0);
  for(let p=0;p<1;p+=.001){expect(cardiac(p)).toBeGreaterThanOrEqual(0);expect(cardiac(p)).toBeLessThanOrEqual(1);}
 });
});

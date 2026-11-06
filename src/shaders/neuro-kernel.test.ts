import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
const source = (path:string) => readFileSync(new URL(path,import.meta.url),'utf8');
test('homepage and cortex use the same Neuro Noise recurrence without a stale generated copy',()=>{
 const kernel=source('./neuro-kernel.glsl').trim();
 expect(source('./neuro-noise.frag')).toContain('// @neuro-kernel');
 expect(source('./neuro-noise.frag')).toContain('palette(neuroField(p, t, u_intensity, u_paramA, u_seed))');
 expect(source('./cortex.source.glsl')).toContain('// @neuro-kernel');
 expect(source('./cortex.glsl')).toContain(kernel);
 expect(source('../../assets/mind/shader-preview.glsl')).toContain(kernel);
});

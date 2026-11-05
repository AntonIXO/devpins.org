import { expect, test } from 'bun:test';
import { cvProjects, cvLinks } from './cv';
import { cvRegionProjects, mindZones, cvSummary } from './mind';
import { youtubeEmbed, inlineCvParts } from './cv-media';

test('every CV project appears in exactly one existing brain region', () => {
 const assigned=Object.values(cvRegionProjects).flat();
 expect(assigned.length).toBe(new Set(assigned).size);
 expect([...assigned].sort()).toEqual(cvProjects.map(p=>p.id).sort());
 expect(Object.keys(cvRegionProjects).sort()).toEqual(mindZones.map(z=>z.id).sort());
 expect(cvLinks.length).toBe(4);
});
test('video embed keeps the CV video ID and timestamp, rejects unrelated origins',()=>{
 const href=cvProjects.find(p=>p.id==='firmware')!.href!;
 expect(youtubeEmbed(href)).toBe('https://www.youtube-nocookie.com/embed/YW6hTkQDYFQ?start=1&rel=0');
 expect(youtubeEmbed('https://youtu.be/YW6hTkQDYFQ?t=1m12s')).toContain('start=72');
 expect(youtubeEmbed('https://youtube.com.attacker.test/watch?v=YW6hTkQDYFQ')).toBeNull();
});
test('inline CV sources stay clickable without HTML injection',()=>{
 expect(inlineCvParts('With Yuri Rykov (scholar profile).')[1].href).toContain('scholar.google.com');
 expect(inlineCvParts('Community: https://4pda.to/forum/index.php?showuser=5432820#')[1].href).toContain('showuser=5432820');
 expect(inlineCvParts('<img src=x onerror=alert(1)>')[0].href).toBeNull();
});

test('single summary covers every project and supporting CV section once',()=>{
 const ids=cvSummary.map(e=>e.id);
 expect(ids.length).toBe(new Set(ids).size);
 for(const p of cvProjects)expect(ids).toContain(p.id);
 for(const id of ['education','skills','sport','awards','about'])expect(ids).toContain(id);
});

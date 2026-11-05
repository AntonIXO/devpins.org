import { mindZones, cvRegionProjects, cvSummary } from '../data/mind';

export function mountMindCv() {
 const entries=[...document.querySelectorAll<HTMLElement>('[data-cv-entry]')];
 const jump=document.querySelector<HTMLAnchorElement>('#selected-jump')!;
 const selection=document.querySelector<HTMLElement>('#selection')!;
 function stopEmbeds() {
  document.querySelectorAll('.cv-embed').forEach(embed=>{
   embed.querySelector('iframe')?.remove();
   const button=embed.querySelector<HTMLButtonElement>('.embed-load');if(button)button.hidden=false;
  });
 }
 function select(id:string,scroll=false,writeHash=true) {
  const entry=cvSummary.find(e=>e.id===id);if(!entry)return;
  stopEmbeds();entries.forEach(node=>{node.hidden=node.dataset.cvEntry!==id;});
  document.querySelectorAll('[data-entry]').forEach(a=>{
   if((a as HTMLElement).dataset.entry===id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');
  });
  jump.textContent=`${entry.label} ↓`;document.body.dataset.activeRegion=entry.region;
  document.body.dataset.activeEntry=id;
  if(writeHash)history.replaceState(null,'',`#entry-${id}`);
  document.dispatchEvent(new CustomEvent('mind:region',{detail:mindZones.findIndex(z=>z.id===entry.region)}));
  if(scroll){selection.scrollIntoView({behavior:'auto',block:'start'});document.querySelector<HTMLElement>(`#title-${id}`)?.focus({preventScroll:true});}
 }
 document.querySelectorAll<HTMLAnchorElement>('[data-entry]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();select(a.dataset.entry!,true);}));
 document.addEventListener('mind:open',((e:CustomEvent<number>)=>{
  const region=mindZones[e.detail]?.id;if(region)select(cvRegionProjects[region][0]);
 }) as EventListener);
 document.addEventListener('click',e=>{
  const button=(e.target as HTMLElement).closest<HTMLButtonElement>('.embed-load');if(!button)return;
  const embed=button.closest<HTMLElement>('[data-embed]')!;
  const frame=document.createElement('iframe');frame.src=embed.dataset.embed!;frame.title=embed.dataset.embedTitle!;
  frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='fullscreen; picture-in-picture; encrypted-media';frame.allowFullscreen=true;
  frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-presentation');
  embed.querySelector('.embed-slot')!.append(frame);button.hidden=true;
 });
 function fromHash(){const id=location.hash.replace('#entry-','');
  const oldRegion=location.hash.replace('#region-','');
  const resolved=cvSummary.some(e=>e.id===id)?id:cvRegionProjects[oldRegion]?.[0];
  if(resolved)select(resolved,false,false);else if(!document.body.dataset.activeEntry)select('sensorlm',false,false);
 }
 window.addEventListener('hashchange',fromHash);fromHash();
}

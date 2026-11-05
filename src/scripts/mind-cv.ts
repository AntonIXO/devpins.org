import { mindZones, cvRegionProjects, cvSummary } from '../data/mind';

export function mountMindCv() {
 const entries=[...document.querySelectorAll<HTMLElement>('[data-cv-entry]')];
 const reader=document.querySelector<HTMLElement>('#selected-content')!;
 const previous=document.querySelector<HTMLButtonElement>('#page-prev')!;
 const next=document.querySelector<HTMLButtonElement>('#page-next')!;
 const count=document.querySelector<HTMLOutputElement>('#page-count')!;
 const index=document.querySelector<HTMLDetailsElement>('#summary-toggle')!;
 const mobile=matchMedia('(max-width: 720px)');
 index.open=!mobile.matches;
 mobile.addEventListener('change',()=>{index.open=!mobile.matches;});
 let page=0,pages=1;
 let resizeFrame=0;
 const originalTabindex=new WeakMap<HTMLElement,string|null>();
 function current(){return entries.find(node=>!node.hidden)!;}
 function showPage(value:number){
  page=Math.max(0,Math.min(value,pages-1));
  const active=current();if(!active)return;
  active.style.transform=`translateX(${-page*(reader.clientWidth+32)}px)`;
  reader.scrollLeft=0;reader.scrollTop=0;
  count.value=`${page+1} / ${pages}`;previous.disabled=page===0;next.disabled=page===pages-1;
  const bounds=reader.getBoundingClientRect();
  active.querySelectorAll<HTMLElement>('a,button,iframe').forEach(el=>{
   if(!originalTabindex.has(el))originalTabindex.set(el,el.getAttribute('tabindex'));
   const rect=el.getBoundingClientRect();
   if(rect.left<bounds.left-1||rect.left>=bounds.right-1)el.setAttribute('tabindex','-1');
   else {const saved=originalTabindex.get(el);if(saved===null)el.removeAttribute('tabindex');else if(saved!==undefined)el.setAttribute('tabindex',saved);}
  });
 }
 function paginate(){
  cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{
   reader.style.setProperty('--reader-width',`${reader.clientWidth}px`);
   reader.style.setProperty('--reader-height',`${reader.clientHeight}px`);
   const active=current();if(!active)return;
   pages=Math.max(1,Math.ceil((active.scrollWidth+32)/(reader.clientWidth+32)));
   showPage(page);
  });
 }
 previous.addEventListener('click',()=>showPage(page-1));next.addEventListener('click',()=>showPage(page+1));
 new ResizeObserver(paginate).observe(reader);
 reader.addEventListener('load',paginate,true);
 void document.fonts.ready.then(paginate);
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
  page=0;current().style.transform='translateX(0)';paginate();
  document.body.dataset.activeRegion=entry.region;
  document.body.dataset.activeEntry=id;
  if(writeHash)history.replaceState(null,'',`#entry-${id}`);
  document.dispatchEvent(new CustomEvent('mind:region',{detail:mindZones.findIndex(z=>z.id===entry.region)}));
  if(mobile.matches)index.open=false;
  if(scroll)selection.focus({preventScroll:true});
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
  embed.querySelector('.embed-slot')!.append(frame);button.hidden=true;paginate();
 });
 function fromHash(){const id=location.hash.replace('#entry-','');
  const oldRegion=location.hash.replace('#region-','');
  const resolved=cvSummary.some(e=>e.id===id)?id:cvRegionProjects[oldRegion]?.[0];
  if(resolved)select(resolved,false,false);else if(!document.body.dataset.activeEntry)select('sensorlm',false,false);
 }
 window.addEventListener('hashchange',fromHash);fromHash();
}

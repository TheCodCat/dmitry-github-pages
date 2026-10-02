const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function fitHero(){document.documentElement.style.setProperty('--hero-scale',Math.min(innerWidth,440)/440)}fitHero();addEventListener('resize',fitHero);
for(const track of document.querySelectorAll('.track')){
 const buttons=[...document.querySelectorAll(`[data-scroll="${track.id}"]`)];
 const status=document.getElementById(`${track.id}-status`);
 function index(){const padding=parseFloat(getComputedStyle(track).paddingLeft);let closest=0,best=Infinity;[...track.children].forEach((el,i)=>{const d=Math.abs(el.getBoundingClientRect().left-track.getBoundingClientRect().left-padding);if(d<best){best=d;closest=i}});return closest}
 function sync(){status.textContent=`${index()+1} / ${track.children.length}`;buttons.forEach(b=>b.disabled=Number(b.dataset.direction)<0?track.scrollLeft<2:track.scrollLeft>=track.scrollWidth-track.clientWidth-2)}
 function move(d){const next=track.children[Math.max(0,Math.min(track.children.length-1,index()+d))];const dx=next.getBoundingClientRect().left-track.getBoundingClientRect().left-parseFloat(getComputedStyle(track).paddingLeft);track.scrollBy({left:dx,behavior:reduced?'instant':'smooth'})}
 buttons.forEach(b=>b.addEventListener('click',()=>move(Number(b.dataset.direction))));
 track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 track.addEventListener('scroll',sync,{passive:true});new ResizeObserver(sync).observe(track);sync();
}
const viewer=document.getElementById('viewer'),photo=document.getElementById('viewer-image'),caption=document.getElementById('viewer-caption');
for(const b of document.querySelectorAll('.zoom'))b.addEventListener('click',()=>{photo.src=b.dataset.image;photo.alt=b.dataset.caption;caption.textContent=b.dataset.caption;viewer.showModal()});
viewer.querySelector('.close').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer){const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close()}});
// Start only when the cover is ready, including slow connections and cache hits.
const cover=document.querySelector('.hero-art');
if(cover&&!reduced){
 const reveal=()=>document.querySelector('.hero').classList.add('motion-ready');
 if(cover.complete&&cover.naturalWidth)reveal();
 else cover.addEventListener('load',reveal,{once:true});
}
const futureSection=document.querySelector('.future');
if(futureSection&&!reduced&&'IntersectionObserver' in window){
 const futureObserver=new IntersectionObserver(entries=>{
  if(entries.some(entry=>entry.isIntersecting)){
   futureSection.classList.add('is-visible');
   futureObserver.disconnect();
  }
 },{threshold:.35});
 futureSection.classList.add('scroll-reveal');
 futureObserver.observe(futureSection);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{
  if(event.matches){futureSection.classList.add('is-visible');futureObserver.disconnect()}
 });
}
// Type the statement once on scroll; keep complete text available to screen readers.
const statement=document.querySelector('.statement');
if(statement&&!reduced&&'IntersectionObserver' in window){
 const groups=[];
 const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('ru',{granularity:'grapheme'}):null;
 for(const element of statement.querySelectorAll('h2,p')){
  const fullText=element.textContent;
  const visual=document.createElement('span');visual.setAttribute('aria-hidden','true');
  while(element.firstChild)visual.append(element.firstChild);
  const accessible=document.createElement('span');accessible.className='visually-hidden';accessible.textContent=fullText;
  element.append(accessible,visual);
  const walker=document.createTreeWalker(visual,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  const chars=[];
  for(const node of nodes){
   const fragment=document.createDocumentFragment();
   const letters=segmenter?[...segmenter.segment(node.textContent)].map(x=>x.segment):Array.from(node.textContent);
   for(const letter of letters){const span=document.createElement('span');span.className='type-char';span.textContent=letter;fragment.append(span);chars.push(span)}
   node.replaceWith(fragment);
  }
  groups.push(chars);
 }
 statement.classList.add('typewriter-ready');
 let frame=0,started=false,cursor=null;const revealed=groups.map(()=>0);
 function finish(){cancelAnimationFrame(frame);statement.classList.remove('typewriter-ready');if(cursor)cursor.classList.remove('type-cursor');observer.disconnect()}
 function start(){
  if(started)return;started=true;observer.disconnect();let origin;
  function tick(now){
   origin??=now;const elapsed=now-origin;
   if(cursor)cursor.classList.remove('type-cursor');cursor=null;
   groups.forEach((chars,index)=>{
    const progress=Math.max(0,Math.min(1,(elapsed-(index===0?0:1100))/(index===0?900:3600)));
    const count=Math.floor(chars.length*progress);
    for(let i=revealed[index];i<count;i++)chars[i].classList.add('is-typed');
    revealed[index]=count;
    if(count>0)cursor=chars[count-1];
   });
   if(elapsed>=4700){finish();return}
   if(cursor)cursor.classList.add('type-cursor');frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
 }
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))start()},{threshold:.3});
 observer.observe(statement);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches)finish()});
}

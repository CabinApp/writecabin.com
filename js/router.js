import {PageScope} from './page-scope.js';
import {routeMap} from './routes.js';

const cache=new Map(),scripts=new Map(),scrolls=new Map();
let scope,sequence=0,currentKey=history.state?.cabinKey||crypto.randomUUID(),currentPage=document.body.dataset.page;
let currentURL=location.href;
history.scrollRestoration='manual';
history.replaceState({...history.state,cabinKey:currentKey},'',location.href);

function clean(input){
 const url=new URL(input,location.href);
 if(url.origin!==location.origin)return url;
 const legacy=url.searchParams.get('page');
 if((url.pathname==='/'||url.pathname==='/index.html')&&['home','about','blog','philosophy','roadmap'].includes(legacy)){
  url.pathname=legacy==='home'?'/':'/'+legacy;url.searchParams.delete('page');
 }
 if(['/blog','/blog/','/blog.html'].includes(url.pathname)&&url.searchParams.has('post')){
  url.pathname='/blog/'+encodeURIComponent(url.searchParams.get('post'));url.searchParams.delete('post');
 }
 url.pathname=url.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'');
 if(url.pathname!=='/')url.pathname=url.pathname.replace(/\/+$/,'');
 return url;
}
function resolve(url){return routeMap[url.pathname]||{page:'404',source:'/404.html'};}
async function html(source){
 if(cache.has(source))return cache.get(source);
 const response=await fetch(source,{credentials:'same-origin'});
 if(!response.ok)throw new Error('Page unavailable');
 const text=await response.text();cache.set(source,text);
 if(cache.size>10)cache.delete(cache.keys().next().value);
 return text;
}
function external(src){
 src=src.replace('gsap@3.12.5','gsap@3.13.0');
 if(scripts.has(src))return scripts.get(src);
 const promise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=src;script.dataset.cabinRuntime='';
  script.onload=resolve;script.onerror=()=>reject(new Error('Script unavailable'));document.head.append(script);
 });
 scripts.set(src,promise);return promise;
}
async function mountScripts(doc,token){
 const items=[...doc.querySelector('template[data-page-scripts]')?.content.querySelectorAll('script')||[]];
 for(const item of items){
  if(token!==sequence)return;
  const src=new URL(item.getAttribute('src'),location.origin).href;
  try{
   if(item.type==='module'){
    const module=await import(src);
    if(token===sequence&&module.mount)await module.mount(scope);
   }else if(new URL(src).origin!==location.origin){await external(src);}
   else{
    await external(src);
    if(token!==sequence)return;
    const key=src.endsWith('/script.js')?'shared':src.endsWith('/experiences.js')?'experiences':null;
    if(key){
     let pending;
     if(window.gsap){scope.context ||= gsap.context(()=>{});scope.context.add(()=>{pending=window.CabinPageScripts[key](scope)});}
     else pending=window.CabinPageScripts[key](scope);
     await pending;
    }
   }
  }catch(error){
   if(token===sequence&&scope?.active)console.warn('Cabin kept the readable page available.',error.message);
  }
 }
}
async function styles(doc){
 const desired=[...doc.querySelectorAll('link[rel="stylesheet"]')].map(link=>new URL(link.getAttribute('href'),location.origin).href);
 const waits=[];
 for(const href of desired){
  if([...document.querySelectorAll('link[rel="stylesheet"]')].some(link=>link.href===href))continue;
  waits.push(new Promise(resolve=>{
   const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.cabinPageStyle='';
   link.onload=resolve;link.onerror=resolve;document.head.append(link);setTimeout(resolve,4000);
  }));
 }
 await Promise.all(waits);
 return ()=>document.querySelectorAll('link[rel="stylesheet"]').forEach(link=>{if(!desired.includes(link.href))link.remove()});
}
function metadata(doc,url){
 document.title=doc.title;
 document.querySelectorAll('meta[name="description"],meta[name="robots"],meta[property^="og:"],link[rel="canonical"]').forEach(el=>el.remove());
 doc.querySelectorAll('meta[name="description"],meta[name="robots"],meta[property^="og:"],link[rel="canonical"]').forEach(el=>document.head.append(document.importNode(el,true)));
 const canonical=document.querySelector('link[rel="canonical"]');
 if(canonical)canonical.href=location.origin+url.pathname;
}
function place(url,y=0){
 if(url.hash){
  const id=decodeURIComponent(url.hash.slice(1)),target=document.getElementById(id);
  if(target){target.scrollIntoView({behavior:'instant'});return;}
 }
 window.scrollTo({top:y,left:0,behavior:'instant'});
}
async function navigate(input,{replace=false,pop=false,initial=false}={}){
 const url=clean(input),record=resolve(url),token=++sequence;
 if(!initial&&(record.page==='roadmap'||currentPage==='roadmap')){
  // Roadmap owns its long-running world and Lenis loop; preserve that native lifecycle.
  location.assign(url.href);return;
 }
 if(!pop&&!initial)scrolls.set(currentKey,scrollY);
 const nextKey=pop?(history.state?.cabinKey||crypto.randomUUID()):initial?currentKey:crypto.randomUUID();
 try{
  const source=initial?null:await html(record.source);
  if(token!==sequence)return;
  const doc=source?new DOMParser().parseFromString(source,'text/html'):document;
  const trimStyles=source?await styles(doc):()=>{};
  if(token!==sequence)return;
  scope?.cleanup();scope=null;
  if(source){
   const body=document.importNode(doc.body,true);
   body.querySelectorAll(':scope > script').forEach(script=>script.remove());
   document.body.replaceWith(body);
   document.documentElement.className='';
   document.documentElement.style.scrollBehavior='';
   trimStyles();metadata(doc,url);
  }
  if(!pop){
   const method=replace||initial?'replaceState':'pushState';
   history[method]({cabinKey:nextKey},'',url.href);
  }
  currentKey=nextKey;currentURL=url.href;currentPage=record.page;
  document.body.classList.add('ready');
  if(record.page!=='roadmap'){
   scope=new PageScope();
   await mountScripts(doc,token);
  }
  if(token!==sequence)return;
  window.ScrollTrigger?.refresh();
  place(url,pop?(scrolls.get(currentKey)||0):initial?scrollY:0);
  if(!initial){
   const main=document.querySelector('main');main?.setAttribute('tabindex','-1');main?.focus({preventScroll:true});
  }
 }catch{
  if(token===sequence){if(initial)document.body.classList.add('ready');else location.assign(url.href);}
 }
}
window.CabinRouter={navigate,clean};
document.addEventListener('click',event=>{
 const back=event.target.closest?.('[data-router-back]');
 if(back){if(history.length>1)history.back();else navigate('/');return;}
 const link=event.target.closest?.('a[href]');
 if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('download'))return;
 const url=clean(link.href);
 if(url.origin!==location.origin||/\.(?!html(?:$|\?))[a-z0-9]+$/i.test(url.pathname))return;
 if(url.pathname===location.pathname&&url.search===location.search&&url.hash)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(url.href===location.href){place(url);return;}
 navigate(url);
},true);
document.addEventListener('pointerover',event=>{
 const link=event.target.closest?.('a[href]');if(!link||link.target==='_blank')return;
 const url=clean(link.href);if(url.origin!==location.origin)return;
 const route=routeMap[url.pathname];if(route&&route.page!=='roadmap')html(route.source).catch(()=>{});
},{passive:true});
window.addEventListener('scroll',()=>scrolls.set(currentKey,scrollY),{passive:true});
window.addEventListener('popstate',()=>navigate(location.href,{pop:true}));
const first=clean(location.href);
const firstRecord=resolve(first);
if(firstRecord.page!==document.body.dataset.page){
 navigate(first,{replace:true});
}else{
 navigate(first,{replace:true,initial:true});
}

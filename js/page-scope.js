/* Resource ownership for legacy page code during client-side navigation. */
export class PageScope {
 constructor(){
  this.active=true;this.body=document.body;this.controller=new AbortController();
  this.cleanups=[];this.frames=new Set();this.timers=new Set();this.intervals=new Set();
  const scope=this;
  const frame=fn=>{const id=requestAnimationFrame(time=>{scope.frames.delete(id);if(scope.active)fn(time)});scope.frames.add(id);return id;};
  const timeout=(fn,ms,...args)=>{const id=setTimeout(()=>{scope.timers.delete(id);if(scope.active)fn(...args)},ms);scope.timers.add(id);return id;};
  const interval=(fn,ms,...args)=>{const id=setInterval(()=>{if(scope.active)fn(...args)},ms);scope.intervals.add(id);return id;};
  const observer=Base=>class extends Base{constructor(fn,options){super((...args)=>{if(scope.active)fn(...args)},options);scope.onCleanup(()=>this.disconnect())}};
  this.env={
   addEventListener:(...args)=>this.listen(window,...args),
   removeEventListener:window.removeEventListener.bind(window),
   requestAnimationFrame:frame,cancelAnimationFrame:id=>{this.frames.delete(id);cancelAnimationFrame(id)},
   setTimeout:timeout,clearTimeout:id=>{this.timers.delete(id);clearTimeout(id)},
   setInterval:interval,clearInterval:id=>{this.intervals.delete(id);clearInterval(id)},
   fetch:(url,options={})=>fetch(url,{...options,signal:this.controller.signal}),
   IntersectionObserver:observer(IntersectionObserver),
   ResizeObserver:observer(ResizeObserver),MutationObserver:observer(MutationObserver)
  };
  this.env.window=new Proxy(window,{get(target,key){
   if(key in scope.env)return scope.env[key];
   const value=Reflect.get(target,key);return typeof value==='function'&&!/^[A-Z]/.test(String(key))?value.bind(target):value;
  }});
  this.env.document=new Proxy(document,{get(target,key){
   if(key==='body')return scope.body;
   if(key==='addEventListener')return (...args)=>scope.listen(document,...args);
   if(!scope.active&&(key==='querySelector'||key==='querySelectorAll'))return scope.body[key].bind(scope.body);
   const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;
  },set(target,key,value){if(scope.active)Reflect.set(target,key,value);return true}});
 }
 listen(target,type,listener,options={}){
  const settings=typeof options==='boolean'?{capture:options}:options;
  target.addEventListener(type,listener,{...settings,signal:this.controller.signal});
 }
 onCleanup(fn){this.cleanups.push(fn)}
 cleanup(){
  if(!this.active)return;this.active=false;this.controller.abort();
  this.frames.forEach(cancelAnimationFrame);this.timers.forEach(clearTimeout);this.intervals.forEach(clearInterval);
  this.cleanups.reverse().forEach(fn=>{try{fn()}catch{}});
  this.context?.revert();
  window.ScrollTrigger?.getAll().forEach(trigger=>trigger.kill());
 }
}

import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';

export async function mount(scope) {
 const root=document.querySelector('[data-maker-desk]');
 if(!root)return;
 const host=root.querySelector('[data-maker-desk-world]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||new URLSearchParams(location.search).has('reduced-motion');
 let renderer,model,trigger,frame=0,observer,resizeObserver,disposed=false;
 const textures=[],materials=[];
 scope.onCleanup(()=>{
   disposed=true;cancelAnimationFrame(frame);trigger?.kill();observer?.disconnect();resizeObserver?.disconnect();
   textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());
   model?.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [].concat(o.material))m.dispose();}});
   renderer?.dispose();renderer?.forceContextLoss();
 });
 const fallback=()=>{
   root.classList.remove('is-live');root.classList.add('is-static');
   root.querySelector('[data-desk-instruction]').textContent='Three practices, one desk. Read the notes below.';
 };
 function canvasTexture(w,h,paint){
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   paint(canvas.getContext('2d'),w,h);
   const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.flipY=false;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(t);return t;
 }
 function lines(ctx,text,x,y,width,lineHeight){
   let line='';for(const word of text.split(' ')){
     const test=line+word+' ';if(ctx.measureText(test).width>width&&line){ctx.fillText(line.trim(),x,y);y+=lineHeight;line=word+' ';}else line=test;
   }ctx.fillText(line.trim(),x,y);return y+lineHeight;
 }
 try{
   renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.4:1.7));
   renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
   const scene=new T.Scene();scene.background=new T.Color(0xedf1e9);
   scene.add(new T.HemisphereLight(0xfffaeb,0x64735e,2.7));
   const sun=new T.DirectionalLight(0xfff4db,3);sun.position.set(-4,8,5);scene.add(sun);
   model=(await new GLTFLoader().loadAsync('/assets/nordic/maker-desk.glb')).scene;
   if(!scope.active){model.traverse(o=>o.geometry?.dispose());return;}
   await document.fonts.ready;if(!scope.active)return;
   scene.add(model);
   const notebook=canvasTexture(1024,1280,(ctx,w,h)=>{
     ctx.fillStyle='#fcfbef';ctx.fillRect(0,0,w,h);
     ctx.strokeStyle='#d8e2d2';ctx.lineWidth=2;
     for(let y=160;y<h-45;y+=61){ctx.beginPath();ctx.moveTo(45,y);ctx.lineTo(w-45,y);ctx.stroke();}
     ctx.strokeStyle='#d8b5a3';ctx.beginPath();ctx.moveTo(92,35);ctx.lineTo(92,h-35);ctx.stroke();
     ctx.fillStyle='#5a7056';ctx.font='600 27px Geist, sans-serif';ctx.fillText('01 / STUDENT',135,100);
     ctx.fillStyle='#2f4334';ctx.font='52px Lora, Georgia, serif';
     let y=lines(ctx,'Learning in public.',135,230,755,65);
     ctx.font=(innerWidth<760?'42':'36')+'px Lora, Georgia, serif';
     y=lines(ctx,'Cabin is being shaped while I am still learning.',135,y+76,750,61);
     y=lines(ctx,'Research. Prototypes. Wrong turns. Better questions before more code.',135,y+61,750,61);
     ctx.font='italic 33px Lora, Georgia, serif';lines(ctx,'A work in progress. Much like its maker.',135,y+85,735,58);
     ctx.font='24px Geist, sans-serif';ctx.fillStyle='#72816b';ctx.fillText('Rishit Choudhary',135,h-60);
   });
   const laptop=canvasTexture(1440,900,(ctx,w,h)=>{
     ctx.fillStyle='#f4f6ef';ctx.fillRect(0,0,w,h);
     ctx.fillStyle='#dce5d5';ctx.fillRect(0,0,w,65);
     for(let i=0;i<3;i++){ctx.fillStyle=['#8b9d80','#aab49a','#c1c9b5'][i];ctx.beginPath();ctx.arc(35+i*27,32,7,0,Math.PI*2);ctx.fill();}
     ctx.fillStyle='#4f634a';ctx.font='24px Geist, sans-serif';ctx.fillText('Cabin / About the developer',170,42);
     if(innerWidth<760){
       ctx.fillStyle='#2e4131';ctx.font='38px Geist, sans-serif';ctx.fillText('02 / SOLO DEVELOPER',80,155);
       ctx.font='72px Lora, Georgia, serif';ctx.fillText('One pair of hands.',80,280);
       ctx.font='60px Geist, sans-serif';
       let y=lines(ctx,'I design the Cabin interface, define its file model and build it myself.',80,405,1280,72);
       lines(ctx,'A calmer place to write, shaped by one developer.',80,y+50,1280,72);
       ctx.fillStyle='#67805a';ctx.font='36px Geist, sans-serif';ctx.fillText('Rishit Choudhary / Building Cabin',80,830);
       return;
     }
     ctx.fillStyle='#e6ecde';ctx.fillRect(0,65,285,h-65);
     ctx.font='25px Geist, sans-serif';ctx.fillStyle='#52664b';
     ['PROFILE','Product thinking','Interface design','File model','Workflows'].forEach((t,i)=>ctx.fillText(t,35,140+i*77));
     ctx.fillStyle='#2e4131';ctx.font='26px Geist, sans-serif';ctx.fillText('02 / SOLO DEVELOPER',345,151);
     ctx.font='57px Lora, Georgia, serif';let y=lines(ctx,'One pair of hands.',345,255,990,68);
     ctx.font='32px Geist, sans-serif';
     y=lines(ctx,'I design the interface, define the file model and build the product myself.',345,y+65,965,49);
     y=lines(ctx,'Every decision stays close to the reason Cabin exists: a calmer place to write.',345,y+40,965,49);
     ctx.fillStyle='#67805a';ctx.font='26px Geist, sans-serif';ctx.fillText('Rishit Choudhary  /  Building Cabin',345,805);
   });
   const typed=canvasTexture(1120,1000,(ctx,w,h)=>{
     ctx.fillStyle='#fffdf2';ctx.fillRect(0,0,w,h);
     ctx.fillStyle='#405040';ctx.font='27px monospace';ctx.fillText('03 / WRITER',100,95);
     ctx.font='48px monospace';let y=lines(ctx,'Still finding the sentences.',100,195,925,59);
     ctx.font=(innerWidth<760?'40':'32')+'px monospace';y=lines(ctx,'I have not published anything major. I simply like writing.',100,y+57,915,49);
     y=lines(ctx,'A thought can disappear when the software around it becomes louder than the page.',100,y+40,915,49);
     ctx.font='italic 30px monospace';lines(ctx,'The voice stays human.',100,y+58,900,47);
     ctx.font='24px monospace';ctx.fillText('Rishit',100,920);
   });
   for(const [name,map] of [['NotebookPage',notebook],['LaptopScreen',laptop],['TypewriterPage',typed]]){
     const surface=model.getObjectByName(name);if(!surface)throw new Error('Missing desk surface');
     const m=new T.MeshBasicMaterial({map,side:T.DoubleSide,toneMapped:false});materials.push(m);surface.material=m;
   }
   const screen=model.getObjectByName('LaptopScreen');
   const camera=new T.PerspectiveCamera(36,1,.03,100);
   const v=(x,y,z)=>new T.Vector3(x,z,-y);
   const positions=[v(8,-10,8),v(-2.5,-1.15,4.7),v(0,-2.55,2.34),v(2.53,-2.65,2.8)];
   const targets=[v(0,0,1.65),v(-2.5,-.2,1.615),v(0,.946,2.30),v(2.53,.29,2.74)];
   const p={value:0};let visible=true,last=-1;
   function render(){
     frame=0;if(disposed||!scope.active||!visible||document.hidden)return;
     const progress=p.value;let a=0,b=0,t=0;
     // Hold on each readable surface, then travel to the next object.
     if(progress<.18){a=0;b=1;t=T.MathUtils.smoothstep(progress,0,.18);}
     else if(progress<.34){a=b=1;}
     else if(progress<.48){a=1;b=2;t=T.MathUtils.smoothstep(progress,.34,.48);}
     else if(progress<.63){a=b=2;}
     else if(progress<.77){a=2;b=3;t=T.MathUtils.smoothstep(progress,.63,.77);}
     else{a=b=3;}
     camera.position.lerpVectors(positions[a],positions[b],t);
     const target=new T.Vector3().lerpVectors(targets[a],targets[b],t);
     if(innerWidth<760){
       if(a===0){camera.position.addScaledVector(camera.position.clone().sub(target),.65*(1-t));}
       // Portrait fitting: preserve the full page/screen width.
       const fitting=i=>i===0?0:Math.max(0,[0,1.85,2.1,1.64][i]/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect)-positions[i].distanceTo(targets[i]));
       const extra=T.MathUtils.lerp(fitting(a),fitting(b),t);
       if(a||b){const direction=camera.position.clone().sub(target).normalize();camera.position.addScaledVector(direction,extra);}
     }
     camera.lookAt(target);
     screen.material.color.setScalar(.018+.982*T.MathUtils.smoothstep(progress,.38,.48));
     const index=progress<.11?0:progress<.39?1:progress<.68?2:3;
     if(index!==last){last=index;root.dataset.stop=String(index);root.querySelector('[data-desk-label]').textContent=['At the desk','01 / Student','02 / Developer','03 / Writer'][index];}
     root.querySelector('[data-desk-progress]').style.transform='scaleX('+progress+')';
     renderer.render(scene,camera);
   }
   const schedule=()=>{if(!frame&&scope.active)frame=requestAnimationFrame(render);};
   host.append(renderer.domElement);root.classList.add('is-live');
   const resize=()=>{renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();schedule();};
   resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
   observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();});observer.observe(root);
   scope.listen(document,'visibilitychange',schedule);
   scope.listen(renderer.domElement,'webglcontextlost',e=>{e.preventDefault();trigger?.kill();fallback();});
   if(!reduced&&window.gsap&&window.ScrollTrigger){
     const tween=gsap.to(p,{value:1,ease:'none',onUpdate:schedule,scrollTrigger:{trigger:root,start:()=>innerWidth<760?'top 136px':'top 82px',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true}});
     trigger=tween.scrollTrigger;
   }else{root.classList.add('is-static');}
   resize();window.ScrollTrigger?.refresh();
 }catch{if(scope.active)fallback();}
}

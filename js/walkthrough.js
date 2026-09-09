import * as T from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

export async function mount(scope) {
const host = document.querySelector('[data-refuge-world]');
const journey = document.querySelector('[data-refuge-journey]');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches ||
  new URLSearchParams(location.search).has('reduced-motion');
const clamp = T.MathUtils.clamp;
let sceneModel, visibilityObserver;
let renderer, trigger, resizeObserver, frame = 0, visible = true, failed = false;
let draw = () => {};
const progress = { value: 0 };

function staticFallback() {
  failed = true;
  resizeObserver?.disconnect();
  trigger?.kill();
  cancelAnimationFrame(frame);
  renderer?.dispose();renderer?.forceContextLoss();
  renderer?.domElement.remove();
  journey.classList.remove('is-live');
  journey.classList.add('is-static');
  document.querySelectorAll('[data-walk-copy]').forEach((copy,i) => {copy.hidden=i!==0;});
  document.querySelector('[data-refuge-hint]').textContent = 'The writing room is just below';
  window.ScrollTrigger?.refresh();
}

async function mountWorld() {
  try {
    renderer = new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1.25 : 1.5));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene();
    scene.background = new T.Color(0xe6ece6);
    scene.fog = new T.Fog(0xe6ece6,28,75);
    scene.add(new T.HemisphereLight(0xfffaed,0x718071,2.2));
    const sun = new T.DirectionalLight(0xfff3d9,3.3);
    sun.position.set(-5,12,8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048,2048);
    Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:.5,far:55});
    sun.shadow.normalBias=.025;
    sun.shadow.bias=-.0001;
    scene.add(sun);
    const roomLight = new T.PointLight(0xffd9a1,7,6,2);
    roomLight.position.set(3,2.5,-.5); scene.add(roomLight);
    const model = (await new GLTFLoader().loadAsync('/assets/nordic/refuge-walkthrough.glb')).scene;
    sceneModel=model;
    if(!scope.active){model.traverse(o=>o.geometry?.dispose());return;}
    model.traverse(obj => {
      if (!obj.isMesh) return;
      obj.castShadow = true; obj.receiveShadow = true;
      // Water receives light, not a flat opaque shadow beneath the boardwalk.
      if (obj.name.startsWith('Fjord')) {obj.receiveShadow=false;obj.castShadow=false;}
    });
    scene.add(model);
    const left = model.getObjectByName('DoorLeft');
    const right = model.getObjectByName('DoorRight');
    const camera = new T.PerspectiveCamera(43,1,.04,200);
    const positions = [
      new T.Vector3(16,10,23),new T.Vector3(7,4.5,14),
      new T.Vector3(3,2.15,7.8),new T.Vector3(3,1.95,3.2),
      new T.Vector3(3,2.05,.7)
    ];
    const targets = [
      new T.Vector3(0,1,-1),new T.Vector3(2,1.4,.3),
      new T.Vector3(3,1.7,0),new T.Vector3(3,1.65,-.8),
      new T.Vector3(2.9,1.6,-.65)
    ];
    const copies=[...document.querySelectorAll('[data-walk-copy]')];
    const names=['Approach / 01','Across the water / 02','The threshold / 03','The page / 04'];
    let phase=-1;
    draw = () => {
      frame=0;
      if (!scope.active || failed || !visible || document.hidden) return;
      const p=clamp(progress.value,0,1), scaled=p*4;
      const index=Math.min(3,Math.floor(scaled)), t=T.MathUtils.smoothstep(scaled-index,0,1);
      camera.position.lerpVectors(positions[index],positions[index+1],t);
      const target=new T.Vector3().lerpVectors(targets[index],targets[index+1],t);
      if (innerWidth<760) {
        // Keep the room below the copy on portrait screens.
        target.y+=T.MathUtils.lerp(2.4,.12,T.MathUtils.smoothstep(p,.2,.65));
        camera.position.z+=T.MathUtils.lerp(3,.5,p);
        camera.position.y+=.4*p;
      }
      camera.lookAt(target);
      const opening=T.MathUtils.smoothstep(p,.56,.76);
      if(left)left.position.x=-opening*.91;
      if(right)right.position.x=opening*.91;
      const next=p<.23?0:p<.52?1:p<.79?2:3;
      if(next!==phase){
        phase=next; journey.dataset.phase=String(next);
        copies.forEach((copy,i)=>copy.hidden=i!==next);
        document.querySelector('[data-refuge-chapter]').textContent=names[next];
      }
      document.querySelector('[data-refuge-progress]').style.transform='scaleX('+p+')';
      renderer.render(scene,camera);
    };
    const schedule = () => {if(!frame)frame=requestAnimationFrame(draw);};
    host.append(renderer.domElement);
    journey.classList.add('is-live');
    const resize=()=>{
      renderer.setSize(host.clientWidth,host.clientHeight,false);
      camera.aspect=host.clientWidth/host.clientHeight;
      camera.updateProjectionMatrix(); schedule();
    };
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
    visibilityObserver=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;if(visible)schedule();
    });visibilityObserver.observe(journey);
    scope.listen(document,'visibilitychange',schedule);
    scope.listen(renderer.domElement,'webglcontextlost',event=>{event.preventDefault();staticFallback();});
    if(!reduced && window.gsap && window.ScrollTrigger){
      window.gsap.registerPlugin(window.ScrollTrigger);
      const tween=window.gsap.to(progress,{value:1,ease:'none',onUpdate:schedule,
        scrollTrigger:{trigger:journey,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true}
      });
      trigger=tween.scrollTrigger;
      window.ScrollTrigger.refresh();
    } else {
      journey.classList.add('is-static');
      document.querySelector('[data-refuge-hint]').textContent='A quiet place to begin';
    }
    draw();
  } catch { if(scope.active)staticFallback(); }
}
scope.onCleanup(()=>{
 failed=true;cancelAnimationFrame(frame);trigger?.kill();resizeObserver?.disconnect();visibilityObserver?.disconnect();
 sceneModel?.traverse(o=>{o.geometry?.dispose();for(const m of [].concat(o.material||[]))m.dispose();});
 renderer?.dispose();renderer?.forceContextLoss();
});
if(host && journey) await mountWorld();
}

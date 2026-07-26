import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const C={canvas:0xF1F4F0,surface:0xF8F9F6,elevated:0xFCFCFA,nav:0xE8EDE8,outline:0xD8DED8,divider:0xE3E8E3,ink:0x202522,muted:0x929B95,accent:0x718B7C,active:0x506457,warm:0xD4B477,success:0x78967D};
const mat=(color=C.surface,rough=.86)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:0});
const box=(size,color=C.surface)=>new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color));

export function mountWorld(host,page='home'){
  if(!host||!available())return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compact=innerWidth<760||((navigator.deviceMemory||8)<=4);
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:!compact,alpha:false,powerPreference:'high-performance'});}
  catch{return document.documentElement.classList.add('no-webgl');}
  renderer.setPixelRatio(Math.min(devicePixelRatio,compact?1:1.35));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.02;
  host.prepend(renderer.domElement);

  const scene=new THREE.Scene();
  scene.background=new THREE.Color(page==='roadmap'?C.nav:C.canvas);
  scene.fog=new THREE.FogExp2(page==='roadmap'?C.nav:C.canvas,page==='roadmap'?.025:.019);
  const camera=new THREE.PerspectiveCamera(compact?48:40,innerWidth/innerHeight,.1,180);
  scene.add(new THREE.HemisphereLight(C.elevated,C.accent,2.25));
  const sun=new THREE.DirectionalLight(C.elevated,3.8);sun.position.set(-10,15,8);scene.add(sun);
  const dawn=new THREE.PointLight(C.warm,4.2,26,2);dawn.position.set(6,4,-5);scene.add(dawn);

  const world=new THREE.Group();scene.add(world);
  world.add(makeTerrain(page),makeFog(compact,page),makeDust(compact));
  const journey=builders[page]?.(world,compact)||builders.home(world,compact);
  const curve=new THREE.CatmullRomCurve3(journey.path,false,'catmullrom',.55);
  curve.arcLengthDivisions=240;
  const lookCurve=new THREE.CatmullRomCurve3(journey.look,false,'catmullrom',.55);
  let target=0,current=0,px=0,py=0,tx=0,ty=0,running=true,raf=0,last=0;
  const maxScroll=()=>Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const roadmapMilestones=page==='roadmap'?[...document.querySelectorAll('.milestone')]:[];
  const roadmapProgress=()=>{
    if(!roadmapMilestones.length)return scrollY/maxScroll();
    const cursor=scrollY+innerHeight*.5,firstTop=roadmapMilestones[0].getBoundingClientRect().top+scrollY;
    if(cursor<firstTop)return 0;
    for(let i=0;i<roadmapMilestones.length;i++){
      const item=roadmapMilestones[i],top=item.getBoundingClientRect().top+scrollY,bottom=top+item.offsetHeight;
      if(cursor<=bottom||i===roadmapMilestones.length-1){
        if(i===roadmapMilestones.length-1)return 1;
        const local=Math.max(0,Math.min(1,(cursor-top)/Math.max(1,item.offsetHeight)));
        const release=Math.max(0,Math.min(1,(local-.78)/.22));
        const eased=release*release*(3-2*release);
        return(i+eased)/(roadmapMilestones.length-1);
      }
    }
    return 1;
  };
  const measure=()=>target=Math.max(0,Math.min(.999,page==='roadmap'?roadmapProgress():scrollY/maxScroll()));
  const pointer=e=>{if(!compact&&!reduced){tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;}};
  const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1:1.35));renderer.setSize(innerWidth,innerHeight);measure();};
  function frame(t=0){
    if(!running)return;
    const dt=Math.min(.04,(t-last)/1000||.016);last=t;
    current+=(target-current)*(reduced?1:Math.min(1,dt*3.3));
    px+=(tx-px)*Math.min(1,dt*2);py+=(ty-py)*Math.min(1,dt*2);
    const p=curve.getPointAt(current),look=lookCurve.getPointAt(Math.min(.999,current+.008));
    camera.position.set(p.x+px*.26,p.y-py*.14,p.z);
    camera.lookAt(look.x+px*.08,look.y-py*.05,look.z);
    journey.animate?.(t,current);
    renderer.render(scene,camera);
    if(!reduced)raf=requestAnimationFrame(frame);
  }
  addEventListener('scroll',measure,{passive:true});addEventListener('pointermove',pointer,{passive:true});addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{running=!document.hidden;if(running&&!reduced)raf=requestAnimationFrame(frame);else cancelAnimationFrame(raf);});
  measure();frame();
}

const builders={
  home(world,compact){
    const stages=new THREE.Group();world.add(stages);
    makePage(stages,0,0,1.5,0);
    makeChapterGate(stages,-13);
    makeMemoryOrbit(stages,-28);
    const finish=makeBook(stages,-44);
    const path=[v(0,3.4,11),v(-.5,2.7,3),v(1.2,2.4,-9),v(-1.1,3,-20),v(.6,3.4,-33),v(0,3,-48)];
    const look=[v(0,.8,1),v(0,.6,-5),v(0,1.2,-14),v(0,1.2,-27),v(0,1,-40),v(0,1,-51)];
    return{path,look,animate(t,p){stages.position.y=Math.sin(t*.00022)*.035;finish.rotation.y=Math.sin(t*.0003)*.025;}};
  },
  philosophy(world){
    const g=new THREE.Group();world.add(g);
    manuscriptCorridor(g,2);archive(g,-18);lens(g,-36);makeBook(g,-51,true);
    return{path:[v(0,3.3,13),v(-1,2.6,2),v(1,2.8,-14),v(-.7,3,-29),v(.7,3,-43),v(0,3,-56)],look:[v(0,1,2),v(0,1,-7),v(0,1,-20),v(0,1.4,-37),v(0,1,-49),v(0,1,-59)],animate(t){g.rotation.y=Math.sin(t*.00013)*.006;}};
  },
  about(world){
    const g=new THREE.Group();world.add(g);makerDesk(g,0);const pages=new THREE.Group();g.add(pages);
    for(let i=0;i<11;i++)makePage(pages,Math.sin(i*.8)*3.7,.5+i*.15,-10-i*3,i*.15);
    const name=makeWordBars();name.position.set(0,.5,-42);g.add(name);
    return{path:[v(7,4.5,13),v(3.5,3.4,3),v(-2,2.8,-10),v(1.5,3.2,-25),v(-1,3,-43)],look:[v(0,.8,0),v(0,.7,-7),v(0,1,-18),v(0,1,-34),v(0,1,-47)],animate(t){pages.children.forEach((p,i)=>p.rotation.z=Math.sin(t*.00035+i)*.03);}};
  },
  roadmap(world,compact){
    const route=makeRoute(world),mountains=makeMountains(world),trees=makeTrees(world,compact);
    return{path:route.camera,look:route.look,animate(t,p){
      const near=Math.max(0,Math.min(route.signs.length-1,Number(document.body.dataset.nearStage||1)-1));
      route.signs.forEach((sign,index)=>{
        const target=index===near?1.06:1;
        sign.scale.setScalar(sign.scale.x+(target-sign.scale.x)*.075);
        sign.rotation.y+=(sign.userData.facing-sign.rotation.y)*.06;
      });
      mountains.rotation.y=Math.sin(t*.00004)*.004;trees.position.y=Math.sin(t*.00012)*.01;
    }};
  }
};

function v(x,y,z){return new THREE.Vector3(x,y,z);}
function makeTerrain(page){
  const roadmap=page==='roadmap',w=roadmap?54:34,d=roadmap?92:72,xs=roadmap?34:22,zs=roadmap?64:46,offset=roadmap?-32:-25,g=new THREE.PlaneGeometry(w,d,xs,zs);
  g.rotateX(-Math.PI/2);const a=g.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getZ(i);a.setY(i,height(x,z+offset,page));}
  g.computeVertexNormals();const mesh=new THREE.Mesh(g,mat(roadmap?0xD8E0D9:C.divider));mesh.position.z=offset;return mesh;
}
function height(x,z,page){if(page!=='roadmap')return-1.12+Math.sin(x*.24+z*.1)*.08;const corridor=Math.exp(-x*x/24);return-1.15+(1-corridor)*(Math.sin(x*.18+z*.07)*.42+Math.cos(z*.12)*.18);}

function makePage(g,x,y,z,r=0){
  const page=box([4.2,.055,5.7],C.elevated);page.position.set(x,y,z);page.rotation.y=r;g.add(page);
  for(let i=0;i<7;i++){const line=box([2.5-(i%3)*.3,.018,.035],C.outline);line.position.set(x-.35,y+.04,z-1.5+i*.43);line.rotation.y=r;g.add(line);}
  return page;
}
function makeChapterGate(g,z){
  for(let i=0;i<7;i++){const side=i%2?1:-1,p=box([3.2,.07,4.3],i===3?C.nav:C.elevated);p.position.set(side*(2.45+(i%3)*.18),.7+(i%3)*.72,z+(i-3)*1.35);p.rotation.set(0,side*.1,side*.82);g.add(p);}
}
function makeMemoryOrbit(g,z){
  const ring=new THREE.Group();ring.position.set(0,1.4,z);g.add(ring);
  const geo=new THREE.IcosahedronGeometry(.33,1),materials=[mat(C.accent),mat(C.outline),mat(C.warm)];
  for(let i=0;i<18;i++){const m=new THREE.Mesh(geo,materials[i%3]);const a=i/18*Math.PI*2;m.position.set(Math.cos(a)*(4+(i%2)),Math.sin(a*2)*1.5,Math.sin(a)*3);ring.add(m);}
  const lineMat=new THREE.LineBasicMaterial({color:C.outline,transparent:true,opacity:.7}),pts=ring.children.map(o=>o.position);
  ring.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),lineMat));
}
function makeBook(g,z,open=false){
  const book=new THREE.Group();book.position.set(0,.65,z);g.add(book);
  const left=box([4.4,.15,5.8],C.accent),right=left.clone();left.position.x=-2.22;right.position.x=2.22;
  left.rotation.z=open?-.12:-.025;right.rotation.z=open?.12:.025;book.add(left,right);
  for(let i=0;i<8;i++){const p=box([4.1,.035,5.5],C.elevated);p.position.set(i%2?-2.18:2.18,.18+i*.035,0);p.rotation.z=(i%2?-1:1)*(open?.13:.03);book.add(p);}
  const glow=new THREE.PointLight(C.warm,3,12,2);glow.position.set(0,2,0);book.add(glow);return book;
}
function manuscriptCorridor(g,z){
  for(let i=0;i<16;i++){const side=i%2?1:-1,p=box([4,.055,5.3],i%5===0?C.nav:C.elevated);p.position.set(side*4.1,1+(i%4)*.7,z-i*2.4);p.rotation.set(0,side*.18,side*.9);g.add(p);}
}
function archive(g,z){
  for(let row=0;row<3;row++)for(let i=0;i<7;i++){const b=box([1.15,.75,2.1],(i+row)%4===0?C.accent:C.surface);b.position.set((i-3)*1.35,row*.9-.55,z-row*.4);g.add(b);}
}
function lens(g,z){
  const group=new THREE.Group();group.position.set(0,1.3,z);g.add(group);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3,.11,12,64),mat(C.accent));group.add(ring);
  const glass=new THREE.Mesh(new THREE.CircleGeometry(2.88,64),new THREE.MeshBasicMaterial({color:C.selection||C.nav,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));group.add(glass);
  for(let i=0;i<9;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),mat(i%3?C.outline:C.warm));dot.position.set(Math.sin(i*1.7)*2.1,Math.cos(i*.8)*1.6,.2);group.add(dot);}
}
function makerDesk(g,z){
  const slab=box([10,.45,5.5],C.outline);slab.position.set(0,0,z);g.add(slab);
  const notebook=box([4.2,.12,5.6],C.elevated);notebook.position.set(-1.2,.36,z);notebook.rotation.y=-.18;g.add(notebook);
  const screen=box([5.5,3.3,.16],C.active);screen.position.set(1.7,2.25,z-1.5);screen.rotation.y=-.15;g.add(screen);
  const glow=new THREE.PointLight(C.warm,4,11,2);glow.position.set(-3,3,z+1);g.add(glow);
}
function makeWordBars(){
  const g=new THREE.Group();
  [7.5,6.2,8.3,5.4].forEach((w,i)=>{const b=box([w,.16,.18],i===0?C.accent:C.outline);b.position.set(0,2-i*.62,0);g.add(b);});return g;
}
function makeRoute(world){
  const points=[];
  for(let i=0;i<12;i++){const z=8-i*6,x=Math.sin(i*.72)*3;points.push(v(x,height(x,z,'roadmap')+.24,z));}
  const curve=new THREE.CatmullRomCurve3(points),trail=new THREE.Mesh(new THREE.TubeGeometry(curve,220,.09,7,false),new THREE.MeshBasicMaterial({color:C.accent}));world.add(trail);
  const signs=[];
  points.forEach((p,i)=>{
    const state=i<1?'done':i===1?'current':'future',sign=makeTrailSign(i+1,state);
    sign.position.copy(p);sign.userData.facing=Math.sin(i*.72)*.08;sign.rotation.y=sign.userData.facing;
    signs.push(sign);world.add(sign);
  });
  const camera=points.map((p,i)=>v(p.x+(i%3-1)*.3,p.y+2.55,p.z+5.1)),look=points.map(p=>v(p.x,p.y+.35,p.z-1.7));
  return{camera,look,signs};
}

function makeTrailSign(number,state){
  const group=new THREE.Group(),frameColor=state==='done'?C.success:state==='current'?C.warm:C.muted;
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,1.05,18),mat(C.active));post.position.y=.525;group.add(post);
  const frame=box([1.16,.72,.1],frameColor);frame.position.y=1.29;group.add(frame);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(1.04,.6),new THREE.MeshBasicMaterial({map:signTexture(number,state),transparent:false}));
  face.position.set(0,1.29,.056);group.add(face);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.035,18),mat(frameColor));cap.rotation.z=Math.PI/2;cap.position.y=1.04;group.add(cap);
  return group;
}

function signTexture(number,state){
  const titles=['Identity','Research','MVP','UX & files','System','Prototype','Editor','Projects','Alpha','Beta','Deploy','Community'];
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=220;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#F8F9F6';ctx.fillRect(0,0,384,220);
  ctx.fillStyle=state==='done'?'#78967D':state==='current'?'#A58650':'#68736D';
  ctx.font='600 25px Geist, Arial, sans-serif';ctx.textAlign='center';ctx.fillText(`STAGE ${String(number).padStart(2,'0')}`,192,54);
  ctx.fillStyle='#202522';ctx.font='500 38px Geist, Arial, sans-serif';ctx.fillText(titles[number-1],192,137);
  ctx.fillStyle='#929B95';ctx.fillRect(122,170,140,2);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function makeMountains(world){
  const group=new THREE.Group();world.add(group);
  const shades=[0xC7D0C9,0xD0D8D1,0xBBC7BE];
  for(let i=0;i<18;i++){const side=i%2?1:-1,z=5-Math.floor(i/2)*8.1,h=6.5+(i%4)*1.8,r=3+(i%3)*.65,m=new THREE.Mesh(new THREE.ConeGeometry(r,h,8,3),mat(shades[i%3]));m.position.set(side*(11.8+(i%3)*1.7),height(side*12,z,'roadmap')+h/2-.2,z);m.rotation.y=i*.57;group.add(m);}
  return group;
}
function makeTrees(world,compact){
  const group=new THREE.Group();world.add(group);
  const count=compact?18:38,trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.06,.09,.7,6),mat(C.active),count),crowns=new THREE.InstancedMesh(new THREE.ConeGeometry(.42,1.5,7),mat(C.accent),count),dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){const side=i%2?1:-1,z=7-i*2.05,x=side*(6.2+(i%5)*.8),y=height(x,z,'roadmap');dummy.position.set(x,y+.35,z);dummy.rotation.y=i*.71;dummy.scale.setScalar(.75+(i%3)*.17);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);dummy.position.y=y+1.25;dummy.updateMatrix();crowns.setMatrixAt(i,dummy.matrix);}
  group.add(trunks,crowns);return group;
}
function makeFog(compact,page){
  const g=new THREE.Group(),texture=fogTexture(),count=compact?4:8;
  for(let i=0;i<count;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(page==='roadmap'?34:25,8),new THREE.MeshBasicMaterial({map:texture,color:C.surface,transparent:true,opacity:.12+(i%3)*.025,depthWrite:false}));m.position.set((i%2?1:-1)*(i%4)*2.7,1+i*.18,7-i*(page==='roadmap'?10:8));m.rotation.y=(i%2?1:-1)*.08;g.add(m);}return g;
}
function fogTexture(){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,32,3,64,32,64);
  gradient.addColorStop(0,'rgba(255,255,255,.88)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,64);return new THREE.CanvasTexture(canvas);
}
function makeDust(compact){
  const count=compact?45:110,positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*30;positions[i*3+1]=Math.random()*8;positions[i*3+2]=8-Math.random()*74;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));
  return new THREE.Points(g,new THREE.PointsMaterial({color:C.elevated,size:.035,transparent:true,opacity:.7,depthWrite:false}));
}
function available(){try{const c=document.createElement('canvas');return!!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')));}catch{return false;}}

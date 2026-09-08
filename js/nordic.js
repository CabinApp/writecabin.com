(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('reduced-motion');
  document.body.classList.add('ready');
  document.body.classList.toggle('n-reduced', reduced);
  if (reduced) document.documentElement.style.scrollBehavior = 'auto';
  const modes = [
    ['Only the page. Enough room to hear the next sentence.', '', '', 'Chapter one'],
    ['A chapter gives the draft a little shape. The writing stays central.', 'Part I · The Ash Valley', '01 The Bridge Bell\n02 The Lantern Road\n03 Under the North Gate', 'Part I / Chapter one'],
    ['A note stays nearby. Your story has room to become a world.', 'Elian Voss', 'Watchtower keeper. Carries a brass key. Why does the bridge bell answer him?', 'Part I / Chapter one']
  ];
  document.querySelectorAll('[data-room-mode]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.roomMode);
    document.querySelectorAll('[data-room-mode]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const [caption, title, copy, label] = modes[index];
    document.querySelector('[data-room-caption]').textContent = caption;
    document.querySelector('[data-draft-label]').textContent = label;
    document.querySelector('[data-room-note]').hidden = index === 0;
    document.querySelector('[data-note-title]').textContent = title;
    document.querySelector('[data-note-copy]').textContent = copy;
    document.querySelector('[data-note-copy]').style.whiteSpace = 'pre-line';
    document.querySelector('[data-note-label]').textContent = index === 1 ? 'Chapters' : 'Character note';
  }));
  const lantern = document.querySelector('[data-lantern]');
  lantern?.addEventListener('click', () => {
    const lit = lantern.getAttribute('aria-pressed') !== 'true';
    lantern.setAttribute('aria-pressed', String(lit));
    lantern.textContent = lit ? 'Let the lantern rest' : 'Light the lantern';
    document.querySelector('.n-lost').classList.toggle('is-lit', lit);
    document.querySelector('[data-lantern-message]').textContent = lit ? 'There it is. A warm window, just across the water.' : 'Even a wrong turn can be a quiet moment.';
  });
  const hero = document.querySelector('.n-hero');
  if (hero && !reduced) {
    let scheduled = false;
    addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        if (scrollY <= hero.offsetHeight) hero.style.setProperty('--drift', Math.min(scrollY * .08, 65) + 'px');
        scheduled = false;
      });
    }, { passive: true });
  }
  const explore = document.querySelector('[data-explore-model]');
  if (explore) {
    let model, render, renderer;
    explore.addEventListener('click', async () => {
      const art = document.querySelector('[data-model-art]');
      const status = document.querySelector('[data-model-status]');
      if (model) { model.rotation.y += Math.PI / 4; render(); return; }
      explore.disabled = true;
      status.textContent = 'Opening the workbench…';
      try {
        const T = await import('./vendor/three.module.js');
        const { GLTFLoader } = await import('./vendor/GLTFLoader.js');
        const view = document.querySelector('[data-model-view]');
        renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        const scene = new T.Scene();
        scene.add(new T.HemisphereLight(0xfff9e9, 0x57674d, 2.5));
        const sun = new T.DirectionalLight(0xfff4d9, 3);
        sun.position.set(-4, 8, 6); scene.add(sun);
        const camera = new T.PerspectiveCamera(34, 1, .1, 100);
        camera.position.set(6, 4.5, 7); camera.lookAt(0, 1.3, 0);
        const result = await new GLTFLoader().loadAsync('assets/nordic/workbench.glb');
        model = result.scene; scene.add(model);
        view.append(renderer.domElement);
        art.classList.add('is-live');
        render = () => renderer.render(scene, camera);
        const resize = () => {
          const w = view.clientWidth, h = view.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); render();
        };
        new ResizeObserver(resize).observe(view);
        resize();
        explore.textContent = 'Turn the workbench ↻';
        status.textContent = 'A little change of perspective. Turn again to see another side.';
        renderer.domElement.addEventListener('webglcontextlost', event => {
          event.preventDefault(); art.classList.remove('is-live'); model = null;
          status.textContent = 'The illustrated workbench is still here. Reload to try 3D again.';
          explore.disabled = true;
        });
      } catch {
        renderer?.dispose();
        model = null;
        art.classList.remove('is-live');
        status.textContent = 'The illustrated workbench is still here. 3D could not open on this device.';
      } finally { explore.disabled = false; }
    });
  }
})();
(() => {
 const board = document.querySelector('[data-blog-list]');
 if (!board) return;
 let queued = false;
 const draw = () => {
   queued = false;
   const svg = board.querySelector('.blog-thread'), path = svg?.querySelector('path');
   if (!path) return;
   const rect = board.getBoundingClientRect();
   const points = [...board.querySelectorAll('.blog-pin')].map(pin => {
     const r = pin.getBoundingClientRect(); return { x:r.left+r.width/2-rect.left, y:r.top+r.height/2-rect.top };
   });
   if (!points.length) return;
   svg.setAttribute('viewBox', '0 0 '+board.clientWidth+' '+board.scrollHeight);
   let d = 'M 0 24';
   let prev = {x:0,y:24};
   points.forEach(next => {
     if (Math.abs(next.x-prev.x)<50 && prev.x) {
       d += ' C '+(next.x-180)+' '+(prev.y+60)+', '+(next.x-180)+' '+(next.y-60)+', '+next.x+' '+next.y;
     } else {
       const middle=(prev.x+next.x)/2;
       d += ' C '+middle+' '+(Math.min(prev.y,next.y)-65)+', '+middle+' '+(Math.min(prev.y,next.y)-65)+', '+next.x+' '+next.y;
     }
     prev=next;
   });
   if (path.getAttribute('d')!==d) path.setAttribute('d',d);
 };
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(draw)}};
 new MutationObserver(schedule).observe(board,{childList:true});
 new ResizeObserver(schedule).observe(board);
 document.fonts?.ready.then(schedule);
 addEventListener('resize',schedule,{passive:true});
 schedule();
})();

const page = document.body.dataset.page || 'home';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const worldHost = document.querySelector('.webgl-world');
if (worldHost) import('./world.js').then(({ mountWorld }) => mountWorld(worldHost, page)).catch(() => document.documentElement.classList.add('no-webgl'));

if (window.gsap) {
  const wash = document.querySelector('.page-wash');
  if (wash) wash.style.animation = 'none';
  gsap.registerPlugin(ScrollTrigger);
  gsap.set('.page-wash', { autoAlpha: 1 });
  gsap.to('.page-wash', { autoAlpha: 0, duration: 1.15, ease: 'power2.out', delay: .05 });

  gsap.utils.toArray('.reveal').forEach(el => gsap.fromTo(el,
    { autoAlpha: 0, y: 30 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
      delay: el.closest('.home-main,.essay-hero,.about-main,.roadmap-hero,.journal-head') ? .45 : 0,
      scrollTrigger: el.closest('.home-main,.essay-hero,.about-main,.roadmap-hero,.journal-head') ? undefined : { trigger: el, start: 'top 86%', once: true }
    }
  ));

  const milestones = gsap.utils.toArray('.milestone');
  const setNearStage = milestone => {
    milestones.forEach(item => item.classList.toggle('is-near', item === milestone));
    document.body.dataset.nearStage = milestone?.dataset.stage || '1';
  };
  milestones.forEach((milestone, index) => {
    const card = milestone.querySelector('.milestone-card');
    gsap.fromTo(card, { autoAlpha: .28, y: 42 }, {
      autoAlpha: 1,
      y: 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: milestone,
        start: 'top 72%',
        end: 'bottom 34%',
        scrub: .65,
        onEnter: () => setNearStage(milestone),
        onEnterBack: () => setNearStage(milestone)
      }
    });
    if (index === 0) setNearStage(milestone);
  });

  const journey = document.querySelector('.journey');
  if (journey) {
    const progress = document.querySelector('.journey-progress');
    const bar = progress?.querySelector('i');
    ScrollTrigger.create({
      trigger: journey,
      start: 'top center',
      end: 'bottom bottom',
      onToggle: self => progress?.classList.toggle('visible', self.isActive),
      onUpdate: self => bar && gsap.set(bar, { scaleY: self.progress })
    });
  }

  const complexity = document.querySelector('.complexity-section');
  if (complexity) {
    const steps = [...complexity.querySelectorAll('.complexity-step')];
    ScrollTrigger.create({
      trigger: complexity,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: self => {
        const phase = Math.min(3, Math.floor(self.progress * 4));
        complexity.dataset.phase = phase;
        steps.forEach((step, index) => step.classList.toggle('is-active', index === phase));
      }
    });
  }
}

if (window.Lenis && !reduced) {
  const lenis = new Lenis({ duration: 1.12, smoothWheel: true, wheelMultiplier: .88 });
  const loop = time => { lenis.raf(time); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}

import('https://cdn.jsdelivr.net/npm/motion@12.23.12/+esm').then(({ animate, stagger }) => {
  animate(document.querySelectorAll('.nav-links a'), { opacity: [0, 1], y: [-8, 0] }, { delay: stagger(.045, { startDelay: .6 }), duration: .5 });
}).catch(() => {});

const menu = document.querySelector('.menu');
const links = document.querySelector('.nav-links');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  links?.classList.toggle('open', open);
});

document.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', event => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || link.target === '_blank' || event.metaKey || event.ctrlKey) return;
  const target = new URL(link.href, location.href);
  if (target.origin !== location.origin) return;
  event.preventDefault();
  document.body.classList.add('is-leaving');
  if (window.gsap) gsap.fromTo('.page-wash', { autoAlpha: 0 }, { autoAlpha: 1, duration: .72, ease: 'power2.inOut', onComplete: () => location.href = link.href });
  else location.href = link.href;
}));

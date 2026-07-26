const page = document.body.dataset.page || 'home';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.classList.add('ready');

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

initRoadmapFocus();

function initRoadmapFocus() {
  const milestones = [...document.querySelectorAll('.milestone')];
  const overlay = document.querySelector('.roadmap-focus');
  if (!milestones.length || !overlay) return;
  const stageLabel = overlay.querySelector('.roadmap-focus-stage');
  const title = overlay.querySelector('h2');
  const description = overlay.querySelector('.roadmap-focus-description');
  let active = -1;
  let queued = false;
  document.body.classList.add('has-roadmap-focus');

  const ease = value => value * value * (3 - 2 * value);
  const update = () => {
    queued = false;
    const cursor = scrollY + innerHeight * .5;
    let index = -1;
    let local = 0;
    milestones.forEach((item, itemIndex) => {
      const top = item.getBoundingClientRect().top + scrollY;
      if (cursor >= top && cursor <= top + item.offsetHeight) {
        index = itemIndex;
        local = (cursor - top) / item.offsetHeight;
      }
    });
    if (index < 0) {
      overlay.style.setProperty('--sign-focus', '0');
      overlay.setAttribute('aria-hidden', 'true');
      return;
    }
    const opening = ease(Math.max(0, Math.min(1, (local - .1) / .2)));
    const closing = 1 - ease(Math.max(0, Math.min(1, (local - .62) / .16)));
    const focus = reduced ? (local > .2 && local < .68 ? 1 : 0) : Math.min(opening, closing);
    if (active !== index) {
      active = index;
      const milestone = milestones[index], card = milestone.querySelector('.milestone-card');
      milestones.forEach((item, i) => item.classList.toggle('is-near', i === index));
      document.body.dataset.nearStage = milestone.dataset.stage;
      stageLabel.textContent = [...card.querySelectorAll('.stage span')].map(item => item.textContent.trim()).join(' · ');
      title.textContent = card.querySelector('h2').textContent;
      description.textContent = card.querySelector('p').textContent;
      overlay.classList.toggle('is-complete', milestone.classList.contains('is-complete'));
      overlay.classList.toggle('is-current', milestone.classList.contains('is-current'));
    }
    overlay.style.setProperty('--sign-focus', focus.toFixed(3));
    overlay.setAttribute('aria-hidden', focus < .03 ? 'true' : 'false');
  };
  const schedule = () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  update();
}

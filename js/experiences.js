(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    new URLSearchParams(window.location.search).has("reduced-motion");

  initHomeRoom();
  initMakerMobile();
  initLanternPath();

  function initHomeRoom() {
    const room = document.querySelector(".home-room");
    if (!room) return;

    const desk = room.querySelector("[data-writing-desk]");
    if (desk && !reduced) {
      const moveDesk = (event) => {
        const rect = desk.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        desk.style.setProperty("--desk-x", `${(x * 8).toFixed(2)}deg`);
        desk.style.setProperty("--desk-y", `${(-y * 5).toFixed(2)}deg`);
      };
      desk.addEventListener("pointermove", moveDesk, { passive: true });
      desk.addEventListener("pointerleave", () => {
        desk.style.setProperty("--desk-x", "0deg");
        desk.style.setProperty("--desk-y", "0deg");
      });
    }

    const assembly = room.querySelector("[data-room-assembly]");
    const workspace = assembly?.querySelector(".cabin-workspace");
    const steps = [...(assembly?.querySelectorAll("[data-room-step]") || [])];
    const headingNumber = assembly?.querySelector(".assembly-heading span");
    const headingCopy = assembly?.querySelector(".assembly-heading p");
    let activeStep = -1;

    const setStep = (index) => {
      const next = Math.max(0, Math.min(steps.length - 1, index));
      if (activeStep === next) return;
      activeStep = next;
      workspace?.setAttribute("data-assembly-stage", String(next));
      steps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === next));
      if (headingNumber) headingNumber.textContent = `${String(next + 1).padStart(2, "0")} / 04`;
      if (headingCopy) headingCopy.textContent = steps[next]?.querySelector("h2")?.textContent || "";
    };

    if (steps.length) {
      setStep(0);
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          const centered = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - innerHeight / 2) -
              Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - innerHeight / 2));
          if (centered[0]) setStep(Number(centered[0].target.dataset.roomStep));
        }, { rootMargin: "-35% 0px -35% 0px", threshold: 0 });
        steps.forEach((step) => observer.observe(step));
      }
    }

    room.querySelectorAll("[data-tilt-card]").forEach((card) => {
      if (reduced) return;
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty("--card-rx", `${(-y * 4).toFixed(2)}deg`);
        card.style.setProperty("--card-ry", `${(x * 5).toFixed(2)}deg`);
      }, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--card-rx", "0deg");
        card.style.setProperty("--card-ry", "0deg");
      });
    });

    if (!reduced && window.gsap) {
      if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.from("[data-home-intro] > *", {
        autoAlpha: 0,
        y: 28,
        duration: 1.05,
        stagger: .09,
        ease: "power3.out"
      });
      window.gsap.from(".desk-object", {
        autoAlpha: 0,
        y: 45,
        rotateZ: -4,
        duration: 1.35,
        delay: .18,
        ease: "power3.out"
      });
      if (window.ScrollTrigger) {
        window.gsap.utils.toArray(".principle-window").forEach((card, index) => {
          window.gsap.from(card, {
            autoAlpha: 0,
            y: 70,
            rotateX: 5,
            duration: 1,
            delay: (index % 2) * .08,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", once: true }
          });
        });
        window.gsap.to(".status-orbit", {
          rotateZ: 42,
          ease: "none",
          scrollTrigger: { trigger: ".home-status", start: "top bottom", end: "bottom top", scrub: 1.4 }
        });
        window.gsap.fromTo(".coda-door", { rotateY: -24, autoAlpha: .2 }, {
          rotateY: 2,
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: { trigger: ".home-coda", start: "top bottom", end: "center center", scrub: 1.2 }
        });
      }
    }
  }

  function initMakerMobile() {
    const section = document.querySelector("[data-maker-section]");
    if (!section) return;

    const chapters = [...section.querySelectorAll("[data-maker-chapter]")];
    const controls = [...section.querySelectorAll("[data-maker-control]")];
    const labelNumber = section.querySelector(".mobile-label span");
    const labelName = section.querySelector(".mobile-label strong");
    const names = ["Student", "Developer", "Writer"];
    let selected = 0;
    let selectObject = () => {};

    const select = (index) => {
      const next = Math.max(0, Math.min(2, index));
      selected = next;
      chapters.forEach((chapter, chapterIndex) => chapter.classList.toggle("is-active", chapterIndex === next));
      controls.forEach((control, controlIndex) => {
        const active = controlIndex === next;
        control.classList.toggle("is-active", active);
        control.setAttribute("aria-pressed", String(active));
      });
      if (labelNumber) labelNumber.textContent = `Thread 0${next + 1}`;
      if (labelName) labelName.textContent = names[next];
      selectObject(next);
    };

    controls.forEach((control) => control.addEventListener("click", () => {
      const index = Number(control.dataset.makerControl);
      select(index);
      chapters[index]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }));

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const centered = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - innerHeight / 2) -
            Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - innerHeight / 2));
        if (centered[0]) select(Number(centered[0].target.dataset.makerChapter));
      }, { rootMargin: "-34% 0px -34% 0px", threshold: 0 });
      chapters.forEach((chapter) => observer.observe(chapter));
    }

    const canvas = section.querySelector("[data-maker-canvas]");
    const wrap = section.querySelector(".mobile-canvas-wrap");
    if (canvas && wrap && window.THREE) {
      try {
        const T = window.THREE;
        const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.2 : 1.6));

        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(34, 1, .1, 40);
        camera.position.set(0, .15, 9.2);
        scene.add(new T.HemisphereLight(0xfafbf7, 0x718b7c, 2.4));
        const sun = new T.DirectionalLight(0xfff8e7, 3.2);
        sun.position.set(-4, 6, 5);
        scene.add(sun);

        const mobile = new T.Group();
        mobile.position.y = .35;
        scene.add(mobile);
        const dark = new T.MeshStandardMaterial({ color: 0x526b5a, roughness: .72, metalness: .04 });
        const sage = new T.MeshStandardMaterial({ color: 0x8fa798, roughness: .82, metalness: 0 });
        const paper = new T.MeshStandardMaterial({ color: 0xf9f7ed, roughness: .92, metalness: 0 });
        const oak = new T.MeshStandardMaterial({ color: 0xc8aa75, roughness: .78, metalness: 0 });
        const cord = new T.LineBasicMaterial({ color: 0x718b7c, transparent: true, opacity: .68 });

        const line = (points) => {
          const geometry = new T.BufferGeometry().setFromPoints(points.map(([x, y, z]) => new T.Vector3(x, y, z)));
          const object = new T.Line(geometry, cord);
          mobile.add(object);
          return object;
        };
        const bar = (width, y, rotation = 0) => {
          const mesh = new T.Mesh(new T.CylinderGeometry(.035, .035, width, 12), dark);
          mesh.position.y = y;
          mesh.rotation.z = Math.PI / 2 + rotation;
          mobile.add(mesh);
          return mesh;
        };

        line([[0, 4.1, 0], [0, 2.72, 0]]);
        const upperBar = bar(5.2, 2.7, .025);
        line([[-2.45, 2.72, 0], [-2.45, .8, 0]]);
        line([[2.45, 2.72, 0], [2.45, .58, 0]]);
        line([[0, 2.7, 0], [0, 1.62, 0]]);
        const lowerBar = bar(3.15, 1.58, -.06);
        line([[-1.48, 1.68, 0], [-1.48, -.92, 0]]);
        line([[1.48, 1.48, 0], [1.48, -.72, 0]]);

        const objects = [];
        const student = new T.Group();
        const bookLeft = new T.Mesh(new T.BoxGeometry(1.22, .06, 1.55), paper);
        const bookRight = bookLeft.clone();
        bookLeft.position.x = -.58; bookRight.position.x = .58;
        bookLeft.rotation.z = -.14; bookRight.rotation.z = .14;
        student.add(bookLeft, bookRight);
        student.position.set(-2.45, .35, 0);
        mobile.add(student); objects.push(student);

        const developer = new T.Group();
        [-.38, 0, .38].forEach((z, index) => {
          const panel = new T.Mesh(new T.BoxGeometry(1.55 - index * .14, 1.05 - index * .08, .055), index === 1 ? oak : paper);
          panel.position.z = z;
          panel.rotation.z = (index - 1) * .08;
          developer.add(panel);
        });
        developer.position.set(-1.48, -1.42, 0);
        mobile.add(developer); objects.push(developer);

        const writer = new T.Group();
        const stone = new T.Mesh(new T.SphereGeometry(.75, 32, 18), sage);
        stone.scale.set(1.25, .72, .42);
        const page = new T.Mesh(new T.BoxGeometry(1.1, .035, 1.45), paper);
        page.rotation.x = Math.PI / 2;
        page.position.set(.42, .14, .35);
        writer.add(stone, page);
        writer.position.set(1.48, -1.25, 0);
        mobile.add(writer); objects.push(writer);

        const counterweight = new T.Mesh(new T.SphereGeometry(.34, 24, 14), oak);
        counterweight.scale.set(1.2, .8, .8);
        counterweight.position.set(2.45, .2, 0);
        mobile.add(counterweight);
        document.documentElement.classList.add("has-maker-webgl");

        let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0, time = 0, frame = 0;
        selectObject = (index) => { selected = index; };
        select(selected);

        const resize = () => {
          const rect = wrap.getBoundingClientRect();
          renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
          camera.aspect = rect.width / Math.max(1, rect.height);
          camera.updateProjectionMatrix();
        };
        const pointer = (event) => {
          const rect = wrap.getBoundingClientRect();
          targetX = (event.clientX - rect.left) / rect.width - .5;
          targetY = (event.clientY - rect.top) / rect.height - .5;
        };
        wrap.addEventListener("pointermove", pointer, { passive: true });
        wrap.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; });
        addEventListener("resize", resize, { passive: true });

        const render = (stamp = 0) => {
          time = stamp;
          pointerX += (targetX - pointerX) * .035;
          pointerY += (targetY - pointerY) * .035;
          mobile.rotation.y += ((1 - selected) * .13 + pointerX * .18 - mobile.rotation.y) * .035;
          mobile.rotation.x += (-pointerY * .08 - mobile.rotation.x) * .035;
          upperBar.rotation.z = Math.PI / 2 + Math.sin(stamp * .00042) * .018;
          lowerBar.rotation.z = Math.PI / 2 - .06 + Math.sin(stamp * .0005 + 1.4) * .025;
          objects.forEach((object, index) => {
            const scale = index === selected ? 1.14 : .88;
            object.scale.x += (scale - object.scale.x) * .055;
            object.scale.y += (scale - object.scale.y) * .055;
            object.scale.z += (scale - object.scale.z) * .055;
            object.rotation.y = Math.sin(stamp * .00036 + index * 1.4) * .16;
            object.rotation.z = Math.sin(stamp * .00028 + index) * .035;
          });
          renderer.render(scene, camera);
          if (!reduced && !document.hidden) frame = requestAnimationFrame(render);
        };
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden && !reduced) frame = requestAnimationFrame(render);
          else cancelAnimationFrame(frame);
        });
        resize();
        render();
      } catch {
        document.documentElement.classList.remove("has-maker-webgl");
      }
    }

    if (!reduced && window.gsap) {
      window.gsap.from("[data-about-intro] > *", { autoAlpha: 0, y: 30, duration: 1.1, stagger: .1, ease: "power3.out" });
      window.gsap.from(".maker-signature path", { strokeDasharray: 650, strokeDashoffset: 650, duration: 2.2, delay: .45, ease: "power2.out" });
    }
  }

  function initLanternPath() {
    const page = document.querySelector("[data-lost-page]");
    if (!page) return;
    const world = page.querySelector(".lost-world");
    const toggle = page.querySelector("[data-lantern-switch]");
    let fixed = false;
    let targetX = innerWidth * .72, targetY = innerHeight * .48;
    let x = targetX, y = targetY, frame = 0;

    const render = () => {
      x += (targetX - x) * .075;
      y += (targetY - y) * .075;
      page.style.setProperty("--lantern-x", `${x.toFixed(1)}px`);
      page.style.setProperty("--lantern-y", `${y.toFixed(1)}px`);
      if (Math.abs(targetX - x) > .2 || Math.abs(targetY - y) > .2) frame = requestAnimationFrame(render);
      else frame = 0;
    };
    const aim = (event) => {
      if (fixed || reduced) return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!frame) frame = requestAnimationFrame(render);
      if (window.gsap && world) {
        const rx = (event.clientY / innerHeight - .5) * -1.2;
        const ry = (event.clientX / innerWidth - .5) * 1.5;
        window.gsap.to(world, { rotateX: rx, rotateY: ry, duration: 1.4, ease: "power2.out", overwrite: "auto" });
      }
    };
    page.addEventListener("pointermove", aim, { passive: true });
    toggle?.addEventListener("click", () => {
      fixed = !fixed;
      toggle.setAttribute("aria-pressed", String(fixed));
      toggle.querySelector("span").textContent = fixed ? "Let the lantern follow" : "Hold the lantern still";
      page.classList.toggle("is-lantern-fixed", fixed);
    });

    if (!reduced && window.gsap) {
      window.gsap.from(".lost-copy > *", { autoAlpha: 0, y: 22, duration: 1, stagger: .09, ease: "power3.out" });
      window.gsap.from(".distant-cabin", { autoAlpha: 0, scale: .82, duration: 1.8, delay: .5, ease: "power2.out" });
      window.gsap.from(".waypost", { scaleY: 0, duration: 1.25, stagger: .14, delay: .3, transformOrigin: "bottom", ease: "power3.out" });
    }
    render();
  }
})();

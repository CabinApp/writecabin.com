(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    new URLSearchParams(window.location.search).has("reduced-motion");

  initHomeRoom();
  initHomeDesk();
  initMakerCabinet();
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
      window.gsap.from(".writing-desk", {
        autoAlpha: 0,
        y: 45,
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
        window.gsap.from(".blueprint-board", {
          autoAlpha: 0,
          y: 55,
          rotateY: 15,
          ease: "power3.out",
          duration: 1.2,
          scrollTrigger: { trigger: ".home-status", start: "top 72%", once: true }
        });
        window.gsap.fromTo(".blueprint-route", {
          strokeDashoffset: 150
        }, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: ".home-status", start: "top 76%", end: "center 52%", scrub: 1 }
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

  function initHomeDesk() {
    const canvas = document.querySelector("[data-home-desk-canvas]");
    const host = canvas?.closest("[data-writing-desk]");
    if (!canvas || !host || !window.THREE || reduced) return;
    try {
      const T = window.THREE;
      const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.25 : 1.65));
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;

      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(31, 1, .1, 50);
      camera.position.set(7.4, 6.1, 9.5);
      camera.lookAt(0, -.15, 0);
      const root = new T.Group();
      root.rotation.y = -.08;
      scene.add(root);

      scene.add(new T.HemisphereLight(0xfbfdf8, 0x63786a, 2.1));
      const sun = new T.DirectionalLight(0xfff9e8, 4.2);
      sun.position.set(-5, 9, 7);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
      sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
      scene.add(sun);
      const lampLight = new T.PointLight(0xf1c878, 12, 7, 2);
      lampLight.position.set(2.25, 1.8, .25);
      lampLight.castShadow = true;
      root.add(lampLight);

      const material = (color, roughness = .72, metalness = 0) =>
        new T.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat: .06, clearcoatRoughness: .8 });
      const birch = material(0xbca783, .82);
      const edge = material(0x8d795d, .76);
      const sage = material(0x526b5a, .62);
      const pale = material(0xf9f8ef, .9);
      const paperWarm = material(0xeeeade, .94);
      const brass = material(0xc7a260, .38, .22);
      const coffee = material(0x584331, .9);
      const ink = material(0x7b8980, .88);

      const box = (size, mat, position, rotation = [0, 0, 0]) => {
        const mesh = new T.Mesh(new T.BoxGeometry(...size), mat);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        root.add(mesh);
        return mesh;
      };
      const cylinder = (top, bottom, height, segments, mat, position, rotation = [0, 0, 0]) => {
        const mesh = new T.Mesh(new T.CylinderGeometry(top, bottom, height, segments), mat);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        root.add(mesh);
        return mesh;
      };

      box([7.4, .32, 5.2], birch, [0, -1.48, 0]);
      box([7.28, .08, 5.08], edge, [0, -1.69, 0]);
      box([.24, 2.5, .24], edge, [-3.18, -2.78, -1.95], [0, 0, -.03]);
      box([.24, 2.5, .24], edge, [3.18, -2.78, -1.95], [0, 0, .03]);
      box([.24, 2.5, .24], edge, [-3.18, -2.78, 1.95], [0, 0, .03]);
      box([.24, 2.5, .24], edge, [3.18, -2.78, 1.95], [0, 0, -.03]);

      const roomFrame = new T.Group();
      root.add(roomFrame);
      const beam = (size, position, rotation = [0, 0, 0]) => {
        const mesh = new T.Mesh(new T.BoxGeometry(...size), sage);
        mesh.position.set(...position); mesh.rotation.set(...rotation);
        mesh.castShadow = true; roomFrame.add(mesh); return mesh;
      };
      beam([.12, 4.3, .12], [-3.1, .7, -2.05]);
      beam([.12, 4.3, .12], [3.1, .7, -2.05]);
      beam([6.3, .12, .12], [0, 2.82, -2.05]);
      beam([3.75, .12, .12], [-1.43, 3.68, -2.05], [0, 0, .48]);
      beam([3.75, .12, .12], [1.43, 3.68, -2.05], [0, 0, -.48]);
      beam([.08, 3.8, .08], [0, .9, -2.04]);

      for (let sheet = 0; sheet < 4; sheet += 1) {
        box([3.25, .045, 3.9], sheet === 0 ? pale : paperWarm,
          [-.35 - sheet * .035, -1.23 + sheet * .055, .05 + sheet * .025],
          [0, -.13 + sheet * .012, .005 * sheet]);
      }
      for (let line = 0; line < 8; line += 1) {
        box([1.9 - (line % 3) * .22, .018, .027], ink,
          [-.57, -1.005, -1.16 + line * .29], [0, -.13, 0]);
      }
      box([.95, .022, .04], sage, [-1.02, -1.002, -1.55], [0, -.13, 0]);

      cylinder(.48, .5, .12, 32, sage, [2.35, -1.02, .72]);
      cylinder(.07, .08, 2.7, 18, sage, [2.35, .32, .72], [0, 0, -.05]);
      const lampArm = cylinder(.055, .055, 1.65, 16, sage, [1.87, 1.55, .72], [0, 0, .92]);
      const shade = new T.Mesh(new T.ConeGeometry(.68, .68, 32, 1, true), sage);
      shade.position.set(1.3, 1.87, .72);
      shade.rotation.z = -.18;
      shade.castShadow = true;
      root.add(shade);
      cylinder(.2, .2, .035, 24, brass, [1.25, 1.63, .72], [Math.PI / 2, 0, 0]);

      cylinder(.48, .42, .78, 32, pale, [-2.52, -.86, .75]);
      cylinder(.34, .34, .02, 32, coffee, [-2.52, -.46, .75]);
      const handle = new T.Mesh(new T.TorusGeometry(.36, .075, 12, 26, Math.PI * 1.55), pale);
      handle.position.set(-2.86, -.81, .75); handle.rotation.y = Math.PI / 2;
      handle.castShadow = true; root.add(handle);
      cylinder(.055, .055, 2.25, 12, brass, [1.2, -1.02, -.86], [Math.PI / 2, 0, .25]);
      const pencilTip = new T.Mesh(new T.ConeGeometry(.085, .28, 12), edge);
      pencilTip.position.set(.91, -1.02, .25); pencilTip.rotation.z = 1.82; root.add(pencilTip);

      const resize = () => {
        const rect = host.getBoundingClientRect();
        renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
        camera.aspect = rect.width / Math.max(1, rect.height);
        camera.updateProjectionMatrix();
      };
      let tx = 0, ty = 0, px = 0, py = 0, frame = 0;
      host.addEventListener("pointermove", (event) => {
        const rect = host.getBoundingClientRect();
        tx = (event.clientX - rect.left) / rect.width - .5;
        ty = (event.clientY - rect.top) / rect.height - .5;
      }, { passive: true });
      host.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
      addEventListener("resize", resize, { passive: true });
      const render = (time = 0) => {
        px += (tx - px) * .035; py += (ty - py) * .035;
        root.rotation.y = -.08 + px * .1;
        root.rotation.x = py * .035;
        lampArm.rotation.z = .92 + Math.sin(time * .00032) * .008;
        lampLight.intensity = 11.5 + Math.sin(time * .0011) * .45;
        renderer.render(scene, camera);
        if (!document.hidden) frame = requestAnimationFrame(render);
      };
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) frame = requestAnimationFrame(render);
        else cancelAnimationFrame(frame);
      });
      resize();
      document.documentElement.classList.add("has-home-desk");
      render();
    } catch {
      document.documentElement.classList.remove("has-home-desk");
    }
  }

  function initMakerCabinet() {
    const section = document.querySelector(".maker-cabinet-section[data-maker-section]");
    if (!section) return;
    const chapters = [...section.querySelectorAll("[data-maker-chapter]")];
    const controls = [...section.querySelectorAll("[data-maker-control]")];
    const labelNumber = section.querySelector(".cabinet-label span");
    const labelName = section.querySelector(".cabinet-label strong");
    const names = ["Student", "Developer", "Writer"];
    let selected = 0;
    let selectDrawer = () => {};

    const select = (index) => {
      const next = Math.max(0, Math.min(2, index));
      selected = next;
      chapters.forEach((chapter, chapterIndex) => chapter.classList.toggle("is-active", chapterIndex === next));
      controls.forEach((control, controlIndex) => {
        const active = controlIndex === next;
        control.classList.toggle("is-active", active);
        control.setAttribute("aria-pressed", String(active));
      });
      if (labelNumber) labelNumber.textContent = `Drawer 0${next + 1}`;
      if (labelName) labelName.textContent = names[next];
      selectDrawer(next);
    };

    controls.forEach((control) => control.addEventListener("click", () => {
      const index = Number(control.dataset.makerControl);
      select(index);
      chapters[index]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }));
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const centered = entries.filter((entry) => entry.isIntersecting).sort((a, b) =>
          Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - innerHeight / 2) -
          Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - innerHeight / 2));
        if (centered[0]) select(Number(centered[0].target.dataset.makerChapter));
      }, { rootMargin: "-34% 0px -34% 0px", threshold: 0 });
      chapters.forEach((chapter) => observer.observe(chapter));
    }

    const canvas = section.querySelector("[data-maker-canvas]");
    const stage = section.querySelector(".cabinet-stage");
    if (canvas && stage && window.THREE) {
      try {
        const T = window.THREE;
        const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.2 : 1.6));

        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(33, 1, .1, 50);
        camera.position.set(6.1, 4.7, 9.2);
        camera.lookAt(0, 0, 0);
        scene.add(new T.HemisphereLight(0xfcfdf8, 0x617568, 2.3));
        const sun = new T.DirectionalLight(0xfff7df, 4.4);
        sun.position.set(-5, 8, 7);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        scene.add(sun);
        const focusLight = new T.PointLight(0xf0c97f, 7, 8, 2);
        focusLight.position.set(1, 1.2, 4);
        scene.add(focusLight);

        const cabinet = new T.Group();
        cabinet.rotation.y = -.18;
        cabinet.position.y = -.1;
        scene.add(cabinet);
        const mat = (color, roughness = .78, metalness = 0) =>
          new T.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat: .05, clearcoatRoughness: .85 });
        const birch = mat(0xc9b18b, .76);
        const birchLight = mat(0xdfcba7, .82);
        const birchDark = mat(0x8e7859, .72);
        const sage = mat(0x5d7765, .68);
        const pale = mat(0xf9f7ed, .94);
        const graphite = mat(0x3f4e44, .65);
        const ochre = mat(0xc5a05f, .62);
        const blueGrey = mat(0x8fa19a, .78);
        const drawerY = [1.18, 0, -1.18];
        const drawers = [];

        const mesh = (geometry, material, parent, position, rotation = [0, 0, 0]) => {
          const object = new T.Mesh(geometry, material);
          object.position.set(...position);
          object.rotation.set(...rotation);
          object.castShadow = true;
          object.receiveShadow = true;
          parent.add(object);
          return object;
        };
        const cabinetBox = (size, material, position) =>
          mesh(new T.BoxGeometry(...size), material, cabinet, position);

        cabinetBox([5.6, 4.45, .28], birchDark, [0, 0, -1.18]);
        cabinetBox([.34, 4.65, 2.45], birch, [-2.82, 0, -.15]);
        cabinetBox([.34, 4.65, 2.45], birch, [2.82, 0, -.15]);
        cabinetBox([5.95, .32, 2.45], birch, [0, 2.31, -.15]);
        cabinetBox([5.95, .32, 2.45], birch, [0, -2.31, -.15]);
        cabinetBox([5.5, .14, 2.2], birchDark, [0, .59, -.25]);
        cabinetBox([5.5, .14, 2.2], birchDark, [0, -.59, -.25]);
        cabinetBox([6.25, .16, 2.7], birchDark, [0, -2.53, -.1]);

        const addLines = (parent, startX, startZ, count, width, material, y) => {
          for (let index = 0; index < count; index += 1) {
            mesh(new T.BoxGeometry(width - (index % 3) * .18, .018, .025), material, parent,
              [startX, y, startZ + index * .2]);
          }
        };

        drawerY.forEach((y, index) => {
          const drawer = new T.Group();
          drawer.position.set(0, y, .15);
          cabinet.add(drawer);
          mesh(new T.BoxGeometry(5.15, .96, .2), birchLight, drawer, [0, 0, .95]);
          mesh(new T.BoxGeometry(4.82, .1, 2.05), birchLight, drawer, [0, .42, -.02]);
          mesh(new T.BoxGeometry(.12, .5, 2.05), birch, drawer, [-2.36, .18, -.02]);
          mesh(new T.BoxGeometry(.12, .5, 2.05), birch, drawer, [2.36, .18, -.02]);
          mesh(new T.CylinderGeometry(.09, .09, .8, 18), graphite, drawer, [0, .02, 1.1], [0, 0, Math.PI / 2]);
          mesh(new T.CylinderGeometry(.13, .13, .08, 18), ochre, drawer, [0, .02, 1.15], [Math.PI / 2, 0, 0]);

          if (index === 0) {
            const book = new T.Group();
            drawer.add(book);
            mesh(new T.BoxGeometry(1.85, .14, 1.2), sage, book, [-.55, .55, -.08], [0, .1, 0]);
            mesh(new T.BoxGeometry(1.72, .11, 1.08), pale, book, [-.54, .66, -.08], [0, .1, 0]);
            mesh(new T.BoxGeometry(1.48, .1, .92), ochre, book, [-.46, .76, -.08], [0, .02, 0]);
            for (let card = 0; card < 3; card += 1) {
              mesh(new T.BoxGeometry(.72, .035, .95), pale, book, [1.03 + card * .12, .53 + card * .04, -.2 + card * .05], [0, -.16, -.08 + card * .05]);
            }
          } else if (index === 1) {
            const modules = new T.Group();
            drawer.add(modules);
            for (let row = 0; row < 2; row += 1) {
              for (let column = 0; column < 4; column += 1) {
                const height = .22 + ((row + column) % 3) * .14;
                mesh(new T.BoxGeometry(.58, height, .55), (row + column) % 2 ? sage : blueGrey, modules,
                  [-1.18 + column * .78, .48 + height / 2, -.45 + row * .72]);
              }
            }
            mesh(new T.TorusGeometry(.34, .055, 12, 30), ochre, modules, [1.65, .72, -.08], [Math.PI / 2, 0, 0]);
          } else {
            const manuscript = new T.Group();
            drawer.add(manuscript);
            mesh(new T.BoxGeometry(2.55, .055, 1.52), pale, manuscript, [-.35, .52, -.08], [0, -.08, 0]);
            addLines(manuscript, -.55, -.62, 6, 1.52, blueGrey, .56);
            mesh(new T.CylinderGeometry(.045, .045, 1.85, 12), ochre, manuscript, [1.38, .7, -.12], [Math.PI / 2, 0, -.2]);
            mesh(new T.ConeGeometry(.075, .25, 12), birchDark, manuscript, [1.17, .7, .76], [0, 0, 2.94]);
            mesh(new T.SphereGeometry(.3, 20, 14), sage, manuscript, [-1.72, .71, .12]);
          }
          drawers.push(drawer);
        });

        let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0, focusY = drawerY[0], frame = 0;
        selectDrawer = (index) => { selected = index; };
        select(selected);
        const resize = () => {
          const rect = stage.getBoundingClientRect();
          renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
          camera.aspect = rect.width / Math.max(1, rect.height);
          camera.updateProjectionMatrix();
        };
        stage.addEventListener("pointermove", (event) => {
          const rect = stage.getBoundingClientRect();
          targetX = (event.clientX - rect.left) / rect.width - .5;
          targetY = (event.clientY - rect.top) / rect.height - .5;
        }, { passive: true });
        stage.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; });
        addEventListener("resize", resize, { passive: true });

        const render = (time = 0) => {
          pointerX += (targetX - pointerX) * .035;
          pointerY += (targetY - pointerY) * .035;
          cabinet.rotation.y += (-.18 + pointerX * .12 - cabinet.rotation.y) * .035;
          cabinet.rotation.x += (-pointerY * .035 - cabinet.rotation.x) * .035;
          focusY += (drawerY[selected] - focusY) * .04;
          focusLight.position.y = focusY + .8;
          drawers.forEach((drawer, index) => {
            const targetZ = index === selected ? 1.95 : .12;
            drawer.position.z += (targetZ - drawer.position.z) * .055;
            drawer.rotation.y = Math.sin(time * .00025 + index) * .004;
          });
          camera.lookAt(0, focusY * .16, 0);
          renderer.render(scene, camera);
          if (!reduced && !document.hidden) frame = requestAnimationFrame(render);
        };
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden && !reduced) frame = requestAnimationFrame(render);
          else cancelAnimationFrame(frame);
        });
        resize();
        document.documentElement.classList.add("has-maker-webgl");
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

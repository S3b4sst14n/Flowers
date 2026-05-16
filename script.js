/* ============================================================
   PERSONALIZACIÓN — Edita este objeto y listo.
   ============================================================ */
const CONFIG = {
  // Texto que aparece después de "Para " en el título principal.
  nombre: "la flor más hermosa",

  // Mensajes posibles cuando dice "no" en la preguntita 🛁.
  // Se elige uno al azar.
  veredictosNo: [
    "Lo sabía. Cochina 😏",
    "Cochina detectada 🛁",
  ],
};

/* ============================================================
   Arranque
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initLoader();
  initStars();
  initFireflies();
  initLetter();
  initParallax();
  initFlowerSparkles();
  initPrank();
});

/* ----------- Aplica la configuración a los nodos -------------- */
function applyConfig() {
  const nombre = document.getElementById("nombre");
  if (nombre) nombre.textContent = CONFIG.nombre;

  document.title = `Para ${CONFIG.nombre} ❤`;
}

/* ============================================================
   Pantalla de carga romántica
   ============================================================ */
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  const dismiss = () => {
    document.body.classList.remove("is-loading");
    // Suelta las animaciones de las flores ~200ms después del fade-out.
    setTimeout(() => document.body.classList.remove("not-loaded"), 200);
    // Quita el loader del DOM cuando termine la transición.
    loader.addEventListener(
      "transitionend",
      () => loader.remove(),
      { once: true }
    );
  };

  // Espera a `load` para que también las fuentes/imagenes estén listas,
  // pero con un mínimo de 1.8 s para que la escena se sienta cinematográfica.
  let loaded = false;
  let waited = false;
  const tryDismiss = () => loaded && waited && dismiss();

  window.addEventListener("load", () => { loaded = true; tryDismiss(); });
  setTimeout(() => { waited = true; tryDismiss(); }, 1800);
}

/* ============================================================
   Canvas de estrellas — titilan lento
   ============================================================ */
function initStars() {
  const canvas = document.getElementById("starsCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    seed();
  }

  function seed() {
    const density = innerWidth < 600 ? 9000 : 6500;
    const count = Math.min(260, Math.floor((innerWidth * innerHeight) / density));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight * 0.85,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.55 + 0.25,
      tw: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.018 + 0.004,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const s of stars) {
      s.tw += s.sp;
      const alpha = s.a * (0.45 + 0.55 * Math.sin(s.tw));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 240, 225, ${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
}

/* ============================================================
   Luciérnagas — reaccionan al puntero
   ============================================================ */
function initFireflies() {
  const canvas = document.getElementById("firefliesCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let flies = [];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    seed();
  }

  function seed() {
    const count = innerWidth < 600 ? 22 : 44;
    flies = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.25 - 0.05,
      r: Math.random() * 1.4 + 0.7,
      ph: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.04 + 0.015,
      hue: 30 + Math.random() * 25, // dorado-cálido
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = "lighter";
    for (const f of flies) {
      // Repulsión suave del cursor.
      const dx = f.x - mouse.x;
      const dy = f.y - mouse.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 18000) {
        const d = Math.sqrt(dist2) || 1;
        const force = ((Math.sqrt(18000) - d) / Math.sqrt(18000)) * 0.45;
        f.vx += (dx / d) * force;
        f.vy += (dy / d) * force;
      }
      // Deriva orgánica.
      f.vx += (Math.random() - 0.5) * 0.025;
      f.vy += (Math.random() - 0.5) * 0.025;
      f.vx *= 0.96;
      f.vy *= 0.96;
      f.x += f.vx;
      f.y += f.vy;
      // Envolvimiento por bordes.
      if (f.x < -20) f.x = innerWidth + 20;
      if (f.x > innerWidth + 20) f.x = -20;
      if (f.y < -20) f.y = innerHeight + 20;
      if (f.y > innerHeight + 20) f.y = -20;

      // Pulso luminoso.
      f.ph += f.sp;
      const glow = 0.4 + 0.6 * (Math.sin(f.ph) * 0.5 + 0.5);

      // Halo radial.
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 9);
      grad.addColorStop(0, `hsla(${f.hue}, 100%, 78%, ${glow})`);
      grad.addColorStop(0.45, `hsla(${f.hue}, 100%, 65%, ${glow * 0.25})`);
      grad.addColorStop(1, `hsla(${f.hue}, 100%, 60%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 9, 0, Math.PI * 2);
      ctx.fill();

      // Núcleo brillante.
      ctx.fillStyle = `rgba(255, 246, 210, ${glow})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  addEventListener("pointerleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  resize();
  requestAnimationFrame(frame);
}

/* ============================================================
   Carta romántica (modal)
   ============================================================ */
function initLetter() {
  const letter = document.getElementById("letter");
  const trigger = document.getElementById("openLetter");
  if (!letter) return;

  function open() {
    letter.classList.add("is-open");
    letter.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-letter-open");
  }
  function close() {
    letter.classList.remove("is-open");
    letter.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-letter-open");
  }

  trigger?.addEventListener("click", open);

  letter.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && letter.classList.contains("is-open")) close();
  });

  // También se abre al pulsar cualquier flor (con destellos antes).
  document.querySelectorAll(".flower").forEach((flower) => {
    flower.addEventListener("click", (e) => {
      // Pequeña espera para que los destellos sean visibles antes del modal.
      setTimeout(open, 220);
    });
  });
}

/* ============================================================
   Parallax suave con el cursor
   ============================================================ */
function initParallax() {
  const layers = document.querySelectorAll("[data-parallax]");
  if (!layers.length) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;

  addEventListener("pointermove", (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  });

  function frame() {
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    for (const layer of layers) {
      const factor = parseFloat(layer.dataset.parallax) || 0.02;
      layer.style.setProperty("--px", (cx * 100 * factor).toFixed(2) + "px");
      layer.style.setProperty("--py", (cy * 100 * factor).toFixed(2) + "px");
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ============================================================
   Destellos al pulsar una flor
   ============================================================ */
function initFlowerSparkles() {
  document.addEventListener("click", (e) => {
    const flower = e.target.closest(".flower");
    if (!flower) return;
    spawnSparkles(e.clientX, e.clientY);
  });
}

function spawnSparkles(x, y) {
  const count = 14;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const dist = Math.random() * 90 + 30;
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.setProperty("--tx", (Math.cos(angle) * dist).toFixed(1) + "px");
    s.style.setProperty("--ty", (Math.sin(angle) * dist).toFixed(1) + "px");
    s.style.setProperty("--hue", (20 + Math.random() * 40).toFixed(0));
    s.style.setProperty("--dur", (0.7 + Math.random() * 0.5).toFixed(2) + "s");
    document.body.appendChild(s);
    s.addEventListener("animationend", () => s.remove(), { once: true });
  }
}

/* ============================================================
   Preguntita troll 🛁 — "¿Te gusta bañarte?"
   El botón "Sí" huye cada vez que se intenta presionar.
   "No" muestra un veredicto cochina de CONFIG.veredictosNo.
   ============================================================ */
function initPrank() {
  const toggle = document.getElementById("prankToggle");
  const modal = document.getElementById("prank");
  const yesBtn = document.getElementById("prankYes");
  const noBtn = document.getElementById("prankNo");
  const verdict = document.getElementById("prankVerdict");
  if (!toggle || !modal || !yesBtn || !noBtn || !verdict) return;

  // Recordamos dónde vive el botón "Sí" para devolverlo al cerrar el modal.
  // (Se mueve al <body> mientras huye — ver flee().)
  const yesHome = yesBtn.parentNode;
  const yesAnchor = yesBtn.nextSibling;
  function backHome() {
    if (yesBtn.parentNode !== yesHome) {
      yesHome.insertBefore(yesBtn, yesAnchor);
    }
  }

  function open() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    backHome();
    resetYes();
    verdict.classList.remove("is-visible");
    verdict.textContent = "";
  }
  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    backHome();
    resetYes();
  }

  // Devuelve el botón "Sí" a su posición original dentro del modal.
  function resetYes() {
    yesBtn.classList.remove("is-fleeing");
    yesBtn.style.left = "";
    yesBtn.style.top = "";
  }

  // Mueve el botón "Sí" a un punto aleatorio de la ventana.
  // GARANTÍA: nunca se sale del viewport. Solo se mueve, jamás desaparece.
  function flee() {
    // CRÍTICO: .prank__card tiene `transform`, lo que convierte el card en
    // el "containing block" de los descendientes position:fixed. Si dejamos
    // el botón dentro del card, sus coordenadas left/top serían relativas
    // al card (no al viewport) y el botón se iría fuera de pantalla.
    // Sacándolo al <body> recuperamos el comportamiento normal de fixed.
    if (yesBtn.parentNode !== document.body) {
      document.body.appendChild(yesBtn);
    }

    const rect = yesBtn.getBoundingClientRect();
    const w = rect.width || 100;
    const h = rect.height || 44;
    const margin = 24;

    // Si por algún motivo el botón es más grande que la ventana,
    // lo centramos: visible, garantizado.
    if (innerWidth < w + margin * 2 || innerHeight < h + margin * 2) {
      yesBtn.classList.add("is-fleeing");
      yesBtn.style.left = Math.max(8, (innerWidth - w) / 2) + "px";
      yesBtn.style.top = Math.max(8, (innerHeight - h) / 2) + "px";
      return;
    }

    const minX = margin;
    const minY = margin;
    const maxX = innerWidth - w - margin;
    const maxY = innerHeight - h - margin;

    // Genera una posición lejos de la actual para que el movimiento se note.
    let nx, ny, tries = 0;
    const minJump = Math.min(innerWidth, innerHeight) / 3;
    do {
      nx = minX + Math.random() * (maxX - minX);
      ny = minY + Math.random() * (maxY - minY);
      tries++;
    } while (
      tries < 12 &&
      Math.hypot(nx - rect.left, ny - rect.top) < minJump
    );

    // Doble seguro: clamp final por si algo raro pasara.
    nx = Math.max(minX, Math.min(nx, maxX));
    ny = Math.max(minY, Math.min(ny, maxY));

    yesBtn.classList.add("is-fleeing");
    yesBtn.style.left = nx + "px";
    yesBtn.style.top = ny + "px";
  }

  // Si la ventana cambia de tamaño mientras está huyendo, reubica el botón
  // dentro de los nuevos límites para que no quede cortado.
  addEventListener("resize", () => {
    if (!yesBtn.classList.contains("is-fleeing")) return;
    flee();
  });

  // Evita que el primer "mouseenter" no haga nada (a veces los navegadores
  // disparan el evento un poco tarde): también huye en focus/touchstart.
  yesBtn.addEventListener("mouseenter", flee);
  yesBtn.addEventListener("focus", flee);
  yesBtn.addEventListener("touchstart", (e) => { e.preventDefault(); flee(); }, { passive: false });
  // Por si logra clickearlo en pantallas con ratón muy rápido.
  yesBtn.addEventListener("click", (e) => {
    e.preventDefault();
    flee();
  });

  noBtn.addEventListener("click", () => {
    const lista = CONFIG.veredictosNo || ["Lo sabía. Cochina 😏"];
    verdict.textContent = lista[Math.floor(Math.random() * lista.length)];
    verdict.classList.add("is-visible");
    noBtn.disabled = true;
    setTimeout(() => { noBtn.disabled = false; }, 2400);
  });

  toggle.addEventListener("click", open);
  modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-close-prank]")) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
  });
}

const COLORS = ["#ff783a", "#152dff", "#ec76e5", "#cbf52a", "#ff3838"];
const COLOR_PAIRS = [
  { bg: "#ff783a", fg: "#111111" },
  { bg: "#152dff", fg: "#f4f1ea" },
  { bg: "#ec76e5", fg: "#111111" },
  { bg: "#cbf52a", fg: "#111111" },
  { bg: "#ff3838", fg: "#f4f1ea" },
];
let lastPaint = -1;

function paintChip(el) {
  let next = Math.floor(Math.random() * COLOR_PAIRS.length);
  if (COLOR_PAIRS.length > 1 && next === lastPaint) next = (next + 1) % COLOR_PAIRS.length;
  lastPaint = next;
  el.style.background = COLOR_PAIRS[next].bg;
  el.style.color = COLOR_PAIRS[next].fg;
}

function clearChip(el) {
  el.style.background = "";
  el.style.color = "";
}

document.addEventListener("pointerover", (e) => {
  const btn = e.target.closest(".ghost-btn, .tick:not(.tick-script)");
  if (!btn) return;
  const from = e.relatedTarget?.closest?.(".ghost-btn, .tick:not(.tick-script)");
  if (from === btn) return;
  paintChip(btn);
});

document.addEventListener("pointerout", (e) => {
  const btn = e.target.closest(".ghost-btn, .tick:not(.tick-script)");
  if (!btn) return;
  const to = e.relatedTarget?.closest?.(".ghost-btn, .tick:not(.tick-script)");
  if (to === btn) return;
  clearChip(btn);
});
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(pointer: coarse)").matches;

function syncChromeTop() {
  const bar = document.querySelector(".menubar");
  const strip = document.querySelector(".marquee");
  const top = (bar?.offsetHeight || 36) + (strip?.offsetHeight || 36);
  document.documentElement.style.setProperty("--chrome-top", `${top}px`);
}
syncChromeTop();
window.addEventListener("resize", syncChromeTop);
window.addEventListener("resize", () => {
  const vid = windowsRoot?.querySelector('[data-id="magua-video"]');
  if (vid) syncVideoCinema(vid);
});
window.addEventListener("orientationchange", () => {
  const vid = windowsRoot?.querySelector('[data-id="magua-video"]');
  if (vid) setTimeout(() => syncVideoCinema(vid), 120);
});

if (isTouch) document.body.classList.add("has-touch");

function isWideDesk() {
  return window.matchMedia("(min-width: 900px)").matches;
}

function iconHome(icon) {
  if (isWideDesk() && icon.dx != null) return { x: icon.dx, y: icon.dy };
  return { x: icon.x, y: icon.y };
}

const ICONS = [
  { id: "magua-video", label: "Publi.mp4", type: "video", color: "#f5c518", x: 37, y: 1, dx: 57, dy: 16 },
  { id: "pliego", label: "PLIEGO", type: "app", color: "#152dff", x: 71, y: 5, dx: 72, dy: 9 },
  { id: "about", label: "Sobre-mi.txt", type: "file", color: "#111", x: 80, y: 24, dx: 80, dy: 45 },
  { id: "carteleria", label: "Cartelería", type: "folder", color: "#cbf52a", x: 4, y: 52, dx: 23, dy: 5 },
  { id: "branding", label: "Branding", type: "folder", color: "#ec76e5", x: 27, y: 45, dx: 88, dy: 22 },
  { id: "mockups", label: "Mockups", type: "folder", color: "#ff783a", x: 7, y: 4, dx: 41, dy: 2 },
  { id: "photo", label: "Kilian.png", type: "image", color: "#111", x: 58, y: 43, dx: 61, dy: 49 },
  { id: "kojurebi", label: "Kojurebi", type: "app", color: "#ff783a", x: 32, y: 61, dx: 54, dy: 70 },
  { id: "cv", label: "CV.pdf", type: "file", color: "#111", x: 77, y: 56, dx: 86, dy: 76 },
  { id: "magua", label: "Magua Canaria", type: "app", color: "#0368aa", x: 66, y: 75, dx: 70, dy: 82 },
];

const FOLDER_FILES = {
  carteleria: [
    "Infografía.pdf",
    "MaguaAmarillo1.pdf",
    "MaguaAmarillo2.pdf",
    "MaguaAmarillo3.pdf",
    "MaguaAzul1.pdf",
    "MaguaAzul2.pdf",
    "MaguaAzul3.pdf",
    "MaguaBlanco1.pdf",
    "MaguaBlanco2.pdf",
    "MaguaBlanco3.pdf",
    "Terramare1.pdf",
    "Terramare2.pdf",
    "Terramare3.pdf",
  ],
  branding: ["Plafón_Legite.pdf", "Plafón_MaguaCanaria.pdf"],
  mockups: ["Cartel.jpg", "Mupi.jpg", "Totebag.jpg", "Tríptico.jpg", "VallaPublicitaria.jpg"],
};

function folderWindowHTML(id, title, lead, dir) {
  const files = FOLDER_FILES[id] || [];
  return `
      <div class="folder-list-pane">
        <h2>( ${title} )</h2>
        <p>${lead}</p>
        <ul class="file-list">
          ${files
            .map(
              (name) => `
            <li>
              <button type="button" class="file-link" data-pdf-dir="${dir}" data-pdf-name="${name}">${name}</button>
            </li>`
            )
            .join("")}
        </ul>
      </div>
      <div class="folder-viewer" hidden>
        <div class="folder-viewer-bar">
          <span class="folder-viewer-name"></span>
          <div class="folder-zoom">
            <button type="button" class="folder-zoom-out" aria-label="Reducir">−</button>
            <button type="button" class="folder-zoom-in" aria-label="Ampliar">+</button>
          </div>
          <button type="button" class="ghost-btn folder-viewer-close">cerrar</button>
        </div>
        <div class="folder-viewer-stage">
          <img class="folder-viewer-img" alt="" draggable="false" />
        </div>
      </div>`;
}

const WINDOWS = {
  kojurebi: {
    title: "Kojurebi /",
    html: `
      <div class="project-head">
        <div class="brand-frame brand-frame-kojurebi">
          <img class="brand-open" src="assets/works/kojurebi/avatar.png" alt="Kojurebi — cerezas gemelas" />
        </div>
        <h2>( Kojurebi )</h2>
        <div class="cv-actions">
          <a class="ghost-btn" href="works/kojurebi.html">entrar a la web</a>
          <a class="ghost-btn" href="https://github.com/kiliante2000-source/Kojurebi" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
      <p>Tienda online del estudio de ilustración. Prints, stickers y originales.</p>`
  },
  pliego: {
    title: "PLIEGO /",
    html: `
      <div class="project-head">
        <div class="brand-frame brand-frame-pliego">
          <img class="brand-open" src="assets/works/pliego/icon.svg" alt="PLIEGO — marca editorial" />
        </div>
        <h2>( PLIEGO )</h2>
        <div class="cv-actions">
          <a class="ghost-btn" href="works/pliego.html">entrar a la web</a>
          <a class="ghost-btn" href="https://github.com/kiliante2000-source/Pliego_TFM_KilianTorres" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
      <p>Estudio editorial visual. Crea, versiona y publica revistas y portadas en el navegador.</p>`
  },
  magua: {
    title: "Magua Canaria /",
    html: `
      <div class="project-head">
        <div class="brand-frame brand-frame-magua">
          <img class="brand-open" src="assets/works/magua/logo.png" alt="Magua Canaria — figura, ola y sol" />
        </div>
        <h2>( Magua Canaria )</h2>
        <div class="cv-actions">
          <a class="ghost-btn" href="works/magua.html">entrar a la web</a>
          <a class="ghost-btn" href="https://github.com/kiliante2000-source/magua-canaria" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
      <p>Campaña de concienciación y valorización de la cultura canaria: lengua, territorio y tradiciones.</p>`
  },
  "magua-video": {
    title: "Publi.mp4",
    html: `
      <video
        class="video-open"
        poster="assets/works/magua/spot.jpg"
        controls
        playsinline
        webkit-playsinline
        preload="metadata"
        controlslist="nodownload"
      >
        <source src="assets/works/magua/spot.mp4" type="video/mp4" />
      </video>`,
  },
  carteleria: {
    title: "Cartelería /",
    html: folderWindowHTML(
      "carteleria",
      "Cartelería",
      "Clic para ver aquí. Cerrar vuelve a la lista.",
      "carteleria"
    ),
  },
  branding: {
    title: "Branding /",
    html: folderWindowHTML(
      "branding",
      "Branding",
      "Clic para ver aquí. Cerrar vuelve a la lista.",
      "branding"
    ),
  },
  mockups: {
    title: "Mockups /",
    html: folderWindowHTML(
      "mockups",
      "Mockups",
      "Clic para ver aquí. Cerrar vuelve a la lista.",
      "mockups"
    ),
  },
  photo: {
    title: "Kilian.png",
    html: `<img class="photo-open" src="assets/photo.jpg" alt="Kilian Torres sentado en un banco" draggable="false" nopin="nopin" decoding="async" />`,
  },
  about: {
    title: "Sobre-mi.txt",
    html: `
      <h2>( Sobre mí )</h2>
      <p>Diseñador gráfico con perfil digital y formación en desarrollo web. Combino identidad visual, comunicación, diseño editorial y experiencia de usuario con herramientas de programación para desarrollar soluciones visuales coherentes, funcionales y actuales.</p>
      <p>Santa Cruz de Tenerife, Islas Canarias</p>`,
  },
  mail: {
    title: "Correo /",
    html: `
      <h2>( Correo )</h2>
      <p>Si te interesa el portfolio para un encargo, una colaboración o una entrevista, escribe aquí y el mensaje sale hacia kiliante2000@gmail.com.</p>
      <form class="mail-form" data-mail-form>
        <div class="mail-row">
          <span>Para</span>
          <p class="mail-to">kiliante2000@gmail.com</p>
        </div>
        <label class="mail-row">
          <span>De</span>
          <input name="from" type="text" required maxlength="80" autocomplete="name" placeholder="Tu nombre" data-cursor="text" />
        </label>
        <label class="mail-row">
          <span>Email</span>
          <input name="email" type="email" required maxlength="120" autocomplete="email" placeholder="tu@email.com" data-cursor="text" />
        </label>
        <label class="mail-row">
          <span>Asunto</span>
          <input name="subject" type="text" required maxlength="120" value="Portfolio — colaboración" data-cursor="text" />
        </label>
        <label class="mail-row mail-row-body">
          <span>Texto</span>
          <textarea name="body" required rows="5" maxlength="2000" placeholder="Hola Kilian, me interesa…" data-cursor="text"></textarea>
        </label>
        <div class="cv-actions">
          <button type="submit" class="ghost-btn">enviar</button>
          <button type="button" class="ghost-btn mail-copy">copiar correo</button>
        </div>
        <p class="mail-status" hidden></p>
      </form>`,
  },
  cv: {
    title: "CV.pdf",
    html: `
      <h2>( Currículum )</h2>
      <p>El CV es la primera vista de este portfolio. Vuelve a la ficha completa con los círculos en movimiento.</p>
      <div class="cv-actions">
        <a class="ghost-btn" href="index.html">abrir CV</a>
      </div>`,
  },
  trash: {
    title: "Trash",
    html: `<h2>( Papelera )</h2><p>Vacía. Aquí irán los descartes, versiones viejas y archivos que no sobrevivan al escritorio.</p>`,
  },
  finder: {
    title: "Escritorio /",
    html: "",
  },
};

function splitChars(el) {
  const text = el.textContent;
  el.textContent = "";
  [...text].forEach((char, i) => {
    const span = document.createElement("span");
    span.className = char === " " ? "ch ch-space" : "ch";
    span.style.setProperty("--i", i);
    span.textContent = char === " " ? "\u00a0" : char;
    el.appendChild(span);
  });
  return [...el.querySelectorAll(".ch")];
}

const welcomeChars = splitChars(document.getElementById("welcome"));
const scriptChars = splitChars(document.getElementById("script"));
const allChars = [...welcomeChars, ...scriptChars];
const clickedUntil = new WeakMap();
let motionT = 0;
const charMeta = allChars.map((ch, i) => ({
  el: ch,
  i: Number(ch.style.getPropertyValue("--i")) || i,
  script: ch.parentElement?.id === "script",
  last: "",
}));

function cacheCharRest() {
  allChars.forEach((ch) => {
    ch.style.transform = "";
    const r = ch.getBoundingClientRect();
    ch.dataset.cx = String(r.left + r.width / 2);
    ch.dataset.cy = String(r.top + r.height / 2);
  });
  charMeta.forEach((item) => {
    item.last = "";
  });
}

function tickClock() {
  const el = document.getElementById("clock");
  const now = new Date();
  el.textContent = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
tickClock();
setInterval(tickClock, 1000);

const TICKS = [
  { t: "identidad visual", k: "script", c: "orange" },
  { t: "dirección creativa", k: "fill", c: "blue" },
  { t: "UI/UX", k: "fill", c: "pink" },
  { t: "diseño web", k: "script", c: "lime" },
  { t: "packaging", k: "fill", c: "red" },
  { t: "infografía", k: "fill", c: "orange" },
  { t: "merchandising", k: "script", c: "blue" },
  { t: "ilustración", k: "fill", c: "lime" },
  { t: "fotografía", k: "fill", c: "pink" },
  { t: "audiovisual", k: "script", c: "red" },
  { t: "HTML & CSS", k: "fill", c: "orange" },
  { t: "JavaScript", k: "fill", c: "blue" },
  { t: "TypeScript", k: "script", c: "pink" },
  { t: "Python", k: "fill", c: "lime" },
  { t: "Django", k: "fill", c: "red" },
];
const TICK_DOTS = ["orange", "blue", "pink", "lime", "red"];

function tickRunHTML() {
  return TICKS.map((item, i) => {
    const cls = item.k === "script" ? `tick tick-script is-${item.c}` : `tick is-${item.c}`;
    return `<span class="${cls}">${item.t}</span><span class="tick-dot is-${TICK_DOTS[i % 5]}"></span>`;
  }).join("");
}

const marqueeTrack = document.getElementById("marquee-track");
if (marqueeTrack) {
  const run = `<div class="marquee-run">${tickRunHTML()}</div>`;
  marqueeTrack.innerHTML = run + run;
  syncChromeTop();
}

const ring = document.getElementById("cursor-ring");
const dot = document.getElementById("cursor-dot");
let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
let ringPos = { ...mouse };

window.addEventListener("pointermove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  if (dot) dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
});

function loopCursor() {
  ringPos.x += (mouse.x - ringPos.x) * 0.18;
  ringPos.y += (mouse.y - ringPos.y) * 0.18;
  if (ring) ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
  requestAnimationFrame(loopCursor);
}
if (!isTouch && !prefersReduced) loopCursor();

document.addEventListener("pointerover", (e) => {
  const hover = e.target.closest("[data-cursor='hover'], .desk-icon, .dock-item, .traffic button, .ghost-btn");
  const text = e.target.closest("[data-cursor='text'], .ch");
  document.body.classList.toggle("is-hover", Boolean(hover) && !text);
  document.body.classList.toggle("is-text", Boolean(text));
});

function magnetize() {
  if (!document.hidden) {
    motionT += 0.05;
    const now = performance.now();
    for (const item of charMeta) {
      if ((clickedUntil.get(item.el) || 0) > now) continue;
      const cx = Number(item.el.dataset.cx);
      const cy = Number(item.el.dataset.cy);
      const dx = mouse.x - cx;
      const dy = mouse.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const pull = Math.max(0, 1 - dist / 190);
      const wave = item.script ? Math.sin(motionT + item.i * 0.5) * 11 : 0;
      const x = (dx / dist) * pull * 22;
      const y = (dy / dist) * pull * 16 + wave;
      const rot = pull * (dx > 0 ? 12 : -12) + (item.script ? Math.sin(motionT / 2 + item.i) * 4 : 0);
      const next = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      if (item.last === next) continue;
      item.last = next;
      item.el.style.transform = next;
    }
  }
  requestAnimationFrame(magnetize);
}

if (!prefersReduced) {
  setTimeout(() => {
    cacheCharRest();
    magnetize();
  }, 900);
  window.addEventListener("resize", cacheCharRest);
  document.fonts?.ready.then(cacheCharRest);
  window.addEventListener("load", cacheCharRest, { once: true });
}

allChars.forEach((ch, idx) => {
  ch.addEventListener("click", () => {
    if (prefersReduced) return;
    const jump = 50 + Math.random() * 90;
    const rot = (Math.random() - 0.5) * 90;
    clickedUntil.set(ch, performance.now() + 520);
    ch.style.transition = "transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)";
    ch.style.transform = `translate3d(${(Math.random() - 0.5) * 100}px, ${-jump}px, 0) rotate(${rot}deg) scale(1.4)`;
    if (charMeta[idx]) charMeta[idx].last = "";
    setTimeout(() => {
      ch.style.transition = "";
    }, 520);
  });
});

const year = document.getElementById("year");
if (year) {
  const frame = document.getElementById("os-frame");
  let start = null;
  let moved = false;

  function chromeTopPx() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--chrome-top")) || 72;
  }

  function clampYear(left, top) {
    const w = year.offsetWidth || 64;
    const h = year.offsetHeight || 40;
    const minT = chromeTopPx();
    const maxL = Math.max(0, frame.clientWidth - w);
    const maxT = Math.max(minT, frame.clientHeight - h - 8);
    return {
      left: Math.min(maxL, Math.max(0, left)),
      top: Math.min(maxT, Math.max(minT, top)),
    };
  }

  function parkYear() {
    if (!frame || year.classList.contains("is-free")) return;
    year.classList.add("is-free");
    frame.appendChild(year);
    const minT = chromeTopPx();
    const wide = isWideDesk();
    const pos = clampYear(
      frame.clientWidth * (wide ? 0.36 : 0.545),
      minT + (frame.clientHeight - minT) * (wide ? 0.58 : 0.52)
    );
    year.style.left = `${pos.left}px`;
    year.style.top = `${pos.top}px`;
    year.style.right = "auto";
  }

  requestAnimationFrame(() => requestAnimationFrame(parkYear));
  document.fonts?.ready.then(() => {
    if (!year.classList.contains("is-free")) parkYear();
  });

  year.addEventListener("pointerdown", (e) => {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    parkYear();
    moved = false;
    year.classList.add("is-dragging");
    year.setPointerCapture(e.pointerId);
    start = {
      x: e.clientX,
      y: e.clientY,
      left: year.offsetLeft,
      top: year.offsetTop,
    };
  });

  year.addEventListener("pointermove", (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.hypot(dx, dy) > 3) moved = true;
    if (!moved) return;
    const pos = clampYear(start.left + dx, start.top + dy);
    year.style.left = `${pos.left}px`;
    year.style.top = `${pos.top}px`;
  });

  const endYearDrag = () => {
    if (!start) return;
    start = null;
    year.classList.remove("is-dragging");
    if (!moved) {
      year.style.animationDuration = year.style.animationDuration === "2s" ? "12s" : "2s";
    }
  };
  year.addEventListener("pointerup", endYearDrag);
  year.addEventListener("pointercancel", endYearDrag);
}

function folderSVG(color) {
  return `<svg class="folder-svg" viewBox="0 0 52 44" aria-hidden="true">
    <path d="M2 10h16l4 5h28v23c0 2-2 4-4 4H6c-2 0-4-2-4-4V10z" fill="${color}"/>
    <path d="M2 18h48v20c0 2-2 4-4 4H6c-2 0-4-2-4-4V18z" fill="${color}" opacity=".85"/>
    <path d="M2 10h16l4 5H2z" fill="#111" opacity=".18"/>
  </svg>`;
}

function fileSVG(fill = "#f8f7f4") {
  return `<svg class="file-svg" viewBox="0 0 52 44" overflow="visible" aria-hidden="true">
    <path d="M15.2 3.2h13.6L38.8 13.2v23.6c0 1.6-1.3 2.9-2.9 2.9H15.2c-1.6 0-2.9-1.3-2.9-2.9V6.1c0-1.6 1.3-2.9 2.9-2.9z" fill="${fill}" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M28.8 3.2v10h10" fill="none" stroke="#111" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M18.6 22.6h14.6M18.6 28.6h10.4" fill="none" stroke="#111" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;
}

function imageGlyph() {
  return `<span class="icon-glyph icon-photo" aria-hidden="true"></span>`;
}

function videoGlyph() {
  return `<span class="icon-glyph">${videoSVG()}</span>`;
}

function videoSVG() {
  return `<svg class="file-svg video-svg" viewBox="0 0 52 44" overflow="visible" aria-hidden="true">
    <path d="M15.2 3.2h13.6L38.8 13.2v23.6c0 1.6-1.3 2.9-2.9 2.9H15.2c-1.6 0-2.9-1.3-2.9-2.9V6.1c0-1.6 1.3-2.9 2.9-2.9z" fill="#f8f7f4" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M28.8 3.2v10h10" fill="none" stroke="#111" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
    <rect x="17.2" y="18" width="17.6" height="12.8" rx="1.2" fill="#1e1d1d" stroke="#111" stroke-width="1.3"/>
    <path d="M23.4 21v6.8l6.6-3.4z" fill="#f5c518" stroke="#111" stroke-width="1.15" stroke-linejoin="round"/>
  </svg>`;
}

function trashCanSVG() {
  return `<svg class="trash-can" viewBox="0 0 48 48" overflow="visible" aria-hidden="true">
    <g class="trash-lid">
      <rect x="17" y="2" width="14" height="4.4" rx="1.3" fill="#f4f1ea" stroke="#111" stroke-width="1.4"/>
      <rect x="7.2" y="6.4" width="33.6" height="5.2" rx="1.5" fill="#ece8dc" stroke="#111" stroke-width="1.4"/>
    </g>
    <path d="M10.2 13.6h27.6l-2.4 28.6H12.6z" fill="#d9d4c6" stroke="#111" stroke-width="1.4"/>
    <path d="M18.2 18.8v18.4M24 18.8v18.4M29.8 18.8v18.4" fill="none" stroke="#111" stroke-width="1.4" opacity=".5"/>
    <g class="trash-papers">
      <rect x="16" y="22" width="14" height="9.2" rx="1" transform="rotate(-8 23 26.6)" fill="#f8f7f4" stroke="#111" stroke-width="1.4"/>
      <rect x="19" y="26.4" width="13" height="8.2" rx="1" transform="rotate(7 25.5 30.5)" fill="#ff783a" stroke="#111" stroke-width="1.4"/>
    </g>
  </svg>`;
}

const iconsRoot = document.getElementById("icons");
const windowsRoot = document.getElementById("windows");
const dockTrash = document.getElementById("dock-trash");
let zTop = 20;
const trashBin = [];

function glyphFor(icon) {
  if (icon.type === "app") {
    const extra =
      icon.id === "pliego"
        ? " icon-app-pliego"
        : icon.id === "magua"
          ? " icon-app-magua"
          : " icon-app-kojurebi";
    return `<span class="icon-glyph icon-app${extra}" aria-hidden="true"></span>`;
  }
  if (icon.type === "folder") return `<span class="icon-glyph">${folderSVG(icon.color)}</span>`;
  if (icon.type === "image") return imageGlyph();
  if (icon.type === "video") return videoGlyph();
  return `<span class="icon-glyph">${fileSVG()}</span>`;
}

function iconById(id) {
  return ICONS.find((icon) => icon.id === id);
}

function kindLabel(type) {
  if (type === "app") return "app";
  if (type === "folder") return "carpeta";
  if (type === "image") return "imagen";
  if (type === "video") return "vídeo";
  return "archivo";
}

function desktopItems() {
  const trashed = new Set(trashBin.map((item) => item.id));
  return ICONS.filter((icon) => !trashed.has(icon.id));
}

function finderHTML() {
  const items = desktopItems();
  if (!items.length) {
    return `<h2>( Escritorio )</h2><p>Vacío. Saca algo de la papelera para volver a verlo aquí.</p>`;
  }
  return `
    <h2>( Escritorio )</h2>
    <p>Lo que hay ahora mismo en el escritorio. Clic abre la carpeta o el archivo.</p>
    <div class="finder-list">
      ${items
        .map(
          (item) => `
        <button type="button" class="finder-row" data-open="${item.id}" data-cursor="hover">
          <span class="finder-mini">${glyphFor(item)}</span>
          <span class="finder-name">${item.label}</span>
          <span class="finder-kind">${kindLabel(item.type)}</span>
        </button>`
        )
        .join("")}
    </div>`;
}

function bindFinderWindow(win) {
  win.querySelectorAll("[data-open]").forEach((row) => {
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      openWindow(row.getAttribute("data-open"));
    });
  });
}

function refreshFinderWindow() {
  const win = windowsRoot.querySelector('[data-id="finder"]');
  if (!win) return;
  win.querySelector(".window-body").innerHTML = finderHTML();
  bindFinderWindow(win);
}

function deskButton(id) {
  return iconsRoot.querySelector(`.desk-icon[data-id="${id}"]`);
}

function trashHTML() {
  if (!trashBin.length) {
    return `<h2>( Papelera )</h2><p>Vacía. Arrastra carpetas o archivos al cubo del dock para tirarlos. Luego puedes sacarlos de aquí.</p>`;
  }
  return `
    <h2>( Papelera )</h2>
    <p>${trashBin.length} ${trashBin.length === 1 ? "archivo" : "archivos"}. Arrástralos al escritorio o pulsa sacar.</p>
    <ul class="trash-list">
      ${trashBin
        .map(
          (item) => `
        <li data-restore="${item.id}">
          <span class="trash-mini">${glyphFor(item)}</span>
          <span>${item.label}</span>
          <button type="button" class="ghost-btn" data-takeout="${item.id}">sacar</button>
        </li>`
        )
        .join("")}
    </ul>`;
}

function refreshTrashWindow() {
  const win = windowsRoot.querySelector('[data-id="trash"]');
  if (!win) return;
  win.querySelector(".window-body").innerHTML = trashHTML();
  bindTrashWindow(win);
}

function bindTrashWindow(win) {
  win.querySelectorAll("[data-takeout]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      restoreFromTrash(btn.getAttribute("data-takeout"));
    });
  });
  win.querySelectorAll(".trash-list li").forEach((row) => enableTrashRowDrag(row));
}

function updateTrashDock() {
  if (!dockTrash) return;
  dockTrash.classList.toggle("is-full", trashBin.length > 0);
  const badge = dockTrash.querySelector(".dock-badge");
  if (badge) {
    badge.textContent = String(trashBin.length);
    badge.hidden = trashBin.length === 0;
  }
  const label = dockTrash.querySelector(".dock-label");
  if (label) label.textContent = trashBin.length ? `papelera (${trashBin.length})` : "papelera";
}

function isOverEl(el, x, y, pad = 0) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
}

function overTrashDrop(x, y) {
  return isOverEl(dockTrash, x, y, 22) || isOverEl(windowsRoot.querySelector('[data-id="trash"]'), x, y, 0);
}

function pointInIcons(clientX, clientY) {
  const parent = iconsRoot.getBoundingClientRect();
  return clampDeskIcon(null, clientX - parent.left - 46, clientY - parent.top - 28);
}

function clampDeskIcon(btn, left, top) {
  const w = btn?.offsetWidth || 92;
  const h = btn?.offsetHeight || 88;
  const maxL = Math.max(0, iconsRoot.clientWidth - w);
  const maxT = Math.max(0, iconsRoot.clientHeight - h);
  return {
    left: Math.min(maxL, Math.max(0, left)),
    top: Math.min(maxT, Math.max(0, top)),
  };
}

function flyToTrash(btn) {
  const from = btn.getBoundingClientRect();
  const to = dockTrash?.getBoundingClientRect();
  if (!to) return;
  const ghost = btn.cloneNode(true);
  ghost.classList.add("desk-ghost");
  ghost.style.left = `${from.left}px`;
  ghost.style.top = `${from.top}px`;
  ghost.style.width = `${from.width}px`;
  document.body.appendChild(ghost);
  const dx = to.left + to.width / 2 - from.width / 2 - from.left;
  const dy = to.top + to.height / 2 - from.height / 2 - from.top;
  const anim = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.18)`, opacity: 0.15 },
    ],
    { duration: prefersReduced ? 1 : 420, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
  );
  anim.finished.then(() => ghost.remove()).catch(() => ghost.remove());
}

function putInTrash(id) {
  const icon = iconById(id);
  const btn = deskButton(id);
  if (!icon || !btn || btn.hidden) return;
  trashBin.push({
    ...icon,
    left: btn.style.left,
    top: btn.style.top,
  });
  flyToTrash(btn);
  btn.hidden = true;
  btn.classList.remove("is-dragging", "is-selected");
  bounceDock(dockTrash);
  dockTrash?.classList.add("is-open");
  setTimeout(() => dockTrash?.classList.remove("is-open", "is-drop"), 380);
  updateTrashDock();
  refreshTrashWindow();
  refreshFinderWindow();
}

function restoreFromTrash(id, drop) {
  const stored = trashBin.find((item) => item.id === id);
  const btn = deskButton(id);
  if (!stored || !btn) return;
  trashBin.splice(trashBin.findIndex((item) => item.id === id), 1);
  btn.hidden = false;
  const rawL = drop ? drop.left : parseFloat(stored.left) || 0;
  const rawT = drop ? drop.top : parseFloat(stored.top) || 0;
  const pos = clampDeskIcon(btn, rawL, rawT);
  btn.style.left = `${pos.left}px`;
  btn.style.top = `${pos.top}px`;
  document.querySelectorAll(".desk-icon").forEach((n) => n.classList.remove("is-selected"));
  btn.classList.add("is-selected");
  updateTrashDock();
  refreshTrashWindow();
  refreshFinderWindow();
}

function enableTrashRowDrag(row) {
  const id = row.getAttribute("data-restore");
  let start = null;
  let ghost = null;
  row.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    start = { x: e.clientX, y: e.clientY };
    row.setPointerCapture(e.pointerId);
  });
  row.addEventListener("pointermove", (e) => {
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6 && !ghost) return;
    if (!ghost) {
      ghost = row.cloneNode(true);
      ghost.classList.add("trash-ghost");
      document.body.appendChild(ghost);
      document.body.classList.add("is-file-drag");
    }
    ghost.style.left = `${e.clientX - 40}px`;
    ghost.style.top = `${e.clientY - 18}px`;
    dockTrash?.classList.toggle("is-drop", overTrashDrop(e.clientX, e.clientY));
  });
  const end = (e) => {
    if (ghost) ghost.remove();
    ghost = null;
    document.body.classList.remove("is-file-drag");
    dockTrash?.classList.remove("is-drop", "is-open");
    if (start && e && !overTrashDrop(e.clientX, e.clientY) && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) {
      restoreFromTrash(id, pointInIcons(e.clientX, e.clientY));
    }
    start = null;
  };
  row.addEventListener("pointerup", end);
  row.addEventListener("pointercancel", end);
}

function dockItemFor(id) {
  const map = {
    finder: '[data-window="finder"].dock-item',
    about: '[data-window="about"].dock-item',
    photo: '[data-window="photo"].dock-item',
    trash: "#dock-trash",
  };
  return map[id] ? document.querySelector(map[id]) : null;
}

function bringToFront(win) {
  zTop += 1;
  win.style.zIndex = zTop;
  win.classList.remove("is-min");
  dockItemFor(win.dataset.id)?.classList.remove("has-min");
}

function sizeWindow(win, id) {
  const maxW = Math.max(240, windowsRoot.clientWidth - 28);
  const maxH = Math.max(180, windowsRoot.clientHeight - 28);
  const wide = isWideDesk();
  const sizes = wide
    ? {
        kojurebi: 520,
        pliego: 520,
        magua: 540,
        about: 500,
        cv: 440,
        carteleria: 480,
        branding: 460,
        mockups: 460,
        finder: 540,
        trash: 460,
        mail: 500,
      }
    : {
        kojurebi: 360,
        pliego: 360,
        magua: 380,
        about: 360,
        cv: 340,
        carteleria: 360,
        branding: 340,
        mockups: 340,
        finder: 380,
        trash: 340,
        mail: 360,
      };

  if (id === "photo") {
    win.classList.add("is-photo");
    sizeImageWindow(win, maxW, maxH, ".photo-open", wide ? 320 : 250, wide ? 430 : 340);
    return;
  }

  if (id === "magua-video") {
    win.classList.add("is-video");
    sizeVideoWindow(win, maxW, maxH);
    return;
  }

  if (id === "kojurebi" || id === "pliego" || id === "magua") {
    win.classList.add("is-app");
  }

  const w = sizes[id] || (wide ? 440 : 320);
  win.style.width = `${Math.min(w, maxW)}px`;
  fitWindowHeight(win, maxH);
  const img = win.querySelector(".brand-open, .photo-open");
  if (img && !img.complete) {
    img.addEventListener("load", () => {
      fitWindowHeight(win, maxH);
      placeWindowSoon(win);
    }, { once: true });
  }
  placeWindowSoon(win);
}

function fitWindowHeight(win, maxH) {
  const body = win.querySelector(".window-body");
  if (body) {
    body.style.flex = "0 0 auto";
    body.style.overflow = "visible";
  }
  win.style.height = "auto";
  const needed = win.offsetHeight;
  const height = Math.min(maxH, needed);
  win.style.height = `${Math.round(height)}px`;
  if (body) {
    body.style.overflow = needed > maxH ? "auto" : "hidden";
  }
}

function sizeImageWindow(win, maxW, maxH, selector, capW, capH) {
  const img = win.querySelector(selector);
  const apply = () => {
    const ratio = (img.naturalWidth || 818) / (img.naturalHeight || 1152);
    const pad = 16;
    const bar = win.querySelector(".window-bar")?.offsetHeight || 36;
    const frame = 3;
    const imgMaxW = Math.min(capW, maxW) - pad * 2 - frame;
    const imgMaxH = Math.min(capH, maxH) - bar - pad * 2 - frame;
    let ih = imgMaxH;
    let iw = ih * ratio;
    if (iw > imgMaxW) {
      iw = imgMaxW;
      ih = iw / ratio;
    }
    win.style.width = `${Math.round(iw + pad * 2 + frame)}px`;
    win.style.height = `${Math.round(ih + bar + pad * 2 + frame)}px`;
    placeWindowSoon(win);
  };

  if (img && img.complete && img.naturalWidth) {
    apply();
    return;
  }
  win.style.width = `${Math.min(capW, maxW)}px`;
  win.style.height = `${Math.min(capH, maxH)}px`;
  placeWindowSoon(win);
  img?.addEventListener("load", apply, { once: true });
}

function sizeVideoWindow(win, maxW, maxH) {
  if (win.classList.contains("is-cinema")) return;
  const pad = 16;
  const bar = win.querySelector(".window-bar")?.offsetHeight || 36;
  const frame = 3;
  const ratio = 16 / 9;
  const wide = isWideDesk();
  const vidMaxW = Math.min(wide ? 720 : 440, maxW) - pad * 2 - frame;
  const vidMaxH = Math.min(wide ? 440 : 300, maxH) - bar - pad * 2 - frame;
  let vw = vidMaxW;
  let vh = vw / ratio;
  if (vh > vidMaxH) {
    vh = vidMaxH;
    vw = vh * ratio;
  }
  win.style.width = `${Math.round(vw + pad * 2 + frame)}px`;
  win.style.height = `${Math.round(vh + bar + pad * 2 + frame)}px`;
  placeWindowSoon(win);
}

function isMobileView() {
  return isTouch || window.matchMedia("(max-width: 899px)").matches;
}

function syncVideoCinema(win) {
  if (!win?.isConnected || win.classList.contains("is-min")) {
    win?.classList.remove("is-cinema");
    document.body.classList.remove("is-cinema");
    return;
  }
  const cinema = isMobileView() && window.matchMedia("(orientation: landscape)").matches;
  win.classList.toggle("is-cinema", cinema);
  document.body.classList.toggle("is-cinema", cinema);
  if (!cinema) {
    const maxW = Math.max(240, windowsRoot.clientWidth - 28);
    const maxH = Math.max(180, windowsRoot.clientHeight - 28);
    sizeVideoWindow(win, maxW, maxH);
  }
}

function bindVideoWindow(win) {
  syncVideoCinema(win);
}

function pauseWindowMedia(win) {
  win.querySelectorAll("video").forEach((v) => v.pause());
  win.classList.remove("is-cinema");
  document.body.classList.remove("is-cinema");
}

function placeWindow(win) {
  if (!win || win.classList.contains("is-max") || win.classList.contains("is-cinema")) return;
  const parent = windowsRoot.getBoundingClientRect();
  const w = win.offsetWidth || parseFloat(win.style.width) || 300;
  const h = win.offsetHeight || parseFloat(win.style.height) || 200;
  const chrome =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--chrome-top")) || 72;
  const left = Math.round((parent.width - w) / 2);
  const top = Math.round((parent.height - h) / 2);
  win.style.left = `${Math.max(10, left)}px`;
  win.style.top = `${Math.max(chrome + 8, top)}px`;
}

function placeWindowSoon(win) {
  placeWindow(win);
  requestAnimationFrame(() => placeWindow(win));
}

function saveWinBox(win) {
  win.dataset.left = win.style.left;
  win.dataset.top = win.style.top;
  win.dataset.width = win.style.width || `${win.offsetWidth}px`;
  win.dataset.height = win.style.height || `${win.offsetHeight}px`;
}

function toggleMax(win) {
  if (win.classList.contains("is-max")) {
    win.classList.remove("is-max");
    win.style.left = win.dataset.left || "48px";
    win.style.top = win.dataset.top || "64px";
    win.style.width = win.dataset.width || "300px";
    win.style.height = win.dataset.height || "200px";
  } else {
    saveWinBox(win);
    win.classList.add("is-max");
    win.style.left = "";
    win.style.top = "";
    win.style.width = "";
    win.style.height = "";
  }
}

function enableResize(win) {
  ["n", "s", "e", "w", "ne", "nw", "se", "sw"].forEach((dir) => {
    const handle = document.createElement("span");
    handle.className = `win-resize ${dir}`;
    win.appendChild(handle);
    handle.addEventListener("pointerdown", (e) => {
      if (win.classList.contains("is-max")) return;
      e.preventDefault();
      e.stopPropagation();
      handle.setPointerCapture(e.pointerId);
      const parent = windowsRoot.getBoundingClientRect();
      const rect = win.getBoundingClientRect();
      const start = {
        x: e.clientX,
        y: e.clientY,
        left: rect.left - parent.left,
        top: rect.top - parent.top,
        width: rect.width,
        height: rect.height,
      };
      const onMove = (ev) => {
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        let left = start.left;
        let top = start.top;
        let width = start.width;
        let height = start.height;
        if (dir.includes("e")) width = start.width + dx;
        if (dir.includes("s")) height = start.height + dy;
        if (dir.includes("w")) {
          width = start.width - dx;
          left = start.left + dx;
        }
        if (dir.includes("n")) {
          height = start.height - dy;
          top = start.top + dy;
        }
        const minW = 220;
        const minH = 140;
        if (width < minW) {
          if (dir.includes("w")) left -= minW - width;
          width = minW;
        }
        if (height < minH) {
          if (dir.includes("n")) top -= minH - height;
          height = minH;
        }
        left = Math.max(0, left);
        top = Math.max(36, top);
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
        win.style.width = `${width}px`;
        win.style.height = `${height}px`;
      };
      const onUp = () => {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
      };
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);
    });
  });
}

function openWindow(id) {
  if (id === "cv") {
    window.location.href = "index.html";
    return;
  }
  const spec = WINDOWS[id];
  if (!spec) return;
  const existing = windowsRoot.querySelector(`[data-id="${id}"]`);
  if (existing) {
    bringToFront(existing);
    existing.style.transform = "";
    placeWindowSoon(existing);
    if (id === "trash") refreshTrashWindow();
    if (id === "finder") refreshFinderWindow();
    if (id === "mail") existing.querySelector("[name=from]")?.focus();
    return;
  }

  const win = document.createElement("article");
  win.className = "window";
  win.dataset.id = id;
  bringToFront(win);
  const body = id === "trash" ? trashHTML() : id === "finder" ? finderHTML() : spec.html;
  win.innerHTML = `
    <div class="window-bar">
      <div class="traffic">
        <button class="t-close" data-act="close" aria-label="Cerrar"></button>
        <button class="t-min" data-act="min" aria-label="Minimizar"></button>
        <button class="t-max" data-act="max" aria-label="Ampliar"></button>
      </div>
      <span class="window-title">${spec.title}</span>
    </div>
    <div class="window-body">${body}</div>`;
  windowsRoot.appendChild(win);
  sizeWindow(win, id);
  if (id === "trash") bindTrashWindow(win);
  if (id === "finder") bindFinderWindow(win);
  if (isFolderId(id)) bindPdfRows(win);
  if (id === "magua-video") bindVideoWindow(win);
  if (id === "mail") bindMailWindow(win);
  wireWindow(win, id);
}

const MAIL_TO = "kiliante2000@gmail.com";

function bindMailWindow(win) {
  const form = win.querySelector("[data-mail-form]");
  const status = win.querySelector(".mail-status");
  const copyBtn = win.querySelector(".mail-copy");
  form?.querySelector("[name=from]")?.focus();

  const setStatus = (text) => {
    if (!status) return;
    status.hidden = false;
    status.textContent = text;
  };

  const compose = () => {
    const data = new FormData(form);
    const name = String(data.get("from") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "").trim() || "Portfolio — colaboración";
    const message = String(data.get("body") || "").trim();
    const body = `${message}\n\n— ${name}\n${email}`;
    return {
      name,
      email,
      message,
      subject,
      mailto: `mailto:${MAIL_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${MAIL_TO}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    };
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const mail = compose();
    if (!mail.name || !mail.email || !mail.message) {
      setStatus("Faltan nombre, correo o mensaje.");
      return;
    }
    if (isTouch) {
      window.location.href = mail.mailto;
      setStatus("Se abre tu correo para enviarlo.");
      return;
    }
    const tab = window.open(mail.gmail, "_blank", "noopener,noreferrer");
    if (!tab) window.location.href = mail.mailto;
    setStatus("Se abre Gmail con el mensaje listo. Pulsa enviar allí.");
  });

  copyBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(MAIL_TO);
      setStatus("correo copiado");
    } catch {
      setStatus(MAIL_TO);
    }
  });
}

function bindPdfRows(win) {
  const closeBtn = win.querySelector(".folder-viewer-close");
  bindFolderZoom(win);

  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeFolderPreview(win);
  });

  win.querySelectorAll("[data-pdf-dir]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { pdfDir, pdfName } = btn.dataset;
      if (win.dataset.preview === pdfName) {
        closeFolderPreview(win);
        return;
      }
      openFolderPreview(win, pdfDir, pdfName);
    });
  });

  win.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && win.dataset.preview) closeFolderPreview(win);
  });
}

function bindFolderZoom(win) {
  const stage = win.querySelector(".folder-viewer-stage");
  const img = win.querySelector(".folder-viewer-img");
  const zoomIn = win.querySelector(".folder-zoom-in");
  const zoomOut = win.querySelector(".folder-zoom-out");
  if (!stage || !img) return;

  const z = { scale: 1, x: 0, y: 0, min: 1, max: 4 };
  const pointers = new Map();
  let pinch0 = null;
  let pan0 = null;
  let lastTap = 0;

  const apply = () => {
    const extraW = (stage.clientWidth * (z.scale - 1)) / 2;
    const extraH = (stage.clientHeight * (z.scale - 1)) / 2;
    if (z.scale <= 1.001) {
      z.scale = 1;
      z.x = 0;
      z.y = 0;
    } else {
      z.x = Math.min(extraW, Math.max(-extraW, z.x));
      z.y = Math.min(extraH, Math.max(-extraH, z.y));
    }
    img.style.transform = `translate3d(${z.x}px, ${z.y}px, 0) scale(${z.scale})`;
    stage.classList.toggle("is-zoomed", z.scale > 1.01);
  };

  const zoomTo = (next, cx, cy) => {
    const prev = z.scale;
    next = Math.min(z.max, Math.max(z.min, next));
    if (next === prev) {
      apply();
      return;
    }
    const rect = stage.getBoundingClientRect();
    const px = (cx ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
    const py = (cy ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
    const t = next / prev;
    z.x = px - (px - z.x) * t;
    z.y = py - (py - z.y) * t;
    z.scale = next;
    apply();
  };

  win._resetFolderZoom = () => {
    z.scale = 1;
    z.x = 0;
    z.y = 0;
    apply();
  };

  zoomIn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    zoomTo(z.scale * 1.28);
  });
  zoomOut?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    zoomTo(z.scale / 1.28);
  });

  stage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      zoomTo(z.scale * (e.deltaY < 0 ? 1.08 : 1 / 1.08), e.clientX, e.clientY);
    },
    { passive: false }
  );

  stage.addEventListener("pointerdown", (e) => {
    if (e.button && e.button !== 0) return;
    e.stopPropagation();
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const now = performance.now();
    if (pointers.size === 1 && now - lastTap < 280) {
      lastTap = 0;
      if (z.scale > 1.05) zoomTo(1, e.clientX, e.clientY);
      else zoomTo(2.35, e.clientX, e.clientY);
      return;
    }
    lastTap = now;

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch0 = {
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        scale: z.scale,
        x: z.x,
        y: z.y,
      };
      pan0 = null;
    } else if (z.scale > 1.01) {
      pan0 = { x: e.clientX, y: e.clientY, ox: z.x, oy: z.y };
    }
  });

  stage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch0) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const damped = Math.pow(dist / pinch0.dist, 0.52);
      zoomTo(pinch0.scale * damped, (a.x + b.x) / 2, (a.y + b.y) / 2);
    } else if (pan0 && pointers.size === 1) {
      z.x = pan0.ox + (e.clientX - pan0.x);
      z.y = pan0.oy + (e.clientY - pan0.y);
      apply();
    }
  });

  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch0 = null;
    if (pointers.size === 0) pan0 = null;
  };
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);
}

function layoutFolderPreview(win) {
  const img = win.querySelector(".folder-viewer-img");
  const stage = win.querySelector(".folder-viewer-stage");
  const vbar = win.querySelector(".folder-viewer-bar");
  if (!img || !stage || !img.naturalWidth) return;

  const PAD = 16;
  const FRAME = 3;
  const GAP = 16;
  const maxW = Math.max(240, windowsRoot.clientWidth - 28);
  const maxH = Math.max(180, windowsRoot.clientHeight - 28);
  const chrome = win.querySelector(".window-bar")?.offsetHeight || 36;
  const tool = vbar?.offsetHeight || 32;
  const ratio = img.naturalWidth / img.naturalHeight;
  const landscape = ratio >= 1;
  const boxW = maxW - PAD * 2 - FRAME;
  const boxH = maxH - chrome - PAD * 2 - FRAME - tool - GAP;
  const landCap = isWideDesk() ? 460 : 340;
  const portCap = isWideDesk() ? 380 : 290;

  let iw;
  let ih;
  if (landscape) {
    iw = Math.min(boxW, landCap);
    ih = iw / ratio;
    if (ih > boxH) {
      ih = boxH;
      iw = ih * ratio;
    }
  } else {
    ih = Math.min(boxH, Math.round(maxH * 0.46), portCap);
    iw = ih * ratio;
    if (iw > boxW) {
      iw = boxW;
      ih = iw / ratio;
    }
  }

  stage.style.width = `${Math.round(iw)}px`;
  stage.style.height = `${Math.round(ih)}px`;

  if (!win.classList.contains("is-max")) {
    win.style.width = `${Math.round(iw + PAD * 2 + FRAME)}px`;
    win.style.height = `${Math.round(ih + chrome + PAD * 2 + FRAME + tool + GAP)}px`;
    placeWindowSoon(win);
  }
  win._resetFolderZoom?.();
}

function openFolderPreview(win, dir, name) {
  const img = win.querySelector(".folder-viewer-img");
  const nameEl = win.querySelector(".folder-viewer-name");
  const viewer = win.querySelector(".folder-viewer");
  if (!img || !viewer) return;

  if (!win.classList.contains("is-max") && !win.dataset.restoreW) {
    win.dataset.restoreW = win.style.width;
    win.dataset.restoreH = win.style.height;
  }

  win.dataset.preview = name;
  win.classList.add("is-previewing");
  win.querySelectorAll(".file-link").forEach((btn) => {
    btn.closest("li")?.classList.toggle("is-open", btn.dataset.pdfName === name);
  });
  if (nameEl) nameEl.textContent = name;
  viewer.hidden = false;
  img.alt = name;
  img.style.transform = "";
  const src = folderPreviewSrc(dir, name);
  const show = () => requestAnimationFrame(() => layoutFolderPreview(win));
  if (img.getAttribute("src") === src && img.complete && img.naturalWidth) {
    show();
  } else {
    img.addEventListener("load", show, { once: true });
    img.src = src;
  }
  win.tabIndex = -1;
  win.focus({ preventScroll: true });
}

function closeFolderPreview(win) {
  if (!win.dataset.preview) return;
  delete win.dataset.preview;
  win.classList.remove("is-previewing");
  const viewer = win.querySelector(".folder-viewer");
  if (viewer) viewer.hidden = true;
  win.querySelectorAll(".file-list li.is-open").forEach((li) => li.classList.remove("is-open"));
  const img = win.querySelector(".folder-viewer-img");
  const stage = win.querySelector(".folder-viewer-stage");
  if (img) {
    img.removeAttribute("src");
    img.style.transform = "";
  }
  if (stage) {
    stage.style.width = "";
    stage.style.height = "";
    stage.classList.remove("is-zoomed");
  }
  win._resetFolderZoom?.();
  if (!win.classList.contains("is-max") && win.dataset.restoreW) {
    win.style.width = win.dataset.restoreW;
    win.style.height = win.dataset.restoreH;
    delete win.dataset.restoreW;
    delete win.dataset.restoreH;
    placeWindowSoon(win);
  }
}

function wireWindow(win, id) {
  win.addEventListener("click", (e) => {
    const row = e.target.closest(".file-list li");
    if (!row || e.target.closest("[data-pdf-dir], .file-link")) return;
    const name = row.querySelector("span")?.textContent || "";
    const map = {
      Kojurebi: "kojurebi",
      PLIEGO: "pliego",
      "Magua Canaria": "magua",
      Cartelería: "carteleria",
      Branding: "branding",
      Mockups: "mockups",
      "CV.pdf": "cv",
    };
    if (map[name]) openWindow(map[name]);
  });

  win.addEventListener("pointerdown", () => bringToFront(win));

  win.querySelector('[data-act="close"]').addEventListener("click", () => closeOsWindow(win));
  win.querySelector('[data-act="min"]').addEventListener("click", (e) => {
    e.stopPropagation();
    pauseWindowMedia(win);
    win.classList.add("is-min");
    dockItemFor(id)?.classList.add("has-min");
  });
  win.querySelector('[data-act="max"]').addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMax(win);
  });
  win.querySelector(".window-bar").addEventListener("dblclick", (e) => {
    if (e.target.closest("button")) return;
    toggleMax(win);
  });

  enableResize(win);
  makeDraggable(win, win.querySelector(".window-bar"));
}

function makeDraggable(el, handle, onMove) {
  let dragging = false;
  let start = { x: 0, y: 0, left: 0, top: 0 };

  const target = handle || el;
  target.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, a, .win-resize")) return;
    if (el.classList.contains("is-max")) return;
    dragging = true;
    el.classList.add("is-dragging");
    target.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    const parent = el.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };
    start = {
      x: e.clientX,
      y: e.clientY,
      left: rect.left - parent.left,
      top: rect.top - parent.top,
    };
  });

  target.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    el.style.left = `${start.left + dx}px`;
    el.style.top = `${start.top + dy}px`;
    el.style.right = "auto";
    el.style.bottom = "auto";
    onMove?.(dx, dy);
  });

  const end = () => {
    dragging = false;
    el.classList.remove("is-dragging");
  };
  target.addEventListener("pointerup", end);
  target.addEventListener("pointercancel", end);
}

ICONS.forEach((icon) => {
  const btn = document.createElement("button");
  btn.className = "desk-icon";
  btn.type = "button";
  btn.dataset.id = icon.id;
  const home = iconHome(icon);
  btn.style.left = `${home.x}%`;
  btn.style.top = `${home.y}%`;
  btn.innerHTML = `${glyphFor(icon)}<span class="label">${icon.label}</span>`;
  iconsRoot.appendChild(btn);

  let moved = false;
  let start = null;

  btn.addEventListener("dragstart", (e) => e.preventDefault());

  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    moved = false;
    start = { x: e.clientX, y: e.clientY, left: btn.offsetLeft, top: btn.offsetTop };
    btn.setPointerCapture(e.pointerId);
    document.querySelectorAll(".desk-icon").forEach((n) => n.classList.remove("is-selected"));
    btn.classList.add("is-selected");
  });

  btn.addEventListener("pointermove", (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.hypot(dx, dy) > 4) {
      moved = true;
      btn.classList.add("is-dragging");
      btn.style.zIndex = "24";
      document.body.classList.add("is-file-drag");
      const pos = clampDeskIcon(btn, start.left + dx, start.top + dy);
      btn.style.left = `${pos.left}px`;
      btn.style.top = `${pos.top}px`;
      const over = overTrashDrop(e.clientX, e.clientY);
      dockTrash?.classList.toggle("is-drop", over);
      dockTrash?.classList.toggle("is-open", true);
    }
  });

    const endDrag = (e) => {
      if (!start) return;
      const dropped = moved && e && overTrashDrop(e.clientX, e.clientY);
      start = null;
      btn.classList.remove("is-dragging");
      document.body.classList.remove("is-file-drag");
      dockTrash?.classList.remove("is-drop", "is-open");
      if (dropped) putInTrash(icon.id);
      else if (!moved) openWindow(icon.id);
    };

  btn.addEventListener("pointerup", endDrag);
  btn.addEventListener("pointercancel", endDrag);
});

document.querySelectorAll("[data-window]").forEach((el) => {
  el.addEventListener("click", (e) => {
    const id = el.getAttribute("data-window");
    if (!id) return;
    if (el.tagName === "A") return;
    e.preventDefault();
    if (el.classList.contains("dock-item")) bounceDock(el);
    openWindow(id);
  });
});

document.querySelectorAll(".dock-item[href]").forEach((el) => {
  el.addEventListener("click", () => bounceDock(el));
});

function bounceDock(item) {
  if (!item) return;
  const face = item.querySelector(".dock-glyph");
  if (!face || prefersReduced) return;
  item.classList.add("is-bouncing");
  face.style.transform = "";
  face.classList.remove("dock-bounce");
  void face.offsetWidth;
  face.classList.add("dock-bounce");
  face.addEventListener(
    "animationend",
    () => {
      item.classList.remove("is-bouncing");
      face.classList.remove("dock-bounce");
    },
    { once: true }
  );
}

if (dockTrash) {
  dockTrash.querySelector(".dock-can")?.insertAdjacentHTML("afterbegin", trashCanSVG());
  updateTrashDock();
}

function closeOsWindow(win) {
  if (!win) return;
  const id = win.dataset.id;
  pauseWindowMedia(win);
  dockItemFor(id)?.classList.remove("has-min");
  win.remove();
  if (isFolderId(id)) cycleFolderColor(id);
}

function isFolderId(id) {
  return ICONS.some((icon) => icon.id === id && icon.type === "folder");
}

function folderPreviewSrc(dir, name) {
  if (/\.pdf$/i.test(name)) {
    return `assets/works/${dir}/previews/${encodeURIComponent(name.replace(/\.pdf$/i, ".png"))}`;
  }
  return `assets/works/${dir}/${encodeURIComponent(name)}`;
}

function cycleFolderColor(id) {
  const icon = iconById(id);
  if (!icon || icon.type !== "folder") return;
  const used = new Set(
    ICONS.filter((item) => item.type === "folder").map((item) => item.color.toLowerCase())
  );
  let pool = COLORS.filter((color) => !used.has(color.toLowerCase()));
  if (!pool.length) {
    pool = COLORS.filter((color) => color.toLowerCase() !== icon.color.toLowerCase());
  }
  icon.color = pool[Math.floor(Math.random() * pool.length)];
  const paths = deskButton(id)?.querySelectorAll(".folder-svg path");
  if (paths?.[0]) paths[0].setAttribute("fill", icon.color);
  if (paths?.[1]) paths[1].setAttribute("fill", icon.color);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const top = [...windowsRoot.querySelectorAll(".window")].sort(
      (a, b) => Number(b.style.zIndex) - Number(a.style.zIndex)
    )[0];
    closeOsWindow(top);
  }
});

const circlesLayer = document.getElementById("circles");
const frame = document.getElementById("os-frame");
const CIRCLES = [
  { color: "#ff783a", r: 28, px: 0.14, py: 0.88, vx: 0.55, vy: -0.32 },
  { color: "#152dff", r: 64, px: 0.12, py: 0.08, vx: -0.4, vy: 0.36 },
  { color: "#ec76e5", r: 42, px: 0.08, py: 0.72, vx: 0.33, vy: 0.44 },
  { color: "#cbf52a", r: 36, px: 0.06, py: 0.30, vx: -0.48, vy: -0.24 },
  { color: "#ff3838", r: 30, px: 0.22, py: 0.40, vx: 0.3, vy: -0.5 },
];

const circleScale = isWideDesk() ? 1.42 : 1;
const circleItems = CIRCLES.map((spec) => {
  const r = spec.r * circleScale;
  const el = document.createElement("span");
  el.className = "circle";
  el.style.width = `${r * 2}px`;
  el.style.height = `${r * 2}px`;
  el.style.background = spec.color;
  circlesLayer.appendChild(el);
  return { ...spec, r, el };
});

let dockCache = null;
let dockCacheAt = 0;
window.addEventListener("resize", () => {
  dockCache = null;
});

function dockBoundsInLayer() {
  const now = performance.now();
  if (dockCache && now - dockCacheAt < 120) return dockCache;
  const dock = document.getElementById("dock");
  if (!dock || !circlesLayer) return null;
  const layer = circlesLayer.getBoundingClientRect();
  const box = dock.getBoundingClientRect();
  const pad = 6;
  dockCacheAt = now;
  dockCache = {
    left: box.left - layer.left - pad,
    right: box.right - layer.left + pad,
    top: box.top - layer.top - pad,
    bottom: circlesLayer.clientHeight,
  };
  return dockCache;
}

function bounceCircleOffRect(c, rect) {
  const closestX = Math.max(rect.left, Math.min(c.x, rect.right));
  const closestY = Math.max(rect.top, Math.min(c.y, rect.bottom));
  let dx = c.x - closestX;
  let dy = c.y - closestY;
  const dist = Math.hypot(dx, dy);

  if (dist === 0) {
    const penL = c.x - rect.left;
    const penR = rect.right - c.x;
    const penT = c.y - rect.top;
    const min = Math.min(penL, penR, penT);
    if (min === penT) {
      c.y = rect.top - c.r;
      if (c.vy > 0) c.vy *= -1;
    } else if (min === penL) {
      c.x = rect.left - c.r;
      if (c.vx > 0) c.vx *= -1;
    } else {
      c.x = rect.right + c.r;
      if (c.vx < 0) c.vx *= -1;
    }
    return;
  }

  if (dist >= c.r) return;
  const nx = dx / dist;
  const ny = dy / dist;
  const pen = c.r - dist;
  c.x += nx * pen;
  c.y += ny * pen;
  const vn = c.vx * nx + c.vy * ny;
  if (vn < 0) {
    c.vx -= 2 * vn * nx;
    c.vy -= 2 * vn * ny;
  }
}

function animateCircles() {
  if (document.hidden) {
    requestAnimationFrame(animateCircles);
    return;
  }
  const w = circlesLayer.clientWidth;
  const h = circlesLayer.clientHeight;
  if (!w || !h) {
    requestAnimationFrame(animateCircles);
    return;
  }
  const dock = dockBoundsInLayer();

  for (const c of circleItems) {
    if (c.px != null) {
      c.x = Math.min(w - c.r, Math.max(c.r, c.px * w));
      c.y = Math.min(h - c.r, Math.max(c.r, c.py * h));
      delete c.px;
      delete c.py;
    }
    c.x += c.vx;
    c.y += c.vy;

    if (c.x - c.r < 0) {
      c.x = c.r;
      if (c.vx < 0) c.vx *= -1;
    } else if (c.x + c.r > w) {
      c.x = w - c.r;
      if (c.vx > 0) c.vx *= -1;
    }
    if (c.y - c.r < 0) {
      c.y = c.r;
      if (c.vy < 0) c.vy *= -1;
    } else if (c.y + c.r > h) {
      c.y = h - c.r;
      if (c.vy > 0) c.vy *= -1;
    }

    if (dock) bounceCircleOffRect(c, dock);

    c.el.style.transform = `translate3d(${c.x - c.r}px, ${c.y - c.r}px, 0)`;
  }
  requestAnimationFrame(animateCircles);
}
if (!prefersReduced) animateCircles();

const PAGE_W = 595.2755737304688;
const PAGE_H = 841.8897705078125;

const CIRCLES = [
  { color: "#ff783a", r: 20, x: 50, y: 319.89, vx: 0.55, vy: -0.36 },
  { color: "#152dff", r: 48, x: 532, y: 371.89, vx: -0.44, vy: 0.4 },
  { color: "#ec76e5", r: 33, x: 229, y: 463.89, vx: 0.38, vy: 0.48 },
  { color: "#cbf52a", r: 30, x: 255, y: 703.89, vx: -0.48, vy: -0.3 },
  { color: "#ff3838", r: 24, x: 532, y: 737.89, vx: 0.34, vy: -0.5 },
];

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const BOUNDS = { minX: 18, minY: 18, maxX: PAGE_W - 18, maxY: PAGE_H - 18 };
const MAX_THROW = 2.55;
const THROW_GAIN = 0.62;

const cvView = { scale: 1, x: 0, y: 0, min: 1, max: 1.9 };

function fitPage() {
  const page = document.getElementById("page");
  const wrap = document.getElementById("page-wrap");
  if (!page || !wrap) return;

  const margin = 28;
  const scale = Math.min(
    (window.innerWidth - margin) / PAGE_W,
    (window.innerHeight - margin) / PAGE_H
  );

  wrap.style.width = `${PAGE_W * scale}px`;
  wrap.style.height = `${PAGE_H * scale}px`;
  page.style.transform = `scale(${scale})`;
  applyCvView();
}

function applyCvView() {
  const wrap = document.getElementById("page-wrap");
  const stage = document.querySelector(".stage");
  if (!wrap || !stage) return;

  if (cvView.scale <= 1.001) {
    cvView.scale = 1;
    cvView.x = 0;
    cvView.y = 0;
  } else {
    const extraX = Math.max(0, (wrap.offsetWidth * cvView.scale - stage.clientWidth) / 2 + 16);
    const extraY = Math.max(0, (wrap.offsetHeight * cvView.scale - stage.clientHeight) / 2 + 16);
    cvView.x = Math.min(extraX, Math.max(-extraX, cvView.x));
    cvView.y = Math.min(extraY, Math.max(-extraY, cvView.y));
  }

  wrap.style.transform = `translate3d(${cvView.x}px, ${cvView.y}px, 0) scale(${cvView.scale})`;
  stage.classList.toggle("is-zoomed", cvView.scale > 1.01);
}

function zoomCvTo(next, cx, cy) {
  const wrap = document.getElementById("page-wrap");
  if (!wrap) return;
  const prev = cvView.scale;
  next = Math.min(cvView.max, Math.max(cvView.min, next));
  if (next === prev) {
    applyCvView();
    return;
  }
  const rect = wrap.getBoundingClientRect();
  const px = (cx ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
  const py = (cy ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
  const t = next / prev;
  cvView.x = px - (px - cvView.x) * t;
  cvView.y = py - (py - cvView.y) * t;
  cvView.scale = next;
  applyCvView();
}

function enableCvZoom() {
  const stage = document.querySelector(".stage");
  if (!stage) return;

  const pointers = new Map();
  let pinch0 = null;
  let pan0 = null;
  let lastTap = 0;

  const isBlock = (el) => el.closest("a, .circle, .portfolio-btn, .cv-dl");

  stage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0016);
      zoomCvTo(cvView.scale * factor, e.clientX, e.clientY);
    },
    { passive: false }
  );

  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch0 = {
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        scale: cvView.scale,
        x: cvView.x,
        y: cvView.y,
      };
      pan0 = null;
      return;
    }

    if (isBlock(e.target)) return;

    const now = performance.now();
    if (now - lastTap < 280) {
      lastTap = 0;
      if (cvView.scale > 1.05) zoomCvTo(1, e.clientX, e.clientY);
      else zoomCvTo(1.65, e.clientX, e.clientY);
      return;
    }
    lastTap = now;

    if (cvView.scale > 1.01) {
      pan0 = { x: e.clientX, y: e.clientY, ox: cvView.x, oy: cvView.y };
      stage.classList.add("is-panning");
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  });

  stage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch0) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      zoomCvTo(pinch0.scale * (dist / pinch0.dist), (a.x + b.x) / 2, (a.y + b.y) / 2);
    } else if (pan0 && pointers.size === 1) {
      cvView.x = pan0.ox + (e.clientX - pan0.x);
      cvView.y = pan0.oy + (e.clientY - pan0.y);
      applyCvView();
    }
  });

  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch0 = null;
    if (pointers.size === 0) {
      pan0 = null;
      stage.classList.remove("is-panning");
    }
  };
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);
}

function pageCoords(event) {
  const page = document.getElementById("page");
  const rect = page.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * PAGE_W,
    y: ((event.clientY - rect.top) / rect.height) * PAGE_H,
  };
}

function clampCircle(c) {
  c.x = Math.min(BOUNDS.maxX - c.r, Math.max(BOUNDS.minX + c.r, c.x));
  c.y = Math.min(BOUNDS.maxY - c.r, Math.max(BOUNDS.minY + c.r, c.y));
}

function paintCircle(c) {
  c.el.style.transform = `translate3d(${c.x - c.r}px, ${c.y - c.r}px, 0)`;
}

function createCircles() {
  const layer = document.getElementById("circles");
  if (!layer) return [];

  return CIRCLES.map((spec) => {
    const el = document.createElement("span");
    el.className = "circle";
    el.style.width = `${spec.r * 2}px`;
    el.style.height = `${spec.r * 2}px`;
    el.style.background = spec.color;
    el.setAttribute("role", "presentation");
    el.title = "Arrastra para cambiar la trayectoria";
    layer.appendChild(el);
    const circle = { ...spec, el, dragging: false, samples: [], heldVx: 0, heldVy: 0 };
    paintCircle(circle);
    return circle;
  });
}

function enableDrag(items) {
  for (const c of items) {
    c.el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      c.dragging = true;
      c.heldVx = c.vx;
      c.heldVy = c.vy;
      c.vx = 0;
      c.vy = 0;
      c.samples = [{ t: performance.now(), x: c.x, y: c.y }];
      c.el.classList.add("is-held");
      try {
        c.el.setPointerCapture(e.pointerId);
      } catch {
        /* some environments don't support capture */
      }
      const point = pageCoords(e);
      c.x = point.x;
      c.y = point.y;
      clampCircle(c);
      paintCircle(c);
    });

    c.el.addEventListener("pointermove", (e) => {
      if (!c.dragging) return;
      const point = pageCoords(e);
      c.x = point.x;
      c.y = point.y;
      clampCircle(c);
      paintCircle(c);
      c.samples.push({ t: performance.now(), x: c.x, y: c.y });
      if (c.samples.length > 5) c.samples.shift();
    });

    const release = () => {
      if (!c.dragging) return;
      c.dragging = false;
      c.el.classList.remove("is-held");

      if (c.samples.length >= 2) {
        const recent = c.samples.slice(-3);
        const a = recent[0];
        const b = recent[recent.length - 1];
        const dt = Math.max(12, b.t - a.t);
        let vx = ((b.x - a.x) / dt) * 16.67 * THROW_GAIN;
        let vy = ((b.y - a.y) / dt) * 16.67 * THROW_GAIN;
        const speed = Math.hypot(vx, vy);

        if (speed < 0.18) {
          c.vx = c.heldVx;
          c.vy = c.heldVy;
        } else {
          if (speed > MAX_THROW) {
            vx = (vx / speed) * MAX_THROW;
            vy = (vy / speed) * MAX_THROW;
          }
          c.vx = vx;
          c.vy = vy;
        }
      } else {
        c.vx = c.heldVx;
        c.vy = c.heldVy;
      }
    };

    c.el.addEventListener("pointerup", release);
    c.el.addEventListener("pointercancel", release);
  }
}

function animateCircles(items) {
  const step = () => {
    if (!document.hidden) {
      for (const c of items) {
        if (c.dragging) continue;

        c.x += c.vx;
        c.y += c.vy;

        if (c.x - c.r <= BOUNDS.minX || c.x + c.r >= BOUNDS.maxX) {
          c.vx *= -1;
          c.x = Math.min(BOUNDS.maxX - c.r, Math.max(BOUNDS.minX + c.r, c.x));
        }
        if (c.y - c.r <= BOUNDS.minY || c.y + c.r >= BOUNDS.maxY) {
          c.vy *= -1;
          c.y = Math.min(BOUNDS.maxY - c.r, Math.max(BOUNDS.minY + c.r, c.y));
        }

        paintCircle(c);
      }
    }
    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

fitPage();
enableCvZoom();
window.addEventListener("resize", fitPage);

const circles = createCircles();
if (circles.length) {
  enableDrag(circles);
  if (!prefersReducedMotion) animateCircles(circles);
}

enablePortfolioDrag();
enableFolioFold();

function enableFolioFold() {
  const fold = document.getElementById("folio-fold");
  const page = document.getElementById("page");
  if (!fold || !page || prefersReducedMotion) return;

  const min = 32;
  const extra = 40;
  let target = min;
  let current = min;
  let lift = 0;
  let liftTarget = 0;

  const updateTarget = (event) => {
    const rect = page.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!inside) {
      target = min;
      liftTarget = 0;
      return;
    }

    const point = pageCoords(event);
    const dist = Math.hypot(PAGE_W - point.x, point.y);
    const t = Math.max(0, 1 - dist / 170);
    const smooth = t * t * (3 - 2 * t);
    target = min + extra * smooth;
    liftTarget = smooth;
  };

  window.addEventListener("pointermove", updateTarget);
  window.addEventListener("pointerleave", () => {
    target = min;
    liftTarget = 0;
  });

  const tick = () => {
    current += (target - current) * 0.16;
    lift += (liftTarget - lift) * 0.16;
    fold.style.setProperty("--s", `${current}px`);
    fold.style.setProperty("--lift", lift.toFixed(3));
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function enablePortfolioDrag() {
  const btn = document.querySelector(".portfolio-btn");
  if (!btn) return;

  let dragging = false;
  let moved = false;
  let start = null;

  btn.addEventListener("dragstart", (e) => e.preventDefault());

  btn.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    moved = false;
    const point = pageCoords(e);
    start = {
      x: point.x,
      y: point.y,
      left: btn.offsetLeft,
      top: btn.offsetTop,
    };
    btn.classList.add("is-held");
    try {
      btn.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  });

  btn.addEventListener("pointermove", (e) => {
    if (!dragging || !start) return;
    const point = pageCoords(e);
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    if (Math.hypot(dx, dy) > 3) moved = true;
    if (!moved) return;

    const w = btn.offsetWidth;
    const h = btn.offsetHeight;
    const left = Math.min(PAGE_W - w - 10, Math.max(10, start.left + dx));
    const top = Math.min(PAGE_H - h - 10, Math.max(10, start.top + dy));
    btn.style.left = `${left}px`;
    btn.style.top = `${top}px`;
  });

  const end = () => {
    dragging = false;
    start = null;
    btn.classList.remove("is-held");
  };

  btn.addEventListener("pointerup", end);
  btn.addEventListener("pointercancel", end);

  btn.addEventListener("click", (e) => {
    if (!moved) return;
    e.preventDefault();
    e.stopPropagation();
    moved = false;
  });
}

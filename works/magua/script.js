(() => {
    document.documentElement.classList.add("js");

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    const navEntry = performance.getEntriesByType("navigation")[0];
    const isReload = navEntry && navEntry.type === "reload";
    const pinHome = () => {
        if (window.location.hash && window.location.hash !== "#inicio") {
            return;
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    };
    if (isReload || !window.location.hash || window.location.hash === "#inicio") {
        if (isReload && (!window.location.hash || window.location.hash === "#inicio")) {
            history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        }
        pinHome();
        requestAnimationFrame(pinHome);
        window.addEventListener("load", pinHome, { once: true });
    }

    const header = document.getElementById("cabecera");
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("menu-principal");
    const progress = document.getElementById("progress");
    const toTop = document.getElementById("to-top");
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxStage = document.getElementById("lightbox-stage");
    const lightboxZoom = document.getElementById("lightbox-zoom");
    const cinemaListen = document.getElementById("cinema-listen");
    const toast = document.getElementById("toast");
    const pledgeCount = document.getElementById("pledge-count");
    const navLinks = [...nav.querySelectorAll("a")];
    const sections = [...document.querySelectorAll("main section[id], #contacto")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const closeNav = () => {
        document.body.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.querySelector(".visually-hidden").textContent = "Abrir menú";
    };

    const openNav = () => {
        document.body.classList.add("nav-open");
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.querySelector(".visually-hidden").textContent = "Cerrar menú";
        navLinks[0]?.focus();
    };

    menuToggle.addEventListener("click", () => {
        if (document.body.classList.contains("nav-open")) {
            closeNav();
        } else {
            openNav();
        }
    });

    navLinks.forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNav();
            if (lightbox.open) {
                lightbox.close();
            }
        }
    });

    const onScroll = () => {
        const scrolled = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = `${height > 0 ? (scrolled / height) * 100 : 0}%`;
        header.classList.toggle("is-scrolled", scrolled > 12);
        toTop.classList.toggle("is-visible", scrolled > 500);

        const marker = scrolled + header.offsetHeight + 80;
        let current = sections[0]?.id;
        sections.forEach((section) => {
            if (section.offsetTop <= marker) {
                current = section.id;
            }
        });
        navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
        });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    toTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });

    const showToast = (message) => {
        toast.hidden = false;
        toast.textContent = message;
        toast.classList.add("is-on");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            toast.classList.remove("is-on");
        }, 2400);
    };

    const cinemaVideo = document.getElementById("cinema-video");
    const cinemaPlay = document.getElementById("cinema-play");
    const cinemaScreen = document.getElementById("cinema-screen");
    const cinemaFs = document.getElementById("cinema-fs");
    const cinemaToggle = document.getElementById("cinema-toggle");
    const cinemaSeek = document.getElementById("cinema-seek");
    const cinemaNow = document.getElementById("cinema-now");
    const cinemaEnd = document.getElementById("cinema-end");
    const cinemaMute = document.getElementById("cinema-mute");
    const cinemaChip = document.getElementById("cinema-chip");
    const axisTabs = [...document.querySelectorAll(".axis-tabs [role='tab']")];
    const posterStages = [...document.querySelectorAll(".poster-stage")];

    const formatTime = (seconds) => {
        const total = Math.max(0, Math.floor(seconds || 0));
        return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
    };

    const syncCinemaUi = () => {
        if (!cinemaVideo) {
            return;
        }
        const duration = cinemaVideo.duration || 90;
        if (cinemaSeek && !cinemaSeek.matches(":active")) {
            cinemaSeek.value = String(Math.round((cinemaVideo.currentTime / duration) * 1000) || 0);
        }
        if (cinemaNow) {
            cinemaNow.textContent = formatTime(cinemaVideo.currentTime);
        }
        if (cinemaEnd) {
            cinemaEnd.textContent = formatTime(duration);
        }
        cinemaToggle?.classList.toggle("is-paused", cinemaVideo.paused);
        cinemaToggle?.setAttribute("aria-label", cinemaVideo.paused ? "Reproducir" : "Pausar");
        cinemaMute?.classList.toggle("is-live", !cinemaVideo.muted);
        cinemaMute?.setAttribute("aria-label", cinemaVideo.muted ? "Activar sonido" : "Silenciar");
        cinemaScreen?.classList.toggle("is-paused", cinemaVideo.paused);
        cinemaScreen?.classList.toggle("has-sound", !cinemaVideo.muted);
        const full = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
        cinemaFs?.classList.toggle("is-full", full);
        cinemaFs?.setAttribute("aria-label", full ? "Salir de pantalla completa" : "Ampliar");
        if (cinemaChip) {
            cinemaChip.textContent = cinemaVideo.paused ? "En pausa · 90 s" : "En emisión · 90 s";
        }
    };

    let cinemaHeld = false;
    let soundUnlocked = false;

    const playCinema = () => {
        if (!cinemaVideo) {
            return;
        }
        cinemaHeld = false;
        cinemaVideo.play().catch(() => {});
        syncCinemaUi();
    };

    const pauseCinema = () => {
        if (!cinemaVideo) {
            return;
        }
        cinemaHeld = true;
        cinemaVideo.pause();
        syncCinemaUi();
    };

    const unlockSound = () => {
        if (!cinemaVideo) {
            return;
        }
        soundUnlocked = true;
        cinemaVideo.muted = false;
        playCinema();
        if (cinemaPlay) {
            cinemaPlay.hidden = true;
        }
        if (cinemaListen) {
            cinemaListen.hidden = true;
        }
    };

    if (cinemaVideo) {
        if (!reduceMotion) {
            playCinema();
        }

        cinemaPlay?.addEventListener("click", unlockSound);
        cinemaListen?.addEventListener("click", unlockSound);

        cinemaToggle?.addEventListener("click", () => {
            if (cinemaVideo.paused) {
                playCinema();
            } else {
                pauseCinema();
            }
        });

        cinemaMute?.addEventListener("click", () => {
            if (cinemaVideo.muted) {
                unlockSound();
            } else {
                cinemaVideo.muted = true;
                syncCinemaUi();
            }
        });

        cinemaSeek?.addEventListener("input", () => {
            const duration = cinemaVideo.duration || 90;
            cinemaVideo.currentTime = (Number(cinemaSeek.value) / 1000) * duration;
            syncCinemaUi();
        });

        ["timeupdate", "loadedmetadata", "play", "pause", "volumechange", "ended"].forEach((eventName) => {
            cinemaVideo.addEventListener(eventName, syncCinemaUi);
        });

        cinemaVideo.addEventListener("ended", () => {
            cinemaHeld = true;
            if (cinemaPlay && cinemaVideo.muted) {
                cinemaPlay.hidden = false;
                if (cinemaListen) {
                    cinemaListen.hidden = false;
                }
            }
            syncCinemaUi();
        });

        cinemaFs?.addEventListener("click", async () => {
            const node = cinemaScreen || cinemaVideo;
            const full = document.fullscreenElement || document.webkitFullscreenElement;
            if (full) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else {
                    document.webkitExitFullscreen?.();
                }
                screen.orientation?.unlock?.();
                return;
            }
            try {
                if (node.requestFullscreen) {
                    await node.requestFullscreen();
                } else if (node.webkitRequestFullscreen) {
                    node.webkitRequestFullscreen();
                } else if (cinemaVideo.webkitEnterFullscreen) {
                    cinemaVideo.webkitEnterFullscreen();
                    return;
                }
                await screen.orientation?.lock?.("landscape").catch(() => {});
            } catch {
                cinemaVideo.webkitEnterFullscreen?.();
            }
        });

        const cinemaSection = document.getElementById("campana");
        const landscapeMq = window.matchMedia("(orientation: landscape) and (max-height: 560px)");
        const syncCinemaLandscape = (center = false) => {
            if (!cinemaSection || !landscapeMq.matches) {
                document.body.classList.remove("is-cinema-landscape");
                return;
            }
            const box = cinemaSection.getBoundingClientRect();
            const visible = box.top < window.innerHeight * 0.72 && box.bottom > window.innerHeight * 0.28;
            document.body.classList.toggle("is-cinema-landscape", visible);
            if (visible && center) {
                cinemaScreen?.scrollIntoView({ block: "center", inline: "nearest" });
            }
        };
        landscapeMq.addEventListener("change", () => {
            window.requestAnimationFrame(() => syncCinemaLandscape(true));
        });
        window.addEventListener("orientationchange", () => {
            window.setTimeout(() => syncCinemaLandscape(true), 80);
        });
        window.addEventListener("scroll", () => syncCinemaLandscape(false), { passive: true });
        window.addEventListener("resize", () => syncCinemaLandscape(false));
        syncCinemaLandscape(false);

        document.addEventListener("fullscreenchange", syncCinemaUi);
        document.addEventListener("webkitfullscreenchange", syncCinemaUi);

        document.addEventListener("keydown", (event) => {
            const tag = event.target.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || event.target.isContentEditable) {
                return;
            }
            const inCinema = cinemaScreen?.contains(document.activeElement) || cinemaScreen?.matches(":hover");
            if (!inCinema) {
                return;
            }
            if (event.key === " " || event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (cinemaVideo.paused) {
                    playCinema();
                } else {
                    pauseCinema();
                }
            }
            if (event.key.toLowerCase() === "m") {
                if (cinemaVideo.muted) {
                    unlockSound();
                } else {
                    cinemaVideo.muted = true;
                    syncCinemaUi();
                }
            }
            if (event.key.toLowerCase() === "f") {
                cinemaFs?.click();
            }
        });

        syncCinemaUi();
    }

    const activateAxis = (axis) => {
        axisTabs.forEach((tab) => {
            const on = tab.dataset.axis === axis;
            tab.classList.toggle("is-on", on);
            tab.setAttribute("aria-selected", String(on));
            tab.tabIndex = on ? 0 : -1;
        });
        posterStages.forEach((stage) => {
            const on = stage.dataset.axis === axis;
            stage.classList.toggle("is-on", on);
            stage.hidden = !on;
        });
    };

    axisTabs.forEach((tab, index) => {
        tab.tabIndex = tab.classList.contains("is-on") ? 0 : -1;
        tab.addEventListener("click", () => activateAxis(tab.dataset.axis));
        tab.addEventListener("keydown", (event) => {
            const next = event.key === "ArrowRight" || event.key === "ArrowDown";
            const prev = event.key === "ArrowLeft" || event.key === "ArrowUp";
            if (!next && !prev) {
                return;
            }
            event.preventDefault();
            const target = axisTabs[(index + (next ? 1 : -1) + axisTabs.length) % axisTabs.length];
            activateAxis(target.dataset.axis);
            target.focus();
        });
    });

    const jumpTo = (selector) => {
        const target = document.querySelector(selector);
        if (!target) {
            return;
        }
        closeNav();
        if (target.matches("[role='tab']") && target.dataset.axis) {
            activateAxis(target.dataset.axis);
            document.getElementById("carteles")?.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start"
            });
            return;
        }
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    };

    document.querySelectorAll("[data-jump]").forEach((el) => {
        el.addEventListener("click", () => jumpTo(el.dataset.jump));
    });

    const rotateStack = (stack, direction) => {
        const posters = [...stack.querySelectorAll(".poster")];
        const order = direction === "next"
            ? { left: "right", center: "left", right: "center" }
            : { left: "center", center: "right", right: "left" };

        posters.forEach((poster) => {
            const nextPos = order[poster.dataset.pos];
            poster.dataset.pos = nextPos;
            poster.classList.toggle("is-front", nextPos === "center");
            const label = poster.getAttribute("aria-label").replace(/Traer al frente|Ya está al frente/, "");
            poster.setAttribute(
                "aria-label",
                `${label}${nextPos === "center" ? "Ya está al frente" : "Traer al frente"}`
            );
        });
    };

    const bringToFront = (stack, poster) => {
        if (poster.dataset.pos === "center") {
            return;
        }
        rotateStack(stack, poster.dataset.pos === "right" ? "next" : "prev");
    };

    const lightboxZoomOut = document.getElementById("lightbox-zoom-out");
    const lightboxZoomIn = document.getElementById("lightbox-zoom-in");
    const lightboxZoomLabel = document.getElementById("lightbox-zoom-label");
    const mobileView = window.matchMedia("(max-width: 899px)");
    const pointers = new Map();
    const viewer = {
        scale: 1,
        x: 0,
        y: 0,
        tScale: 1,
        tX: 0,
        tY: 0,
        min: 1,
        max: 3,
        vx: 0,
        vy: 0,
        lastDist: 0,
        lastMid: null,
        lastPan: null,
        lastTime: 0,
        moving: false,
        pinched: false,
        lastTap: 0,
        tapX: 0,
        tapY: 0,
        raf: 0
    };

    const viewerActive = () => mobileView.matches && lightbox.open;

    const paintViewer = () => {
        lightboxImage.style.transform = `translate3d(${viewer.x}px, ${viewer.y}px, 0) scale(${viewer.scale})`;
        const ratio = viewer.scale / viewer.min;
        lightbox.classList.toggle("is-zoomed", ratio > 1.03);
        if (lightboxZoomLabel) {
            lightboxZoomLabel.textContent = ratio <= 1.03
                ? "Pellizca para ampliar"
                : `${Math.round(ratio * 100)}%`;
        }
        if (lightboxZoomOut) {
            lightboxZoomOut.disabled = ratio <= 1.03;
        }
        if (lightboxZoomIn) {
            lightboxZoomIn.disabled = viewer.scale >= viewer.max - 0.02;
        }
    };

    const viewerBounds = (scale = viewer.tScale) => {
        const sw = lightboxStage.clientWidth;
        const sh = lightboxStage.clientHeight;
        const w = lightboxImage.naturalWidth * scale;
        const h = lightboxImage.naturalHeight * scale;
        return {
            sw,
            sh,
            w,
            h,
            minX: w <= sw ? (sw - w) / 2 : sw - w,
            maxX: w <= sw ? (sw - w) / 2 : 0,
            minY: h <= sh ? (sh - h) / 2 : sh - h,
            maxY: h <= sh ? (sh - h) / 2 : 0
        };
    };

    const rubber = (value, min, max) => {
        if (value > max) {
            return max + (value - max) * 0.22;
        }
        if (value < min) {
            return min + (value - min) * 0.22;
        }
        return value;
    };

    const constrainTargets = (hard = false) => {
        const box = viewerBounds();
        if (hard) {
            viewer.tX = Math.min(box.maxX, Math.max(box.minX, viewer.tX));
            viewer.tY = Math.min(box.maxY, Math.max(box.minY, viewer.tY));
            return;
        }
        viewer.tX = rubber(viewer.tX, box.minX, box.maxX);
        viewer.tY = rubber(viewer.tY, box.minY, box.maxY);
    };

    const zoomTargetAt = (cx, cy, next) => {
        const scale = Math.min(viewer.max * 1.08, Math.max(viewer.min * 0.92, next));
        const imgX = (cx - viewer.tX) / viewer.tScale;
        const imgY = (cy - viewer.tY) / viewer.tScale;
        viewer.tScale = scale;
        viewer.tX = cx - imgX * scale;
        viewer.tY = cy - imgY * scale;
    };

    const tickViewer = () => {
        viewer.raf = 0;
        if (!viewer.moving) {
            viewer.tX += viewer.vx;
            viewer.tY += viewer.vy;
            viewer.vx *= 0.9;
            viewer.vy *= 0.9;
            if (Math.abs(viewer.vx) < 0.12) {
                viewer.vx = 0;
            }
            if (Math.abs(viewer.vy) < 0.12) {
                viewer.vy = 0;
            }
            if (viewer.tScale < viewer.min * 1.04) {
                viewer.tScale = viewer.min;
            }
            if (viewer.tScale > viewer.max) {
                viewer.tScale = viewer.max;
            }
            constrainTargets(true);
        }
        const ease = viewer.moving ? 0.32 : 0.16;
        viewer.scale += (viewer.tScale - viewer.scale) * ease;
        viewer.x += (viewer.tX - viewer.x) * ease;
        viewer.y += (viewer.tY - viewer.y) * ease;
        paintViewer();
        const still = Math.abs(viewer.tScale - viewer.scale) > 0.001
            || Math.abs(viewer.tX - viewer.x) > 0.2
            || Math.abs(viewer.tY - viewer.y) > 0.2
            || Math.abs(viewer.vx) > 0.12
            || Math.abs(viewer.vy) > 0.12
            || viewer.moving;
        if (still && viewerActive()) {
            viewer.raf = window.requestAnimationFrame(tickViewer);
        }
    };

    const runViewer = () => {
        if (!viewer.raf) {
            viewer.raf = window.requestAnimationFrame(tickViewer);
        }
    };

    const stopViewerLoop = () => {
        if (viewer.raf) {
            window.cancelAnimationFrame(viewer.raf);
            viewer.raf = 0;
        }
    };

    const fitViewer = (animate = true) => {
        if (!lightboxStage || !lightboxImage.naturalWidth) {
            return;
        }
        const sw = lightboxStage.clientWidth;
        const sh = lightboxStage.clientHeight;
        const iw = lightboxImage.naturalWidth;
        const ih = lightboxImage.naturalHeight;
        viewer.min = Math.min(sw / iw, sh / ih);
        viewer.max = viewer.min * 3.2;
        viewer.tScale = viewer.min;
        viewer.tX = (sw - iw * viewer.min) / 2;
        viewer.tY = (sh - ih * viewer.min) / 2;
        viewer.vx = 0;
        viewer.vy = 0;
        if (!animate) {
            viewer.scale = viewer.tScale;
            viewer.x = viewer.tX;
            viewer.y = viewer.tY;
            paintViewer();
            return;
        }
        runViewer();
    };

    const enableViewer = () => {
        lightbox.classList.add("is-viewer");
        lightboxImage.style.width = `${lightboxImage.naturalWidth}px`;
        lightboxImage.style.height = `${lightboxImage.naturalHeight}px`;
        fitViewer(false);
    };

    const disableViewer = () => {
        stopViewerLoop();
        lightbox.classList.remove("is-viewer", "is-zoomed");
        lightboxImage.style.width = "";
        lightboxImage.style.height = "";
        lightboxImage.style.transform = "";
        pointers.clear();
        viewer.moving = false;
        viewer.pinched = false;
        viewer.vx = 0;
        viewer.vy = 0;
    };

    const nudgeZoom = (dir) => {
        if (!viewerActive()) {
            return;
        }
        if (dir < 0 && viewer.tScale <= viewer.min * 1.04) {
            fitViewer();
            return;
        }
        zoomTargetAt(
            lightboxStage.clientWidth / 2,
            lightboxStage.clientHeight / 2,
            viewer.tScale * (dir > 0 ? 1.18 : 1 / 1.18)
        );
        if (viewer.tScale < viewer.min * 1.04) {
            fitViewer();
            return;
        }
        constrainTargets(true);
        runViewer();
    };

    if (lightboxStage) {
        const readTouches = (event) => [...event.touches].map((touch) => ({ x: touch.clientX, y: touch.clientY }));

        const beginMove = () => {
            viewer.moving = true;
            viewer.vx = 0;
            viewer.vy = 0;
            stopViewerLoop();
            viewer.scale = viewer.tScale;
            viewer.x = viewer.tX;
            viewer.y = viewer.tY;
        };

        const trackPan = (x, y, time) => {
            if (viewer.lastPan) {
                const dt = Math.max(16, time - viewer.lastTime);
                viewer.vx = (x - viewer.lastPan.x) * (16 / dt);
                viewer.vy = (y - viewer.lastPan.y) * (16 / dt);
                viewer.tX += x - viewer.lastPan.x;
                viewer.tY += y - viewer.lastPan.y;
                constrainTargets(false);
                viewer.scale = viewer.tScale;
                viewer.x = viewer.tX;
                viewer.y = viewer.tY;
                paintViewer();
            }
            viewer.lastPan = { x, y };
            viewer.lastTime = time;
        };

        const trackPinch = (touches, time) => {
            const dist = Math.hypot(touches[0].x - touches[1].x, touches[0].y - touches[1].y);
            const mid = {
                x: (touches[0].x + touches[1].x) / 2,
                y: (touches[0].y + touches[1].y) / 2
            };
            const rect = lightboxStage.getBoundingClientRect();
            if (viewer.lastDist > 12) {
                const raw = dist / viewer.lastDist;
                const damped = Math.pow(raw, 0.48);
                zoomTargetAt(mid.x - rect.left, mid.y - rect.top, viewer.tScale * damped);
                viewer.tX += (mid.x - viewer.lastMid.x) * 0.85;
                viewer.tY += (mid.y - viewer.lastMid.y) * 0.85;
                constrainTargets(false);
                viewer.scale += (viewer.tScale - viewer.scale) * 0.28;
                viewer.x += (viewer.tX - viewer.x) * 0.28;
                viewer.y += (viewer.tY - viewer.y) * 0.28;
                paintViewer();
            }
            viewer.lastDist = dist;
            viewer.lastMid = mid;
            viewer.lastTime = time;
        };

        const endMove = () => {
            viewer.moving = false;
            viewer.lastPan = null;
            viewer.lastDist = 0;
            viewer.lastMid = null;
            if (viewer.tScale < viewer.min * 1.06) {
                fitViewer();
                return;
            }
            if (viewer.tScale > viewer.max) {
                zoomTargetAt(lightboxStage.clientWidth / 2, lightboxStage.clientHeight / 2, viewer.max);
            }
            constrainTargets(true);
            runViewer();
        };

        lightboxStage.addEventListener("touchstart", (event) => {
            if (!viewerActive()) {
                return;
            }
            const touches = readTouches(event);
            beginMove();
            if (touches.length >= 2) {
                viewer.pinched = true;
                viewer.lastDist = Math.hypot(touches[0].x - touches[1].x, touches[0].y - touches[1].y);
                viewer.lastMid = {
                    x: (touches[0].x + touches[1].x) / 2,
                    y: (touches[0].y + touches[1].y) / 2
                };
                pointers.delete("touch");
            } else if (touches.length === 1) {
                pointers.set("touch", touches[0]);
                viewer.lastPan = touches[0];
                viewer.lastTime = event.timeStamp;
            }
        }, { passive: true });

        lightboxStage.addEventListener("touchmove", (event) => {
            if (!viewerActive()) {
                return;
            }
            event.preventDefault();
            const touches = readTouches(event);
            if (touches.length >= 2) {
                viewer.pinched = true;
                trackPinch(touches, event.timeStamp);
                return;
            }
            if (touches.length === 1 && viewer.tScale > viewer.min * 1.02) {
                trackPan(touches[0].x, touches[0].y, event.timeStamp);
                pointers.set("touch", touches[0]);
            }
        }, { passive: false });

        lightboxStage.addEventListener("touchend", (event) => {
            if (!viewerActive()) {
                return;
            }
            const touches = readTouches(event);
            if (touches.length >= 2) {
                return;
            }
            if (touches.length === 1) {
                viewer.lastDist = 0;
                viewer.lastMid = null;
                viewer.lastPan = touches[0];
                pointers.set("touch", touches[0]);
                return;
            }
            pointers.delete("touch");
            const ended = event.changedTouches[0];
            if (!viewer.pinched && ended) {
                const now = Date.now();
                const close = Math.hypot(ended.clientX - viewer.tapX, ended.clientY - viewer.tapY) < 28;
                if (now - viewer.lastTap < 260 && close) {
                    const rect = lightboxStage.getBoundingClientRect();
                    if (viewer.tScale > viewer.min * 1.08) {
                        fitViewer();
                    } else {
                        zoomTargetAt(ended.clientX - rect.left, ended.clientY - rect.top, viewer.min * 1.85);
                        constrainTargets(true);
                        runViewer();
                    }
                    viewer.lastTap = 0;
                } else {
                    viewer.lastTap = now;
                    viewer.tapX = ended.clientX;
                    viewer.tapY = ended.clientY;
                }
            }
            viewer.pinched = false;
            endMove();
        }, { passive: true });

        lightboxStage.addEventListener("pointerdown", (event) => {
            if (!viewerActive() || event.button || event.pointerType === "touch") {
                return;
            }
            beginMove();
            lightboxStage.setPointerCapture(event.pointerId);
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            viewer.lastPan = { x: event.clientX, y: event.clientY };
            viewer.lastTime = event.timeStamp;
        });

        lightboxStage.addEventListener("pointermove", (event) => {
            if (event.pointerType === "touch" || !pointers.has(event.pointerId) || !viewerActive()) {
                return;
            }
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (viewer.tScale > viewer.min * 1.02) {
                event.preventDefault();
                trackPan(event.clientX, event.clientY, event.timeStamp);
            }
        });

        const endPointer = (event) => {
            if (event.pointerType === "touch") {
                return;
            }
            if (lightboxStage.hasPointerCapture?.(event.pointerId)) {
                lightboxStage.releasePointerCapture(event.pointerId);
            }
            pointers.delete(event.pointerId);
            if (pointers.size === 0) {
                const now = Date.now();
                if (!viewer.pinched && now - viewer.lastTap < 260) {
                    const rect = lightboxStage.getBoundingClientRect();
                    if (viewer.tScale > viewer.min * 1.08) {
                        fitViewer();
                    } else {
                        zoomTargetAt(event.clientX - rect.left, event.clientY - rect.top, viewer.min * 1.85);
                        constrainTargets(true);
                        runViewer();
                    }
                    viewer.lastTap = 0;
                } else {
                    viewer.lastTap = now;
                    viewer.tapX = event.clientX;
                    viewer.tapY = event.clientY;
                }
                viewer.pinched = false;
                endMove();
            }
        };

        lightboxStage.addEventListener("pointerup", endPointer);
        lightboxStage.addEventListener("pointercancel", endPointer);

        lightboxStage.addEventListener("wheel", (event) => {
            if (!viewerActive()) {
                return;
            }
            event.preventDefault();
            const rect = lightboxStage.getBoundingClientRect();
            zoomTargetAt(
                event.clientX - rect.left,
                event.clientY - rect.top,
                viewer.tScale * (event.deltaY < 0 ? 1.045 : 1 / 1.045)
            );
            constrainTargets(true);
            runViewer();
        }, { passive: false });
    }

    const openLightbox = (src, title, alt) => {
        disableViewer();
        lightboxImage.src = src;
        lightboxImage.alt = alt || title;
        lightboxTitle.textContent = title;
        if (typeof lightbox.showModal === "function") {
            lightbox.showModal();
        }
        const start = () => {
            if (mobileView.matches) {
                enableViewer();
            }
        };
        if (lightboxImage.complete && lightboxImage.naturalWidth) {
            start();
        } else {
            lightboxImage.addEventListener("load", start, { once: true });
        }
    };

    lightboxZoom?.addEventListener("click", () => {
        if (viewer.tScale > viewer.min * 1.08) {
            fitViewer();
        } else {
            nudgeZoom(1);
        }
    });
    lightboxZoomOut?.addEventListener("click", () => nudgeZoom(-1));
    lightboxZoomIn?.addEventListener("click", () => nudgeZoom(1));
    lightbox.addEventListener("close", disableViewer);
    window.addEventListener("resize", () => {
        if (viewerActive()) {
            fitViewer(false);
        }
    });


    document.querySelectorAll(".poster-stage").forEach((theme) => {
        const stack = theme.querySelector(".poster-stack");
        const tab = document.getElementById(theme.getAttribute("aria-labelledby"));
        const title = tab ? tab.textContent.trim() : theme.querySelector(".stage-kicker").textContent;
        let startX = 0;

        stack.setAttribute("tabindex", "0");

        stack.querySelectorAll(".poster").forEach((poster) => {
            poster.addEventListener("click", () => {
                if (poster.dataset.pos === "center") {
                    openLightbox(poster.dataset.full, title, poster.querySelector("img").alt);
                    return;
                }
                bringToFront(stack, poster);
            });
        });

        theme.querySelector("[data-dir='prev']").addEventListener("click", () => rotateStack(stack, "prev"));
        theme.querySelector("[data-dir='next']").addEventListener("click", () => rotateStack(stack, "next"));
        theme.querySelector("[data-action='zoom']").addEventListener("click", () => {
            const front = stack.querySelector('.poster[data-pos="center"]');
            openLightbox(front.dataset.full, title, front.querySelector("img").alt);
        });

        stack.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") {
                rotateStack(stack, "next");
            }
            if (event.key === "ArrowLeft") {
                rotateStack(stack, "prev");
            }
        });

        stack.addEventListener("touchstart", (event) => {
            startX = event.changedTouches[0].clientX;
        }, { passive: true });

        stack.addEventListener("touchend", (event) => {
            const delta = event.changedTouches[0].clientX - startX;
            if (Math.abs(delta) > 40) {
                rotateStack(stack, delta < 0 ? "next" : "prev");
            }
        }, { passive: true });
    });

    document.querySelectorAll("[data-lightbox='trajes']").forEach((button) => {
        button.addEventListener("click", () => {
            openLightbox(
                "img/Magos_Ordenador.png",
                "Trajes típicos canarios",
                "Infografía de trajes típicos de pescador y campesina con precios aproximados"
            );
        });
    });

    const updatePledges = () => {
        const total = document.querySelectorAll(".tip-panel button.is-active").length;
        pledgeCount.textContent = String(total);
    };

    document.querySelectorAll(".tip-panel button:not([data-lightbox])").forEach((button) => {
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => {
            const active = button.classList.toggle("is-active");
            button.setAttribute("aria-pressed", String(active));
            updatePledges();
            showToast(active ? "¡Chacho! Este gesto suma." : "Has soltado este gesto.");
        });
    });

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });

    const hero = document.getElementById("inicio");
    const brandMark = document.getElementById("brand-mark");
    const brandSunHit = document.getElementById("brand-sun-hit");
    const floatBits = [...document.querySelectorAll(".float-bit, .hero-stamp")];

    const bitState = new Map(floatBits.map((el) => [el, { x: 0, y: 0, held: false }]));

    const applyBit = (el) => {
        const state = bitState.get(el);
        el.style.setProperty("--dx", `${state.x}px`);
        el.style.setProperty("--dy", `${state.y}px`);
    };

    floatBits.forEach((el) => {
        let startX = 0;
        let startY = 0;
        let originX = 0;
        let originY = 0;
        let moved = 0;

        el.addEventListener("pointerdown", (event) => {
            const state = bitState.get(el);
            state.held = true;
            moved = 0;
            startX = event.clientX;
            startY = event.clientY;
            originX = state.x;
            originY = state.y;
            el.classList.add("is-held");
            el.setPointerCapture(event.pointerId);
        });

        el.addEventListener("pointermove", (event) => {
            const state = bitState.get(el);
            if (!state.held) {
                return;
            }
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            moved = Math.max(moved, Math.hypot(dx, dy));
            state.x = originX + dx;
            state.y = originY + dy;
            applyBit(el);
        });

        const release = (event) => {
            const state = bitState.get(el);
            if (!state.held) {
                return;
            }
            state.held = false;
            el.classList.remove("is-held");
            if (moved < 8) {
                el.classList.remove("is-spin");
                void el.offsetWidth;
                el.classList.add("is-spin");
                window.setTimeout(() => el.classList.remove("is-spin"), 800);
            }
            if (el.hasPointerCapture?.(event.pointerId)) {
                el.releasePointerCapture(event.pointerId);
            }
        };

        el.addEventListener("pointerup", release);
        el.addEventListener("pointercancel", release);
    });

    if (hero && finePointer && !reduceMotion && brandMark) {
        hero.addEventListener("pointermove", (event) => {
            const box = brandMark.getBoundingClientRect();
            const px = (event.clientX - box.left) / box.width - 0.5;
            const py = (event.clientY - box.top) / box.height - 0.5;
            brandMark.style.transform = `rotateY(${px * 6}deg) rotateX(${-py * 5}deg)`;
        }, { passive: true });

        hero.addEventListener("pointerleave", () => {
            brandMark.style.transform = "";
        });
    }

    brandSunHit?.addEventListener("click", () => {
        brandSunHit.classList.remove("is-boost");
        void brandSunHit.offsetWidth;
        brandSunHit.classList.add("is-boost");
        window.setTimeout(() => brandSunHit.classList.remove("is-boost"), 900);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
})();

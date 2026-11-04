"use client";

import { useEffect } from "react";

/**
 * Everything that makes the page answer to the hand, in one place:
 *
 * - Film grain: a fixed overlay that jitters ~11 times a second (CSS only).
 * - Elastic drag: press any paragraph, heading, list row or card and pull it.
 *   It follows with rubber-band resistance and springs back on release.
 *   A drag never fires the link underneath; a plain click still does.
 * - Cards tilt toward the cursor and carry a copper spotlight.
 * - The hero discs drift with the cursor; the primary button is magnetic.
 * - Text cannot be selected or copied (code chips and form fields excepted).
 *
 * Delegated listeners on window, so components stay free of handlers.
 * Under prefers-reduced-motion: no tilt, parallax, magnet or overshoot;
 * the grain stops moving; a drag still works but returns without a bounce.
 */

const DRAG_SEL = [
  "main h1",
  "main h2",
  "main h3",
  "main p",
  "main li",
  "main dl > div",
  "main article:not([data-theme])",
  'main nav[aria-label="Project index"]',
].join(",");
const CARD_SEL = "main article:not([data-theme])";
const COPY_OK = "code, pre, kbd, input, textarea, [contenteditable='true']";

const PULL = 90; // px: the most an element can travel, however far it is pulled
const THRESHOLD = 5; // px of pointer travel before a press becomes a drag

type Body = {
  x: number;
  y: number;
  r: number;
  s: number;
  vx: number;
  vy: number;
  vr: number;
  vs: number;
  raf: number;
};

const band = (d: number) => Math.sign(d) * PULL * (1 - Math.exp(-Math.abs(d) / PULL));
const unband = (t: number) => {
  const a = Math.min(Math.abs(t), PULL * 0.999);
  return -Math.sign(t) * PULL * Math.log(1 - a / PULL);
};

function apply(el: HTMLElement, b: Body) {
  el.style.translate = `${b.x.toFixed(2)}px ${b.y.toFixed(2)}px`;
  el.style.rotate = `${b.r.toFixed(3)}deg`;
  el.style.scale = b.s.toFixed(4);
}

function clear(el: HTMLElement) {
  el.style.translate = "";
  el.style.rotate = "";
  el.style.scale = "";
  el.classList.remove("is-live");
}

export default function LiveLayer() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const bodies = new WeakMap<HTMLElement, Body>();

    /* ---------- elastic drag ---------- */

    let drag: {
      el: HTMLElement;
      id: number;
      sx: number;
      sy: number;
      ox: number;
      oy: number;
      lastX: number;
      lastT: number;
      vx: number;
      moved: boolean;
    } | null = null;

    const resolve = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      if (target.closest("[data-nodrag], input, textarea, select, button")) return null;
      // A stretched link covers its whole card: pulling anywhere on it moves the card.
      const stretched = target.closest("a.stretched");
      if (stretched) return stretched.closest<HTMLElement>("article");
      return target.closest<HTMLElement>(DRAG_SEL);
    };

    const body = (el: HTMLElement) => {
      let b = bodies.get(el);
      if (!b) {
        b = { x: 0, y: 0, r: 0, s: 1, vx: 0, vy: 0, vr: 0, vs: 0, raf: 0 };
        bodies.set(el, b);
      }
      return b;
    };

    const settle = (el: HTMLElement) => {
      const b = body(el);
      cancelAnimationFrame(b.raf);
      if (reduce.matches) {
        Object.assign(b, { x: 0, y: 0, r: 0, s: 1, vx: 0, vy: 0, vr: 0, vs: 0 });
        clear(el);
        return;
      }
      let last = performance.now();
      const K = 210; // stiffness
      const C = 13; // damping: under-damped, so it overshoots once and lands
      const step = (t: number) => {
        const dt = Math.min(0.032, (t - last) / 1000);
        last = t;
        b.vx += (-K * b.x - C * b.vx) * dt;
        b.vy += (-K * b.y - C * b.vy) * dt;
        b.vr += (-K * b.r - C * b.vr) * dt;
        b.vs += (-K * (b.s - 1) - C * b.vs) * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.r += b.vr * dt;
        b.s += b.vs * dt;
        const done =
          Math.abs(b.x) + Math.abs(b.y) < 0.2 &&
          Math.abs(b.vx) + Math.abs(b.vy) < 2 &&
          Math.abs(b.r) + Math.abs(b.vr) < 0.05 &&
          Math.abs(b.s - 1) < 0.001;
        if (done) {
          Object.assign(b, { x: 0, y: 0, r: 0, s: 1, vx: 0, vy: 0, vr: 0, vs: 0 });
          clear(el);
          return;
        }
        apply(el, b);
        b.raf = requestAnimationFrame(step);
      };
      b.raf = requestAnimationFrame(step);
    };

    const onDown = (e: PointerEvent) => {
      if (drag || !e.isPrimary || e.button !== 0) return;
      const el = resolve(e.target);
      if (!el) return;
      const b = body(el);
      cancelAnimationFrame(b.raf);
      drag = {
        el,
        id: e.pointerId,
        sx: e.clientX,
        sy: e.clientY,
        ox: unband(b.x),
        oy: unband(b.y),
        lastX: e.clientX,
        lastT: e.timeStamp,
        vx: 0,
        moved: b.x !== 0 || b.y !== 0,
      };
    };

    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < THRESHOLD) return;
      const el = drag.el;
      if (!drag.moved || !el.classList.contains("is-live")) {
        drag.moved = true;
        el.classList.add("is-live", "is-grabbed");
        document.documentElement.classList.add("is-dragging");
      }
      const dt = Math.max(1, e.timeStamp - drag.lastT);
      drag.vx = drag.vx * 0.7 + ((e.clientX - drag.lastX) / dt) * 0.3;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;

      const b = body(el);
      b.x = band(drag.ox + dx);
      b.y = band(drag.oy + dy);
      // big blocks lean less than small ones; the lean follows the hand's speed
      const w = Math.max(240, el.offsetWidth);
      const lean = reduce.matches ? 0 : (b.x / w) * 10 + drag.vx * 1.4;
      b.r = Math.max(-5, Math.min(5, lean));
      b.s = reduce.matches ? 1 : 1.015;
      b.vx = b.vy = b.vr = b.vs = 0;
      apply(el, b);
    };

    const swallowClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { el, moved } = drag;
      drag = null;
      el.classList.remove("is-grabbed");
      document.documentElement.classList.remove("is-dragging");
      if (!moved) return;
      if (e.type === "pointerup") {
        // The click that follows this pointerup belongs to the drag, not to a link.
        window.addEventListener("click", swallowClick, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", swallowClick, true), 0);
      }
      settle(el);
    };

    /* ---------- card tilt + spotlight ---------- */

    let tilted: HTMLElement | null = null;
    const untilt = () => {
      if (!tilted) return;
      tilted.style.removeProperty("--tilt-x");
      tilted.style.removeProperty("--tilt-y");
      tilted.classList.remove("is-lit");
      tilted = null;
    };

    const onHover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine.matches) return;
      const card =
        e.target instanceof Element ? e.target.closest<HTMLElement>(CARD_SEL) : null;
      if (card !== tilted) untilt();
      if (!card) return;
      tilted = card;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      card.classList.add("is-lit");
      if (!reduce.matches && !drag) {
        // larger cards tilt less, so the edge travel stays about the same
        const amp = Math.min(7, 1600 / Math.max(r.width, 200));
        card.style.setProperty("--tilt-x", `${((0.5 - py) * amp).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${((px - 0.5) * amp).toFixed(2)}deg`);
      }
    };

    /* ---------- hero parallax + magnetic button ---------- */

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce.matches) return;
      const scene = document.querySelector<HTMLElement>(".hero-scene");
      if (scene) {
        const r = scene.getBoundingClientRect();
        if (e.clientY >= r.top && e.clientY <= r.bottom) {
          scene.style.setProperty("--px", ((e.clientX / r.width) * 2 - 1).toFixed(3));
          scene.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        }
      }
      if (drag?.moved) return;
      document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((m) => {
        const r = m.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const reach = Math.max(r.width, r.height) * 1.1;
        const d = Math.hypot(dx, dy);
        if (d < reach) {
          const k = (1 - d / reach) * 0.35;
          m.style.translate = `${(dx * k).toFixed(1)}px ${(dy * k).toFixed(1)}px`;
        } else if (m.style.translate) {
          m.style.translate = "";
        }
      });
    };

    /* ---------- no copying ---------- */

    const onCopy = (e: ClipboardEvent) => {
      const node = document.getSelection()?.anchorNode;
      const el = node instanceof Element ? node : node?.parentElement;
      if (el?.closest(COPY_OK)) return;
      e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      // native link/image dragging would steal the pointer from the elastic drag
      if (e.target instanceof Element && !e.target.closest(COPY_OK)) e.preventDefault();
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointermove", onHover, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.addEventListener("mouseleave", untilt);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("dragstart", onDragStart);

    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointermove", onHover);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("mouseleave", untilt);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return <div className="film-grain" aria-hidden="true" />;
}

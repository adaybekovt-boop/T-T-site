"use client";

import { useEffect, useRef } from "react";

/**
 * The signature: the two discs of the mark resting on a lit planet horizon.
 *
 * The discs drift slowly into and out of overlap. Each frame we compute the
 * overlap area of the two circles and dim the horizon light in proportion,
 * so the motion explains the mark (it is an eclipse) instead of decorating it.
 * Under prefers-reduced-motion the scene is drawn once, at rest.
 */

const R = 80; // disc radius in SVG units
const CY = 100;
const LX = 150; // left disc rest position
const RX = 250; // right disc rest position (d / r = 1.25, as in the mark)
const PERIOD = 22_000; // ms per full crossing cycle

function overlapFraction(d: number) {
  if (d >= 2 * R) return 0;
  if (d <= 0) return 1;
  const a = 2 * R * R * Math.acos(d / (2 * R)) - (d / 2) * Math.sqrt(4 * R * R - d * d);
  return a / (Math.PI * R * R);
}

const REST_OVERLAP = overlapFraction(RX - LX);
const REST_LIGHT = 0.78;

export default function EclipseHorizon() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<SVGCircleElement>(null);
  const clipRef = useRef<SVGCircleElement>(null);
  const rightRef = useRef<SVGCircleElement>(null);
  const shadowRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let visible = true;
    let start = performance.now();

    const draw = (t: number) => {
      // phase 0 at rest; sin drives the crossing, a slower cos adds a small bob
      const p = ((t - start) / PERIOD) * Math.PI * 2;
      const s = Math.sin(p);
      const lx = LX + 9 * s;
      const rx = RX - 15 * s;
      const ly = CY + 2.5 * Math.cos(p * 0.5);
      const ry = CY - 2 * Math.cos(p * 0.5 + 0.6);
      leftRef.current?.setAttribute("cx", lx.toFixed(2));
      leftRef.current?.setAttribute("cy", ly.toFixed(2));
      clipRef.current?.setAttribute("cx", lx.toFixed(2));
      clipRef.current?.setAttribute("cy", ly.toFixed(2));
      rightRef.current?.setAttribute("cx", rx.toFixed(2));
      rightRef.current?.setAttribute("cy", ry.toFixed(2));
      shadowRef.current?.setAttribute("cx", rx.toFixed(2));
      shadowRef.current?.setAttribute("cy", ry.toFixed(2));

      const d = Math.hypot(rx - lx, ry - ly);
      const f = overlapFraction(d);
      // more overlap -> deeper eclipse -> dimmer horizon (about 0.53 .. 1 over a cycle)
      const light = Math.min(1, Math.max(0.5, REST_LIGHT - (f - REST_OVERLAP) * 1.6));
      scene.style.setProperty("--light", light.toFixed(3));
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches || !visible || document.hidden) {
        scene.style.setProperty("--light", REST_LIGHT.toFixed(3));
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      startLoop();
    });
    io.observe(scene);

    const onVisibility = () => startLoop();
    const onReduce = () => {
      start = performance.now();
      startLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onReduce);
    startLoop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onReduce);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className="hero-scene pointer-events-none absolute inset-0 overflow-hidden"
      style={{ ["--light" as string]: String(REST_LIGHT) }}
      aria-hidden="true"
    >
      <div className="discs rise">
        <svg viewBox="0 0 400 200" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id="eh-l" cx="0.74" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#EFE1D5" />
              <stop offset="0.45" stopColor="#BBAAA2" />
              <stop offset="1" stopColor="#4E4648" />
            </radialGradient>
            <radialGradient id="eh-r" cx="0.7" cy="0.6" r="0.85">
              <stop offset="0" stopColor="#F7924A" />
              <stop offset="0.5" stopColor="#E2692B" />
              <stop offset="1" stopColor="#8E3A1B" />
            </radialGradient>
            <radialGradient id="eh-o" cx="0.35" cy="0.5" r="0.7">
              <stop offset="0" stopColor="#2D2425" />
              <stop offset="1" stopColor="#1A1516" />
            </radialGradient>
            <clipPath id="eh-clip">
              <circle ref={clipRef} cx={LX} cy={CY} r={R} />
            </clipPath>
          </defs>
          <circle ref={leftRef} cx={LX} cy={CY} r={R} fill="url(#eh-l)" />
          <circle ref={rightRef} cx={RX} cy={CY} r={R} fill="url(#eh-r)" />
          <circle
            ref={shadowRef}
            cx={RX}
            cy={CY}
            r={R}
            fill="url(#eh-o)"
            clipPath="url(#eh-clip)"
          />
        </svg>
      </div>
      <div className="planet-haze" />
      <div className="planet" />
      <div className="grain grain-move absolute -inset-1/2 opacity-[0.28] mix-blend-multiply" />
    </div>
  );
}

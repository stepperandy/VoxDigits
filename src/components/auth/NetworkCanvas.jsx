import { useEffect, useRef } from "react";

// Approximate city positions across the continents (fractions of panel size)
const NODES = [
  { x: 0.20, y: 0.30 }, // New York
  { x: 0.11, y: 0.44 }, // Los Angeles
  { x: 0.27, y: 0.74 }, // São Paulo
  { x: 0.47, y: 0.24 }, // London
  { x: 0.49, y: 0.52 }, // Lagos
  { x: 0.53, y: 0.78 }, // Johannesburg
  { x: 0.56, y: 0.36 }, // Cairo
  { x: 0.63, y: 0.44 }, // Dubai
  { x: 0.69, y: 0.52 }, // Mumbai
  { x: 0.77, y: 0.58 }, // Singapore
  { x: 0.87, y: 0.34 }, // Tokyo
  { x: 0.88, y: 0.80 }, // Sydney
  { x: 0.40, y: 0.16 }, // Reykjavik
];

// Pairs of node indices to connect
const LINKS = [
  [0, 3], [0, 1], [0, 2], [3, 12], [3, 6], [3, 4], [4, 6],
  [4, 5], [6, 7], [7, 8], [8, 9], [9, 10], [9, 11], [10, 11],
  [7, 10], [2, 5], [5, 11], [1, 9], [3, 7],
];

const CYAN = "34, 211, 238";

export default function NetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let lastW = 0;
    let lastH = 0;

    const draw = (now) => {
      const t = now / 1000;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w !== lastW || h !== lastH) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        lastW = w;
        lastH = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const pts = NODES.map((n) => ({ x: n.x * w, y: n.y * h }));

      // Blinking arcs between continents
      LINKS.forEach(([a, b], idx) => {
        const p1 = pts[a];
        const p2 = pts[b];
        const phase = idx * 0.7;
        // Blink cycle: line fades in and out
        const blink = 0.5 + 0.5 * Math.sin(t * 1.4 + phase);
        const alpha = 0.08 + 0.30 * blink;

        // Control point lifted upward for a "great circle" feel
        const cx = (p1.x + p2.x) / 2;
        const cy = (p1.y + p2.y) / 2 - Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.18;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
        ctx.strokeStyle = `rgba(${CYAN}, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Traveling light packet along the arc
        const u = ((t * 0.18 + idx * 0.11) % 1);
        const iu = 1 - u;
        const px = iu * iu * p1.x + 2 * iu * u * cx + u * u * p2.x;
        const py = iu * iu * p1.y + 2 * iu * u * cy + u * u * p2.y;
        const glow = 0.5 + 0.5 * Math.sin(t * 4 + phase);
        ctx.beginPath();
        ctx.arc(px, py, 1.8 + glow * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 243, 252, ${0.6 + glow * 0.4})`;
        ctx.shadowColor = `rgba(${CYAN}, 0.9)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Pulsing city nodes
      pts.forEach((p, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + pulse * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CYAN}, ${0.55 + pulse * 0.45})`;
        ctx.shadowColor = `rgba(${CYAN}, 1)`;
        ctx.shadowBlur = 6 + pulse * 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[5] w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
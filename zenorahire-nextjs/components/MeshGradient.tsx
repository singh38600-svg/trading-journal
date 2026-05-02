"use client";
import { useEffect, useRef } from "react";

export default function MeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let t = 0;
    let raf: number;
    let mx = w / 2, my = h / 2;

    const orbs = [
      { x: 0.2, y: 0.3, r: 0.35, c: [99, 102, 241] },
      { x: 0.8, y: 0.2, r: 0.28, c: [167, 139, 250] },
      { x: 0.5, y: 0.7, r: 0.30, c: [6, 182, 212] },
      { x: 0.1, y: 0.8, r: 0.20, c: [99, 102, 241] },
    ];

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.004;

      orbs.forEach((orb, i) => {
        const ox = orb.x * w + Math.sin(t + i * 1.3) * w * 0.08 + (mx - w / 2) * 0.03;
        const oy = orb.y * h + Math.cos(t + i * 0.9) * h * 0.06 + (my - h / 2) * 0.02;
        const radius = orb.r * Math.min(w, h);
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
        grad.addColorStop(0, `rgba(${orb.c.join(",")},0.12)`);
        grad.addColorStop(1, `rgba(${orb.c.join(",")},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 1 }}
    />
  );
}

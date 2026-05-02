"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (isMobile) return;

    let mx = 0, my = 0, cx = 0, cy = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = mx + "px";
        dotRef.current.style.top = my + "px";
      }
    };

    const raf = () => {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.left = cx + "px";
        cursorRef.current.style.top = cy + "px";
      }
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const onEnter = () => cursorRef.current?.classList.add("hovering");
    const onLeave = () => cursorRef.current?.classList.remove("hovering");

    document.addEventListener("mousemove", onMove);
    document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div ref={cursorRef} className="cursor hidden lg:block" />
      <div ref={dotRef} className="cursor-dot hidden lg:block" />
    </>
  );
}

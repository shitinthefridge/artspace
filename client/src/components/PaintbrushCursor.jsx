import { useEffect, useRef } from "react";

const DOT_COLORS = ["#e05c22", "#f0ead8", "#a855f7", "#e05c22", "#f0ead8"];

export default function PaintbrushCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    // Don't run on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = cursorRef.current;
    let dots = [];

    function onMove(e) {
      const x = e.clientX;
      const y = e.clientY;

      // Move the SVG cursor
      if (cursor) {
        cursor.style.left = x + "px";
        cursor.style.top  = y + "px";
      }

      // Spawn a colored dot trail
      const dot = document.createElement("div");
      dot.className = "cursor-dot";
      dot.style.left   = (x - 3) + "px";
      dot.style.top    = (y - 3) + "px";
      dot.style.background = DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)];
      document.body.appendChild(dot);

      // Remove after animation
      dot.addEventListener("animationend", () => dot.remove());
    }

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      id="paintbrush-cursor"
      ref={cursorRef}
      style={{ position: "fixed", pointerEvents: "none", zIndex: 9999 }}
    >
      {/* Paintbrush SVG */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 24 L18 6" stroke="#e05c22" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 6 L23 3 L24 8 L18 6Z" fill="#f0ead8" stroke="#f0ead8" strokeWidth="1"/>
        <ellipse cx="4.5" cy="23.5" rx="3" ry="2" fill="#a855f7" opacity="0.8"/>
      </svg>
    </div>
  );
}

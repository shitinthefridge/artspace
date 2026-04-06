import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export default function Globe({ locations = [] }) {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerMovement = useRef(0);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const globeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      widthRef.current = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    // Convert DB locations → cobe markers
    const markers = locations
      .filter(l => l.lat != null && l.lng != null)
      .map(l => ({
        location: [l.lat, l.lng],
        size: l.type === "artist" ? 0.05 : 0.03,
      }));

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 0.4,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [0.11, 0.08, 0.05],
      markerColor: [0.878, 0.361, 0.133],   // burnt orange #e05c22
      glowColor: [0.94, 0.92, 0.85],         // cream #f0ead8
      markers,
      onRender(state) {
        if (!pointerInteracting.current) phiRef.current += 0.004;
        state.phi = phiRef.current;
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    setTimeout(() => { canvas.style.opacity = "1"; }, 0);

    return () => {
      globeRef.current?.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [locations]);

  return (
    <div className="relative flex items-center justify-center w-full aspect-square max-w-[500px] mx-auto overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.5s ease",
          contain: "layout paint size",
        }}
        onPointerDown={e => {
          pointerInteracting.current = e.clientX - pointerMovement.current;
          canvasRef.current.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          canvasRef.current.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          canvasRef.current.style.cursor = "grab";
        }}
        onMouseMove={e => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerMovement.current = delta;
            phiRef.current += delta / 300;
            pointerInteracting.current = e.clientX;
          }
        }}
        onTouchMove={e => {
          if (e.touches[0] && pointerInteracting.current !== null) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            phiRef.current += delta / 300;
            pointerInteracting.current = e.touches[0].clientX;
          }
        }}
      />
      {/* Bottom fade to blend into the dark background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 120%, rgba(14,12,10,0.6), transparent 60%)",
        }}
      />
    </div>
  );
}

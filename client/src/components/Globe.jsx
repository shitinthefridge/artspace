import { useEffect, useRef } from "react";

export default function Globe({ locations = [] }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const THREE = window.THREE;
    if (!THREE || !mountRef.current) return;

    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.6;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Low-poly globe — IcosahedronGeometry gives that chunky faceted look
    const globeGeo = new THREE.IcosahedronGeometry(1, 3);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x1a1714,
      emissive: 0x0e0c0a,
      specular: 0x333333,
      shininess: 10,
      wireframe: false,
      flatShading: true,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x3a3530, wireframe: true, transparent: true, opacity: 0.35 });
    const wireframe = new THREE.Mesh(globeGeo, wireMat);
    scene.add(wireframe);

    // Lighting
    const ambient = new THREE.AmbientLight(0xf0ead8, 0.3);
    scene.add(ambient);
    const point = new THREE.PointLight(0xe05c22, 1.2, 10);
    point.position.set(3, 3, 3);
    scene.add(point);

    // Location dots
    function latLngToVector3(lat, lng, radius) {
      const phi   = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
         radius * Math.cos(phi),
         radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    locations.forEach(loc => {
      if (loc.lat == null || loc.lng == null) return;
      const pos = latLngToVector3(loc.lat, loc.lng, 1.04);
      const dotGeo = new THREE.SphereGeometry(0.022, 4, 4);
      const dotMat = new THREE.MeshBasicMaterial({
        color: loc.type === "artist" ? 0xe05c22 : 0xa855f7,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      scene.add(dot);
    });

    // Drag rotation
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotVelocity = { x: 0, y: 0 };

    function onMouseDown(e) {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
      rotVelocity = { x: 0, y: 0 };
    }
    function onMouseMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      rotVelocity.x = dy * 0.005;
      rotVelocity.y = dx * 0.005;
      globe.rotation.x += rotVelocity.x;
      globe.rotation.y += rotVelocity.y;
      wireframe.rotation.x = globe.rotation.x;
      wireframe.rotation.y = globe.rotation.y;
      prevMouse = { x: e.clientX, y: e.clientY };
    }
    function onMouseUp() { isDragging = false; }

    // Touch support
    function onTouchStart(e) { isDragging = true; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
    function onTouchMove(e) {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - prevMouse.x;
      const dy = e.touches[0].clientY - prevMouse.y;
      globe.rotation.x += dy * 0.005;
      globe.rotation.y += dx * 0.005;
      wireframe.rotation.x = globe.rotation.x;
      wireframe.rotation.y = globe.rotation.y;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: true });
    renderer.domElement.addEventListener("touchend", onMouseUp);

    // Animation loop
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        globe.rotation.y += 0.003;
        wireframe.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [locations]);

  return (
    <div
      ref={mountRef}
      id="globe-canvas"
      style={{ width: "100%", height: "100%", minHeight: "380px" }}
    />
  );
}

import * as THREE from "three";
import { toneFor, cappedPixelRatio, motionReducedNow } from "./palette.js";

function shapeFor(index) {
  const kind = index % 18;
  if (kind === 0) return new THREE.IcosahedronGeometry(0.72, 1);
  if (kind === 1) return new THREE.TorusKnotGeometry(0.38, 0.12, 48, 8);
  if (kind === 2) return new THREE.OctahedronGeometry(0.78, 0);
  if (kind === 3) return new THREE.ConeGeometry(0.55, 1.15, 6);
  if (kind === 4) return new THREE.TorusGeometry(0.52, 0.16, 12, 28);
  if (kind === 5) return new THREE.DodecahedronGeometry(0.68, 0);
  if (kind === 6) return new THREE.CapsuleGeometry(0.28, 0.72, 4, 8);
  if (kind === 7) return new THREE.TetrahedronGeometry(0.86, 0);
  if (kind === 8) return new THREE.BoxGeometry(0.85, 0.85, 0.85);
  if (kind === 9) return new THREE.CylinderGeometry(0.22, 0.62, 1.05, 6);
  if (kind === 10) return new THREE.RingGeometry(0.28, 0.72, 5);
  if (kind === 11) return new THREE.SphereGeometry(0.62, 14, 10);
  if (kind === 12) return new THREE.CylinderGeometry(0.55, 0.55, 0.28, 3);
  if (kind === 13) return new THREE.OctahedronGeometry(0.7, 1);
  if (kind === 14) return new THREE.ConeGeometry(0.62, 0.9, 3);
  if (kind === 15) return new THREE.TorusGeometry(0.48, 0.08, 8, 5);
  if (kind === 16) return new THREE.IcosahedronGeometry(0.66, 0);
  return new THREE.SphereGeometry(0.42, 8, 6);
}

export function mountIcons(root) {
  const canvases = [...root.querySelectorAll("canvas.track-icon")];
  if (!canvases.length || !window.WebGLRenderingContext) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch (err) {
    return null;
  }
  renderer.setPixelRatio(cappedPixelRatio());
  renderer.setSize(96, 96, false);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10);
  camera.position.set(1.6, 1.1, 2.2);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.PointLight(0xffffff, 12, 8);
  key.position.set(2, 2, 2);
  scene.add(key);
  const rig = new THREE.Group();
  scene.add(rig);
  const icons = canvases.map((canvas, index) => {
    const hue = canvas.dataset.hue || "#22e7ff";
    const geo = shapeFor(index + (canvas.dataset.icon || "").length);
    const color = new THREE.Color(hue);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: 0.65, roughness: 0.28, metalness: 0.35,
    }));
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.035, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    ring.rotation.x = Math.PI / 2.4;
    return { canvas, mesh, ring, spin: index * 0.4 };
  });
  let raf = 0;
  let running = true;
  let onScreen = true;
  const scratch = document.createElement("canvas");
  scratch.width = 96;
  scratch.height = 96;

  function paintTheme() {
    const tone = toneFor(document.documentElement.dataset.theme || "neon");
    key.color.setHex(tone.a);
    icons.forEach((icon, index) => {
      const hex = index % 3 === 0 ? tone.a : index % 3 === 1 ? tone.b : tone.c;
      const mixed = new THREE.Color(icon.canvas.dataset.hue || "#ffffff").lerp(new THREE.Color(hex), 0.45);
      icon.mesh.material.color.copy(mixed);
      icon.mesh.material.emissive.copy(mixed);
      icon.ring.material.color.setHex(index % 2 ? tone.b : tone.a);
    });
  }

  function paintOne(t) {
    icons.forEach((icon) => {
      while (rig.children.length) rig.remove(rig.children[0]);
      icon.mesh.rotation.y = t + icon.spin;
      icon.mesh.rotation.x = 0.4;
      icon.ring.rotation.z = t * 0.4;
      rig.add(icon.mesh);
      rig.add(icon.ring);
      renderer.render(scene, camera);
      const ctx = icon.canvas.getContext("2d");
      ctx.clearRect(0, 0, icon.canvas.width, icon.canvas.height);
      ctx.drawImage(renderer.domElement, 0, 0, icon.canvas.width, icon.canvas.height);
      rig.remove(icon.mesh);
      rig.remove(icon.ring);
    });
  }
  function frame() {
    if (!running) return;
    if (document.hidden || !onScreen) {
      raf = 0;
      return;
    }
    if (motionReducedNow()) {
      paintOne(0.4);
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
    const t = performance.now() * 0.001;
    icons.forEach((icon) => {
      while (rig.children.length) rig.remove(rig.children[0]);
      icon.mesh.rotation.y = t + icon.spin;
      icon.mesh.rotation.x = 0.4 + Math.sin(t + icon.spin) * 0.15;
      icon.ring.rotation.z = t * 0.4;
      rig.add(icon.mesh);
      rig.add(icon.ring);
      renderer.render(scene, camera);
      const ctx = icon.canvas.getContext("2d");
      ctx.clearRect(0, 0, icon.canvas.width, icon.canvas.height);
      ctx.drawImage(renderer.domElement, 0, 0, icon.canvas.width, icon.canvas.height);
      rig.remove(icon.mesh);
      rig.remove(icon.ring);
    });
  }
  function applyRatio() {
    renderer.setPixelRatio(cappedPixelRatio());
    renderer.setSize(96, 96, false);
  }
  window.addEventListener("resize", applyRatio);
  function onHide() {
    if (!running) return;
    if (document.hidden || !onScreen) {
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (!raf) raf = requestAnimationFrame(frame);
  }
  const viewObserver = new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    onHide();
  }, { threshold: 0.02 });
  canvases.forEach((canvas) => viewObserver.observe(canvas));
  document.addEventListener("visibilitychange", onHide);
  paintTheme();
  frame();
  return {
    setTheme() { paintTheme(); },
    setMotion() {
      cancelAnimationFrame(raf);
      raf = 0;
      if (!motionReducedNow()) frame();
      else paintOne(0.4);
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", applyRatio);
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      icons.forEach((icon) => {
        icon.mesh.geometry.dispose();
        icon.mesh.material.dispose();
        icon.ring.geometry.dispose();
        icon.ring.material.dispose();
      });
      renderer.dispose();
    },
  };
}

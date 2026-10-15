import * as THREE from "three";

export const HERO_THEMES = {
  dark: { bg: 0x07101c, a: 0xffb020, b: 0x2dd4bf, c: 0x818cf8 },
  light: { bg: 0xd7e6f8, a: 0xc2410c, b: 0x0f766e, c: 0x4338ca },
  neon: { bg: 0x07010f, a: 0xff2d95, b: 0x22e7ff, c: 0xc084fc },
  holographic: { bg: 0x03141c, a: 0x5eead4, b: 0xa78bfa, c: 0x67e8f9 },
  cyberpunk: { bg: 0x140014, a: 0xfcee0a, b: 0xff003c, c: 0x00f0ff },
  sunset: { bg: 0x1c0c16, a: 0xff7a3c, b: 0xff2d7b, c: 0xffd166 },
  futuristic: { bg: 0x050816, a: 0x00e5ff, b: 0x7c5cff, c: 0x5eead4 },
  gaming: { bg: 0x0a0614, a: 0x39ff14, b: 0xff2bd6, c: 0x7df9ff },
  contrast: { bg: 0x000000, a: 0xffe14a, b: 0xffffff, c: 0xffe14a },
  console: { bg: 0x0f1b2d, a: 0xff9900, b: 0x3dcfb4, c: 0x7aa7ff },
};

const NAMES = ["Connect", "Lex", "Lambda", "Queue", "CCP", "Kinesis"];

function makeLabel(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  g.clearRect(0, 0, 512, 128);
  g.font = "700 72px Palatino, Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#f8fafc";
  g.shadowColor = color;
  g.shadowBlur = 18;
  g.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(1.8, 0.45, 1);
  return sprite;
}

export function mountHero(container, themeId) {
  let themeKey = HERO_THEMES[themeId] ? themeId : "dark";
  const colors = () => HERO_THEMES[themeKey];
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    return null;
  }
  const narrow = (container.clientWidth || window.innerWidth) < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.25 : 1.6));
  renderer.setClearColor(colors().bg, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute("aria-label", "Three.js hero. Connect sits in a glowing ring with Lex, Lambda, a queue, the CCP, and Kinesis. The camera drifts. No click is required.");
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(colors().bg, 10, 28);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 50);
  camera.position.set(7.5, 3.4, 8);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.PointLight(colors().a, 28, 30);
  key.position.set(4, 6, 3);
  scene.add(key);
  const fill = new THREE.PointLight(colors().b, 18, 26);
  fill.position.set(-5, 2, -3);
  scene.add(fill);

  const grid = new THREE.GridHelper(36, 28, colors().b, colors().a);
  grid.position.y = -2.1;
  const gridMat = grid.material;
  gridMat.transparent = true;
  gridMat.opacity = 0.45;
  scene.add(grid);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.3, 0.07, 16, 96),
    new THREE.MeshBasicMaterial({ color: colors().b })
  );
  ring.rotation.x = Math.PI / 2.4;
  scene.add(ring);

  const coreMat = new THREE.MeshStandardMaterial({
    color: colors().a, emissive: colors().a, emissiveIntensity: 0.85, roughness: 0.25, metalness: 0.4,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), coreMat);
  scene.add(core);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 24, 24),
    new THREE.MeshBasicMaterial({ color: colors().a, transparent: true, opacity: 0.18, depthWrite: false })
  );
  scene.add(glow);

  const nodeMats = [];
  const nodes = new THREE.Group();
  NAMES.forEach((name, index) => {
    const angle = (index / NAMES.length) * Math.PI * 2;
    const mat = new THREE.MeshStandardMaterial({
      color: index % 2 ? colors().b : colors().c,
      emissive: index % 2 ? colors().b : colors().c,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.35,
    });
    nodeMats.push(mat);
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), mat);
    mesh.position.set(Math.cos(angle) * 3.2, Math.sin(angle * 2) * 0.25, Math.sin(angle) * 3.2);
    const label = makeLabel(name, "#ffffff");
    label.position.y = 0.55;
    mesh.add(label);
    nodes.add(mesh);
  });
  scene.add(nodes);

  const packet = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshBasicMaterial({ color: colors().a })
  );
  scene.add(packet);

  const count = narrow ? 280 : 640;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
  }
  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pointsMat = new THREE.PointsMaterial({ color: colors().b, size: 0.07, transparent: true, opacity: 0.9 });
  const points = new THREE.Points(pointsGeo, pointsMat);
  scene.add(points);

  const pointer = { x: 0, y: 0 };
  let scrollBoost = 0;
  let raf = 0;
  const clock = new THREE.Clock();

  function resize() {
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;
    if (width < 2 || height < 2) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  function onPointer(event) {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
  }
  function onScroll() {
    const rect = container.getBoundingClientRect();
    scrollBoost = Math.max(-1.6, Math.min(1.6, -rect.top / 480));
  }
  function frame() {
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();
    nodes.rotation.y = t * 0.18;
    ring.rotation.z = t * 0.08;
    core.rotation.y = t * 0.4;
    core.rotation.x = t * 0.15;
    glow.scale.setScalar(1 + Math.sin(t * 1.6) * 0.06);
    const travel = t * 0.85;
    packet.position.set(Math.cos(travel) * 3.2, 0.35 + Math.sin(t * 2) * 0.12, Math.sin(travel) * 3.2);
    points.rotation.y = t * 0.02;
    const drift = t * 0.07;
    camera.position.x = Math.cos(drift) * 8.4 + pointer.x * 1.1;
    camera.position.z = Math.sin(drift) * 8.4;
    camera.position.y = 3.1 + Math.sin(t * 0.23) * 0.35 + scrollBoost + pointer.y * 0.45;
    camera.lookAt(0, 0.15, 0);
    renderer.render(scene, camera);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  resize();
  onScroll();
  raf = requestAnimationFrame(frame);

  function paintTheme() {
    const tone = colors();
    renderer.setClearColor(tone.bg, 1);
    scene.fog.color.setHex(tone.bg);
    key.color.setHex(tone.a);
    fill.color.setHex(tone.b);
    ring.material.color.setHex(tone.b);
    coreMat.color.setHex(tone.a);
    coreMat.emissive.setHex(tone.a);
    glow.material.color.setHex(tone.a);
    packet.material.color.setHex(tone.a);
    pointsMat.color.setHex(tone.b);
    gridMat.color.setHex(tone.b);
    nodeMats.forEach((mat, index) => {
      const hex = index % 2 ? tone.b : tone.c;
      mat.color.setHex(hex);
      mat.emissive.setHex(hex);
    });
  }

  return {
    setTheme(next) {
      if (HERO_THEMES[next]) themeKey = next;
      paintTheme();
    },
    dispose() {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      pointsGeo.dispose();
      pointsMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.remove();
    },
  };
}

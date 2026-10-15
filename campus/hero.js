import * as THREE from "three";
import { EffectComposer } from "./vendor/postprocessing/EffectComposer.js";
import { RenderPass } from "./vendor/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./vendor/postprocessing/UnrealBloomPass.js";
import { PALETTE } from "./palette.js";

export const HERO_THEMES = PALETTE;

const SERVICES = ["Connect", "Lex", "Lambda", "Queue", "CCP", "Kinesis", "S3", "IAM"];
const REGIONS = [
  ["us-east-1", "N. Virginia"],
  ["us-west-2", "Oregon"],
  ["eu-central-1", "Frankfurt"],
  ["eu-west-2", "London"],
  ["ap-northeast-1", "Tokyo"],
  ["ap-northeast-3", "Osaka"],
];
const FLOW_STOPS = ["PSTN", "Flow", "Queue", "Agent"];

function makeLabel(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  g.clearRect(0, 0, 512, 128);
  g.font = "700 64px Palatino, Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#f8fafc";
  g.shadowColor = color;
  g.shadowBlur = 16;
  g.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(1.7, 0.42, 1);
  return sprite;
}

function roundedPlate(w, h, r, depth) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + h - r);
  shape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + h);
  shape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
}

function dust(count, spread, size, opacity) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.55;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return { points: new THREE.Points(geo, mat), geo, mat };
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
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute("aria-label", "Three.js hero. Region tiles orbit a contact flow. Packets travel from the PSTN through the flow and the queue to the agent. Service labels circle the core. No click is required.");
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(colors().bg, 12, 32);
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60);
  camera.position.set(8.2, 3.6, 9.2);

  scene.add(new THREE.AmbientLight(0xffffff, 0.28));
  const key = new THREE.PointLight(colors().a, 22, 34);
  key.position.set(4, 6, 3);
  scene.add(key);
  const fill = new THREE.PointLight(colors().b, 14, 28);
  fill.position.set(-6, 2, -4);
  scene.add(fill);

  const grid = new THREE.GridHelper(40, 24, colors().b, colors().a);
  grid.position.y = -2.4;
  const gridMat = grid.material;
  gridMat.transparent = true;
  gridMat.opacity = 0.28;
  scene.add(grid);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.15, 0.045, 12, 80),
    new THREE.MeshBasicMaterial({ color: colors().b })
  );
  ring.rotation.x = Math.PI / 2.35;
  scene.add(ring);
  const regionRing = new THREE.Mesh(
    new THREE.TorusGeometry(5.6, 0.02, 8, 96),
    new THREE.MeshBasicMaterial({ color: colors().c, transparent: true, opacity: 0.65 })
  );
  regionRing.rotation.x = Math.PI / 2.15;
  scene.add(regionRing);

  const coreMat = new THREE.MeshStandardMaterial({
    color: colors().a, emissive: colors().a, emissiveIntensity: 0.7, roughness: 0.3, metalness: 0.35,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), coreMat);
  scene.add(core);

  const nodeMats = [];
  const nodes = new THREE.Group();
  SERVICES.forEach((name, index) => {
    const angle = (index / SERVICES.length) * Math.PI * 2;
    const mat = new THREE.MeshStandardMaterial({
      color: index % 2 ? colors().b : colors().c,
      emissive: index % 2 ? colors().b : colors().c,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.3,
    });
    nodeMats.push(mat);
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), mat);
    mesh.position.set(Math.cos(angle) * 3.15, Math.sin(angle * 2) * 0.35, Math.sin(angle) * 3.15);
    nodes.add(mesh);
  });
  scene.add(nodes);

  const labelOrbit = new THREE.Group();
  SERVICES.forEach((name, index) => {
    const angle = (index / SERVICES.length) * Math.PI * 2;
    const label = makeLabel(name, "#ffffff");
    label.position.set(Math.cos(angle) * 3.7, 0.55 + Math.sin(angle) * 0.15, Math.sin(angle) * 3.7);
    labelOrbit.add(label);
  });
  scene.add(labelOrbit);

  const regionMat = new THREE.MeshStandardMaterial({
    color: colors().c, emissive: colors().b, emissiveIntensity: 0.28, roughness: 0.45, metalness: 0.15,
  });
  const regionHead = new THREE.MeshBasicMaterial({ color: colors().a });
  const regionGeo = roundedPlate(1.35, 0.62, 0.12, 0.08);
  const regionGroup = new THREE.Group();
  REGIONS.forEach((pair, index) => {
    const tile = new THREE.Group();
    const body = new THREE.Mesh(regionGeo, regionMat);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.09), regionHead);
    cap.position.set(0, 0.24, 0.02);
    const label = makeLabel(pair[0], "#ffffff");
    label.position.set(0, -0.02, 0.16);
    label.scale.set(1.25, 0.32, 1);
    tile.add(body, cap, label);
    const angle = (index / REGIONS.length) * Math.PI * 2;
    tile.position.set(Math.cos(angle) * 5.6, Math.sin(angle) * 0.42, Math.sin(angle) * 5.6);
    tile.lookAt(0, tile.position.y, 0);
    regionGroup.add(tile);
  });
  scene.add(regionGroup);

  const flowPoints = [
    new THREE.Vector3(-4.4, -0.55, 1.4),
    new THREE.Vector3(-1.5, 0.15, 2.5),
    new THREE.Vector3(1.1, 0.85, 0.3),
    new THREE.Vector3(3.8, 0.05, -1.8),
  ];
  const curve = new THREE.CatmullRomCurve3(flowPoints);
  const tubeMat = new THREE.MeshBasicMaterial({ color: colors().a });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.025, 6, false), tubeMat);
  scene.add(tube);
  const flowLabels = new THREE.Group();
  FLOW_STOPS.forEach((name, index) => {
    const label = makeLabel(name, "#ffffff");
    label.position.copy(curve.getPointAt(index / (FLOW_STOPS.length - 1)));
    label.position.y += 0.38;
    label.scale.set(1.15, 0.3, 1);
    flowLabels.add(label);
  });
  scene.add(flowLabels);
  const packetMats = [];
  const packets = FLOW_STOPS.map((_, index) => {
    const mat = new THREE.MeshBasicMaterial({ color: index % 2 ? colors().b : colors().a });
    packetMats.push(mat);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), mat);
    scene.add(mesh);
    return mesh;
  });

  const far = dust(narrow ? 220 : 520, 28, 0.045, 0.45);
  far.points.position.z = -6;
  scene.add(far.points);
  const near = dust(narrow ? 70 : 140, 14, 0.16, 0.7);
  near.points.position.z = 2.2;
  scene.add(near.points);

  const pointer = { x: 0, y: 0 };
  let scrollBoost = 0;
  let raf = 0;
  const clock = new THREE.Clock();

  const gl = renderer.getContext();
  const halfFloat = gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float");
  const bufferType = halfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;
  let composer = null;
  let bloomPass = null;
  try {
    composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(2, 2, { type: bufferType }));
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(2, 2), 0.95, 0.42, 0.2, bufferType);
    composer.addPass(bloomPass);
    container.dataset.bloom = "on";
  } catch (err) {
    composer = null;
    container.dataset.bloom = "off";
  }

  function resize() {
    const width = container.clientWidth || window.innerWidth || 640;
    const height = container.clientHeight || window.innerHeight || 480;
    if (width < 2 || height < 2) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (composer) composer.setSize(width, height);
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
    nodes.rotation.y = t * 0.16;
    labelOrbit.rotation.y = -t * 0.11;
    regionGroup.rotation.y = t * 0.07;
    ring.rotation.z = t * 0.05;
    regionRing.rotation.z = -t * 0.03;
    core.rotation.y = t * 0.35;
    core.rotation.x = t * 0.12;
    packets.forEach((mesh, index) => {
      const u = (t * 0.08 + index / packets.length) % 1;
      mesh.position.copy(curve.getPointAt(u));
    });
    far.points.rotation.y = t * 0.012;
    near.points.rotation.y = -t * 0.04;
    const drift = t * 0.06;
    camera.position.x = Math.cos(drift) * 9.1 + pointer.x * 1.1;
    camera.position.z = Math.sin(drift) * 9.1;
    camera.position.y = 3.2 + Math.sin(t * 0.2) * 0.4 + scrollBoost + pointer.y * 0.4;
    camera.lookAt(0, 0.2, 0);
    if (composer) {
      try {
        composer.render();
      } catch (err) {
        composer = null;
        container.dataset.bloom = "off";
        renderer.render(scene, camera);
      }
    } else {
      renderer.render(scene, camera);
    }
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
    regionRing.material.color.setHex(tone.c);
    coreMat.color.setHex(tone.a);
    coreMat.emissive.setHex(tone.a);
    regionMat.color.setHex(tone.c);
    regionMat.emissive.setHex(tone.b);
    regionHead.color.setHex(tone.a);
    tubeMat.color.setHex(tone.a);
    far.mat.color.setHex(tone.b);
    near.mat.color.setHex(tone.a);
    gridMat.color.setHex(tone.b);
    nodeMats.forEach((mat, index) => {
      const hex = index % 2 ? tone.b : tone.c;
      mat.color.setHex(hex);
      mat.emissive.setHex(hex);
    });
    packetMats.forEach((mat, index) => mat.color.setHex(index % 2 ? tone.b : tone.a));
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
      regionGeo.dispose();
      far.geo.dispose();
      far.mat.dispose();
      near.geo.dispose();
      near.mat.dispose();
      if (bloomPass) bloomPass.dispose();
      if (composer) {
        composer.renderTarget1.dispose();
        composer.renderTarget2.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.remove();
    },
  };
}

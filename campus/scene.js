import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { toneFor } from "./palette.js";

const SERVICES = [
  { id: "connect", name: "Connect", color: "#FFB020", at: [0, 0.35, 0] },
  { id: "lex", name: "Lex", color: "#818CF8", at: [-2.35, 0.9, -1.15] },
  { id: "lambda", name: "Lambda", color: "#FBBF24", at: [2.35, 0.55, -1.25] },
  { id: "kinesis", name: "Kinesis", color: "#2DD4BF", at: [1.85, -0.35, 1.35] },
  { id: "lens", name: "Contact Lens", color: "#F472B6", at: [-1.9, -0.15, 1.25] },
  { id: "ccp", name: "CCP", color: "#E8EEF7", at: [0.15, 1.55, 1.7] },
];

const LINKS = [
  { id: "lex", from: "connect", to: "lex" },
  { id: "lambda", from: "connect", to: "lambda" },
  { id: "kinesis", from: "connect", to: "kinesis" },
  { id: "lens", from: "connect", to: "lens" },
  { id: "turn", from: "ccp", to: "connect" },
];

function makeLabel(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  g.fillStyle = "rgba(11, 17, 32, 0.88)";
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = color;
  g.lineWidth = 8;
  g.strokeRect(8, 8, 496, 112);
  g.fillStyle = "#F8FAFC";
  g.font = "600 64px Palatino, Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, 68);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(1.7, 0.42, 1);
  return sprite;
}

function nodeMesh(service) {
  const group = new THREE.Group();
  const color = new THREE.Color(service.color);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.58, 0.92),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.45, roughness: 0.35, metalness: 0.15 })
  );
  group.add(body);
  const label = makeLabel(service.name, service.color);
  label.position.y = 0.62;
  group.add(label);
  group.position.set(service.at[0], service.at[1], service.at[2]);
  group.userData.id = service.id;
  return group;
}

export function mountArchitecture(container) {
  const width = container.clientWidth || 640;
  const height = container.clientHeight || 460;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
  } catch (err) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  let themeId = document.documentElement.dataset.theme || "neon";
  renderer.setClearColor(toneFor(themeId).bg, 1);
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute("aria-label", "Three dimensional map of Connect, Lex, Lambda, Kinesis, Contact Lens, and the CCP");
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 40);
  camera.position.set(5.2, 3.6, 6.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.4, 0);
  controls.minDistance = 3.2;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI / 2.05;

  scene.add(new THREE.AmbientLight(0xdbe7ff, 0.55));
  const key = new THREE.PointLight(toneFor(themeId).a, 18, 20);
  key.position.set(3, 5, 2);
  scene.add(key);
  const fill = new THREE.PointLight(toneFor(themeId).b, 10, 18);
  fill.position.set(-4, 2, -2);
  scene.add(fill);

  const floor = new THREE.GridHelper(10, 12, toneFor(themeId).b, toneFor(themeId).a);
  floor.position.y = -1.15;
  scene.add(floor);

  const meshes = {};
  const nodeBodies = [];
  SERVICES.forEach((service, index) => {
    const mesh = nodeMesh(service);
    meshes[service.id] = mesh;
    mesh.userData.slot = index;
    scene.add(mesh);
    mesh.traverse((child) => {
      if (child.isMesh && child.geometry && child.geometry.type === "BoxGeometry") nodeBodies.push(child);
    });
  });

  const linkViews = {};
  LINKS.forEach((link) => {
    const a = meshes[link.from].position;
    const b = meshes[link.to].position;
    const mid = a.clone().lerp(b, 0.5);
    mid.y += 0.45;
    const curve = new THREE.CatmullRomCurve3([a.clone(), mid, b.clone()]);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 28, 0.035, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x2dd4bf, emissiveIntensity: 0.8, roughness: 0.4 })
    );
    const packet = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfff7e6, emissive: 0xffb020, emissiveIntensity: 1 })
    );
    scene.add(tube);
    scene.add(packet);
    linkViews[link.id] = { curve, tube, packet, t: Math.random(), down: false };
  });

  let scenario = "none";
  let frame = 0;
  let running = true;

  function applyScenario() {
    LINKS.forEach((link) => {
      const view = linkViews[link.id];
      const down = scenario === link.id;
      view.down = down;
      const tone = toneFor(themeId);
      const color = down ? new THREE.Color("#FB7185") : new THREE.Color(tone.b);
      view.tube.material.color.copy(color);
      view.tube.material.emissive.copy(color);
      view.packet.visible = !down;
      if (meshes[link.to]) {
        meshes[link.to].traverse((child) => {
          if (child.isMesh && child.material && child.material.emissive) {
            child.material.emissiveIntensity = down && child.parent === meshes[link.to] ? 0.05 : 0.45;
          }
        });
      }
    });
    if (scenario === "none") {
      SERVICES.forEach((service) => {
        meshes[service.id].traverse((child) => {
          if (child.isMesh && child.material && child.material.emissiveIntensity != null && child.geometry && child.geometry.type === "BoxGeometry") {
            child.material.emissiveIntensity = 0.45;
          }
        });
      });
    }
  }

  const clock = new THREE.Clock();
  let onScreen = true;
  function tick() {
    if (!running) return;
    if (document.hidden || !onScreen) {
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
    const dt = clock.getDelta();
    Object.values(linkViews).forEach((view) => {
      if (view.down) return;
      view.t = (view.t + dt * 0.22) % 1;
      view.packet.position.copy(view.curve.getPoint(view.t));
    });
    controls.update();
    renderer.render(scene, camera);
  }
  function resume() {
    if (!running || frame || document.hidden || !onScreen) return;
    clock.getDelta();
    tick();
  }
  function onHide() {
    if (document.hidden || !onScreen) {
      cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    resume();
  }
  const viewObserver = new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    onHide();
  }, { threshold: 0.02 });
  viewObserver.observe(container);
  document.addEventListener("visibilitychange", onHide);
  applyScenario();
  tick();

  const onResize = () => {
    const w = container.clientWidth || 640;
    const h = container.clientHeight || 460;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const observer = new ResizeObserver(onResize);
  observer.observe(container);

  function paintTheme(next) {
    themeId = toneFor(next) ? next : themeId;
    const tone = toneFor(themeId);
    renderer.setClearColor(tone.bg, 1);
    key.color.setHex(tone.a);
    fill.color.setHex(tone.b);
    const gridMat = floor.material;
    if (gridMat && gridMat.color) gridMat.color.setHex(tone.b);
    nodeBodies.forEach((body, index) => {
      const hex = index % 3 === 0 ? tone.a : index % 3 === 1 ? tone.b : tone.c;
      body.material.color.setHex(hex);
      body.material.emissive.setHex(hex);
    });
    Object.values(linkViews).forEach((view) => {
      view.packet.material.color.setHex(tone.a);
      view.packet.material.emissive.setHex(tone.a);
    });
    applyScenario();
  }
  paintTheme(themeId);

  return {
    setTheme(next) { paintTheme(next); },
    setScenario(next) {
      scenario = next || "none";
      applyScenario();
    },
    dispose() {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      controls.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat) => {
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

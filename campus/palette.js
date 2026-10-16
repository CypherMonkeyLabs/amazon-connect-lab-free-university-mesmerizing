export const PALETTE = {
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

export function toneFor(themeId) {
  return PALETTE[themeId] || PALETTE.neon;
}

export function cappedPixelRatio() {
  const ratio = window.devicePixelRatio || 1;
  const mobile = window.matchMedia("(max-width: 700px)").matches;
  return Math.min(ratio, mobile ? 1.5 : 2);
}

export function motionReducedNow() {
  const mode = document.documentElement.dataset.motion;
  if (mode === "reduce") return true;
  if (mode === "full") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

import * as namespace from "./d3.min.js";

function resolve(mod) {
  if (mod && typeof mod.select === "function") return mod;
  if (mod && mod.default && typeof mod.default.select === "function") return mod.default;
  if (typeof globalThis.d3 === "object" && typeof globalThis.d3.select === "function") return globalThis.d3;
  return null;
}

const d3 = resolve(namespace);
if (d3 && typeof globalThis.d3 !== "object") globalThis.d3 = d3;

export default d3;

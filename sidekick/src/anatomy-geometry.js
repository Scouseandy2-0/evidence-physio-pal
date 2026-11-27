import { deinterleaveGeometry } from 'three/addons/utils/BufferGeometryUtils.js';
// SVG Projector reads packed arrays. Preserve every vertex while unpacking GLTF attributes.
export function prepareSoftwareGeometry(geometry) { deinterleaveGeometry(geometry); return geometry; }

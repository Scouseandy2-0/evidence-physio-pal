import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { prepareSoftwareGeometry } from '../src/anatomy-geometry.js';
test('software renderer receives packed GLTF positions without changing any vertex or normal', async()=>{
  const bytes=readFileSync(new URL('../web/skeleton.glb',import.meta.url));
  const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  let meshes=0, interleaved=0;
  gltf.scene.traverse(node=>{
    if(!node.isMesh)return;meshes++;
    const before={};
    for(const key of ['position','normal']){const a=node.geometry.getAttribute(key); if(a.isInterleavedBufferAttribute)interleaved++;before[key]=Array.from({length:a.count},(_,i)=>[a.getX(i),a.getY(i),a.getZ(i)]);}
    prepareSoftwareGeometry(node.geometry);
    for(const key of ['position','normal']){const a=node.geometry.getAttribute(key);assert.ok(!a.isInterleavedBufferAttribute);assert.equal(a.array.length,a.count*3);assert.deepEqual(Array.from({length:a.count},(_,i)=>[a.getX(i),a.getY(i),a.getZ(i)]),before[key]);}
  });
  assert.equal(meshes,242);assert.ok(interleaved>0);
});

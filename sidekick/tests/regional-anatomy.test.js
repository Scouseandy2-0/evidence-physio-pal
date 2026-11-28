import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {anatomySystems,anatomyLearningDraft,filterAnatomy} from '../web/anatomy.js';
import {regionalGuides,regionalStructures,regionSources,nerveNotes,regionMarkdown} from '../web/regional-anatomy.js';
import {prepareSoftwareGeometry} from '../src/anatomy-geometry.js';

test('muscle GLB is the pinned self-contained asset and every selectable group has real matching source IDs',()=>{
 const {model,catalog}=anatomySystems.muscles,b=readFileSync('web/muscles.glb'),manifest=JSON.parse(readFileSync('web/muscles-manifest.json','utf8'));
 assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(8),b.length);assert.equal(b.length,model.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),model.sha256);
 const gltf=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());assert.equal(gltf.meshes.length,177);assert.equal(catalog.length,177);assert.equal(new Set(catalog.map(s=>s.id)).size,177);assert.ok(gltf.buffers.every(b=>!b.uri));assert.equal((gltf.images||[]).length,0);
 for(const s of catalog){const node=gltf.nodes.find(n=>n.extras.structureId===s.id),m=manifest.structures.find(m=>m.id===s.id);assert.ok(node && m);assert.equal(node.name,s.id);assert.equal(node.extras.fma,s.fma);assert.equal(m.sourceName,s.sourceName);assert.deepEqual(node.extras.sources,s.sourceIds);assert.deepEqual(m.sources.map(s=>s.element),s.sourceIds);}
 assert.equal(manifest.structures.reduce((n,s)=>n+s.sources.length,0),428);
});
test('real muscle geometry loads in the shared Three loader and remains usable by software rendering',async()=>{
 const b=readFileSync('web/muscles.glb'),scene=(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;
 let count=0;const bounds=new THREE.Box3().setFromObject(scene);assert.ok(!bounds.isEmpty());assert.ok([...bounds.min,...bounds.max].every(Number.isFinite));
 scene.traverse(n=>{if(!n.isMesh)return;count++;const before=n.geometry.getAttribute('position');assert.ok(before.count>0);const expected=[before.getX(0),before.getY(0),before.getZ(0)];prepareSoftwareGeometry(n.geometry);const after=n.geometry.getAttribute('position');assert.ok(!after.isInterleavedBufferAttribute);assert.deepEqual([after.getX(0),after.getY(0),after.getZ(0)],expected);assert.ok(n.geometry.index.count>0);n.geometry.dispose();n.material.dispose();});assert.equal(count,177);
});
test('seven clinical-region selections contain only real model entries with correct side behaviour',()=>{
 assert.deepEqual(regionalGuides.map(g=>g.id),['shoulder','elbow','wrist-hand','hip','knee','ankle-foot','spine']);
 for(const g of regionalGuides){for(const system of ['skeleton','muscles']){const items=regionalStructures(g.id,system);assert.ok(items.length>0);for(const item of items)assert.ok(anatomySystems[system].catalog.includes(item));}for(const id of g.muscles)assert.ok(anatomySystems.muscles.catalog.some(s=>s.id===id));assert.ok(regionalStructures(g.id,'skeleton','right').every(s=>!/^left\b/.test(s.sourceName)));assert.ok(regionalStructures(g.id,'skeleton','left').every(s=>!/^right\b/.test(s.sourceName)));assert.deepEqual(regionalStructures(g.id,'muscles','left'),[]);}
 assert.equal(regionalStructures('wrist-hand').length,58);assert.equal(regionalStructures('ankle-foot').length,56);assert.equal(regionalStructures('unknown').length,0);
 const deltoid=filterAnatomy('deltoid','','muscles')[0];assert.equal(deltoid.id,'deltoid');assert.ok(filterAnatomy(deltoid.sourceIds[0],'','muscles').some(s=>s.id==='deltoid'));
});
test('regional exports retain all source notes and limitations without implying nerve meshes or completed review',()=>{
 assert.equal(nerveNotes.length,11);assert.equal(new Set(nerveNotes.map(n=>n.id)).size,11);
 for(const g of regionalGuides){assert.equal(g.review.state,'pending');assert.equal(g.review.reviewer,'');assert.equal(g.review.reviewedAt,'');const md=regionMarkdown(g.id);assert.ok(md.includes(g.task));assert.ok(md.includes(g.version));assert.match(md,/review pending/);assert.match(md,/not rendered/);assert.match(md,/combine both sides/);for(const n of [g.joint,g.action,...g.nerves.map(id=>nerveNotes.find(n=>n.id===id))]){assert.ok(n);assert.ok(regionSources[n.source]);assert.ok(n.location);assert.ok(md.includes(n.text));assert.ok(md.includes(regionSources[n.source].url));assert.ok(md.includes(n.location));}}
 assert.throws(()=>regionMarkdown('unknown'));
});
test('muscle reflection uses its own provenance, blank learning/time and cannot accept a forged catalogue object',()=>{
 const s=anatomySystems.muscles.catalog.find(s=>s.id==='deltoid'),d=anatomyLearningDraft(s,'muscles');assert.equal(d.learning,'');assert.equal(d.action,'');assert.equal(d.minutes,'');assert.equal(d.requireActualTime,true);assert.match(d.source,/1c746c36/);assert.match(d.source,/muscle model/);assert.throws(()=>anatomyLearningDraft({...s,name:'Invented'},'muscles'));
 assert.match(readFileSync('web/muscles-source-license.txt','utf8'),/Creative Commons/);assert.match(readFileSync('web/muscles-upstream-attribution.md','utf8'),/CC BY-SA 2.1 Japan/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {anatomyCatalog,anatomyModel,filterAnatomy,anatomyResearchTerm,anatomyLearningDraft} from '../web/anatomy.js';
const bytes=readFileSync('web/skeleton.glb');
const jsonLength=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
test('model bytes match the published source checksum and all catalog labels map to real meshes',()=>{
 assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
 assert.equal(bytes.length,anatomyModel.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),anatomyModel.sha256);
 assert.equal(anatomyCatalog.length,242);assert.equal(gltf.meshes.length,242);
 const ids=new Set(gltf.nodes.map(n=>n.extras.structureId));assert.equal(ids.size,242);
 for(const structure of anatomyCatalog){const node=gltf.nodes.find(n=>n.extras.structureId===structure.id);assert.ok(node);assert.equal(node.extras.fma,structure.fma);assert.equal(node.name,structure.id);}
});
test('model is self-contained and position bounds are finite; no external model requests are needed',()=>{
 assert.ok(gltf.buffers.every(b=>!b.uri));assert.ok((gltf.images||[]).every(i=>!i.uri));
 for(const mesh of gltf.meshes)for(const primitive of mesh.primitives){const position=gltf.accessors[primitive.attributes.POSITION];assert.equal(position.type,'VEC3');assert.ok(position.count>0);assert.ok([...position.min,...position.max].every(Number.isFinite));}
});
test('structure search preserves source IDs and laterality and allows region narrowing',()=>{
 assert.equal(filterAnatomy('scaphoid').length,2);
 assert.equal(filterAnatomy('scaphoid','Right upper limb')[0].sourceName,'right scaphoid');
 assert.equal(filterAnatomy('FMA24474')[0].sourceName,'right femur');
 assert.equal(filterAnatomy('nonexistent-source-structure').length,0);
 for(const id of ['BP24','BP28']){const s=anatomyCatalog.find(s=>s.fma===id);assert.match(s.name,/source label/);assert.doesNotMatch(s.name,/8th|10th/);}
});
test('anatomy research and reflection handoffs use source labels and never invent learning or time',()=>{
 const femur=filterAnatomy('FMA24474')[0];assert.equal(anatomyResearchTerm(femur),'femur anatomy');
 const draft=anatomyLearningDraft(femur);assert.equal(draft.learning,'');assert.equal(draft.action,'');assert.equal(draft.minutes,'');assert.equal(draft.requireActualTime,true);assert.match(draft.source,/FMA24474/);assert.match(draft.source,/120fc172/);
 assert.throws(()=>anatomyLearningDraft({id:'fabricated'}));
});
test('model licence/provenance and viewer software notices are retained separately',()=>{
 assert.match(readFileSync('web/anatomy-upstream-attribution.md','utf8'),/CC BY-SA 2.1 Japan/);
 assert.match(readFileSync('web/anatomy-source-license.txt','utf8'),/Creative Commons/);
 assert.match(readFileSync('web/anatomy-third-party.txt','utf8'),/MIT License/);
 assert.equal(anatomyModel.license,'https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en');
});

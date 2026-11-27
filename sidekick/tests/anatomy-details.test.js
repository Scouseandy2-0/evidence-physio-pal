import test from 'node:test';
import assert from 'node:assert/strict';
import {anatomySystems} from '../web/anatomy.js';
import {muscleDetails,boneDetails,boneDetailKey,structureDetails,detailCoverage,detailSources} from '../web/anatomy-details.js';

test('every authored profile maps to genuine model identities and traceable draft reference notes',()=>{
 for(const id of Object.keys(muscleDetails)){const d=structureDetails('muscles',id);assert.ok(d?.hasProfile);assert.deepEqual(d.fields.map(f=>f.label),['Origin','Insertion','Actions','Nerve supply']);assert.ok(d.fields.every(f=>f.value.trim()));assert.equal(d.review.state,'pending');assert.equal(d.review.reviewer,'');assert.equal(d.review.reviewedAt,'');assert.equal(d.groupedSides,true);assert.ok(d.sources.every(s=>s.url.startsWith('https://')&&s.location&&s.locatedAt==='2026-11-27'));}
 for(const key of Object.keys(boneDetails)){const matches=anatomySystems.skeleton.catalog.filter(s=>boneDetailKey(s.sourceName)===key);assert.ok(matches.length>0,key);for(const s of matches){const d=structureDetails('skeleton',s.id);assert.ok(d.hasProfile);assert.equal(d.name,s.name);assert.equal(d.sourceId,s.fma);assert.equal(d.groupedSides,false);assert.deepEqual(d.fields.map(f=>f.label),['Key landmarks','Articulations','Selected attachments']);}}
 assert.deepEqual(detailCoverage('muscles'),{detailed:41,total:177});assert.deepEqual(detailCoverage('skeleton'),{detailed:50,total:242});
});
test('missing profiles and invalid identities never receive inferred origins or insertions',()=>{
 const d=structureDetails('muscles','frontalis');assert.equal(d.name,'Frontalis');assert.equal(d.hasProfile,false);assert.deepEqual(d.fields,[]);assert.deepEqual(d.sources,[]);assert.match(d.modelSource,/organui\/muscles-3d/);
 assert.equal(structureDetails('muscles','biceps'),null);assert.equal(structureDetails('unknown','deltoid'),null);assert.equal(structureDetails('skeleton','deltoid'),null);
});
test('muscles with similar names, head-specific supply and indirect insertions remain distinct',()=>{
 const value=(id,label)=>structureDetails('muscles',id).fields.find(f=>f.label===label).value;
 assert.match(value('biceps-brachii','Insertion'),/Radial tuberosity/);assert.match(value('biceps-femoris','Insertion'),/Fibular head/);assert.match(value('biceps-femoris','Nerve supply'),/common fibular division for short head/);
 assert.match(value('rectus-femoris','Insertion'),/via patellar ligament/);assert.match(value('rectus-femoris','Actions'),/hip flexion/);assert.doesNotMatch(value('vastus-medialis','Actions'),/hip flexion/);
 assert.match(value('gluteus-medius','Origin'),/posterior gluteal/);assert.match(value('gluteus-minimus','Origin'),/inferior gluteal/);
 assert.match(value('flexor-digitorum-profundus','Nerve supply'),/ulnar/);assert.match(value('flexor-digitorum-profundus','Nerve supply'),/interosseous/);
 assert.match(value('flexor-carpi-radialis','Actions'),/radial deviation/);assert.match(value('extensor-digitorum','Actions'),/principally at metacarpophalangeal/);
});
test('returned note objects are independent and bone aliases preserve real source laterality',()=>{
 const d=structureDetails('muscles','deltoid');d.fields[0].value='Changed';d.sources[0].title='Changed';d.review.state='reviewed';const next=structureDetails('muscles','deltoid');assert.notEqual(next.fields[0].value,'Changed');assert.notEqual(next.sources[0].title,'Changed');assert.equal(next.review.state,'pending');
 for(const side of ['left','right']){const s=anatomySystems.skeleton.catalog.find(s=>s.sourceName===`navicular bone of ${side} foot`),n=structureDetails('skeleton',s.id);assert.equal(n.name,s.name);assert.equal(n.sourceId,s.fma);assert.ok(n.hasProfile);}
 for(const [id,p] of Object.entries(muscleDetails))assert.ok(detailSources[p.source],id);
});

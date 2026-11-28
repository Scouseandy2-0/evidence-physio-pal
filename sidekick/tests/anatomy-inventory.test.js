import test from 'node:test';
import assert from 'node:assert/strict';
import {anatomyInventory,anatomyInventorySummary,anatomyInventoryCSV} from '../web/anatomy-inventory.js';
import {anatomySystems} from '../web/anatomy.js';
test('coverage inventory accounts for every selectable source entry without counting groups as individual muscles',()=>{
 const rows=anatomyInventory(),summary=anatomyInventorySummary(rows);
 assert.equal(rows.length,419);assert.equal(new Set(rows.map(r=>r.system+':'+r.id)).size,419);
 assert.deepEqual(summary.muscles,{selectableEntries:177,withDraftReference:46,withoutDraftReference:131,withExplicitReferenceGaps:0,independentlyReviewed:0});
 assert.equal(summary.skeleton.selectableEntries,242);assert.equal(summary.skeleton.withDraftReference,50);assert.equal(summary.skeleton.withoutDraftReference,192);assert.equal(summary.skeleton.withExplicitReferenceGaps,6);
 for(const row of rows){const original=anatomySystems[row.system].catalog.find(s=>s.id===row.id);assert.equal(row.name,original.name);assert.equal(row.reviewState,'pending');if(!row.hasDraftReference){assert.deepEqual(row.referenceFields,[]);assert.deepEqual(row.sourceURLs,[]);}}
 assert.match(rows.find(r=>r.system==='muscles').selectionUnit,/sides or parts may be combined/);
 const csv=anatomyInventoryCSV(rows);assert.equal(csv.split('\r\n').length,421);assert.match(csv,/"frontalis"/);assert.match(csv,/"sourceMeshIds"/);assert.match(csv,/"pending"/);
});
test('inventory exports escape embedded quotes and returned mesh lists do not mutate source catalogues',()=>{
 const rows=anatomyInventory();const original=anatomySystems.muscles.catalog[0].sourceIds.length;rows.find(r=>r.system==='muscles').sourceMeshIds.push('QA');assert.equal(anatomySystems.muscles.catalog[0].sourceIds.length,original);
 assert.match(anatomyInventoryCSV([{...rows[0],name:'QA "quoted" name'}]),/QA ""quoted"" name/);
});

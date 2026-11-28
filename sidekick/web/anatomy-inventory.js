import {anatomySystems} from './anatomy.js';
import {structureDetails} from './anatomy-details.js';

// Imported selection catalogue, not an independent inventory of every human muscle/bone.
export function anatomyInventory() {
 return Object.entries(anatomySystems).flatMap(([system,config])=>config.catalog.map(structure=>{
  const detail=structureDetails(system,structure.id);
  return {system,id:structure.id,name:structure.name,sourceName:structure.sourceName,sourceId:structure.fma||'',sourceMeshIds:[...(structure.sourceIds||[structure.fma])].filter(Boolean),region:structure.region,subgroup:structure.subgroup,
   selectionUnit:system==='muscles'?'Source group; sides or parts may be combined':'Imported source structure; may include cartilage or discs',
   hasDraftReference:detail.hasProfile,referenceFields:detail.fields.map(field=>field.label),explicitReferenceGaps:detail.fields.filter(field=>/not supplied|not provided|not covered/i.test(field.value)).map(field=>field.label),sourceURLs:detail.sources.map(source=>source.url),reviewState:detail.review.state,modelSource:config.model.source};
 }));
}
export function anatomyInventorySummary(rows=anatomyInventory()) {
 return Object.fromEntries(Object.keys(anatomySystems).map(system=>{const selected=rows.filter(row=>row.system===system);return [system,{selectableEntries:selected.length,withDraftReference:selected.filter(row=>row.hasDraftReference).length,withoutDraftReference:selected.filter(row=>!row.hasDraftReference).length,withExplicitReferenceGaps:selected.filter(row=>row.explicitReferenceGaps.length).length,independentlyReviewed:selected.filter(row=>row.reviewState==='reviewed').length}];}));
}
export function anatomyInventoryCSV(rows=anatomyInventory()) {
 const headings=['system','id','name','sourceName','sourceId','sourceMeshIds','region','subgroup','selectionUnit','hasDraftReference','referenceFields','explicitReferenceGaps','sourceURLs','reviewState','modelSource'];
 const cell=value=>'"'+String(Array.isArray(value)?value.join(' | '):value).replaceAll('"','""')+'"';
 return '\uFEFF'+[headings.map(cell).join(','),...rows.map(row=>headings.map(key=>cell(row[key])).join(','))].join('\r\n')+'\r\n';
}

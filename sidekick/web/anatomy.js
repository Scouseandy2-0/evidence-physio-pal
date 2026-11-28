import { anatomyCatalog } from './anatomy-catalog.js';
import { musclesCatalog } from './muscles-catalog.js';
export { anatomyCatalog };
export const anatomyRegions = [...new Set(anatomyCatalog.map(s => s.region))];
export const anatomyModel = { sha256: 'c68b05d97d70c4d33363bf71d9885c191eb25f61a82dbba935a726ddd8e60ac8', bytes: 5221116, count: 242, source: 'https://github.com/organui/skeleton-3d/tree/120fc17278559057b37aff516eee89d263b604c6', license: 'https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en', credit: 'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan.' };
export const muscleModel = { sha256:'615ed2cf0d5ca9aa63f30bb806a65c740ed2ab057463a19505e19eff2bf207ce', bytes:5624592, count:177, source:'https://github.com/organui/muscles-3d/tree/1c746c36d12a78c5f3fd452dbe5d29ae869cad04', license:anatomyModel.license, credit:anatomyModel.credit };
export const anatomySystems = {
 skeleton:{label:'Skeleton',catalog:anatomyCatalog,model:{...anatomyModel,url:'/skeleton.glb',label:'skeleton',sizeLabel:'5.2 MB',defaultId:'right-femur'}},
 muscles:{label:'Muscles',catalog:musclesCatalog,model:{...muscleModel,url:'/muscles.glb',label:'muscle model',sizeLabel:'5.6 MB',defaultId:'deltoid'}}
};
export function filterAnatomy(term = '', region = '', system = 'skeleton') {
  const words = term.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return (anatomySystems[system]?.catalog || []).filter(s => (!region || s.region === region) && words.every(word => [s.name,s.sourceName,s.fma,s.subgroup,...(s.sourceIds||[])].join(' ').toLowerCase().includes(word)));
}
export function anatomyResearchTerm(structure) { return `${structure.sourceName.replace(/^(right|left)\s+/i,'')} anatomy`; }
export function anatomyLearningDraft(structure, system = 'skeleton') {
  const current=anatomySystems[system], item=current?.catalog.find(s=>s.id===structure?.id);
  if (!item || item !== structure) throw new Error('Choose an indexed model structure.');
  return { title: `Anatomy study: ${item.name}`.slice(0,180), kind: 'Course or learning', minutes: '', requireActualTime: true, learning: '', action: '', source: `BodyParts3D 3.0 / OrganUI ${current.model.label} — ${item.name}, source ID ${item.fma || (item.sourceIds||[]).join(', ')}. ${current.model.source}` };
}

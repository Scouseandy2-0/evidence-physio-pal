import { anatomyCatalog } from './anatomy-catalog.js';
export { anatomyCatalog };
export const anatomyRegions = [...new Set(anatomyCatalog.map(s => s.region))];
export const anatomyModel = { sha256: 'c68b05d97d70c4d33363bf71d9885c191eb25f61a82dbba935a726ddd8e60ac8', bytes: 5221116, count: 242, source: 'https://github.com/organui/skeleton-3d/tree/120fc17278559057b37aff516eee89d263b604c6', license: 'https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en', credit: 'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan.' };
export function filterAnatomy(term = '', region = '') {
  const words = term.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return anatomyCatalog.filter(s => (!region || s.region === region) && words.every(word => [s.name,s.sourceName,s.fma,s.subgroup].join(' ').toLowerCase().includes(word)));
}
export function anatomyResearchTerm(structure) { return `${structure.sourceName.replace(/^(right|left)\s+/i,'')} anatomy`; }
export function anatomyLearningDraft(structure) {
  if (!anatomyCatalog.some(s => s.id === structure.id)) throw new Error('Choose an indexed model structure.');
  return { title: `Anatomy study: ${structure.name}`.slice(0,180), kind: 'Course or learning', minutes: '', requireActualTime: true, learning: '', action: '', source: `BodyParts3D 3.0 / OrganUI skeleton — ${structure.name}, source ID ${structure.fma}. ${anatomyModel.source}` };
}

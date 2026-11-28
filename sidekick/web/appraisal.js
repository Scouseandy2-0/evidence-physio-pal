import { citation } from './research.js';
export const basisLabels = { notRead: 'Not yet read', abstract: 'Abstract only', fullText: 'Full text' };
export const appraisalFields = [
  ['question', 'Your question', 'Who or what are you investigating? Record the population, intervention or exposure, comparison and outcomes where relevant.'],
  ['findings', 'Findings in your own words', 'Record the outcome, effect size and uncertainty if reported. Add page, table or figure references. Do not infer an effect from a p-value alone.'],
  ['strengths', 'Methods and strengths', 'What makes the findings more trustworthy? Consider the design, recruitment, comparison, measurement and analysis.'],
  ['limitations', 'Limitations and possible bias', 'What could distort the findings? Note missing methods, confounding, missing data, selective reporting and funding or conflicts where relevant.'],
  ['applicability', 'Relevance to your question', 'How do the population, setting, outcomes and practical requirements compare with your question?'],
  ['uncertainties', 'What remains uncertain?', 'What information, harms, follow-up or other evidence do you still need? Write “not reported” when appropriate.'],
  ['nextStep', 'Your next learning step', 'For example: read the full text, compare another study, discuss with a supervisor or check current guidance.']
];
export function newAppraisal(paper, id = crypto.randomUUID(), now = new Date()) {
  return { id, paperId: paper.id, pmid: paper.pmid, sourceRetracted: paper.retracted === true, title: paper.title, citation: citation(paper).slice(0, 20000), basis: 'notRead', design: '', question: '', findings: '', strengths: '', limitations: '', applicability: '', uncertainties: '', nextStep: '', updatedAt: now.toISOString() };
}
export function appraisalMarkdown(a) {
  return `# My paper appraisal\n\n${a.title}\n\n${a.citation}\n\nhttps://pubmed.ncbi.nlm.nih.gov/${a.pmid}/\n\n${a.sourceRetracted ? 'WARNING: source marked as retracted in the saved index record. Investigate the retraction notice.\n\n' : ''}Reading basis: ${basisLabels[a.basis]}\nStudy design (recorded by me): ${a.design || 'Not recorded'}\nLast edited: ${a.updatedAt}\n\n${appraisalFields.map(([key, label]) => `## ${label}\n${a[key] || 'Not recorded'}`).join('\n\n')}\n\nPersonal appraisal notes, not an automatic evidence grade or an accredited checklist.\n`;
}
export function reflectionFromAppraisal(a) {
  if (a.basis === 'notRead' || !a.findings.trim() || !a.nextStep.trim()) throw new Error('Record what you read, your findings and your next learning step before creating a reflection.');
  const learning = [`${a.sourceRetracted ? 'WARNING: source marked as retracted in the saved index record. Investigate the retraction notice.\n\n' : ''}Reading basis: ${basisLabels[a.basis]}`, ...appraisalFields.filter(([key]) => key !== 'nextStep' && a[key]?.trim()).map(([key, label]) => `${label}:\n${a[key]}`)].join('\n\n');
  if (learning.length > 10000) throw new Error('Your appraisal is longer than a CPD reflection can hold. Export the appraisal, then create a shorter reflection in My CPD.');
  return { title: `Appraisal: ${a.title}`.slice(0, 180), kind: 'Research reading', learning, action: a.nextStep, source: `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`, appraisalId: a.id, paperId: a.paperId, basis: a.basis };
}

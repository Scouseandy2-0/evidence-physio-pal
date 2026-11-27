import { citation } from './research.js';
export const readingLabels = { notRead: 'Not yet read', notRecorded: 'Reading basis not recorded', abstract: 'Abstract only', fullText: 'Full text' };
export function suggestedAgenda(minutes) {
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 480) throw new Error('Use a session length from 5 to 480 minutes.');
  const labels = ['Question and learning objectives', 'Examine the original source and its limitations', 'Discuss the fictional case or question', 'Agree takeaways, uncertainty and a next action'];
  const weights = [2, 5, 5, 3];
  const remaining = minutes - 4, raw = weights.map(w => remaining * w / 15);
  const slots = raw.map(n => 1 + Math.floor(n));
  const fractions = raw.map((n,i) => ({ i, fraction: n % 1 })).sort((a,b) => b.fraction - a.fraction || a.i - b.i);
  for (let left = minutes - slots.reduce((sum,n) => sum+n,0), i=0; i<left; i++) slots[fractions[i].i]++;
  return labels.map((label,i) => `${slots[i]} min: ${label}`).join('\n');
}
export function newTeachingPlan(topic = {}, id = crypto.randomUUID(), now = new Date()) {
  return { id, title: topic.title || 'Untitled teaching session', audience: 'FCP team', minutes: 15, objectives: topic.objectives || '', discussion: '', agenda: suggestedAgenda(15), preparation: '', takeaways: '', guidance: topic.source || '', sources: [], updatedAt: now.toISOString() };
}
export function teachingSource(paper, appraisal) {
  return { pmid: paper.pmid, title: paper.title, citation: citation(paper).slice(0,20000), readingBasis: appraisal?.basis || 'notRecorded', retracted: paper.retracted === true, attachedAt: new Date().toISOString() };
}
export function teachingMarkdown(plan) {
  return `# ${plan.title || 'Untitled teaching session'}\n\nDraft teaching plan; clinical content requires professional review before delivery.\nAudience: ${plan.audience || 'Not recorded'}\nPlanned duration: ${plan.minutes} minutes (check that the edited agenda fits)\nLast edited: ${plan.updatedAt}\n\n## Learning objectives\n${plan.objectives || 'Not recorded'}\n\n## Agenda\n${plan.agenda || 'Not recorded'}\n\n## Fictional case / discussion\n${plan.discussion || 'Not recorded'}\n\n## Facilitator preparation\n${plan.preparation || 'Not recorded'}\n\n## Takeaways and next action\n${plan.takeaways || 'Not recorded'}\n\n## Guidance / other references to check\n${plan.guidance || 'Not recorded'}\n\n## Indexed paper references\n${plan.sources.length ? plan.sources.map((s,i) => `${i+1}. ${s.citation}\n   https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/\n   Reading basis: ${readingLabels[s.readingBasis]}\n   Attached: ${s.attachedAt}${s.retracted ? '\n   WARNING: marked as retracted in the attached index record. Investigate the retraction notice.' : ''}`).join('\n\n') : 'No papers attached.'}\n\nReferences are saved snapshots; check the original record, its currency and any applicable local pathway before teaching. This plan provides no accreditation or competency sign-off.\n`;
}

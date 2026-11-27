import { readingLabels, teachingSource } from './teaching.js';
export const newStudySet = (id = crypto.randomUUID(), now = new Date()) => ({ id, title: 'Untitled study set', cards: [], updatedAt: now.toISOString() });
export function cardFromNotes(appraisal) {
  if (!appraisal?.findings?.trim()) throw new Error('Add your own findings to this paper’s appraisal first.');
  const answer = [`My findings:\n${appraisal.findings}`, ...(appraisal.limitations ? [`Limitations:\n${appraisal.limitations}`] : []), ...(appraisal.uncertainties ? [`Uncertainty:\n${appraisal.uncertainties}`] : [])].join('\n\n');
  if (answer.length > 6000) throw new Error('These notes exceed the card limit. Write a shorter answer in your own words.');
  return { question: 'What did I learn from this paper, and what limitations should I remember?', answer };
}
export function saveStudyCard({ question, answer, paper, appraisal, source, existing, id = crypto.randomUUID(), now = new Date() }) {
  if (!question.trim() || question.length > 1000 || !answer.trim() || answer.length > 6000) throw new Error('Complete a question (up to 1,000 characters) and answer (up to 6,000 characters).');
  const reference = source || (paper ? teachingSource(paper, appraisal) : null);
  if (!reference) throw new Error('Choose a saved paper as the source.');
  const changed = !existing || existing.question !== question || existing.answer !== answer || JSON.stringify(existing.source) !== JSON.stringify(reference);
  return { id: existing?.id || id, question, answer, source: structuredClone(reference), updatedAt: changed ? now.toISOString() : existing.updatedAt, rating: changed ? 'unrated' : existing.rating, reviewedAt: changed ? '' : existing.reviewedAt, reviews: existing?.reviews || 0 };
}
export function rateStudyCard(card, rating, now = new Date()) {
  if (!['again', 'recalled'].includes(rating)) throw new Error('Choose a recall rating.');
  return { ...card, rating, reviewedAt: now.toISOString(), reviews: Math.min(1000000, card.reviews + 1) };
}
export function studyMarkdown(set) {
  return `# ${set.title || 'Untitled study set'}\n\nPersonal revision cards; answers are written by the user and are not verified clinical guidance.\nRecall ratings are self-reported, not competency scores.\n\n${set.cards.map((card,i) => `## ${i+1}. ${card.question}\n\n${card.answer}\n\nSource: ${card.source.citation}\nhttps://pubmed.ncbi.nlm.nih.gov/${card.source.pmid}/\nReading basis: ${readingLabels[card.source.readingBasis]}${card.source.retracted ? '\nWARNING: source marked as retracted in the attached index record.' : ''}\nSelf-rating: ${card.rating}\nLast reviewed: ${card.reviewedAt || 'Not reviewed'}`).join('\n\n---\n\n')}\n`;
}

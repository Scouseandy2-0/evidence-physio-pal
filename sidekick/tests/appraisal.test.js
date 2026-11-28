import test from 'node:test';
import assert from 'node:assert/strict';
import { newAppraisal, reflectionFromAppraisal, appraisalMarkdown } from '../web/appraisal.js';
import { emptyWorkspace, validateWorkspace, mergeWorkspaces, hasRecords } from '../web/workspace-data.js';
const paper = { id: 'MED:123', pmid: '123', title: 'Example software-test paper', authors: 'Example Author', year: '2025', recordURL: 'https://pubmed.ncbi.nlm.nih.gov/123/' };
const appraisal = () => ({ ...newAppraisal(paper, 'appraisal-1', new Date('2026-11-27')), basis: 'abstract', findings: 'Example finding noted by the reader', limitations: 'Full methods not read', nextStep: 'Read the full paper' });
const reflection = a => ({ ...reflectionFromAppraisal(a), id: 'reflection-1', date: '2026-11-27', minutes: 20 });
test('legacy workspaces gain an empty appraisal list; source snapshots survive backup round trips', () => {
  assert.deepEqual(validateWorkspace({ saved: [], reflections: [] }).appraisals, []);
  const workspace = { ...emptyWorkspace(), appraisals: [appraisal()] };
  assert.equal(hasRecords(workspace), true);
  const restored = validateWorkspace(JSON.parse(JSON.stringify(workspace)));
  assert.equal(restored.appraisals[0].paperId, 'MED:123');
  assert.equal(restored.appraisals[0].limitations, 'Full methods not read');
  assert.match(restored.appraisals[0].citation, /Example Author/);
});
test('a reflection is explicitly seeded from reader notes with reading basis and canonical source; no time is invented', () => {
  const a = appraisal(), r = reflectionFromAppraisal(a);
  assert.equal(r.source, 'https://pubmed.ncbi.nlm.nih.gov/123/');
  assert.equal(r.appraisalId, a.id); assert.equal(r.basis, 'abstract');
  assert.match(r.learning, /Abstract only/); assert.match(r.learning, /Full methods not read/);
  assert.equal(r.minutes, undefined); assert.equal(r.id, undefined);
  a.findings = 'Later edit'; assert.doesNotMatch(r.learning, /Later edit/);
  const w = validateWorkspace({ ...emptyWorkspace(), appraisals: [a], reflections: [reflection(a)] });
  assert.equal(w.reflections[0].appraisalId, a.id);
});
test('unread and incomplete appraisals cannot become logged learning, and long notes are never silently truncated', () => {
  assert.throws(() => reflectionFromAppraisal({ ...appraisal(), basis: 'notRead' }), /what you read/);
  assert.throws(() => reflectionFromAppraisal({ ...appraisal(), findings: '' }), /findings/);
  assert.throws(() => reflectionFromAppraisal({ ...appraisal(), nextStep: '' }), /learning step/);
  assert.throws(() => reflectionFromAppraisal({ ...appraisal(), findings: 'x'.repeat(5000), limitations: 'y'.repeat(5000) }), /longer/);
});
test('conflicting appraisal versions and their own CPD links are preserved on account merge', () => {
  const remote = appraisal(), device = { ...remote, findings: 'Device finding' };
  const a = { ...emptyWorkspace(), appraisals: [remote], reflections: [reflection(remote)] };
  const b = { ...emptyWorkspace(), appraisals: [device], reflections: [reflection(device)] };
  let serial = 0; const merged = mergeWorkspaces(a, b, () => `preserved-${++serial}`);
  assert.equal(merged.appraisals.length, 2); assert.equal(merged.reflections.length, 2);
  for (const r of merged.reflections) {
    const linked = merged.appraisals.find(entry => entry.id === r.appraisalId);
    assert.ok(linked); assert.ok(r.learning.includes(linked.findings));
  }
  assert.equal(mergeWorkspaces(a, a).appraisals.length, 1);
});
test('removing a saved paper leaves its appraisal source and CPD snapshot intact', () => {
  const a = appraisal();
  const w = validateWorkspace({ ...emptyWorkspace(), saved: [], appraisals: [a], reflections: [reflection(a)] });
  assert.equal(w.appraisals[0].pmid, '123');
  assert.match(appraisalMarkdown(w.appraisals[0]), /https:\/\/pubmed.ncbi.nlm.nih.gov\/123\//);
  assert.match(appraisalMarkdown(w.appraisals[0]), /Abstract only/);
});
test('bounded appraisal records reject mismatched IDs, invalid dates, unknown reading basis and malformed CPD links', () => {
  for (const bad of [{ paperId: 'MED:456' }, { basis: 'AI verified' }, { updatedAt: 'invalid' }, { findings: 'x'.repeat(5001) }]) assert.throws(() => validateWorkspace({ ...emptyWorkspace(), appraisals: [{ ...appraisal(), ...bad }] }));
  assert.throws(() => validateWorkspace({ ...emptyWorkspace(), reflections: [{ ...reflection(appraisal()), basis: 'notRead' }] }));
});

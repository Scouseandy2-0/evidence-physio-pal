import {formatNavigationDiagnostics} from './navigation-diagnostics.js';
export const appRelease = '2026-11-28-reading-reliability';
export const guideKey = 'physiosidekick.guide.hidden.v1';
export function guideProgress(workspace = {}) {
  return [
    {title:'Keep a real paper',route:'research',done:!!workspace.saved?.length,detail:'Search a topic or PMID, open the original source and save a paper.'},
    {title:'Question what you read',route:'appraisal',done:!!workspace.appraisals?.length,detail:'Open a saved paper and choose Appraise. Record your reading basis and your own findings.'},
    {title:'Capture your learning',route:'cpd',done:!!workspace.reflections?.length,detail:'Write your reflection, next step and the time you actually spent learning.'}
  ];
}
export function guideHidden(storage) { try {return storage.getItem(guideKey)==='yes';}catch{return false;} }
export function setGuideHidden(storage,hidden) { try {storage.setItem(guideKey,hidden?'yes':'no');return true;}catch{return false;} }
export const reportCategories = {research:'Research search or paper links',saving:'Saving or syncing',anatomy:'Anatomy viewer',accessibility:'Reading or accessibility',other:'Something else'};
export function buildProblemReport(input, context = {}, now = new Date()) {
  if(!Object.hasOwn(reportCategories,input.category))throw new Error('Choose a problem area.');
  const description=String(input.description||'').trim(),expected=String(input.expected||'').trim();
  if(description.length<10||description.length>2000)throw new Error('Describe what happened in 10–2,000 characters.');
  if(expected.length>1000)throw new Error('Use up to 1,000 characters for what you expected.');
  const route=['home','research','learn','library','cpd','fcp','practice','appraisal','study','teaching','workspace-search','paper'].includes(context.route)?context.route:'unknown';
  const status=['loading','saved','pending','saving','offline','conflict','unavailable','error'].includes(context.syncStatus)?context.syncStatus:'unknown';
  const device=['iPhone or iPad','Mac','Other','Not specified'].includes(input.device)?input.device:'Not specified';
  return `PhysioSidekick problem report\nCreated: ${now.toISOString()}\nApp release: ${appRelease}\nArea: ${reportCategories[input.category]}\nPage: ${route}\nDevice (chosen by me): ${device}\nStorage: ${context.mode === 'trial' ? 'Browser trial (this tab only)' : context.mode === 'browse' ? 'Browsing without account saving' : 'Account workspace'}\n${context.mode === 'browse' ? 'Account saving: not enabled' : `${context.mode === 'trial' ? 'Trial' : 'Account'} save status: ${status}`}\nUnconfirmed device changes: ${context.pending===true?'yes':'no'}\n\nWhat happened / steps to reproduce:\n${description}\n\nWhat I expected:\n${expected||'Not provided'}\n\n${formatNavigationDiagnostics(context.navigation)}\n\nReport prepared on this device. It has not been sent. Review for private information before sharing.\n`;
}

export const versionReviewSteps = [
 {title:'Follow a research question',route:'research',detail:'Search a topic or exact PMID/DOI, open the original record and abstract, then save a paper. Check that retry and Stop search are understandable.'},
 {title:'Connect appraisal and CPD',route:'appraisal',detail:'From a saved paper, record your reading basis and own appraisal notes. Create a reflection, enter actual learning time and choose a review date. Try PDF and Word exports.'},
 {title:'Explore student learning',route:'learn',detail:'Open a supplied unit, follow its sources and try a personal revision card. Check that draft material and your own answers stay distinct.'},
 {title:'Inspect anatomy',route:'learn',anatomy:true,detail:'Choose Anatomy, then tap or select a muscle/bone. Inspect the docked facts, orientation and reset. Check the disclosed coverage gaps; the full atlas is still outstanding.'},
 {title:'Prepare a teaching session',route:'fcp',detail:'Read a supplied FCP draft, follow the source checkpoints and make an editable personal copy. Check attached references and export the plan.'},
 {title:'Check your saved work',route:'cpd',detail:'Wait for Account saved, reload, and check your reflection and review date. On another device, use the same account and Refresh from account. Export a backup from Your data & privacy.'}
];
export function buildVersionReview(input, now = new Date()) {
 const notes=String(input.notes||'').trim(),device=String(input.device||'Not specified');
 if(notes.length>8000)throw new Error('Keep review notes within 8,000 characters.');
 if(!['Not specified','iPhone or iPad','Mac','Other'].includes(device))throw new Error('Choose a review device.');
 return `PhysioSidekick owner review\nApp release: ${appRelease}\nPrepared: ${now.toISOString()}\nDevice: ${device}\n\nMy review notes:\n${notes||'No observations entered yet.'}\n\nSuggested areas to cover:\n${versionReviewSteps.map((step,i)=>`${i+1}. ${step.title}: ${step.detail}`).join('\n\n')}\n\nOutstanding product gates: comprehensive licensed anatomy, independent clinical/anatomical review, full real-device/VoiceOver verification and final public-launch data/support arrangements. This is an owner-review build, not clinical approval, a complete V1 sign-off or an App Store release.\n\nPrepared on this device; not submitted automatically. Avoid patient-identifiable information.\n`;
}

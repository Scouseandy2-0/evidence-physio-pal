export const appRelease = '2026-11-27-v1-scope';
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
  const route=['home','research','learn','library','cpd','fcp','practice','appraisal','study','teaching','workspace-search'].includes(context.route)?context.route:'unknown';
  const status=['loading','saved','pending','saving','offline','conflict','unavailable','error'].includes(context.syncStatus)?context.syncStatus:'unknown';
  const device=['iPhone or iPad','Mac','Other','Not specified'].includes(input.device)?input.device:'Not specified';
  return `PhysioSidekick problem report\nCreated: ${now.toISOString()}\nApp release: ${appRelease}\nArea: ${reportCategories[input.category]}\nPage: ${route}\nDevice (chosen by me): ${device}\nAccount save status: ${status}\nUnconfirmed device changes: ${context.pending===true?'yes':'no'}\n\nWhat happened / steps to reproduce:\n${description}\n\nWhat I expected:\n${expected||'Not provided'}\n\nReport prepared on this device. It has not been sent. Review for private information before sharing.\n`;
}

export async function loadOriginalAbstract(pmid, { fetcher = (...args) => globalThis.fetch(...args), timeoutMs = 16000 } = {}) {
  if (!/^[1-9]\d{0,8}$/.test(pmid)) throw new Error('Invalid PMID.');
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(`/api/paper?pmid=${encodeURIComponent(pmid)}`, { credentials: 'same-origin', signal: controller.signal });
    const record = await response.json().catch(() => { throw new Error('PubMed details are unavailable. Please retry.'); });
    if (!response.ok) throw new Error(record.error || 'PubMed details are unavailable.');
    if (typeof record.title !== 'string' || !record.title.trim() || record.abstractURL !== `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` || record.pmid !== pmid || !['available', 'notIndexed'].includes(record.abstractStatus) || typeof record.abstract !== 'string' || record.abstract.length > 80000 || (record.abstractStatus === 'available') !== Boolean(record.abstract.trim()) || record.abstractSource !== 'PubMed (NCBI)' || !Number.isFinite(Date.parse(record.abstractRetrievedAt)) || typeof record.abstractCopyright !== 'string' || record.abstractCopyright.length > 10000) throw new Error('PubMed returned unexpected publication details.');
    return record;
  } catch (error) { if (error.name === 'AbortError') throw new Error('Loading the abstract took too long. Please retry.'); throw error; }
  finally { clearTimeout(timer); }
}
export function applyOriginalAbstract(paper, record) {
  if (paper.pmid !== record.pmid) throw new Error('Publication identifiers do not match.');
  return { ...paper, abstract: record.abstract, abstractStatus: record.abstractStatus, abstractSource: record.abstractSource, abstractRetrievedAt: record.abstractRetrievedAt, abstractCopyright: record.abstractCopyright, retracted: paper.retracted || record.retracted === true };
}

export function retainSourceWarning(workspace, paper) {
  if (!paper.retracted) return false;
  let changed = false;
  for (const appraisal of workspace.appraisals) if (appraisal.paperId === paper.id && !appraisal.sourceRetracted) { appraisal.sourceRetracted = true; changed = true; }
  const sources = [...workspace.teachingPlans.flatMap(plan => plan.sources), ...workspace.studySets.flatMap(set => set.cards.map(card => card.source))];
  for (const source of sources) if (source.pmid === paper.pmid && !source.retracted) { source.retracted = true; changed = true; }
  return changed;
}

// Utility to build robust external links for evidence items
// Handles DOI codes, full DOI URLs, Cochrane reviews, PubMed IDs, and guideline URLs

export interface EvidenceLike {
  title?: string | null;
  journal?: string | null;
  doi?: string | null;
  pmid?: string | null;
  grade_assessment?: { url?: string | null } | null;
}

export function getExternalEvidenceLink(e: EvidenceLike): string | null {
  if (!e) return null;

  // 1) Prefer explicit URL stored in grade_assessment (used by guidelines)
  const gaUrl = e.grade_assessment?.url;
  if (gaUrl && gaUrl !== '#') return gaUrl;

  const doiRaw = (e.doi || '').trim();
  const journalLower = (e.journal || '').toLowerCase();

  // 2) If DOI is actually a full URL, return it directly
  if (doiRaw && (doiRaw.startsWith('http://') || doiRaw.startsWith('https://'))) {
    return doiRaw;
  }

  // 3) Cochrane special handling (their canonical path is on cochranelibrary)
  // Cochrane DOIs typically include 10.1002/14651858.CDxxxxxx
  if (doiRaw && (doiRaw.includes('14651858') || journalLower.includes('cochrane'))) {
    return `https://www.cochranelibrary.com/cdsr/doi/${doiRaw}/full`;
  }

  // 4) Other journal special cases
  if (doiRaw && journalLower.includes('bmj')) {
    return `https://bmjopenquality.bmj.com/content/${doiRaw.replace('10.1136/', '')}`;
  }
  if (doiRaw && journalLower.includes('physical therapy')) {
    return `https://academic.oup.com/ptj/article-lookup/doi/${doiRaw}`;
  }

  // 5) Standard DOI resolution
  if (doiRaw && doiRaw.startsWith('10.')) {
    return `https://doi.org/${doiRaw}`;
  }

  // 6) PubMed fallback
  if (e.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${e.pmid}`;

  // 7) Search fallback
  if (e.title) return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(e.title)}`;

  return null;
}

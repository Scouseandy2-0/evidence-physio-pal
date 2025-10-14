// Utility to build robust external links for evidence items
// Handles DOI codes, full DOI URLs, Cochrane reviews, PubMed IDs, and guideline URLs

export interface EvidenceLike {
  title?: string | null;
  journal?: string | null;
  doi?: string | null;
  pmid?: string | null;
  grade_assessment?: { url?: string | null } | null;
}

// Normalize a DOI value into its canonical identifier (no scheme/prefix, no punctuation)
function normalizeDoi(input: string): string {
  let s = (input || '').trim();
  if (!s) return '';

  const lower = s.toLowerCase();

  // Strip common prefixes (e.g., "doi:", "DOI ")
  if (lower.startsWith('doi:')) {
    s = s.slice(4).trimStart();
  } else if (lower.startsWith('doi ')) {
    s = s.slice(4).trimStart();
  }

  // If it's a doi.org URL, extract the path part
  const lowerS = s.toLowerCase();
  if (lowerS.startsWith('http://') || lowerS.startsWith('https://')) {
    try {
      const u = new URL(s);
      if (u.hostname.toLowerCase().endsWith('doi.org')) {
        s = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
      }
    } catch {
      // Not a valid URL; continue with best-effort cleanup
    }
  }

  // Remove trailing punctuation commonly found in copied citations
  while (
    s.endsWith('.') ||
    s.endsWith(',') ||
    s.endsWith(';') ||
    s.endsWith(')') ||
    s.endsWith(']')
  ) {
    s = s.slice(0, -1);
  }

  // Remove internal spaces
  s = s.split(' ').join('');

  return s;
}

// Ensure doi.org URL is canonical (https://doi.org/<normalized-doi>)
function toDoiUrl(input: string): string {
  const n = normalizeDoi(input);
  return n ? `https://doi.org/${n}` : '';
}

export function getExternalEvidenceLink(e: EvidenceLike): string | null {
  if (!e) return null;

  // 1) Prefer explicit URL stored in grade_assessment (used by guidelines)
  const gaUrl = e.grade_assessment?.url;
  if (gaUrl && gaUrl !== '#') return gaUrl;

  const doiRaw = (e.doi || '').trim();
  const doiNorm = normalizeDoi(doiRaw);
  const journalLower = (e.journal || '').toLowerCase();

  // 2) If DOI field is actually a full URL, return a canonical doi.org URL
  if (doiRaw && (doiRaw.startsWith('http://') || doiRaw.startsWith('https://'))) {
    const url = toDoiUrl(doiRaw);
    if (url) return url;
  }

  // 3) Cochrane special handling - use standard DOI resolver
  // Cochrane DOIs typically include 10.1002/14651858.CDxxxxxx
  if (doiNorm && (doiNorm.includes('14651858') || journalLower.includes('cochrane'))) {
    return `https://doi.org/${doiNorm}`;
  }

  // 4) Other journal special cases
  if (doiNorm && journalLower.includes('bmj')) {
    return `https://bmjopenquality.bmj.com/content/${doiNorm.replace('10.1136/', '')}`;
  }
  if (doiNorm && journalLower.includes('physical therapy')) {
    return `https://academic.oup.com/ptj/article-lookup/doi/${doiNorm}`;
  }

  // 5) Standard DOI resolution
  if (doiNorm && doiNorm.startsWith('10.')) {
    return `https://doi.org/${doiNorm}`;
  }

  // 6) PubMed fallback
  if (e.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${e.pmid}`;

  // 7) Search fallback
  if (e.title) return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(e.title)}`;

  return null;
}

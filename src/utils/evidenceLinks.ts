// Utility to build robust external links for evidence items
// Handles DOI codes, full DOI URLs, Cochrane reviews, PubMed IDs, and guideline URLs

export interface EvidenceLike {
  title?: string | null;
  journal?: string | null;
  doi?: string | null;
  pmid?: string | null;
  tags?: string[] | null;
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

// Detect NICE guidance item pages like /guidance/ng59, /guidance/cg177, /guidance/qs123
const niceGuidanceRegex = /nice\.org\.uk\/guidance\/[a-z]{1,3}\d+/i;
function isNiceGuidanceUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return niceGuidanceRegex.test(u.hostname + u.pathname);
  } catch {
    return niceGuidanceRegex.test(url);
  }
}

// Build a stable NICE search query from tags or a cleaned title
function buildNiceQuery(e: EvidenceLike): string {
  const tags = (e.tags || []) as string[];
  const stopWords = /\b(guideline|guidelines|nice|clinical|practice|recommendations?|evidence|rehabilitation|physiotherapy)\b/gi;

  // Prefer a specific condition tag if available
  const primaryTag = tags.find(t => !stopWords.test(t));

  // Clean the title and wrap in quotes for exact matching
  const cleanedTitle = (e.title || '')
    .replace(stopWords, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const parts: string[] = [];
  if (cleanedTitle) parts.push(`"${cleanedTitle}"`);
  if (primaryTag) parts.push(primaryTag);
  // Reinforce target and type
  parts.push('NICE guidance');

  return parts.join(' ').trim();
}

export function getExternalEvidenceLink(e: EvidenceLike): string | null {
  if (!e) return null;

  // 1) Prefer explicit URL stored in grade_assessment (used by guidelines), with special handling for NICE
  const gaUrl = (e.grade_assessment?.url || '').trim();
  const isCochraneGa = gaUrl && /cochranelibrary\.com/i.test(gaUrl);
  const isNiceGa = gaUrl && /nice\.org\.uk/i.test(gaUrl);
  if (gaUrl && gaUrl !== '#') {
    if (isCochraneGa) {
      // Defer Cochrane handling below
    } else if (isNiceGa) {
      // Always prefer a scoped NICE search over stored URLs to avoid mis-mapped pages
      const q = buildNiceQuery(e);
      if (q) return `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}&ndt=guidance`;
      return `https://www.nice.org.uk/search?q=${encodeURIComponent(e.title || '')}&ndt=guidance`;
    } else {
      return gaUrl;
    }
  }
  const doiRaw = (e.doi || '').trim();
  const doiNorm = normalizeDoi(doiRaw);
  const journalLower = (e.journal || '').toLowerCase();

  // Prefer NICE site search when the source indicates NICE (even without a stored URL)
  const titleLower = (e.title || '').toLowerCase();
  const tagsLower = ((e.tags || []) as string[]).map(t => t.toLowerCase());
  const indicatesNice = journalLower.includes('nice') || titleLower.includes('nice') || tagsLower.includes('nice');
  if (indicatesNice) {
    const q = buildNiceQuery(e);
    if (q) return `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}&ndt=guidance`;
  }


  // 2) If DOI field is actually a full URL, return a canonical doi.org URL
  if (doiRaw && (doiRaw.startsWith('http://') || doiRaw.startsWith('https://'))) {
    const url = toDoiUrl(doiRaw);
    if (url) return url;
  }

  // 3) Cochrane special handling - prefer Cochrane Library search (synthetic DOIs may not resolve)
  // Cochrane DOIs typically include 10.1002/14651858.CDxxxxxx
  if (doiNorm && (doiNorm.includes('14651858') || journalLower.includes('cochrane'))) {
    const q = encodeURIComponent(e.title || doiNorm);
    return `https://www.cochranelibrary.com/search?searchText=${q}`;
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

  // 8) As a last resort, return guideline URL if present (even if Cochrane)
  if (gaUrl && gaUrl !== '#') return gaUrl;

  return null;
}

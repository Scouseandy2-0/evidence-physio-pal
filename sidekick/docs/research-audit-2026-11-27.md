# Research source audit — 27 November 2026

Scope: source implementation with live Europe PMC and NCBI requests, plus Chrome local preview using those live providers. This is a bibliographic/provenance and workflow audit, not clinical-content approval, a systematic search validation, or a hosted iPhone pass.

## Sample and checks

| PMID | Sample | Metadata comparison | Original abstract state |
|---|---|---|---|
| 31316228 | Foot-pain imaging case, 2019 | PMID, normalized title, authors, year, DOI and RIS identifier match NCBI | No English abstract indexed |
| 25569281 | Knee OA exercise review, 2015 | Same fields match | Available |
| 34265255 | GRASP shoulder trial, 2021 | Same fields match after collective-author fix | Available |
| 42750457 | Knee OA letter, 2026 | Same fields match | No English abstract indexed |

Primary URLs: https://pubmed.ncbi.nlm.nih.gov/31316228/ ; https://pubmed.ncbi.nlm.nih.gov/25569281/ ; https://pubmed.ncbi.nlm.nih.gov/34265255/ ; https://pubmed.ncbi.nlm.nih.gov/42750457/ . The independent tagged-record source is NCBI EFetch, compared with the app’s Europe PMC-normalized records.

The report stores metadata, abstract lengths/hashes and states, not copied full abstracts. Hash differences do not establish content errors: indexing format, headings, whitespace and symbols can differ. Semantic equivalence of every abstract is not claimed. The title comparison normalizes whitespace/punctuation and the multiplication symbol; the bibliographic identities remain the exact PMIDs/DOIs.

## Findings and repair

1. Europe PMC supplies group authors through collectiveName rather than fullName. The app previously dropped those entries from authorList, so RIS could omit a group while the displayed author string still contained it. Normalization now retains either source field. The before report records the failure; the after report confirms all four author comparisons and a regression test checks group-author RIS output. Already-saved records are not silently migrated.
2. A combined author/title/RCT filter did not return PMID 34265255. Direct inspection showed its index labels include Equivalence Trial, Pragmatic Clinical Trial and other tags, but not Randomized Controlled Trial. The initial audit expectation was too strong. The revised scenario verifies the actual source-labelled filter semantics and retains this limitation explicitly. Exact PMID/DOI lookup continues to bypass discovery filters, as already disclosed. The UI now labels types “Indexed” and explains that missing index labels can hide relevant papers; users can inspect all labels and check the original methods. No classification was invented from the abstract or title.
3. The initial report is retained in research-audit-2026-11-27-before.json. Current source results and checks are in research-audit-2026-11-27.json. This record distinguishes the application defect from the audit-assumption correction.

## Workflow scenarios

10 live scenarios passed: four exact record comparisons; exact DOI lookup; two topic pages with the same provider and distinct IDs; combined author/title/type filters; OA/date filters; a valid empty query; and a simulated Europe PMC outage with real PubMed backup responses. These are bounded samples, not a guarantee of every query/provider state.

Chrome local preview additionally displayed the GRASP record and retrieved its original PubMed abstract with correct source/time/copyright information. Provider requests omitted app cookies/identity. The audit did not use or impersonate Andrew’s signed-in identity, write account records or bypass user-owned-data authentication.

Official Europe PMC documentation describes default relevance ordering and optional date ordering: https://dev.europepmc.org/RestfulWebService . Its field reference documents AUTH surname/initial and publication-type filtering: https://dev.europepmc.org/docs/EBI_Europe_PMC_Web_Service_Reference.pdf . Index labels are discovery metadata, not an independent clinical-methods judgement.

## Open evidence

Earlier iPhone connection-error screenshots remain confirmed defects on their then-current hosted releases. A successful local live-source audit cannot prove that hosted iPhone requests or recovery now work. Real iPhone topic/exact search, paging, source-link opening and interrupted-request recovery remain to be demonstrated on the current publication. A wider metadata sample, retraction updates, provider changes and end-user reference-manager imports should receive continuing checks before release.

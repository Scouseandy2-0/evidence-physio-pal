# FCP teaching drafts — developer source comparison

Checked 28 November 2026. Pack version: **2026-11-28.1** for all six drafts.

This is an assistant-led comparison of the supplied discussion material with its cited primary sources. It is **not independent clinical review, clinical approval, validation of a decision tool, or permission to deliver a paid curriculum**. All six `review.state` values remain `pending`, with no named reviewer or approval date. `review.sourceCheck` records this narrower developer activity explicitly; it cannot increment the reviewed-pack count.

## Changes made

- Tightened the low-back-pain exercise checkpoint and corresponding answer: NG59 1.2.2 concerns a group programme in its stated NHS/episode-or-flare-up context, not an unrestricted exercise recommendation.
- Added the knee OA pack's three structured source-linked learner self-checks, covering accessible information, interpreting initial exercise discomfort without a universal pain rule, and limits of a short case for individual exercise prescription. Six packs now supply 18 structured self-checks in total. Their discussion points remain drafts, not scored competence measures.
- Bumped draft versions and recorded the source-comparison date. Existing saved personal copies are not rewritten; their recorded source-pack version remains their provenance.

## Source access and currency evidence

Direct public GET requests in the executor returned HTTP 200 for the five NICE recommendation pages and the NG226 rationale page. Web-search `open` returned 403 for those NICE pages, so indexed extracts alone were not used to establish current-page content. In particular, an indexed NG59 result showed a 2020 update date, whereas the fetched published page reports **29 July 2026** and includes 2026 amendments/removals elsewhere. The sections used by these packs were checked against the fetched page.

| Primary source | Published-page evidence used |
|---|---|
| [NG226 recommendations](https://www.nice.org.uk/guidance/ng226/chapter/Recommendations) and [rationale](https://www.nice.org.uk/guidance/ng226/chapter/rationale-and-impact) | Publication date 19 October 2022; information/support and therapeutic-exercise sections inspected. No later amendment date was asserted where the page did not display one. |
| [NG59 recommendations](https://www.nice.org.uk/guidance/ng59/chapter/Recommendations) | Last updated 29 July 2026. Actual recommendation text at 1.1.1 and 1.2.1–1.2.2 inspected. Broader 2026 changes are not incorporated into a new clinical protocol here. |
| [NG100 recommendations](https://www.nice.org.uk/guidance/ng100/chapter/Recommendations) | Last updated 12 October 2020. Referral recommendation and investigations preamble inspected. |
| [NG65 recommendations](https://www.nice.org.uk/guidance/ng65/chapter/recommendations) | Last updated 2 June 2017. Recognition/referral section inspected, including the single-feature limitation and condition-specific pathways. |
| [NG12 patient support/safety-netting recommendations](https://www.nice.org.uk/guidance/ng12/chapter/recommendations-on-patient-support-safety-netting-and-the-diagnostic-process) | Last updated 15 April 2026. Sections 1.14–1.16 inspected in their suspected-cancer scope. The linked historical full-guideline evidence document is supplementary, not the normative current recommendations; its entire contents were not re-reviewed in this pass. |
| [HCPC conduct standards](https://www.hcpc-uk.org/standards/standards-of-conduct-performance-and-ethics/) | Official page opened; effective from 1 September 2024. Communication 2.2–2.7, scope 3.1–3.3 and records 10.1–10.3 inspected. |
| [BESS/BOA shoulder publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC7905504/) and [BESS download page](https://bess.ac.uk/bess-boa-primary-intermediate-care-shoulder-pain-guidelines/) | Original 2021 publication opened; shared-decision, urgent-referral and subacromial diagnosis sections inspected. BESS lists the summary download as updated 22 March 2021. This does not establish that it is the newest condition pathway. |

## Per-pack result

| Pack | Sections compared | Result and remaining limit |
|---|---|---|
| `knee-oa-evidence` | NG226 1.2.1–1.2.3; 1.3.1–1.3.4; corresponding rationale | The existing information/exercise discussion is supported at the stated level. Added three structured self-checks. Individual exercise selection, dose, safety assessment and professional content review remain outside this prepared vignette. |
| `low-back-pain-evidence` | NG59 1.1.1; 1.2.1–1.2.2 | Reassessment and information checkpoints map to the cited material. Clarified the group-programme context. No current individual diagnosis or triage clearance is implied. |
| `shoulder-pain-reasoning` | BESS/BOA shared decisions, urgent referrals and subacromial diagnosis | The history/examination, passive-rotation context and dated-source warning are supported. Kept the 2021 date visible. Current local imaging/referral/treatment pathways and independent review remain open. |
| `inflammatory-presentations` | NG100 1.1.1/investigations preamble; NG65 1.1 | The normal/negative-test and referral-delay discussion is supported. The packs do not combine RA and spondyloarthritis into a score. Applying full criteria to a sufficiently assessed case and local referral arrangements needs professional review. |
| `diagnostic-uncertainty` | NG59 1.1.1; HCPC 3.1–3.3 and 10.1–10.3 | Reconsideration, scope/referral and record-accuracy discussion is supported. The suggested two-column exercise and handling of inherited notes are facilitator applications, not validated risk rules. No exhaustive masquerader list is claimed. |
| `safety-netting-referral` | HCPC 2.2–2.7/10.1–10.3; NG12 1.14–1.16, especially 1.15.1–1.15.2 | Explicit investigation ownership and review planning are supported within suspected-cancer guidance. The original handover scaffold remains labelled as such; it does not set universal MSK intervals or reassure an unassessed case. Local acceptance/transmission and escalation arrangements still need checking. |

## Validation and outstanding work

- `node --check web/learning-packs.js` passed.
- `node --test tests/learning-packs.test.js`: **3 passed**. Existing tests exercise all six independent saved-copy/export paths and all attached self-checks; no test was added solely to mirror the new wording.
- No clinical facts were inferred from the automated result. A qualified reviewer still needs to review exact draft versions, intended teaching use, local-pathway applicability, wording/accessibility and any corrections before approval or delivery.
- Links and source text can change. Recheck the published material when adapting or delivering a session. This pass does not approve the remainder of each source document or certify the app as clinically complete.

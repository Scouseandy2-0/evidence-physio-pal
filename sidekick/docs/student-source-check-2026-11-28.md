# Student starter-library source check — 28 November 2026

Scope: developer verification of five supplied units and 25 introductory questions against the cited primary sources. Resulting unit version: **2026-11-28.1**. This is not an independent clinical/content review, accreditation or approval to market a reviewed curriculum. All five units retain `review.state: pending`, with reviewer/date fields blank.

## Corrections and clarification

- Improved source locations so learners can identify the actual heading, table row, chapter section or PDF page rather than a vague summary of a source.
- The ranking explanation now explicitly identifies PubMed's Best Match as a relevance sort and separates relevance from study quality. It does not imply that PhysioSidekick's Europe PMC search uses the same ranking algorithm.
- The missing-follow-up example is now explicitly about a trial and points to the original 2024 CASP RCT PDF: introduction on printed page 1 and participant follow-up on printed page 2/question 3. This is a stronger direct source than the previous generic appraisal overview.
- Source dates were refreshed to 28 November. Available editions are recorded in source metadata and unit Markdown exports. The currently served Cochrane chapter 15 identifies Handbook **6.5.1 (2026), updated November 2026**; chapters 3 and 14 identify **6.5 (2024), updated August 2023**. The NLM guide identifies its update as **30 September 2026**. Do not assign one global handbook version to all chapters.
- No arithmetic correction was required: the fictional event risks differ by 10 percentage points; using 20% as the comparator risk gives a 50% relative reduction. The examples remain labelled fictional and cannot be read as treatment effects.

## Question-by-question source map

| Question ID | Source / precise location checked | Developer finding |
|---|---|---|
| find-concepts | NLM guide: basic concept search and widening an overly narrow search | Consistent; tightened heading locator. |
| find-identity | NLM: citation lookup and results display | Consistent; matching returned bibliographic details remains an original learner task. |
| find-fulltext | NLM: abstract display and external full-text access | Consistent; indexed record is distinct from reading the article. |
| find-filters | NLM: filter/indexing limitations, publication types, widening searches | Consistent; exclusions by filters do not prove absence of evidence. |
| find-ranking | NLM: Best Match explanation | Clarified PubMed attribution and relevance/quality boundary. |
| design-treatment | CASP design table: effectiveness row | Consistent; trial label is not a quality assessment. |
| design-experience | CASP design table: patient-experience row | Consistent; interviews offered as an example, not a required method. |
| design-prognosis | CASP design table: prognosis row | Consistent; follow-up/method checking remains a learner appraisal task. |
| design-review | Cochrane review explainer transcript; Handbook 3.1 | Consistent with explicit question/eligibility/search/extraction; statistical pooling is not asserted to be mandatory. |
| design-pico | Cochrane 3.2 and its participant/intervention/comparison/outcome subsections | Consistent; introductory PICO is not a universal framework for every question. |
| results-absolute | Cochrane 15.4.1; fictional arithmetic independently recomputed | Ten percentage points, with event and period stated. |
| results-relative | Cochrane 15.4.1 and baseline-risk discussion in 15.4.4.2 | Relative reduction uses 20% as comparator; absolute impact depends on baseline risk. |
| results-ci | Cochrane 15.3.1–15.3.3 | Interval crosses zero; neither definite benefit nor definite no effect is established by this fictional interval. |
| results-importance | Cochrane 15.3.2 and 15.5 | Practical importance cannot be inferred from a p-value threshold alone. |
| results-outcomes | Cochrane 14.1.1–14.1.2 | Outcome-specific effects/certainty and missing harm evidence are kept separate. |
| appraisal-checklist | CASP checklist index | Separate design-specific resources are linked; the app does not reproduce their forms. |
| appraisal-prestige | CASP appraisal overview, importance discussion | Source supports examining methods/results/context instead of relying on reputation. |
| appraisal-missing | CASP RCT PDF (2024), printed pp. 1–2, introduction and question 3 | Tightened to trial context and exact original PDF location. Unknown reporting is not converted into complete follow-up. |
| appraisal-certainty | Cochrane 14.2.2 | Five decreasing-certainty domains match the source; no generated GRADE rating. |
| appraisal-transfer | Cochrane 15.2 | Applicability/context differences remain explicit. |
| anatomy-position | OpenStax A&P 2e 9.5, introductory paragraph before Figure 9.12 | Reference position and screen orientation are distinct. |
| anatomy-flexion | OpenStax 9.5, flexion/extension section | Elbow example is consistent; no universal rule about all joints is inferred. |
| anatomy-scope | Local `web/anatomy-coverage.md`, model-boundary section | Matches separate skeletal/muscle assets, grouped muscles and text-only nerve notes. This internal source is a product-scope statement, not external anatomical validation. |
| anatomy-mechanism | Cochrane 3.2 and question/PICO discussion | Separating an anatomical proposal from measured intervention outcomes is an original application of the source framework. |
| anatomy-question | CASP question/design table | Consistent with choosing methods for the question. |

## Primary sources opened

1. [NLM PubMed User Guide](https://pubmed.ncbi.nlm.nih.gov/help/) — opened successfully through web retrieval on this pass. This resolves the earlier inability to inspect the guide's content through that retrieval route; it does not retrospectively change the timeout recorded by the separate direct-GET audit.
2. [CASP study-design resource](https://casp-uk.net/study-designs/) — introductory reliability discussion and question/design table.
3. [CASP appraisal overview](https://casp-uk.net/what-is-critical-appraisal/) — importance, methods and bias prompts.
4. [CASP checklist index](https://casp-uk.net/casp-tools-checklists/) — original design-specific resources.
5. [CASP RCT PDF, 2024](https://casp-uk.net/casp-checklists/CASP-checklist-randomised-controlled-trials-RCT-2024.pdf) — six-page original linked from its [publisher landing page](https://casp-uk.net/casp-tools-checklists/randomised-controlled-trial-rct-checklist/).
6. [Cochrane systematic-review explainer](https://www.cochrane.org/evidence/what-are-systematic-reviews) — transcript and process explanation.
7. [Cochrane Handbook chapter 3](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-03) — question/PICO/eligibility framework.
8. [Cochrane Handbook chapter 14](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14) — outcome summaries and certainty domains.
9. [Cochrane Handbook chapter 15](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-15) — uncertainty, absolute/relative effects and applicability.
10. [OpenStax A&P 2e 9.5](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-5-types-of-body-movements) — movement position and elbow movement definitions.

## Boundaries and remaining review

The CASP PDF states a CC BY-NC-SA 4.0 licence. This app links to the original document and uses its own introductory exercises; this pass does not grant permission to embed, adapt or sell the CASP checklist. No source text, checklist form or PDF was bundled. The source/version references in the app do not imply CASP, Cochrane, NLM or OpenStax endorsement.

The unit explanations are brief teaching prompts, not a comprehensive research-methods curriculum. A qualified independent reviewer should examine accuracy, accessibility, level, question/answer wording and how each prompt is taught; record their scope/version/corrections before changing any pending label. Physical iPhone/VoiceOver checks remain separate. The whole-body anatomy requirement remains incomplete.

Validation: `node --check web/student-units.js` and the three existing `tests/student-units.test.js` cases passed. No new test was added merely to repeat fixed wording. Test success does not constitute content approval.

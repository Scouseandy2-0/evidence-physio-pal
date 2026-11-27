# Validation — 27 November 2026

## Automated

Node's test runner covers research query scope, DOI punctuation, publication/date filtering, rejecting invalid/non-PubMed identifiers, missing metadata, retraction flags, safe full-text links, RIS newline injection, service failures and preservation of statistical comparison symbols in abstracts.

`npm run check` validates the syntax of each browser JavaScript module.

## Browser QA

Tested through the rendered interface with live Europe PMC responses:

- Overview and navigation render successfully.
- Knee osteoarthritis query returns actual indexed records.
- Systematic-review and open-access filters return matching indexed metadata.
- Record dialog opens with PMID, DOI, complete indexed abstract and provider-supplied full-text link.
- Saving a paper updates the library and survives reload.
- Creating a reflection survives reload with entered text and learning time.
- Critical appraisal exercises give answer-specific feedback.

- Paper collection and notes persist after explicit save and browser reload.
- RIS reference export triggers a browser download.
- FCP planner accepts a fictional discussion prompt and downloads an editable Markdown outline.

Desktop browser QA is not equivalent to physical iPhone or native iOS testing.

## Remaining release checks

Physical iPhone/Safari tests; native storage/download/external-link handling; account sync; licensed 3D anatomy; clinical editorial review; provider terms and text reuse; complete accessibility audit; trademark clearance; signed iOS build and App Store review. No public or clinical launch is implied.

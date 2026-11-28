# Ten reliability and usability improvements — 28 November 2026

App release: `2026-11-28-recovery-search-mobile`. Previous release `2026-11-28-readiness-recovery` (Sites source 65c58e1ba9d90b8348e6a3c7558aaf51ea6fd1f7) was confirmed published successfully before this work. New publication is tracked separately; source saving or a successful build is not publication evidence.

## Completed changes

| Task | Result | Evidence |
|---|---|---|
| 1. Protect recovered invalid edits | A recovered invalid device copy cannot be silently cleared by an unrelated valid edit. Workspace interaction pauses until an explicit corrected import or discard-to-account decision. Recovery offers export/import actions and disables invalid combination. Ordinary in-session validation errors can still be corrected normally. | Account tests cover rejected unrelated edits, retained snapshot through reload, corrected combination and verified account discard. |
| 2. Retain malformed cache text | Malformed JSON, null/scalar/array or invalid revision envelopes are retained as raw recovery text instead of treated as absent. Valid account data is loaded unchanged. Recovery exports containing raw text are deliberately not import-ready learning workspaces. | Malformed/truncated JSON, null, array and invalid-revision fixtures; reload and explicit account-version recovery checks. |
| 3. Preserve warnings when merging papers | A retraction flag survives combining two copies of a paper even when no new abstract metadata is brought in. | Both merge directions tested with an already populated abstract. |
| 4. Carry newly discovered source warnings forward | A retraction found while loading the original PubMed record is added to matching appraisal, teaching-source and revision-source snapshots. Removing a saved paper also retains its known warning in linked evidence. Notes, reading declarations, attachment/edit timestamps and recall history are not rewritten. No automatic live retraction surveillance is claimed. | Source-warning tests verify matched/unmatched references, unchanged notes/history and sticky true warnings; earlier binary-export regressions remain passing. |
| 5. Use local activity dates | A new reflection defaults to the device calendar day, consistent with review-date filtering, rather than the UTC date. Existing entered dates remain untouched. | Actual app DOM test at 23:30 UTC in British Summer Time defaults to the following local day. |
| 6. Retry the failed results page | A failed Load more retry keeps the earlier results and retries the same cursor and original filters. Filter controls are restored to the options used. | Actual app DOM/event test checks retained papers, cursor and filters before/after retry. |
| 7. Stop a slow search | Stop search cancels the request, invalidates late replies, keeps already loaded papers and reports cancellation without inventing a zero-result count. Focus returns to the search input. Search again is available. | DOM/event tests for first-page and next-page cancellation/late replies; rendered narrow-screen browser cancellation and restart observed. |
| 8. Return focus after dialogs | Dialog opening remembers the original control across regenerated modal content. Closing returns focus to that control or the workspace if it no longer exists. | DOM tests for retained/removed openers; browser reading-dialog close returned to its opener. |
| 9. Make enlarged research filters usable | Narrow filters stack when the available width cannot fit enlarged options. Desktop filter width also grows with the root text size. | In a 320px iframe with 125% app text, the 305px document had no horizontal overflow; selects increased from about 108px to 231px. Home, Learn, FCP, CPD, reflection form and record dialog were checked for horizontal overflow. This is Chromium layout QA, not iPhone Safari. |
| 10. Distinguish backup snapshots | Normal and recovery JSON exports now use distinct timestamped filenames. Filename and export metadata use the same timestamp. | Filename tests for both kinds; both privacy and conflict-recovery export actions use the shared helper. |

## Verification

- **160 automated tests passed**, no failures or skips. Includes new recovery, warning propagation, backup filename and actual-app DOM/event regressions.
- JavaScript syntax checks and production Worker build passed.
- `npm run audit:research` passed all **10 live scenarios / four exact records**. The dated report is `research-audit-2026-11-28.json`; it checks identifiers/metadata, exact DOI, pagination, filters, empty results and simulated-primary-outage/live-PubMed fallback. It is not an independent reference-manager import test.
- Rendered local browser search for knee osteoarthritis returned eight PubMed backup records when the Europe PMC path was unavailable, then loaded the original NCBI abstract for PMID 30919810 with provenance. This demonstrates a local live fallback path, not the production iPhone path.
- Production error-log lookup at the start of this pass returned no error events in the requested three-hour window. That does not establish absence of client-side faults.
- QA used fictional in-memory data and the local preview. Andrew’s production reflections were not modified or cleared. A temporary iframe layout harness was removed before packaging.

## Still open

Actual iPhone review-date/research/export/reload/Mac-sync checks, VoiceOver and full device accessibility, independent clinical and anatomical review, full licensed anatomy coverage, final privacy/erasure/support arrangements, commercial name/licence decisions and any App Store distribution remain open. These ten changes do not close those gates. No supplier message, purchase, contract or audience expansion was performed.

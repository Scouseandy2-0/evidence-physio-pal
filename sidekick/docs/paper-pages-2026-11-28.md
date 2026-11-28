# Full-page paper records — 28 November 2026

Candidate release: 2026-11-28-paper-pages. Sites records publication separately.

## Why

Andrew’s actual-iPhone VoiceOver retest opened only one of five different papers successfully after the dialog correction. That correction did not establish a usable paper-reading flow. The failure remains open until this successor is retested on his device. PubMed scrolling trouble was also reported; the external site’s issue has not been reproduced or attributed to app code.

## Resulting behaviour

- Paper titles and Read record are ordinary anchor links to #paper/PMID. Paper metadata/abstract/source links render in main as a full page, with a single H1 and subsequent H2 sections. No paper modal or outside-tap dismissal is involved.
- Back to research results or saved papers preserves current in-memory results, filters and scroll position, and restores focus to the matching title. Browser history uses the same routes. Reloading a search still does not promise to retain its unsaved results; a direct paper URL retrieves its exact PMID again if needed.
- Direct record lookup has explicit loading/failure/retry/original-source states. Late lookup completion cannot navigate someone back after they leave. No automatic saving/reading claim is made by opening a record.
- PubMed and full-text links say that they open a separate website/new tab. The app cannot guarantee another site’s VoiceOver behaviour.
- Multiline title links use a block tap area. A browser pointer check initially found a gap between inline text lines could miss the link; the block link fixes that candidate-specific hit-target issue.
- Public account/trial privacy, paper source identity and pending/error protections are preserved. Anatomy remains parked.

## Developer checks

- 179 automated tests pass, along with syntax checks and the production build. Four new rendered-DOM tests cover five distinct paper opens/returns with retained result state, direct exact-PMID reload lookup without saving, safe late responses after leaving, and missing-record retry. Existing search/recovery app-event checks now cover full-page paper navigation instead of the superseded popup flow.
- Local rendered Chromium, live knee osteoarthritis results: five distinct papers opened and returned successfully using Enter, then all five using pointer activation after the hit-area correction. Matching titles, no open dialog and restored results were observed.
- Reloaded one direct paper page (PMID 43039707): correct original indexed record loaded again with no dialog. This is source metadata verification, not clinical appraisal of that publication.
- No hosted learning records were edited or cleared. No external messages, purchases or audience change.

## Remaining evidence

Andrew’s actual iPhone must confirm reliable VoiceOver selection/double-tap, full-page scrolling and return navigation across multiple papers. No VoiceOver or Safari pass is claimed from Chromium. External PubMed scrolling remains a separate reported issue without reproduction. The user can navigate a Safari webpage item by item with one-finger swipe-right or use Reader where offered, per Apple’s instructions; those are navigation options, not a claimed fix for the reported external page.

# Next five: protect unfinished work — 28 November 2026

Andrew authorised the next five improvements. Anatomy remains parked. Candidate release: `2026-11-28-draft-protection`.

1. The keyboard Skip to workspace link now focuses main and scrolls to its start without changing the application route to #main (which previously fell back to Home).
2. Cancelling changed reflection or revision-card drafts asks whether to keep editing or discard. Closing the confirmation keeps the draft. Reflection change events also retain date/activity selections during same-visit navigation. Untouched forms can still close directly.
3. If reflection queueing is refused, retain the open draft and restore the previous in-memory reflection list. Success wording says queued rather than implying account acknowledgement.
4. If revision-card queueing is refused, retain question/answer/source and restore the previous card list and timestamp. Retrying cannot duplicate a card from the failed attempt.
5. Revision Markdown export now requires saving/cancelling a dirty card, matching PDF/Word. Card/set removal also waits for the draft to be resolved, preventing an unrelated removal from discarding unfinished edits.

## Verification

Five additional application DOM/event regressions cover route-preserving skip focus, discard/keep and same-visit reflection retention, injected queue refusal for both new and edited reflections/cards with retry, and dirty-card export/removal blocking. The existing learning journey now explicitly confirms draft discard before practising. Failure injection replaces queue only within a restored test scope; it does not claim to simulate every browser/network failure.

Rendered Chromium checks in local preview verified both confirmation dialogs, Keep editing retaining the entered text and returning focus to Cancel, revision Markdown blocking with a useful message, and Enter on Skip to workspace focusing main while keeping #cpd. Only fictional local-preview data was used; hosted account records were not edited.

Full software suite: 198 tests passed. Syntax, build and diff checks passed. Publication result must be confirmed separately before calling this release live.

## Boundaries

Drafts remain visit-memory data until explicitly saved; this pass does not promise recovery after an iPhone process kill. Queue acceptance still requires a subsequent account/trial saved acknowledgement. Native iPhone VoiceOver is owner-reported as apparently working in the previous retest; the new dialogs have developer keyboard/DOM checks, not a fresh physical-iPhone certification. Clinical review, anatomy licensing/coverage and remaining cross-device requirements stay open.

## Publication outcome

Version 40 deployed successfully on 28 November 2026. Source: `6bab5cf6f7ecc4c531f602479eef5ef9f889a04f`; deployment: `appgdep_6b0b076078b8819197d75e9ef34264d3`. Live URL: https://physiosidekick-workspace.andrew-lockhart.chatgpt.site. This publication note was recorded after packaging; it does not alter runtime code.

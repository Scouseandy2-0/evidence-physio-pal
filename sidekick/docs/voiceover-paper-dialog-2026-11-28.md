# Paper dialog activation and VoiceOver — 28 November 2026

Candidate release: 2026-11-28-dialog-accessibility. Deployment success is recorded separately by Sites.

## Report

Andrew tested on his actual iPhone with VoiceOver on. Paragraph reading, spoken tabs/controls and three-finger page scrolling worked in the interactions he tried. He reported that double-tapping a research-paper title sent him to the previous page; he confirmed double-tap rather than single-tap selection.

## Defensive correction

The existing click-on-backdrop handler classified a click solely by its coordinates. A coordinate-less click (clientX/clientY 0) targeted at the dialog could close it immediately. An actual app-event regression failed with the old handler and passes with it removed. The app now requires its explicit Close/Cancel controls or native Escape, avoiding coordinate-based dismissal for all dialogs. We cannot prove that the reported iPhone event followed this exact path without a device retest.

Paper titles are explicit non-submit buttons with aria-haspopup=dialog and aria-controls=detail-dialog. The native dialog also declares aria-modal=true. Paper activation passes the activated button as the return-focus target, so Close can return to that title even when a screen reader’s virtual cursor did not change document.activeElement.

## Checks

- Full 175-test suite, syntax checks and production build pass. Expanded actual-app regression verifies unchanged route, heading focus, no dismissal from a coordinate-less click and return to the activated title when prior DOM focus was elsewhere.
- Local rendered Chromium with real PMID 31316228: Enter opens the named paper dialog without route navigation; Close returns DOM focus to that title; Space opens it and native Escape returns focus to the same title. Pointer activation also opens the dialog.
- No production account records were edited. No external messages, purchases or access changes.

## Pending

Reload the hosted corrected release on Andrew’s iPhone, enable VoiceOver, select and double-tap the same paper title. It should remain in the named paper dialog; Close should return to the title in the same research results. Confirm this actual-device result before closing the reported defect. This is not a complete VoiceOver pass or independent accessibility certification.

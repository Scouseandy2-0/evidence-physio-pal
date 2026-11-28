# Navigation help and local diagnosis — 28 November 2026

Candidate release 2026-11-28-navigation-help. Publication is recorded separately by Sites. The prior paper-entry release was confirmed published as version 36; Andrew’s actual-iPhone reliability report remains open, with no subsequent device result inferred.

## User-facing changes

Reading & iPhone setup now contains an expandable VoiceOver guide: select once and hear the name, double-tap anywhere to activate, one-finger item navigation, three-finger screen scrolling and where paper return/source controls lead. It links Apple’s official guide and does not change system settings. The footer shows the actual app release.

Report a problem now includes up to 20 fixed-category navigation/focus/control observations from the current visit. The journal is memory-only, cleared on reload/close, and is never automatically transmitted or saved to an account. It excludes full URLs, PMID/DOI, titles, searches, learning notes and account identity. Clicks without a pointer count are labelled neutrally; they could come from a keyboard, assistive technology or other activation. The app does not claim it detected VoiceOver. Reports distinguish browsing without saving from trial/account work.

## Evidence

- 183 automated tests pass; syntax checks and production build pass. New tests verify sanitization/identity exclusion, bounded independent visit state and immutable snapshots. The existing five-paper DOM journey now also previews a report and checks its real navigation events without the paper titles/search terms/PMIDs.
- Local rendered Chromium at largest in-app text: expanded guide contains the expected gestures and external-site information, with the current release visible in the footer.
- Local live exact-PMID search → Enter on paper title → Back to research results → Report a problem produced the correct research→paper→research sequence, heading/control focus and activation categories. The report did not contain the searched PMID or paper title; fictional QA description was entered. No report was sent.
- Anonymous report initially claimed Account workspace; corrected to Browsing without account saving / Account saving not enabled, with a targeted mode test.

Only developer preview records and fictional report text were used. No hosted account work was edited or cleared, no email/invitation/payment was sent, and the public-link audience remains unchanged. Anatomy, independent content review, actual iPhone/Mac/VoiceOver, reference-manager import and final data/support arrangements retain their existing gates. The new report is a diagnostic aid, not a claim that the intermittent iPhone issue is resolved.

# PhysioSidekick — private beta readiness

First-version scope is now fixed in **V1-COMPLETION.md**. Finish that feature/content checklist before whole-product tester recruitment. This file records verification/release gates and does not supersede the V1 scope.

Reviewed: 27 November 2026. Working name; no claim of trademark clearance.

**Decision: keep owner-private.** The implemented workflows are ready for further product testing, but a public or paid launch is not signed off. Existing Site sharing is unchanged. No testers have been contacted or granted access.

## Completed developer work

- Genuine Europe PMC / PubMed search, bounded connection recovery and official-source escape links.
- Exact publication identity validation; coherent counts and provider-stable pages; original abstract retrieval with attribution, copyright and unavailable-vs-not-indexed states.
- Account-scoped storage with optimistic revisions, pending-device recovery, conflict review and expected-account checks for new clients.
- Backup validation, explicit merge preview, preservation of pending edits during import and corrected-invalid-edit recovery.
- Confirmed clearing of active learning records with stale-tab revision protection and local cleanup, plus explicit discard-to-account recovery. This is not full account erasure. Open revision/CPD drafts block refresh/import/recovery replacement.
- Saved papers/notes/collections, appraisals, CPD follow-up portfolios, source-linked teaching sessions and self-rated revision cards.
- Licensed skeletal anatomy preview, source checksum/catalogue and visible limitations. Expanded systems are absent.
- First-use guide, device reading preferences, Home Screen instructions, workspace search and local reviewable problem reports.
- Keyboard learning tabs, dialog focus, concise result announcements and selected text/target-size improvements.
- Response protections against third-party script execution, object embedding and unneeded camera/microphone/location/payment capabilities; publication fallback remains allowed.
- Reproducible production build, automated integration tests and documented local/browser/source spot checks in TESTING.md.

## Gates that remain open

| Gate | Required evidence | Current state |
|---|---|---|
| Real devices | Same account on physical iPhone and Mac: save/reload/refresh, interrupted save and conflict recovery | iPhone reflection creation/account-save acknowledgement, repeat PDF download, DOCX download and opening/layout in Pages verified from Andrew’s screenshots/files. Reload, Mac sync and interruption/conflict scenarios remain open; see docs/device-evidence.md |
| Mobile anatomy | iPhone WebGL loading, rotation, structure selection, memory and lifecycle behaviour | Not verified |
| Independent anatomy review | Reviewer checks orientation, labels, missing structures and educational limitations against authoritative references | Not done |
| Physio/student review | Observe the test tasks in docs/beta-test-script.md; capture actual completion, confusion and return use | Not done |
| Accessibility | VoiceOver plus keyboard/zoom/reflow across screens and a full audit if a compliance claim is intended | Partial developer pass only |
| Data/privacy/support | Confirm responsible entity/contact, public privacy and terms, retention, deletion/recovery workflow, platform supplier details and actual support delivery | Draft/incomplete |
| Audience | Named testers, appropriate access and clear test-only scope | Owner-private; no invites |
| Commercial launch | Name clearance, reviewed premium content, price, billing/cancellation and support arrangements | Not ready |
| Native App Store | Native packaging, Apple account/signing, device/TestFlight QA and submission material | Not started |

## How to run the next review

1. Use the test script with fictional learning notes only. Do not enter patient identifiers.
2. Record the exact app release from Report a problem, device, task, observed result and any error. Screenshots must be reviewed for private information.
3. Treat data loss, cross-account exposure, fabricated/mismatched sources, serious anatomical misrepresentation and unrecoverable saving as stop conditions.
4. Fix blockers before expanding the audience; preserve the original evidence and add a regression check when it protects real behaviour.
5. Recheck the actual deployment after publication. A passing build or a pending deployment is not proof of a working published app.

## Product scope

Keep the all-in-one direction, but validate usefulness before adding another major system. No automated diagnosis, treatment/prescribing recommendation, competency certificate or regulatory/CPD accreditation is offered. FCP remains a learning/teaching workspace preview. Do not charge a premium for unreviewed placeholder content.

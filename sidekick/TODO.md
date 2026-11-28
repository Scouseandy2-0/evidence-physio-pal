# PhysioSidekick — Version 1 to-do list

Updated 28 November 2026. Finish the defined product before adding more major features. V1-COMPLETION.md remains the scope authority; this file gives the practical work order. A test pass, a prepared draft and a clinical/device approval are different states.

## Saved checkpoint

- GitHub repository: Scouseandy2-0/evidence-physio-pal; development branch: codex/physiosidekick-prototype; app source: sidekick/; draft PR #3. The original Lovable app remains separate.
- Latest published application source: 8ad04a3a9a2d2949b05f33245ea94d1f48634304. Review-date-link deployment confirmed succeeded; app remains owner-private.
- Last runtime change: direct Set/Change review date, all-reflection picker, due/future visibility, clearer learning-date filters, date-field width constraints. Its iPhone retest is open.
- Latest developer baseline: 154 automated tests passed; production build and targeted desktop workflow checks passed.
- Binary skeleton/muscle assets are included with source attribution/licences; checksum-verified pinned download scripts remain available for restoration. Generated bundles, dependency directories, credentials, local databases and user files are not source-control backups.
- BioDigital integration enquiry sent with Andrew’s authorisation. Reply/quote/demo pending; no paid licence or purchase agreed.

## Confirmed on Andrew’s actual iPhone

- [x] Create/display the “Hello” reflection with Account saved acknowledgement and 15 recorded minutes.
- [x] Download two valid CPD PDFs retaining the correct reflection and separate export timestamps.
- [x] Download a valid editable Word portfolio.
- [x] Open that Word export in Pages with title, headings, text and footer displayed correctly.

Evidence and boundaries: docs/device-evidence.md. These checks do not establish reload/Mac sync, every export variation or a fix for the earlier iPhone research/anatomy reports.

## Priority 1 — close the reported device issues

- [ ] **Retest review-date linking on iPhone.** CPD → Set review date → choose “Hello” → choose a date → Save review date → wait for Account saved. Confirm the updated reflection is visible and survives reload. Tomorrow belongs under Future review dates; it must not be expected in Due today or earlier. Check date fields fit in portrait/landscape. Owner: builder fixes; Andrew supplies actual-phone observations.
- [ ] **Resolve hosted iPhone research failures.** Test a topic, an exact PMID/DOI, source links, original abstract, paging and retry after a failed/slow request. Check current hosted logs if it fails. Record the actual release and result; local live-source tests cannot close this issue. Owner: builder plus real-device evidence.
- [ ] **Verify persistence and iPhone-to-Mac saving.** Reload the same account on iPhone, then open/refresh that account on Mac and confirm the same fictional reflection and date. Record a separate-account isolation check in a designated test setup. Owner: builder preparation; actual-device session needed.
- [ ] **Check the new learning exports on iPhone.** Appraisal, teaching plan and revision set: PDF and Word generation/download/opening. Confirm source links, reading basis and draft/retraction labels are retained. Test a filtered multi-reflection CPD portfolio with linked appraisal; excluded records must stay out. Owner: builder fixes; real-device observations needed.

## Priority 2 — complete the anatomy requirement

- [ ] **Evaluate BioDigital’s written offer and demonstration.** Require paid-app embedding/content rights, startup cost/minimums/usage charges, selectable structure inventory, immediate origins/insertions/actions/innervation and bone details, selection APIs/custom panel, mobile performance, branding/offline/export restrictions. Do not buy or accept a contract merely to continue a prototype. Owner: builder assessment; vendor response and any eventual purchasing decision required.
- [ ] **Choose a properly licensed full-atlas route.** If the offer is unsuitable, document an audited alternative and its real effort/cost. Do not treat a personal anatomy-app subscription as an embedding licence or a mixed-licence download as blanket commercial permission.
- [ ] **Audit named coverage and map each structure.** Include sides, muscle heads/parts and bone landmarks/attachments. Every selectable muscle/bone needs appropriate source-linked information; missing records remain visible. The current 177 grouped muscle entries and 46 populated references do not meet this requirement.
- [ ] **Integrate and test the model/inspector together on iPhone.** Tap or dropdown selection must show the same useful details beside/over the model without scrolling away. Check loading, rotation, orientation, isolate/reset, memory, portrait/landscape and background/return behaviour.
- [ ] **Record independent anatomical review.** Named reviewer, exact version/scope, corrections and unresolved omissions. No “complete atlas” or accuracy approval until evidenced. Owner: qualified reviewer; builder implements corrections.

## Priority 3 — finish supplied learning content

- [ ] **Review five student units and all 25 starter questions.** Verify each explanation against its cited source/location/current version, amend unclear examples and record reviewer/version/date. Quantity alone is insufficient.
- [ ] **Review all six FCP packs.** Knee OA, low back pain, shoulder pain, possible inflammatory presentations, uncertainty/masqueraders, and safety-netting/referral communication. Confirm source currency/local-pathway boundaries, fictional cases, facilitator notes and takeaways. Keep clinical-review-pending labels until review is recorded; do not charge for an unreviewed curriculum.
- [x] **Check appraisal-to-CPD and teaching/revision reuse end to end in the developer setup.** Preserve original references, user-declared reading basis, uncertainty, snapshot version and personal notes. Check that planned teaching time and recall ratings never become automatic completed CPD or competence claims.

Review register: docs/content-review-register.md. A developer source check is not an independent clinical approval.

## Priority 4 — finish reliability, accessibility and support

- [ ] **Run account recovery scenarios on actual devices.** Interrupted save, two-device conflict, corrected backup, invalid-file rejection, discard-to-account and confirmed clear. Use a disposable test workspace and retain backups; do not clear Andrew’s real portfolio for testing.
- [ ] **Complete accessibility/mobile checks.** VoiceOver, keyboard, focus order/restoration, largest reading size, zoom/reflow, portrait/landscape, sticky navigation, modal/date-picker behaviour and safe areas. Record observed failures by device/release and retest fixes.
- [ ] **Broaden publication/reference verification.** Current four-record audit and 10 live scenarios passed; keep checking provider changes, missing abstracts, retractions, group authors and actual RIS import into a reference manager. Exact identifiers must never silently resolve to a different paper.
- [x] **Check a clean source-restoration build.** Restore pinned/licensed assets, install locked dependencies, run syntax/tests/build and smoke key routes. Preserve source/provenance and verify the intended deployed version; never equate pending publication with success.
- [ ] **Finish practical data/privacy arrangements.** Confirm responsible identity/contact, suppliers/logs, retention, recovery and full account-erasure route. Clearing active learning records is not full platform/log/backup erasure. Owner/business decisions and supplier facts cannot be invented.
- [ ] **Establish a real support route and final product documents.** Confirm where reports go, response expectations and what is retained; finalise privacy/terms/educational boundaries for the intended audience. Current reports are prepared locally and are not automatically submitted.

## Priority 5 — release decisions

- [ ] **Clear the working name and commercial content licences** before investing in public branding/paid launch. Owner chooses any paid professional checks or licence commitment.
- [ ] **Decide free/paid scope and running costs.** If launching paid tiers, implement/test billing, cancellation/refund, access changes and effects on saved learning records before taking payments. Pricing remains undecided.
- [ ] **Review every V1 acceptance row with evidence.** Close defects, incomplete content and review gaps before inviting people to judge the whole product. Focused expert review of finished material can happen earlier.
- [ ] **Choose distribution once the web workflows are stable.** Home Screen web app first. An App Store release separately needs Apple enrolment/signing, native/wrapper packaging, physical-device/TestFlight testing and submission materials. The current website is not an App Store app.

## Operating rules for the next work session

1. Start with Priority 1 and the latest actual-device evidence; fix reported defects before another round of optional features.
2. Keep publication and GitHub branch state explicit. Save source, tests, licence/provenance and work notes together.
3. Do not mark an item complete from a promise, a screenshot of an unrelated feature or a test count. Link the actual evidence and version.
4. Keep the broader all-in-one career vision, but park extra major features until the fixed V1 is complete.

## Builder pass — 28 November 2026

1. [x] Restore a clean checkout from saved source, install locked dependencies, verify the pinned anatomy assets, and run syntax/tests/build. Baseline 151 passed before edits; 154 passed after this pass.
2. [x] Keep an invalid pending cache available for recovery export while showing valid account records. Add a direct recovery-options action. Regression covers correction/import and unchanged account data.
3. [x] Restore keyboard-visible search focus and 16px research filter selects. Browser computed styles verified on home/research. Full VoiceOver, large-text and actual-iPhone checks remain open.
4. [x] Audit the 20 unique supplied student/FCP source URLs: 18 reachable, one PubMed guide timeout, one private app coverage resource. This is availability/redirect evidence, not independent clinical approval. Re-run with npm run audit:content-links.
5. [x] Check the connected appraisal/reflection/teaching/revision/export path. Preserve saved retraction warnings after library-paper removal, including older-tab account saves; verify reading basis, reference links, unchanged learning snapshots and user-recorded CPD time.

Evidence: docs/readiness-pass-2026-11-28.md and docs/content-link-audit-2026-11-28.json. Candidate app release: 2026-11-28-readiness-recovery; publication outcome must be read from Sites, not inferred from this checklist. The last confirmed published source above remains the reference until this candidate succeeds.

Next work still requires actual-device evidence for reported iPhone faults, anatomical/clinical review and a licensed full-atlas decision. BioDigital inbox check found no response on 28 November; no purchase or contract has been made.

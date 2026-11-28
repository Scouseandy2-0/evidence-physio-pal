# PhysioSidekick — Version 1 to-do list

Updated 28 November 2026. Finish the defined product before adding more major features. V1-COMPLETION.md remains the scope authority; this file gives the practical work order. A test pass, a prepared draft and a clinical/device approval are different states.

## Saved checkpoint

- GitHub repository: Scouseandy2-0/evidence-physio-pal; development branch: codex/physiosidekick-prototype; app source: sidekick/; draft PR #3. The original Lovable app remains separate.
- Latest confirmed published application source: a4ebf2701addb6afae9eb956505e29be04612980 (version 31, owner-review release); deployment confirmed succeeded on 28 November. Andrew then enabled public link browsing for a friend without ChatGPT. Account records still require identity. The next workspace-polish candidate is not live until publication is confirmed.
- Last confirmed published changes: protected invalid/malformed cache recovery, retained source warnings, local date defaults, pagination retries/Stop search, focus/reflow and dated backups. The review-date-link iPhone retest remains open.
- Latest developer baseline: 165 automated tests passed; production build and targeted desktop workflow checks passed.
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

## Next-ten pass — 28 November 2026

1. [x] Protect recovered invalid device copies from unrelated edits until explicit recovery.
2. [x] Keep malformed device-cache text exportable rather than silently treating it as absent.
3. [x] Preserve paper retraction flags in both conflict-merge directions.
4. [x] Carry newly observed PubMed warnings into linked appraisals, teaching and revision references.
5. [x] Default new reflection dates to the device calendar day.
6. [x] Retry a failed results page with its original cursor/filters while keeping earlier results.
7. [x] Add Stop search, cancellation announcements and late-response protection.
8. [x] Restore dialog focus to its opener or the workspace fallback.
9. [x] Fix enlarged research-filter layout; check 320px Chromium reflow across core screens.
10. [x] Give normal/recovery backups distinct timestamped filenames matching export metadata.

Detailed evidence and limits: docs/readiness-ten-2026-11-28.md. Full suite: 160 passing; live research audit: 10 scenarios passing. Candidate release: 2026-11-28-recovery-search-mobile. Publication outcome must be confirmed separately. All actual-iPhone and independent-review gates above remain open.

## Integrated owner-review pass — 28 November 2026

- [x] Complete a developer primary-source pass across all five student units/25 questions and all six FCP drafts. Version 2026-11-28.1 retains independent-review-pending labels; six packs now contain 18 structured discussion self-checks.
- [x] Audit every imported anatomical selection by source identity, reference fields, explicit omissions and review state; provide CSV export. This audits current assets, not full-body completeness.
- [x] Require explicitly entered time for every new reflection; keep existing records unchanged.
- [x] Retain source warnings in reflection metadata/exports after both linked paper and appraisal removal, including older-tab saves.
- [x] Add one Review this version journey and consolidated downloadable owner notes, with same-page navigation and visit-lifetime text retention.
- [x] Remove external font requests, verify native-font layout and update data/support facts.
- [x] Verify connected paper/appraisal/reflection/save/reload/Word and teaching-copy/Word journeys in the local rendered app; check anatomy inspector/software fallback and narrow enlarged review layout.
- [x] Prepare one-pass review guide and evidence/state matrix: docs/PRIVATE-REVIEW-GUIDE.md, docs/OWNER-REVIEW-READINESS.md and docs/DATA-AND-SUPPORT.md.

Candidate release: 2026-11-28-owner-review; publication outcome must be read separately. 165 tests pass. Actual iPhone/Mac/VoiceOver, independent content approval, full licensed anatomy and final public-launch data/support arrangements remain open. Review the integrated build when wanted; no per-change check is requested.

## Non-anatomy reliability pass — 28 November 2026

Andrew asked to park anatomy and get the rest right. The comprehensive V1-A atlas commitment remains open, not removed or counted as complete.

- [x] Add an explicit browser-tab trial for friends without ChatGPT: local save/reload, backup import/export and confirmed clearing; no automatic account upload/merge.
- [x] Make public publication lookup usable without account sign-in while preserving private-workspace identity checks, origin/input validation and an isolate-local anonymous request budget.
- [x] Protect an unfinished reflection against replacement by an appraisal’s reflection action.
- [x] Retain recorded study design, original PubMed link and source warnings consistently in portfolio HTML; show retained reflection warnings directly in all portfolio formats.
- [x] Remove hardcoded Andrew/private profile wording from anonymous screens and distinguish trial versus account saving/privacy/report text.
- [x] Fix populated CPD card overflow at 320px with 20px text. Developer Chromium recheck: document client/scroll width 305/305; review-date dialog 260/260. No real Safari/VoiceOver claim.
- [x] Run 175 automated tests and 10 live publication-audit scenarios, plus rendered trial save/reload/Word, real PMID/original-abstract lookup, draft-protection, teaching-copy/Word and review-date checks.

Evidence: docs/workspace-polish-2026-11-28.md. Remaining non-anatomy gates: actual iPhone/Mac persistence and exports, VoiceOver, independent clinical/content review, reference-manager RIS import, final operator/support and supplier retention/erasure arrangements. These require evidence or decisions that developer tests cannot supply.

## Reported iPhone VoiceOver paper-title issue — 28 November 2026

- [x] Record Andrew’s specific passing text/control/three-finger scroll observations separately from the paper-title defect.
- [x] Reproduce and remove coordinate-based dialog dismissal; return focus to the activated paper button; verify Enter/Space/Close/Escape and full test suite/build.
- [ ] Retest double-tapped paper-title opening and closing on Andrew’s actual iPhone with VoiceOver. Candidate 2026-11-28-dialog-accessibility remains unconfirmed on the device. See docs/voiceover-paper-dialog-2026-11-28.md.

## Paper pages after failed iPhone retest — 28 November 2026

- [x] Reopen the title-opening issue: Andrew observed only one success across five paper attempts after the dialog correction.
- [x] Replace paper popups with native full-page record links and explicit result/library return; keep result filters/position/focus, exact-PMID reload and retry states.
- [x] Verify five distinct records by keyboard and pointer in Chromium; fix multiline title tap gaps. Full suite now 179 passing.
- [ ] Actual iPhone VoiceOver retest across several records, scrolling and return. External PubMed scrolling remains unverified separately. Evidence: docs/paper-pages-2026-11-28.md.

## Paper entry reading order — 28 November 2026

- [x] Record Andrew’s confirmed PubMed scrolling and paragraph-navigation observations.
- [x] Move Back to research results below the paper rather than before its heading; use layout-frame heading focus with stale-navigation/user-focus guards.
- [x] Verify loaded/loading/retry behaviour and return navigation in developer checks. Browser focused paper-heading and placed the return link after the article. Full suite remains 179 passing.
- [ ] Actual iPhone VoiceOver check still open. Andrew’s latest description may refer to focus on the return link rather than actual route navigation; neither interpretation is treated as proven. Candidate: 2026-11-28-paper-entry.

## Continue reliability work — 28 November 2026, afternoon

- [x] Confirm version 36 published with paper heading first and return navigation after the article; actual iPhone result remains unverified.
- [x] Put a short VoiceOver guide inside Reading & iPhone setup, including select/activate, paragraph/item navigation, three-finger scrolling and external-site boundaries.
- [x] Display the active app release in the footer to distinguish an old open tab from the latest code.
- [x] Add a bounded in-memory navigation trail to locally prepared reports, excluding queries, URLs, paper identifiers/titles, account identity and notes. Validate context again at report generation.
- [x] Distinguish browsing without saving from trial and account modes in reports.
- [x] Check real rendered guide and title→paper→return→report sequence. No automatic transmission occurs. Software suite now 183 passing.
- [ ] Actual iPhone VoiceOver reliability remains open. A report captured after a failure may help distinguish activation of the return control from a route change without it; the current checks do not prove the root cause or a device fix.

Candidate release: 2026-11-28-navigation-help. Deployment outcome must be confirmed separately. Anatomy remains parked.

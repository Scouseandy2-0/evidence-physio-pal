# Developer readiness pass — 28 November 2026

Release: 2026-11-28-readiness-recovery. This pass is preparation for release, not clinical approval or actual-iPhone sign-off.

## Five completed tasks

1. **Reproducible source restoration.** Opened a new checkout from Sites source 2ef6d0c42f35db6f1f0ae51e58b1dddfcdcb6828 at /workspace/sites/physio-sidekick. Installed 59 locked packages. Pinned anatomy assets were present and verified by the pretest scripts. Syntax, all 151 existing tests and the Worker build passed before implementation. No production user records were changed for QA.
2. **Pending-cache recovery.** Previously, validation failure while restoring cached pending records could leave valid account data undisplayed without making that failed snapshot available to normal recovery export. The invalid snapshot now moves to the existing invalid-recovery slot, valid account records display, automatic upload is blocked, and the error banner links to recovery options. Regression verifies exportable cached contents, an unchanged account copy and explicit corrected combination. This covers parsed snapshots failing workspace validation; it is not a claim about every possible storage corruption or device failure.
3. **Search accessibility.** Later searchbox reset rules suppressed the generic keyboard outline; later, more-specific research-filter rules reduced selects to 13px. Added explicit focus-visible search outline and 1rem filter size. Rendered Chromium checks measured a 3px outline on both home/research keyboard-focused search fields and 16px on all three research filters. No desktop horizontal overflow observed at 1363px. No claim of iPhone, VoiceOver, contrast or full accessibility certification.
4. **Content-link availability audit.** Added npm run audit:content-links and a dated JSON evidence file. Twenty unique URLs: eighteen reachable HTTP 200, one NLM guide timeout, one private internal coverage resource. Fetches omit credentials and retain metadata, not page bodies. Independent clinical review, current-version appraisal and anatomical completeness remain outstanding.
5. **Connected learning workflow and warning retention.** Appraisals now retain a sourceRetracted snapshot. Validation, account saves, the appraisal view and Markdown/PDF/Word exports preserve it; saved source warnings carry into linked teaching/revision references and newly created reflection text. The account API retains known warnings when an older tab omits the field or removes its library copy. A regression follows appraisal → reflection → teaching/card → validation/save-style JSON round trip → library removal → later appraisal edit → Word/portfolio exports. Original reflection/card notes and abstract-only reading basis remain intact; a 90-minute teaching plan and recall rating do not change the 17 minutes explicitly recorded for the reflection. An in-memory SQLite API test separately verifies account storage and older-tab preservation.

## Verification

- Final full automated suite: **154 passed, 0 failed**.
- JavaScript syntax checks and production Worker build passed.
- New recovery and learning-flow cases use fictional fixtures/in-memory storage.
- Browser check used the local preview, not Andrew’s account database or his iPhone.
- Previously supplied actual-iPhone evidence remains limited to the saved test reflection and CPD PDF/Word download/Pages checks in device-evidence.md. Review-date linking, new learning exports, hosted search and cross-device persistence still need device evidence.

## Outstanding product gates

Full per-structure anatomical coverage/licensing, independent content reviews, actual-device recovery/accessibility, final data-erasure/support arrangements and branding clearance remain open in TODO.md and V1-COMPLETION.md. No BioDigital response was present in the connected inbox at this pass. No new message was sent. Publication is tracked separately by the Sites deployment response.

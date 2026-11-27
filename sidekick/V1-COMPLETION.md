# PhysioSidekick — fixed Version 1 completion checklist

Working baseline set under Andrew’s build authorisation: 27 November 2026, following Andrew’s instruction to define a finished product before asking others to judge the overall experience. Working name remains subject to clearance.

**This is the authoritative V1 scope.** It supersedes earlier open-ended roadmap priorities. BETA-READINESS.md remains a record of verification/launch gates, not a reason to recruit users before the defined product is built. Changes to this scope must be deliberate and recorded here; do not quietly move unfinished commitments to “later”.

## Product boundary

A connected research, anatomy, learning and professional-development companion for **UK MSK physiotherapists, first contact practitioners and physiotherapy students**. V1 is not a complete library for every physiotherapy specialty. The broader all-in-one career vision remains the long-term direction.

V1 must provide useful content in every promised area, not simply navigation, external links or empty editors. User-written notes remain separate from supplied learning material. A passed automated test is supporting evidence, not proof that an entire area is complete.

## Fixed acceptance checklist

| ID | Area | V1 is finished when | Current evidence and gap |
|---|---|---|---|
| V1-R | Research and original papers | Topic/title/author/PMID/DOI discovery, supported filters, paging and recovery work; source identity and original-paper access are clear; a recorded sample audit covers titles/authors/year/DOI/abstract states; saved searches and reference exports retain provenance | Implemented with automated/live sample checks. Hosted iPhone recovery and final sample audit still need completion |
| V1-A | Regional anatomy | Shoulder, elbow, wrist/hand, hip, knee, ankle/foot and spine can be explored by region and named structure. Licensed 3D bones **and major muscles** are required; relevant joints and key peripheral nerves must have navigable, source-linked coverage. Side/orientation, selection, isolation and reset work. Coverage/missing-detail limits are explicit and the delivered material has anatomical review | Pinned skeleton (242 structures) and muscle (177 groups) assets/catalogues are integrated. Seven regional guides connect bones, selected muscles, joint/movement notes and 11 key-nerve note cards. Source links, region/side filtering and exports are built. Muscles combine both sides; nerve/joint notes are not extra meshes. A docked tap-to-inspect panel adds 41 muscle/25 bone-family draft references, with explicit catalogue-only gaps for other selections. Independent review, real-device performance and final coverage verification remain open |
| V1-S | Student learning | At least 20 source-linked starter questions across five learning units (finding papers; understanding study design; interpreting results; appraisal/uncertainty; anatomy-to-evidence), with explanations and source locations; learners can add their own cards and practise/revisit them; supplied content is reviewed and distinct from self-authored answers | Personal revision workflow works. Five draft units now supply 25 source-linked questions, explanations, original practice tasks, exports and a bridge to personal revision drafts. All five require independent content review; mobile/assistive-technology checks remain open |
| V1-C | Critical appraisal | A complete source-linked appraisal can record the question, design, actual reading basis, findings, uncertainty, limitations and applicability; it saves/reopens/exports and leads to an editable reflection without inventing conclusions or evidence grades | Workflow implemented. Full recorded end-to-end device check and content review remain |
| V1-P | CPD and portfolio | Readers enter actual learning time, reflection/action, source, outcome and follow-up; records edit/reload correctly; selected dated/type-filtered portfolios print/export with linked evidence; no implied accreditation or automatic competency award | Workflow implemented. Real-device/full export check and final wording review remain |
| V1-F | FCP teaching area | Six complete source-linked teaching packs, not six empty frameworks: knee OA; low back pain; shoulder pain; recognising possible inflammatory presentations; diagnostic uncertainty/non-MSK masqueraders; safety-netting/referral communication. Each has objectives, preparation, timed agenda, fictional discussion case, facilitator source checkpoints, learner questions and take-home activity. Each records its sources, version and review status. Packs can be copied into an editable saved teaching plan and exported. Reviewed content is required before delivery/premium claims | Teaching planner works. All six source-linked drafts are implemented, with independent copies/exports; clinical review, source currency confirmation and final corrections are incomplete |
| V1-D | Accounts, saved work and recovery | Same-account iPhone/Mac saving, separate-account isolation, pending changes, conflicts, failed saves, backups/import and corrupted-file rejection are verified. Users have a documented practical account-data deletion/recovery route and accurate data information | Developer tests cover the main storage/recovery paths. Physical devices and a complete account-erasure/retention arrangement remain unfinished |
| V1-U | Usability, accessibility and support | First-use guide, readable responsive layouts, keyboard/focus, mobile navigation, zoom/reflow and VoiceOver checks pass the agreed scenarios; problem reporting gives a usable support route and honest delivery status; privacy/terms/support details are finalised for the intended audience | Guide/preferences/report preview work. Full device/accessibility checks and managed support/public documents remain incomplete |

## Fixed content floor

- Seven named MSK regional anatomy areas, including licensed major-muscle 3D coverage. Do not substitute unlicensed imagery or generated anatomy for missing source assets.
- Five student learning units with at least 20 reviewed starter questions in total. Quantity is a floor, not permission to pad the library.
- Six FCP packs with the common content structure above, each versioned and source-mapped. Draft packs are not counted as reviewed or ready for paid delivery.
- Existing general practice-resource links remain a curated source shelf. Standalone outcome-measure calculators are not a V1 commitment; adding one requires a separate scope decision, permitted use/version and scoring validation.

## Delivery order from this baseline

1. **Fill the content gap:** build the six FCP pack drafts and the five student units. First implementation: knee OA evidence/exercise teaching pack, copied into the existing saved-session workflow. Keep source maps and content-review status alongside the material.
2. **Finish anatomy coverage:** source/license suitable major-muscle assets; add regional navigation and source-linked joint/nerve learning; review representations. Do not declare a complete atlas or invent mesh labels.
3. **Close workflow gaps:** complete account-erasure/recovery arrangements, final exports/support/privacy and device/accessibility checks. Fix defects when found throughout the build; do not use test-count increases as a substitute for content progress.
4. **Feature-complete review:** verify every V1 row against evidence. Only then invite people to assess the whole product experience. Focused anatomy/clinical source review can happen earlier on completed material; it does not imply the whole app is ready for users.
5. **Release gates:** name clearance, intended audience/privacy/support sign-off, any paid tiers/billing/cancellation and iPhone distribution checks. No charges or external invitations are implied by this plan.

## iPhone and App Store boundary

The first implementation remains the existing responsive web app/Home Screen installation. The native Apple route is a separate distribution gate for the same defined feature set: wrapper/native build, Apple enrolment/signing, physical-device/TestFlight tests and submission material. Do not describe the web app as an App Store app, or describe Apple distribution as complete before those steps pass. Packaging should follow stable workflows rather than delaying content work behind an empty native shell.

## What does not count as done

- A placeholder page, generic template or external link standing in for a promised content section.
- A “reviewed” label without the recorded reviewer, version, scope and outstanding corrections.
- Successful localhost/automated tests standing in for physical iPhone/Mac or VoiceOver evidence.
- Generated publications, invented clinical facts, inferred evidence grades, auto-filled learning time or a competency certificate.
- A pending deployment standing in for a confirmed live release.

## Change control and progress

Use the V1 IDs in work notes and release summaries. Mark implementation, developer verification and independent review separately; do not use a single percentage that conceals a missing anatomy or FCP section. Reopen a completed criterion if later evidence shows a defect. Record any proposed addition as post-V1 until it has an explicit scope decision.

# Validation — 27 November 2026

## Automated

Node's test runner covers research query scope, DOI punctuation, publication/date filtering, rejecting invalid/non-PubMed identifiers, missing metadata, retraction flags, safe full-text links, RIS newline injection, service failures and preservation of statistical comparison symbols in abstracts.

`npm run check` validates the syntax of each browser JavaScript module.

## Browser QA

Tested through the rendered interface with live Europe PMC responses:

- Overview and navigation render successfully.
- Knee osteoarthritis query returns actual indexed records.
- Systematic-review and open-access filters return matching indexed metadata.
- Record dialog opens with PMID, DOI, complete indexed abstract and provider-supplied full-text link.
- Saving a paper updates the library and survives reload.
- Creating a reflection survives reload with entered text and learning time.
- Critical appraisal exercises give answer-specific feedback.

- Paper collection and notes persist after explicit save and browser reload.
- RIS reference export triggers a browser download.
- FCP planner accepts a fictional discussion prompt and downloads an editable Markdown outline.

Desktop browser QA is not equivalent to physical iPhone or native iOS testing.

## Research workflow update

15 automated tests now pass. New coverage includes all/any and phrase matching, author-only search, exact identifiers and PubMed URLs, discovery-filter bypass for identifiers, date boundaries, malformed input, multiple source-labelled free links, cursor propagation, request cancellation and stalled-provider timeouts.

Browser checks with live publication responses verified:

- PMID 43060446 retrieves one matching record even with a conflicting trial filter enabled.
- DOI 10.3389/fphys.2026.1970396 retrieves the same record while an unrelated author filter is retained in the controls but ignored for the lookup.
- Exact phrase `rotator cuff` with author `Hopewell S` returns 14 indexed records. Loading the second page produces 14 unique cards.
- Saving a search persists its query/options through reload and reruns from the saved-search chip.
- Search-record export triggers a text download.
- The paper dialog exposes separate provider-supplied HTML/PDF links; the result card exposes a direct free-full-text link.
- Changing a search option uses the text currently entered, rather than replacing an in-progress edit with the previous query.

Europe PMC's numeric EXT_ID field requires an unquoted number: quoting a known PMID returned zero results during integration testing. The implementation and regression tests now use numeric syntax. Provider responses were occasionally slow; the app now provides a 25-second timeout and retry message instead of indefinite loading. Provider links are indexed access indications, not a guarantee of live publisher availability.

## Account-storage update

25 automated tests pass, including SQLite-backed migration/API checks and two-client sync tests. New cases cover identity and origin enforcement, owner isolation, body-owner spoofing, stale revision rejection, bounded validation, import URL safety, divergent notes/reflections, explicit legacy migration, recovery after interruption, edits during an in-flight save and exportable invalid edits.

Browser QA on the local preview verified:

- Initial account connection and explicit legacy migration of a saved paper, reflection and search.
- Imported records reload from SQLite after page reload.
- Two tabs loaded the same account revision; a newer note from the first tab caused the second tab’s stale save to produce a conflict prompt.
- Explicit combination retained both notes, with a device-note marker, and persisted after reload.
- Account status displays pending/saving/saved and exposes Refresh from account.
- Workspace JSON export triggers a download.

Local preview uses a fictional identity and local SQLite. This is not proof of physical iPhone use or hosted D1 authentication; hosted provisioning and identity need a successful publication. No test fixtures are seeded into hosted storage.

## Remaining release checks

Physical iPhone/Safari and Mac refresh/import tests; native storage/download/external-link handling; licensed 3D anatomy; clinical editorial review; provider terms and text reuse; complete accessibility audit; trademark clearance; signed iOS build and App Store review. No public or clinical launch is implied.

## Hosted-search timeout repair

31 automated tests pass. Added tests verify primary timeout/failure to real-metadata PubMed fallback, honest missing abstracts/access labels, isolated pagination, no silent widening of OA filters, exact query translation, genuine zero versus invalid upstream responses, authentication/origin enforcement and an 8 KB input limit. Browser syntax checks and production Worker build pass.

After restarting the preview and reloading its modules, the actual rendered research page searched `Knee osteoarthritis` through the new same-origin endpoint. Europe PMC timed out; NCBI backup returned 51,038 indexed results with eight records, clearly labelled backup provenance and missing abstract/access information. Loading more displayed additional PubMed records. Invalid input after a successful search displayed only the actionable error, without a result count. Repeating the valid search returned cached genuine records. These checks used the fictional local-preview identity and live publication providers; they are not physical iPhone testing or proof of a completed hosted deployment.

## Structured appraisal and linked CPD update

38 automated tests pass. Added cases cover legacy-workspace compatibility, appraisal validation and limits, source/citation snapshots, backup round trips, unread/incomplete appraisal rejection, editable reflection seeding without invented time, immutable reflection content, conflicting appraisal versions with correct CPD links, keeping appraisal provenance after removing a saved paper, and rejecting old-client writes that omit existing appraisals.

Browser QA used live PMID 31316228 with explicitly fictional software-test notes in the local preview. Verified record-to-appraisal navigation, automatic saving of the paper, unread-state feedback, abstract-only warning, structured note entry, CPD draft creation with blank learning time, explicit save with 12 test minutes, linked appraisal reopening after reload, appraisal download event and saved-library Continue appraisal access. All test notes are labelled software QA; they are not claims about the paper. Preview uses a fictional identity and separate SQLite; fixtures and runtime data are excluded from production. Physical iPhone testing and hosted account round trips remain separate checks.

## Original abstract retrieval update

46 automated tests pass. Coverage includes fixed PMID/endpoint routing without account headers, indexed continuation lines, statistical symbols, copyright separation, retraction flags, matching-record enforcement, genuinely absent abstracts, malformed/multiple records, response size bounds, provider failure/timeout, client provenance validation, preserving notes, backup/conflict metadata retention and old-client provenance protection.

Rendered local browser checks with live PubMed EFetch verified PMID 31316228 as a genuine no-English-abstract record. For real PMID 42910073, a local-only test fixture cleared the already-indexed abstract to simulate the citation-only backup state. The new control retrieved the genuine PubMed abstract, displayed its source/time and publisher copyright, saved it to the fictional preview account and retained that provenance after a full reload. No fixture records or runtime SQLite files are included in the deployment. No physical iPhone or hosted account round-trip result is claimed.

## Reusable source-linked teaching update

52 automated tests pass. New tests verify agenda totals across duration boundaries, draft-only plan creation without CPD logging, canonical source links and reading/retraction labels, source snapshots surviving library removal, backup compatibility, conflict preservation, bounded plan/source validation, account reload and old-client write protection.

Rendered local-browser QA verified creating a framework-based session, editing title/audience/discussion, changing duration to 30 minutes with a 4+10+10+6 agenda, attaching genuine PMID 31316228 from the saved library, changing its session reading basis to Not yet read, downloading the teaching plan, reloading/reopening retained content and duplicating the session with an independent title. The original and duplicate both appeared in the session list. These are explicitly labelled software-QA plans in the fictional local account and are excluded from production. No hosted-account or physical iPhone test is claimed.

## Student revision update

58 automated tests pass. New checks cover user-note draft creation without generated facts, canonical source references and declared reading/retraction labels, rating persistence, stale-rating reset after edits, conflict version retention, old-workspace compatibility, invalid/oversized/source-less card rejection, account reload and old-client write protection.

Rendered local-browser QA used explicitly fictional software-QA notes and genuine PMID 31316228. Verified My revision entry, set creation, a source-linked card seeded from existing appraisal notes, hidden/revealed answers, Again rating, account save/reload, again-only practice, Recalled rating, editing an answer resetting it to unrated, and a study-set export download. Notes and ratings are QA fixtures in the fictional local account and are excluded from production. Physical iPhone and hosted-account checks remain separate.

## CPD portfolio update

65 automated tests pass. New coverage checks inclusive date/activity/text/outcome filters, invalid ranges, selected-only totals, source-linked evidence scope, current-versus-historical appraisal provenance, missing-appraisal handling, escaped script-free printable exports, follow-up validation/conflicts and preservation during old-client writes.

Rendered local-browser QA added a clearly labelled software-test outcome and review date to the existing fictional reflection, saved and reloaded it, filtered to the activity’s exact date with an outcome recorded, and triggered both printable HTML and Markdown downloads. An inverted date range showed an actionable error with export disabled; a no-match text search showed the empty state; Show all restored the record. These are local-preview checks, not physical iPhone printing or proof of hosted account behaviour. No QA fixtures are included in production.

## Three usability improvements

71 automated tests pass. New checks cover mixed-type workspace search/ranking, accent and all-word matching, outcome/type filters, accurate total versus result cap, non-mutation, bounded reading preferences, persistence/failure defaults and Home Screen manifest/PNG dimensions. A built-Worker fetch check confirmed HTTP 200, correct MIME types and uncorrupted PNG signatures for the manifest and all three icons.

Rendered local-browser QA found existing software-QA teaching, appraisal, CPD and revision records in one query; filtered to a reflection and confirmed focus/highlight on the exact article; opened a paper by PMID; and searched/jumped to a matching revision card. Reading size 125%, comfortable spacing and reduced motion survived reload, the desktop layout stayed within the viewport, and Reset returned to 100%. The setup dialog displayed its app icon and installation instructions. No physical iPhone Home Screen, mobile viewport, Safari sign-in or standalone-storage test is claimed. No offline mode was added.

## Skeletal anatomy preview

Automated checks cover pinned binary hash and mesh/catalog correspondence, source labels, region/search filters and blank source-linked learning drafts. Added regression coverage for preserving positions when unpacking interleaved GLTF geometry for the SVG fallback. Build and syntax checks pass.

Rendered browser QA: femur and right scaphoid display correctly in software mode; source-ID/region filtering, focus, lateral view and anatomy-to-research navigation work. Anatomy-to-CPD produces a draft with the right structure/FMA source, blank minutes and blank learning/action fields; the QA draft was cancelled. WebGL is disabled in the remote browser, so full GPU rendering and physical iPhone behaviour are not verified. No production account data was used or seeded.

## Research connection repair — 27 November 2026

Production logs confirmed POST /api/research returned 503 at 12:45:14 UTC. A real Europe PMC request from the development environment took 13.55 seconds, exceeding the old 7-second primary deadline. Increased the primary allowance and added independent browser recovery rather than relying on the two hosted connections alone. Underlying hosted-provider failure categories will now be logged without search terms or identity; the precise cause of the NCBI failure was not available in the original logs.

83 automated tests pass, including credential-free recovery, exact query/cursor retention, no fallback after request/authentication/rate-limit rejection, provider-stable NCBI pages, cancellation, timeout, malformed records and genuine zero results. Rendered-browser QA temporarily returned a deliberate 503 from the local research route, then used the real public Europe PMC API: Osteoarthritis returned 110,561 indexed results, eight real source-linked records and 16 records after Load more. The temporary local failure injection was removed before packaging. This validates browser CORS recovery from a localhost app; hosted-origin behaviour and physical iPhone behaviour after publication remain to be checked.

## Cross-device saving and recovery — 27 November 2026

The preceding research-recovery deployment was confirmed succeeded. Account review found a delayed-refresh race: edits queued while a GET was in flight could be replaced by the older read response. Refreshes now share one read, defer writes, preserve pending edits and require conflict recovery if the remote revision advanced. Recovery combination also rejects stale snapshots after a newer local edit. Invalid initial snapshots do not establish an editable account; malformed save acknowledgements cannot clear recovery copies. New-client saves bind to the expected account identity and cannot write an old account’s snapshot into a newly signed-in account.

91 automated tests pass. Added scenarios cover delayed refresh/edit/save ordering, newer second-device versions, explicit merge preservation, overlapping refreshes, invalid edits during reads, unconfirmed acknowledgements, switched-account rejection and edits during recovery. A complete saved-paper/appraisal/CPD/teaching/revision fixture survives a failed save, recovery on reload, loading on an independent simulated device and JSON backup validation. Tests use fictional records and isolated SQLite databases; no production records were changed. Syntax checks and Worker build pass. These are client/API integration tests, not a physical iPhone-to-Mac sign-off; Safari lifecycle, real signed-in devices and the final deployed UI still need verification.

## Research stress and source integrity — 27 November 2026

The preceding account-recovery deployment is confirmed succeeded. 99 automated tests pass after this update. Tests now cover mismatched exact identifiers on primary and backup routes, contradictory counts, duplicate/invalid PMIDs, oversized pages, repeated/malformed cursors, reserved DOI characters in publisher/citation/RIS exports and ten rapidly cancelled searches whose late successful responses must remain cancelled. Original abstract responses require matching canonical source links and nonempty source titles. Existing tests retain filter fidelity, explicit outages vs genuine zero results, timeouts, cancellation, authentication and no provider switching during NCBI pagination. No traffic load test was sent to publication services.

Live API spot checks from the development environment: PMID 31316228 returned the matching paper via NCBI backup after Europe PMC timed out (19.0 seconds overall); DOI 10.1136/bmj.l418 returned PMID 30683648 via Europe PMC (8.8 seconds). Returned titles, authors, years, DOI and canonical PubMed URLs were inspected; this is a sample check, not a complete metadata audit. Direct PubMed detail retrieval confirmed PMID 31316228 has no indexed English abstract, while PMID 42968345 returned a 2,531-character abstract with a copyright statement (SHA-256 18202e635d052579eb8be2c3721ef2874f5ce5af480257b29c773022e6696e57).

Rendered local-browser QA searched PMID 31316228, opened its source-linked record and retrieved the original PubMed details. The view correctly changed from not loaded to not indexed, with PubMed attribution/retrieval time and the canonical link. No fictional abstracts or production account changes were introduced. Physical iPhone and final hosted-origin verification remain outstanding.

## Onboarding, accessibility and problem reporting — 27 November 2026

The preceding research-integrity deployment is confirmed succeeded. 103 automated tests pass, including new guide progress/dismissal, unavailable storage, report input validation and exclusion of identity/query/notes/paper content from diagnostic context. Syntax checks and Worker build pass.

Rendered local-browser QA verified the zero-record Overview guide, opening its full instructions with focus on the dialog heading, hiding and restoring it through Getting started, generating a report from fictional software-QA text and copying it with a truthful not-sent status. Learning tabs respond to End/Home, preserve selected state/focus and expose one tabindex=0 with other tabs at -1. Desktop layout had no horizontal overflow. Browser inspection confirmed the new muted colour rgb(82,103,125) and 14 px footer text. Contrast calculations identified the previous muted text/background ratio of 4.38:1 and mobile inactive text at 3.84:1; these colours were darkened. Keyboard/screen-reader changes were inspected through the accessibility tree; real VoiceOver, physical iPhone, 200% zoom across all screens and a complete WCAG audit remain outstanding. No live account learning records were changed. Reports are preview/copy/download only, with no support-message submission.

## Beta preparation, backup recovery and response protections — 27 November 2026

The help/accessibility deployment is confirmed succeeded. 111 automated tests pass. New cases cover versioned/raw legacy backup validation, unsupported/future record types, file and canonical workspace limits, preservation of local pending + remote + imported records, corrected-invalid-edit recovery, keeping unrelated legacy imports unacknowledged and rejecting a newer invalid edit during recovery. Response tests preserve API status, private caching, body and lack of CORS while restricting executable sources and unnecessary device capabilities. No schema migration, production data deletion or audience change was required.

Production build import smoke checks verified 200 for /, /help.js, /backup.js and /readiness.js and 401 for unauthenticated /api/workspace and /api/research. Every response carried the intended CSP, capability restrictions and cache controls. Rendered local-browser QA with the same protections loaded the app/readiness dialog and successfully searched PMID 31316228 through NCBI fallback. The search announcement reported one matching record; there were no Content Security Policy errors in the inspected browser log. The beta status panel correctly leaves independent anatomy review, real devices, full accessibility/privacy/support/commercial gates open. Integration tests cover backup merge behaviour; physical iPhone file selection/import and end-to-end account-erasure arrangements remain unverified/not implemented respectively.

Prepared BETA-READINESS.md, an independent task script and an internal factual data/support inventory. These documents are preparation, not evidence that testers have participated or that legal/clinical review has occurred. No invitations, support messages, purchases or changes to sharing were made.

## Fixed V1 checklist and first supplied FCP learning draft — 27 November 2026

The preceding beta-readiness deployment is confirmed succeeded. V1-COMPLETION.md replaces the open-ended build order with bounded acceptance criteria and content floors. The app displays the same eight stable work areas, with anatomy/student/FCP content explicitly incomplete. Whole-product tester recruitment follows the defined build; focused accuracy review of completed material remains a prerequisite.

113 automated tests pass, with source-pack copy/export/agenda tests added. A supplied pack copies into a valid independent account teaching plan, retains its source/version/review state and exports all session sections without inventing indexed-paper references. Existing account/teaching tests cover persistence. Rendered local-browser QA opened V1 completion, opened the supplied knee OA pack, created a saved editable copy, renamed it as a Software QA record, waited for Account saved, reloaded and reopened it. The copied NICE source map/version/draft state and prepared content survived. Only the fictional local preview account was used; no production learning records were created.

Official NICE NG226 recommendation/rationale content was inspected through official-domain search results to prepare brief source-mapped discussion checkpoints. Direct recommendations-page retrieval returned 403; source currency and professional content review remain outstanding before delivery. The pack is a source-linked draft, not approved clinical teaching or a completed V1-F library. Syntax checks and build pass. Physical iPhone and independent clinical/anatomy checks remain open.

## Five further FCP source-linked drafts — 27 November 2026

The preceding V1-scope/first-pack deployment is confirmed succeeded. Added the five remaining topic drafts from the fixed V1 list, with separate fictional cases, objectives, source maps, 30-minute agendas, facilitator checkpoints, follow-up tasks and three unscored learner self-checks per new pack. The FCP library and V1 panel show six prepared drafts and zero completed clinical reviews. These checks are not the separate student starter-question bank and do not close the clinical-review criterion.

115 automated tests pass. All six pack copies validate against the teaching schema, save/reload through an isolated account database and retain source/version/draft snapshots; a different account receives none of them. Self-check source indices resolve, points/questions survive saved-copy preparation and Markdown export, agenda timings sum correctly and editing a personal copy does not change supplied content. Syntax checks and production build pass.

Rendered local-browser QA opened each of the five new packs, found three self-checks and revealed its first draft discussion point. A safety-netting pack copy was saved under an explicitly labelled Software QA title, reloaded/reopened and confirmed to retain self-checks, follow-up ownership discussion and suspected-cancer scope. Only fictional local account records were used. No production account content, sharing, payment or external messaging was changed.

Source checks: official-domain NICE NG59/NG100/NG65 indexed recommendation content was located; direct page requests returned 403. BESS publisher material, the original 2021 guideline publication (PMC7905504 / PMID 33747136) and current HCPC conduct standards were opened. NG12 safety-netting content was located through a government-archive indexed copy and official evidence-document results; its current published wording must be checked before delivery. The 2026 NICE update history was located. Consultation material surfaced in search was excluded as a normative source. Source limitations and pending reviewer fields are recorded, not converted into approval. Independent clinical/source-currency and physical-device checks remain open.

## 27 November 2026 — five student starter units

Added five units with 25 unique source-linked questions/explanations, deliberate reveal controls, per-unit application tasks and exports, and a guarded question-only draft bridge into personal revision. Original sources were opened: NLM PubMed guide, CASP design/appraisal/checklist resources, Cochrane chapters 3/14/15 and systematic-review explainer, OpenStax 2e 9.5; existing pinned model provenance was inspected locally. All five retain pending independent review with no invented reviewer/date.

Validation: 118 automated tests passed; syntax checks and production Worker build passed. New checks cover the five-unit/25-question floor, unique item IDs, valid source/section mapping, export source/explanation/review retention, schema-valid empty study sets, and refusal to save a revision answer without a real paper source. Browser interaction, physical iPhone layout and VoiceOver were not verified in this build because browser-control capability was unavailable. No visual or device pass is claimed. The numerical examples are fictional arithmetic, not efficacy claims. No account schema change, migration, CPD credit, scored assessment or audience change.

## 27 November 2026 — muscle model and seven regional anatomy guides

Built five connected additions: a verified licensed muscle model mode; seven MSK regional selectors/guides; joint and movement learning notes; 11 key-nerve note cards; source-preserving guide exports and research/student-unit/personal-revision handoffs. Muscles are 177 selectable groups from 428 source meshes and combine paired sides/heads. Skeleton side filtering includes midline structures. Whole source structures can span neighbouring regions; no aligned model overlay or extra joint/nerve mesh is claimed. All source notes remain drafts pending independent anatomical review.

123 automated tests passed, along with syntax checks and a production Worker build. The new checks verify the exact muscle GLB size/hash, 177 unique labels and matching FMA/source IDs, self-contained buffers, finite real Three.js geometry and software-geometry conversion, seven region mappings including hand/foot phalanges, side restrictions, source/limitation retention in exports and blank-time/blank-learning muscle reflections using the muscle source. The built Worker served 11 new/dependent routes plus both binary assets; the binary responses matched local checksums.

No browser-control capability was available for this build. Interactive visual rendering, physical iPhone GPU/memory performance, VoiceOver and final keyboard/reflow checks are not claimed. Node model parsing is not a substitute for these checks or for anatomical review. No account schema, migration, payment, invitation, audience change, automatically credited CPD or accreditation was introduced. Previous student deployment was confirmed succeeded before this work.

## 27 November 2026 — in-view structure inspector

Implemented a docked selected-structure panel, in-workbench accessible picker, hide/reopen behaviour and viewport expanded view with keyboard containment/background inertness/cleanup. Mesh and list selections share the same note lookup and do not request page scrolling. Regional guides were moved below the model workbench. Independent reference coverage is explicit: 41/177 muscle groups and 50/242 skeletal structures (25 paired bone families) have populated draft notes; other selections have no inferred anatomical fields. References are original factual notes with actual source URLs/sections; no attachment coordinate or coloured pin was invented.

127 automated tests passed, syntax checks and production build succeeded. New checks validate real catalogue/source mapping, complete field shape for supplied muscle notes, independent pending review records, bone aliases and preserved laterality, empty detail fields for uncovered/invalid identities, isolation of returned note objects and selected anatomical distinctions (biceps identities/head supply, indirect quadriceps insertion, FDS/FDP supply, medius/minimus origin, FCR/EDC actions). A built-Worker smoke check served the exact inspector module and its application/style dependencies.

No browser-control capability was available. This does not establish that the new responsive panel, touch interactions, fullscreen-style expanded view, keyboard/inert behaviour or VoiceOver passed on real browsers or iPhone. Required manual scenarios are in docs/anatomy-inspector-review.md; no device, visual or independent anatomical-review pass is claimed. No account schema, subscription, vendor agreement, external message or sharing change. The preceding regional anatomy deployment was confirmed succeeded.

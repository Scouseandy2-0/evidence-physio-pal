# PhysioSidekick — private prototype

Working name, pending trademark clearance. Owner: Andrew Lockhart. Started 27 November 2026.

## Fixed V1 scope

[V1-COMPLETION.md](V1-COMPLETION.md) is the authoritative first-version checklist and build order. It supersedes the earlier open-ended delivery roadmap below. Complete the defined content areas before inviting whole-product usability assessment; clinical/anatomical review of completed material remains necessary.

## Product intent

A connected career companion for physiotherapists and students: learning and anatomy, real research, professional practice resources, CPD and a specialist FCP area. The long-term product is deliberately all-in-one; delivery is incremental, with independently useful workflows.

## This version

- Responsive desktop and iPhone layouts with seven working navigation areas.
- Live keyword, exact-phrase, author, DOI and PMID search of Europe PMC's PubMed-indexed records, title/abstract scope, publication/date/access filters and cursor pagination.
- Indexed abstracts, publication-type metadata, retraction warnings when supplied, PubMed records, DOI links and free-full-text links when indexed.
- Saved papers, named collections, notes and citation/RIS exports.
- Up to 20 account-backed saved searches, rerun with their options; downloadable search records with the actual query, run time and reported result count.
- Direct indexed free-full-text links on results, separate text/PDF source choices and institutional-access guidance where free access is unconfirmed.
- Structured paper appraisal notes with explicit reading basis, original-reference snapshots, auto-saving and Markdown export.
- Appraisal notes seed an editable CPD draft with a canonical PubMed link. The reader supplies learning time and explicitly saves; later appraisal edits do not rewrite the reflection.
- Personal CPD reflections with editing and Markdown export.
- Original-source resource shelf, three introductory critical-appraisal learning checks.
- Saved FCP/student teaching sessions with editable objectives, audience, duration, agenda, discussion, preparation and takeaways; reusable duplication and Markdown export. Original paper references attach from the saved library. These are planning frameworks, not reviewed clinical teaching packs or an accredited curriculum.
- Account-backed papers, notes, saved searches and CPD in an owner-scoped D1 database.
- Workspace JSON export/import, explicit migration of earlier browser records and optimistic revision checks for concurrent devices.
- Device recovery cache for pending changes; explicit conflict combination preserves differing notes/reflections. Synchronisation occurs on opening the app or using Refresh from account, not through live co-editing.

## Run and check

Use Node 24+ for the local SQLite preview. The hosted Worker does not use Node SQLite. Install locked development dependencies and generate the Worker bundle:

```sh
npm ci
npm run build
npm run dev
```

The local preview serves `web/` and applies committed SQL migrations to `.sites-runtime/preview.sqlite` at startup. It uses a fixed fictional preview identity solely in `scripts/dev.mjs`; that script is not bundled into production. The hosting platform supplies the real signed-in identity to the deployed Worker.

`npm run db:generate` generates new schema migrations from `db/schema.ts`. Applied SQL and Drizzle metadata must not be edited; append migrations for subsequent changes. No request handler creates tables. Open `http://localhost:4173` for standalone development. For managed preview use the platform's preview launcher.

```sh
npm test
npm run check
```

Hosted preview is owner-private. `.openai/hosting.json` binds the same Site identity and the D1 binding `DB`. A Worker serves both embedded assets and `/api/workspace` plus `/api/research`; no separate static directory is deployed. The legacy Lovable deployment is not connected to this prototype.

## Evidence integrity

The authenticated same-origin search proxy requests `SRC:MED` records from the Europe PMC REST search API:
https://www.ebi.ac.uk/europepmc/webservices/rest/search

Documentation: https://dev.europepmc.org/RestfulWebService

Europe PMC has a fifteen-second deadline; on first-page failure, discovery without an OA filter falls back to NCBI PubMed ESearch plus ESummary. Backup pagination remains on PubMed, and later primary-page failures do not mix providers. The backup search has genuine bibliographic metadata but no abstracts or confirmed access labels. A separate on-demand original-abstract loader uses PubMed EFetch by a verified numeric PMID. The UI explicitly explains this limitation. An OA filter is never silently replaced with a free-to-read filter. Exact identifier lookups still bypass discovery filters. Both providers have bounded requests. Repeated identical requests share in-flight work and a five-minute, bounded in-memory metadata cache.

All titles, authors, abstracts, identifiers and publication types come from those provider responses. Missing information is shown as missing. There is no paper generator, synthetic fallback, fake DOI, inferred PEDro score or automatic evidence-quality grade. Publication indexing is not clinical appraisal. Publisher access labels are cautious: no indexed open-access indicator does not prove a paywall.

The browser sends bounded JSON to `/api/research` on the same app origin. The authenticated proxy sends research terms to Europe PMC or NCBI without account headers or cookies. Failed requests show an error without a false zero-result count. The executed provider and query appear in the UI and search export. No patient information should be entered. Search supports all/any words, exact phrases, title/abstract or title-only scope, an author field and DOI/PMID/PubMed-link lookups. Exact identifiers bypass discovery filters so they cannot be hidden by date or publication-type settings. A visible query and search-record export make the options inspectable; unrestricted Boolean syntax is not supported. It does not claim comprehensive literature coverage.

For abstracts, formatting tags are removed while comparison symbols and text are retained; all displayed text is escaped. Follow original sources for interpretation and critical appraisal. Records may be incomplete, misclassified or updated by the provider.

The library stores publication metadata and indexed abstracts for personal prototype testing. Before wider/commercial distribution, review provider terms, attribution and abstract reuse/caching requirements. Do not bulk scrape publishers or distribute full text without a suitable licence.

## Privacy and limitations

- No patient database, clinical records, AI calls, paid subscriptions or analytics.
- Account records are scoped by the platform-supplied user ID. The API ignores body owner IDs, validates input and rejects missing identity, mismatched write origins, oversized payloads and stale revisions.
- Local browser storage holds account-specific pending recovery data and the retained original legacy copy. Clearing it can remove changes that have not yet reached the account server. Storage failures are shown.
- Workspaces currently have a 2 MB server limit, up to 500 papers, 1000 appraisals, 1000 reflections and 20 saved searches. Invalid local edits remain exportable; they do not overwrite the server copy.
- Imports are opt-in and combine records, rather than replacing the account. Different notes are combined, different appraisals and reflections become distinct entries with preserved source links, and conflicting collection names are retained in notes. Removed records may return during a merge. There is no automatic last-writer-wins overwrite.
- External paper/resource links open other providers. Google Fonts is the only other external UI resource.
- Teaching and reflection entries must contain no identifiable patient information.
- Intended for private product testing, not patient-specific decision support.
- Separate skeletal and muscle previews now use pinned BodyParts3D / OrganUI assets. Seven source-linked regional drafts are integrated; expert review and device verification remain outstanding.
- This is not a signed native iOS app. The next native phase should package local assets with Capacitor, retain verified-source search, test downloads/storage/external links on iPhone, and use TestFlight after Mac signing and Apple enrolment.

## Historical delivery roadmap (superseded by V1-COMPLETION.md)

1. Test search and known-paper retrieval with students and clinicians; consider a more expressive, transparent search builder based on observed needs.
2. Validate account loading, import/recovery and refreshed cross-device records on physical iPhone/Safari and Mac. Review storage regions, retention, deletion and account export before wider distribution.
3. Add structured appraisal notes and cautiously evaluated source-grounded explanations. Keep claims traceable to actual text and distinguish abstracts from full-text review.
4. Independently review the skeletal/muscle models and regional notes; test physical iPhone GPU performance, software fallback and assistive-technology use.
5. Add individually reviewed clinical resources and validated outcome measures with exact versions, permitted use and scoring tests.
6. Develop FCP teaching packs with objectives, fictional cases, facilitator notes and verified references; define review/version ownership before selling them.
7. Obtain brand clearance, review content/data/provider obligations, decide subscriptions, package iOS and validate TestFlight before App Store submission.

## Relationship to the old app

The old `evidence-physio-pal` code is retained separately as historical source. Its PEDro/Cochrane generation functions and generic assessment scoring must not be imported. No old Supabase credentials, generated database records, Lovable remote URL, payment setup or patient-management functions are used in this prototype.


## Account API and release evidence

`GET /api/workspace` reads only the signed-in owner’s row. `PUT` requires the expected revision; insert/update uses a conditional atomic SQL statement and returns HTTP 409 for a stale revision. The client retains that device version and offers an explicit merge/export choice. Changes queued during a successful write are written in a subsequent revision. Authentication and Site membership remain controlled by the existing private host, not by client-supplied owner fields.

The local preview DB and tests are separate from hosted D1. No preview fixture records are included in the deployment archive. Local tests establish the API/sync logic; hosted identity and D1 provisioning still depend on a successful platform deployment. A pending publication is not proof of hosted end-to-end operation.

## Paper appraisal and linked learning workflow

Open a real publication record or saved paper and choose **Appraise this paper**. The paper is retained in the saved library; appraisal drafts save on input. Record whether the source is unread, abstract-only or full text. Original prompts cover the question, findings, methods/strengths, limitations, applicability, uncertainty and next learning step. They are general educational prompts, not a licensed or validated appraisal instrument and provide no evidence score.

**Create CPD reflection** requires a declared reading basis, reader findings and a next step. It opens a reviewable form with no invented learning time. Saving creates a linked, independent snapshot of the reader’s notes. Existing linked reflections reopen for editing rather than multiplying each time the button is pressed. Both appraisal Markdown exports and CPD exports retain source provenance and reading basis. Workspace backups preserve appraisals.

Appraisals retain paper title, citation and PMID after removing a paper from the saved library. Conflict merges retain both appraisal versions and remap device reflection links to their preserved version. Legacy workspaces load with an empty appraisal list. An old browser attempting to omit existing appraisal data receives a conflict response requiring export/reload. No SQL migration is required: these records use the validated owner-scoped workspace JSON.

## Original indexed abstracts on demand

For a paper without an abstract, open **Read record** and choose **Load original PubMed abstract**. Authenticated `GET /api/paper?pmid=…` retrieves one fixed-endpoint NCBI EFetch record in tagged PubMed/MEDLINE format. It accepts only a numeric PMID, checks the returned PMID and title, reads the AB field and keeps the publisher CI copyright statement separate. Continuation lines are joined without paraphrasing or inventing missing content. The returned MEDLINE representation is displayed as supplied, including NLM’s representation of symbols; no AI summarisation occurs.

A valid record with no AB field produces an explicit no-English-abstract state. Network errors, invalid data and mismatched IDs produce a retryable error and never prove an abstract is absent. Requests have a 12-second upstream deadline, a 512 KB response bound, a five-minute metadata cache and duplicate-request coalescing. No account identity or cookies are sent to NCBI. A retrieved abstract, its source, retrieval time and publisher copyright save with a retained paper and survive exports/imports. User notes and collection assignments are preserved. The account API preserves existing provenance when an older tab sends the same abstract without its newer source fields.

NLM format documentation: https://www.nlm.nih.gov/databases/download/pubmed_medline.html
EFetch return formats: https://www.ncbi.nlm.nih.gov/books/NBK25499/table/chapter4.T._valid_values_of__retmode_and/

This does not fetch publisher full text or establish a reuse licence. The private-prototype text-reuse/provider-terms review remains required before wider distribution.

## Reusable teaching sessions

The FCP workspace now lists account-backed teaching plans. Start blank or use an existing general framework, edit fields and attach papers from the saved library. Default agenda timings scale to valid 5–480 minute sessions; a manually edited agenda is preserved and must be checked against planned duration. Planning a session does not log CPD time.

Each attached source keeps a title/citation/PMID snapshot, a canonical PubMed link, an attachment time, declared reading basis and any indexed retraction warning. Reading basis is initially copied from the latest saved appraisal when available and remains editable as a declaration for this session. Removing a library paper does not remove the session’s reference. Duplicate creates an independent plan. Removing a session leaves papers/appraisals/reflections intact. Markdown exports retain source links and reading labels.

Validated workspace JSON includes up to 200 teaching plans with up to 20 unique papers per plan, subject to the existing 2 MB workspace limit. Backups preserve plans; conflicts retain both complete versions. Old tabs omitting existing plans are rejected rather than silently deleting them. No SQL migration or change of Site audience is needed. No paid curriculum or subscriptions have been activated.

## Source-linked student revision

Learn & anatomy opens **My revision**, with saved study sets and revision cards. A card requires a real saved-paper reference, a reader-authored question and an answer. **Use my appraisal notes** brings the reader’s existing findings/limitations/uncertainty into an editable draft, with no AI-generated facts and no automatic save of the draft. Cards explicitly save; set titles and recall ratings save automatically. Unsaved card edits remain in memory across navigation and trigger a browser unload warning.

Practice hides answers until explicitly revealed, then accepts the reader’s own Again/Recalled rating. A second mode practises only cards last marked Again. Editing a question, answer or source resets its last rating; the historical review count is retained. This is personal recall practice, not answer verification, spaced-repetition scheduling, clinical assessment or automatic CPD time.

Cards retain source citation/PMID, reading-basis snapshot and any retraction flag when the library paper is removed. Markdown exports retain answers, canonical paper links, reading labels and recall ratings. Validated JSON supports up to 100 sets and 100 cards per set, within the existing 2 MB workspace cap. Backups retain sets; conflict merges keep both complete versions. Older tabs omitting existing sets are rejected. No SQL migration or change of audience is needed.

## Personal CPD portfolio and follow-up

My CPD now filters recorded reflections by inclusive activity dates, activity type, free text and whether an outcome is recorded. Totals apply only to selected reflections; planned teaching duration and revision self-ratings are never counted as completed CPD. Reflection entries separately retain the intended next step, a reader-authored observed outcome and an optional review date. The review date does not create a reminder.

The selected portfolio exports as editable Markdown or standalone print-ready HTML. The HTML contains no scripts or external assets, escapes user text, and can be printed or saved to PDF using the browser’s Print option. It is not a native PDF download. Exports include the selected reflection content, canonical linked paper records and an appendix of linked appraisal notes. The appendix explicitly uses current saved notes at export, which may differ from what existed at reflection time; the reflection’s declared reading basis is retained separately. Missing appraisal notes are identified without removing the reflection. No unselected reflections, unrelated appraisals, raw paper abstracts or planned-session content are included.

Portfolio records are personal accounts of learning and self-reported time, not evidence of accreditation, regulatory approval or competence. Follow-up fields are validated, preserved through backups/conflict copies and retained when older tabs resave reflections without the new fields. Invalid earlier review dates are rejected. No SQL migration or access change is needed.

## Home Screen, workspace search and reading preferences

**Home Screen setup:** The app includes a standalone Web App Manifest, a stable start URL, Apple metadata and opaque 180/192/512 px PNG icons derived from the existing S-plus mark. Reading & iPhone setup provides Safari instructions and an official Apple reference. This is a Home Screen web app, not App Store distribution, and has no service worker or offline-account promise. Sign-in, saves and research require a connection; first launch may require signing in again with the same account. PNG assets are embedded and served as actual binary bytes in the Worker. Generated icon files are committed; optional regeneration uses Pillow via `python scripts/create-icons.py`.

**Search my workspace:** Header and Overview shortcuts search the currently loaded owner workspace across papers/notes/abstracts, appraisals, reflections/outcomes, teaching sessions and revision cards. Queries stay on-device and do not call publication services. All words must match, ignoring case/diacritics; title matches sort first. Type filters and bounded result lists show the actual total. Results open the original saved record, clearing conflicting CPD filters and focusing the matching reflection/card when needed. Draft revision/reflection edits are protected before switching. Cross-device freshness still requires account refresh.

**Reading controls:** Text size, comfortable spacing and reduced motion apply immediately and persist in a separate device preference key. System reduced-motion settings remain respected. Reset restores standard preferences. Failed preference storage is reported without affecting account data. These are layout preferences, not claims about a particular medical or learning condition. Browser zoom remains available.

Reference implementation guidance: https://www.w3.org/TR/appmanifest/ and https://webkit.org/blog/13878/
Apple Home Screen instructions: https://support.apple.com/en-gb/guide/iphone/iphea86e5236/27/ios/27

## Skeletal anatomy preview

242 selectable source structures from OrganUI’s BodyParts3D 3.0 model, pinned at `120fc17278559057b37aff516eee89d263b604c6`. The unchanged 5,221,116-byte GLB has SHA-256 `c68b05d97d70c4d33363bf71d9885c191eb25f61a82dbba935a726ddd8e60ac8`, checked at load time. Full attribution, provenance and source notices are served alongside it. Model and derived views are CC BY-SA 2.1 Japan, separate from the MIT Three.js viewer software. Credit: BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan.

The accessible structure list works before downloading 3D. WebGL supports the skeleton, region visibility, selection highlighting, isolation, focus and camera controls. Without WebGL a software SVG view displays one selected structure at a time. Interleaved attributes are unpacked without changing geometry for this renderer. Rendering is event-driven and viewer resources are released on navigation. Research and saved-work actions use source labels; CPD drafts contain source attribution but no invented learning or time.

Educational preview: a single simplified adult male skeleton with selected cartilage and discs. It omits muscles, nerves, ligaments, capsules, articular cartilage, coccyx, teeth and ear ossicles. Source colours are illustrative. Two ambiguous costal cartilage labels remain explicitly source labels. Expert anatomical review and physical iPhone/WebGL QA are outstanding; this is not a complete or clinically validated atlas.

Source mirrors can recover the binary with `npm run anatomy:fetch`; build and test setup also retrieve it if absent and reject incorrect size/hash. This downloads only the fixed, pinned source URL and preserves its attribution notices. The Sites source includes the binary; the GitHub mirror uses this reproducible retrieval path.

## Publication connection recovery

Hosted Europe PMC requests allow 15 seconds (previously 7 seconds), followed by the existing NCBI backup. The browser has a 50-second overall ceiling including a credential-free, no-referrer direct Europe PMC recovery request bounded to 20 seconds. All discovery filters and Europe PMC cursors are preserved. Authentication/input/rate-limit rejections do not trigger direct fallback; failed NCBI pagination never switches provider. Only validated PubMed records are accepted. Loading and failure states offer the same exact search on the official Europe PMC site, without inventing a result count. Server diagnostics log provider host/status/failure category without query text, identity or cookies.

## Account recovery hardening

Delayed account refreshes are serialized and pause outgoing saves. Edits arriving while a refresh is in flight stay pending: an unchanged remote revision allows saving, while a newer account revision requires an explicit recovery choice. Combination also preserves edits that arrive during its read instead of replacing them with an earlier snapshot. Save confirmations must contain the next revision and a valid timestamp before pending recovery data is cleared. New clients include the expected account ID so an account switch cannot save an old tab’s snapshot into another owner’s workspace. Older deployed clients remain compatible. Pending saves and invalid edits now participate in the existing unload warning, though mobile browsers cannot guarantee unload events.

## Research integrity checks

Both hosted and direct search paths validate coherent counts, page size, unique positive PMIDs and exact PMID/DOI matches. Different-paper responses are rejected rather than presented as an exact lookup success. Repeated terminal cursors cannot create endless Load more requests. DOI publisher/citation links encode reserved characters while RIS retains the original DOI value. Indexed abstracts that have not been freshly checked can now be compared with the original PubMed abstract even if search metadata already supplied text; original-detail responses must match the requested PMID, canonical source URL and a nonempty source title.

## Getting started, accessibility and problem reports

Overview includes a dismissible/restorable first-use guide with three saved-record milestones: paper, appraisal and reflection. These are not reading/competency claims. A permanent Getting started action explains source checking, actual CPD time, cross-device refresh, conflict recovery and backups. Guide visibility is a device preference, not an account learning record.

Task buttons are at least 44 px tall; normal controls use 16 px text and secondary/footer text 14 px. Muted text and mobile navigation colours have stronger contrast. Learning tabs now use roving tab stops with Left/Right/Home/End activation; dialogs initially focus their headings; search announcements are concise rather than rereading every abstract. This is an accessibility improvement pass, not a WCAG compliance certification or a screen-reader/physical iPhone sign-off.

Report a problem creates a local preview with user-entered steps, expected behaviour, a manually chosen device, app release, allowlisted page/save status and whether changes are pending. It never automatically adds identity, search terms, saved notes, paper content or full browser fingerprints. Users can copy or download the reviewed report and paste it into the project chat. Reports are not automatically submitted or saved in the account database; a managed support delivery channel is still a future beta decision.

## Beta preparation and recovery completion

See BETA-READINESS.md for launch gates, docs/beta-test-script.md for independent task observation and docs/data-and-support-draft.md for the implementation inventory and unresolved public privacy/support decisions. Beta readiness in the app exposes the same distinction between implementation and independent validation. Site sharing remains owner-private; no testers or support recipients are automatically contacted.

Backup files now validate envelope versions and supported record types, with a 4 MB file allowance and a separate 2 MB canonical workspace limit. This accommodates formatted JSON overhead without widening account storage. Explicit imports preserve current valid pending edits as well as remote/imported data. An invalid device edit can be exported, corrected and explicitly imported; a newer edit arriving during recovery still blocks a stale replacement. Unrelated backup imports do not acknowledge unimported legacy browser records. Unsupported/future content is rejected rather than silently discarded.

The Worker adds CSP limiting executable code to this origin and network requests to existing app/Europe PMC paths, while permitting the existing Google Fonts styles/fonts. Object embedding and unused camera, microphone, location and payment capabilities are disabled. API status, private cache controls and account scoping are preserved. These are defensive controls, not a penetration-test certification.

## Fixed completion scope and first supplied FCP pack

The in-app V1 completion panel now uses stable criteria V1-R/A/S/C/P/F/D/U. The fixed content floor is seven MSK anatomical regions with licensed bones/major-muscle 3D and joint/key-nerve learning; five student units with at least 20 source-linked reviewed questions; and six reviewed FCP teaching packs. Built workflows retain separate final-device/content-review gates. Whole-product recruitment follows completion rather than standing in for unfinished content. Native Apple distribution remains explicit and separate from the web implementation.

The first knee OA source-led pack is a prepared draft with a 30-minute agenda, fictional case, facilitator checkpoints, learner questions, source map and take-home activity. It can be read/exported and copied into an independent editable saved session. The copied source map/version/review limitation persists; changes to the supplied pack do not rewrite personal copies. Planned teaching time does not populate CPD. Clinical review is pending; this is not one of six reviewed packs. See docs/content-review-register.md for source-access and review limitations.

## Six FCP learning drafts

The V1-F library now contains the initial knee OA draft plus five new 30-minute packs: low back pain, shoulder pain, possible inflammatory presentations, diagnostic uncertainty/non-MSK explanations and safety-netting/referral communication. Each has topic-specific objectives, a fictional case, source checkpoints, preparation, agenda and follow-up. The five new packs add 15 unscored learner self-checks with draft facilitator points and source sections. Self-checks carry into the exported pack and the preparation field of saved personal session copies.

Draft/reviewed counts are separate: six source-linked drafts prepared, zero with a recorded completed clinical review. Current source/pathway confirmation and clinical corrections remain required before delivery; V1-F is still incomplete. The HCPC/BESS/BOA/PMC and NICE source-access limitations are recorded in docs/content-review-register.md. No consultation draft is treated as published normative guidance, and the NG12 safety-netting material is explicitly scoped to suspected cancer rather than used as a universal MSK rule.

## Five student starter units

Learn now opens a supplied library covering finding papers, study design, results interpretation, appraisal/uncertainty and anatomy-to-evidence. Each unit has five question/explanation pairs with direct source links and section locations, a real-paper application task and a Markdown export. Explanations are revealed deliberately; no results are scored or marked completed. Fictional numerical examples are labelled.

The personal-revision bridge creates a set plus an editable question-only draft. It requires the learner to choose an actual saved paper and write their own answer before saving a card. Supplied content and resource links never become invented PubMed paper references. Five units / 25 questions are prepared drafts, with zero independent content reviews; V1-S remains open. See docs/student-content-source-map.md for item mappings and source versions.

## Regional anatomy and muscle model

Seven learning regions now connect whole skeletal structures, selected major-muscle meshes, joint/movement notes, 11 key-nerve note cards, original learning tasks and source-preserving Markdown exports. Guides connect to original-paper search, the anatomy-to-evidence student unit and a personal question-only revision draft. No nerve path, ligament, capsule or labrum mesh has been invented.

A separate, unchanged 5,624,592-byte muscle GLB is pinned to OrganUI muscles-3d commit 1c746c36d12a78c5f3fd452dbe5d29ae869cad04, SHA256 615ed2cf0d5ca9aa63f30bb806a65c740ed2ab057463a19505e19eff2bf207ce. It represents 177 groups from 428 source meshes. Paired sides and some heads are combined. It is not aligned as an overlay with the skeletal asset. Runtime verifies checksum/size/catalogue before use; both modes retain independent accessible lists and one-structure software rendering. Skeleton side filters include midline structures. Region groups are teaching selections and use whole meshes, not joint crops.

The model and derived views retain CC BY-SA 2.1 Japan attribution/terms. Model source catalogues, checksum manifest, notices and upstream preparation links are bundled. The original muscle descriptions are not copied. Run npm test to verify/fetch both pinned model binaries in a GitHub source checkout. The Sites repository carries both binaries; the GitHub mirror uses reproducible fetching for binary assets. See docs/anatomy-regional-review.md. All seven guides and representations require independent review; this build does not complete V1-A.

## Tap-to-inspect anatomy reference

The anatomy workbench now keeps selected-structure information with the model: side panel on larger screens and a bounded lower sheet on phone layouts. Origin, insertion, action and nerve supply appear immediately for 46 supplied muscle profiles; 50 skeletal structures map to 25 main bone-family landmark/articulation/attachment profiles. The remaining structures show their catalogue identity and an explicit detailed-content gap. These are draft summaries pending independent review, not a complete atlas or attachment-pin system.

Both the 3D mesh selection and an in-workbench accessible picker update the same panel without a document scroll request. Expand viewer provides a viewport workspace with background inertness, keyboard focus containment, exit/Escape and navigation cleanup. Reference sources and missing-detail states remain available without loading the model. See docs/anatomy-inspector-review.md for the full source map and remaining item list; docs/anatomy-commercial-options.md records the separate vendor-integration assessment.

## Selection repair and anatomy scope clarification

The supplied atlas remains incomplete. All source structures stay available; picker options now distinguish reference notes from missing reference content. The muscle-model notice separates 177 selectable groups, 428 input meshes and the smaller reference-note coverage; none is presented as a complete individual-muscle count. Supported default selections (femur/deltoid) show their notes immediately. Explicit compact-screen selection opens the viewport-contained workbench so the detail panel does not sit below the visible page. Five common scapular/back references (trapezius, latissimus dorsi, levator scapulae and both rhomboids) were added as drafts.

A new Linkedom DOM regression test imports the actual app and drives both registered picker change handlers, all supplied muscle-reference selections, missing entries, hide/reopen, compact-view expansion, bone details and cleanup. This tests application DOM/event behaviour; it is not a WebGL, CSS-layout, real-browser or iPhone pass. V1-A was deliberately expanded following Andrew’s clarification: comprehensive musculoskeletal coverage and per-structure reference content are required, rather than treating a selected-muscle preview as complete.


## Record controls — 27 November 2026

Backups & privacy now provides a separately confirmed clear-all-learning-records action. It requires Account saved, no open drafts and typing CLEAR; it uses the existing same-account optimistic write, keeps a monotonic revision barrier and removes current-device recovery/legacy copies after confirmed success. A stale tab or newer remote save causes conflict instead of silently restoring/deleting records. Full account erasure, other-device cleanup and platform retention are not implemented by this control.

Conflict recovery can export the actual invalid/pending copy, then explicitly discard it and load verified account records without an account write. Failed/mismatched reads preserve recovery copies. Revision-card drafts now receive the same refresh/import protection as CPD forms; replaced dialogs focus their new heading. Account refresh rebuilds the paper map and invalidates delayed abstract requests to avoid retaining removed notes. Save status and destructive buttons have larger readable/touch targets.

BioDigital integration enquiry sent with Andrew’s authorisation; see docs/anatomy-commercial-options.md. No anatomy contract or purchase is implied.


## PDF and Word portfolio exports — 27 November 2026

The CPD portfolio now presents PDF (.pdf) and editable Word (.docx) as its main export actions. Markdown and printable HTML are retained under Additional export formats. Both binary formats are generated entirely in the browser from a captured workspace/filter snapshot and share a section model that retains dates, recorded minutes, reflection/action/outcome, source links, declared reading basis, linked appraisal notes, design, provenance, missing-evidence states and retraction warnings. No conversion service receives learning records.

A self-hosted export bundle and bundled Roboto fonts load only when requested. PDF uses pdfmake 0.3.15; Word uses docx 9.16.1. Software and font notices are included at /export-third-party.txt, regenerated during builds. The downloaded document is a genuine PDF or OOXML DOCX, not HTML renamed with another extension.

Choose a format, wait for preparation, then tap the explicit Save file link. That second tap avoids relying on a popup or an asynchronous download gesture on iPhone. Filenames include a UTC export timestamp. Empty/invalid selections disable the controls; open reflection drafts must be saved or cancelled. Preparation failures offer retry/alternative formats, and account refresh or navigation prevents stale export links being attached to a replaced page. Browser save/open behaviour on Andrew’s physical iPhone remains to be confirmed.


## Research audit and iPhone evidence — 27 November 2026

The PDF/Word deployment was confirmed succeeded. Andrew then supplied real iPhone evidence for reflection creation/account-save acknowledgement, repeat PDF downloads, Word download and opening/layout in Pages. These observations are recorded in docs/device-evidence.md and reflected in the V1 checklist; reload/Mac sync and other device scenarios remain separate open checks.

The live source audit compared four records against NCBI tagged records, checked DOI, paging, combined filters, OA/date filtering, empty results and live PubMed backup under a simulated primary outage. It found that collectiveName author entries were dropped from normalized authorList and therefore RIS exports. Newly retrieved records now preserve group authors; a regression check protects that source shape. Existing previously saved metadata is not silently rewritten. Indexed publication labels and filter omissions are now explained in the interface. See docs/research-audit-2026-11-27.md and its machine-readable before/after reports. npm run audit:research performs an on-demand public-record audit; it is separate from offline npm test.

Recent production logs also exposed Safari’s conventional icon requests returning 404. Both apple-touch-icon aliases now serve the existing 180px PNG and favicon.ico serves the existing SVG with the correct response content type. No new image or user-data operation is introduced.

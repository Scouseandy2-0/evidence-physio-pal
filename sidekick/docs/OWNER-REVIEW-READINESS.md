# PhysioSidekick integrated owner-review build

Release **2026-11-28-owner-review**, prepared 28 November 2026. Publication status is recorded separately by Sites. The preceding recovery/search/mobile release, source 147758b54ac688e1e525ace272c37b7e2f2dd258, was confirmed published successfully before this work.

## What the owner can review together

Overview now has **Review this version**, also available in the footer. It joins the six main review areas and provides one notes export, rather than requiring feedback on each small implementation step. Notes stay in memory during navigation in the current visit; they are not account records and must be downloaded before reload/close. Same-page review links close the dialog correctly.

| V1 area | Implemented developer work | Remaining gate |
|---|---|---|
| Research | Indexed/original-source search, fallback/retry/stop, identity checks, saved papers/searches, exports and prior live audit | Hosted actual-iPhone search failure retest and independent reference-manager RIS import |
| Anatomy | Pinned selectable models, docked references, seven guides and complete named inventory of the 419 imported entries; downloadable CSV | Comprehensive licensed whole-body atlas and per-structure references, named side/head comparison against an independent inventory, expert review and real-device performance |
| Student learning | Five source-checked/versioned draft units and 25 questions; own revision cards/practice/export | Independent content review, actual-device/assistive-technology checks |
| Appraisal | Editable source-linked reasoning, reading basis and PDF/Word exports; connected reflection draft | Content/physical-device review |
| CPD | Explicit time entry, editable records/outcomes/review dates, linked evidence and portfolio exports; historical source warnings retained even after linked library/appraisal removal | Actual iPhone reload/Mac sync, filtered multi-record exports and wording sign-off |
| FCP | Six source-checked/versioned drafts, 18 discussion self-checks, editable saved copies and exports | Independent clinical/local-pathway review before delivery or paid curriculum claims |
| Accounts | Owner-scoped storage, revision checks, pending/conflict/invalid cache recovery, backups and active-record clearing | Real-device scenarios and complete platform/log/backup retention/erasure arrangements |
| Usability/support | Guide, consolidated review notes, local problem reports, native fonts and responsive layouts | VoiceOver/full real-device checks and final public operator/support/privacy/terms decisions |

This table does not mark the fixed V1 complete. It keeps its commitments visible rather than moving the atlas/review requirements to a later version.

## Checks completed in this pass

- **165 automated tests passed**, no failures/skips, with syntax checks and production Worker build passing. Targeted actual-app DOM tests also passed after the same-route review-link fix.
- Student source pass: every one of 25 questions mapped to exact primary-source locations; editions/context clarified. FCP source pass: all six packs checked against cited primary-page sections, NG59 group-programme context corrected, knee self-checks completed. Review state remains pending in both areas. See student-source-check-2026-11-28.md and fcp-source-check-2026-11-28.md.
- Link audit: 21 unique URLs, 19 public sources reachable, one executor PubMed guide timeout and one private internal resource. The source-check pass separately opened the guide; this does not erase the environment-specific timeout observation.
- Named anatomy audit: 242 skeletal entries (50 references, 192 without), 177 muscle groups (46 references, 131 without); six skeletal reference entries explicitly omit full attachment details; zero independent approvals. Source groups/meshes are not individual-side muscle or bone counts.
- Local rendered Chromium journey: exact PMID 31316228 lookup → save → fictional appraisal → reflection with explicitly entered 12 minutes and 2026-11-29 review date → Account saved → reload retaining text/date/time → Word portfolio file ready. No clinical conclusion was authored for the source paper; all user notes were labelled fictional software QA.
- Local teaching journey: current knee draft/source map/self-checks opened, independent editable session created, account save acknowledged and Word file ready.
- Local anatomy: review guide opened Anatomy, muscle selection displayed deltoid origin/insertion/actions/nerve notes immediately. The 5.6 MB asset loaded in this browser's software fallback mode, explicitly reporting one structure at a time. No WebGL/iPhone performance claim is made. Named coverage export was accessible.
- Mobile-layout approximation: 320px iframe, largest app text (20px root), review dialog 260px client/scroll width, notes field 218px, right edge 291px within a 305px document. No horizontal dialog overflow observed. This is not Safari or VoiceOver evidence.
- External font import removed and font/style policy tightened; rendered body uses the native system stack.

Local preview/in-memory fixtures were used. Andrew’s production reflections were not changed/cleared. The temporary layout harness is excluded from source and deployment. BioDigital inbox check still found no reply. No new email, purchase, agreement, public invitation or sharing expansion was made.

## Handover

Use PRIVATE-REVIEW-GUIDE.md for the single review journey and DATA-AND-SUPPORT.md for the implemented data/support facts and unresolved public-launch decisions. TODO.md keeps device/licence/review tasks open. No further review of small individual changes is requested in this build.

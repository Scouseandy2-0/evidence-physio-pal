# Non-anatomy reliability pass — 28 November 2026

Candidate release: `2026-11-28-workspace-polish`. Source and deployment outcome must be confirmed separately. Anatomy is parked by Andrew’s instruction; its full V1 commitment is unchanged.

## Changes

- Explicit Browser trial after an account API 401. Session storage is scoped to the current browser tab. Signed-in outages (503, timeout, malformed account data) do not silently become trials. Private account and legacy device caches are not loaded into a trial or automatically uploaded after sign-in. Existing account saves are unchanged.
- Trial local saves/reload, full-workspace backup/import and explicit clear use the shared validation/revision/recovery flows. Quota and corrupt-storage failures retain work and report failure. Closing a tab, clearing data or changing devices can lose records; export before leaving. Sign-in does not auto-transfer trial data.
- Public same-origin publication search/details requests are allowed without exposing account records. Anonymous search and abstract lookups share a 30-per-minute, per-IP, per-isolate budget; the map is bounded to 1,000 active entries. This is a lightweight local budget, not globally durable abuse prevention. Cross-origin and malformed inputs remain rejected. The account endpoint still returns 401 for anonymous requests.
- Appraisal-to-reflection no longer replaces an unfinished reflection. Current draft is reopened instead.
- HTML portfolio now retains reader-recorded study design, original source links and appraisal warnings. Retraction flags appear directly beside affected reflection text in all portfolio formats, as well as the evidence appendix.
- Anonymous profile no longer claims to be Andrew’s private workspace. Trial status, privacy, onboarding and problem reports identify the correct storage mode. FCP planning copy refers to the current workspace.
- CPD reflection metadata/actions wrap and grid children shrink correctly at enlarged text sizes.

## Verification

- 175 automated tests pass with no failures/skips; syntax checks and production Worker build pass. Trial tests cover save/reload/isolation, no account network writes or automatic migration, quota failure/pending recovery, corrupt data, stale revisions, confirmed clear and authentication-versus-outage distinction. DOM test exercises actual trial start/reflection/save/privacy controls.
- All 10 live research-audit scenarios pass. Four original records retain matching PMID/title/authors/year/DOI/RIS checks, including records with and without an indexed abstract. Paging, exact DOI, author/title/type, date/access, empty results and the simulated-primary-outage/live-NCBI fallback pass. The simulated outage logs a connection failure by design.
- Local rendered Chromium, anonymous mode: explicitly start trial; create fictional reflection with 12 entered minutes and future review date; wait for Trial saved in this tab; reload and explicitly resume trial; same text/time/date remain; Word portfolio reaches File ready.
- Real exact PMID 31316228 search returns the matching title/DOI; saving works in trial. Original PubMed retrieval reports no indexed English abstract with provenance, rather than inventing one. No clinical conclusions or reading claims were authored about that paper.
- Unfinished fictional reflection title survives navigating to an appraisal and selecting Create CPD reflection. Guard returns to the existing draft; it was then cancelled explicitly in the local test setup.
- Current knee draft creates an independent editable teaching plan retaining source/version/review labels; Word export reaches File ready. Planned time does not become CPD time.
- 320px iframe with largest in-app text (20px root): initially found populated CPD-card overflow, 335px scroll versus 305px client. After wrapping/shrinking fix: CPD and research 305/305, privacy/review-date dialogs 260/260. Review date changed to 1 December and displayed correctly. This is Chromium layout evidence, not physical iPhone/Safari or VoiceOver evidence. Temporary harness excluded from source and deployment.

Only fictional local preview/session records were used. Andrew’s hosted learning records were not edited or cleared. No anatomy change, payment, external invitation or message was made. Existing public-link audience was preserved.

## Still open

Independent student/FCP review, actual hosted iPhone/Mac saving and exports, VoiceOver, reference-manager RIS import, final operator/support and platform log/backup retention/erasure arrangements remain open. Full-atlas completion is explicitly parked. This release improves usable workflows; it does not certify the product or claim everything is complete.

## Hosted check

Version 32 was published successfully and the actual public URL was opened without account sign-in. Explicit trial start and exact PMID 31316228 research returned the correct source record. No hosted account records were changed. The final small onboarding wording correction presents anonymous access as “Choose how to save”, rather than an account error; its successor publication is recorded by Sites separately.

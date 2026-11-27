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

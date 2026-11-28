# Next five reliability improvements — 28 November 2026

Candidate release 2026-11-28-reading-reliability. Andrew authorised the next five recommendations. The current non-anatomy V1 scope is unchanged; anatomy is parked.

## Implemented changes

1. **Discoverable learning tabs.** A hint and Earlier/More buttons appear only when the tab row overflows. Buttons scroll the row, not the document or selection. Selection/keyboard navigation reveals the active tab after rerender; resize checks it again. Observers/listeners are disconnected on leaving/replacing the row.
2. **Original abstracts update in place.** Loading/retry/failure/original provenance and abstract text update inside one region with a live status. The record heading, original source links and rest of the article retain their DOM nodes. Retraction warning outside the region is updated without replacing the article. Focus stays within the abstract region if the active control is replaced; user focus elsewhere is not taken.
3. **Paper saves update in place.** Save/remove changes the existing button contents and library count. It does not reconstruct the article or navigation. Existing confirmation before removing saved notes/collection is retained. The save acknowledgement is still governed by WorkspaceSync rather than inferred from a button label.
4. **Best-effort background saving.** On page hidden/pagehide, already queued valid records are offered to the existing flush flow. Invalid recovery copies/conflicts/unqueued forms are not submitted. Duplicate triggers share the existing in-flight request. Acknowledgement still must be verified, and failure leaves a pending recovery snapshot. Browser suspension can prevent completion; this does not promise offline or guaranteed background syncing.
5. **Retained report drafts.** Category, chosen device, description and expected behaviour remain in memory across close/reopen in the current workspace visit. Preview is regenerated from current context. Nothing is automatically uploaded or put in account/browser storage. Reload/workspace reset clears the fields.

## Evidence

- Full 193-test suite passes with no failures/skips; syntax check, production build and diff whitespace check pass. New tests cover tab visibility/bounds/resize/cleanup; queued lifecycle success, failed storage and blocked draft/conflict/recovery submission; in-place abstract success/failure; stable Save/unsave controls with a real mocked account write; and retained report fields without upload.
- Chromium 320px iframe with largest in-app text (20px): More tabs controls reveal Research sources, clicking it leaves it selected and visible after rerender. Tab row scrollLeft 532; document client/scroll width 305/305. This is not physical iPhone/Safari evidence. The reading dialog in this narrow harness was opened by keyboard after the first pointer attempt did not open it; no mobile tap pass is inferred from that step. Other tab controls were exercised by pointer.
- Local live PubMed example PMID 25569281: current indexed record opened, original PubMed abstract retrieval reached Original PubMed abstract loaded in the same paper page, and Save kept DOM focus on the existing button at scrollTop 2348. Waited for Trial saved in this tab. Source display was a software check, not a reading/clinical appraisal claim.
- A fictional report description was typed, its window closed and reopened, and the text remained. No report was sent. No hosted account records were touched.

## Remaining limits

The intermittent actual-iPhone VoiceOver paper-entry report remains open; these updates reduce further reading/focus resets but do not prove its root cause or resolution. Actual cross-device/VoiceOver checks, independent student/FCP review, reference-manager import and final support/retention/erasure arrangements remain open. No anatomy change, external message, payment or audience change was made. Temporary layout harness excluded from source/deployment.

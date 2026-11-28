# Physical-device evidence — 27 November 2026

Andrew explicitly confirmed that his reports and screenshots throughout this conversation were from his iPhone. They are actual-device observations. Desktop/Linkedom/Node checks must not supersede or dismiss reported iPhone defects.

| Observation | Evidence | Conclusion and boundary |
|---|---|---|
| Reflection creation and save acknowledgement | IMG_7252.png / IMG_7253.png, shown at 20:20; reflection “Hello”, learning “Hello test”, action “Test”; Account saved; 1 reflection / 15 recorded minutes | Real iPhone creation/display and app-reported account-save acknowledgement. Independent reload/persistence and Mac sync are not established by these images |
| PDF export and repeat export | physiosidekick-cpd-portfolio-2026-11-27T20-26-15-520Z.pdf and ...20-27-23-293Z.pdf | Both actual iPhone downloads were supplied and text-extracted. Correct reflection, next step, 15 minutes and distinct timestamps retained. Does not verify multi-record filtering, complex evidence appendices or every PDF viewer |
| Word export | physiosidekick-cpd-portfolio-2026-11-27T20-28-18-464Z.docx | Actual iPhone download supplied; OOXML ZIP integrity and content checked. Correct reflection, next step, minutes and export time retained |
| Opening Word export in Pages | IMG_7254.png at 20:30; Andrew identified Pages | Real iPhone opening and visible layout: title, headings, reflection text, spacing and footer intact. Editing/re-saving and Microsoft Word are not yet evidenced |
| Earlier publication connection errors | Earlier iPhone screenshots in the conversation | Confirmed reported defects on the then-current hosted releases. Remain unresolved on iPhone until a successful hosted search/recovery is demonstrated; a source/desktop audit cannot close this |
| Earlier missing anatomy reference details | Andrew’s iPhone reports in the conversation | Confirmed missing-content/interaction reports. Partial inspector work and automated checks do not establish complete atlas/reference coverage or an iPhone fix |

The filenames above identify evidence already supplied in the conversation; copies containing personal notes have not been committed to the repository. The harmless test text quoted here was provided expressly to demonstrate the workflow. No user records were edited/deleted to gather this evidence.

## Next device checks

- Reload the hosted app and confirm the same reflection remains, then load the same account on Mac.
- Export a filtered selection containing several fictional records and a linked appraisal; check that unselected records stay out and the evidence appendix remains complete.
- Test hosted topic/exact research search, source links and original abstracts on iPhone; record failures and recovery separately.
- Test iPhone portrait/landscape anatomy selection, detail panel, load/memory, and VoiceOver.
- Test interrupted account save/conflict recovery in a designated disposable workspace with backups.


## Review-date linking report — 27 November 2026, 20:53

Andrew supplied IMG_7258.png from iPhone and reported that he could not link a due-date CPD follow-up. The screenshot shows portfolio filter controls and 0 of 1 reflections selected. It establishes a real iPhone usability report; it does not establish the hidden record’s exact current date or which filter excluded it. The displayed From/To fields filter learning dates and were not assignment controls.

A direct Set review date action was added, with an all-record picker that remains usable when the current filters hide a reflection. It validates an actual review date, updates only the selected record, selects due/future view as appropriate, and focuses the updated record. Filter labels/empty guidance distinguish assignment from discovery. Date-input width constraints address the visible iPhone overflow risk. Automated and desktop checks pass; a successful retest on Andrew’s iPhone is still open.

## Andrew’s VoiceOver observations — 28 November 2026

- Paragraphs are read when touched. Tabs and the controls Andrew tried are spoken. This establishes those observations, not a complete screen-reader audit.
- Three-finger scrolling moves through the page and announces page positions. Large one-screen increments are expected VoiceOver behaviour; the initial single-finger scrolling report is not treated as a confirmed app scrolling defect.
- Andrew reported that double-tapping a research-paper title returned him to the preceding page. He explicitly confirmed double-tap activation. This remains a reported physical-iPhone defect until the corrected release is retested.
- Developer regression reproduced a possible dismissal path: coordinate-less click on the open dialog was interpreted as an outside tap and closed it. Removed coordinate-based outside-tap dismissal, captured the title button as the explicit return-focus target and clarified dialog semantics. This does not prove the actual iPhone emitted that exact event. Evidence: voiceover-paper-dialog-2026-11-28.md.

## VoiceOver retest failed — 28 November 2026

Andrew reported the dialog correction worked only once across five different papers; the paper-opening defect is therefore reopened, not passed. He also reported scrolling difficulty on an external PubMed page. No successful PubMed/Safari reproduction is recorded, and that separate website is not controlled by PhysioSidekick.

The successor candidate replaces paper popups with native full-page links and explicit return navigation. Desktop/DOM checks do not supersede Andrew’s iPhone observations. Physical-device retest remains open. See paper-pages-2026-11-28.md.

## VoiceOver follow-up clarification — 28 November 2026

Andrew confirmed three-finger scrolling works on PubMed and one-finger right-swipe moves between paragraphs. Those specific external-site navigation checks are now confirmed by his report. He said selecting a title once and then double-tapping anywhere works better, but the occasional backward behaviour remains. When asked to identify the current flow, he said it takes him to “Back to research results”. That establishes the described return control, but does not prove whether the browser actually changed routes or VoiceOver landed on its link.

Successor candidate 2026-11-28-paper-entry moves the return control below the record in loaded/loading/error states and schedules heading focus after layout, skipping stale callbacks or a newly focused control. Regression/browser checks pass; actual iPhone behaviour remains open.

## Owner reports VoiceOver working — 28 November 2026

Andrew’s latest actual-iPhone observation: “iPhone voiceover seems to be working as intended”. Record the reported paper-entry/VoiceOver issue as apparently resolved in his latest use and monitor for recurrence. This is owner-reported evidence, with the qualifier “seems”; no attempt count, complete test protocol or footer release was supplied. The latest published app at this point is version 39, release 2026-11-28-reading-reliability, source 3a501bca5b1a90be3affcef55a441d03fb73b027; the device’s loaded release was not independently captured.

Earlier successful paragraph, tab/control-label and app/PubMed scrolling observations remain valid for the interactions tested. This update supersedes the earlier open-status summaries for the reported issue, but does not certify every screen, VoiceOver interaction, export, account recovery or iPhone/Mac sync scenario. Reopen the issue if backward navigation or activation failures recur.

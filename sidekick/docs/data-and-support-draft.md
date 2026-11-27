# Data, privacy and support preparation — internal draft

This is a factual implementation inventory and a list of unresolved launch details. It is not a final public privacy notice, contract or compliance assessment.

## Current implementation

- Platform sign-in provides an account ID and basic identity to the app. Workspace rows are selected by that identity; clients cannot choose an owner through request bodies.
- The account workspace stores saved publication metadata, user notes/collections, saved searches, appraisals, reflections, teaching plans and revision sets. No patient data is required for the intended learning workflows.
- The browser retains account-specific pending/invalid recovery snapshots and device reading/guide preferences. It does not provide a complete offline account copy. The app warns if recovery storage fails.
- Research queries go through the app to Europe PMC, with NCBI backup. The browser can connect directly to Europe PMC after hosted failure without forwarding account identity/cookies. Services necessarily receive requests from the connecting network.
- Publication metadata/abstract caches have five-minute expiry in memory. Saved publications/abstracts persist as account records until edited/removed. Expired in-memory entries can remain allocated until replacement or process teardown; do not describe this as certified deletion.
- Server diagnostics record publication provider host/status/failure category, not the search text or app identity. Platform access/request logging is a separate supplier matter and has not been fully audited here.
- Fonts load from Google Fonts. External original-paper/resource sites have their own handling and access arrangements.
- Problem reports are generated locally with entered text and minimal app context. Nothing is automatically submitted; users choose whether to copy/download/share. The form warns against private information.
- JSON exports can contain personal learning notes. Import validates the file and previews an explicit merge. Different record versions may be kept and previously removed records may return. Keep original backups intact.
- Individual records can be removed through existing controls. Backups & privacy also offers confirmed clearing of the entire active learning workspace after all saves complete. This writes an empty workspace with a higher revision, preventing stale tabs from silently re-creating records. A newer account save blocks clearing until reviewed again. This device’s account recovery/legacy copies are cleaned after confirmation; blocked storage is disclosed. Other devices, downloaded backups, platform logs and provider backups are outside this control. This is not an account-erasure service or a verified retention/deletion policy.
- Conflict recovery can explicitly discard this device’s pending/invalid changes and load a verified same-account copy. Failed reads preserve the device version; no merge or account write is performed. Drafts must be saved or cancelled before refresh/import/recovery replaces the displayed workspace.

## Must be resolved before inviting a wider audience or charging

- Responsible business/controller identity and a suitable published contact address.
- Actual supplier/service terms, hosting and processing details, platform logs, subprocessors and any applicable arrangements.
- Purpose, data categories, lawful basis, retention periods, rights/contact routes and a practical deletion/recovery policy.
- Public product terms, educational boundaries, copyright attribution, support response expectations and complaint handling.
- A managed support destination and whether feedback is retained, by whom and for how long.
- Consent and records for any recorded beta sessions; ordinary unrecorded task observation can avoid unnecessary personal information.
- Billing/subscription provider, cancellation/refund flow, account closure and the effect on stored learning records.

No personal address, unconfirmed legal entity, automatic support inbox, refund promise or compliance certification has been invented. Keep this draft internal until the unresolved details are established and reviewed.

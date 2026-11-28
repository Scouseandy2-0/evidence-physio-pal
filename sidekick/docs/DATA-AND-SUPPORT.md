# Data and support arrangements — review prototype

Prepared 28 November 2026. This describes the implemented review prototype. It is not final public-launch privacy/terms approval.

## Implemented facts

- Andrew enabled public link access on 28 November 2026 so a friend without ChatGPT can try the product. Anyone with the URL can browse supplied content and public research metadata. Account workspace endpoints still require a signed-in identity, scope database rows to that identity and check revisions before writes.
- Optional Browser trial keeps records and pending recovery copies in sessionStorage in that tab. No trial records are sent to the account database; live research still contacts the app server/providers. Closing the tab or clearing browser data can lose trial work. Export a backup before leaving; later account import is explicit.
- Anonymous publication access requires same-origin browser request metadata and has a shared search/details budget of 30 requests per minute per IP per Worker isolate, with at most 1,000 active budgets. Budgets are temporary in-memory counters, not durable global abuse protection or a promise about platform network logs.
- Active account records are papers/notes/collections, saved searches, appraisals, reflections, teaching plans and revision sets. Planned duration and recall ratings do not automatically log completed CPD.
- Device storage keeps account-specific pending/recovery copies and preferences. Recovery may contain invalid or raw cache text; export it before an explicit discard. It is not automatically transmitted to a support service.
- Workspace backups and PDF/Word/text exports are generated on the device. Downloads are controlled by the browser/Files app; account clearing does not delete downloaded files or copies elsewhere.
- Research queries use the app server to reach Europe PMC/NCBI. The documented browser fallback requests Europe PMC without account cookies or identity. Opening original papers/other resources is subject to those providers' policies.
- The app now uses system fonts rather than Google Fonts. There is no external font request in its stylesheet or font network policy.
- Problem reports and owner review notes are prepared locally, not submitted automatically. Review notes survive navigation during a visit but are not account-saved and must be downloaded before reload/close.
- Review-date fields provide date-based views. No background notification/reminder service is configured.

## Practical support during this product review

Use **Report a problem** to prepare a release/page/save-status report, then copy it into the existing development conversation. For the whole build, use **Review this version** and download one consolidated notes file. No response-time promise, automatically monitored inbox or paid support contract is implied.

## Clearing and erasure boundary

The app's confirmed clear operation replaces active learning records with an empty workspace while retaining revision protection. It does not claim to erase the ChatGPT account, provider logs/backups, another device's stale copy, downloaded exports, or external services. The implementation cannot prove platform-wide retention/deletion periods. A complete public-launch erasure/retention route therefore remains open.

Before wider recruitment or paid use, record the responsible operator/contact, actual hosting/log/backup retention and deletion processes, user request handling, final support channel/expectations and intended-audience terms. Do not infer those supplier facts from a test pass or invent an SLA. `TODO.md` and `V1-COMPLETION.md` keep those decisions open.

## Local navigation diagnostics — 28 November 2026

Problem reports can include the last 20 app page/control/focus events from the current visit. The journal is held only in memory, clears on reload/close and is not automatically submitted, written to the account database or placed in browser storage. It records fixed page/control categories and whether a click carried a pointer count; it does not infer that VoiceOver caused an event. Full URLs, paper identifiers/titles, research queries, account identity and learning notes are excluded from this automatic context. User-written report descriptions still need review for private information before sharing.

## Report drafts and lifecycle saves — 28 November 2026

Report form fields remain only in current-visit memory across close/reopen and clear on reload or workspace reset. They are not uploaded automatically or written to browser/account storage. Page-hidden/pagehide events attempt already queued record saves through the existing sync flow; pending recovery copies remain until verified confirmation. These attempts do not guarantee background completion and do not submit unqueued reflection/card/report forms.

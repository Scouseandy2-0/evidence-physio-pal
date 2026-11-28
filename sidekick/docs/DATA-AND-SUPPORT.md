# Data and support arrangements — private review build

Prepared 28 November 2026. This describes the implemented owner-private prototype. It is not final public-launch privacy/terms approval.

## Implemented facts

- Site access is owner-only. The platform supplies the signed-in identity; the app scopes its workspace database row to that owner and checks revisions before writes.
- Active account records are papers/notes/collections, saved searches, appraisals, reflections, teaching plans and revision sets. Planned duration and recall ratings do not automatically log completed CPD.
- Device storage keeps account-specific pending/recovery copies and preferences. Recovery may contain invalid or raw cache text; export it before an explicit discard. It is not automatically transmitted to a support service.
- Workspace backups and PDF/Word/text exports are generated on the device. Downloads are controlled by the browser/Files app; account clearing does not delete downloaded files or copies elsewhere.
- Research queries use the app server to reach Europe PMC/NCBI. The documented browser fallback requests Europe PMC without account cookies or identity. Opening original papers/other resources is subject to those providers' policies.
- The app now uses system fonts rather than Google Fonts. There is no external font request in its stylesheet or font network policy.
- Problem reports and owner review notes are prepared locally, not submitted automatically. Review notes survive navigation during a visit but are not account-saved and must be downloaded before reload/close.
- Review-date fields provide date-based views. No background notification/reminder service is configured.

## Practical support during this owner review

Use **Report a problem** to prepare a release/page/save-status report, then copy it into the existing development conversation. For the whole build, use **Review this version** and download one consolidated notes file. No response-time promise, automatically monitored inbox or paid support contract is implied.

## Clearing and erasure boundary

The app's confirmed clear operation replaces active learning records with an empty workspace while retaining revision protection. It does not claim to erase the ChatGPT account, provider logs/backups, another device's stale copy, downloaded exports, or external services. The implementation cannot prove platform-wide retention/deletion periods. A complete public-launch erasure/retention route therefore remains open.

Before public/paid use, record the responsible operator/contact, actual hosting/log/backup retention and deletion processes, user request handling, final support channel/expectations and intended-audience terms. Do not infer those supplier facts from a test pass or invent an SLA. `TODO.md` and `V1-COMPLETION.md` keep those decisions open.

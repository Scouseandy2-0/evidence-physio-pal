# PhysioSidekick — private prototype

Working name, pending trademark clearance. Owner: Andrew Lockhart. Started 27 November 2026.

## Product intent

A connected career companion for physiotherapists and students: learning and anatomy, real research, professional practice resources, CPD and a specialist FCP area. The long-term product is deliberately all-in-one; delivery is incremental, with independently useful workflows.

## This version

- Responsive desktop and iPhone layouts with seven working navigation areas.
- Live keyword, exact-phrase, author, DOI and PMID search of Europe PMC's PubMed-indexed records, title/abstract scope, publication/date/access filters and cursor pagination.
- Indexed abstracts, publication-type metadata, retraction warnings when supplied, PubMed records, DOI links and free-full-text links when indexed.
- Saved papers, named collections, notes and citation/RIS exports.
- Up to 20 browser-local saved searches, rerun with their options; downloadable search records with the actual query, run time and reported result count.
- Direct indexed free-full-text links on results, separate text/PDF source choices and institutional-access guidance where free access is unconfirmed.
- Personal CPD reflections with editing and Markdown export.
- Original-source resource shelf, three introductory critical-appraisal learning checks.
- Editable FCP teaching outlines that download as Markdown. These are frameworks, not clinical teaching packs or an accredited curriculum.
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

Hosted preview is owner-private. `.openai/hosting.json` binds the same Site identity and the D1 binding `DB`. A Worker serves both embedded assets and `/api/workspace`; no separate static directory is deployed. The legacy Lovable deployment is not connected to this prototype.

## Evidence integrity

The search requests `SRC:MED` records directly from the Europe PMC REST search API:
https://www.ebi.ac.uk/europepmc/webservices/rest/search

Documentation: https://dev.europepmc.org/RestfulWebService

All titles, authors, abstracts, identifiers and publication types come from that response. Missing information is shown as missing. There is no paper generator, synthetic fallback, fake DOI, inferred PEDro score or automatic evidence-quality grade. Publication indexing is not clinical appraisal. Publisher access labels are cautious: no indexed open-access indicator does not prove a paywall.

The app sends search terms to Europe PMC from the browser, without credentials. No patient information should be entered. Search supports all/any words, exact phrases, title/abstract or title-only scope, an author field and DOI/PMID/PubMed-link lookups. Exact identifiers bypass discovery filters so they cannot be hidden by date or publication-type settings. A visible query and search-record export make the options inspectable; unrestricted Boolean syntax is not supported. It does not claim comprehensive literature coverage.

For abstracts, formatting tags are removed while comparison symbols and text are retained; all displayed text is escaped. Follow original sources for interpretation and critical appraisal. Records may be incomplete, misclassified or updated by the provider.

The library stores publication metadata and indexed abstracts for personal prototype testing. Before wider/commercial distribution, review provider terms, attribution and abstract reuse/caching requirements. Do not bulk scrape publishers or distribute full text without a suitable licence.

## Privacy and limitations

- No patient database, clinical records, AI calls, paid subscriptions or analytics.
- Account records are scoped by the platform-supplied user ID. The API ignores body owner IDs, validates input and rejects missing identity, mismatched write origins, oversized payloads and stale revisions.
- Local browser storage holds account-specific pending recovery data and the retained original legacy copy. Clearing it can remove changes that have not yet reached the account server. Storage failures are shown.
- Workspaces currently have a 2 MB server limit, up to 500 papers, 1000 reflections and 20 saved searches. Invalid local edits remain exportable; they do not overwrite the server copy.
- Imports are opt-in and combine records, rather than replacing the account. Different notes are combined, different reflections become distinct entries, and conflicting collection names are retained in notes. Removed records may return during a merge. There is no automatic last-writer-wins overwrite.
- External paper/resource links open other providers. Google Fonts is the only other external UI resource.
- Teaching and reflection entries must contain no identifiable patient information.
- Intended for private product testing, not patient-specific decision support.
- Integrated 3D anatomy is explicitly not available yet. There is a link to OpenStax; no licence for a commercial anatomy viewer has been assumed.
- This is not a signed native iOS app. The next native phase should package local assets with Capacitor, retain verified-source search, test downloads/storage/external links on iPhone, and use TestFlight after Mac signing and Apple enrolment.

## Delivery roadmap

1. Test search and known-paper retrieval with students and clinicians; consider a more expressive, transparent search builder based on observed needs.
2. Validate account loading, import/recovery and refreshed cross-device records on physical iPhone/Safari and Mac. Review storage regions, retention, deletion and account export before wider distribution.
3. Add structured appraisal notes and cautiously evaluated source-grounded explanations. Keep claims traceable to actual text and distinguish abstracts from full-text review.
4. Select and license accurate 3D anatomy. Evaluate usability, offline assets and mobile GPU performance before committing.
5. Add individually reviewed clinical resources and validated outcome measures with exact versions, permitted use and scoring tests.
6. Develop FCP teaching packs with objectives, fictional cases, facilitator notes and verified references; define review/version ownership before selling them.
7. Obtain brand clearance, review content/data/provider obligations, decide subscriptions, package iOS and validate TestFlight before App Store submission.

## Relationship to the old app

The old `evidence-physio-pal` code is retained separately as historical source. Its PEDro/Cochrane generation functions and generic assessment scoring must not be imported. No old Supabase credentials, generated database records, Lovable remote URL, payment setup or patient-management functions are used in this prototype.


## Account API and release evidence

`GET /api/workspace` reads only the signed-in owner’s row. `PUT` requires the expected revision; insert/update uses a conditional atomic SQL statement and returns HTTP 409 for a stale revision. The client retains that device version and offers an explicit merge/export choice. Changes queued during a successful write are written in a subsequent revision. Authentication and Site membership remain controlled by the existing private host, not by client-supplied owner fields.

The local preview DB and tests are separate from hosted D1. No preview fixture records are included in the deployment archive. Local tests establish the API/sync logic; hosted identity and D1 provisioning still depend on a successful platform deployment. A pending publication is not proof of hosted end-to-end operation.

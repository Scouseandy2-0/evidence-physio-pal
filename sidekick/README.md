# PhysioSidekick — private prototype

Working name, pending trademark clearance. Owner: Andrew Lockhart. Started 27 November 2026.

## Product intent

A connected career companion for physiotherapists and students: learning and anatomy, real research, professional practice resources, CPD and a specialist FCP area. The long-term product is deliberately all-in-one; delivery is incremental, with independently useful workflows.

## This version

- Responsive desktop and iPhone layouts with seven working navigation areas.
- Live keyword/DOI search of Europe PMC's PubMed-indexed records, publication/date/access filters and cursor pagination.
- Indexed abstracts, publication-type metadata, retraction warnings when supplied, PubMed records, DOI links and free-full-text links when indexed.
- Saved papers, named collections, notes and citation/RIS exports.
- Personal CPD reflections with editing and Markdown export.
- Original-source resource shelf, three introductory critical-appraisal learning checks.
- Editable FCP teaching outlines that download as Markdown. These are frameworks, not clinical teaching packs or an accredited curriculum.
- Workspace JSON export. Saved data remains on the browser/device; import and account sync are not implemented.

## Run and check

No runtime dependencies or build step. Serve `dist/` with a static HTTP server; for example:

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. Opening index.html as a file is not supported (ES modules).

```sh
npm test
npm run check
```

Hosted preview is owner-private. `.openai/hosting.json` binds its source and static directory. The legacy Lovable deployment is not connected to this prototype.

## Evidence integrity

The search requests `SRC:MED` records directly from the Europe PMC REST search API:
https://www.ebi.ac.uk/europepmc/webservices/rest/search

Documentation: https://dev.europepmc.org/RestfulWebService

All titles, authors, abstracts, identifiers and publication types come from that response. Missing information is shown as missing. There is no paper generator, synthetic fallback, fake DOI, inferred PEDro score or automatic evidence-quality grade. Publication indexing is not clinical appraisal. Publisher access labels are cautious: no indexed open-access indicator does not prove a paywall.

The app sends search terms to Europe PMC from the browser, without credentials. No patient information should be entered. Search currently supports simple keyword intersection and exact DOI lookups, not Boolean or systematic-review search syntax. It does not claim comprehensive literature coverage.

For abstracts, formatting tags are removed while comparison symbols and text are retained; all displayed text is escaped. Follow original sources for interpretation and critical appraisal. Records may be incomplete, misclassified or updated by the provider.

The library stores publication metadata and indexed abstracts for personal prototype testing. Before wider/commercial distribution, review provider terms, attribution and abstract reuse/caching requirements. Do not bulk scrape publishers or distribute full text without a suitable licence.

## Privacy and limitations

- No patient database, clinical records, AI calls, paid subscriptions or analytics.
- Local browser storage is neither an account backup nor cross-device sync; clearing browser data removes it. Storage failures are shown.
- External paper/resource links open other providers. Google Fonts is the only other external UI resource.
- Teaching and reflection entries must contain no identifiable patient information.
- Intended for private product testing, not patient-specific decision support.
- Integrated 3D anatomy is explicitly not available yet. There is a link to OpenStax; no licence for a commercial anatomy viewer has been assumed.
- This is not a signed native iOS app. The next native phase should package local assets with Capacitor, retain verified-source search, test downloads/storage/external links on iPhone, and use TestFlight after Mac signing and Apple enrolment.

## Delivery roadmap

1. Improve search with phrases, author fields and a transparent advanced query builder; test known-paper retrieval with students and clinicians.
2. Add validated workspace import, durable owner accounts and cross-device collections/reflections; migrate browser data only with an explicit import flow.
3. Add structured appraisal notes and cautiously evaluated source-grounded explanations. Keep claims traceable to actual text and distinguish abstracts from full-text review.
4. Select and license accurate 3D anatomy. Evaluate usability, offline assets and mobile GPU performance before committing.
5. Add individually reviewed clinical resources and validated outcome measures with exact versions, permitted use and scoring tests.
6. Develop FCP teaching packs with objectives, fictional cases, facilitator notes and verified references; define review/version ownership before selling them.
7. Obtain brand clearance, review content/data/provider obligations, decide subscriptions, package iOS and validate TestFlight before App Store submission.

## Relationship to the old app

The old `evidence-physio-pal` code is retained separately as historical source. Its PEDro/Cochrane generation functions and generic assessment scoring must not be imported. No old Supabase credentials, generated database records, Lovable remote URL, payment setup or patient-management functions are used in this prototype.

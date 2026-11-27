# Model provenance and preparation

## Exact source and terms

The runtime model is a curated subset of **BodyParts3D 3.0** (release 20110915, `BodyParts3D_3.0_obj_95`). The meshes were taken on **2026-10-16** from the binary STL conversions published in [Kevin-Mattheus-Moerman/BodyParts3D](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D) at commit [`f0eeb6e`](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D/tree/f0eeb6e843380cfe6b83797cf8c3e1af74de5e61), which converted the official OBJ release to STL without changing geometry and names each file by its FMA concept.

That copy states the data license as **Creative Commons Attribution-Share Alike 2.1 Japan**, the license BodyParts3D originally carried. A snapshot of its license text is preserved in [model-source/mirror-LICENSE_content.txt](model-source/mirror-LICENSE_content.txt) (SHA-256 `0e26340c8fadac4a0478d23dd12f4cb20b4043c436d0ab95eacb062391a7ec84`). Required credit:

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan.

`public/models/skeleton.glb` is an adaptation of that data and is distributed under the same CC BY-SA 2.1 Japan license. The MIT code license does not cover the model or its screenshots.

### Why this differs from some other explorers

The heart, brain, liver and kidney explorers use BodyParts3D 4.0 downloaded directly from the [official DBCLS archive](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html), whose current license page grants CC BY 4.0. The environment this explorer was built in could not reach that archive, so, like the lungs, spleen, bladder and other recent explorers, it uses a GitHub copy and the CC BY-SA 2.1 Japan terms attached to that copy. The 3.0 STL copy was chosen over the 4.3 OBJ copy because it has one file per bone for the whole skeleton under stable FMA names. Re-preparing the same concepts from the official archive would let the model move to CC BY 4.0; that would be a model change to review, not a relabelling.

Authoritative sources:

- [Official archive download page](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) and [license page](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)
- [STL copy used](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D)
- Mitsuhashi et al. (2009), [doi:10.1093/nar/gkn613](https://doi.org/10.1093/nar/gkn613)

## What the source contains

242 structures, each one source file. Every row (FMA ID, source label, display name, region, source and runtime triangle counts) is in [selected-parts.tsv](model-source/selected-parts.tsv); the preparation script refuses to run if a structure's source label in the parts list differs from the one in `src/anatomy.ts`.

| Region           | Structures | Includes                                                                                                         |
| ---------------- | ---------: | ---------------------------------------------------------------------------------------------------------------- |
| Skull            |         23 | 8 cranial bones, 14 facial bones including the mandible, hyoid                                                   |
| Vertebral column |         48 | C1–L5 (24 vertebrae), sacrum, 23 intervertebral discs (C2–C3 to L5–S1)                                           |
| Thorax           |         43 | manubrium, body and xiphoid of the sternum, 24 ribs, 16 costal cartilages                                        |
| Upper limbs      |     2 × 32 | clavicle, scapula, humerus, radius, ulna, 8 carpals, 5 metacarpals, 14 phalanges                                 |
| Pelvis           |          2 | right and left hip bones                                                                                         |
| Lower limbs      |     2 × 31 | femur, patella, tibia, fibula, 7 tarsals, 5 metatarsals, 14 phalanges, the sesamoids of the foot (one mesh)      |

Gaps and labelling notes:

- The source has no coccyx, teeth or ear-ossicle meshes in this release, so they are not shown. The skull is the source's separate bones; sutures are gaps between meshes.
- Each hip bone is one mesh (ilium, ischium and pubis are not separate). The sesamoid bones of each foot are one mesh.
- The source names each intervertebral disc after the vertebra above it ("intervertebral disk of axis" is C2–C3). Display names use both levels.
- `BP24` / `BP28` are labelled only "left/right costal cartilage". They lie below the seventh costal cartilage and are displayed as the lower (8th–10th) costal cartilages; that reading is inferred from position.
- The model is a single adult male reference in the source's standing pose, not a patient-specific or universal anatomy.

## Simplification

The selected source meshes total 2,135,400 triangles (about 103 MB of STL), and their density varies widely: a rib has about 44,000 triangles, a femur about 13,000. Each mesh is simplified with [meshoptimizer](https://github.com/zeux/meshoptimizer) 1.3.0 to a budget of 12 triangles per millimetre of its bounding-box diagonal, at least 400 and never more than the source, with a maximum error of 1% of the mesh's own extent. The simplifier only collapses edges along the existing surface; it adds no geometry. The runtime has 277,228 triangles. A full-resolution build was compared side by side in the browser at the skull view and was visually equivalent at the explorer's framing. The parameters and per-structure runtime counts are in [manifest.json](../public/models/manifest.json).

## Reproduce the runtime asset

The 5.2 MB `public/models/skeleton.glb` is included in the checkout. Ordinary setup does not download any source files. To regenerate it:

```sh
bun install --frozen-lockfile
bun run prepare:model
bun run verify:model
```

The script downloads the 243 pinned files in [model-inputs.json](../scripts/model-inputs.json) (about 103 MB) into the ignored `.asset-cache/` only when they are absent, and checks every SHA-256 **before** conversion. URLs are pinned to the mirror commit, and the content hash stops preparation if any file differs.

Steps:

1. Read the parts list and check each structure's source label.
2. Read each binary STL, check its size against its triangle count, and weld vertices that share an exact position so the mesh is indexed.
3. Simplify each mesh as described above and drop unused vertices.
4. Center the whole selection on its source bounding box; transform `(x,y,z)` to `(x,z,-y)` and multiply by `0.0025`. This is a display scale, not a measurement calibration. The exact center and bounds are in the manifest.
5. Recompute vertex normals and assign illustrative colors (ivory for bone, grey-blue for cartilage and discs).
6. Store the stable structure ID and FMA ID on each GLB node, export GLB, and write the input/output manifest.

The output is deterministic: rerunning the script reproduces the same GLB checksum. `bun run verify:model` decodes the runtime, verifies its checksum, checks every structure/FMA pair, ensures geometry is finite and indices are valid, and reports the geometry counts.

## Anatomy text and review

Descriptions are original concise summaries based on the US National Cancer Institute's [SEER Training skeletal system pages](https://training.seer.cancer.gov/anatomy/skeletal/) and standard descriptions of each bone, written on 2026-10-16. No third-party text or illustrations are redistributed.

Completed: source label checks, geometry inspection in the browser, and interface checks. **Not completed: review by a clinical anatomy expert.** The app, README and model dialog say so. This is an educational interface demonstration, not a diagnostic, treatment or measurement tool.


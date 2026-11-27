# PhysioSidekick anatomy coverage

Prepared 27 November 2026. Independent anatomical review pending.

Two separate pinned BodyParts3D 3.0 / OrganUI assets: the skeleton has 242 source structures (bones, selected cartilage and discs); the muscle model has 177 selectable groups from 428 source meshes. These are not counts of individual bones or individual-side muscles. Whole source structures are retained. Regional guides are learning selections, not exact anatomical containment or joint crops. A muscle may appear in more than one guide.

## Seven regional guides

| Region | Skeletal source structures | Muscle source groups | Key nerve notes | Independent review |
|---|---:|---:|---|---|
| Shoulder | 6 | 6 | Axillary nerve; Suprascapular nerve | Pending |
| Elbow | 6 | 7 | Musculocutaneous nerve; Radial nerve; Ulnar nerve | Pending |
| Wrist & hand | 58 | 11 | Median nerve; Ulnar nerve; Radial nerve | Pending |
| Hip | 5 | 9 | Femoral nerve; Obturator nerve; Sciatic nerve | Pending |
| Knee | 8 | 9 | Femoral nerve; Sciatic nerve; Tibial and common fibular nerves | Pending |
| Ankle & foot | 56 | 9 | Tibial and common fibular nerves; Femoral nerve | Pending |
| Spine | 48 | 9 | Spinal roots and rami | Pending |

## Important model boundaries

The skeletal asset cannot display muscles. The separate muscle asset omits bones; paired sides and some heads are combined and selected together. Both models are adult male references, simplified for web use. They have independent transforms and are not an anatomically registered overlay. Source colours are illustrative. No motion, contraction or loading is simulated.

Nerve coverage is navigable source-linked text, with no nerve mesh or 3D nerve path. Ligaments, capsules, labra and articular cartilage are not rendered. The skeleton omits the coccyx, teeth and ear ossicles. The muscle asset omits most tendons and some muscles; see its full provenance notice. A missing structure does not mean it is absent from the body. There is no patient-specific geometry, validated measurement, symptom-to-diagnosis tool or competence assessment.

## Exact model sources and terms

- Skeleton: https://github.com/organui/skeleton-3d/tree/120fc17278559057b37aff516eee89d263b604c6
- Muscles: https://github.com/organui/muscles-3d/tree/1c746c36d12a78c5f3fd452dbe5d29ae869cad04
- Model data and derived views: https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en
- Required credit: BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan.

The model geometry is unchanged from these pinned assets. PhysioSidekick adds selection, regional groupings, accessible lists and original learning notes. No anatomical mesh was generated. Hash checks and ID mappings verify the imported files; they do not constitute expert review.

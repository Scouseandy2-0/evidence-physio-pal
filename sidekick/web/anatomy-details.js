import {anatomySystems} from './anatomy.js';
const ncbi=(title,id,location='Muscles; Nerves')=>({title:`StatPearls · ${title}`,url:`https://www.ncbi.nlm.nih.gov/sites/books/${id}/`,location,locatedAt:'2026-11-27'});
const os=(title,page,location)=>({title:`OpenStax A&P 2e · ${title}`,url:`https://openstax.org/books/anatomy-and-physiology-2e/pages/${page}`,location,locatedAt:'2026-11-27'});
export const detailSources={
 cuff:ncbi('Rotator cuff','NBK441844'),shoulder:ncbi('Shoulder','NBK536933'),upper:ncbi('Shoulder and upper-limb muscles','NBK482410'),forearm:ncbi('Forearm muscles','NBK536975'),
 hip:ncbi('Hip','NBK526019'),minimus:ncbi('Gluteus minimus','NBK556144','Structure and Function; Nerves'),thigh:ncbi('Thigh muscles','NBK482445','Anterior compartment; quadriceps'),hamstrings:ncbi('Hamstring muscle','NBK546688','Structure and Function table; Nerves'),
 anterior:ncbi('Leg anterior compartment','NBK539725','Structure and Function; Nerves'),tibial:ncbi('Tibial nerve','NBK537028','Muscles: posterior leg'),back:ncbi('Back muscles','NBK537074','Muscles: transversospinalis group; Nerves'),
 ql:ncbi('Quadratus lumborum','NBK535407','Structure and Function; Nerves'),
 girdle:os('Pectoral girdle','8-1-the-pectoral-girdle','Clavicle; Scapula'),upperBones:os('Upper-limb bones','8-2-bones-of-the-upper-limb','Named bone sections'),pelvis:os('Pelvic girdle','8-3-the-pelvic-girdle-and-pelvis','Hip Bone'),lowerBones:os('Lower-limb bones','8-4-bones-of-the-lower-limb','Named bone sections'),
 upperActions:os('Upper-limb muscles','11-5-muscles-of-the-pectoral-girdle-and-upper-limbs','Forearm/wrist muscle tables'),
 talus:ncbi('Foot talus','NBK541086','Introduction; Muscles'),
 wristExtensors:ncbi('Wrist extensor muscles','NBK534805','Structure and Function; Muscles'),
};
const m=(origin,insertion,action,innervation,source)=>({fields:[['Origin',origin],['Insertion',insertion],['Actions',action],['Nerve supply',innervation]],source});
// Concise original factual reference notes. No source figures or assessment items copied.
export const muscleDetails={
 'supraspinatus':m('Scapular supraspinous fossa.','Superior greater humeral tubercle.','Contributes to shoulder abduction and joint stability.','Suprascapular nerve.','cuff'),
 'infraspinatus':m('Scapular infraspinous fossa.','Greater humeral tubercle, below supraspinatus.','Shoulder external rotation and stabilisation.','Suprascapular nerve.','cuff'),
 'teres-minor':m('Lateral scapular border.','Greater humeral tubercle, below infraspinatus.','Shoulder external rotation and stabilisation.','Axillary nerve.','cuff'),
 'subscapularis':m('Subscapular fossa.','Lesser humeral tubercle.','Shoulder internal rotation and stabilisation.','Upper and lower subscapular nerves.','cuff'),
 'deltoid':m('Lateral clavicle, acromion and scapular spine.','Humeral deltoid tuberosity.','Abduction; anterior fibres assist flexion/internal rotation, posterior fibres extension/external rotation.','Axillary nerve.','shoulder'),
 'teres-major':m('Posterior inferior angle of scapula.','Medial lip of humeral intertubercular groove.','Shoulder adduction and internal rotation.','Lower subscapular nerve.','shoulder'),
 'biceps-brachii':m('Long head: supraglenoid region; short head: coracoid process.','Radial tuberosity and bicipital aponeurosis.','Elbow flexion and forearm supination.','Musculocutaneous nerve.','shoulder'),
 'coracobrachialis':m('Scapular coracoid process.','Medial humeral shaft.','Shoulder flexion and adduction.','Musculocutaneous nerve.','shoulder'),
 'brachialis':m('Anterior distal humerus.','Ulnar tuberosity and coronoid process.','Elbow flexion.','Musculocutaneous nerve.','upper'),
 'triceps-brachii':m('Long head: infraglenoid region; other heads: posterior humerus.','Olecranon of ulna.','Elbow extension; long head also crosses shoulder.','Radial nerve.','upper'),
 'flexor-carpi-radialis':m('Medial humeral epicondyle.','Base of second metacarpal, with attachment toward third.','Wrist flexion and radial deviation.','Median nerve.','forearm'),
 'flexor-carpi-ulnaris':m('Medial epicondyle and proximal ulna.','Pisiform; ligamentous continuation to hamate and fifth metacarpal.','Wrist flexion and ulnar deviation.','Ulnar nerve.','upperActions'),
 'flexor-digitorum-superficialis':m('Medial epicondyle, coronoid region and anterior radius.','Middle phalanges of fingers 2–5.','Finger proximal interphalangeal flexion; assists other flexion.','Median nerve.','upperActions'),
 'flexor-digitorum-profundus':m('Proximal ulna and interosseous membrane.','Distal phalanges of fingers 2–5.','Distal interphalangeal flexion.','Median/anterior interosseous supply laterally; ulnar supply medially.','forearm'),
 'flexor-pollicis-longus':m('Anterior radius and interosseous membrane.','Distal phalanx of thumb.','Thumb interphalangeal flexion.','Anterior interosseous branch of median nerve.','forearm'),
 'pronator-quadratus':m('Distal anterior ulna.','Distal anterior radius.','Forearm pronation.','Anterior interosseous branch of median nerve.','forearm'),
 'extensor-carpi-radialis-longus':m('Lateral humeral supracondylar ridge.','Dorsal base of second metacarpal.','Wrist extension and radial deviation.','Radial nerve.','upper'),
 'extensor-carpi-radialis-brevis':m('Lateral humeral epicondyle.','Dorsal base of third metacarpal.','Wrist extension and radial deviation.','Deep branch of radial nerve.','upper'),
 'extensor-carpi-ulnaris':m('Lateral epicondyle and posterior ulna.','Base of fifth metacarpal.','Wrist extension and ulnar deviation.','Posterior interosseous nerve.','upper'),
 'extensor-digitorum':m('Lateral humeral epicondyle.','Extensor expansions of fingers 2–5.','Finger extension, principally at metacarpophalangeal joints.','Posterior interosseous nerve.','upper'),
 'gluteus-maximus':m('Posterior ilium and dorsal sacrum; adjacent fascia/ligament.','Iliotibial tract and gluteal tuberosity.','Hip extension and external rotation.','Inferior gluteal nerve.','hip'),
 'gluteus-medius':m('Lateral ilium between anterior and posterior gluteal lines.','Greater trochanter.','Hip abduction and pelvic control.','Superior gluteal nerve.','hip'),
 'gluteus-minimus':m('Lateral ilium between anterior and inferior gluteal lines.','Anterior greater trochanter.','Hip abduction, stabilisation and some internal rotation.','Superior gluteal nerve.','minimus'),
 'piriformis':m('Anterior sacrum.','Superior greater trochanter.','Hip external rotation; action varies with position.','Nerve to piriformis.','hip'),
 'iliacus':m('Iliac fossa.','Lesser trochanter with iliopsoas tendon.','Hip flexion.','Femoral nerve.','hip'),
 'psoas-major':m('Lumbar vertebral bodies/discs and transverse processes.','Lesser trochanter with iliopsoas tendon.','Hip flexion.','Direct branches from lumbar anterior rami.','hip'),
 'rectus-femoris':m('Anterior inferior iliac spine and region above acetabulum.','Patella via quadriceps tendon; tibial tuberosity via patellar ligament.','Knee extension and hip flexion.','Femoral nerve.','thigh'),
 'vastus-lateralis':m('Greater trochanter and lateral linea aspera region.','Patella via quadriceps tendon; tibia via patellar ligament.','Knee extension.','Femoral nerve.','thigh'),
 'vastus-medialis':m('Intertrochanteric line and medial linea aspera region.','Patella via quadriceps tendon; tibia via patellar ligament.','Knee extension.','Femoral nerve.','thigh'),
 'vastus-intermedius':m('Anterior/lateral femoral shaft.','Patella via quadriceps tendon; tibia via patellar ligament.','Knee extension.','Femoral nerve.','thigh'),
 'biceps-femoris':m('Long head: ischial tuberosity; short head: lateral linea aspera/supracondylar region.','Fibular head.','Knee flexion; long head also extends hip.','Sciatic tibial division for long head; common fibular division for short head.','hamstrings'),
 'semitendinosus':m('Ischial tuberosity.','Proximal medial tibia at pes anserinus.','Knee flexion and hip extension.','Tibial division of sciatic nerve.','hamstrings'),
 'semimembranosus':m('Ischial tuberosity.','Posteromedial tibial condyle.','Knee flexion and hip extension.','Tibial division of sciatic nerve.','hamstrings'),
 'tibialis-anterior':m('Lateral proximal tibia and interosseous membrane.','Medial cuneiform and first metatarsal base.','Ankle dorsiflexion and foot inversion.','Deep fibular nerve.','anterior'),
 'extensor-hallucis-longus':m('Anterior middle fibula and interosseous membrane.','Distal phalanx of great toe.','Great-toe extension; assists dorsiflexion.','Deep fibular nerve.','anterior'),
 'extensor-digitorum-longus':m('Lateral tibial condyle, anterior fibula and interosseous membrane.','Dorsal expansions of toes 2–5.','Toe extension and dorsiflexion.','Deep fibular nerve.','anterior'),
 'fibularis-tertius':m('Distal anterior fibula and interosseous membrane.','Dorsal fifth metatarsal base.','Assists dorsiflexion and eversion.','Deep fibular nerve.','anterior'),
 'gastrocnemius':m('Posterior medial and lateral femoral condylar regions.','Posterior calcaneus through calcaneal tendon.','Ankle plantarflexion and knee flexion.','Tibial nerve.','tibial'),
 'soleus':m('Posterior proximal fibula and tibial soleal line.','Posterior calcaneus through calcaneal tendon.','Ankle plantarflexion.','Tibial nerve.','tibial'),
 'multifidus':m('Sacrum/ilium and vertebral processes; attachments vary by region.','Spinous processes several levels above.','Spinal extension and segmental control.','Medial branches of spinal dorsal rami.','back'),
 'quadratus-lumborum':m('Iliac crest and iliolumbar ligament.','Twelfth rib and L1–L4 transverse processes.','Trunk side-bending and control; fixes twelfth rib.','Subcostal and lumbar anterior-ramus branches.','ql'),
};
const b=(landmarks,articulations,attachments,source)=>({fields:[['Key landmarks',landmarks],['Articulations',articulations],['Selected attachments',attachments]],source});
export const boneDetails={
 'clavicle':b('Sternal end; acromial end.','Manubrium and scapular acromion.','Deltoid on lateral clavicle.','girdle'),
 'scapula':b('Spine, acromion, coracoid and glenoid.','Humerus and clavicle.','Rotator cuff and deltoid.','girdle'),
 'humerus':b('Head, tubercles, deltoid tuberosity and distal epicondyles.','Scapula, radius and ulna.','Deltoid tuberosity; cuff at tubercles.','upperBones'),
 'radius':b('Head, tuberosity and distal styloid.','Humerus, ulna, scaphoid and lunate.','Biceps at radial tuberosity.','upperBones'),
 'ulna':b('Olecranon, coronoid and trochlear notch.','Humerus and radius.','Triceps at olecranon; brachialis proximally.','upperBones'),
 'scaphoid':b('Proximal row, radial side; tubercle.','Radius and adjacent carpals.','See source for attachment detail.','upperBones'),
 'lunate':b('Proximal row, centrally.','Radius and capitate, among others.','See source for attachment detail.','upperBones'),
 'triquetral':b('Proximal row, ulnar side.','Pisiform and neighbouring carpals.','See source for attachment detail.','upperBones'),
 'pisiform':b('Sesamoid within flexor carpi ulnaris tendon.','Triquetrum.','Flexor carpi ulnaris.','upperBones'),
 'trapezium':b('Distal row, radial side.','Thumb metacarpal at saddle joint.','See source for attachment detail.','upperBones'),
 'trapezoid':b('Distal carpal row.','Second metacarpal, among others.','See source for attachment detail.','upperBones'),
 'capitate':b('Central distal carpal row.','Third metacarpal, among others.','See source for attachment detail.','upperBones'),
 'hamate':b('Hook on palmar surface.','Fourth/fifth metacarpals, among others.','See source for attachment detail.','upperBones'),
 'hip bone':b('Acetabulum, iliac crest and ischial tuberosity.','Femur, sacrum and opposite pubis.','Gluteal and hamstring origins.','pelvis'),
 'femur':b('Head, neck, trochanters and condyles.','Hip bone, tibia and patella.','Gluteal, quadriceps and adductor attachments.','lowerBones'),
 'patella':b('Base, apex and articular surface.','Femur; does not articulate with tibia.','Quadriceps tendon and patellar ligament.','lowerBones'),
 'tibia':b('Plateau, tuberosity, soleal line and medial malleolus.','Femur, fibula and talus.','Patellar ligament at tibial tuberosity.','lowerBones'),
 'fibula':b('Head and lateral malleolus.','Tibia and talus; no femoral articulation.','Biceps femoris at fibular head.','lowerBones'),
 'talus':b('Body, neck and head.','Tibia, fibula, calcaneus and navicular.','No direct muscular attachment.','lowerBones'),
 'calcaneus':b('Posterior tuberosity and sustentaculum tali.','Talus and cuboid.','Calf muscles through calcaneal tendon.','lowerBones'),
 'navicular':b('Medial-foot tuberosity.','Talus and cuneiforms.','Tibialis posterior at tuberosity.','lowerBones'),
 'cuboid':b('Lateral-foot bone; plantar tendon groove.','Calcaneus and lateral metatarsals.','Full attachment list not supplied.','lowerBones'),
 'medial cuneiform':b('Medial distal tarsal row.','Navicular and first metatarsal.','Tibialis anterior.','lowerBones'),
 'intermediate cuneiform':b('Middle distal tarsal row.','Navicular and second metatarsal.','Full attachment list not supplied.','lowerBones'),
 'lateral cuneiform':b('Lateral distal tarsal row.','Navicular and third metatarsal.','Full attachment list not supplied.','lowerBones'),
};
export const detailReview={version:'2026-11-27.1',state:'pending',reviewer:'',reviewedAt:''};
export function boneDetailKey(name){
 if(name==='navicular bone of right foot'||name==='navicular bone of left foot')return 'navicular';
 const key=name.replace(/^(left|right)\s+/i,'');return boneDetails[key]?key:key.replace(/ bone$/,'');
}
export function structureDetails(system,id){
 const config=anatomySystems[system],s=config?.catalog.find(s=>s.id===id);if(!s)return null;
 const key=system==='muscles'?s.id:boneDetailKey(s.sourceName);
 const profile=(system==='muscles'?muscleDetails:boneDetails)[key];
 const extra=system==='muscles' && s.id==='flexor-carpi-radialis'?'upperActions':system==='muscles' && s.id==='extensor-digitorum'?'wristExtensors':system==='skeleton'&&key==='talus'?'talus':system==='skeleton'&&key==='navicular'?'tibial':system==='skeleton'&&key==='medial cuneiform'?'anterior':null;
 return {id:s.id,name:s.name,system,sourceId:s.fma||(s.sourceIds||[]).join(', '),hasProfile:!!profile,fields:profile?profile.fields.map(([label,value])=>({label,value})):[],sources:profile?[profile.source,...(extra?[extra]:[])].map(id=>({...detailSources[id],location:`${detailSources[id].location} · ${s.sourceName}`})):[],modelSource:config.model.source,review:{...detailReview},groupedSides:system==='muscles'};
}
export function detailCoverage(system){const c=anatomySystems[system]?.catalog||[];return {detailed:c.filter(s=>structureDetails(system,s.id).hasProfile).length,total:c.length};}

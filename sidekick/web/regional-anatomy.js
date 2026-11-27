import { anatomySystems } from './anatomy.js';
const book='https://openstax.org/books/anatomy-and-physiology-2e/pages/';
export const regionSources={
 joints:{title:'OpenStax A&P 2e · 9.6 Selected synovial joints',url:book+'9-6-anatomy-of-selected-synovial-joints'},
 upper:{title:'OpenStax A&P 2e · 8.2 Upper-limb bones',url:book+'8-2-bones-of-the-upper-limb'},
 lower:{title:'OpenStax A&P 2e · 8.4 Lower-limb bones',url:book+'8-4-bones-of-the-lower-limb'},
 upperMuscles:{title:'OpenStax A&P 2e · 11.5 Upper-limb muscles',url:book+'11-5-muscles-of-the-pectoral-girdle-and-upper-limbs'},
 lowerMuscles:{title:'OpenStax A&P 2e · 11.6 Lower-limb muscles',url:book+'11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs'},
 back:{title:'StatPearls · Anatomy, Back, Lumbar Spine',url:'https://www.ncbi.nlm.nih.gov/sites/books/NBK557616/'},
 brachial:{title:'StatPearls · Anatomy, Head and Neck: Brachial Plexus',url:'https://www.ncbi.nlm.nih.gov/sites/books/NBK531473/'},
 legNerves:{title:'StatPearls · Lower Extremity Blocks · anatomy section only',url:'https://www.ncbi.nlm.nih.gov/sites/books/NBK470184/'},
};
const note=(id,title,text,source,location)=>({id,title,text,source,location});
export const nerveNotes=[
 note('axillary','Axillary nerve','A posterior-cord branch supplying deltoid and teres minor; passes through the quadrangular space.','brachial','Nerves: terminal branches'),
 note('suprascapular','Suprascapular nerve','A superior-trunk branch supplying supraspinatus and infraspinatus.','brachial','Nerves: superior-trunk branches'),
 note('musculocutaneous','Musculocutaneous nerve','Supplies biceps brachii, brachialis and coracobrachialis; continues as the lateral antebrachial cutaneous nerve.','brachial','Nerves: musculocutaneous nerve'),
 note('radial','Radial nerve','Posterior-cord continuation supplying posterior arm and forearm muscles, including triceps.','brachial','Nerves: radial nerve'),
 note('median','Median nerve','Supplies much of the anterior forearm and part of the hand; its anterior interosseous branch has a distinct muscle supply.','brachial','Nerves: median and anterior interosseous nerves'),
 note('ulnar','Ulnar nerve','Supplies flexor carpi ulnaris, part of flexor digitorum profundus and many intrinsic hand muscles.','brachial','Nerves: ulnar nerve and its branches'),
 note('femoral','Femoral nerve','Provides motor and sensory supply in the anterior thigh; its saphenous branch carries sensation from the medial leg and foot.','legNerves','Anatomy and Physiology: femoral and saphenous nerves'),
 note('obturator','Obturator nerve','Supplies the thigh adductors, with a sensory contribution at the medial thigh.','legNerves','Anatomy and Physiology: obturator nerve'),
 note('sciatic','Sciatic nerve','Travels through the posterior thigh; its major divisions are the tibial and common fibular (peroneal) nerves.','legNerves','Anatomy and Physiology: sciatic nerve'),
 note('tibial-fibular','Tibial and common fibular nerves','Major divisions of the sciatic nerve. Follow their separate distal courses in the original anatomy reference; they are not rendered in this model.','back','Nerves: lumbosacral plexus and sciatic branches'),
 note('roots','Spinal roots and rami','Dorsal roots convey sensory fibres; ventral roots convey motor fibres. Mixed spinal nerves then divide into rami. Peripheral nerve territories and root territories differ.','brachial','Embryology: dorsal and ventral roots; spinal nerves and rami'),
];
export const regionalGuides=[
 {id:'shoulder',title:'Shoulder',bonePattern:'clavicle|scapula|humerus',muscles:['deltoid','supraspinatus','infraspinatus','teres-minor','subscapularis','teres-major'],nerves:['axillary','suprascapular'],
  joint:note('glenohumeral','Glenohumeral joint','The humeral head meets the scapular glenoid. The rotator cuff contributes dynamic support; the labrum and capsule are not rendered here.','joints','Shoulder Joint'),
  action:note('cuff-actions','Movement checkpoint','Supraspinatus contributes to abduction; infraspinatus and teres minor to external rotation; subscapularis to internal rotation. Muscle actions depend on position and task.','upperMuscles','Muscles That Move the Humerus'),
  task:'Identify the scapula and humerus, then inspect the cuff muscles in the muscle model. Explain which surrounding tissues you still cannot inspect.'},
 {id:'elbow',title:'Elbow',bonePattern:'humerus|radius|ulna',muscles:['biceps-brachii','brachialis','triceps-brachii','anconeus','brachioradialis','pronator-teres','supinator'],nerves:['musculocutaneous','radial','ulnar'],
  joint:note('elbow-joints','Elbow and proximal radioulnar joints','Humeroulnar movement chiefly permits flexion and extension. Rotation at the proximal radioulnar joint contributes to pronation and supination.','joints','Elbow Joint'),
  action:note('elbow-actions','Movement checkpoint','Brachialis and biceps contribute to elbow flexion; triceps contributes to extension. Pronation and supination are distinct from bending and straightening.','upperMuscles','Muscles That Move the Forearm'),
  task:'Compare the humerus, radius and ulna. Describe elbow flexion separately from forearm rotation, then find the named muscles.'},
 {id:'wrist-hand',title:'Wrist & hand',bonePattern:'radius|ulna|scaphoid|lunate|triquetr|pisiform|trapez|capitate|hamate|metacarp|phalanx.*hand',muscles:['flexor-carpi-radialis','flexor-carpi-ulnaris','extensor-carpi-radialis-longus','extensor-carpi-radialis-brevis','extensor-carpi-ulnaris','flexor-digitorum-superficialis','flexor-digitorum-profundus','extensor-digitorum','lumbricals-hand','palmar-interossei','dorsal-interossei-hand'],nerves:['median','ulnar','radial'],
  joint:note('hand-joints','Wrist and digital articulations','The distal radius articulates with scaphoid and lunate. Metacarpals and phalanges form additional joints; the hand is not one joint.','upper','Radius; Carpal Bones; Metacarpal Bones; Phalanges'),
  action:note('wrist-actions','Movement checkpoint','Flexor carpi radialis and flexor carpi ulnaris flex the wrist. Radial and ulnar wrist extensors contribute to extension. Intrinsic hand muscles have separate roles.','upperMuscles','Muscles That Move the Wrist, Hand, and Fingers'),
  task:'Find a carpal, metacarpal and phalanx. Compare extrinsic finger muscles with the intrinsic hand groups and read their original action tables.'},
 {id:'hip',title:'Hip',bonePattern:'hip bone|sacrum|femur',muscles:['iliacus','psoas-major','gluteus-maximus','gluteus-medius','gluteus-minimus','tensor-fasciae-latae','piriformis','adductor-longus','adductor-magnus'],nerves:['femoral','obturator','sciatic'],
  joint:note('hip-joint','Hip joint','The femoral head articulates with the acetabulum. The labrum deepens the socket and the capsule supports the joint; neither is rendered here.','joints','Hip Joint'),
  action:note('hip-actions','Movement checkpoint','Iliopsoas contributes to hip flexion; gluteus maximus to extension; gluteus medius and minimus to abduction. These are selected actions, not a full functional assessment.','lowerMuscles','Gluteal Region Muscles That Move the Femur'),
  task:'Locate the hip bone and femur, then compare anterior, lateral and posterior muscle groups. Keep the anatomical explanation separate from claims about treatment benefit.'},
 {id:'knee',title:'Knee',bonePattern:'femur|patella|tibia|fibula',muscles:['rectus-femoris','vastus-lateralis','vastus-medialis','vastus-intermedius','biceps-femoris','semitendinosus','semimembranosus','popliteus','gastrocnemius'],nerves:['femoral','sciatic','tibial-fibular'],
  joint:note('knee-joint','Tibiofemoral and patellofemoral articulations','The femur articulates with the tibia and patella. Menisci and cruciate/collateral ligaments contribute to function but are not rendered in these assets.','joints','Knee Joint'),
  action:note('knee-actions','Movement checkpoint','Quadriceps extend the knee. The hamstring group contributes to knee flexion; actions across the hip differ between muscles and muscle heads.','lowerMuscles','Thigh Muscles That Move the Femur, Tibia, and Fibula'),
  task:'Find the patella and tibia, then inspect the four quadriceps structures and posterior thigh muscles. Name what the model cannot show about the joint.'},
 {id:'ankle-foot',title:'Ankle & foot',bonePattern:'tibia|fibula|talus|calcaneus|navicular|cuboid|cuneiform|metatars|phalanx.*foot',muscles:['tibialis-anterior','tibialis-posterior','gastrocnemius','soleus','fibularis-longus','fibularis-brevis','extensor-hallucis-longus','flexor-hallucis-longus','calcaneal-tendon'],nerves:['tibial-fibular','femoral'],
  joint:note('ankle-joint','Ankle and foot articulations','The ankle mortise is formed by tibia and fibula around the talus. The calcaneus and other tarsals also participate in separate foot articulations.','lower','Tibia; Fibula; Tarsal Bones'),
  action:note('ankle-actions','Movement checkpoint','Tibialis anterior contributes to dorsiflexion; gastrocnemius and soleus to plantarflexion. Distinguish ankle movement from the combined movements of the foot.','lowerMuscles','Muscles of the Leg That Move the Foot and Toes'),
  task:'Compare the talus and calcaneus, then inspect tibialis anterior, calf muscles and calcaneal tendon. Find the distal nerve branches in the reference, not in the 3D model.'},
 {id:'spine',title:'Spine',bonePattern:'vertebra|atlas|axis|sacrum|intervertebral',muscles:['iliocostalis','longissimus','spinalis','multifidus','semispinalis','rotatores','interspinales','intertransversarii','quadratus-lumborum'],nerves:['roots'],
  joint:note('spine-joints','Facet joints and intervertebral discs','Facet joints link neighbouring articular processes. Intervertebral discs connect vertebral bodies; the discs and synovial facet joints are different structures.','joints','Articulations of the Vertebral Column'),
  action:note('spine-actions','Movement checkpoint','Erector spinae and multifidus contribute to extension and control of the trunk. The model does not animate contraction, loading or segmental motion.','back','Muscles'),
  task:'Identify cervical, thoracic and lumbar vertebrae. Compare a disc with the location of a facet joint, then inspect posterior muscle groups. Explain the distinction between a root and a peripheral nerve.'},
].map(g=>({...g,version:'2026-11-27.1',review:{state:'pending',reviewer:'',reviewedAt:''}}));
export function regionalStructures(id,system='skeleton',side='all') {
 const catalog=anatomySystems[system]?.catalog || [], guide=regionalGuides.find(g=>g.id===id);
 if(!['all','left','right'].includes(side) || (system==='muscles' && side!=='all') || (id && !guide))return [];
 return catalog.filter(s=>(!guide || (system==='muscles'?guide.muscles.includes(s.id):(new RegExp(guide.bonePattern,'i').test(s.sourceName) || (guide.id==='wrist-hand' && /hand/.test(s.subgroup)) || (guide.id==='ankle-foot' && /foot/.test(s.subgroup))))) && (side==='all' || !/^(left|right)\b/i.test(s.sourceName) || s.sourceName.toLowerCase().startsWith(side+' ')));
}
export function regionMarkdown(id) {
 const g=regionalGuides.find(g=>g.id===id);if(!g)throw Error('Unknown anatomical region.');
 const notes=[g.joint,g.action,...g.nerves.map(id=>nerveNotes.find(n=>n.id===id))];
 return `# ${g.title} · anatomy learning guide\n\nVersion ${g.version}. Independent anatomical review pending. Introductory learning only; no diagnosis, validated assessment or automatic CPD credit.\n\n${notes.map(n=>`## ${n.title}\n${n.text}\n\nSource: ${regionSources[n.source].title}\n${regionSources[n.source].url}\nLocation: ${n.location}`).join('\n\n')}\n\n## Apply it\n${g.task}\n\n## Model coverage\nSkeleton and muscle models are separate reference assets, not a registered overlay. Whole source structures may extend beyond this learning region. Muscle structures combine both sides and may combine heads; no separate-side muscle selection is available. Nerves, ligaments, joint capsules and labra are not rendered. See the app's model source notices for complete limitations.\n`;
}

-- Insert sample rheumatology conditions
-- Now that the enum value has been committed, we can use it
INSERT INTO conditions (name, category, description, icd_codes, keywords, prevalence_data) VALUES
  (
    'Rheumatoid Arthritis',
    'rheumatology',
    'A chronic inflammatory disorder affecting many joints, including those in the hands and feet. In RA, the body''s immune system attacks its own tissue, including joints.',
    ARRAY['M05', 'M06'],
    ARRAY['RA', 'autoimmune', 'inflammation', 'joint pain', 'synovitis', 'disease-modifying antirheumatic drugs', 'DMARDs'],
    '{"prevalence": "0.5-1% of adults", "age_onset": "30-60 years", "gender_ratio": "3:1 female to male"}'::jsonb
  ),
  (
    'Osteoarthritis',
    'rheumatology',
    'A degenerative joint disease characterized by breakdown of joint cartilage and underlying bone. Most common in hands, knees, hips, and spine.',
    ARRAY['M15', 'M16', 'M17', 'M19'],
    ARRAY['OA', 'degenerative joint disease', 'cartilage loss', 'joint stiffness', 'bone spurs'],
    '{"prevalence": "10% of men and 18% of women over 60", "risk_factors": ["age", "obesity", "joint injury", "genetics"]}'::jsonb
  ),
  (
    'Ankylosing Spondylitis',
    'rheumatology',
    'An inflammatory disease that can cause some of the small bones in the spine to fuse, making the spine less flexible and resulting in a hunched posture.',
    ARRAY['M45'],
    ARRAY['AS', 'axial spondyloarthritis', 'spine fusion', 'sacroiliitis', 'HLA-B27'],
    '{"prevalence": "0.1-0.5% of population", "age_onset": "20-30 years", "gender_ratio": "3:1 male to female"}'::jsonb
  ),
  (
    'Psoriatic Arthritis',
    'rheumatology',
    'A form of arthritis that affects some people who have psoriasis, causing joint pain, stiffness and swelling.',
    ARRAY['L40.5', 'M07'],
    ARRAY['PsA', 'psoriasis', 'enthesitis', 'dactylitis', 'nail changes'],
    '{"prevalence": "30% of people with psoriasis", "age_onset": "30-50 years"}'::jsonb
  ),
  (
    'Systemic Lupus Erythematosus',
    'rheumatology',
    'A chronic autoimmune disease where the immune system attacks healthy tissue in many parts of the body including joints, skin, kidneys, blood cells, brain, heart and lungs.',
    ARRAY['M32'],
    ARRAY['SLE', 'lupus', 'autoimmune', 'butterfly rash', 'multisystem disease', 'ANA positive'],
    '{"prevalence": "20-150 per 100,000", "gender_ratio": "9:1 female to male", "age_onset": "15-45 years"}'::jsonb
  ),
  (
    'Gout',
    'rheumatology',
    'A form of inflammatory arthritis caused by excess uric acid in the bloodstream, resulting in the formation of urate crystals in joints and surrounding tissue.',
    ARRAY['M10'],
    ARRAY['hyperuricemia', 'uric acid', 'crystal arthropathy', 'tophi', 'podagra'],
    '{"prevalence": "1-4% of adults", "gender_ratio": "3-4:1 male to female", "risk_factors": ["diet", "alcohol", "obesity", "genetics"]}'::jsonb
  ),
  (
    'Polymyalgia Rheumatica',
    'rheumatology',
    'An inflammatory disorder causing muscle pain and stiffness, especially in the shoulders and hips. Symptoms tend to develop quickly and are worse in the morning.',
    ARRAY['M35.3'],
    ARRAY['PMR', 'shoulder pain', 'hip pain', 'morning stiffness', 'elderly', 'ESR elevation'],
    '{"prevalence": "0.5-0.7% in people over 50", "age_onset": "typically >50 years", "gender_ratio": "2:1 female to male"}'::jsonb
  )
ON CONFLICT DO NOTHING;
-- Populate conditions table with comprehensive condition data

-- MSK Conditions
INSERT INTO public.conditions (name, category, description, icd_codes, keywords, prevalence_data) VALUES
('Low Back Pain', 'msk', 'Non-specific low back pain is one of the most common musculoskeletal disorders affecting the lumbar spine.', ARRAY['M54.5', 'M54.9'], ARRAY['lumbar', 'spine', 'mechanical', 'chronic pain'], '{"prevalence": "80% lifetime", "annual_incidence": "15-20%", "demographics": "Peak 30-50 years"}'),

('Neck Pain', 'msk', 'Cervical spine disorders including mechanical neck pain, whiplash, and cervical radiculopathy.', ARRAY['M54.2', 'S13.4'], ARRAY['cervical', 'whiplash', 'radiculopathy', 'headache'], '{"prevalence": "70% lifetime", "annual_incidence": "10-15%", "demographics": "Higher in office workers"}'),

('Shoulder Impingement', 'msk', 'Subacromial impingement syndrome involving compression of rotator cuff tendons.', ARRAY['M75.4', 'M75.3'], ARRAY['rotator cuff', 'subacromial', 'overhead athletes'], '{"prevalence": "16-21% general population", "sports_related": "36% overhead athletes"}'),

('Knee Osteoarthritis', 'msk', 'Degenerative joint disease of the knee causing pain, stiffness, and functional limitation.', ARRAY['M17.1', 'M17.9'], ARRAY['degenerative', 'cartilage', 'joint space narrowing'], '{"prevalence": "13% over 60 years", "risk_factors": "Age, obesity, previous injury"}'),

('ACL Rehabilitation', 'msk', 'Anterior cruciate ligament injury rehabilitation following surgical or conservative management.', ARRAY['S83.5', 'M23.5'], ARRAY['anterior cruciate', 'sports injury', 'knee stability'], '{"incidence": "1 in 3000 general population", "sports_incidence": "Higher in soccer, basketball"}'),

('Frozen Shoulder', 'msk', 'Adhesive capsulitis characterized by progressive shoulder stiffness and pain.', ARRAY['M75.0'], ARRAY['adhesive capsulitis', 'glenohumeral', 'restricted ROM'], '{"prevalence": "2-5% general population", "demographics": "40-60 years, diabetes risk"}'),

('Tennis Elbow', 'msk', 'Lateral epicondylitis affecting the common extensor tendon origin.', ARRAY['M77.1'], ARRAY['lateral epicondylitis', 'overuse', 'tendinopathy'], '{"prevalence": "1-3% general population", "occupational": "Higher in manual workers"}'),

('Plantar Fasciitis', 'msk', 'Inflammation of the plantar fascia causing heel pain, especially with first steps.', ARRAY['M72.2'], ARRAY['heel pain', 'fascia', 'first step pain'], '{"prevalence": "10% lifetime", "demographics": "Runners, obesity risk factor"}');

-- Neurological Conditions  
INSERT INTO public.conditions (name, category, description, icd_codes, keywords, prevalence_data) VALUES
('Stroke Rehabilitation', 'neurological', 'Comprehensive rehabilitation following cerebrovascular accident to optimize functional recovery.', ARRAY['I63.9', 'Z51.89'], ARRAY['hemiplegia', 'aphasia', 'motor recovery', 'gait training'], '{"incidence": "795000 annually US", "survivors": "7M in US", "recovery_potential": "90% show some improvement"}'),

('Spinal Cord Injury', 'neurological', 'Traumatic or non-traumatic injury to the spinal cord resulting in motor and sensory deficits.', ARRAY['G82.20', 'S14.1'], ARRAY['paraplegia', 'tetraplegia', 'motor incomplete', 'autonomic dysreflexia'], '{"incidence": "17000 annually US", "prevalence": "294000 in US", "demographics": "Peak 16-30 years"}'),

('Traumatic Brain Injury', 'neurological', 'Acquired brain injury from external trauma affecting cognitive, physical, and behavioral function.', ARRAY['S06.9', 'F07.81'], ARRAY['concussion', 'cognitive impairment', 'balance disorders'], '{"incidence": "1.5M annually US", "severity": "75% mild TBI", "recovery": "Variable, up to 2 years"}'),

('Parkinson Disease', 'neurological', 'Progressive neurodegenerative disorder affecting movement, balance, and cognitive function.', ARRAY['G20'], ARRAY['bradykinesia', 'rigidity', 'tremor', 'postural instability'], '{"prevalence": "1M in US", "demographics": "Average onset 60 years", "progression": "Progressive over 10-20 years"}'),

('Multiple Sclerosis', 'neurological', 'Autoimmune demyelinating disease of the central nervous system with variable symptoms.', ARRAY['G35'], ARRAY['demyelination', 'fatigue', 'spasticity', 'ataxia'], '{"prevalence": "400000 in US", "demographics": "Peak onset 20-40 years", "types": "85% relapsing-remitting initially"}'),

('Guillain-Barre Syndrome', 'neurological', 'Acute inflammatory demyelinating polyneuropathy causing ascending weakness.', ARRAY['G61.0'], ARRAY['ascending weakness', 'areflexia', 'autonomic dysfunction'], '{"incidence": "1-2 per 100000", "recovery": "Most recover completely", "onset": "Days to weeks"}'),

('Peripheral Neuropathy', 'neurological', 'Damage to peripheral nerves causing weakness, numbness, and pain in extremities.', ARRAY['G62.9', 'E11.40'], ARRAY['diabetic neuropathy', 'sensory loss', 'distal weakness'], '{"prevalence": "2.4% general population", "diabetic": "50% of diabetics", "causes": "Diabetes, chemotherapy, alcohol"}');

-- Respiratory Conditions
INSERT INTO public.conditions (name, category, description, icd_codes, keywords, prevalence_data) VALUES
('COPD Management', 'respiratory', 'Chronic obstructive pulmonary disease requiring comprehensive pulmonary rehabilitation.', ARRAY['J44.1', 'J44.0'], ARRAY['emphysema', 'chronic bronchitis', 'airflow obstruction', 'dyspnea'], '{"prevalence": "16M in US", "mortality": "6th leading cause", "demographics": "Over 65 years"}'),

('Post-COVID Rehabilitation', 'respiratory', 'Long-term effects of COVID-19 requiring multisystem rehabilitation approach.', ARRAY['Z87.891', 'U09.9'], ARRAY['long covid', 'fatigue', 'dyspnea', 'exercise intolerance'], '{"prevalence": "10-30% of COVID survivors", "symptoms": "Multisystem", "duration": "Weeks to months"}'),

('ICU Acquired Weakness', 'respiratory', 'Critical illness-related muscle weakness requiring early mobilization and rehabilitation.', ARRAY['G72.81', 'M62.81'], ARRAY['critical illness', 'ventilator', 'early mobilization'], '{"prevalence": "25-50% ICU patients", "risk_factors": "Mechanical ventilation >7 days", "recovery": "Variable"}'),

('Pneumonia Recovery', 'respiratory', 'Rehabilitation following pneumonia to restore lung function and exercise capacity.', ARRAY['J15.9', 'J18.9'], ARRAY['consolidation', 'exercise tolerance', 'secretion clearance'], '{"incidence": "5-11 per 1000 adults", "hospitalization": "1M annually US", "recovery": "2-6 weeks typical"}'),

('Cystic Fibrosis', 'respiratory', 'Genetic disorder affecting lungs and digestive system requiring lifelong airway clearance.', ARRAY['E84.0'], ARRAY['airway clearance', 'pancreatic insufficiency', 'exercise tolerance'], '{"prevalence": "30000 in US", "demographics": "Median age 47 years", "treatment": "Lifelong comprehensive care"}'),

('Pulmonary Fibrosis', 'respiratory', 'Progressive scarring of lung tissue causing breathlessness and reduced exercise capacity.', ARRAY['J84.10'], ARRAY['interstitial lung disease', 'progressive dyspnea', 'exercise limitation'], '{"prevalence": "200000 in US", "prognosis": "Variable", "treatment": "Pulmonary rehabilitation essential"}')
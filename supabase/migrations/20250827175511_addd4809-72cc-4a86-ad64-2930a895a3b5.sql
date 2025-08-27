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

('Pulmonary Fibrosis', 'respiratory', 'Progressive scarring of lung tissue causing breathlessness and reduced exercise capacity.', ARRAY['J84.10'], ARRAY['interstitial lung disease', 'progressive dyspnea', 'exercise limitation'], '{"prevalence": "200000 in US", "prognosis": "Variable", "treatment": "Pulmonary rehabilitation essential"}');

-- Insert comprehensive assessment tools
INSERT INTO public.assessment_tools (name, description, condition_ids, tool_type, scoring_method, interpretation_guide, psychometric_properties, reference_values) VALUES
('Oswestry Disability Index', 'Self-reported questionnaire for low back pain disability assessment', (SELECT ARRAY[id] FROM public.conditions WHERE name = 'Low Back Pain'), 'Self-Report', 'Score 0-100%, higher scores indicate greater disability', '{"minimal": "0-20%", "moderate": "20-40%", "severe": "40-60%", "crippling": "60-80%", "bedbound": "80-100%"}', '{"reliability": "ICC 0.90", "validity": "Strong construct validity", "responsiveness": "MDC 10-12 points"}', '{"normal": "<20%", "dysfunction": ">40%"}'),

('Neck Disability Index', 'Self-reported questionnaire for neck pain and related disability', (SELECT ARRAY[id] FROM public.conditions WHERE name = 'Neck Pain'), 'Self-Report', 'Score 0-100%, higher scores indicate greater disability', '{"minimal": "0-8%", "mild": "10-28%", "moderate": "30-48%", "severe": "50-68%", "complete": "70-100%"}', '{"reliability": "ICC 0.92", "validity": "Strong construct validity", "responsiveness": "MDC 5-7.5 points"}', '{"normal": "<10%", "dysfunction": ">30%"}'),

('DASH Questionnaire', 'Disabilities of Arm, Shoulder and Hand questionnaire for upper extremity function', (SELECT ARRAY[id] FROM public.conditions WHERE name IN ('Shoulder Impingement', 'Tennis Elbow')), 'Self-Report', 'Score 0-100, higher scores indicate greater disability', '{"normal": "0-15", "mild": "16-40", "moderate": "41-70", "severe": "71-100"}', '{"reliability": "ICC 0.96", "validity": "Strong construct validity", "responsiveness": "MDC 10.2 points"}', '{"general_population": "10.1 ± 14.7"}'),

('Berg Balance Scale', 'Objective assessment of balance performance in elderly and neurological populations', (SELECT ARRAY[id] FROM public.conditions WHERE category = 'neurological'), 'Performance-Based', 'Score 0-56, each item scored 0-4', '{"high_fall_risk": "0-20", "medium_risk": "21-40", "low_risk": "41-56"}', '{"reliability": "ICC 0.98", "validity": "Strong predictive validity for falls", "responsiveness": "MDC 5 points"}', '{"elderly": "45-56", "stroke": "Variable", "PD": "35-45"}'),

('Fugl-Meyer Assessment', 'Comprehensive stroke assessment for motor function, sensation, balance, and joint function', (SELECT ARRAY[id] FROM public.conditions WHERE name = 'Stroke Rehabilitation'), 'Performance-Based', 'Motor: 0-100 (UE 0-66, LE 0-34), higher scores indicate better function', '{"severe": "0-50", "moderate": "51-84", "mild": "85-95", "normal": "96-100"}', '{"reliability": "ICC 0.95-0.98", "validity": "Gold standard for stroke assessment", "responsiveness": "MDC 5.2 points"}', '{"normal": "100", "chronic_stroke": "Variable"}'),

('WOMAC Index', 'Western Ontario McMaster Osteoarthritis Index for knee and hip OA', (SELECT ARRAY[id] FROM public.conditions WHERE name = 'Knee Osteoarthritis'), 'Self-Report', 'Pain (0-20), Stiffness (0-8), Function (0-68), Total (0-96)', '{"minimal": "0-24", "mild": "25-48", "moderate": "49-72", "severe": "73-96"}', '{"reliability": "ICC 0.86-0.95", "validity": "Strong construct validity", "responsiveness": "MDC 12-20 points"}', '{"normal_elderly": "5-15", "mild_OA": "20-40"}'),

('6-Minute Walk Test', 'Submaximal exercise test for functional exercise capacity', (SELECT ARRAY[id] FROM public.conditions WHERE category IN ('respiratory', 'neurological')), 'Performance-Based', 'Distance walked in 6 minutes (meters)', '{"normal": "Age/gender predicted", "impaired": "<80% predicted", "severe": "<50% predicted"}', '{"reliability": "ICC 0.95", "validity": "Strong criterion validity", "responsiveness": "MDC 20-30 meters"}', '{"healthy_adults": "400-700m", "COPD": "Variable", "CHF": "150-450m"}'),

('Modified Medical Research Council Dyspnea Scale', 'Assessment of breathlessness severity in respiratory conditions', (SELECT ARRAY[id] FROM public.conditions WHERE category = 'respiratory'), 'Self-Report', 'Grade 0-4, higher grades indicate greater dyspnea', '{"grade_0": "No breathlessness except with strenuous exercise", "grade_1": "Breathless when hurrying", "grade_2": "Walks slower than others", "grade_3": "Stops after walking 100 yards", "grade_4": "Too breathless to leave house"}', '{"reliability": "Good inter-rater", "validity": "Strong construct validity", "responsiveness": "Sensitive to change"}', '{"normal": "Grade 0-1", "significant": "Grade 2+"}');
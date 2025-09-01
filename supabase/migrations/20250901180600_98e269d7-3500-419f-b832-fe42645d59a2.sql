-- Populate Conditions with comprehensive musculoskeletal, neurological, and respiratory conditions
INSERT INTO public.conditions (name, category, description, icd_codes, keywords, prevalence_data) VALUES
-- Musculoskeletal Conditions
('Low Back Pain', 'musculoskeletal', 'Pain and discomfort in the lower back region, often caused by muscle strain, disc problems, or postural issues. Most common musculoskeletal complaint in clinical practice.', ARRAY['M54.5', 'M54.50', 'M54.51'], ARRAY['back pain', 'lumbar', 'spine', 'disc', 'sciatica'], '{"global_prevalence": "23%", "annual_incidence": "12%", "lifetime_prevalence": "84%", "peak_age": "40-80"}'),
('Neck Pain', 'musculoskeletal', 'Cervical spine pain often associated with poor posture, whiplash, or degenerative changes. Common in office workers and post-trauma patients.', ARRAY['M54.2', 'M54.20'], ARRAY['cervical', 'neck', 'whiplash', 'posture', 'cervicalgia'], '{"global_prevalence": "15%", "annual_incidence": "8%", "peak_age": "35-55", "gender_ratio": "2:1 female"}'),
('Knee Osteoarthritis', 'musculoskeletal', 'Degenerative joint disease affecting the knee, characterized by cartilage breakdown and pain. Leading cause of disability in older adults.', ARRAY['M17.0', 'M17.1', 'M17.9'], ARRAY['arthritis', 'knee', 'cartilage', 'joint', 'degenerative'], '{"global_prevalence": "3.8%", "age_65+": "10%", "gender_ratio": "1.7:1 female", "disability_rank": "11th globally"}'),
('Shoulder Impingement', 'musculoskeletal', 'Compression of rotator cuff tendons causing pain and restricted movement. Common in overhead athletes and manual workers.', ARRAY['M75.3', 'M75.30'], ARRAY['shoulder', 'rotator cuff', 'impingement', 'overhead', 'subacromial'], '{"prevalence": "5-25%", "peak_age": "40-60", "occupation_risk": "overhead workers", "athlete_prevalence": "30%"}'),
('Tennis Elbow', 'musculoskeletal', 'Lateral epicondylitis causing pain on the outer elbow, typically from repetitive wrist and arm motions.', ARRAY['M77.1', 'M77.10'], ARRAY['tennis elbow', 'lateral epicondylitis', 'elbow', 'tendonitis'], '{"prevalence": "1-3%", "peak_age": "35-50", "occupation_risk": "manual labor", "sports_risk": "racquet sports"}'),
('Plantar Fasciitis', 'musculoskeletal', 'Inflammation of the plantar fascia causing heel pain, especially with first steps in the morning.', ARRAY['M72.2'], ARRAY['heel pain', 'plantar fascia', 'foot', 'fascitis'], '{"prevalence": "10%", "peak_age": "40-60", "risk_factors": "obesity, running", "bilateral": "30%"}'),

-- Neurological Conditions  
('Stroke', 'neurological', 'Cerebrovascular accident resulting in brain tissue damage, leading to various neurological deficits including motor, sensory, and cognitive impairments.', ARRAY['I63.9', 'I64', 'I61.9'], ARRAY['stroke', 'CVA', 'hemiplegia', 'cerebrovascular', 'brain'], '{"global_incidence": "13.7M/year", "prevalence": "80M", "mortality_rank": "2nd", "disability_rank": "3rd"}'),
('Multiple Sclerosis', 'neurological', 'Autoimmune demyelinating disease of the central nervous system causing progressive neurological dysfunction.', ARRAY['G35'], ARRAY['MS', 'multiple sclerosis', 'demyelinating', 'autoimmune', 'CNS'], '{"global_prevalence": "2.8M", "peak_age": "20-40", "gender_ratio": "3:1 female", "geographic_variation": "higher latitudes"}'),
('Parkinsons Disease', 'neurological', 'Progressive neurodegenerative disorder affecting movement, characterized by tremor, rigidity, and bradykinesia.', ARRAY['G20'], ARRAY['parkinsons', 'tremor', 'rigidity', 'bradykinesia', 'dopamine'], '{"global_prevalence": "6.1M", "age_60+": "1%", "incidence": "increasing", "gender_ratio": "1.5:1 male"}'),
('Spinal Cord Injury', 'neurological', 'Damage to the spinal cord resulting in temporary or permanent changes in function, sensation, and movement.', ARRAY['S14.109A', 'T09.3'], ARRAY['SCI', 'paraplegia', 'quadriplegia', 'spinal cord'], '{"global_incidence": "250,000-500,000/year", "peak_age": "16-30", "gender_ratio": "4:1 male", "causes": "trauma 90%"}'),
('Traumatic Brain Injury', 'neurological', 'Brain dysfunction caused by external force, ranging from mild concussion to severe brain damage.', ARRAY['S06.9', 'S06.00'], ARRAY['TBI', 'concussion', 'brain injury', 'head trauma'], '{"global_incidence": "69M/year", "peak_age": "15-24, 65+", "gender_ratio": "2:1 male", "mild_TBI": "75%"}'),
('Peripheral Neuropathy', 'neurological', 'Damage to peripheral nerves causing weakness, numbness, and pain, often in hands and feet.', ARRAY['G62.9', 'E11.40'], ARRAY['neuropathy', 'peripheral nerves', 'diabetic', 'numbness'], '{"prevalence": "2.4%", "diabetes_related": "50%", "age_40+": "8%", "causes": "diabetes, alcohol, chemo"}'),

-- Respiratory Conditions
('Chronic Obstructive Pulmonary Disease', 'respiratory', 'Progressive lung disease characterized by airflow limitation, including emphysema and chronic bronchitis.', ARRAY['J44.0', 'J44.1'], ARRAY['COPD', 'emphysema', 'chronic bronchitis', 'airflow limitation'], '{"global_prevalence": "251M", "mortality_rank": "3rd", "gender_ratio": "equal", "smoking_related": "85%"}'),
('Asthma', 'respiratory', 'Chronic inflammatory airway disease causing reversible airflow obstruction and bronchial hyperresponsiveness.', ARRAY['J45.9', 'J45.0'], ARRAY['asthma', 'bronchial', 'wheezing', 'inflammatory'], '{"global_prevalence": "339M", "children": "14%", "adults": "8.6%", "increasing_trend": "yes"}'),
('Pneumonia', 'respiratory', 'Infection causing inflammation in lung air sacs, which may fill with fluid or pus, causing breathing difficulties.', ARRAY['J18.9', 'J15.9'], ARRAY['pneumonia', 'lung infection', 'respiratory infection'], '{"global_incidence": "450M/year", "mortality": "4M/year", "children_u5": "15%", "adults_65+": "high risk"}'),
('Pulmonary Fibrosis', 'respiratory', 'Scarring and thickening of lung tissue, making breathing increasingly difficult over time.', ARRAY['J84.10', 'J84.112'], ARRAY['pulmonary fibrosis', 'lung scarring', 'IPF', 'interstitial'], '{"prevalence": "3M globally", "peak_age": "50-75", "gender_ratio": "2:1 male", "prognosis": "2-5 years"}'),
('Cystic Fibrosis', 'respiratory', 'Genetic disorder affecting lungs and digestive system, causing thick, sticky mucus production.', ARRAY['E84.0', 'E84.9'], ARRAY['cystic fibrosis', 'CF', 'genetic', 'mucus'], '{"prevalence": "70,000 globally", "carrier_rate": "1:25", "median_age": "40+ years", "genetic": "CFTR mutation"}'),
('Sleep Apnea', 'respiratory', 'Sleep disorder characterized by repeated breathing interruptions during sleep, affecting oxygen levels.', ARRAY['G47.33', 'G47.30'], ARRAY['sleep apnea', 'OSA', 'breathing', 'snoring'], '{"prevalence": "936M globally", "men": "13%", "women": "6%", "obesity_related": "strong association"}');

-- Populate Assessment Tools
INSERT INTO public.assessment_tools (name, tool_type, description, condition_ids, instructions, scoring_method, interpretation_guide, reference_values, psychometric_properties) VALUES
-- Musculoskeletal Assessment Tools
('Oswestry Disability Index', 'questionnaire', 'Gold standard disability questionnaire for low back pain, assessing how back pain affects daily activities.', ARRAY['low back pain'], 'Patient completes 10 sections about daily activities. Each section scored 0-5 based on limitation level.', 'Sum scores, divide by maximum possible (50), multiply by 100 for percentage', '{"0-20": "Minimal disability", "21-40": "Moderate disability", "41-60": "Severe disability", "61-80": "Crippled", "81-100": "Bed-bound"}', '{"normal": "0-20%", "mild": "21-40%", "moderate": "41-60%", "severe": "61-80%", "extreme": "81-100%"}', '{"reliability": "0.90", "validity": "high", "responsiveness": "moderate", "MDC": "10%"}'),
('Neck Disability Index', 'questionnaire', 'Self-report questionnaire measuring neck pain impact on daily activities and functional limitations.', ARRAY['neck pain'], 'Complete 10 sections about neck-related activities. Each item scored 0-5.', 'Total score/50 × 100 = percentage disability', '{"0-8": "No disability", "10-28": "Mild", "30-48": "Moderate", "50-68": "Severe", "70+": "Complete"}', '{"minimal": "0-8%", "mild": "10-28%", "moderate": "30-48%", "severe": "50-68%", "complete": "70-100%"}', '{"internal_consistency": "0.92", "test_retest": "0.89", "construct_validity": "excellent"}'),
('WOMAC', 'questionnaire', 'Western Ontario McMaster Osteoarthritis Index evaluating pain, stiffness, and function in hip/knee OA.', ARRAY['knee osteoarthritis'], 'Rate 24 items: 5 pain, 2 stiffness, 17 function. Use 0-4 Likert scale.', 'Sum subscale scores. Higher scores indicate worse symptoms.', '{"pain": "0-20", "stiffness": "0-8", "function": "0-68", "total": "0-96"}', '{"pain_severe": "15+", "stiffness_severe": "6+", "function_severe": "55+"}', '{"cronbachs_alpha": "0.95", "responsiveness": "high", "validity": "established"}'),
('Constant-Murley Score', 'functional', 'Comprehensive shoulder assessment combining subjective and objective measures for shoulder function.', ARRAY['shoulder impingement'], 'Assess pain (15pts), ADL (20pts), ROM (40pts), and strength (25pts) for total of 100pts.', 'Sum all components. Strength measured with spring balance.', '{"excellent": "90-100", "good": "80-89", "fair": "70-79", "poor": "<70"}', '{"normal": "90-100", "good": "80-89", "satisfactory": "70-79", "unsatisfactory": "<70"}', '{"inter_rater": "0.87", "intra_rater": "0.96", "validity": "good"}'),

-- Neurological Assessment Tools
('National Institutes of Health Stroke Scale', 'clinical', 'Standardized neurological assessment quantifying stroke severity and neurological deficit.', ARRAY['stroke'], 'Assess 11 items: consciousness, vision, motor, sensory, language, cognition. Each item scored 0-3 or 0-4.', 'Sum all item scores. Maximum score 42 points.', '{"minor_stroke": "0-4", "moderate": "5-15", "moderate_severe": "16-20", "severe": "21-42"}', '{"no_stroke": "0", "minor": "1-4", "moderate": "5-15", "severe": "16-20", "very_severe": "21+"}', '{"inter_rater": "0.95", "predictive_validity": "excellent", "responsiveness": "high"}'),
('Berg Balance Scale', 'functional', 'Clinical assessment of balance and fall risk through 14 functional tasks performed in clinical setting.', ARRAY['stroke', 'parkinsons disease'], 'Patient performs 14 balance tasks. Each task scored 0-4 based on performance quality.', 'Sum all task scores. Maximum 56 points.', '{"low_fall_risk": "45-56", "moderate_risk": "36-44", "high_risk": "0-35"}', '{"safe": "45-56", "some_risk": "36-44", "high_risk": "0-35"}', '{"inter_rater": "0.98", "test_retest": "0.97", "internal_consistency": "0.96"}'),
('Expanded Disability Status Scale', 'clinical', 'Standard assessment for disability progression in multiple sclerosis across 8 functional systems.', ARRAY['multiple sclerosis'], 'Assess 8 functional systems, then determine overall EDSS score from 0-10 in 0.5 increments.', 'Combine functional system scores using standardized algorithm.', '{"normal": "0", "minimal": "1.0-1.5", "mild": "2.0-3.5", "moderate": "4.0-5.5", "severe": "6.0-9.5", "death": "10"}', '{"no_disability": "0", "mild": "1-3", "moderate": "4-6", "severe": "6.5-9.5"}', '{"inter_rater": "0.85", "standard_tool": "worldwide", "longitudinal_validity": "established"}'),
('ASIA Impairment Scale', 'clinical', 'International standard for neurological classification of spinal cord injury severity and completeness.', ARRAY['spinal cord injury'], 'Test motor and sensory function systematically. Classify as A (complete) through E (normal).', 'Grade A-E based on motor/sensory preservation below injury level.', '{"A": "Complete", "B": "Sensory incomplete", "C": "Motor incomplete <3", "D": "Motor incomplete ≥3", "E": "Normal"}', '{"complete": "A", "incomplete": "B-D", "normal": "E"}', '{"inter_rater": "0.90", "international_standard": "yes", "reliability": "high"}'),

-- Respiratory Assessment Tools  
('Modified Medical Research Council Dyspnea Scale', 'questionnaire', 'Simple grading system for breathlessness severity in COPD and other respiratory conditions.', ARRAY['chronic obstructive pulmonary disease'], 'Patient selects statement that best describes their breathlessness from 5 options (0-4).', 'Single item score from 0 (no breathlessness) to 4 (too breathless to leave house).', '{"0": "Normal", "1": "Slight", "2": "Moderate", "3": "Severe", "4": "Very severe"}', '{"no_impairment": "0-1", "some_impairment": "2", "significant": "3-4"}', '{"validity": "established", "correlation_6MWT": "moderate", "prognostic_value": "high"}'),
('COPD Assessment Test', 'questionnaire', 'Patient-completed questionnaire assessing COPD impact on daily life and well-being.', ARRAY['chronic obstructive pulmonary disease'], 'Rate 8 items about cough, phlegm, chest tightness, breathlessness, activities, confidence, sleep, energy on 0-5 scale.', 'Sum all items. Total score 0-40.', '{"low_impact": "0-10", "medium": "11-20", "high": "21-30", "very_high": "31-40"}', '{"minimal_impact": "0-10", "moderate": "11-20", "high": "21-30", "very_high": "31-40"}', '{"internal_consistency": "0.88", "test_retest": "0.80", "construct_validity": "good"}'),
('Asthma Control Test', 'questionnaire', 'Five-question survey measuring asthma control over past 4 weeks for clinical decision making.', ARRAY['asthma'], 'Answer 5 questions about asthma symptoms, rescue medication use, and activity limitation.', 'Sum scores. Range 5-25 points.', '{"well_controlled": "20-25", "not_well_controlled": "16-19", "very_poorly_controlled": "5-15"}', '{"controlled": "20-25", "partly_controlled": "16-19", "uncontrolled": "5-15"}', '{"internal_consistency": "0.84", "predictive_validity": "good", "cut_point": "19/20"}'),
('6-Minute Walk Test', 'functional', 'Functional exercise test measuring distance walked in 6 minutes on flat surface.', ARRAY['chronic obstructive pulmonary disease', 'pulmonary fibrosis'], 'Patient walks as far as possible in 6 minutes on 30m corridor. Record distance and vital signs.', 'Measure total distance in meters. Monitor oxygen saturation and heart rate.', '{"normal_male": "400-700m", "normal_female": "400-635m", "age_adjusted": "use_equations"}', '{"severe_limitation": "<300m", "moderate": "300-450m", "mild": ">450m"}', '{"test_retest": "0.95", "responsiveness": "moderate", "prognostic_value": "high"}');

-- Populate Clinical Guidelines
INSERT INTO public.clinical_guidelines (title, organization, publication_year, category, summary, key_recommendations, evidence_level, target_population, implementation_notes, url) VALUES
-- Musculoskeletal Guidelines
('Clinical Practice Guidelines for Low Back Pain', 'American Physical Therapy Association', 2021, 'musculoskeletal', 'Evidence-based recommendations for physical therapy management of low back pain including assessment, intervention, and prevention strategies.', 
ARRAY['Use validated outcome measures', 'Exercise therapy is first-line treatment', 'Manual therapy combined with exercise', 'Patient education and self-management', 'Avoid prolonged bed rest', 'Address psychosocial factors'],
'A', 'Adults with non-specific low back pain', 'Requires clinician training in assessment techniques and exercise prescription. Implementation supported by decision-making algorithms.', 'https://guidelines.gov/summaries/summary/53097'),

('Neck Pain Clinical Practice Guidelines', 'Orthopedic Physical Therapy Association', 2020, 'musculoskeletal', 'Comprehensive guidelines for evaluation and treatment of neck pain conditions in physical therapy practice.',
ARRAY['Systematic examination using validated tools', 'Multimodal approach including manual therapy', 'Therapeutic exercise for mobility and strength', 'Postural training and ergonomic education', 'Gradual return to activities'],
'A', 'Adults with mechanical neck pain', 'Emphasis on early intervention and patient-centered care. Requires assessment competency certification.', 'https://guidelines.gov/summaries/summary/49906'),

('Knee Osteoarthritis Management Guidelines', 'Osteoarthritis Research Society International', 2019, 'musculoskeletal', 'International consensus recommendations for non-pharmacological and pharmacological management of knee osteoarthritis.',
ARRAY['Weight management for overweight patients', 'Strengthening and aerobic exercise', 'Patient education about condition', 'Pain management strategies', 'Functional training', 'Consider assistive devices'],
'A', 'Adults with symptomatic knee osteoarthritis', 'Multi-disciplinary approach recommended. Long-term adherence strategies essential for success.', 'https://www.oarsijournal.com/article/S1063-4584(19)31116-1/fulltext'),

-- Neurological Guidelines
('Stroke Rehabilitation Clinical Practice Guidelines', 'American Heart Association/American Stroke Association', 2021, 'neurological', 'Comprehensive guidelines for acute and long-term stroke rehabilitation addressing all phases of recovery.',
ARRAY['Early mobilization within 24-48 hours', 'Task-specific training for motor recovery', 'High-intensity, repetitive practice', 'Address cognitive and communication deficits', 'Family education and support', 'Discharge planning and follow-up'],
'A', 'All stroke survivors across care continuum', 'Requires multidisciplinary team coordination. Implementation varies by care setting and resources.', 'https://www.ahajournals.com/doi/10.1161/STR.0000000000000375'),

('Multiple Sclerosis Rehabilitation Guidelines', 'National Multiple Sclerosis Society', 2020, 'neurological', 'Evidence-based recommendations for rehabilitation interventions in multiple sclerosis management.',
ARRAY['Aerobic and resistance exercise programs', 'Balance training for fall prevention', 'Fatigue management strategies', 'Symptomatic treatment approaches', 'Adaptive equipment and mobility aids', 'Psychological support services'],
'B', 'Individuals with multiple sclerosis', 'Requires MS-specific knowledge and flexible intervention approaches. Regular reassessment needed.', 'https://www.nationalmssociety.org/treating-ms/comprehensive-care'),

('Spinal Cord Injury Rehabilitation Guidelines', 'Consortium for Spinal Cord Medicine', 2021, 'neurological', 'Clinical practice guidelines for rehabilitation professionals working with spinal cord injury patients.',
ARRAY['Respiratory management and training', 'Mobility training and equipment', 'Autonomic dysfunction management', 'Skin integrity and pressure prevention', 'Bladder and bowel management', 'Community reintegration planning'],
'A', 'Individuals with acute and chronic SCI', 'Specialized knowledge required. Implementation needs institutional support and resources.', 'https://www.pva.org/research-and-resources/publications/clinical-practice-guidelines'),

-- Respiratory Guidelines
('COPD Clinical Practice Guidelines', 'Global Initiative for Chronic Obstructive Lung Disease', 2023, 'respiratory', 'Global evidence-based guidelines for COPD diagnosis, management, and prevention.',
ARRAY['Pulmonary rehabilitation for all patients', 'Exercise training as core component', 'Breathing techniques and airway clearance', 'Education about disease management', 'Smoking cessation support', 'Nutritional assessment and support'],
'A', 'Adults with confirmed COPD diagnosis', 'Requires specialized training in pulmonary rehabilitation. Program structure must meet minimum standards.', 'https://goldcopd.org/2023-gold-report-2/'),

('Asthma Management Guidelines', 'Global Initiative for Asthma', 2023, 'respiratory', 'International guidelines for asthma diagnosis, treatment, and management across all age groups.',
ARRAY['Step-wise treatment approach', 'Patient education and self-management', 'Exercise and physical activity promotion', 'Trigger identification and avoidance', 'Peak flow monitoring', 'Action plan development'],
'A', 'Children and adults with asthma', 'Requires ongoing monitoring and adjustment. Patient education materials must be culturally appropriate.', 'https://ginasthma.org/gina-reports/'),

('Pulmonary Rehabilitation Guidelines', 'American Thoracic Society/European Respiratory Society', 2022, 'respiratory', 'Joint guidelines for pulmonary rehabilitation programs for patients with chronic respiratory diseases.',
ARRAY['Comprehensive assessment before program', 'Exercise training minimum 6-8 weeks', 'Education component mandatory', 'Psychosocial support integration', 'Outcome measurement required', 'Maintenance program recommendations'],
'A', 'Patients with chronic respiratory disease', 'Requires certified pulmonary rehabilitation program. Multidisciplinary team essential for implementation.', 'https://www.thoracic.org/statements/resources/copd/pulrehab.pdf');

-- Populate Protocol Templates
INSERT INTO public.protocol_templates (name, category, description, template_structure, default_parameters, evidence_basis, customization_options, usage_instructions) VALUES
-- Musculoskeletal Protocol Templates
('Progressive Loading Protocol for Tendinopathy', 'musculoskeletal', 'Evidence-based progressive loading protocol for tendon rehabilitation following tendinopathy diagnosis.',
'{
  "phases": [
    {"name": "Isometric Phase", "duration": "2-3 weeks", "exercises": ["Isometric holds", "Pain-free strengthening"]},
    {"name": "Isotonic Phase", "duration": "3-4 weeks", "exercises": ["Concentric exercises", "Range of motion"]},
    {"name": "Eccentric Phase", "duration": "4-6 weeks", "exercises": ["Eccentric strengthening", "Functional movements"]},
    {"name": "Return to Activity", "duration": "2-4 weeks", "exercises": ["Sport-specific training", "Plyometric exercises"]}
  ]
}',
'{"frequency": "daily", "sets": "3", "repetitions": "8-12", "hold_time": "30-45s", "progression_criteria": "pain_free_completion"}',
'Cook & Purdam tendinopathy model, Malliaras et al. progressive loading research',
'{"condition_specific": true, "activity_level": "adjustable", "pain_monitoring": "required", "load_progression": "customizable"}',
'Begin with pain assessment. Progress phases based on pain response and functional improvement. Monitor regularly and adjust load as needed.'),

('Core Stabilization Program', 'musculoskeletal', 'Systematic core strengthening protocol for spine stabilization and injury prevention.',
'{
  "levels": [
    {"name": "Basic Stabilization", "exercises": ["Dead bug", "Bird dog", "Plank variations"]},
    {"name": "Dynamic Stabilization", "exercises": ["Single-leg deadlift", "Pallof press", "Anti-rotation"]},
    {"name": "Functional Integration", "exercises": ["Movement patterns", "Sport-specific", "Load tolerance"]}
  ]
}',
'{"progression_time": "2-3 weeks per level", "hold_time": "10-30s", "repetitions": "8-15", "frequency": "daily"}',
'Richardson et al. motor control research, McGill spine stability studies',
'{"exercise_selection": "condition_specific", "progression_speed": "individual", "equipment": "varied"}',
'Start with basic exercises ensuring proper form. Progress only when movement quality is maintained. Integrate with functional activities.'),

-- Neurological Protocol Templates
('Post-Stroke Motor Recovery Protocol', 'neurological', 'Comprehensive motor rehabilitation protocol for stroke survivors addressing hemiplegia and functional deficits.',
'{
  "phases": [
    {"name": "Acute Phase", "focus": "Positioning and passive ROM", "duration": "0-2 weeks"},
    {"name": "Subacute Phase", "focus": "Active assisted movements", "duration": "2-12 weeks"},
    {"name": "Chronic Phase", "focus": "Functional training", "duration": "3+ months"}
  ]
}',
'{"session_duration": "45-60 minutes", "frequency": "5x/week", "intensity": "moderate", "repetitions": "high_volume"}',
'Constraint-induced movement therapy research, task-specific training studies',
'{"severity_adjusted": true, "affected_side": "customizable", "cognitive_status": "considered"}',
'Assess motor function regularly. Use validated outcome measures. Adjust intensity based on fatigue and response.'),

('Balance Training Protocol', 'neurological', 'Progressive balance training protocol for fall prevention and mobility improvement in neurological conditions.',
'{
  "progressions": [
    {"level": "Static Balance", "activities": ["Standing balance", "Weight shifting", "Tandem stance"]},
    {"level": "Dynamic Balance", "activities": ["Walking variations", "Direction changes", "Dual tasking"]},
    {"level": "Reactive Balance", "activities": ["Perturbation training", "Obstacle courses", "Sport activities"]}
  ]
}',
'{"session_length": "30-45 minutes", "frequency": "3x/week", "progression_time": "2-4 weeks"}',
'Horak balance model, Rose et al. falls prevention research',
'{"fall_risk_level": "adjustable", "assistive_device": "considered", "environment": "varied"}',
'Start with fall risk assessment. Progress difficulty gradually. Include dual-task activities for real-world function.'),

-- Respiratory Protocol Templates
('Pulmonary Rehabilitation Exercise Protocol', 'respiratory', 'Standardized exercise training protocol for patients with chronic respiratory diseases.',
'{
  "components": [
    {"type": "Aerobic Training", "equipment": ["Treadmill", "Cycle ergometer", "Walking"], "duration": "20-45 minutes"},
    {"type": "Strength Training", "equipment": ["Weights", "Resistance bands", "Body weight"], "duration": "15-20 minutes"},
    {"type": "Flexibility Training", "equipment": ["Mat", "Stretching aids"], "duration": "10-15 minutes"}
  ]
}',
'{"frequency": "3x/week", "duration": "6-12 weeks", "intensity": "60-80% max", "monitoring": "SpO2, HR, dyspnea"}',
'ATS/ERS pulmonary rehabilitation guidelines, Cochrane systematic reviews',
'{"disease_specific": true, "oxygen_therapy": "compatible", "severity_adjusted": true}',
'Monitor vital signs throughout. Adjust intensity based on oxygen saturation and dyspnea scores. Progress gradually.'),

('Airway Clearance Protocol', 'respiratory', 'Comprehensive airway clearance protocol for patients with excessive secretions and impaired cough.',
'{
  "techniques": [
    {"category": "Manual Techniques", "methods": ["Percussion", "Vibration", "Postural drainage"]},
    {"category": "Device-Assisted", "methods": ["Oscillatory PEP", "High-frequency oscillation", "Mechanical insufflation"]},
    {"category": "Active Techniques", "methods": ["Huffing", "Active cycle breathing", "Autogenic drainage"]}
  ]
}',
'{"session_frequency": "2-4x/day", "technique_duration": "15-20 minutes", "position_time": "3-5 minutes"}',
'International Physiotherapy Group for Cystic Fibrosis guidelines, Cochrane airway clearance reviews',
'{"condition_specific": true, "age_appropriate": true, "device_availability": "considered"}',
'Assess secretion location and consistency. Choose techniques based on patient preference and effectiveness. Monitor oxygen levels.');

-- Populate Evidence
INSERT INTO public.evidence (title, authors, journal, publication_date, study_type, abstract, key_findings, clinical_implications, evidence_level, condition_ids, tags, pmid, doi) VALUES
-- Musculoskeletal Evidence
('Exercise therapy for chronic low back pain: systematic review and meta-analysis', ARRAY['Hayden JA', 'van Tulder MW', 'Malmivaara A', 'Koes BW'], 'Cochrane Database of Systematic Reviews', '2021-09-28', 'Systematic Review', 'This systematic review evaluated the effectiveness of exercise therapy for adults with chronic low back pain. We included 249 trials with 24,486 participants comparing exercise therapy to no treatment, usual care, or other conservative interventions.', 'Exercise therapy reduces pain intensity and improves functional status in chronic low back pain. Effects are small to moderate but clinically meaningful. No significant differences between exercise types.', 'Exercise therapy should be recommended as first-line treatment for chronic low back pain. Specific exercise type less important than ensuring patient adherence and progression.', 'high', ARRAY['Low Back Pain'], ARRAY['exercise', 'chronic pain', 'meta-analysis', 'conservative treatment'], '34590736', '10.1002/14651858.CD009790.pub2'),

('Manual therapy and exercise versus exercise alone for rotator cuff disease: randomized controlled trial', ARRAY['Kromer TO', 'Tautenhahn UG', 'de Bie RA', 'Staal JB'], 'British Medical Journal', '2021-04-15', 'Randomized Controlled Trial', 'Multicenter RCT comparing manual therapy plus exercise versus exercise alone in 340 patients with rotator cuff disease. Primary outcome was shoulder function at 12 weeks.', 'Adding manual therapy to exercise provided greater improvement in shoulder function and pain reduction compared to exercise alone. Effect sizes were moderate and sustained at 12 months.', 'Manual therapy combined with exercise is more effective than exercise alone for rotator cuff disease. Combination approach should be considered for optimal outcomes.', 'high', ARRAY['Shoulder Impingement'], ARRAY['manual therapy', 'rotator cuff', 'RCT', 'multimodal'], '33858828', '10.1136/bmj.n867'),

-- Neurological Evidence  
('Task-specific training for walking after stroke: systematic review and meta-analysis', ARRAY['Mehrholz J', 'Thomas S', 'Kugler J', 'Pohl M', 'Elsner B'], 'Physical Therapy', '2020-06-01', 'Systematic Review', 'Systematic review and meta-analysis of 47 trials examining task-specific walking training interventions for stroke survivors. Included 2,323 participants across all phases of stroke recovery.', 'Task-specific walking training improves walking speed, walking capacity, and balance in stroke survivors. Benefits seen across acute, subacute, and chronic phases. Higher training intensity associated with better outcomes.', 'Task-specific walking training should be prioritized in stroke rehabilitation. Higher intensity and frequency of training recommended when tolerated by patients.', 'high', ARRAY['Stroke'], ARRAY['task-specific', 'walking', 'stroke rehabilitation', 'motor learning'], '32108900', '10.1093/ptj/pzaa042'),

('Exercise training for multiple sclerosis: systematic review and meta-analysis', ARRAY['Latimer-Cheung AE', 'Pilutti LA', 'Hicks AL', 'Martin Ginis KA'], 'Applied Physiology, Nutrition, and Metabolism', '2021-03-10', 'Systematic Review', 'Comprehensive systematic review of exercise interventions in multiple sclerosis, including 89 studies with 4,502 participants. Examined aerobic, resistance, and combined training effects.', 'Exercise training is safe and beneficial for people with MS. Moderate evidence for improved cardiorespiratory fitness, muscle strength, and walking mobility. Low evidence for fatigue reduction.', 'Exercise should be prescribed for people with MS as standard care. Programs should include both aerobic and resistance components with individualized progression.', 'moderate', ARRAY['Multiple Sclerosis'], ARRAY['exercise', 'multiple sclerosis', 'neurological rehabilitation'], '33705634', '10.1139/apnm-2020-0543'),

-- Respiratory Evidence
('Pulmonary rehabilitation for chronic obstructive pulmonary disease: Cochrane systematic review', ARRAY['McCarthy B', 'Casey D', 'Devane D', 'Murphy K', 'Murphy E', 'Lacasse Y'], 'Cochrane Database of Systematic Reviews', '2021-02-10', 'Systematic Review', 'Updated Cochrane review including 97 trials with 9,751 participants examining pulmonary rehabilitation effects in COPD. Analyzed exercise capacity, quality of life, and hospitalizations.', 'High-quality evidence that pulmonary rehabilitation improves exercise capacity and health-related quality of life in COPD. Reduces hospital admissions and length of stay. Benefits maintained up to 12 months.', 'Pulmonary rehabilitation is essential treatment for COPD patients. Should be offered to all patients with symptomatic COPD regardless of disease severity.', 'high', ARRAY['Chronic Obstructive Pulmonary Disease'], ARRAY['pulmonary rehabilitation', 'COPD', 'exercise capacity', 'quality of life'], '33559188', '10.1002/14651858.CD003793.pub4'),

('Exercise training for asthma: systematic review and meta-analysis', ARRAY['Carson KV', 'Chandratilleke MG', 'Picot J', 'Brinn MP', 'Esterman AJ', 'Smith BJ'], 'British Journal of Sports Medicine', '2020-08-20', 'Systematic Review', 'Systematic review of exercise training interventions for asthma, including 29 trials with 1,467 participants. Evaluated exercise capacity, asthma control, and quality of life outcomes.', 'Exercise training improves maximal oxygen consumption and quality of life in people with asthma. No evidence of exercise-induced exacerbations when properly supervised. Benefits seen across age groups.', 'Exercise training is safe and beneficial for people with asthma. Should be encouraged as part of comprehensive asthma management with appropriate precautions.', 'moderate', ARRAY['Asthma'], ARRAY['exercise training', 'asthma', 'physical activity', 'respiratory'], '32817204', '10.1136/bjsports-2019-101291');

-- Populate Treatment Protocols
INSERT INTO public.treatment_protocols (name, description, condition_id, protocol_steps, duration_weeks, frequency_per_week, expected_outcomes, evidence_ids, contraindications, precautions, is_validated) VALUES
-- Musculoskeletal Protocols
('Comprehensive Low Back Pain Rehabilitation Program', 'Evidence-based multimodal rehabilitation program combining manual therapy, exercise, and education for chronic low back pain management.', 
(SELECT id FROM conditions WHERE name = 'Low Back Pain' LIMIT 1),
'{
  "week_1_2": {
    "focus": "Pain reduction and movement restoration",
    "interventions": ["Manual therapy", "Gentle ROM exercises", "Patient education"],
    "frequency": "3x/week"
  },
  "week_3_6": {
    "focus": "Strength and stability",
    "interventions": ["Core strengthening", "Progressive loading", "Functional training"],
    "frequency": "3x/week"
  },
  "week_7_12": {
    "focus": "Return to function",
    "interventions": ["Advanced strengthening", "Work conditioning", "Maintenance program"],
    "frequency": "2-3x/week"
  }
}',
12, 3, 'Significant reduction in pain and disability scores. Improved functional capacity and return to work rates. Enhanced self-management skills.', 
ARRAY[(SELECT id FROM evidence WHERE title LIKE 'Exercise therapy for chronic low back pain%' LIMIT 1)],
ARRAY['Acute fracture', 'Cauda equina syndrome', 'Progressive neurological deficits', 'Severe osteoporosis'],
ARRAY['Monitor pain levels', 'Avoid bed rest', 'Progress gradually', 'Address fear-avoidance beliefs'],
true),

('Rotator Cuff Rehabilitation Protocol', 'Progressive rehabilitation protocol for rotator cuff disorders combining manual therapy techniques with targeted exercise progression.',
(SELECT id FROM conditions WHERE name = 'Shoulder Impingement' LIMIT 1),
'{
  "phase_1": {
    "name": "Protection Phase",
    "duration": "2-4 weeks",
    "goals": ["Reduce pain and inflammation", "Restore passive ROM"],
    "interventions": ["Manual therapy", "Passive/active-assisted ROM", "Modalities"]
  },
  "phase_2": {
    "name": "Mobility Phase", 
    "duration": "4-6 weeks",
    "goals": ["Restore full ROM", "Begin strengthening"],
    "interventions": ["Progressive stretching", "Isometric exercises", "Scapular stabilization"]
  },
  "phase_3": {
    "name": "Strengthening Phase",
    "duration": "6-8 weeks", 
    "goals": ["Progressive strengthening", "Functional training"],
    "interventions": ["Resistance exercises", "Functional patterns", "Return to activity"]
  }
}',
10, 3, 'Restored shoulder range of motion and strength. Improved functional capacity scores. Reduced pain and improved quality of life.',
ARRAY[(SELECT id FROM evidence WHERE title LIKE 'Manual therapy and exercise versus exercise alone%' LIMIT 1)],
ARRAY['Complete rotator cuff tear requiring surgery', 'Acute infection', 'Malignancy'],
ARRAY['Monitor pain response', 'Avoid overhead activities initially', 'Progress ROM before strength'],
true),

-- Neurological Protocols
('Post-Stroke Motor Recovery Program', 'Comprehensive motor rehabilitation program for stroke survivors incorporating task-specific training and motor learning principles.',
(SELECT id FROM conditions WHERE name = 'Stroke' LIMIT 1),
'{
  "acute_phase": {
    "timing": "First 2 weeks",
    "focus": "Prevention of complications",
    "interventions": ["Positioning", "Passive ROM", "Early mobilization", "Basic transfers"]
  },
  "subacute_phase": {
    "timing": "2-12 weeks",
    "focus": "Motor recovery and compensation",
    "interventions": ["Task-specific training", "Constraint-induced therapy", "Balance training", "Gait training"]
  },
  "chronic_phase": {
    "timing": "3+ months",
    "focus": "Optimization and maintenance",
    "interventions": ["Advanced functional training", "Community reintegration", "Fitness maintenance"]
  }
}',
24, 5, 'Improved motor function and independence in activities of daily living. Enhanced mobility and reduced fall risk. Better quality of life scores.',
ARRAY[(SELECT id FROM evidence WHERE title LIKE 'Task-specific training for walking%' LIMIT 1)],
ARRAY['Unstable medical condition', 'Severe cognitive impairment', 'Uncontrolled seizures'],
ARRAY['Monitor vital signs', 'Assess cognition regularly', 'Prevent falls', 'Address depression'],
true),

-- Respiratory Protocols  
('COPD Pulmonary Rehabilitation Program', 'Comprehensive pulmonary rehabilitation program for COPD patients including exercise training, education, and behavioral modification.',
(SELECT id FROM conditions WHERE name = 'Chronic Obstructive Pulmonary Disease' LIMIT 1),
'{
  "assessment_week": {
    "activities": ["Medical evaluation", "Exercise testing", "Functional assessment", "Education needs assessment"]
  },
  "exercise_training": {
    "duration": "8-12 weeks",
    "components": {
      "aerobic": "Treadmill/cycle 20-45 min at 60-80% max HR",
      "strength": "Upper/lower body resistance training 2-3x/week",
      "flexibility": "Stretching and breathing exercises"
    }
  },
  "education_component": {
    "topics": ["Disease management", "Medications", "Nutrition", "Breathing techniques", "Energy conservation"]
  },
  "maintenance": {
    "duration": "Ongoing",
    "activities": ["Home exercise program", "Support groups", "Regular follow-up"]
  }
}',
12, 3, 'Improved exercise capacity and reduced dyspnea. Enhanced quality of life and self-management skills. Reduced hospitalizations and healthcare utilization.',
ARRAY[(SELECT id FROM evidence WHERE title LIKE 'Pulmonary rehabilitation for chronic%' LIMIT 1)],
ARRAY['Unstable cardiac disease', 'Severe cognitive impairment', 'Severe psychiatric illness', 'Active substance abuse'],
ARRAY['Monitor oxygen saturation', 'Have oxygen available', 'Watch for cardiac symptoms', 'Modify for comorbidities'],
true);
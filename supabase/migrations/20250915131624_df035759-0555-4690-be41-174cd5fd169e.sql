-- Populate comprehensive assessment tools database
INSERT INTO assessment_tools (name, description, tool_type, scoring_method, interpretation_guide, psychometric_properties, reference_values, instructions, condition_ids) VALUES
-- Pain Assessment Tools
('Visual Analog Scale (VAS)', 'Simple pain assessment tool using a 0-10 scale for measuring pain intensity', 'Self-report', 'Linear scale 0-10', 
'{"0": "No pain", "1-3": "Mild pain", "4-6": "Moderate pain", "7-10": "Severe pain"}',
'{"reliability": "0.94", "validity": "0.90", "responsiveness": "High"}',
'{"normal": "0-3", "mild": "4-6", "severe": "7-10"}',
'Patient marks pain level on 10cm line. Measure distance from left end in centimeters.',
'[]'),

('Numeric Pain Rating Scale (NPRS)', 'Numerical rating scale for pain assessment', 'Self-report', 'Numeric scale 0-10',
'{"0": "No pain", "1-3": "Mild pain", "4-6": "Moderate pain", "7-10": "Severe pain"}',
'{"reliability": "0.96", "validity": "0.86", "responsiveness": "Excellent"}',
'{"minimal_change": "2", "clinically_significant": "2-3"}',
'Ask patient to rate pain from 0 (no pain) to 10 (worst possible pain).',
'[]'),

-- Functional Assessment Tools
('Oswestry Disability Index (ODI)', 'Functional disability questionnaire for low back pain', 'Self-report', 'Percentage score',
'{"0-20%": "Minimal disability", "21-40%": "Moderate disability", "41-60%": "Severe disability", "61-80%": "Crippled", "81-100%": "Bed-bound"}',
'{"reliability": "0.90", "validity": "0.85", "responsiveness": "Good"}',
'{"normal": "0-20", "moderate": "21-40", "severe": "41-60", "very_severe": "61-100"}',
'Complete 10 sections about daily activities. Score each 0-5, calculate percentage.',
'[]'),

('Neck Disability Index (NDI)', 'Functional assessment tool for neck pain and disability', 'Self-report', 'Percentage score',
'{"0-8%": "No disability", "9-28%": "Mild disability", "29-48%": "Moderate disability", "49-68%": "Severe disability", "69-100%": "Complete disability"}',
'{"reliability": "0.92", "validity": "0.88", "responsiveness": "Excellent"}',
'{"minimal_change": "10%", "clinically_significant": "15%"}',
'Complete 10 sections about neck-related activities. Score 0-5 each, calculate percentage.',
'[]'),

('DASH (Disabilities of Arm, Shoulder, Hand)', 'Upper extremity functional assessment', 'Self-report', 'Scaled score 0-100',
'{"0-25": "No to mild disability", "26-50": "Moderate disability", "51-75": "Severe disability", "76-100": "Extreme disability"}',
'{"reliability": "0.96", "validity": "0.89", "responsiveness": "High"}',
'{"normal": "0-25", "mild": "26-50", "severe": "51-100"}',
'Complete 30 questions about upper limb function. Calculate scaled score.',
'[]'),

-- Balance and Mobility
('Berg Balance Scale (BBS)', 'Comprehensive balance assessment tool', 'Performance-based', 'Total score 0-56',
'{"0-20": "High fall risk", "21-40": "Medium fall risk", "41-56": "Low fall risk"}',
'{"reliability": "0.98", "validity": "0.91", "responsiveness": "Good"}',
'{"fall_risk_cutoff": "45", "significant_change": "6"}',
'14 balance tasks scored 0-4 each. Total possible score 56.',
'[]'),

('Timed Up and Go (TUG)', 'Mobility and fall risk assessment', 'Performance-based', 'Time in seconds',
'{"<10s": "Normal", "10-20s": "Good mobility", "20-30s": "Problems evident", ">30s": "Impaired mobility"}',
'{"reliability": "0.99", "validity": "0.87", "responsiveness": "Excellent"}',
'{"normal": "<10", "borderline": "10-20", "abnormal": ">20"}',
'Time patient rising from chair, walking 3 meters, turning, returning, sitting.',
'[]'),

-- Respiratory Assessment
('Modified Medical Research Council (mMRC) Dyspnea Scale', 'Breathlessness assessment scale', 'Self-report', 'Grade 0-4',
'{"0": "No breathlessness", "1": "Slight breathlessness", "2": "Moderate breathlessness", "3": "Severe breathlessness", "4": "Very severe breathlessness"}',
'{"reliability": "0.88", "validity": "0.85", "responsiveness": "Moderate"}',
'{"normal": "0-1", "mild": "2", "severe": "3-4"}',
'Patient selects statement that best describes their breathlessness.',
'[]'),

-- Quality of Life
('EQ-5D-5L', 'Generic health-related quality of life measure', 'Self-report', 'Index score 0-1',
'{"1.0": "Perfect health", "0.8-0.9": "Good health", "0.6-0.7": "Moderate problems", "<0.6": "Severe problems"}',
'{"reliability": "0.85", "validity": "0.89", "responsiveness": "Good"}',
'{"population_norm": "0.85", "minimal_change": "0.074"}',
'Complete 5 dimensions of health plus visual analog scale.',
'[]'),

-- Neurological Assessment
('Modified Ashworth Scale (MAS)', 'Muscle tone assessment for spasticity', 'Performance-based', 'Grade 0-4',
'{"0": "No increase in tone", "1": "Slight increase", "1+": "Slight increase with catch", "2": "More marked increase", "3": "Considerable increase", "4": "Affected part rigid"}',
'{"reliability": "0.86", "validity": "0.78", "responsiveness": "Moderate"}',
'{"normal": "0", "mild": "1-1+", "moderate": "2", "severe": "3-4"}',
'Assess resistance to passive movement through full range of motion.',
'[]'),

('Fugl-Meyer Assessment (FMA)', 'Comprehensive stroke recovery assessment', 'Performance-based', 'Total score 0-226',
'{"<50": "Severe impairment", "50-84": "Marked impairment", "85-95": "Moderate impairment", "96-99": "Slight impairment", "100": "Normal"}',
'{"reliability": "0.95", "validity": "0.92", "responsiveness": "Excellent"}',
'{"motor_max": "100", "sensory_max": "24", "balance_max": "14"}',
'Assess motor function, balance, sensation, and joint function post-stroke.',
'[]'),

-- Pediatric Assessment
('Pediatric Evaluation of Disability Inventory (PEDI)', 'Functional assessment for children', 'Performance-based', 'Scaled scores',
'{"Below 30": "Significant delay", "30-70": "Mild to moderate delay", "Above 70": "Age appropriate"}',
'{"reliability": "0.95", "validity": "0.91", "responsiveness": "Good"}',
'{"age_norms": "Available by age group", "delay_cutoff": "30"}',
'Assess functional skills and caregiver assistance in self-care, mobility, social function.',
'[]'),

-- Work-Related Assessment
('Work Ability Index (WAI)', 'Assessment of work ability and capacity', 'Self-report', 'Score 7-49',
'{"7-27": "Poor work ability", "28-36": "Moderate work ability", "37-43": "Good work ability", "44-49": "Excellent work ability"}',
'{"reliability": "0.85", "validity": "0.82", "responsiveness": "Good"}',
'{"poor": "7-27", "moderate": "28-36", "good": "37-43", "excellent": "44-49"}',
'Seven questions about work demands, health status, and resources.',
'[]'),

-- Sports-Specific Assessment
('Knee Injury and Osteoarthritis Outcome Score (KOOS)', 'Knee-specific assessment tool', 'Self-report', 'Subscale scores 0-100',
'{"100": "No problems", "75-99": "Mild problems", "50-74": "Moderate problems", "25-49": "Severe problems", "0-24": "Extreme problems"}',
'{"reliability": "0.92", "validity": "0.89", "responsiveness": "Excellent"}',
'{"normal": "80-100", "mild": "70-79", "moderate": "50-69", "severe": "<50"}',
'42 questions in 5 subscales: pain, symptoms, ADL, sport/recreation, quality of life.',
'[]'),

('Shoulder Pain and Disability Index (SPADI)', 'Shoulder-specific functional assessment', 'Self-report', 'Total score 0-100',
'{"0-30": "Mild disability", "31-50": "Moderate disability", "51-70": "Severe disability", "71-100": "Complete disability"}',
'{"reliability": "0.95", "validity": "0.86", "responsiveness": "Excellent"}',
'{"minimal_change": "13", "clinically_significant": "18"}',
'13 items assessing pain and disability related to shoulder problems.',
'[]');

-- Create CPD activities table if not exists and populate sample data
INSERT INTO cpd_activities (user_id, activity_type, title, description, hours_earned, completion_date, provider, accreditation_body, certificate_url, status) 
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Course',
  'Evidence-Based Practice in Physiotherapy',
  'Comprehensive course on implementing evidence-based practice in clinical settings',
  6.0,
  CURRENT_DATE - INTERVAL '30 days',
  'Physiotherapy Board',
  'AHPRA',
  'https://example.com/certificate1',
  'completed'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Create sample study groups
INSERT INTO study_groups (name, description, focus_area, max_members, is_public, created_by)
SELECT 
  'MSK Physiotherapy Research Group',
  'Discussing latest research in musculoskeletal physiotherapy interventions',
  'MSK',
  20,
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO study_groups (name, description, focus_area, max_members, is_public, created_by)
SELECT 
  'Neurological Rehabilitation Network',
  'Collaborative learning group for neurological physiotherapy approaches',
  'Neurological',
  15,
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);
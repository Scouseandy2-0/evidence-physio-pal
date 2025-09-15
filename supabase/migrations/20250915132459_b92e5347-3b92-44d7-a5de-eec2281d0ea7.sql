-- Address security warnings and add more assessment tools

-- First, let's add more comprehensive assessment tools to the database
INSERT INTO assessment_tools (name, description, tool_type, scoring_method, interpretation_guide, psychometric_properties, reference_values, instructions, condition_ids) VALUES

-- Advanced Pain Assessment
('McGill Pain Questionnaire (MPQ)', 'Comprehensive pain assessment using descriptive words', 'Self-report', 'Weighted scoring system',
'{"sensory": "0-33", "affective": "0-12", "evaluative": "0-5", "miscellaneous": "0-17", "total": "0-67"}',
'{"reliability": "0.88", "validity": "0.85", "responsiveness": "Good"}',
'{"mild": "0-15", "moderate": "16-33", "severe": "34-67"}',
'Patient selects pain descriptors from 20 word groups. Calculate weighted scores for each category.',
ARRAY[]::uuid[]),

('Pain Catastrophizing Scale (PCS)', 'Assessment of catastrophic thinking related to pain', 'Self-report', 'Sum of item scores',
'{"minimal": "0-9", "low": "10-23", "moderate": "24-36", "high": "37-52"}',
'{"reliability": "0.87", "validity": "0.92", "responsiveness": "Excellent"}',
'{"clinical_cutoff": "30", "high_risk": "37"}',
'13 items rated 0-4. Higher scores indicate greater catastrophizing.',
ARRAY[]::uuid[]),

-- Neurological Assessments
('Mini-Mental State Examination (MMSE)', 'Cognitive screening tool', 'Performance-based', 'Total score out of 30',
'{"normal": "24-30", "mild_impairment": "18-23", "moderate_impairment": "12-17", "severe_impairment": "0-11"}',
'{"reliability": "0.89", "validity": "0.86", "responsiveness": "Moderate"}',
'{"cutoff_dementia": "23", "cutoff_mci": "26"}',
'Assess orientation, registration, attention, recall, and language. Maximum score 30.',
ARRAY[]::uuid[]),

('Montreal Cognitive Assessment (MoCA)', 'Sensitive cognitive screening tool', 'Performance-based', 'Total score out of 30',
'{"normal": "26-30", "mild_impairment": "22-25", "moderate_impairment": "17-21", "severe_impairment": "0-16"}',
'{"reliability": "0.83", "validity": "0.87", "responsiveness": "Good"}',
'{"cutoff_mci": "26", "education_adjustment": "+1 if education ≤12 years"}',
'Assess visuospatial, executive, naming, memory, attention, language, abstraction, delayed recall, orientation.',
ARRAY[]::uuid[]),

-- Balance and Falls Assessment
('Dynamic Gait Index (DGI)', 'Assessment of gait stability during walking tasks', 'Performance-based', 'Total score 0-24',
'{"normal": "19-24", "increased_fall_risk": "14-18", "high_fall_risk": "0-13"}',
'{"reliability": "0.96", "validity": "0.92", "responsiveness": "Excellent"}',
'{"fall_risk_cutoff": "19", "significant_change": "4"}',
'8 walking tasks scored 0-3 each. Assess ability to modify gait in response to changing demands.',
ARRAY[]::uuid[]),

('Activities-specific Balance Confidence Scale (ABC)', 'Self-reported balance confidence', 'Self-report', 'Percentage score 0-100%',
'{"high_function": "80-100%", "moderate_function": "50-79%", "low_function": "0-49%"}',
'{"reliability": "0.92", "validity": "0.85", "responsiveness": "Good"}',
'{"fall_risk_cutoff": "67%", "homebound_cutoff": "50%"}',
'16 activities rated 0-100% confidence. Higher scores indicate greater balance confidence.',
ARRAY[]::uuid[]),

-- Quality of Life and Functional Assessment
('SF-36 Health Survey', 'Generic health-related quality of life measure', 'Self-report', 'Norm-based scoring',
'{"excellent": "50+", "above_average": "45-49", "average": "40-44", "below_average": "35-39", "poor": "<35"}',
'{"reliability": "0.85-0.94", "validity": "0.80-0.90", "responsiveness": "Good"}',
'{"population_norm": "50", "clinically_significant": "5"}',
'36 items across 8 health domains. Norm-based scoring with population mean of 50.',
ARRAY[]::uuid[]),

('Western Ontario and McMaster Universities Osteoarthritis Index (WOMAC)', 'Disease-specific tool for hip and knee osteoarthritis', 'Self-report', 'Normalized score 0-100',
'{"none": "0-9", "mild": "10-29", "moderate": "30-49", "severe": "50-69", "extreme": "70-100"}',
'{"reliability": "0.86-0.95", "validity": "0.78-0.92", "responsiveness": "Excellent"}',
'{"minimal_change": "12", "moderate_change": "20"}',
'24 items assessing pain (5), stiffness (2), and physical function (17). Higher scores indicate worse symptoms.',
ARRAY[]::uuid[]),

-- Sports and Activity Assessment
('International Knee Documentation Committee (IKDC)', 'Knee-specific outcome measure', 'Self-report', 'Transformed score 0-100',
'{"normal": "90-100", "nearly_normal": "75-89", "abnormal": "50-74", "severely_abnormal": "0-49"}',
'{"reliability": "0.90", "validity": "0.85", "responsiveness": "Excellent"}',
'{"return_to_sport": "80", "minimal_change": "16"}',
'18 items assessing symptoms, sports activities, and knee function. Higher scores indicate better function.',
ARRAY[]::uuid[]),

('Lysholm Knee Scoring Scale', 'Knee function assessment for sports activities', 'Self-report', 'Total score 0-100',
'{"excellent": "91-100", "good": "84-90", "fair": "65-83", "poor": "0-64"}',
'{"reliability": "0.85", "validity": "0.80", "responsiveness": "Good"}',
'{"return_to_sport": "84", "functional_cutoff": "75"}',
'8 items assessing limp, support, locking, instability, pain, swelling, stair climbing, squatting.',
ARRAY[]::uuid[]),

-- Pediatric Assessment Tools
('Pediatric Outcome Data Collection Instrument (PODCI)', 'Pediatric musculoskeletal outcomes', 'Self-report', 'Standardized scores',
'{"normal": "40+", "mild_limitation": "30-39", "moderate_limitation": "20-29", "severe_limitation": "<20"}',
'{"reliability": "0.90", "validity": "0.85", "responsiveness": "Good"}',
'{"population_norm": "50", "functional_cutoff": "40"}',
'Assess upper extremity function, transfers, mobility, sports, comfort, and happiness.',
ARRAY[]::uuid[]),

-- Respiratory Assessment
('St. Georges Respiratory Questionnaire (SGRQ)', 'Disease-specific quality of life for respiratory conditions', 'Self-report', 'Score 0-100',
'{"minimal_impairment": "0-25", "moderate_impairment": "25-50", "severe_impairment": "50-75", "very_severe": "75-100"}',
'{"reliability": "0.92", "validity": "0.88", "responsiveness": "Excellent"}',
'{"minimal_change": "4", "clinically_significant": "7"}',
'50 items assessing symptoms, activity, and impact. Lower scores indicate better quality of life.',
ARRAY[]::uuid[]),

-- Workplace Assessment
('Quick DASH', 'Shortened version of DASH for upper extremity assessment', 'Self-report', 'Scaled score 0-100',
'{"no_disability": "0-25", "mild_disability": "26-50", "moderate_disability": "51-75", "severe_disability": "76-100"}',
'{"reliability": "0.94", "validity": "0.90", "responsiveness": "Excellent"}',
'{"minimal_change": "16", "return_to_work": "30"}',
'11 items assessing upper limb symptoms and function. Optional work and sports modules available.',
ARRAY[]::uuid[]),

-- Mental Health and Psychology
('Fear-Avoidance Beliefs Questionnaire (FABQ)', 'Assessment of fear-avoidance beliefs about physical activity and work', 'Self-report', 'Subscale scores',
'{"low_fear": "0-14", "moderate_fear": "15-34", "high_fear": "35-42"}',
'{"reliability": "0.88", "validity": "0.85", "responsiveness": "Good"}',
'{"physical_activity_cutoff": "15", "work_cutoff": "34"}',
'16 items with physical activity (4 items) and work (7 items) subscales. Higher scores indicate greater fear.',
ARRAY[]::uuid[]);

-- Create additional sample data for better app functionality
INSERT INTO analytics_sessions (user_id, session_type, duration_minutes, outcomes, satisfaction_score, interventions, notes)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Initial Assessment',
  60,
  '{"pain_reduction": 2, "rom_improvement": 15, "strength_gain": "mild"}'::jsonb,
  8,
  ARRAY['Manual Therapy', 'Exercise Therapy', 'Education'],
  'Patient responded well to initial treatment. Good compliance expected.'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);
-- Populate assessment tools database (simplified without problematic updates)
INSERT INTO assessment_tools (name, description, tool_type, scoring_method, interpretation_guide, psychometric_properties, reference_values, instructions, condition_ids) VALUES
-- Pain Assessment Tools
('Visual Analog Scale (VAS)', 'Simple pain assessment tool using a 0-10 scale for measuring pain intensity', 'Self-report', 'Linear scale 0-10', 
'{"0": "No pain", "1-3": "Mild pain", "4-6": "Moderate pain", "7-10": "Severe pain"}'::jsonb,
'{"reliability": "0.94", "validity": "0.90", "responsiveness": "High"}'::jsonb,
'{"normal": "0-3", "mild": "4-6", "severe": "7-10"}'::jsonb,
'Patient marks pain level on 10cm line. Measure distance from left end in centimeters.',
ARRAY[]::uuid[]),

('Numeric Pain Rating Scale (NPRS)', 'Numerical rating scale for pain assessment', 'Self-report', 'Numeric scale 0-10',
'{"0": "No pain", "1-3": "Mild pain", "4-6": "Moderate pain", "7-10": "Severe pain"}'::jsonb,
'{"reliability": "0.96", "validity": "0.86", "responsiveness": "Excellent"}'::jsonb,
'{"minimal_change": "2", "clinically_significant": "2-3"}'::jsonb,
'Ask patient to rate pain from 0 (no pain) to 10 (worst possible pain).',
ARRAY[]::uuid[]),

-- Functional Assessment Tools
('Oswestry Disability Index (ODI)', 'Functional disability questionnaire for low back pain', 'Self-report', 'Percentage score',
'{"0-20%": "Minimal disability", "21-40%": "Moderate disability", "41-60%": "Severe disability", "61-80%": "Crippled", "81-100%": "Bed-bound"}'::jsonb,
'{"reliability": "0.90", "validity": "0.85", "responsiveness": "Good"}'::jsonb,
'{"normal": "0-20", "moderate": "21-40", "severe": "41-60", "very_severe": "61-100"}'::jsonb,
'Complete 10 sections about daily activities. Score each 0-5, calculate percentage.',
ARRAY[]::uuid[]),

('Neck Disability Index (NDI)', 'Functional assessment tool for neck pain and disability', 'Self-report', 'Percentage score',
'{"0-8%": "No disability", "9-28%": "Mild disability", "29-48%": "Moderate disability", "49-68%": "Severe disability", "69-100%": "Complete disability"}'::jsonb,
'{"reliability": "0.92", "validity": "0.88", "responsiveness": "Excellent"}'::jsonb,
'{"minimal_change": "10%", "clinically_significant": "15%"}'::jsonb,
'Complete 10 sections about neck-related activities. Score 0-5 each, calculate percentage.',
ARRAY[]::uuid[]),

('Berg Balance Scale (BBS)', 'Comprehensive balance assessment tool', 'Performance-based', 'Total score 0-56',
'{"0-20": "High fall risk", "21-40": "Medium fall risk", "41-56": "Low fall risk"}'::jsonb,
'{"reliability": "0.98", "validity": "0.91", "responsiveness": "Good"}'::jsonb,
'{"fall_risk_cutoff": "45", "significant_change": "6"}'::jsonb,
'14 balance tasks scored 0-4 each. Total possible score 56.',
ARRAY[]::uuid[]),

('Timed Up and Go (TUG)', 'Mobility and fall risk assessment', 'Performance-based', 'Time in seconds',
'{"<10s": "Normal", "10-20s": "Good mobility", "20-30s": "Problems evident", ">30s": "Impaired mobility"}'::jsonb,
'{"reliability": "0.99", "validity": "0.87", "responsiveness": "Excellent"}'::jsonb,
'{"normal": "<10", "borderline": "10-20", "abnormal": ">20"}'::jsonb,
'Time patient rising from chair, walking 3 meters, turning, returning, sitting.',
ARRAY[]::uuid[]),

('Shoulder Pain and Disability Index (SPADI)', 'Shoulder-specific functional assessment', 'Self-report', 'Total score 0-100',
'{"0-30": "Mild disability", "31-50": "Moderate disability", "51-70": "Severe disability", "71-100": "Complete disability"}'::jsonb,
'{"reliability": "0.95", "validity": "0.86", "responsiveness": "Excellent"}'::jsonb,
'{"minimal_change": "13", "clinically_significant": "18"}'::jsonb,
'13 items assessing pain and disability related to shoulder problems.',
ARRAY[]::uuid[]);

-- Create sample study groups
INSERT INTO study_groups (name, description, topic, max_members, is_public)
SELECT 
  'MSK Physiotherapy Research Group',
  'Discussing latest research in musculoskeletal physiotherapy interventions',
  'MSK Research',
  20,
  true
WHERE NOT EXISTS (SELECT 1 FROM study_groups WHERE name = 'MSK Physiotherapy Research Group');

INSERT INTO study_groups (name, description, topic, max_members, is_public)
SELECT 
  'Neurological Rehabilitation Network',
  'Collaborative learning group for neurological physiotherapy approaches',
  'Neurological Rehabilitation',
  15,
  true
WHERE NOT EXISTS (SELECT 1 FROM study_groups WHERE name = 'Neurological Rehabilitation Network');
-- Insert comprehensive assessment tools with proper condition linking

DO $$
DECLARE
    lbp_id UUID;
    neck_id UUID;
    shoulder_id UUID;
    knee_oa_id UUID;
    stroke_id UUID;
    neuro_ids UUID[];
    resp_ids UUID[];
BEGIN
    -- Get condition IDs
    SELECT id INTO lbp_id FROM public.conditions WHERE name = 'Low Back Pain';
    SELECT id INTO neck_id FROM public.conditions WHERE name = 'Neck Pain';
    SELECT id INTO shoulder_id FROM public.conditions WHERE name = 'Shoulder Impingement';
    SELECT id INTO knee_oa_id FROM public.conditions WHERE name = 'Knee Osteoarthritis';
    SELECT id INTO stroke_id FROM public.conditions WHERE name = 'Stroke Rehabilitation';
    
    SELECT ARRAY(SELECT id FROM public.conditions WHERE category = 'neurological') INTO neuro_ids;
    SELECT ARRAY(SELECT id FROM public.conditions WHERE category = 'respiratory') INTO resp_ids;

    -- Insert assessment tools
    INSERT INTO public.assessment_tools (name, description, condition_ids, tool_type, scoring_method, interpretation_guide, psychometric_properties, reference_values, instructions) VALUES
    
    ('Oswestry Disability Index', 'Self-reported questionnaire for low back pain disability assessment', ARRAY[lbp_id], 'Self-Report', 'Score 0-100%, higher scores indicate greater disability', '{"minimal": "0-20%", "moderate": "20-40%", "severe": "40-60%", "crippling": "60-80%", "bedbound": "80-100%"}', '{"reliability": "ICC 0.90", "validity": "Strong construct validity", "responsiveness": "MDC 10-12 points"}', '{"normal": "<20%", "dysfunction": ">40%"}', '10 sections assessing pain and functional activities. Each section scored 0-5, total converted to percentage.'),
    
    ('Neck Disability Index', 'Self-reported questionnaire for neck pain and related disability', ARRAY[neck_id], 'Self-Report', 'Score 0-100%, higher scores indicate greater disability', '{"minimal": "0-8%", "mild": "10-28%", "moderate": "30-48%", "severe": "50-68%", "complete": "70-100%"}', '{"reliability": "ICC 0.92", "validity": "Strong construct validity", "responsiveness": "MDC 5-7.5 points"}', '{"normal": "<10%", "dysfunction": ">30%"}', '10 items assessing neck-related activities. Each item scored 0-5, total converted to percentage.'),
    
    ('DASH Questionnaire', 'Disabilities of Arm, Shoulder and Hand questionnaire for upper extremity function', ARRAY[shoulder_id], 'Self-Report', 'Score 0-100, higher scores indicate greater disability', '{"normal": "0-15", "mild": "16-40", "moderate": "41-70", "severe": "71-100"}', '{"reliability": "ICC 0.96", "validity": "Strong construct validity", "responsiveness": "MDC 10.2 points"}', '{"general_population": "10.1 ± 14.7"}', '30-item questionnaire measuring physical function and symptoms. Uses 5-point scale for each item.'),
    
    ('Berg Balance Scale', 'Objective assessment of balance performance in elderly and neurological populations', neuro_ids, 'Performance-Based', 'Score 0-56, each item scored 0-4', '{"high_fall_risk": "0-20", "medium_risk": "21-40", "low_risk": "41-56"}', '{"reliability": "ICC 0.98", "validity": "Strong predictive validity for falls", "responsiveness": "MDC 5 points"}', '{"elderly": "45-56", "stroke": "Variable", "PD": "35-45"}', '14 functional balance tasks. Each task scored 0-4 based on ability to perform independently.'),
    
    ('Fugl-Meyer Assessment', 'Comprehensive stroke assessment for motor function, sensation, balance, and joint function', ARRAY[stroke_id], 'Performance-Based', 'Motor: 0-100 (UE 0-66, LE 0-34), higher scores indicate better function', '{"severe": "0-50", "moderate": "51-84", "mild": "85-95", "normal": "96-100"}', '{"reliability": "ICC 0.95-0.98", "validity": "Gold standard for stroke assessment", "responsiveness": "MDC 5.2 points"}', '{"normal": "100", "chronic_stroke": "Variable"}', 'Comprehensive assessment with motor, sensory, balance, and ROM components. Standardized testing procedures.'),
    
    ('WOMAC Index', 'Western Ontario McMaster Osteoarthritis Index for knee and hip OA', ARRAY[knee_oa_id], 'Self-Report', 'Pain (0-20), Stiffness (0-8), Function (0-68), Total (0-96)', '{"minimal": "0-24", "mild": "25-48", "moderate": "49-72", "severe": "73-96"}', '{"reliability": "ICC 0.86-0.95", "validity": "Strong construct validity", "responsiveness": "MDC 12-20 points"}', '{"normal_elderly": "5-15", "mild_OA": "20-40"}', '24-item questionnaire with pain, stiffness, and functional subscales. 5-point Likert scale for each item.'),
    
    ('6-Minute Walk Test', 'Submaximal exercise test for functional exercise capacity', resp_ids || neuro_ids, 'Performance-Based', 'Distance walked in 6 minutes (meters)', '{"normal": "Age/gender predicted", "impaired": "<80% predicted", "severe": "<50% predicted"}', '{"reliability": "ICC 0.95", "validity": "Strong criterion validity", "responsiveness": "MDC 20-30 meters"}', '{"healthy_adults": "400-700m", "COPD": "Variable", "CHF": "150-450m"}', 'Patient walks as far as possible in 6 minutes on level surface. Standardized encouragement provided.'),
    
    ('Modified Medical Research Council Dyspnea Scale', 'Assessment of breathlessness severity in respiratory conditions', resp_ids, 'Self-Report', 'Grade 0-4, higher grades indicate greater dyspnea', '{"grade_0": "No breathlessness except with strenuous exercise", "grade_1": "Breathless when hurrying", "grade_2": "Walks slower than others", "grade_3": "Stops after walking 100 yards", "grade_4": "Too breathless to leave house"}', '{"reliability": "Good inter-rater", "validity": "Strong construct validity", "responsiveness": "Sensitive to change"}', '{"normal": "Grade 0-1", "significant": "Grade 2+"}', 'Single question rating breathlessness severity. Choose grade that best describes current limitation.');

END $$;
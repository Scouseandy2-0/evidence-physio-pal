-- Create comprehensive tables for real data integration

-- CPD Activities table to replace mock data
CREATE TABLE public.cpd_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('conference', 'course', 'webinar', 'workshop', 'reading', 'research')),
  category TEXT NOT NULL,
  hours_claimed NUMERIC NOT NULL CHECK (hours_claimed > 0),
  date_completed DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'planned')),
  provider TEXT,
  description TEXT,
  reflection TEXT,
  learning_outcomes TEXT[],
  certificate_url TEXT,
  verification_method TEXT,
  cpd_points NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Professional CPD requirements by region/body
CREATE TABLE public.cpd_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_body TEXT NOT NULL,
  region TEXT NOT NULL,
  healthcare_role TEXT NOT NULL,
  period_years INTEGER NOT NULL DEFAULT 2,
  required_hours NUMERIC NOT NULL,
  category_requirements JSONB DEFAULT '{}',
  specific_requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real treatment protocol templates based on clinical guidelines
CREATE TABLE public.protocol_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  condition_id UUID,
  category TEXT NOT NULL,
  evidence_base TEXT NOT NULL,
  guideline_source TEXT NOT NULL,
  phases JSONB NOT NULL DEFAULT '[]',
  interventions JSONB NOT NULL DEFAULT '[]',
  progression_criteria JSONB,
  outcome_measures TEXT[],
  contraindications TEXT[],
  precautions TEXT[],
  duration_weeks INTEGER,
  frequency_per_week INTEGER,
  evidence_level TEXT CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 10),
  peer_reviewed BOOLEAN DEFAULT false,
  validated_by UUID,
  validation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced assessment tools with real scoring and normative data
CREATE TABLE public.assessment_scoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID NOT NULL,
  scoring_algorithm JSONB NOT NULL,
  normative_data JSONB,
  interpretation_thresholds JSONB,
  reliability_data JSONB,
  validity_data JSONB,
  population_demographics JSONB,
  reference_papers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Professional licensing body integration
CREATE TABLE public.licensing_bodies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  healthcare_roles TEXT[] NOT NULL,
  api_endpoint TEXT,
  verification_method TEXT,
  license_format_regex TEXT,
  cpd_requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real clinical practice guidelines
CREATE TABLE public.clinical_guidelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  condition_category TEXT NOT NULL,
  publication_year INTEGER NOT NULL,
  last_updated DATE,
  guideline_url TEXT,
  summary TEXT,
  recommendations JSONB NOT NULL DEFAULT '[]',
  evidence_strength TEXT,
  target_population TEXT,
  clinical_questions TEXT[],
  key_recommendations TEXT[],
  implementation_notes TEXT,
  conflict_of_interest TEXT,
  funding_source TEXT,
  doi TEXT,
  citation TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cpd_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpd_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licensing_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_guidelines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own CPD activities" 
ON public.cpd_activities 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view CPD requirements" 
ON public.cpd_requirements 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Healthcare providers can view protocol templates" 
ON public.protocol_templates 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view assessment scoring" 
ON public.assessment_scoring 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view licensing bodies" 
ON public.licensing_bodies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view clinical guidelines" 
ON public.clinical_guidelines 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Add foreign key relationships
ALTER TABLE public.protocol_templates 
ADD CONSTRAINT fk_protocol_templates_condition 
FOREIGN KEY (condition_id) REFERENCES public.conditions(id);

ALTER TABLE public.assessment_scoring 
ADD CONSTRAINT fk_assessment_scoring_tool 
FOREIGN KEY (tool_id) REFERENCES public.assessment_tools(id);

-- Create indexes for performance
CREATE INDEX idx_cpd_activities_user_id ON public.cpd_activities(user_id);
CREATE INDEX idx_cpd_activities_date ON public.cpd_activities(date_completed);
CREATE INDEX idx_cpd_requirements_role ON public.cpd_requirements(healthcare_role, region);
CREATE INDEX idx_protocol_templates_condition ON public.protocol_templates(condition_id);
CREATE INDEX idx_clinical_guidelines_category ON public.clinical_guidelines(condition_category);
CREATE INDEX idx_clinical_guidelines_active ON public.clinical_guidelines(is_active);

-- Create triggers for updated_at
CREATE TRIGGER update_cpd_activities_updated_at
  BEFORE UPDATE ON public.cpd_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cpd_requirements_updated_at
  BEFORE UPDATE ON public.cpd_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_protocol_templates_updated_at
  BEFORE UPDATE ON public.protocol_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessment_scoring_updated_at
  BEFORE UPDATE ON public.assessment_scoring
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licensing_bodies_updated_at
  BEFORE UPDATE ON public.licensing_bodies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinical_guidelines_updated_at
  BEFORE UPDATE ON public.clinical_guidelines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
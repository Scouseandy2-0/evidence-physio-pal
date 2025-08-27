-- Create user profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  professional_title TEXT,
  registration_number TEXT,
  specialization TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create condition categories enum
CREATE TYPE public.condition_category AS ENUM ('msk', 'neurological', 'respiratory');

-- Create evidence level enum
CREATE TYPE public.evidence_level AS ENUM ('A', 'B', 'C', 'D');

-- Create conditions table
CREATE TABLE public.conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category condition_category NOT NULL,
  description TEXT,
  icd_codes TEXT[],
  keywords TEXT[],
  prevalence_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evidence table for storing research and guidelines
CREATE TABLE public.evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[],
  journal TEXT,
  publication_date DATE,
  doi TEXT,
  pmid TEXT,
  evidence_level evidence_level,
  study_type TEXT,
  abstract TEXT,
  key_findings TEXT,
  clinical_implications TEXT,
  grade_assessment JSONB,
  condition_ids UUID[],
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treatment protocols table
CREATE TABLE public.treatment_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  condition_id UUID REFERENCES public.conditions(id),
  description TEXT,
  protocol_steps JSONB,
  evidence_ids UUID[],
  contraindications TEXT[],
  precautions TEXT[],
  expected_outcomes TEXT,
  duration_weeks INTEGER,
  frequency_per_week INTEGER,
  created_by UUID REFERENCES public.profiles(user_id),
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessment tools table
CREATE TABLE public.assessment_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  condition_ids UUID[],
  tool_type TEXT,
  scoring_method TEXT,
  interpretation_guide JSONB,
  psychometric_properties JSONB,
  reference_values JSONB,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_conditions UUID[],
  notification_settings JSONB DEFAULT '{"new_evidence": true, "protocol_updates": true, "weekly_digest": false}',
  display_preferences JSONB DEFAULT '{"evidence_level_filter": ["A", "B"], "default_view": "conditions"}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for conditions (public read)
CREATE POLICY "Anyone can view conditions" 
  ON public.conditions FOR SELECT 
  USING (true);

-- Create RLS policies for evidence (public read)
CREATE POLICY "Anyone can view active evidence" 
  ON public.evidence FOR SELECT 
  USING (is_active = true);

-- Create RLS policies for treatment protocols
CREATE POLICY "Anyone can view validated protocols" 
  ON public.treatment_protocols FOR SELECT 
  USING (is_validated = true);

CREATE POLICY "Users can create treatment protocols" 
  ON public.treatment_protocols FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own protocols" 
  ON public.treatment_protocols FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create RLS policies for assessment tools (public read)
CREATE POLICY "Anyone can view assessment tools" 
  ON public.assessment_tools FOR SELECT 
  USING (true);

-- Create RLS policies for user preferences
CREATE POLICY "Users can manage their own preferences" 
  ON public.user_preferences FOR ALL 
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conditions_updated_at
  BEFORE UPDATE ON public.conditions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at
  BEFORE UPDATE ON public.evidence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatment_protocols_updated_at
  BEFORE UPDATE ON public.treatment_protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create user profile and preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_conditions_category ON public.conditions(category);
CREATE INDEX idx_evidence_condition_ids ON public.evidence USING GIN(condition_ids);
CREATE INDEX idx_evidence_publication_date ON public.evidence(publication_date);
CREATE INDEX idx_evidence_level ON public.evidence(evidence_level);
CREATE INDEX idx_treatment_protocols_condition ON public.treatment_protocols(condition_id);
CREATE INDEX idx_assessment_tools_condition_ids ON public.assessment_tools USING GIN(condition_ids);
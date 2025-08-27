-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  primary_condition TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discharged', 'on_hold')),
  therapist_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_sessions table
CREATE TABLE public.patient_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  interventions TEXT[] DEFAULT '{}',
  outcomes JSONB DEFAULT '{}',
  notes TEXT,
  next_session_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collaboration_shared_protocols table for protocol sharing
CREATE TABLE public.collaboration_shared_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.treatment_protocols(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with UUID,
  is_public BOOLEAN DEFAULT false,
  access_level TEXT NOT NULL DEFAULT 'view' CHECK (access_level IN ('view', 'comment', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create protocol_reviews table for peer review
CREATE TABLE public.protocol_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.treatment_protocols(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  recommendations TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cpd_activities table for continuing education tracking
CREATE TABLE public.cpd_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('course', 'workshop', 'conference', 'webinar', 'reading', 'research', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT,
  date_completed DATE NOT NULL,
  hours_claimed DECIMAL(4,2) NOT NULL,
  cpd_points DECIMAL(4,2),
  verification_method TEXT,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_shared_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpd_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients
CREATE POLICY "Therapists can manage their own patients" ON public.patients
  FOR ALL USING (auth.uid() = therapist_id);

-- Create RLS policies for patient_sessions
CREATE POLICY "Therapists can manage sessions for their patients" ON public.patient_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.patients p 
      WHERE p.id = patient_sessions.patient_id 
      AND p.therapist_id = auth.uid()
    )
  );

-- Create RLS policies for collaboration_shared_protocols
CREATE POLICY "Users can view shared protocols" ON public.collaboration_shared_protocols
  FOR SELECT USING (
    auth.uid() = shared_by OR 
    auth.uid() = shared_with OR 
    is_public = true
  );

CREATE POLICY "Users can share their own protocols" ON public.collaboration_shared_protocols
  FOR INSERT WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can update their shared protocols" ON public.collaboration_shared_protocols
  FOR UPDATE USING (auth.uid() = shared_by);

-- Create RLS policies for protocol_reviews
CREATE POLICY "Users can view reviews for accessible protocols" ON public.protocol_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.treatment_protocols tp
      WHERE tp.id = protocol_reviews.protocol_id
      AND (tp.created_by = auth.uid() OR tp.is_validated = true)
    )
  );

CREATE POLICY "Users can create reviews" ON public.protocol_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON public.protocol_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Create RLS policies for cpd_activities
CREATE POLICY "Users can manage their own CPD activities" ON public.cpd_activities
  FOR ALL USING (auth.uid() = user_id);

-- Create update triggers for timestamps
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_sessions_updated_at
  BEFORE UPDATE ON public.patient_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaboration_shared_protocols_updated_at
  BEFORE UPDATE ON public.collaboration_shared_protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_protocol_reviews_updated_at
  BEFORE UPDATE ON public.protocol_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cpd_activities_updated_at
  BEFORE UPDATE ON public.cpd_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
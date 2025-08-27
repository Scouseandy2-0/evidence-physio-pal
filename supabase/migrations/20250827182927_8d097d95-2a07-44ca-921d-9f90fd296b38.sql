-- Create notifications table for real-time updates
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to update their own notifications
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for system to insert notifications
CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create analytics_sessions table for practice analytics
CREATE TABLE public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  condition_id UUID REFERENCES public.conditions(id),
  session_type TEXT NOT NULL, -- assessment, treatment, follow_up
  duration_minutes INTEGER,
  outcomes JSONB DEFAULT '{}',
  interventions TEXT[],
  notes TEXT,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for therapists to manage their own session analytics
CREATE POLICY "Therapists can manage their own session analytics" 
ON public.analytics_sessions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_analytics_sessions_updated_at
  BEFORE UPDATE ON public.analytics_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create study_groups table for collaboration
CREATE TABLE public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 20,
  is_public BOOLEAN DEFAULT true,
  meeting_schedule JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- Create policy for public study groups
CREATE POLICY "Anyone can view public study groups" 
ON public.study_groups 
FOR SELECT 
USING (is_public = true);

-- Create policy for creators to manage their groups
CREATE POLICY "Creators can manage their study groups" 
ON public.study_groups 
FOR ALL 
USING (auth.uid() = created_by);

-- Create study_group_members table
CREATE TABLE public.study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- member, moderator, admin
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

-- Create policy for group members to view memberships
CREATE POLICY "Users can view study group memberships" 
ON public.study_group_members 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.study_groups sg 
    WHERE sg.id = group_id AND sg.is_public = true
  )
);

-- Create policy for users to join groups
CREATE POLICY "Users can join study groups" 
ON public.study_group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to leave groups
CREATE POLICY "Users can leave study groups" 
ON public.study_group_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for study groups updated_at
CREATE TRIGGER update_study_groups_updated_at
  BEFORE UPDATE ON public.study_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Create evidence_access_logs table to track real evidence usage
CREATE TABLE public.evidence_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  evidence_id UUID,
  action_type TEXT NOT NULL DEFAULT 'view', -- view, search, download, bookmark
  search_query TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evidence_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own evidence access logs" 
ON public.evidence_access_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own evidence access logs" 
ON public.evidence_access_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create user_activity_stats table for comprehensive analytics
CREATE TABLE public.user_activity_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logins_count INTEGER DEFAULT 0,
  evidence_searches INTEGER DEFAULT 0,
  evidence_views INTEGER DEFAULT 0,
  protocols_created INTEGER DEFAULT 0,
  protocols_shared INTEGER DEFAULT 0,
  assessments_completed INTEGER DEFAULT 0,
  cpd_activities INTEGER DEFAULT 0,
  collaboration_interactions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS
ALTER TABLE public.user_activity_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own activity stats" 
ON public.user_activity_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activity stats" 
ON public.user_activity_stats 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_activity_stats_updated_at
BEFORE UPDATE ON public.user_activity_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update or insert daily activity stats
CREATE OR REPLACE FUNCTION public.update_user_activity_stat(
  stat_type TEXT,
  increment_value INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_activity_stats (
    user_id, 
    activity_date,
    logins_count,
    evidence_searches,
    evidence_views,
    protocols_created,
    protocols_shared,
    assessments_completed,
    cpd_activities,
    collaboration_interactions
  ) VALUES (
    auth.uid(),
    CURRENT_DATE,
    CASE WHEN stat_type = 'login' THEN increment_value ELSE 0 END,
    CASE WHEN stat_type = 'evidence_search' THEN increment_value ELSE 0 END,
    CASE WHEN stat_type = 'evidence_view' THEN increment_value ELSE 0 END,
    CASE WHEN stat_type = 'protocol_created' THEN increment_value ELSE 0 END,
    CASE WHEN stat_type = 'protocol_shared' THEN increment_value ELSE 0 END,
    CASE WHEN stat_type = 'assessment_completed' THEN increment_value ELSE 0 END,
    CASE WHEN stat_type = 'cpd_activity' THEN increment_value ELSE 0 END,
    CASE WHEN stat_type = 'collaboration' THEN increment_value ELSE 0 END
  )
  ON CONFLICT (user_id, activity_date) 
  DO UPDATE SET
    logins_count = user_activity_stats.logins_count + 
      CASE WHEN stat_type = 'login' THEN increment_value ELSE 0 END,
    evidence_searches = user_activity_stats.evidence_searches + 
      CASE WHEN stat_type = 'evidence_search' THEN increment_value ELSE 0 END,
    evidence_views = user_activity_stats.evidence_views + 
      CASE WHEN stat_type = 'evidence_view' THEN increment_value ELSE 0 END,
    protocols_created = user_activity_stats.protocols_created + 
      CASE WHEN stat_type = 'protocol_created' THEN increment_value ELSE 0 END,
    protocols_shared = user_activity_stats.protocols_shared + 
      CASE WHEN stat_type = 'protocol_shared' THEN increment_value ELSE 0 END,
    assessments_completed = user_activity_stats.assessments_completed + 
      CASE WHEN stat_type = 'assessment_completed' THEN increment_value ELSE 0 END,
    cpd_activities = user_activity_stats.cpd_activities + 
      CASE WHEN stat_type = 'cpd_activity' THEN increment_value ELSE 0 END,
    collaboration_interactions = user_activity_stats.collaboration_interactions + 
      CASE WHEN stat_type = 'collaboration' THEN increment_value ELSE 0 END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
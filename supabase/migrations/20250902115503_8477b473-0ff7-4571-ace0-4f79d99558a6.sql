-- Fix the search_path security issue for the function
DROP FUNCTION IF EXISTS public.update_user_activity_stat(TEXT, INTEGER);

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
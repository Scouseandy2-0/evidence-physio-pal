import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useActivityTracking = () => {
  const { user } = useAuth();

  const trackActivity = useCallback(async (activityType: string, incrementValue: number = 1) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_user_activity_stat', {
        stat_type: activityType,
        increment_value: incrementValue
      });

      if (error) {
        console.warn('Failed to track activity:', error);
      }
    } catch (error) {
      console.warn('Activity tracking error:', error);
    }
  }, [user]);

  const trackEvidenceView = useCallback(async (evidenceId?: string, searchQuery?: string) => {
    if (!user) return;

    try {
      // Track in evidence access logs
      const { error: logError } = await supabase
        .from('evidence_access_logs')
        .insert({
          user_id: user.id,
          evidence_id: evidenceId,
          action_type: evidenceId ? 'view' : 'search',
          search_query: searchQuery
        });

      if (logError) {
        console.warn('Failed to log evidence access:', logError);
      }

      // Track in activity stats
      await trackActivity(evidenceId ? 'evidence_view' : 'evidence_search');
    } catch (error) {
      console.warn('Evidence tracking error:', error);
    }
  }, [user, trackActivity]);

  return {
    trackActivity,
    trackEvidenceView,
    trackLogin: () => trackActivity('login'),
    trackProtocolCreated: () => trackActivity('protocol_created'),
    trackProtocolShared: () => trackActivity('protocol_shared'),
    trackAssessmentCompleted: () => trackActivity('assessment_completed'),
    trackCPDActivity: () => trackActivity('cpd_activity'),
    trackCollaboration: () => trackActivity('collaboration')
  };
};
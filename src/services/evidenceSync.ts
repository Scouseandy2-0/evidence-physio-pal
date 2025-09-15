import { supabase } from "@/integrations/supabase/client";

export class EvidenceSyncService {
  private static lastSyncKey = 'evidence_last_sync';
  private static syncIntervalHours = 24; // Sync once per day
  
  static async shouldSync(): Promise<boolean> {
    const lastSync = localStorage.getItem(this.lastSyncKey);
    if (!lastSync) return true;
    
    const lastSyncTime = new Date(lastSync);
    const now = new Date();
    const hoursSinceLastSync = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastSync >= this.syncIntervalHours;
  }
  
  static async syncEvidenceOnLogin(userId: string): Promise<void> {
    console.log('🔄 Starting evidence sync for user:', userId);
    
    try {
      // Check if sync is needed
      if (!(await this.shouldSync())) {
        console.log('📊 Evidence sync not needed, last sync was recent');
        return;
      }
      
      // Get user preferences for relevant conditions
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferred_conditions')
        .eq('user_id', userId)
        .single();
      
      const preferredConditions = preferences?.preferred_conditions || [];
      
      // Sync evidence from external databases
      await Promise.all([
        this.syncPubMedEvidence(preferredConditions),
        this.syncCochraneEvidence(preferredConditions),
        this.syncPedroEvidence(preferredConditions),
        this.syncNiceGuidelines(preferredConditions)
      ]);
      
      // Update last sync timestamp
      localStorage.setItem(this.lastSyncKey, new Date().toISOString());
      
      console.log('✅ Evidence sync completed successfully');
      
    } catch (error) {
      console.error('❌ Evidence sync failed:', error);
    }
  }
  
  private static async syncPubMedEvidence(conditions: string[]): Promise<void> {
    try {
      console.log('🔄 Syncing PubMed evidence...');
      
      const searchTerms = conditions.length > 0 
        ? conditions.slice(0, 3).join(' OR ') // Limit to avoid rate limits
        : 'physiotherapy rehabilitation';
        
      const { data, error } = await supabase.functions.invoke('pubmed-integration', {
        body: { 
          query: searchTerms,
          maxResults: 10,
          autoSync: true
        }
      });
      
      if (error) {
        console.warn('PubMed sync warning:', error);
      } else {
        console.log(`📚 PubMed: ${data?.results?.length || 0} new articles found`);
      }
    } catch (error) {
      console.warn('PubMed sync error:', error);
    }
  }
  
  private static async syncCochraneEvidence(conditions: string[]): Promise<void> {
    try {
      console.log('🔄 Syncing Cochrane evidence...');
      
      const searchTerms = conditions.length > 0 
        ? conditions.slice(0, 2).join(' OR ')
        : 'physiotherapy';
        
      const { data, error } = await supabase.functions.invoke('cochrane-integration', {
        body: { 
          query: searchTerms,
          maxResults: 5,
          autoSync: true
        }
      });
      
      if (error) {
        console.warn('Cochrane sync warning:', error);
      } else {
        console.log(`📚 Cochrane: ${data?.results?.length || 0} new reviews found`);
      }
    } catch (error) {
      console.warn('Cochrane sync error:', error);
    }
  }
  
  private static async syncPedroEvidence(conditions: string[]): Promise<void> {
    try {
      console.log('🔄 Syncing PEDro evidence...');
      
      const searchTerms = conditions.length > 0 
        ? conditions.slice(0, 2).join(' OR ')
        : 'physiotherapy';
        
      const { data, error } = await supabase.functions.invoke('pedro-integration', {
        body: { 
          query: searchTerms,
          maxResults: 5,
          autoSync: true
        }
      });
      
      if (error) {
        console.warn('PEDro sync warning:', error);
      } else {
        console.log(`📚 PEDro: ${data?.results?.length || 0} new studies found`);
      }
    } catch (error) {
      console.warn('PEDro sync error:', error);
    }
  }
  
  private static async syncNiceGuidelines(conditions: string[]): Promise<void> {
    try {
      console.log('🔄 Syncing NICE guidelines...');
      
      const searchTerms = conditions.length > 0 
        ? conditions.slice(0, 2).join(' OR ')
        : 'physiotherapy rehabilitation';
        
      const { data, error } = await supabase.functions.invoke('guidelines-integration', {
        body: { 
          query: searchTerms,
          maxResults: 5,
          autoSync: true
        }
      });
      
      if (error) {
        console.warn('NICE sync warning:', error);
      } else {
        console.log(`📚 NICE: ${data?.results?.length || 0} new guidelines found`);
      }
    } catch (error) {
      console.warn('NICE sync error:', error);
    }
  }
  
  static async getLastSyncInfo(): Promise<{ lastSync: Date | null, needsSync: boolean }> {
    const lastSyncStr = localStorage.getItem(this.lastSyncKey);
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;
    const needsSync = await this.shouldSync();
    
    return { lastSync, needsSync };
  }
  
  static async forceSyncEvidence(userId: string): Promise<void> {
    // Remove last sync timestamp to force sync
    localStorage.removeItem(this.lastSyncKey);
    await this.syncEvidenceOnLogin(userId);
  }
}
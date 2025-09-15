import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { EvidenceSyncService } from "@/services/evidenceSync";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth: Setting up authentication context');
    
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('useAuth: Initial session check', { session: !!session, error });
      
      if (error) {
        console.error('useAuth: Session check error:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Track login if user exists
      if (session?.user) {
        trackUserLogin(session.user.id);
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('useAuth: Session check failed:', error);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('useAuth: Auth state changed', { event, session: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Track login on auth state change to active session
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          trackUserLogin(session.user.id);
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log('useAuth: Cleaning up auth context listener');
      subscription.unsubscribe();
    };
  }, []);

  const trackUserLogin = async (userId: string) => {
    try {
      console.log('🔍 Tracking user login for:', userId);
      
      // Track login activity
      const { error: trackingError } = await supabase.rpc('update_user_activity_stat', {
        stat_type: 'login',
        increment_value: 1
      });
      
      if (trackingError) {
        console.warn('Failed to track login activity:', trackingError);
      } else {
        console.log('✅ Login activity tracked successfully');
      }
      
      // Start evidence sync in background - don't await to avoid blocking login
      setTimeout(async () => {
        try {
          await EvidenceSyncService.syncEvidenceOnLogin(userId);
        } catch (syncError) {
          console.warn('Background evidence sync failed:', syncError);
        }
      }, 1000); // Delay sync by 1 second to allow UI to load first
      
    } catch (error) {
      console.warn('Login tracking error:', error);
    }
  };

  const signOut = async () => {
    console.log('useAuth: Signing out user');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('useAuth: Sign out error:', error);
      } else {
        console.log('useAuth: Sign out successful');
      }
    } catch (error) {
      console.error('useAuth: Sign out exception:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface SubscriptionContextType {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user || !session) {
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First check if we have a record in the subscribers table
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriberData && !subscriberError) {
        // Use local data if available and recent
        const updatedAt = new Date(subscriberData.updated_at);
        const now = new Date();
        const isRecent = (now.getTime() - updatedAt.getTime()) < 60000; // 1 minute

        if (isRecent) {
          setSubscribed(subscriberData.subscribed || false);
          setSubscriptionTier(subscriberData.subscription_tier || null);
          setSubscriptionEnd(subscriberData.subscription_end || null);
          setLoading(false);
          return;
        }
      }

      // If no recent data, check with Stripe
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        
        // Fallback to local data if edge function fails
        if (subscriberData) {
          setSubscribed(subscriberData.subscribed || false);
          setSubscriptionTier(subscriberData.subscription_tier || null);
          setSubscriptionEnd(subscriberData.subscription_end || null);
        } else {
          // Default to free if no data
          setSubscribed(false);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
        }
        return;
      }

      setSubscribed(data.subscribed || false);
      setSubscriptionTier(data.subscription_tier || null);
      setSubscriptionEnd(data.subscription_end || null);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      
      // Try to get fallback data from subscribers table
      try {
        const { data: fallbackData } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (fallbackData) {
          setSubscribed(fallbackData.subscribed || false);
          setSubscriptionTier(fallbackData.subscription_tier || null);
          setSubscriptionEnd(fallbackData.subscription_end || null);
        } else {
          setSubscribed(false);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
        }
      } catch {
        // Ultimate fallback
        setSubscribed(false);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async () => {
    if (!user || !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      // Show success message
      toast({
        title: "Redirecting to Payment",
        description: "Opening Stripe checkout in a new tab...",
      });
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Payment Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Customer portal error:', error);
        toast({
          title: "Portal Error",
          description: error.message || "Failed to open customer portal. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        toast({
          title: "Error",
          description: "No portal URL received. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
      
      // Show success message
      toast({
        title: "Redirecting to Portal",
        description: "Opening customer portal in a new tab...",
      });
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Portal Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check subscription on auth state changes
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        checkSubscription();
      }, 0);
    } else {
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setLoading(false);
    }
  }, [user, session]);

  // Auto-refresh subscription status every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{
      subscribed,
      subscriptionTier,
      subscriptionEnd,
      loading,
      checkSubscription,
      createCheckout,
      openCustomerPortal,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
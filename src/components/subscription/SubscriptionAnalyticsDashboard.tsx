import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  DollarSign, 
  Target,
  UserPlus,
  Crown
} from "lucide-react";

interface SubscriberStats {
  total_subscribers: number;
  active_subscribers: number;
  trial_users: number;
  basic_users: number;
  professional_users: number;
  enterprise_users: number;
  estimated_mrr: number;
}

export const SubscriptionAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SubscriberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase.rpc('is_admin', { user_id: user.id });
        setIsAdmin(data || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      
      try {
        // Get subscriber counts - using current database structure
        const { data: subscribers, error } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_tier');

        if (error) throw error;

        if (subscribers) {
          const totalSubscribers = subscribers.length;
          const activeSubscribers = subscribers.filter(s => s.subscribed).length;
          const trialUsers = 0; // Will be updated after migration
          const basicUsers = subscribers.filter(s => s.subscription_tier === 'basic').length;
          const professionalUsers = subscribers.filter(s => s.subscription_tier === 'professional').length;
          const enterpriseUsers = subscribers.filter(s => s.subscription_tier === 'enterprise').length;
          
          // Calculate estimated MRR (assuming basic plan for existing subscribers)
          const estimatedMrr = activeSubscribers * 3.99;

          setStats({
            total_subscribers: totalSubscribers,
            active_subscribers: activeSubscribers,
            trial_users: trialUsers,
            basic_users: basicUsers,
            professional_users: professionalUsers,
            enterprise_users: enterpriseUsers,
            estimated_mrr: estimatedMrr
          });
        }
      } catch (error) {
        console.error('Error fetching subscription stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (!user || !isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Crown className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Admin access required</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Subscription Analytics</h2>
        <p className="text-muted-foreground">Overview of subscription metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">Paying customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.trial_users || 0}</div>
            <p className="text-xs text-muted-foreground">On free trial</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{(stats?.estimated_mrr || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Plan</CardTitle>
            <CardDescription>£3.99/month subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.basic_users || 0}</div>
            <p className="text-sm text-muted-foreground">subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Plan</CardTitle>
            <CardDescription>£9.99/month subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.professional_users || 0}</div>
            <p className="text-sm text-muted-foreground">subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise Plan</CardTitle>
            <CardDescription>£19.99/month subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.enterprise_users || 0}</div>
            <p className="text-sm text-muted-foreground">subscribers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
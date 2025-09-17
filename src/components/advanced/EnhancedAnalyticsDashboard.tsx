import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PremiumFeature } from "@/components/subscription/PremiumFeature";
import { useSubscription } from "@/hooks/useSubscription";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  Clock,
  Target,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  sessionStats: any[];
  outcomeMetrics: any[];
  patientProgress: any[];
  conditionDistribution: any[];
  treatmentEffectiveness: any[];
}

export const EnhancedAnalyticsDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribed } = useSubscription();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    if (user && subscribed) {
      fetchAnalyticsData();
    }
  }, [user, subscribed, dateRange]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch session analytics
      const { data: sessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString());

      if (sessionsError) throw sessionsError;

      // Fetch patient sessions for progress tracking
      const { data: patientSessions, error: patientSessionsError } = await supabase
        .from('patient_sessions')
        .select('*')
        .gte('session_date', new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString());

      if (patientSessionsError) throw patientSessionsError;

      // Process data for charts
      const processedData = processAnalyticsData(sessions || [], patientSessions || []);
      setAnalyticsData(processedData);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (sessions: any[], patientSessions: any[]): AnalyticsData => {
    // Session statistics by day
    const sessionStats = sessions.reduce((acc: any[], session) => {
      const date = new Date(session.created_at).toLocaleDateString();
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.sessions += 1;
        existing.totalDuration += session.duration_minutes || 0;
        existing.avgSatisfaction = (existing.avgSatisfaction + (session.satisfaction_score || 0)) / 2;
      } else {
        acc.push({
          date,
          sessions: 1,
          totalDuration: session.duration_minutes || 0,
          avgSatisfaction: session.satisfaction_score || 0
        });
      }
      return acc;
    }, []);

    // Outcome metrics
    const outcomeMetrics = sessions.map(session => ({
      session_id: session.id,
      satisfaction: session.satisfaction_score || 0,
      duration: session.duration_minutes || 0,
      type: session.session_type,
      outcomes: session.outcomes || {}
    }));

    // Patient progress over time
    const patientProgress = patientSessions.map(session => ({
      date: new Date(session.session_date).toLocaleDateString(),
      progress: session.outcomes?.progress_score || 0,
      patient_id: session.patient_id
    }));

    // Condition distribution
    const conditionCounts = sessions.reduce((acc: Record<string, number>, session) => {
      const condition = session.session_type || 'Unknown';
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {});

    const conditionDistribution = Object.entries(conditionCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Treatment effectiveness
    const treatmentEffectiveness = sessions
      .filter(s => s.satisfaction_score && s.outcomes)
      .map(session => ({
        treatment: session.session_type,
        effectiveness: session.satisfaction_score,
        outcomes: Object.keys(session.outcomes || {}).length
      }));

    return {
      sessionStats,
      outcomeMetrics,
      patientProgress,
      conditionDistribution,
      treatmentEffectiveness
    };
  };

  const exportAnalytics = () => {
    if (!analyticsData) return;

    const exportData = {
      generated_at: new Date().toISOString(),
      date_range: `${dateRange} days`,
      therapist_id: user?.id,
      ...analyticsData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Analytics Exported",
      description: "Analytics data has been downloaded",
    });
  };

  if (!subscribed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PremiumFeature feature="Enhanced Analytics Dashboard" showUpgrade={true}>
          <div className="text-center py-12">
            <BarChart className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Enhanced Analytics Dashboard</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Advanced analytics and insights for patient outcomes, treatment effectiveness, and practice management.
            </p>
          </div>
        </PremiumFeature>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Analytics Dashboard</h1>
          <p className="text-muted-foreground">Advanced insights and treatment outcomes</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analyticsData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.sessionStats.reduce((sum, stat) => sum + stat.sessions, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last {dateRange} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    analyticsData.sessionStats.reduce((sum, stat) => sum + stat.totalDuration, 0) /
                    Math.max(analyticsData.sessionStats.reduce((sum, stat) => sum + stat.sessions, 0), 1)
                  )} min
                </div>
                <p className="text-xs text-muted-foreground">
                  Per session average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analyticsData.sessionStats.reduce((sum, stat) => sum + stat.avgSatisfaction, 0) /
                    Math.max(analyticsData.sessionStats.length, 1)).toFixed(1)}/10
                </div>
                <p className="text-xs text-muted-foreground">
                  Average rating
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conditions Treated</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.conditionDistribution.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Different conditions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="sessions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sessions">Session Trends</TabsTrigger>
              <TabsTrigger value="conditions">Condition Distribution</TabsTrigger>
              <TabsTrigger value="outcomes">Treatment Outcomes</TabsTrigger>
              <TabsTrigger value="progress">Patient Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Session Activity Over Time</CardTitle>
                  <CardDescription>Daily session count and duration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.sessionStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sessions" stroke="#8884d8" name="Sessions" />
                      <Line type="monotone" dataKey="totalDuration" stroke="#82ca9d" name="Duration (min)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Condition Distribution</CardTitle>
                  <CardDescription>Breakdown of treated conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.conditionDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.conditionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Effectiveness</CardTitle>
                  <CardDescription>Satisfaction scores by treatment type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.treatmentEffectiveness}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="treatment" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="effectiveness" fill="#8884d8" name="Satisfaction Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Progress Tracking</CardTitle>
                  <CardDescription>Progress scores over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.patientProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="progress" stroke="#8884d8" name="Progress Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground">
              Start recording patient sessions to see analytics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
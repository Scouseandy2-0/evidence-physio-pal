import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  TrendingUp,
  BookOpen,
  Users,
  Award,
  Clock,
  Heart,
  Target,
  BarChart3,
  Bell,
  Star,
  CheckCircle
} from "lucide-react";

interface DashboardData {
  recentEvidence: any[];
  savedProtocols: any[];
  cpdProgress: any;
  notifications: any[];
  favoriteConditions: string[];
}

interface CPDRecord {
  id: string;
  activity_type: string;
  title: string;
  date: string;
  hours: number;
  category: string;
  status: 'completed' | 'in_progress' | 'planned';
}

export const PersonalizedDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    recentEvidence: [],
    savedProtocols: [],
    cpdProgress: null,
    notifications: [],
    favoriteConditions: []
  });
  const [cpdRecords, setCpdRecords] = useState<CPDRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchCPDRecords();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id || '')
        .single();

      // Fetch recent evidence based on user's preferred conditions
      const { data: evidence } = await supabase
        .from('evidence')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch user's saved protocols
      const { data: protocols } = await supabase
        .from('treatment_protocols')
        .select('*')
        .eq('created_by', user?.id || '')
        .order('created_at', { ascending: false })
        .limit(3);

      setDashboardData({
        recentEvidence: evidence || [],
        savedProtocols: protocols || [],
        cpdProgress: {
          completed: 25,
          required: 40,
          deadline: '2024-12-31'
        },
        notifications: [
          { id: 1, type: 'evidence', message: 'New systematic review available for Low Back Pain', time: '2 hours ago' },
          { id: 2, type: 'protocol', message: 'Your stroke protocol was validated by peer review', time: '1 day ago' },
          { id: 3, type: 'cpd', message: 'CPD deadline approaching - 3 months remaining', time: '3 days ago' }
        ],
        favoriteConditions: preferences?.preferred_conditions || []
      });

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCPDRecords = async () => {
    // Mock CPD data - in real implementation, this would come from a CPD table
    const mockCPDRecords: CPDRecord[] = [
      {
        id: '1',
        activity_type: 'Conference',
        title: 'International Physiotherapy Conference 2024',
        date: '2024-03-15',
        hours: 8,
        category: 'Professional Development',
        status: 'completed'
      },
      {
        id: '2',
        activity_type: 'Course',
        title: 'Advanced Manual Therapy Techniques',
        date: '2024-06-20',
        hours: 12,
        category: 'Clinical Skills',
        status: 'in_progress'
      },
      {
        id: '3',
        activity_type: 'Webinar',
        title: 'Evidence-Based Practice in Neurological Rehabilitation',
        date: '2024-09-10',
        hours: 2,
        category: 'Evidence-Based Practice',
        status: 'planned'
      }
    ];
    setCpdRecords(mockCPDRecords);
  };

  const QuickStatsCard = ({ icon: Icon, title, value, trend, color }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${color}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
          {trend && (
            <Badge variant={trend > 0 ? "default" : "secondary"}>
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const RecentEvidenceCard = ({ evidence }: { evidence: any }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm line-clamp-2">{evidence.title}</h4>
          <Badge variant="outline" className="ml-2">
            {evidence.evidence_level}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{evidence.journal}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{new Date(evidence.publication_date).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  const CPDProgressCard = () => {
    const progress = dashboardData.cpdProgress;
    if (!progress) return null;

    const percentage = (progress.completed / progress.required) * 100;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            CPD Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed</span>
              <span>{progress.completed}/{progress.required} hours</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{progress.completed}</div>
              <div className="text-xs text-muted-foreground">Hours Completed</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{progress.required - progress.completed}</div>
              <div className="text-xs text-muted-foreground">Hours Remaining</div>
            </div>
          </div>

          <div className="space-y-2">
            {cpdRecords.slice(0, 3).map(record => (
              <div key={record.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium text-sm">{record.title}</p>
                  <p className="text-xs text-muted-foreground">{record.hours} hours • {record.category}</p>
                </div>
                <Badge variant={
                  record.status === 'completed' ? 'default' : 
                  record.status === 'in_progress' ? 'secondary' : 'outline'
                }>
                  {record.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link to="/cpd">
              <BookOpen className="h-4 w-4 mr-2" />
              View All CPD Records
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.user_metadata?.first_name || 'Professional'}</h1>
          <p className="text-muted-foreground">Here's your personalized evidence and progress overview</p>
        </div>
        <Button>
          <Bell className="h-4 w-4 mr-2" />
          Notifications ({dashboardData.notifications.length})
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickStatsCard
          icon={BookOpen}
          title="Evidence Reviews"
          value="47"
          trend={12}
          color="bg-blue-500"
        />
        <QuickStatsCard
          icon={Users}
          title="Protocols Created"
          value={dashboardData.savedProtocols.length}
          trend={null}
          color="bg-green-500"
        />
        <QuickStatsCard
          icon={Award}
          title="CPD Hours"
          value={dashboardData.cpdProgress?.completed || 0}
          trend={8}
          color="bg-purple-500"
        />
        <QuickStatsCard
          icon={Star}
          title="Peer Reviews"
          value="12"
          trend={25}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Evidence */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Evidence
              </CardTitle>
              <CardDescription>
                Latest research relevant to your practice areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recentEvidence.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentEvidence.map(evidence => (
                    <RecentEvidenceCard key={evidence.id} evidence={evidence} />
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/evidence">
                      View All Evidence
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent evidence available</p>
                  <Button variant="outline" className="mt-2" asChild>
                    <Link to="/evidence">Browse Evidence Library</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CPD Progress */}
        <div>
          <CPDProgressCard />
        </div>
      </div>

      {/* My Protocols & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              My Treatment Protocols
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.savedProtocols.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.savedProtocols.map(protocol => (
                  <div key={protocol.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{protocol.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {protocol.duration_weeks} weeks • {protocol.frequency_per_week}x/week
                      </p>
                    </div>
                    <Badge variant={protocol.is_validated ? "default" : "secondary"}>
                      {protocol.is_validated ? "Validated" : "Draft"}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/protocols">
                    Create New Protocol
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No protocols created yet</p>
                <Button asChild>
                  <Link to="/protocols">
                    <Target className="h-4 w-4 mr-2" />
                    Create First Protocol
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.notifications.map(notification => (
                <div key={notification.id} className="flex items-start gap-3 p-3 border rounded">
                  <div className="mt-1">
                    {notification.type === 'evidence' && <BookOpen className="h-4 w-4 text-blue-500" />}
                    {notification.type === 'protocol' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {notification.type === 'cpd' && <Clock className="h-4 w-4 text-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dashboard">
                  View All Notifications
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumFeature } from "@/components/subscription/PremiumFeature";
import { supabase } from "@/integrations/supabase/client";
import {
  Award,
  Calendar,
  Clock,
  BookOpen,
  Users,
  TrendingUp,
  Plus,
  Download,
  Upload,
  CheckCircle,
  Target,
  BarChart3,
  Monitor
} from "lucide-react";

interface CPDActivity {
  id: string;
  title: string;
  activity_type: 'conference' | 'course' | 'webinar' | 'workshop' | 'reading' | 'research';
  category: string;
  hours_claimed: number;
  date_completed: string;
  status?: 'completed' | 'in_progress' | 'planned';
  certificate_url?: string;
  reflection?: string;
  learning_outcomes?: string[];
  provider?: string;
  description?: string;
  cpd_points?: number;
  verification_method?: string;
  notes?: string;
}

interface CPDRequirement {
  id: string;
  professional_body: string;
  region: string;
  healthcare_role: string;
  period_years: number;
  required_hours: number;
  category_requirements: any;
  specific_requirements: string[];
}

export const CPDTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribed } = useSubscription();
  
  const [activities, setActivities] = useState<CPDActivity[]>([]);
  const [requirements, setRequirements] = useState<CPDRequirement[]>([]);
  const [newActivity, setNewActivity] = useState<Partial<CPDActivity>>({
    title: '',
    activity_type: 'conference',
    category: '',
    hours_claimed: 0,
    date_completed: '',
    status: 'completed',
    reflection: '',
    learning_outcomes: []
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadCPDData();
    }
  }, [user]);

  const loadCPDData = async () => {
    try {
      // Fetch user's CPD activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('cpd_activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('date_completed', { ascending: false });

      if (activitiesError) throw activitiesError;

      setActivities(activitiesData?.map(activity => ({
        ...activity,
        category: 'General', // Add default category since it doesn't exist in DB
        activity_type: activity.activity_type as CPDActivity['activity_type'] // Type assertion
      })) || []);
      
      // Create mock requirements for now since the table might not be populated yet
      const mockRequirements: CPDRequirement[] = [
        {
          id: '1',
          professional_body: 'APTA',
          region: 'USA',
          healthcare_role: 'physiotherapist',
          period_years: 2,
          required_hours: 30,
          category_requirements: {},
          specific_requirements: ['Clinical Practice', 'Ethics', 'Research']
        }
      ];
      setRequirements(mockRequirements);
    } catch (error: any) {
      toast({
        title: "Error loading CPD data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addActivity = async () => {
    if (!newActivity.title || !newActivity.hours_claimed || !newActivity.date_completed) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cpd_activities')
        .insert({
          user_id: user?.id,
          title: newActivity.title!,
          activity_type: newActivity.activity_type!,
          category: newActivity.category!,
          hours_claimed: newActivity.hours_claimed!,
          date_completed: newActivity.date_completed!,
          description: newActivity.description,
          reflection: newActivity.reflection,
          learning_outcomes: newActivity.learning_outcomes,
          provider: newActivity.provider,
          certificate_url: newActivity.certificate_url,
          verification_method: newActivity.verification_method,
          cpd_points: newActivity.cpd_points,
          notes: newActivity.notes
        });

      if (error) throw error;

      setNewActivity({
        title: '',
        activity_type: 'conference',
        category: '',
        hours_claimed: 0,
        date_completed: '',
        status: 'completed',
        reflection: '',
        learning_outcomes: []
      });
      setShowAddForm(false);

      toast({
        title: "Activity Added",
        description: "CPD activity has been recorded successfully.",
      });

      loadCPDData();
    } catch (error: any) {
      toast({
        title: "Error adding activity",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'planned': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conference': return Users;
      case 'course': return BookOpen;
      case 'webinar': return Monitor;
      case 'workshop': return Target;
      case 'reading': return BookOpen;
      case 'research': return TrendingUp;
      default: return BookOpen;
    }
  };

  const totalHours = activities.reduce((sum, a) => sum + a.hours_claimed, 0);
  const totalRequired = requirements.reduce((sum, r) => sum + r.required_hours, 0);
  const overallProgress = totalRequired > 0 ? (totalHours / totalRequired) * 100 : 0;

  if (!subscribed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PremiumFeature feature="CPD Activity Tracking" showUpgrade={true}>
          <div className="text-center py-12">
            <Award className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">CPD Activity Tracker</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Track your continuing professional development and maintain certification requirements.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
              <div className="p-4 border rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-2">Activity Logging</h3>
                <p className="text-sm text-muted-foreground">Record CPD activities with hours and certificates</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-2">Goal Tracking</h3>
                <p className="text-sm text-muted-foreground">Monitor progress towards certification requirements</p>
              </div>
              <div className="p-4 border rounded-lg">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-2">Progress Reports</h3>
                <p className="text-sm text-muted-foreground">Generate reports for professional bodies</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-2">Compliance Tracking</h3>
                <p className="text-sm text-muted-foreground">Stay compliant with regulatory requirements</p>
              </div>
            </div>
          </div>
        </PremiumFeature>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">CPD Tracker</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your continuing professional development activities and maintain certification requirements.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-500">
                <Award className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-500">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Required</p>
                <p className="text-2xl font-bold">{totalRequired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-purple-500">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activities</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-orange-500">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Progress by Category</CardTitle>
                <CardDescription>Track your progress towards CPD goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {requirements.map(requirement => {
                  const completedHours = activities.reduce((sum, a) => sum + a.hours_claimed, 0);
                  const progress = (completedHours / requirement.required_hours) * 100;
                  return (
                    <div key={requirement.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{requirement.professional_body}</span>
                        <span>{completedHours}/{requirement.required_hours} hours</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progress)}% complete</span>
                        <span>{requirement.period_years} year cycle</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your latest CPD activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.slice(0, 5).map(activity => {
                    const Icon = getTypeIcon(activity.activity_type);
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 border rounded">
                        <div className="p-2 rounded-md bg-blue-500">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{activity.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {activity.hours_claimed} hours • {new Date(activity.date_completed).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="default">
                          {activity.activity_type}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">CPD Activities</h2>
            <div className="space-x-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </div>
          </div>

          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add CPD Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newActivity.title}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Activity title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newActivity.activity_type}
                      onValueChange={(value) => setNewActivity(prev => ({ ...prev, activity_type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={newActivity.category}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Clinical Skills"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Hours</Label>
                    <Input
                      type="number"
                      value={newActivity.hours_claimed}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, hours_claimed: parseFloat(e.target.value) }))}
                      min="0"
                      step="0.5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newActivity.date_completed}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, date_completed: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newActivity.status}
                      onValueChange={(value) => setNewActivity(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Reflection</Label>
                  <Textarea
                    value={newActivity.reflection}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, reflection: e.target.value }))}
                    placeholder="Reflect on your learning and key takeaways..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={addActivity}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4">
            {activities.map(activity => {
              const Icon = getTypeIcon(activity.activity_type);
              return (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-blue-500">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{activity.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {activity.category} • {activity.hours_claimed} hours • {new Date(activity.date_completed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        activity.status === 'completed' ? 'default' : 
                        activity.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {activity.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {activity.reflection && (
                      <div className="mb-3">
                        <h4 className="font-medium text-sm mb-1">Reflection:</h4>
                        <p className="text-sm text-muted-foreground">{activity.reflection}</p>
                      </div>
                    )}
                    
                    {activity.learning_outcomes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Learning Outcomes:</h4>
                        <div className="flex flex-wrap gap-1">
                          {activity.learning_outcomes.map(outcome => (
                            <Badge key={outcome} variant="outline" className="text-xs">
                              {outcome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CPD Goals & Requirements</CardTitle>
              <CardDescription>Set and track your professional development goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {requirements.map(requirement => {
                  const completedHours = activities.reduce((sum, a) => sum + a.hours_claimed, 0);
                  const progressValue = (completedHours / requirement.required_hours) * 100;
                  const remaining = Math.max(0, requirement.required_hours - completedHours);
                  
                  return (
                    <div key={requirement.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">{requirement.professional_body}</h3>
                        <Badge variant={progressValue >= 100 ? "default" : "secondary"}>
                          {Math.round(progressValue)}% Complete
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {completedHours}/{requirement.required_hours} hours</span>
                          <span>Remaining: {remaining} hours</span>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Period: {requirement.period_years} years</span>
                        <span>
                          {remaining > 0 ? `${remaining} hours needed` : 'Goal achieved!'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CPD Reports</CardTitle>
              <CardDescription>Generate and export your CPD records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <Download className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Annual CPD Report</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Monthly Summary</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Progress Chart</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm">Compliance Report</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
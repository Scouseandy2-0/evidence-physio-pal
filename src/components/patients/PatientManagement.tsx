import { useState, useEffect } from "react";
import { PremiumFeature } from "@/components/subscription/PremiumFeature";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Plus,
  Search,
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2
} from "lucide-react";

interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  primary_condition: string;
  status: string;
  created_at: string;
  updated_at: string;
  therapist_id: string;
}

interface PatientSession {
  id: string;
  patient_id: string;
  session_date: string;
  duration_minutes: number;
  interventions: string[];
  outcomes: any;
  notes: string;
  next_session_date?: string;
}

export const PatientManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribed } = useSubscription();
  
  if (!subscribed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PremiumFeature feature="Patient Management" showUpgrade={true}>
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Patient Management System</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Manage your patient caseload with comprehensive tracking, session recording, and outcome monitoring.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
              <div className="p-4 border rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-2">Patient Records</h3>
                <p className="text-sm text-muted-foreground">Secure digital patient files with treatment history</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-2">Session Tracking</h3>
                <p className="text-sm text-muted-foreground">Log sessions, interventions, and outcomes</p>
              </div>
              <div className="p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-2">Progress Monitoring</h3>
                <p className="text-sm text-muted-foreground">Track patient progress and treatment effectiveness</p>
              </div>
            </div>
          </div>
        </PremiumFeature>
      </div>
    );
  }
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [newPatient, setNewPatient] = useState({
    patient_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    primary_condition: ''
  });

  const [newSession, setNewSession] = useState({
    session_date: '',
    duration_minutes: 60,
    interventions: [] as string[],
    notes: '',
    next_session_date: ''
  });

  const conditions = [
    'Low Back Pain', 'Neck Pain', 'Shoulder Impingement', 'Knee Osteoarthritis',
    'Stroke Rehabilitation', 'COPD Management', 'ACL Reconstruction',
    'Rotator Cuff Tear', 'Chronic Pain Syndrome', 'Balance Disorders'
  ];

  const interventions = [
    'Manual Therapy', 'Exercise Therapy', 'Electrotherapy', 'Dry Needling',
    'Joint Mobilization', 'Soft Tissue Massage', 'Postural Training',
    'Balance Training', 'Strength Training', 'Cardiovascular Training'
  ];

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('therapist_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('patient_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch sessions",
        variant: "destructive",
      });
    }
  };

  const addPatient = async () => {
    if (!newPatient.first_name || !newPatient.last_name || !newPatient.primary_condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .insert({
          ...newPatient,
          therapist_id: user?.id,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Patient Added",
        description: "New patient has been added successfully",
      });

      setNewPatient({
        patient_id: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        primary_condition: ''
      });

      fetchPatients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addSession = async () => {
    if (!selectedPatient || !newSession.session_date) {
      toast({
        title: "Missing Information",
        description: "Please select a patient and fill in session date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('patient_sessions')
        .insert({
          ...newSession,
          patient_id: selectedPatient.id,
          interventions: newSession.interventions,
          outcomes: {}
        });

      if (error) throw error;

      toast({
        title: "Session Added",
        description: "New session has been recorded successfully",
      });

      setNewSession({
        session_date: '',
        duration_minutes: 60,
        interventions: [],
        notes: '',
        next_session_date: ''
      });

      fetchSessions(selectedPatient.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = `${patient.first_name} ${patient.last_name} ${patient.primary_condition}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'discharged': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPatientStats = () => {
    const total = patients.length;
    const active = patients.filter(p => p.status === 'active').length;
    const discharged = patients.filter(p => p.status === 'discharged').length;
    const onHold = patients.filter(p => p.status === 'on_hold').length;
    
    return { total, active, discharged, onHold };
  };

  const stats = getPatientStats();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading patients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Patient Management</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track patient progress, manage treatment sessions, and monitor outcomes for evidence-based care.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Discharged</p>
                <p className="text-2xl font-bold text-blue-600">{stats.discharged}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Hold</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.onHold}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                  <DialogDescription>
                    Enter patient information to create a new case.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={newPatient.first_name}
                        onChange={(e) => setNewPatient(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={newPatient.last_name}
                        onChange={(e) => setNewPatient(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Patient ID (Optional)</Label>
                    <Input
                      value={newPatient.patient_id}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, patient_id: e.target.value }))}
                      placeholder="P001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={newPatient.date_of_birth}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Primary Condition</Label>
                    <Select
                      value={newPatient.primary_condition}
                      onValueChange={(value) => setNewPatient(prev => ({ ...prev, primary_condition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map(condition => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={addPatient} className="w-full">
                    Add Patient
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Patients List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Card 
                key={patient.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedPatient(patient);
                  fetchSessions(patient.id);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {patient.first_name} {patient.last_name}
                      </CardTitle>
                      <CardDescription>{patient.primary_condition}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(patient.status)} text-white`}>
                      {patient.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {patient.patient_id && (
                    <p className="text-sm text-muted-foreground">ID: {patient.patient_id}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Started: {new Date(patient.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Sessions for {selectedPatient.first_name} {selectedPatient.last_name}
                </h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Record New Session</DialogTitle>
                      <DialogDescription>
                        Document treatment session details and outcomes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Session Date</Label>
                          <Input
                            type="date"
                            value={newSession.session_date}
                            onChange={(e) => setNewSession(prev => ({ ...prev, session_date: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration (minutes)</Label>
                          <Input
                            type="number"
                            value={newSession.duration_minutes}
                            onChange={(e) => setNewSession(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                            min="15"
                            max="120"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Interventions</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {interventions.map(intervention => (
                            <Button
                              key={intervention}
                              variant={newSession.interventions.includes(intervention) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setNewSession(prev => ({
                                  ...prev,
                                  interventions: prev.interventions.includes(intervention)
                                    ? prev.interventions.filter(i => i !== intervention)
                                    : [...prev.interventions, intervention]
                                }));
                              }}
                            >
                              {intervention}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Session Notes</Label>
                        <Textarea
                          value={newSession.notes}
                          onChange={(e) => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Document session findings, patient response, and any changes to treatment plan..."
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Next Session Date (Optional)</Label>
                        <Input
                          type="date"
                          value={newSession.next_session_date}
                          onChange={(e) => setNewSession(prev => ({ ...prev, next_session_date: e.target.value }))}
                        />
                      </div>
                      
                      <Button onClick={addSession} className="w-full">
                        Record Session
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {new Date(session.session_date).toLocaleDateString()}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {session.duration_minutes} minutes
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {session.interventions.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">Interventions:</p>
                          <div className="flex flex-wrap gap-1">
                            {session.interventions.map(intervention => (
                              <Badge key={intervention} variant="secondary" className="text-xs">
                                {intervention}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {session.notes && (
                        <div>
                          <p className="text-sm font-medium mb-1">Notes:</p>
                          <p className="text-sm text-muted-foreground">{session.notes}</p>
                        </div>
                      )}
                      
                      {session.next_session_date && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Next session: {new Date(session.next_session_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {sessions.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No Sessions Recorded</h3>
                      <p className="text-muted-foreground mb-4">
                        Start documenting treatment sessions for this patient.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Select a Patient</h3>
                <p className="text-muted-foreground">
                  Choose a patient from the Patients tab to view their treatment sessions.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Treatment Outcomes
              </CardTitle>
              <CardDescription>
                Analyze patient progress and treatment effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Outcome Tracking</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced outcome tracking and analytics will be available in the next update.
                </p>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
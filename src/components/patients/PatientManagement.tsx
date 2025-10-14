import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PremiumFeature } from "@/components/subscription/PremiumFeature";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, Search, Calendar, CheckCircle, FileText, Edit, Trash2, Eye } from "lucide-react";
import { z } from "zod";

const patientSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  last_name: z.string().trim().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  patient_id: z.string().trim().max(50, "Patient ID must be less than 50 characters").optional(),
  date_of_birth: z.string().optional(),
  primary_condition: z.string().trim().min(1, "Primary condition is required").max(200, "Primary condition must be less than 200 characters"),
  status: z.enum(["active", "inactive", "discharged"])
});

type PatientFormData = z.infer<typeof patientSchema>;

interface Patient {
  id: string;
  patient_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  primary_condition: string;
  status: string;
  created_at: string;
}

export const PatientManagement = () => {
  const { subscribed } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sessionsToday: 0,
    pendingNotes: 0
  });
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: '',
    last_name: '',
    patient_id: '',
    date_of_birth: '',
    primary_condition: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subscribed && user) {
      fetchPatients();
      fetchStats();
    }
  }, [subscribed, user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: patientsData } = await supabase
        .from('patients')
        .select('status');

      const total = patientsData?.length || 0;
      const active = patientsData?.filter(p => p.status === 'active').length || 0;

      const today = new Date().toISOString().split('T')[0];
      const { data: sessionsData } = await supabase
        .from('patient_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('session_date', today);

      setStats({
        total,
        active,
        sessionsToday: sessionsData?.length || 0,
        pendingNotes: 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddPatient = async () => {
    try {
      // Validate form data
      const validatedData = patientSchema.parse(formData);
      setFormErrors({});

      const { error } = await supabase
        .from('patients')
        .insert({
          ...validatedData,
          therapist_id: user!.id,
          date_of_birth: validatedData.date_of_birth || null,
          patient_id: validatedData.patient_id || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient added successfully",
      });

      setIsAddDialogOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        patient_id: '',
        date_of_birth: '',
        primary_condition: '',
        status: 'active'
      });
      fetchPatients();
      fetchStats();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setFormErrors(errors);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add patient",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });

      fetchPatients();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.primary_condition.toLowerCase().includes(searchLower) ||
      patient.patient_id?.toLowerCase().includes(searchLower)
    );
  });

  if (!subscribed) {
    return (
      <PremiumFeature feature="Patient Management" showUpgrade={true}>
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Patient Management System</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Securely manage patient records, track treatment sessions, and monitor progress.
          </p>
        </div>
      </PremiumFeature>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessionsToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingNotes}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, ID, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'No patients found' : 'No patients yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first patient'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {patient.first_name} {patient.last_name}
                    </CardTitle>
                    {patient.patient_id && (
                      <p className="text-sm text-muted-foreground">ID: {patient.patient_id}</p>
                    )}
                  </div>
                  <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                    {patient.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Condition: </span>
                    <span>{patient.primary_condition}</span>
                  </div>
                  {patient.date_of_birth && (
                    <div>
                      <span className="text-muted-foreground">DOB: </span>
                      <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Added: </span>
                    <span>{new Date(patient.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeletePatient(patient.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter patient information to create a new record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                />
                {formErrors.first_name && (
                  <p className="text-sm text-destructive">{formErrors.first_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                />
                {formErrors.last_name && (
                  <p className="text-sm text-destructive">{formErrors.last_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient ID (Optional)</Label>
              <Input
                id="patient_id"
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                placeholder="P-12345"
              />
              {formErrors.patient_id && (
                <p className="text-sm text-destructive">{formErrors.patient_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth (Optional)</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_condition">Primary Condition *</Label>
              <Input
                id="primary_condition"
                value={formData.primary_condition}
                onChange={(e) => setFormData({ ...formData, primary_condition: e.target.value })}
                placeholder="Lower back pain"
              />
              {formErrors.primary_condition && (
                <p className="text-sm text-destructive">{formErrors.primary_condition}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPatient}>
              Add Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
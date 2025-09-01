import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield,
  MapPin,
  Users,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Globe
} from "lucide-react";

interface LicensingBody {
  id: string;
  name: string;
  country: string;
  region: string;
  healthcare_roles: string[];
  api_endpoint: string;
  verification_method: string;
  license_format_regex: string;
  cpd_requirements: any;
}

interface LicenseVerification {
  licenseNumber: string;
  selectedBody: string;
  isVerifying: boolean;
  result: {
    isValid: boolean;
    details: any;
    message: string;
  } | null;
}

export const LicensingBodyManager = () => {
  const [licensingBodies, setLicensingBodies] = useState<LicensingBody[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<LicenseVerification>({
    licenseNumber: '',
    selectedBody: '',
    isVerifying: false,
    result: null
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockBodies: LicensingBody[] = [
      {
        id: '1',
        name: 'Physical Therapy Board of California',
        country: 'USA',
        region: 'California',
        healthcare_roles: ['physiotherapist'],
        api_endpoint: 'https://ptbc.ca.gov/verify',
        verification_method: 'Online verification available',
        license_format_regex: '^PT[0-9]{5}$',
        cpd_requirements: {
          required_hours_per_cycle: 30,
          cycle_length_years: 2,
          ethics_hours_required: 2
        }
      },
      {
        id: '2',
        name: 'Health and Care Professions Council',
        country: 'UK',
        region: 'England',
        healthcare_roles: ['physiotherapist', 'occupational_therapist'],
        api_endpoint: 'https://www.hcpc-uk.org/check',
        verification_method: 'HCPC Online Register',
        license_format_regex: '^PH[0-9]{6}$',
        cpd_requirements: {
          required_hours_per_cycle: 50,
          cycle_length_years: 2,
          reflection_required: true
        }
      },
      {
        id: '3',
        name: 'Physiotherapy Board of Australia',
        country: 'Australia',
        region: 'National',
        healthcare_roles: ['physiotherapist'],
        api_endpoint: 'https://www.ahpra.gov.au/registration',
        verification_method: 'AHPRA Public Register',
        license_format_regex: '^PHY[0-9]{8}$',
        cpd_requirements: {
          required_hours_per_cycle: 20,
          cycle_length_years: 1,
          professional_development_required: true
        }
      }
    ];
    setLicensingBodies(mockBodies);
  };

  const verifyLicense = async () => {
    if (!verification.licenseNumber || !verification.selectedBody) {
      toast({
        title: "Missing Information",
        description: "Please enter a license number and select a licensing body.",
        variant: "destructive",
      });
      return;
    }

    setVerification(prev => ({ ...prev, isVerifying: true }));

    try {
      const selectedBody = licensingBodies.find(body => body.id === verification.selectedBody);
      if (!selectedBody) throw new Error('Selected licensing body not found');

      // Simulate license verification (in real implementation, this would call the licensing body's API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock verification result based on license format
      const isValid = selectedBody.license_format_regex 
        ? new RegExp(selectedBody.license_format_regex).test(verification.licenseNumber)
        : verification.licenseNumber.length >= 6;

      setVerification(prev => ({
        ...prev,
        result: {
          isValid,
          details: {
            licenseNumber: verification.licenseNumber,
            licensingBody: selectedBody.name,
            status: isValid ? 'Active' : 'Invalid',
            expiryDate: isValid ? '2025-12-31' : null,
            restrictions: isValid ? [] : ['Invalid format'],
          },
          message: isValid 
            ? 'License verification successful' 
            : 'License number format is invalid or license not found'
        }
      }));

      toast({
        title: isValid ? "License Verified" : "Verification Failed",
        description: isValid 
          ? "License is valid and active" 
          : "License verification failed",
        variant: isValid ? "default" : "destructive",
      });

    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message,
        variant: "destructive",
      });
      setVerification(prev => ({
        ...prev,
        result: {
          isValid: false,
          details: {},
          message: 'Verification service unavailable'
        }
      }));
    } finally {
      setVerification(prev => ({ ...prev, isVerifying: false }));
    }
  };

  const filteredBodies = licensingBodies.filter(body => {
    const matchesCountry = selectedCountry === 'all' || body.country === selectedCountry;
    const matchesRole = selectedRole === 'all' || body.healthcare_roles.includes(selectedRole);
    const matchesSearch = body.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         body.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         body.region?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCountry && matchesRole && matchesSearch;
  });

  const countries = [...new Set(licensingBodies.map(body => body.country))];
  const allRoles = [...new Set(licensingBodies.flatMap(body => body.healthcare_roles))];

  const LicensingBodyCard = ({ body }: { body: LicensingBody }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{body.name}</CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {body.country} {body.region && `• ${body.region}`}
            </CardDescription>
          </div>
          <Badge variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Users className="h-4 w-4" />
            Healthcare Roles ({body.healthcare_roles.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {body.healthcare_roles.map((role, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Verification Method</h4>
          <p className="text-sm text-muted-foreground">
            {body.verification_method || 'Online verification available'}
          </p>
        </div>

        {body.license_format_regex && (
          <div>
            <h4 className="font-medium mb-2">License Format</h4>
            <p className="text-sm font-mono text-muted-foreground bg-muted p-2 rounded">
              {body.license_format_regex}
            </p>
          </div>
        )}

        {body.cpd_requirements && Object.keys(body.cpd_requirements).length > 0 && (
          <div>
            <h4 className="font-medium mb-2">CPD Requirements</h4>
            <div className="space-y-1">
              {Object.entries(body.cpd_requirements).map(([key, value], index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  {key.replace(/_/g, ' ')}: {value as string}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setVerification(prev => ({ ...prev, selectedBody: body.id }))}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify License
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify License with {body.name}</DialogTitle>
                <DialogDescription>
                  Enter your license number to verify with {body.name} ({body.country})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>License Number</Label>
                  <Input
                    value={verification.licenseNumber}
                    onChange={(e) => setVerification(prev => ({ 
                      ...prev, 
                      licenseNumber: e.target.value,
                      result: null 
                    }))}
                    placeholder="Enter your license number"
                  />
                </div>

                <Button 
                  onClick={verifyLicense}
                  disabled={verification.isVerifying}
                  className="w-full"
                >
                  {verification.isVerifying ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify License
                    </>
                  )}
                </Button>

                {verification.result && (
                  <div className={`p-4 rounded-lg border ${
                    verification.result.isValid 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {verification.result.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <h4 className={`font-medium ${
                        verification.result.isValid ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {verification.result.isValid ? 'Valid License' : 'Invalid License'}
                      </h4>
                    </div>
                    <p className={`text-sm ${
                      verification.result.isValid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {verification.result.message}
                    </p>
                    {verification.result.details && Object.keys(verification.result.details).length > 0 && (
                      <div className="mt-3 space-y-1">
                        {Object.entries(verification.result.details).map(([key, value], index) => (
                          <p key={index} className="text-xs text-muted-foreground">
                            <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value as string}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          {body.api_endpoint && (
            <Button variant="default" size="sm" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Site
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Licensing Body Directory</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive directory of healthcare licensing bodies with integrated verification services.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, country, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex gap-4">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {allRoles.map(role => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredBodies.length} of {licensingBodies.length} licensing bodies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBodies.map(body => (
          <LicensingBodyCard key={body.id} body={body} />
        ))}
      </div>

      {filteredBodies.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No licensing bodies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
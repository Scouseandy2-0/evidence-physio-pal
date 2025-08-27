import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const SubscriptionSuccessPage = () => {
  const { checkSubscription } = useSubscription();

  useEffect(() => {
    // Check subscription status after successful payment
    const timer = setTimeout(() => {
      checkSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkSubscription]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to Premium!</CardTitle>
          <CardDescription>
            Your subscription has been activated successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">You now have access to:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All 21 conditions across MSK, Respiratory, and Neurological categories</li>
              <li>• Complete assessment tools library</li>
              <li>• Treatment protocol builder</li>
              <li>• Patient management system</li>
              <li>• CPD tracking & certification</li>
              <li>• Collaboration & peer review features</li>
              <li>• Advanced analytics dashboard</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Link to="/dashboard">
              <Button className="w-full" size="lg">
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
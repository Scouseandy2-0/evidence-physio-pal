import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useActivityTracking } from "@/hooks/useActivityTracking";

export const ZygoteBodyViewer = () => {
  const { hasAccess } = useSubscription();
  const hasPremiumAccess = hasAccess('basic');
  const { trackAnatomyViewer } = useActivityTracking();
  const sessionStartRef = useRef<Date>(new Date());

  // Track anatomy viewer usage when component unmounts
  useEffect(() => {
    return () => {
      const durationMinutes = Math.round((new Date().getTime() - sessionStartRef.current.getTime()) / 60000);
      if (durationMinutes > 0) {
        trackAnatomyViewer('Full Body - Zygote', durationMinutes);
      }
    };
  }, [trackAnatomyViewer]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Zygote Body 3D Human Anatomy</span>
          {hasPremiumAccess && (
            <Badge variant="default" className="ml-2">Premium Features Enabled</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Interactive full-body anatomy viewer powered by Zygote Body
          {!hasPremiumAccess && (
            <span className="block mt-2 text-primary">
              • Subscribe to Basic plan (£3.99/month) to unlock ZygoteBody Premium features
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-background">
          <iframe
            src={hasPremiumAccess 
              ? "https://www.zygotebody.com/#premium=true" 
              : "https://www.zygotebody.com"}
            className="w-full h-full"
            title="Zygote Body 3D Anatomy Viewer"
            allowFullScreen
          />
        </div>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-2">
          <p className="text-sm text-muted-foreground">
            💡 Use the controls within the Zygote Body viewer to explore detailed 3D human anatomy.
            You can rotate, zoom, and toggle different anatomical systems.
          </p>
          {hasPremiumAccess ? (
            <p className="text-sm font-medium text-primary">
              ✨ Premium features active: Advanced layers, detailed annotations, and enhanced visualization
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              🔒 Subscribe to access premium ZygoteBody features including advanced anatomical layers and detailed annotations
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

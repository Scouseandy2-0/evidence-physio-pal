import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityTracking } from "@/hooks/useActivityTracking";

export const ZygoteBodyViewer = () => {
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
        <CardTitle>Zygote Body 3D Human Anatomy</CardTitle>
        <CardDescription>
          Interactive full-body anatomy viewer powered by Zygote Body
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-background">
          <iframe
            src="https://www.zygotebody.com"
            className="w-full h-full"
            title="Zygote Body 3D Anatomy Viewer"
            allowFullScreen
          />
        </div>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 Use the controls within the Zygote Body viewer to explore detailed 3D human anatomy.
            You can rotate, zoom, and toggle different anatomical systems.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

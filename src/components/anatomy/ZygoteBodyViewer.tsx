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
        <CardTitle>BodyParts3D Human Anatomy</CardTitle>
        <CardDescription>
          Interactive 3D anatomy viewer with detailed anatomical labels and structures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-background">
          <iframe
            src="http://lifesciencedb.jp/bp3d/"
            className="w-full h-full"
            title="BodyParts3D Anatomy Viewer"
            allowFullScreen
          />
        </div>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 BodyParts3D provides free access to 3D anatomical structures with proper labeling.
            Use the viewer controls to explore muscles, bones, ligaments, nerves, and other anatomical systems.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { EvidenceSyncService } from "@/services/evidenceSync";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const EvidenceSyncStatus = () => {
  const { user } = useAuth();
  const [syncInfo, setSyncInfo] = useState<{ lastSync: Date | null, needsSync: boolean }>({
    lastSync: null,
    needsSync: false
  });
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    loadSyncInfo();
  }, []);

  const loadSyncInfo = async () => {
    try {
      const info = await EvidenceSyncService.getLastSyncInfo();
      setSyncInfo(info);
    } catch (error) {
      console.error('Failed to load sync info:', error);
    }
  };

  const handleManualSync = async () => {
    if (!user) return;
    
    setIsManualSyncing(true);
    try {
      await EvidenceSyncService.forceSyncEvidence(user.id);
      await loadSyncInfo();
      toast.success("Evidence database updated successfully!");
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast.error("Failed to update evidence database. Please try again.");
    } finally {
      setIsManualSyncing(false);
    }
  };

  const formatLastSync = (lastSync: Date | null) => {
    if (!lastSync) return "Never";
    
    const now = new Date();
    const diffHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return "Less than an hour ago";
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const getSyncStatus = () => {
    if (!syncInfo.lastSync) {
      return { 
        icon: <AlertCircle className="h-4 w-4" />, 
        text: "Not synced", 
        variant: "secondary" as const 
      };
    }
    
    if (syncInfo.needsSync) {
      return { 
        icon: <Clock className="h-4 w-4" />, 
        text: "Sync needed", 
        variant: "secondary" as const 
      };
    }
    
    return { 
      icon: <CheckCircle className="h-4 w-4" />, 
      text: "Up to date", 
      variant: "default" as const 
    };
  };

  const status = getSyncStatus();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Evidence Sync Status</CardTitle>
          <Badge variant={status.variant} className="flex items-center gap-1">
            {status.icon}
            {status.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Last synchronized:</span>
            <span>{formatLastSync(syncInfo.lastSync)}</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Evidence is automatically synchronized when you log in to ensure you have access to the latest research from PubMed, Cochrane, PEDro, and NICE.
        </div>
        
        <Button 
          onClick={handleManualSync}
          disabled={isManualSyncing || !user}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isManualSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Synchronizing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
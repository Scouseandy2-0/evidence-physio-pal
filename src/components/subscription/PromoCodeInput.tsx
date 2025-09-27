import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tag, Loader2 } from "lucide-react";

interface PromoCodeInputProps {
  onCodeApplied: (discount: { percent?: number; amount?: number }) => void;
  onCodeRemoved: () => void;
  appliedCode?: string;
}

export const PromoCodeInput = ({ onCodeApplied, onCodeRemoved, appliedCode }: PromoCodeInputProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validatePromoCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-promo-code', {
        body: { code: code.trim() }
      });

      if (error) throw error;

      if (data.valid) {
        onCodeApplied({
          percent: data.discount_percent,
          amount: data.discount_amount
        });
        toast({
          title: "Promo code applied!",
          description: `${data.discount_percent}% discount applied`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Invalid promo code",
        description: error.message || "Please check the code and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removePromoCode = () => {
    setCode("");
    onCodeRemoved();
    toast({
      title: "Promo code removed",
      description: "Regular pricing will apply",
    });
  };

  if (appliedCode) {
    return (
      <div className="space-y-2">
        <Label>Promo Code Applied</Label>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {appliedCode}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={removePromoCode}
          >
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="promo-code">Promo Code (Optional)</Label>
      <div className="flex gap-2">
        <Input
          id="promo-code"
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={loading}
        />
        <Button
          variant="outline"
          onClick={validatePromoCode}
          disabled={loading || !code.trim()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
    </div>
  );
};
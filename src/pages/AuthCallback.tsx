import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Give Supabase more time to process the auth tokens, especially in Safari
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Clean up hash to prevent reload loops in Safari
        if (window.location.hash) {
          const url = new URL(window.location.href);
          url.hash = '';
          window.history.replaceState({}, document.title, url.toString());
        }
        
        navigate("/", { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate("/", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Completing sign-in…</span>
      </div>
    </div>
  );
};

export default AuthCallback;

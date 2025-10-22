import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        console.log('AuthCallback: Starting auth callback handling');

        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const hasHash = window.location.hash && window.location.hash.length > 0;

        if (code) {
          console.log('AuthCallback: Exchanging code for session');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('AuthCallback: exchangeCodeForSession error:', error);
          } else {
            console.log('AuthCallback: Session established via code exchange');
          }
        } else if (hasHash) {
          console.log('AuthCallback: Found hash parameters, allowing Supabase to process');
          // Allow supabase-js to process hash tokens automatically
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          console.log('AuthCallback: No auth params found');
        }

        // Clean up URL (remove code and hash)
        const clean = new URL(window.location.href);
        clean.search = '';
        clean.hash = '';
        window.history.replaceState({}, document.title, clean.toString());

        console.log('AuthCallback: Redirecting to home');
        navigate("/", { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate("/", { replace: true });
      }
    };

    run();
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

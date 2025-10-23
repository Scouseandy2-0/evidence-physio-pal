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
        const hasHash = !!window.location.hash;
        const rawHash = window.location.hash?.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash || '';
        const hashParams = new URLSearchParams(rawHash);
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (code) {
          console.log('AuthCallback: Exchanging code for session');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('AuthCallback: exchangeCodeForSession error:', error);
          } else {
            console.log('AuthCallback: Session established via code exchange');
          }
        } else if (access_token && refresh_token) {
          console.log('AuthCallback: Found tokens in hash, setting session');
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) {
            console.error('AuthCallback: setSession error:', error);
          } else {
            console.log('AuthCallback: Session established via hash tokens', { hasUser: !!data.session?.user });
          }
        } else if (hasHash) {
          console.log('AuthCallback: Found hash parameters, allowing Supabase to process');
          // Allow supabase-js to process hash tokens automatically
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          console.log('AuthCallback: No auth params found');
        }

        // Retry loop: wait up to 3 seconds for session to be ready
        console.log('AuthCallback: Waiting for session to be ready...');
        let session = null;
        const maxRetries = 6; // 6 retries x 500ms = 3 seconds
        for (let i = 0; i < maxRetries; i++) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            session = data.session;
            console.log('AuthCallback: Session confirmed', { user: session.user.id });
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Clean up URL (remove code and hash)
        const clean = new URL(window.location.href);
        clean.search = '';
        clean.hash = '';
        window.history.replaceState({}, document.title, clean.toString());

        if (session) {
          console.log('AuthCallback: Redirecting to home with valid session');
          navigate("/", { replace: true });
        } else {
          console.error('AuthCallback: No session found after retry, redirecting to debug');
          navigate("/auth/debug", { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate("/auth/debug", { replace: true });
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

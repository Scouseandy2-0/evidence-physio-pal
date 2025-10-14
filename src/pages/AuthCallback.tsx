import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clean auth hash fragments if present (access_token, etc.)
    if (window.location.hash) {
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState({}, document.title, url.toString());
    }

    // Let supabase-js process tokens (detectSessionInUrl=true) then route home
    const t = setTimeout(() => navigate("/"), 100);
    return () => clearTimeout(t);
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


import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Chrome, Store } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isStore, setIsStore] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const destination = session.user.user_metadata?.is_store ? "/store-dashboard" : "/dashboard";
          navigate(destination);
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: "",
              avatar_url: "",
              is_store: isStore,
            },
          },
        });
        
        if (signUpError) throw signUpError;
        
        if (data?.user) {
          toast({
            title: "¡Registro exitoso!",
            description: "Por favor verifica tu correo electrónico para continuar.",
          });
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message === "Invalid login credentials") {
            throw new Error("Email o contraseña incorrectos. Si no tienes una cuenta, regístrate primero.");
          }
          throw signInError;
        }

        if (!data?.user) {
          throw new Error("No se pudo iniciar sesión. Por favor intenta de nuevo.");
        }

        const userIsStore = data.user?.user_metadata?.is_store === true;
        
        if (userIsStore !== isStore) {
          await supabase.auth.signOut();
          throw new Error(
            isStore 
              ? "Esta cuenta no es una cuenta de tienda. Por favor inicia sesión como cuenta personal." 
              : "Esta cuenta es una cuenta de tienda. Por favor inicia sesión como cuenta de tienda."
          );
        }

        toast({
          title: "¡Bienvenido de vuelta!",
          description: "Has iniciado sesión exitosamente.",
        });
        
        navigate(isStore ? "/store-dashboard" : "/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      
      // If there's an auth error, ensure we're signed out
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) console.error('Error signing out:', signOutError);
      
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      const isInChromeExtension = window.chrome?.runtime && chrome.runtime.id;

      if (isInChromeExtension) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
            skipBrowserRedirect: true
          }
        });

        if (error) throw error;

        if (data?.url) {
          chrome.runtime.sendMessage({ 
            type: 'OPEN_AUTH_WINDOW', 
            url: data.url,
            flowType: 'google'
          });
        }
      } else {
        // No popup flow - direct redirect in current window
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/auth',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al iniciar sesión con Google.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Handle auth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Error",
          description: "Hubo un problema al iniciar sesión con Google.",
          variant: "destructive",
        });
        return;
      }
      
      if (session) {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión con Google exitosamente.",
        });
        
        const destination = session.user.user_metadata?.is_store ? "/store-dashboard" : "/dashboard";
        navigate(destination);
      }
    };

    // This detects if we're returning from an OAuth redirect
    if (location.hash || location.search.includes('code=')) {
      handleAuthCallback();
    }
  }, [location, navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? "Crear una cuenta" : "Iniciar sesión"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isStore ? "Cuenta de tienda" : "Cuenta personal"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={!isStore ? "default" : "outline"}
              className="w-1/2"
              onClick={() => setIsStore(false)}
            >
              Personal
            </Button>
            <Button
              type="button"
              variant={isStore ? "default" : "outline"}
              className="w-1/2 flex items-center gap-2"
              onClick={() => setIsStore(true)}
            >
              <Store className="h-4 w-4" />
              Tienda
            </Button>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Cargando..." : isSignUp ? "Registrarse" : "Iniciar sesión"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  O continuar con
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
                disabled={loading}
              >
                <Chrome className="h-5 w-5" />
                Google
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsStore(false);
              }}
            >
              {isSignUp
                ? "¿Ya tienes una cuenta? Inicia sesión"
                : "¿No tienes una cuenta? Regístrate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

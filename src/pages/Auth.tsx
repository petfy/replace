
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
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(session.user.user_metadata?.is_store ? "/store-dashboard" : "/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate(session.user.user_metadata?.is_store ? "/store-dashboard" : "/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
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
        
        toast({
          title: "¡Registro exitoso!",
          description: "Por favor verifica tu correo electrónico para continuar.",
        });
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth`,
          skipBrowserRedirect: !isMobile // Only skip redirect on desktop to use popup
        }
      });

      if (error) throw error;

      // Only handle popup on desktop
      if (!isMobile && data?.url) {
        const width = 600;
        const height = 800;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.innerHeight / 2 - height / 2;
        
        const popup = window.open(
          data.url,
          'Login with Google',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          throw new Error("No se pudo abrir la ventana de autenticación. Por favor, habilita las ventanas emergentes.");
        }

        // Check popup and session status
        const checkPopup = setInterval(async () => {
          try {
            if (!popup || popup.closed) {
              clearInterval(checkPopup);
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                toast({
                  title: "¡Bienvenido!",
                  description: "Has iniciado sesión con Google exitosamente.",
                });
                navigate(session.user.user_metadata?.is_store ? "/store-dashboard" : "/dashboard");
              }
            } else {
              // Check if authenticated while popup is still open
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                popup.close();
                clearInterval(checkPopup);
                toast({
                  title: "¡Bienvenido!",
                  description: "Has iniciado sesión con Google exitosamente.",
                });
                navigate(session.user.user_metadata?.is_store ? "/store-dashboard" : "/dashboard");
              }
            }
          } catch (error) {
            clearInterval(checkPopup);
            console.error("Error checking session:", error);
          }
        }, 500);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

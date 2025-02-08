
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AddressForm } from "@/components/AddressForm";
import { AddressList } from "@/components/AddressList";
import { Plus, LogOut, MapPin, Home, Briefcase, User, Users, Building2 } from "lucide-react";

interface Address {
  id: string;
  label: string;
  street: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  category: "casa" | "trabajo" | "vecino" | "amigo" | "familiares" | "conserje" | "otro";
  email?: string;
  phone?: string;
  identification?: string;
  full_name?: string;
}

interface CategoryCount {
  category: Address["category"];
  count: number;
}

const categories = [
  { value: "casa" as const, label: "Casa", icon: Home },
  { value: "trabajo" as const, label: "Trabajo", icon: Briefcase },
  { value: "vecino" as const, label: "Vecino", icon: Users },
  { value: "amigo" as const, label: "Amigo", icon: User },
  { value: "familiares" as const, label: "Familiares", icon: Users },
  { value: "conserje" as const, label: "Conserje", icon: Building2 },
  { value: "otro" as const, label: "Otro", icon: MapPin },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Address["category"] | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          navigate("/auth");
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User error:", userError);
          throw userError;
        }
        
        if (!user) {
          navigate("/auth");
          return;
        }
        
        setUser(user);
        setLoading(false);
      } catch (error: any) {
        console.error("Auth error:", error);
        
        await supabase.auth.signOut();
        
        toast({
          title: "Error de sesión",
          description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .order("is_default", { ascending: false });

        if (error) throw error;

        setAddresses(data || []);
        
        const defaultAddr = data?.find(addr => addr.is_default);
        setDefaultAddress(defaultAddr || null);

        const counts = categories.map(cat => ({
          category: cat.value,
          count: data?.filter(addr => addr.category === cat.value).length || 0
        }));
        setCategoryCounts(counts);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las direcciones",
          variant: "destructive",
        });
      }
    };

    fetchAddresses();

    const channel = supabase
      .channel('address-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'addresses'
        },
        () => {
          fetchAddresses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const filteredAddresses = selectedCategory
    ? addresses.filter(addr => addr.category === selectedCategory)
    : [defaultAddress].filter(Boolean) as Address[];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Cargando...</p>
    </div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <MapPin className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">RePlace</span>
              </div>
            </div>
            <div className="flex items-center">
              <Button onClick={handleSignOut} variant="ghost">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Mis Direcciones
            </h1>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva dirección
              </Button>
            )}
          </div>

          {showAddForm ? (
            <div className="mb-6">
              <AddressForm
                onSuccess={handleAddSuccess}
                initialData={editingAddress || undefined}
              />
              <div className="mt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {categoryCounts.map(({ category, count }) => {
                  const categoryInfo = categories.find(c => c.value === category);
                  const Icon = categoryInfo?.icon || MapPin;
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="flex items-center justify-start space-x-2 p-4 h-12 w-full"
                      onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm truncate">{categoryInfo?.label}</span>
                      <span className="text-xs ml-auto">({count})</span>
                    </Button>
                  );
                })}
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg shadow">
                  <MapPin className="mx-auto h-12 w-12 text-primary/60" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">¡Crea tu primer perfil de dirección!</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza agregando una dirección para agilizar tus compras en línea
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar dirección
                    </Button>
                  </div>
                </div>
              ) : filteredAddresses.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    {selectedCategory 
                      ? `Direcciones en categoría: ${categories.find(c => c.value === selectedCategory)?.label}`
                      : "Dirección predeterminada"}
                  </h2>
                  <AddressList
                    onEdit={handleEdit}
                    addresses={filteredAddresses}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

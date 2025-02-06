import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AddressForm } from "@/components/AddressForm";
import { AddressList } from "@/components/AddressList";
import { Plus, LogOut, MapPin, Home, Briefcase, User, Users, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Address {
  id: string;
  label: string;
  street: string;
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
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (!user) {
          navigate("/auth");
          return;
        }
        
        setUser(user);
        setLoading(false);
      } catch (error: any) {
        console.error("Error checking auth status:", error.message);
        toast({
          title: "Error de autenticación",
          description: "Por favor, inicia sesión nuevamente",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
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
        
        // Set default address
        const defaultAddr = data?.find(addr => addr.is_default);
        setDefaultAddress(defaultAddr || null);

        // Calculate category counts
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
    : addresses;

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
                      <span className="text-sm">{categoryInfo?.label}</span>
                      <span className="text-xs ml-auto">({count})</span>
                    </Button>
                  );
                })}
              </div>

              {defaultAddress && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Dirección predeterminada</h2>
                  <AddressList
                    onEdit={handleEdit}
                    addresses={[defaultAddress]}
                  />
                </div>
              )}

              {selectedCategory && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Direcciones en categoría: {categories.find(c => c.value === selectedCategory)?.label}
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

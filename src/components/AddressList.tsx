import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Briefcase, MapPin, Trash2, Edit, Users, User, Building2 } from "lucide-react";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  category: string;
}

interface AddressListProps {
  onEdit: (address: Address) => void;
}

export const AddressList = ({ onEdit }: AddressListProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("is_default", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las direcciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAddresses(addresses.filter((address) => address.id !== id));
      toast({
        title: "Dirección eliminada",
        description: "La dirección se ha eliminado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la dirección",
        variant: "destructive",
      });
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "casa":
        return <Home className="w-5 h-5" />;
      case "trabajo":
        return <Briefcase className="w-5 h-5" />;
      case "vecino":
        return <Users className="w-5 h-5" />;
      case "amigo":
        return <User className="w-5 h-5" />;
      case "familiares":
        return <Users className="w-5 h-5" />;
      case "conserje":
        return <Building2 className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      casa: "Casa",
      trabajo: "Trabajo",
      vecino: "Vecino",
      amigo: "Amigo",
      familiares: "Familiares",
      conserje: "Conserje",
      otro: "Otro",
    };
    return labels[category] || category;
  };

  if (loading) {
    return <div>Cargando direcciones...</div>;
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No hay direcciones guardadas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <Card key={address.id} className={address.is_default ? "border-primary" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              {getIcon(address.category)}
              <span>{address.label}</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {getCategoryLabel(address.category)}
              </span>
              {address.is_default && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-2">
                  Predeterminada
                </span>
              )}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(address)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(address.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>{address.street}</p>
              <p>
                {address.city}, {address.state} {address.zip_code}
              </p>
              <p>{address.country}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
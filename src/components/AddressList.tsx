import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Briefcase, MapPin, Trash2, Edit, Users, User, Building2, Mail, Phone, FileText } from "lucide-react";
import "/node_modules/flag-icons/css/flag-icons.min.css";

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
  email?: string;
  phone?: string;
  identification?: string;
}

interface AddressListProps {
  onEdit: (address: Address) => void;
}

const countryToCode: { [key: string]: string } = {
  CL: "cl",
  AR: "ar",
  PE: "pe",
  BR: "br",
  CO: "co",
  MX: "mx",
  US: "us",
  ES: "es",
};

const countryNames: { [key: string]: string } = {
  CL: "Chile",
  AR: "Argentina",
  PE: "Perú",
  BR: "Brasil",
  CO: "Colombia",
  MX: "México",
  US: "Estados Unidos",
  ES: "España",
};

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
            <div className="text-sm text-gray-600 space-y-2">
              <p>{address.street}</p>
              <p>
                {address.city}, {address.state} {address.zip_code}
              </p>
              <p className="flex items-center gap-2">
                <span className={`fi fi-${countryToCode[address.country]}`}></span>
                {countryNames[address.country]}
              </p>
              {(address.email || address.phone || address.identification) && (
                <div className="border-t pt-2 mt-2 space-y-1">
                  {address.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {address.email}
                    </p>
                  )}
                  {address.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {address.phone}
                    </p>
                  )}
                  {address.identification && (
                    <p className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {address.identification}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button className="w-full" size="lg">
                <MapPin className="w-5 h-5 mr-2" />
                USAR ESTE REPLACE
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
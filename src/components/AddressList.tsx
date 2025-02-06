import { useState } from "react";
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
  category: "casa" | "trabajo" | "vecino" | "amigo" | "familiares" | "conserje" | "otro";
  email?: string;
  phone?: string;
  identification?: string;
  full_name?: string;
}

interface AddressListProps {
  onEdit: (address: Address) => void;
  addresses: Address[];
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

export const AddressList = ({ onEdit, addresses }: AddressListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id);

      if (error) throw error;

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

  const handleUseAddress = async (address: Address) => {
    try {
      setLoading(address.id);
      
      // Fetch field mappings from Supabase
      const { data: mappings, error } = await supabase
        .from('field_mappings')
        .select('*');

      if (error) throw error;

      // Create a message to send to the Chrome extension
      const message = {
        type: 'FILL_CHECKOUT_FORM',
        data: {
          address,
          mappings
        }
      };

      console.log('Attempting to send message to extension:', message);

      // Create a custom event that the Chrome extension can listen for
      const customEvent = new CustomEvent('REPLACE_FILL_FORM', {
        detail: message
      });

      // Dispatch the event both on window and document
      window.dispatchEvent(customEvent);
      document.dispatchEvent(customEvent);

      // Also try the chrome.runtime.sendMessage if available
      if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
        window.chrome.runtime.sendMessage(message, (response) => {
          console.log('Chrome extension response:', response);
          if (response?.success) {
            toast({
              title: "¡Formulario completado!",
              description: "Los campos han sido llenados automáticamente",
            });
          } else {
            console.warn('Extension response indicated failure:', response);
            toast({
              title: "Información enviada",
              description: "Los datos están listos para ser usados",
            });
          }
        });
      } else {
        console.log('Chrome extension API not available, using custom event');
        toast({
          title: "Información enviada",
          description: "Los datos están listos para ser usados",
        });
      }
    } catch (error: any) {
      console.error('Error using address:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

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
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleUseAddress(address)}
                disabled={loading === address.id}
              >
                <MapPin className="w-5 h-5 mr-2" />
                {loading === address.id ? "Aplicando..." : "USAR ESTE REPLACE"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

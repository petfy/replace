import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Briefcase, MapPin, User, Users, Building2 } from "lucide-react";
import { formatRUT, isValidRUT } from "@/lib/format-rut";

interface AddressFormProps {
  onSuccess: () => void;
  initialData?: {
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
  };
}

const categories = [
  { value: "casa", label: "Casa", icon: Home },
  { value: "trabajo", label: "Trabajo", icon: Briefcase },
  { value: "vecino", label: "Vecino", icon: Users },
  { value: "amigo", label: "Amigo", icon: User },
  { value: "familiares", label: "Familiares", icon: Users },
  { value: "conserje", label: "Conserje", icon: Building2 },
  { value: "otro", label: "Otro", icon: MapPin },
];

const countries = [
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "ES", name: "España", flag: "🇪🇸" },
];

export const AddressForm = ({ onSuccess, initialData }: AddressFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState(initialData?.label || "");
  const [street, setStreet] = useState(initialData?.street || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [state, setState] = useState(initialData?.state || "");
  const [zipCode, setZipCode] = useState(initialData?.zip_code || "");
  const [country, setCountry] = useState(initialData?.country || "CL");
  const [isDefault, setIsDefault] = useState(initialData?.is_default || false);
  const [category, setCategory] = useState(initialData?.category || "otro");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [identification, setIdentification] = useState(initialData?.identification || "");
  const [selectedCategory, setSelectedCategory] = useState(category);

  const handleIdentificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9kK-]/g, '');
    setIdentification(formatRUT(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró usuario");

      if (identification && !isValidRUT(identification)) {
        toast({
          title: "Error",
          description: "El RUT ingresado no es válido",
          variant: "destructive",
        });
        return;
      }

      const addressData = {
        label,
        street,
        city,
        state,
        zip_code: zipCode,
        country,
        is_default: isDefault,
        user_id: user.id,
        category,
        email,
        phone,
        identification,
      };

      if (initialData) {
        const { error } = await supabase
          .from("addresses")
          .update(addressData)
          .eq("id", initialData.id);
        
        if (error) throw error;
        toast({
          title: "¡Dirección actualizada!",
          description: "La dirección se ha actualizado correctamente.",
        });
      } else {
        const { error } = await supabase
          .from("addresses")
          .insert([addressData]);
        
        if (error) throw error;
        toast({
          title: "¡Dirección guardada!",
          description: "La dirección se ha guardado correctamente.",
        });
      }

      onSuccess();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar dirección" : "Nueva dirección"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.value}
                  type="button"
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  className="flex flex-col items-center p-2 h-auto"
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setCategory(cat.value);
                  }}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{cat.label}</span>
                </Button>
              );
            })}
          </div>

          <div>
            <label htmlFor="label" className="block text-sm font-medium mb-1">
              Etiqueta
            </label>
            <Input
              id="label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Casa, Trabajo, etc."
              required
            />
          </div>

          <div>
            <label htmlFor="street" className="block text-sm font-medium mb-1">
              Calle y número
            </label>
            <Input
              id="street"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Av. Siempreviva 742"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                Ciudad
              </label>
              <Input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-1">
                Estado/Provincia
              </label>
              <Input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium mb-1">
                País
              </label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un país" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="mr-2">{country.flag}</span>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                Código Postal (opcional)
              </label>
              <Input
                id="zipCode"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Teléfono
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+56 9 1234 5678"
              />
            </div>
          </div>

          <div>
            <label htmlFor="identification" className="block text-sm font-medium mb-1">
              RUT o Pasaporte
            </label>
            <Input
              id="identification"
              type="text"
              value={identification}
              onChange={handleIdentificationChange}
              placeholder="12.345.678-9"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="isDefault" className="text-sm">
              Establecer como dirección predeterminada
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : initialData ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
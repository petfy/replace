
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRUT, isValidRUT } from "@/lib/format-rut";
import { CategorySelector, categories } from "./address/CategorySelector";
import { CountrySelect } from "./address/CountrySelect";
import { RegionSelect } from "./address/RegionSelect";
import { FormProgress } from "./address/FormProgress";

interface AddressFormProps {
  onSuccess: () => void;
  initialData?: {
    id: string;
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
    first_name?: string;
    last_name?: string;
  };
}

export const AddressForm = ({ onSuccess, initialData }: AddressFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(initialData?.first_name || "");
  const [lastName, setLastName] = useState(initialData?.last_name || "");
  const [identification, setIdentification] = useState(initialData?.identification || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [country, setCountry] = useState(initialData?.country || "CL");
  const [region, setRegion] = useState(initialData?.state || "");
  const [otherState, setOtherState] = useState(initialData?.state || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [zipCode, setZipCode] = useState(initialData?.zip_code || "");
  const [street, setStreet] = useState(initialData?.street || "");
  const [isDefault, setIsDefault] = useState(initialData?.is_default || false);
  const [category, setCategory] = useState<typeof categories[number]["value"]>(initialData?.category || "otro");
  const [selectedCategory, setSelectedCategory] = useState(category);

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.first_name || "");
      setLastName(initialData.last_name || "");
      setIdentification(initialData.identification || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setCountry(initialData.country || "CL");
      setRegion(initialData.state || "");
      setOtherState(initialData.state || "");
      setCity(initialData.city || "");
      setZipCode(initialData.zip_code || "");
      setStreet(initialData.street || "");
      setIsDefault(initialData.is_default || false);
      setCategory(initialData.category || "otro");
      setSelectedCategory(initialData.category || "otro");
    }
  }, [initialData]);

  const resetForm = () => {
    if (!initialData) {
      setFirstName("");
      setLastName("");
      setIdentification("");
      setEmail("");
      setPhone("");
      setCountry("CL");
      setRegion("");
      setOtherState("");
      setCity("");
      setZipCode("");
      setStreet("");
      setIsDefault(false);
      setCategory("otro");
      setSelectedCategory("otro");
    }
  };

  const calculateProgress = () => {
    let fields = 0;
    let filledFields = 0;

    const requiredFields = {
      firstName,
      lastName,
      street,
      city,
      country,
      category,
      state: country === "CL" ? region : otherState,
      identification
    };

    fields = Object.keys(requiredFields).length;
    filledFields = Object.values(requiredFields).filter(value => value && value.trim() !== '').length;

    return Math.round((filledFields / fields) * 100);
  };

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

      const cleanRUT = identification?.replace(/\./g, '');
      if (cleanRUT && !isValidRUT(cleanRUT)) {
        toast({
          title: "Error",
          description: "El RUT ingresado no es válido",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const categoryInfo = categories.find(c => c.value === category);
      const addressData = {
        street,
        city,
        state: country === "CL" ? region : otherState,
        zip_code: zipCode,
        country,
        is_default: isDefault,
        user_id: user.id,
        category,
        email,
        phone,
        identification: cleanRUT,
        first_name: firstName,
        last_name: lastName,
        label: categoryInfo ? categoryInfo.label : category
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
        window.location.reload();
      } else {
        const { error } = await supabase
          .from("addresses")
          .insert([addressData]);
        
        if (error) throw error;
        toast({
          title: "¡Dirección guardada!",
          description: "La dirección se ha guardado correctamente.",
        });
        resetForm();
        window.location.reload();
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
        <FormProgress value={calculateProgress()} />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CategorySelector
            selectedCategory={selectedCategory}
            onCategorySelect={(value) => {
              setSelectedCategory(value);
              setCategory(value);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre"
              required
            />

            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              required
            />
          </div>

          <Input
            type="text"
            value={identification}
            onChange={handleIdentificationChange}
            placeholder="RUT"
          />

          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Teléfono"
          />

          <CountrySelect value={country} onValueChange={setCountry} />

          {country === "CL" ? (
            <RegionSelect value={region} onValueChange={setRegion} />
          ) : (
            <Input
              type="text"
              value={otherState}
              onChange={(e) => setOtherState(e.target.value)}
              placeholder="Estado/Provincia"
              required
            />
          )}

          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ciudad"
            required
          />

          <Input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Calle y número"
            required
          />

          <Input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Código Postal (opcional)"
          />

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


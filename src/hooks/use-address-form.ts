
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatRUT, isValidRUT } from "@/lib/format-rut";
import type { ChileRegionCode } from "@/lib/chile-towns";

export interface AddressFormData {
  id?: string;
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
  first_name?: string;
  last_name?: string;
}

export const useAddressForm = (initialData?: AddressFormData, onSuccess?: () => void) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(initialData?.first_name || "");
  const [lastName, setLastName] = useState(initialData?.last_name || "");
  const [identification, setIdentification] = useState(initialData?.identification || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [country, setCountry] = useState(initialData?.country || "CL");
  const [region, setRegion] = useState(initialData?.state || "");
  const [town, setTown] = useState(initialData?.city || "");
  const [otherState, setOtherState] = useState(initialData?.state || "");
  const [otherCity, setOtherCity] = useState(initialData?.city || "");
  const [zipCode, setZipCode] = useState(initialData?.zip_code || "");
  const [street, setStreet] = useState(initialData?.street || "");
  const [addressLine2, setAddressLine2] = useState(initialData?.address_line_2 || "");
  const [isDefault, setIsDefault] = useState(initialData?.is_default || false);
  const [category, setCategory] = useState<AddressFormData["category"]>(initialData?.category || "otro");
  const [selectedCategory, setSelectedCategory] = useState(category);

  const handleIdentificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9kK-]/g, '');
    setIdentification(formatRUT(value));
  };

  const calculateProgress = () => {
    let fields = 0;
    let filledFields = 0;

    const requiredFields = {
      firstName,
      lastName,
      street,
      city: country === "CL" ? town : otherCity,
      country,
      category,
      state: country === "CL" ? region : otherState,
      identification
    };

    fields = Object.keys(requiredFields).length;
    filledFields = Object.values(requiredFields).filter(value => value && value.trim() !== '').length;

    return Math.round((filledFields / fields) * 100);
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

      const addressData = {
        street,
        address_line_2: addressLine2,
        city: country === "CL" ? town : otherCity,
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
        label: category
      };

      if (initialData?.id) {
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
        window.location.reload();
      }

      onSuccess?.();
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

  return {
    loading,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    identification,
    handleIdentificationChange,
    email,
    setEmail,
    phone,
    setPhone,
    country,
    setCountry,
    region,
    setRegion,
    town,
    setTown,
    otherState,
    setOtherState,
    otherCity,
    setOtherCity,
    zipCode,
    setZipCode,
    street,
    setStreet,
    addressLine2,
    setAddressLine2,
    isDefault,
    setIsDefault,
    category,
    setCategory,
    selectedCategory,
    setSelectedCategory,
    calculateProgress,
    handleSubmit
  };
};

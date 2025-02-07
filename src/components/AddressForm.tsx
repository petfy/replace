
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategorySelector } from "./address/CategorySelector";
import { FormProgress } from "./address/FormProgress";
import { AddressPersonalInfo } from "./forms/AddressPersonalInfo";
import { AddressLocationInfo } from "./forms/AddressLocationInfo";
import { useAddressForm, type AddressFormData } from "@/hooks/use-address-form";

interface AddressFormProps {
  onSuccess: () => void;
  initialData?: AddressFormData;
}

export const AddressForm = ({ onSuccess, initialData }: AddressFormProps) => {
  const {
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
    selectedCategory,
    setSelectedCategory,
    setCategory,
    calculateProgress,
    handleSubmit
  } = useAddressForm(initialData, onSuccess);

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

          <AddressPersonalInfo
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            identification={identification}
            onIdentificationChange={handleIdentificationChange}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
          />

          <AddressLocationInfo
            country={country}
            setCountry={setCountry}
            region={region}
            setRegion={setRegion}
            town={town}
            setTown={setTown}
            otherState={otherState}
            setOtherState={setOtherState}
            otherCity={otherCity}
            setOtherCity={setOtherCity}
            street={street}
            setStreet={setStreet}
            zipCode={zipCode}
            setZipCode={setZipCode}
            addressLine2={addressLine2}
            setAddressLine2={setAddressLine2}
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

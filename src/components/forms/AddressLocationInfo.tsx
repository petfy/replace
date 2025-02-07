
import { CountrySelect } from "@/components/address/CountrySelect";
import { RegionSelect } from "@/components/address/RegionSelect";
import { TownSelect } from "@/components/address/TownSelect";
import { Input } from "@/components/ui/input";
import type { ChileRegionCode } from "@/lib/chile-towns";

interface AddressLocationInfoProps {
  country: string;
  setCountry: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  town: string;
  setTown: (value: string) => void;
  otherState: string;
  setOtherState: (value: string) => void;
  otherCity: string;
  setOtherCity: (value: string) => void;
  street: string;
  setStreet: (value: string) => void;
  zipCode: string;
  setZipCode: (value: string) => void;
  addressLine2: string;
  setAddressLine2: (value: string) => void;
}

export const AddressLocationInfo = ({
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
  street,
  setStreet,
  zipCode,
  setZipCode,
  addressLine2,
  setAddressLine2
}: AddressLocationInfoProps) => {
  return (
    <div className="space-y-4">
      <CountrySelect value={country} onValueChange={setCountry} />

      {country === "CL" ? (
        <>
          <RegionSelect value={region} onValueChange={setRegion} />
          <TownSelect
            value={town}
            onValueChange={setTown}
            regionCode={region as ChileRegionCode}
          />
        </>
      ) : (
        <>
          <Input
            type="text"
            value={otherState}
            onChange={(e) => setOtherState(e.target.value)}
            placeholder="Estado/Provincia"
            required
          />
          <Input
            type="text"
            value={otherCity}
            onChange={(e) => setOtherCity(e.target.value)}
            placeholder="Ciudad"
            required
          />
        </>
      )}

      <Input
        type="text"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        placeholder="Calle y número"
        required
      />

      <Input
        type="text"
        value={addressLine2}
        onChange={(e) => setAddressLine2(e.target.value)}
        placeholder="Casa, apartamento, etc. (opcional)"
      />

      <Input
        type="text"
        value={zipCode}
        onChange={(e) => setZipCode(e.target.value)}
        placeholder="Código Postal (opcional)"
      />
    </div>
  );
};

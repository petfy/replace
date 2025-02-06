
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "/node_modules/flag-icons/css/flag-icons.min.css";

export const countries = [
  { code: "CL", name: "Chile" },
  { code: "AR", name: "Argentina" },
  { code: "PE", name: "Perú" },
  { code: "BR", name: "Brasil" },
  { code: "CO", name: "Colombia" },
  { code: "MX", name: "México" },
  { code: "US", name: "Estados Unidos" },
  { code: "ES", name: "España" },
];

interface CountrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const CountrySelect = ({ value, onValueChange }: CountrySelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona un país" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className={`fi fi-${country.code.toLowerCase()} mr-2`}></span>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

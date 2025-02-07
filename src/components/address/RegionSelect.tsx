
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChileRegionCode } from "@/lib/chile-towns";

interface RegionSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const chileRegions = [
  { value: "AP", label: "Arica y Parinacota" },
  { value: "TA", label: "Tarapacá" },
  { value: "AN", label: "Antofagasta" },
  { value: "AT", label: "Atacama" },
  { value: "CO", label: "Coquimbo" },
  { value: "VS", label: "Valparaíso" },
  { value: "RM", label: "Región Metropolitana" },
  { value: "LI", label: "O'Higgins" },
  { value: "ML", label: "Maule" },
  { value: "NB", label: "Ñuble" },
  { value: "BI", label: "Biobío" },
  { value: "AR", label: "Araucanía" },
  { value: "LR", label: "Los Ríos" },
  { value: "LL", label: "Los Lagos" },
  { value: "AI", label: "Aysén" },
  { value: "MA", label: "Magallanes" }
] as const;

export const RegionSelect = ({ value, onValueChange }: RegionSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona tu Región" />
      </SelectTrigger>
      <SelectContent>
        {chileRegions.map((region) => (
          <SelectItem key={region.value} value={region.value}>
            {region.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};


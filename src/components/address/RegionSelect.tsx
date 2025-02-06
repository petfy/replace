
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chileRegions } from "@/lib/chile-regions";

interface RegionSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const RegionSelect = ({ value, onValueChange }: RegionSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona una región" />
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

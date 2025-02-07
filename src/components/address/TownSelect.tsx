
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chileTowns, type ChileRegionCode } from "@/lib/chile-towns";

interface TownSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  regionCode: ChileRegionCode | "";
  disabled?: boolean;
}

export const TownSelect = ({ value, onValueChange, regionCode, disabled }: TownSelectProps) => {
  // Ensure regionCode is valid and exists in chileTowns before accessing
  const towns = regionCode && regionCode in chileTowns 
    ? chileTowns[regionCode as ChileRegionCode] 
    : [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || !regionCode}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona una comuna" />
      </SelectTrigger>
      <SelectContent>
        {towns.map((town) => (
          <SelectItem key={town} value={town}>
            {town}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};


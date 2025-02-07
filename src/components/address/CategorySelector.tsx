
import { Button } from "@/components/ui/button";
import { Home, Briefcase, MapPin, User, Users, Building2 } from "lucide-react";

export const categories = [
  { value: "casa" as const, label: "Casa", icon: Home },
  { value: "trabajo" as const, label: "Trabajo", icon: Briefcase },
  { value: "vecino" as const, label: "Vecino", icon: Users },
  { value: "amigo" as const, label: "Amigo", icon: User },
  { value: "familiares" as const, label: "Familiares", icon: Users },
  { value: "conserje" as const, label: "Conserje", icon: Building2 },
  { value: "otro" as const, label: "Otro", icon: MapPin },
];

interface CategorySelectorProps {
  selectedCategory: typeof categories[number]["value"];
  onCategorySelect: (category: typeof categories[number]["value"]) => void;
}

export const CategorySelector = ({
  selectedCategory,
  onCategorySelect,
}: CategorySelectorProps) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <Button
            key={cat.value}
            type="button"
            variant={selectedCategory === cat.value ? "default" : "outline"}
            className="flex items-center justify-start space-x-2 p-2 h-12 w-full truncate"
            onClick={() => onCategorySelect(cat.value)}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs truncate">{cat.label}</span>
          </Button>
        );
      })}
    </div>
  );
};


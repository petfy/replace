
import { Store, Briefcase, ShoppingBag, ShoppingCart, Tag, Heart, Building, Award } from "lucide-react";

// Define categories with their icons
export const categories = [
  { value: "tienda", label: "Tienda", icon: Store },
  { value: "moda", label: "Moda", icon: ShoppingBag },
  { value: "tecnología", label: "Tecnología", icon: Briefcase },
  { value: "hogar", label: "Hogar", icon: Building },
  { value: "belleza", label: "Belleza", icon: Heart },
  { value: "alimentos", label: "Alimentos", icon: ShoppingCart },
  { value: "servicios", label: "Servicios", icon: Award },
  { value: "otros", label: "Otros", icon: Tag },
];

// This default export is a placeholder since this file is primarily exporting the categories array
export default function StoreCategories() {
  return null;
}

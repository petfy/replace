
import { useEffect } from "react";
import { DiscountCard } from "./DiscountCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Store } from "lucide-react";

interface DiscountsListProps {
  discounts: any[];
  urlSlug: string;
  currentBrowsingDomain?: string | null;
}

export const DiscountsList = ({ discounts, urlSlug, currentBrowsingDomain }: DiscountsListProps) => {
  // Don't render if no discounts
  if (!discounts || discounts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No hay descuentos disponibles</CardTitle>
            <CardDescription className="text-center">
              No se encontraron descuentos activos para {urlSlug}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Group discounts by type
  const orderDiscounts = discounts.filter(d => d.type === 'order');
  const shippingDiscounts = discounts.filter(d => d.type === 'shipping');
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-primary">Descuentos Disponibles</h1>
        <div className="flex items-center justify-center text-gray-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Descuentos para: {urlSlug}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {discounts.map((discount) => (
          <DiscountCard key={discount.id} discount={discount} />
        ))}
      </div>
    </div>
  );
};

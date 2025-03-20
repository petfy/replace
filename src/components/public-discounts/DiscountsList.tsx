
import { useEffect } from "react";
import { DiscountCard } from "./DiscountCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Store } from "lucide-react";
import { toast } from "sonner";

interface DiscountsListProps {
  discounts: any[];
  urlSlug: string;
  currentBrowsingDomain?: string | null;
}

export const DiscountsList = ({ discounts, urlSlug, currentBrowsingDomain }: DiscountsListProps) => {
  useEffect(() => {
    // Track view for this store's discount page
    const trackStoreView = async () => {
      try {
        // Get store ID from discounts data
        if (discounts.length > 0) {
          const storeId = discounts[0].store_id;
          console.log('Tracking store view for store ID:', storeId);
          
          const response = await fetch("https://riclirqvaxqlvbhfsowh.supabase.co/functions/v1/track-store-analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              store_id: storeId,
              event_type: "view"
            })
          });
          
          const data = await response.json();
          console.log('View tracking response:', data);
          
          if (!data.success) {
            console.error('Error tracking view:', data.error);
          }
          
          // Add store ID to a data attribute on the body for later use
          document.body.setAttribute('data-store-id', storeId);
        } else {
          console.log('No discounts found, skipping view tracking');
        }
      } catch (error) {
        console.error("Error tracking store view:", error);
        toast.error("Error al registrar la visita a la tienda");
      }
    };
    
    if (discounts.length > 0) {
      trackStoreView();
    }
  }, [discounts]);
  
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
  
  // Get store details from the first discount
  const storeId = discounts[0].store_id;
  
  return (
    <div className="max-w-4xl mx-auto p-6" data-store-id={storeId}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Descuentos para {urlSlug}</h1>
        <p className="text-gray-600">
          {currentBrowsingDomain === urlSlug 
            ? "¡Genial! Estás navegando en el sitio correcto para usar estos descuentos." 
            : "Copia estos códigos y úsalos en tu compra."}
        </p>
      </div>

      {orderDiscounts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Descuentos en pedidos</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {orderDiscounts.map((discount) => (
              <DiscountCard key={discount.id} discount={discount} />
            ))}
          </div>
        </section>
      )}

      {shippingDiscounts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Envío gratis</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {shippingDiscounts.map((discount) => (
              <DiscountCard key={discount.id} discount={discount} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

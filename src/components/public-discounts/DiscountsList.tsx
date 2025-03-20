
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DiscountCard } from "./DiscountCard";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { useStoreDiscounts } from "@/hooks/use-store-discounts";

interface DisountsListProps {
  urlSlug: string | undefined;
}

export const DiscountsList = ({ urlSlug }: DisountsListProps) => {
  const { discounts, loading, error } = useStoreDiscounts(urlSlug);
  const [copiedCodes, setCopiedCodes] = useState<string[]>([]);
  const { toast } = useToast();

  const handleCopyCode = async (code: string, storeId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodes((prev) => [...prev, code]);
      
      toast({
        title: "¡Código copiado!",
        description: "El código ha sido copiado al portapapeles.",
      });
    } catch (err) {
      console.error("No se pudo copiar el código:", err);
      toast({
        title: "Error",
        description: "No se pudo copiar el código. Intenta copiarlo manualmente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Descuentos Disponibles
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Copia el código de descuento y visita la tienda para utilizarlo
        </p>
      </div>

      {discounts.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 md:gap-8">
          {discounts.map((discount) => (
            <DiscountCard
              key={discount.id}
              discount={discount}
              isCopied={copiedCodes.includes(discount.code)}
              onCopyCode={handleCopyCode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600">
            No hay descuentos disponibles en este momento.
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <a href="/stores">Ver directorio de tiendas</a>
          </Button>
        </div>
      )}
    </div>
  );
};

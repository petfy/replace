
import { Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface DiscountListProps {
  discounts: Discount[];
  setDiscounts: (discounts: Discount[]) => void;
}

interface Discount {
  id: string;
  type: 'order' | 'shipping';
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  minimum_purchase_amount: number;
  valid_from: string;
  valid_until: string;
  status: 'active' | 'inactive' | 'expired';
}

export const DiscountList = ({ discounts, setDiscounts }: DiscountListProps) => {
  const { toast } = useToast();

  // Check for expired discounts when component mounts or discounts change
  useEffect(() => {
    const checkExpiredDiscounts = async () => {
      const now = new Date();
      const expiredDiscounts = discounts.filter(
        discount => discount.status !== 'expired' && new Date(discount.valid_until) < now
      );

      if (expiredDiscounts.length > 0) {
        // Update expired discounts in the database
        for (const discount of expiredDiscounts) {
          await supabase
            .from('store_discounts')
            .update({ status: 'expired' })
            .eq('id', discount.id);
        }

        // Update the local state with explicit type casting to ensure type safety
        const updatedDiscounts = discounts.map(discount => 
          new Date(discount.valid_until) < now 
            ? { ...discount, status: 'expired' as 'expired' } 
            : discount
        );

        setDiscounts(updatedDiscounts);

        if (expiredDiscounts.length === 1) {
          toast({
            title: "Descuento vencido",
            description: "Un descuento ha sido marcado como vencido automáticamente.",
          });
        } else {
          toast({
            title: "Descuentos vencidos",
            description: `${expiredDiscounts.length} descuentos han sido marcados como vencidos automáticamente.`,
          });
        }
      }
    };

    checkExpiredDiscounts();
  }, [discounts, setDiscounts, toast]);

  const handleStatusChange = async (discountId: string, newStatus: 'active' | 'inactive' | 'expired') => {
    try {
      const { error } = await supabase
        .from('store_discounts')
        .update({ status: newStatus })
        .eq('id', discountId);

      if (error) throw error;

      const updatedDiscounts = discounts.map(discount =>
        discount.id === discountId ? { ...discount, status: newStatus } : discount
      );

      setDiscounts(updatedDiscounts);

      toast({
        title: "¡Éxito!",
        description: "Estado del descuento actualizado correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <X className="w-5 h-5 text-red-500" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getDiscountValue = (discount: Discount) => {
    if (discount.type === 'shipping') {
      return `Por compras superiores a $${discount.minimum_purchase_amount}`;
    }
    return `${discount.value}${discount.discount_type === 'percentage' ? '%' : '$'}`;
  };

  // Check if a discount is expired
  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Descuentos</h3>
      <div className={`grid gap-4 ${discounts.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : 'md:grid-cols-2'}`}>
        {discounts.map((discount) => (
          <div key={discount.id} className="border rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(discount.status)}
                <span className="font-medium">Código:</span> {discount.code}
              </div>
              <div>
                <span className="font-medium">Tipo:</span>{' '}
                {discount.type === 'order' ? 'Descuento en Pedido' : 'Envío Gratis'}
              </div>
              <div>
                <span className="font-medium">Valor:</span>{' '}
                {getDiscountValue(discount)}
              </div>
              <div>
                <span className="font-medium">Vigencia:</span>{' '}
                {new Date(discount.valid_from).toLocaleDateString()} - {new Date(discount.valid_until).toLocaleDateString()}
                {isExpired(discount.valid_until) && discount.status !== 'expired' && (
                  <span className="ml-2 text-red-500 text-sm">(Vencido)</span>
                )}
              </div>
              <div>
                <span className="font-medium">Estado:</span>
                <select
                  className="ml-2 rounded-md border border-input bg-background px-2 py-1"
                  value={isExpired(discount.valid_until) ? 'expired' : discount.status}
                  onChange={(e) => handleStatusChange(discount.id, e.target.value as 'active' | 'inactive' | 'expired')}
                  disabled={isExpired(discount.valid_until)}
                >
                  <option value="active" disabled={isExpired(discount.valid_until)}>Activo</option>
                  <option value="inactive" disabled={isExpired(discount.valid_until)}>Inactivo</option>
                  <option value="expired">Vencido</option>
                </select>
                {isExpired(discount.valid_until) && discount.status !== 'expired' && (
                  <span className="ml-2 text-sm text-amber-600">Estado actualizado automáticamente</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {discounts.length === 0 && (
          <p className="text-gray-500">No hay descuentos</p>
        )}
      </div>
    </div>
  );
};

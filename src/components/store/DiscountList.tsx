
import { Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  valid_from: string;
  valid_until: string;
  status: 'active' | 'inactive' | 'expired';
}

export const DiscountList = ({ discounts, setDiscounts }: DiscountListProps) => {
  const { toast } = useToast();

  const handleStatusChange = async (discountId: string, newStatus: 'active' | 'inactive' | 'expired') => {
    try {
      const { error } = await supabase
        .from('store_discounts')
        .update({ status: newStatus })
        .eq('id', discountId);

      if (error) throw error;

      setDiscounts(prevDiscounts =>
        prevDiscounts.map(d =>
          d.id === discountId ? { ...d, status: newStatus } : d
        )
      );

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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Descuentos</h3>
      <div className="space-y-4">
        {discounts.map((discount) => (
          <div key={discount.id} className="border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
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
                {discount.value}{discount.discount_type === 'percentage' ? '%' : '$'}
              </div>
              <div>
                <span className="font-medium">Vigencia:</span>{' '}
                {new Date(discount.valid_from).toLocaleDateString()} - {new Date(discount.valid_until).toLocaleDateString()}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Estado:</span>
                <select
                  className="ml-2 rounded-md border border-input bg-background px-2 py-1"
                  value={discount.status}
                  onChange={(e) => handleStatusChange(discount.id, e.target.value as 'active' | 'inactive' | 'expired')}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="expired">Vencido</option>
                </select>
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

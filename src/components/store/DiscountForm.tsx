
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DiscountFormProps {
  storeId: string;
  newDiscount: Discount;
  setNewDiscount: (discount: Discount) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refreshDiscounts: () => Promise<void>;
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

export const DiscountForm = ({ 
  storeId, 
  newDiscount, 
  setNewDiscount, 
  loading, 
  setLoading,
  refreshDiscounts 
}: DiscountFormProps) => {
  const { toast } = useToast();

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('store_discounts')
        .insert({
          ...newDiscount,
          store_id: storeId,
        });

      if (error) throw error;

      await refreshDiscounts();

      setNewDiscount({
        id: '',
        type: 'order',
        code: '',
        discount_type: 'percentage',
        value: 0,
        valid_from: '',
        valid_until: '',
        status: 'active',
      });

      toast({
        title: "¡Éxito!",
        description: "El descuento se ha creado correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleDiscountSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="discount-type">Tipo de Descuento</Label>
          <select
            id="discount-type"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={newDiscount.type}
            onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value as 'order' | 'shipping' })}
            required
          >
            <option value="order">Descuento en Pedido</option>
            <option value="shipping">Envío Gratis</option>
          </select>
        </div>

        <div>
          <Label htmlFor="discount-code">Código</Label>
          <Input
            id="discount-code"
            value={newDiscount.code}
            onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="discount-value-type">Tipo de Valor</Label>
          <select
            id="discount-value-type"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={newDiscount.discount_type}
            onChange={(e) => setNewDiscount({ ...newDiscount, discount_type: e.target.value as 'percentage' | 'fixed' })}
            required
          >
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto Fijo ($)</option>
          </select>
        </div>

        <div>
          <Label htmlFor="discount-value">Valor</Label>
          <Input
            id="discount-value"
            type="number"
            min="0"
            value={newDiscount.value}
            onChange={(e) => setNewDiscount({ ...newDiscount, value: parseFloat(e.target.value) })}
            required
          />
        </div>

        <div>
          <Label htmlFor="valid-from">Válido Desde</Label>
          <Input
            id="valid-from"
            type="datetime-local"
            value={newDiscount.valid_from}
            onChange={(e) => setNewDiscount({ ...newDiscount, valid_from: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="valid-until">Válido Hasta</Label>
          <Input
            id="valid-until"
            type="datetime-local"
            value={newDiscount.valid_until}
            onChange={(e) => setNewDiscount({ ...newDiscount, valid_until: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={newDiscount.status}
            onChange={(e) => setNewDiscount({ ...newDiscount, status: e.target.value as 'active' | 'inactive' | 'expired' })}
            required
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="expired">Vencido</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear Descuento"}
      </Button>
    </form>
  );
};

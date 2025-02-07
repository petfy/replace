
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";

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

const PublicDiscounts = () => {
  const { urlSlug } = useParams();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        if (!urlSlug) {
          throw new Error('URL inválida');
        }

        console.log('Fetching discounts for slug:', urlSlug);

        // Use the anon key client which doesn't require authentication
        const { data: linkData, error: linkError } = await supabase
          .from('public_discount_links')
          .select('store_id')
          .eq('url_slug', urlSlug)
          .eq('is_active', true)
          .maybeSingle();

        if (linkError) {
          console.error('Link error:', linkError);
          throw linkError;
        }
        if (!linkData) {
          console.error('No link data found');
          throw new Error('Link no encontrado o inactivo');
        }

        console.log('Found store_id:', linkData.store_id);

        const now = new Date().toISOString();
        console.log('Current time:', now);

        // Then fetch active discounts for that store
        const { data: discountsData, error: discountsError } = await supabase
          .from('store_discounts')
          .select('*')
          .eq('store_id', linkData.store_id)
          .eq('status', 'active')
          .lte('valid_from', now)
          .gte('valid_until', now);

        if (discountsError) {
          console.error('Discounts error:', discountsError);
          throw discountsError;
        }

        console.log('Found discounts:', discountsData);
        
        // Type cast the data to ensure it matches our Discount interface
        const typedDiscounts = (discountsData || []).map(discount => ({
          ...discount,
          type: discount.type as 'order' | 'shipping',
          discount_type: discount.discount_type as 'percentage' | 'fixed',
          status: discount.status as 'active' | 'inactive' | 'expired'
        }));
        
        setDiscounts(typedDiscounts);
      } catch (error: any) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: error.message || "No se pudieron cargar los descuentos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, [urlSlug, toast]);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "¡Código copiado!",
        description: "El código de descuento ha sido copiado al portapapeles.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando descuentos...
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No hay descuentos activos en este momento.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Descuentos Disponibles</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {discounts.map((discount) => (
          <Card key={discount.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                {discount.type === 'shipping' ? 'Envío Gratis' : 'Descuento en Compra'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-lg font-semibold">
                  {discount.discount_type === 'percentage' 
                    ? `${discount.value}% de descuento`
                    : `$${discount.value} de descuento`}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <code className="bg-muted px-2 py-1 rounded">{discount.code}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(discount.code)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PublicDiscounts;

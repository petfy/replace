
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface StoreDiscount {
  id: string;
  type: string;
  code: string;
  discount_type: string;
  value: number;
  minimum_purchase_amount: number;
  valid_from: string;
  valid_until: string;
  status: string;
  store_id: string;
}

export const DiscountsTab = () => {
  const [activeDiscounts, setActiveDiscounts] = useState<StoreDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Function to check for active checkouts in other windows/tabs
    const checkForCheckouts = async () => {
      if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          chrome.runtime.sendMessage({ type: "GET_ACTIVE_TAB_URL" }, async (response) => {
            if (response && response.url) {
              const url = new URL(response.url);
              const domain = url.hostname.replace('www.', '');
              setCurrentDomain(domain);

              // Fetch discounts for this domain
              const { data: linkData, error: linkError } = await supabase
                .from('public_discount_links')
                .select('store_id')
                .eq('url_slug', domain)
                .eq('is_active', true)
                .maybeSingle();

              if (linkError) {
                console.error('Error fetching link:', linkError);
                return;
              }

              if (linkData) {
                const now = new Date().toISOString();
                const { data: discounts, error: discountsError } = await supabase
                  .from('store_discounts')
                  .select('*')
                  .eq('store_id', linkData.store_id)
                  .eq('status', 'active')
                  .lte('valid_from', now)
                  .gte('valid_until', now);

                if (discountsError) {
                  console.error('Error fetching discounts:', discountsError);
                  return;
                }

                setActiveDiscounts(discounts || []);
              }
            }
          });
        } catch (error) {
          console.error('Error checking for checkouts:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkForCheckouts();
    // Check every 30 seconds for new checkouts
    const interval = setInterval(checkForCheckouts, 30000);

    return () => clearInterval(interval);
  }, []);

  const getDiscountValue = (discount: StoreDiscount) => {
    if (discount.type === 'shipping') {
      return `Envío gratis por compras superiores a $${discount.minimum_purchase_amount}`;
    }
    return `${discount.value}${discount.discount_type === 'percentage' ? '%' : '$'} de descuento`;
  };

  if (loading) {
    return <div className="text-center py-4">Buscando descuentos disponibles...</div>;
  }

  if (!currentDomain) {
    return (
      <div className="text-center py-4">
        No se detectó ninguna página de checkout activa.
        <p className="text-sm text-gray-500 mt-2">
          Abre una página de checkout en otra pestaña para ver los descuentos disponibles.
        </p>
      </div>
    );
  }

  if (activeDiscounts.length === 0) {
    return (
      <div className="text-center py-4">
        No hay descuentos disponibles para {currentDomain}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Descuentos disponibles para {currentDomain}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {activeDiscounts.map((discount) => (
          <Card key={discount.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="text-lg font-medium">{getDiscountValue(discount)}</div>
                <div className="bg-gray-100 p-2 rounded text-center font-mono">
                  {discount.code}
                </div>
                <div className="text-sm text-gray-500">
                  Válido hasta el {new Date(discount.valid_until).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

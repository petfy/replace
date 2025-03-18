
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExtensionsCarousel } from "@/components/ExtensionsCarousel";
import { ExternalLink } from "lucide-react";

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
  const navigate = useNavigate();
  const [activeDiscounts, setActiveDiscounts] = useState<StoreDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [publicLinkSlug, setPublicLinkSlug] = useState<string | null>(null);
  const [redirectToDiscount, setRedirectToDiscount] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Function to check for active tabs and matching public discount links
    const checkForMatchingDomains = async () => {
      console.log("🔍 DiscountsTab: Checking for matching domains...");
      if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          console.log("🔌 DiscountsTab: Chrome API available, sending message to get active tab URL");
          chrome.runtime.sendMessage({ type: "GET_ACTIVE_TAB_URL" }, async (response) => {
            console.log("📨 DiscountsTab: Received response from chrome extension:", response);
            if (response && response.url) {
              const url = new URL(response.url);
              const domain = url.hostname.replace('www.', '');
              console.log(`🌐 DiscountsTab: Detected active domain: ${domain}`);
              setCurrentDomain(domain);

              // Check if this domain has a matching public link
              const { data: linkData, error: linkError } = await supabase
                .from('public_discount_links')
                .select('store_id, url_slug')
                .eq('url_slug', domain)
                .eq('is_active', true)
                .maybeSingle();

              if (linkError) {
                console.error('❌ DiscountsTab: Error fetching link:', linkError);
                return;
              }

              if (linkData) {
                console.log(`✅ DiscountsTab: Found matching public link for domain ${domain}:`, linkData);
                setPublicLinkSlug(linkData.url_slug);
                setRedirectToDiscount(`/discounts/${linkData.url_slug}`);
                
                const now = new Date().toISOString();
                const { data: discounts, error: discountsError } = await supabase
                  .from('store_discounts')
                  .select('*')
                  .eq('store_id', linkData.store_id)
                  .eq('status', 'active')
                  .lte('valid_from', now)
                  .gte('valid_until', now);

                if (discountsError) {
                  console.error('❌ DiscountsTab: Error fetching discounts:', discountsError);
                  return;
                }

                console.log(`📋 DiscountsTab: Found ${discounts?.length || 0} active discounts`);
                setActiveDiscounts(discounts || []);
              } else {
                console.log(`ℹ️ DiscountsTab: No matching public link found for domain ${domain}`);
              }
            } else {
              console.log("⚠️ DiscountsTab: No active URL detected in response", response);
            }
          });
        } catch (error) {
          console.error('❌ DiscountsTab: Error checking for domains:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("⚠️ DiscountsTab: Chrome API not available");
        setLoading(false);
      }
    };

    checkForMatchingDomains();
    // Check every 5 seconds for active tabs and domain changes
    const interval = setInterval(checkForMatchingDomains, 5000);

    return () => clearInterval(interval);
  }, []);

  // Effect to handle redirect when a matching domain is found
  useEffect(() => {
    if (redirectToDiscount) {
      console.log(`🚀 DiscountsTab: Redirecting to ${redirectToDiscount}`);
      navigate(redirectToDiscount);
    }
  }, [redirectToDiscount, navigate]);

  const getDiscountValue = (discount: StoreDiscount) => {
    if (discount.type === 'shipping') {
      return `Envío gratis por compras superiores a $${discount.minimum_purchase_amount}`;
    }
    return `${discount.value}${discount.discount_type === 'percentage' ? '%' : '$'} de descuento`;
  };

  const openPublicDiscountsPage = () => {
    if (publicLinkSlug) {
      window.open(`https://re-place.site/discounts/${publicLinkSlug}`, '_blank');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Buscando descuentos disponibles...</div>;
  }

  if (!currentDomain) {
    console.log("🚫 DiscountsTab: No current domain detected, showing default message");
    return (
      <div className="space-y-8">
        <div className="text-center py-4">
          <p>No se detectó ninguna página de checkout activa.</p>
          <p className="text-sm text-gray-500 mt-2">
            Abre una página de checkout en otra pestaña para ver los descuentos disponibles.
          </p>
          <p className="text-sm font-medium text-blue-500 mt-2">
            Estado de Chrome API: {window.chrome ? "Disponible" : "No disponible"}
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-center">
            Instala una de estas extensiones para ver los descuentos disponibles:
          </h3>
          <ExtensionsCarousel />
        </div>
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Descuentos disponibles para {currentDomain}</h3>
        {publicLinkSlug && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={openPublicDiscountsPage}
          >
            <span>Ver página de descuentos</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
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


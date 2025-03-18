
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Globe, ArrowLeft } from "lucide-react";
import confetti from 'canvas-confetti';

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

const PublicDiscounts = () => {
  const { urlSlug } = useParams();
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemedDiscounts, setRedeemedDiscounts] = useState<string[]>([]);
  const [currentBrowsingDomain, setCurrentBrowsingDomain] = useState<string | null>(null);
  const [availableDiscountLinks, setAvailableDiscountLinks] = useState<{domain: string, slug: string}[]>([]);
  const { toast } = useToast();

  // Check if we should redirect to a matching domain based on active tabs
  useEffect(() => {
    const checkForActiveTab = async () => {
      if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          chrome.runtime.sendMessage({ type: "GET_ACTIVE_TAB_URL" }, async (response) => {
            if (response && response.url) {
              const url = new URL(response.url);
              const domain = url.hostname.replace('www.', '');
              setCurrentBrowsingDomain(domain);
              
              // If we're not on a specific discount page and browser is on a domain
              // with available discounts, redirect to that domain's discount page
              if (!urlSlug) {
                // Check if this domain has a public link
                checkDomainForDiscounts(domain);
              }
            }
          });
        } catch (error) {
          console.error("Error checking active tab:", error);
        }
      }
    };

    const checkDomainForDiscounts = async (domain: string) => {
      try {
        // Get all active discount links to show available options
        const { data: allLinks, error: allLinksError } = await supabase
          .from('public_discount_links')
          .select('url_slug')
          .eq('is_active', true);
        
        if (allLinksError) throw allLinksError;
        
        if (allLinks) {
          const links = allLinks.map(link => ({
            domain: link.url_slug,
            slug: link.url_slug
          }));
          setAvailableDiscountLinks(links);
        }

        // Check for exact match
        const { data, error } = await supabase
          .from('public_discount_links')
          .select('url_slug')
          .eq('url_slug', domain)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.url_slug) {
          // We found a matching discount page - redirect to it
          navigate(`/discounts/${data.url_slug}`);
        }
      } catch (error) {
        console.error("Error checking domain for discounts:", error);
      }
    };

    checkForActiveTab();
    // Check periodically for new active tabs
    const interval = setInterval(checkForActiveTab, 5000);
    
    return () => clearInterval(interval);
  }, [navigate, urlSlug]);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!urlSlug) {
          // Don't set an error for the main page, we'll show available options
          setLoading(false);
          return;
        }

        // First, get the store_id from the public_discount_links table
        const { data: linkData, error: linkError } = await supabase
          .from('public_discount_links')
          .select('store_id')
          .eq('url_slug', urlSlug)
          .eq('is_active', true)
          .maybeSingle();

        if (linkError) {
          console.error('Error fetching link:', linkError);
          setError('Error al cargar los descuentos');
          return;
        }

        if (!linkData) {
          setError('Link no encontrado o inactivo');
          return;
        }

        // Then, get the active discounts for this store
        const now = new Date().toISOString();
        const { data: discountsData, error: discountsError } = await supabase
          .from('store_discounts')
          .select('*')
          .eq('store_id', linkData.store_id)
          .eq('status', 'active')
          .lte('valid_from', now)
          .gte('valid_until', now);

        if (discountsError) {
          console.error('Error fetching discounts:', discountsError);
          setError('Error al cargar los descuentos');
          return;
        }
        
        const typedDiscounts = (discountsData || []).map(discount => ({
          ...discount,
          type: discount.type as 'order' | 'shipping',
          discount_type: discount.discount_type as 'percentage' | 'fixed',
          status: discount.status as 'active' | 'inactive' | 'expired'
        }));
        
        setDiscounts(typedDiscounts);
      } catch (error: any) {
        console.error('Error:', error);
        setError('Error al cargar los descuentos');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, [urlSlug]);

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C']
    });
  };

  const handleRedeemDiscount = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setRedeemedDiscounts(prev => [...prev, code]);
      launchConfetti();
      
      toast({
        title: "¡Descuento copiado!",
        description: "El código ha sido copiado al portapapeles.",
      });
    } catch (err) {
      console.error('Error al copiar el código:', err);
      toast({
        title: "Error",
        description: "No se pudo copiar el código. Por favor, inténtalo manualmente.",
        variant: "destructive",
      });
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img 
          src="/lovable-uploads/8135bb2c-9d94-4a47-8471-88383f309453.png"
          alt="RePlace Logo"
          className="h-16 mb-8"
        />
        <p className="text-lg text-gray-600">Cargando descuentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img 
          src="/lovable-uploads/8135bb2c-9d94-4a47-8471-88383f309453.png"
          alt="RePlace Logo"
          className="h-16 mb-8"
        />
        <p className="text-lg text-red-600">{error}</p>
        <Button variant="outline" className="mt-4" onClick={goToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al dashboard
        </Button>
      </div>
    );
  }

  // Main discount page without a specific slug
  if (!urlSlug) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/8135bb2c-9d94-4a47-8471-88383f309453.png"
            alt="RePlace Logo"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-primary-800">Descuentos de RePlace</h1>
          
          {currentBrowsingDomain && (
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Estás navegando en: {currentBrowsingDomain}</span>
            </div>
          )}
        </div>

        {availableDiscountLinks.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Tiendas con descuentos disponibles</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {availableDiscountLinks.map((link) => (
                <Card 
                  key={link.slug} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/discounts/${link.slug}`)}
                >
                  <CardContent className="p-4 flex items-center justify-center h-24">
                    <p className="text-lg font-medium">{link.domain}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">No hay tiendas con descuentos disponibles en este momento.</p>
            <Button variant="outline" className="mt-4" onClick={goToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al dashboard
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img 
          src="/lovable-uploads/8135bb2c-9d94-4a47-8471-88383f309453.png"
          alt="RePlace Logo"
          className="h-16 mb-8"
        />
        <p className="text-lg text-gray-600">No hay descuentos activos en este momento para {urlSlug}.</p>
        <Button variant="outline" className="mt-4" onClick={goToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <img 
          src="/lovable-uploads/8135bb2c-9d94-4a47-8471-88383f309453.png"
          alt="RePlace Logo"
          className="h-16 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-primary-800">Descuentos Disponibles</h1>
        
        {currentBrowsingDomain && (
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Descuentos para: {urlSlug}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {discounts.map((discount) => (
          <Card key={discount.id} className="w-full mx-auto bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                {discount.type === 'shipping' ? (
                  <>
                    <Truck className="h-6 w-6 text-primary-600" />
                    <span>Envío Gratis</span>
                  </>
                ) : (
                  'Descuento en el Pedido'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-center">
                <p className="text-2xl font-bold text-primary-700">
                  {discount.type === 'shipping' 
                    ? `Envío Gratis en compras mayores a $${discount.minimum_purchase_amount}`
                    : discount.discount_type === 'percentage' 
                      ? `${discount.value}% de descuento`
                      : `$${discount.value} de descuento`}
                </p>
                <div className="space-y-3">
                  <code className="block w-full bg-gray-100 px-4 py-2 rounded-md text-lg font-mono">
                    {discount.code}
                  </code>
                  {redeemedDiscounts.includes(discount.code) ? (
                    <p className="text-green-600 font-medium">¡Descuento canjeado!</p>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
                      onClick={() => handleRedeemDiscount(discount.code)}
                    >
                      CANJEAR DESCUENTO
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={goToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al dashboard
        </Button>
      </div>
    </div>
  );
};

export default PublicDiscounts;

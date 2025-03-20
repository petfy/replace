
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useActiveBrowsing } from "@/hooks/use-active-browsing";
import { useStoreDiscounts } from "@/hooks/use-store-discounts";
import { LoadingState } from "@/components/public-discounts/LoadingState";
import { ErrorState } from "@/components/public-discounts/ErrorState";
import { AvailableStores } from "@/components/public-discounts/AvailableStores";
import { DiscountsList } from "@/components/public-discounts/DiscountsList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const PublicDiscounts = () => {
  const { urlSlug } = useParams();
  const navigate = useNavigate();
  
  const { currentBrowsingDomain, availableDiscountLinks, redirectToDiscount, chromeApiAvailable } = useActiveBrowsing(urlSlug);
  const { discounts, loading, error } = useStoreDiscounts(urlSlug);

  // Effect to handle redirect when a matching domain is found
  useEffect(() => {
    if (redirectToDiscount) {
      console.log(`🚀 PublicDiscounts: Redirecting to ${redirectToDiscount}`);
      navigate(redirectToDiscount);
    }
  }, [redirectToDiscount, navigate]);

  useEffect(() => {
    // Add special logging for debugging
    console.log("🔄 PublicDiscounts: Component rendered");
    console.log(`🔄 PublicDiscounts: urlSlug is ${urlSlug || 'not defined'}`);
    console.log(`🔄 PublicDiscounts: currentBrowsingDomain is ${currentBrowsingDomain || 'not detected'}`);
    console.log(`🔄 PublicDiscounts: Found ${availableDiscountLinks.length} available discount links`);
    console.log(`🔄 PublicDiscounts: Chrome API available: ${chromeApiAvailable ? 'Yes' : 'No'}`);
    
    // Log the list of available domains for easier debugging
    if (availableDiscountLinks.length > 0) {
      console.log("🔄 PublicDiscounts: Available domains:", 
        availableDiscountLinks.map(link => link.domain).join(', '));
    }
  }, [urlSlug, currentBrowsingDomain, availableDiscountLinks, chromeApiAvailable]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Main discount page without a specific slug
  if (!urlSlug) {
    return (
      <div className="space-y-6">
        {!chromeApiAvailable && (
          <Alert variant="warning" className="max-w-4xl mx-auto my-4 border-amber-500">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Detección automática no disponible</AlertTitle>
            <AlertDescription>
              No se pudo detectar automáticamente las otras pestañas abiertas porque la extensión de Chrome no 
              está instalada o no tiene permisos. Por favor, usa el buscador manual para encontrar descuentos o 
              <a href="/chrome" className="text-primary underline ml-1">instala la extensión de Chrome</a>.
            </AlertDescription>
          </Alert>
        )}
        <AvailableStores 
          availableDiscountLinks={availableDiscountLinks}
          currentBrowsingDomain={currentBrowsingDomain}
          chromeApiAvailable={chromeApiAvailable}
        />
      </div>
    );
  }

  return (
    <DiscountsList 
      discounts={discounts}
      urlSlug={urlSlug}
      currentBrowsingDomain={currentBrowsingDomain}
    />
  );
};

export default PublicDiscounts;

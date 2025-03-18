
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useActiveBrowsing } from "@/hooks/use-active-browsing";
import { useStoreDiscounts } from "@/hooks/use-store-discounts";
import { LoadingState } from "@/components/public-discounts/LoadingState";
import { ErrorState } from "@/components/public-discounts/ErrorState";
import { AvailableStores } from "@/components/public-discounts/AvailableStores";
import { DiscountsList } from "@/components/public-discounts/DiscountsList";

const PublicDiscounts = () => {
  const { urlSlug } = useParams();
  const navigate = useNavigate();
  
  const { currentBrowsingDomain, availableDiscountLinks, redirectToDiscount } = useActiveBrowsing(urlSlug);
  const { discounts, loading, error } = useStoreDiscounts(urlSlug);

  // Effect to handle redirect when a matching domain is found
  useEffect(() => {
    if (redirectToDiscount) {
      navigate(redirectToDiscount);
    }
  }, [redirectToDiscount, navigate]);

  useEffect(() => {
    // Add special logging for debugging
    console.log("🔄 PublicDiscounts: Component rendered");
    console.log(`🔄 PublicDiscounts: urlSlug is ${urlSlug || 'not defined'}`);
    console.log(`🔄 PublicDiscounts: currentBrowsingDomain is ${currentBrowsingDomain || 'not detected'}`);
    console.log(`🔄 PublicDiscounts: Found ${availableDiscountLinks.length} available discount links`);
  }, [urlSlug, currentBrowsingDomain, availableDiscountLinks]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Main discount page without a specific slug
  if (!urlSlug) {
    return (
      <AvailableStores 
        availableDiscountLinks={availableDiscountLinks}
        currentBrowsingDomain={currentBrowsingDomain}
      />
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

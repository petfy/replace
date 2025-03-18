
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DiscountLink {
  domain: string;
  slug: string;
}

export const useActiveBrowsing = (urlSlug?: string) => {
  const [currentBrowsingDomain, setCurrentBrowsingDomain] = useState<string | null>(null);
  const [availableDiscountLinks, setAvailableDiscountLinks] = useState<DiscountLink[]>([]);
  const [redirectToDiscount, setRedirectToDiscount] = useState<string | null>(null);

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
          setRedirectToDiscount(`/discounts/${data.url_slug}`);
        }
      } catch (error) {
        console.error("Error checking domain for discounts:", error);
      }
    };

    checkForActiveTab();
    // Check periodically for new active tabs
    const interval = setInterval(checkForActiveTab, 5000);
    
    return () => clearInterval(interval);
  }, [urlSlug]);

  return {
    currentBrowsingDomain,
    availableDiscountLinks,
    redirectToDiscount
  };
};

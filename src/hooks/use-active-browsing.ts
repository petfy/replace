
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DiscountLink {
  domain: string;
  slug: string;
}

export const useActiveBrowsing = (urlSlug?: string) => {
  const [currentBrowsingDomain, setCurrentBrowsingDomain] = useState<string | null>(null);
  const [manualDomain, setManualDomain] = useState<string | null>(null);
  const [availableDiscountLinks, setAvailableDiscountLinks] = useState<DiscountLink[]>([]);
  const [redirectToDiscount, setRedirectToDiscount] = useState<string | null>(null);
  const [chromeApiAvailable, setChromeApiAvailable] = useState<boolean>(false);

  // Function to check if a domain has available discounts
  const checkDomainForDiscounts = async (domain: string) => {
    try {
      console.log(`🔍 useActiveBrowsing: Checking domain ${domain} for discounts`);
      // Get all active discount links to show available options
      const { data: allLinks, error: allLinksError } = await supabase
        .from('public_discount_links')
        .select('url_slug')
        .eq('is_active', true);
      
      if (allLinksError) {
        console.error("❌ useActiveBrowsing: Error fetching all links:", allLinksError);
        throw allLinksError;
      }
      
      if (allLinks) {
        console.log(`📋 useActiveBrowsing: Found ${allLinks.length} active discount links`);
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

      if (error) {
        console.error("❌ useActiveBrowsing: Error checking for exact match:", error);
        throw error;
      }
      
      if (data?.url_slug) {
        console.log(`✅ useActiveBrowsing: Found matching discount page for ${domain}`);
        // We found a matching discount page - redirect to it
        setRedirectToDiscount(`/discounts/${data.url_slug}`);
      } else {
        console.log(`ℹ️ useActiveBrowsing: No matching discount page found for ${domain}`);
      }
    } catch (error) {
      console.error("❌ useActiveBrowsing: Error checking domain for discounts:", error);
    }
  };

  useEffect(() => {
    const checkForActiveTab = async () => {
      console.log("🔍 useActiveBrowsing: Starting active tab check");
      
      // Check if Chrome API is available
      const isChromeApiAvailable = !!(window.chrome && chrome.runtime && chrome.runtime.sendMessage);
      setChromeApiAvailable(isChromeApiAvailable);
      
      console.log(`🧩 useActiveBrowsing: Chrome API status: ${isChromeApiAvailable ? "Available" : "Not available"}`);
      
      if (isChromeApiAvailable) {
        try {
          console.log("🔌 useActiveBrowsing: Sending message to get active tab URL");
          chrome.runtime.sendMessage({ type: "GET_ACTIVE_TAB_URL" }, async (response) => {
            console.log("📨 useActiveBrowsing: Received response:", response);
            if (response && response.url) {
              const url = new URL(response.url);
              const domain = url.hostname.replace('www.', '');
              console.log(`🌐 useActiveBrowsing: Detected domain: ${domain}`);
              setCurrentBrowsingDomain(domain);
              
              // If we're not on a specific discount page and browser is on a domain
              // with available discounts, redirect to that domain's discount page
              if (!urlSlug) {
                // Check if this domain has a public link
                console.log(`🔍 useActiveBrowsing: Checking if domain ${domain} has available discounts`);
                checkDomainForDiscounts(domain);
              }
            } else {
              console.log("⚠️ useActiveBrowsing: No URL in response or no response received");
            }
          });
        } catch (error) {
          console.error("❌ useActiveBrowsing: Error checking active tab:", error);
        }
      } else {
        console.log("⚠️ useActiveBrowsing: Chrome extension API not available");
        
        // If Chrome API is not available and we have a manualDomain, use that instead
        if (manualDomain && !urlSlug) {
          console.log(`🔄 useActiveBrowsing: Using manually entered domain: ${manualDomain}`);
          setCurrentBrowsingDomain(manualDomain);
          checkDomainForDiscounts(manualDomain);
        }
      }
    };

    checkForActiveTab();
    
    // Check periodically for new active tabs
    const interval = setInterval(checkForActiveTab, 5000);
    
    return () => clearInterval(interval);
  }, [urlSlug, manualDomain]);

  return {
    currentBrowsingDomain,
    availableDiscountLinks,
    redirectToDiscount,
    chromeApiAvailable,
    setManualDomain
  };
};


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
  const [chromeApiTested, setChromeApiTested] = useState<boolean>(false);

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

  // Function to extract domain from URL
  const extractDomain = (url: string): string => {
    try {
      // Try to create a URL from the input
      const parsedUrl = url.startsWith('http') ? new URL(url) : new URL(`http://${url}`);
      return parsedUrl.hostname.replace('www.', '');
    } catch (error) {
      // If URL creation fails, just clean the input
      return url.replace('www.', '').split('/')[0];
    }
  };

  // Function to check Chrome API availability with timeout
  const testChromeApiAvailability = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Set a timeout in case the Chrome API doesn't respond
      const timeoutId = setTimeout(() => {
        console.log("⏱️ useActiveBrowsing: Chrome API test timed out");
        resolve(false);
      }, 1000);

      // Test if Chrome API is available
      if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          console.log("🧪 useActiveBrowsing: Testing Chrome API with ping message");
          chrome.runtime.sendMessage({ type: "PING" }, (response) => {
            clearTimeout(timeoutId);
            
            const apiAvailable = !!response;
            console.log(`🧪 useActiveBrowsing: Chrome API test result: ${apiAvailable ? "Available" : "Not available"}`);
            resolve(apiAvailable);
          });
        } catch (error) {
          clearTimeout(timeoutId);
          console.error("❌ useActiveBrowsing: Error testing Chrome API:", error);
          resolve(false);
        }
      } else {
        clearTimeout(timeoutId);
        console.log("⚠️ useActiveBrowsing: Chrome API not detected in window object");
        resolve(false);
      }
    });
  };

  useEffect(() => {
    const checkForActiveTab = async () => {
      console.log("🔍 useActiveBrowsing: Starting active tab check");
      
      // Only test Chrome API availability once
      if (!chromeApiTested) {
        const apiAvailable = await testChromeApiAvailability();
        setChromeApiAvailable(apiAvailable);
        setChromeApiTested(true);
        console.log(`🧩 useActiveBrowsing: Chrome API status set to: ${apiAvailable ? "Available" : "Not available"}`);
      }
      
      // Try to get the active tab URL directly if Chrome API is available
      if (chromeApiAvailable) {
        try {
          console.log("🔌 useActiveBrowsing: Sending message to get active tab URL");
          chrome.runtime.sendMessage({ type: "GET_ACTIVE_TAB_URL" }, async (response) => {
            console.log("📨 useActiveBrowsing: Received response:", response);
            if (response && response.url) {
              const domain = extractDomain(response.url);
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
              
              // As fallback, try alternative method to detect tabs
              tryAlternativeTabDetection();
            }
          });
        } catch (error) {
          console.error("❌ useActiveBrowsing: Error checking active tab:", error);
          
          // Try alternative method if Chrome API fails
          tryAlternativeTabDetection();
        }
      } else {
        console.log("⚠️ useActiveBrowsing: Chrome extension API not available");
        
        // Try to parse the current URL as fallback
        tryUrlParsingFallback();
        
        // If Chrome API is not available and we have a manualDomain, use that instead
        if (manualDomain && !urlSlug) {
          console.log(`🔄 useActiveBrowsing: Using manually entered domain: ${manualDomain}`);
          setCurrentBrowsingDomain(manualDomain);
          checkDomainForDiscounts(manualDomain);
        }
      }
    };

    // Try to detect active tab using alternative methods
    const tryAlternativeTabDetection = () => {
      console.log("🔄 useActiveBrowsing: Trying alternative tab detection");
      
      // This function listens for messages from the content script
      const handleContentScriptMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'CURRENT_URL') {
          console.log(`📨 useActiveBrowsing: Received URL from content script: ${event.data.url}`);
          const domain = extractDomain(event.data.url);
          setCurrentBrowsingDomain(domain);
          
          if (!urlSlug) {
            checkDomainForDiscounts(domain);
          }
        }
      };
      
      // Add a listener for messages from content scripts
      window.addEventListener('message', handleContentScriptMessage);
      
      // Create a custom event to request URL from content script
      const requestEvent = new CustomEvent('REQUEST_CURRENT_URL');
      window.dispatchEvent(requestEvent);
      document.dispatchEvent(requestEvent);
      
      // Clean up the listener
      return () => {
        window.removeEventListener('message', handleContentScriptMessage);
      };
    };
    
    // Try to parse the current URL as fallback
    const tryUrlParsingFallback = () => {
      try {
        // Get referrer or current URL
        const urlToCheck = document.referrer || window.location.href;
        if (urlToCheck) {
          const domain = extractDomain(urlToCheck);
          console.log(`🔍 useActiveBrowsing: Parsed URL fallback - domain: ${domain}`);
          setCurrentBrowsingDomain(domain);
          
          if (!urlSlug) {
            checkDomainForDiscounts(domain);
          }
        }
      } catch (error) {
        console.error("❌ useActiveBrowsing: Error in URL parsing fallback:", error);
      }
    };

    checkForActiveTab();
    
    // Check periodically for new active tabs
    const interval = setInterval(checkForActiveTab, 5000);
    
    return () => clearInterval(interval);
  }, [urlSlug, manualDomain, chromeApiAvailable, chromeApiTested]);

  return {
    currentBrowsingDomain,
    availableDiscountLinks,
    redirectToDiscount,
    chromeApiAvailable,
    setManualDomain
  };
};

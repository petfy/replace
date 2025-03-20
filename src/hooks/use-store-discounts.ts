
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Discount {
  id: string;
  store_id: string; // Added the missing store_id property
  type: 'order' | 'shipping';
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  minimum_purchase_amount: number;
  valid_from: string;
  valid_until: string;
  status: 'active' | 'inactive' | 'expired';
}

export const useStoreDiscounts = (urlSlug?: string) => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    discounts,
    loading,
    error
  };
};

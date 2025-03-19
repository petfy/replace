
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { StoreNav } from "@/components/store/StoreNav";
import { StoreForm } from "@/components/store/StoreForm";
import { DiscountForm } from "@/components/store/DiscountForm";
import { DiscountList } from "@/components/store/DiscountList";
import { PublicLinkGenerator } from "@/components/store/PublicLinkGenerator";
import { ExternalLink } from "lucide-react";

interface StoreData {
  id?: string;
  name: string;
  email: string;
  category: string;
  keywords: string[];
  website: string;
  platform: 'shopify' | 'woocommerce' | 'wix' | 'tiendanube' | 'jumpseller' | 'vtex' | 'magento' | 'otro';
  logo_url?: string;
}

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

const DEFAULT_STORE_DATA: Omit<StoreData, 'id'> = {
  name: '',
  email: '',
  category: '',
  keywords: [],
  website: '',
  platform: 'shopify',
  logo_url: '',
};

const DEFAULT_DISCOUNT: Discount = {
  id: '',
  type: 'order',
  code: '',
  discount_type: 'percentage',
  value: 0,
  minimum_purchase_amount: 0,
  valid_from: '',
  valid_until: '',
  status: 'active',
};

const StoreDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<StoreData>(DEFAULT_STORE_DATA);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [newDiscount, setNewDiscount] = useState<Discount>(DEFAULT_DISCOUNT);

  const fetchDiscounts = async (storeId: string) => {
    if (!storeId) {
      console.warn('Attempted to fetch discounts without a valid store ID');
      return;
    }

    const { data: discountsData, error: discountsError } = await supabase
      .from('store_discounts')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (discountsError) throw discountsError;
    
    const typedDiscounts = (discountsData || []).map(d => ({
      ...d,
      type: d.type as 'order' | 'shipping',
      discount_type: d.discount_type as 'percentage' | 'fixed',
      status: d.status as 'active' | 'inactive' | 'expired'
    }));
    
    setDiscounts(typedDiscounts);
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          navigate("/auth");
          return;
        }

        if (user.id) {
          const { data: storesData, error: storeError } = await supabase
            .from('stores')
            .select('*')
            .eq('user_id', user.id)
            .limit(1);

          if (storeError) {
            throw storeError;
          }

          if (storesData && storesData.length > 0) {
            setStoreData(storesData[0]);
            await fetchDiscounts(storesData[0].id);
          }
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkUser();
  }, [navigate, toast]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreNav />
      
      {/* JonyTips.com Promotional Banner */}
      <div className="bg-primary-700 text-white py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center">
            <img 
              src="https://jonytips.com/cdn/shop/files/jonytips_logo.png" 
              alt="JonyTips.com" 
              className="h-8 sm:h-10 mr-3" 
            />
            <div className="hidden sm:block">
              <img 
                src="https://jonytips.com/cdn/shop/files/Nuevo_proyecto_6.png" 
                alt="Shopify Expert" 
                className="h-6" 
              />
            </div>
          </div>
          <p className="text-sm sm:text-base text-center sm:text-left">
            ¿Necesitas hacer mejoras en tu ecommerce? Visita{" "}
            <a 
              href="https://www.jonytips.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold underline hover:text-primary-200 inline-flex items-center"
            >
              www.jonytips.com <ExternalLink className="h-3 w-3 ml-1" />
            </a>{" "}
            y obtén soluciones listas y asesorías para mejorar tus ventas.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="store" className="space-y-6">
            <TabsList>
              <TabsTrigger value="store">Datos de la Tienda</TabsTrigger>
              <TabsTrigger value="discounts">Descuentos</TabsTrigger>
              <TabsTrigger value="public-link">URL Pública</TabsTrigger>
            </TabsList>

            <TabsContent value="store" className="space-y-6">
              <StoreForm
                storeData={storeData}
                setStoreData={setStoreData}
                loading={loading}
                setLoading={setLoading}
              />
            </TabsContent>

            <TabsContent value="discounts" className="space-y-6">
              <DiscountForm
                storeId={storeData.id || ''}
                newDiscount={newDiscount}
                setNewDiscount={setNewDiscount}
                loading={loading}
                setLoading={setLoading}
                refreshDiscounts={() => storeData.id ? fetchDiscounts(storeData.id) : undefined}
              />
              <DiscountList
                discounts={discounts}
                setDiscounts={setDiscounts}
              />
            </TabsContent>

            <TabsContent value="public-link" className="space-y-6">
              <PublicLinkGenerator storeId={storeData.id || ''} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default StoreDashboard;

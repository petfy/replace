
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Store, Image as ImageIcon } from "lucide-react";

interface StoreData {
  id: string;
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
  valid_from: string;
  valid_until: string;
}

const DEFAULT_STORE_DATA: StoreData = {
  id: '',
  name: '',
  email: '',
  category: '',
  keywords: [],
  website: '',
  platform: 'shopify',
  logo_url: '',
};

const StoreDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<StoreData>(DEFAULT_STORE_DATA);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // New discount form state
  const [newDiscount, setNewDiscount] = useState<Discount>({
    id: '',
    type: 'order',
    code: '',
    discount_type: 'percentage',
    value: 0,
    valid_from: '',
    valid_until: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          navigate("/auth");
          return;
        }

        // Only proceed with store fetch if we have a valid user ID
        if (user.id) {
          const { data: storeData, error: storeError } = await supabase
            .from('stores')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (storeError) {
            throw storeError;
          }

          if (storeData) {
            setStoreData(storeData);
            // Fetch discounts only if store exists
            const { data: discountsData, error: discountsError } = await supabase
              .from('store_discounts')
              .select('*')
              .eq('store_id', storeData.id)
              .order('created_at', { ascending: false });

            if (discountsError) throw discountsError;
            
            // Ensure the type casting is correct when setting discounts
            const typedDiscounts = (discountsData || []).map(d => ({
              ...d,
              type: d.type as 'order' | 'shipping',
              discount_type: d.discount_type as 'percentage' | 'fixed'
            }));
            
            setDiscounts(typedDiscounts);
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

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let logoUrl = storeData?.logo_url;

      // Handle logo upload if a new file was selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('store_logos')
          .upload(filePath, logoFile, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('store_logos')
          .getPublicUrl(filePath);

        logoUrl = publicUrl;
      }

      // Ensure we have a valid user ID before attempting to insert/update
      if (!user.id) {
        throw new Error("Invalid user ID");
      }

      const storePayload = {
        user_id: user.id, // Make sure user_id is explicitly set
        ...storeData,
        logo_url: logoUrl,
        keywords: storeData?.keywords?.join(',').split(',').map(k => k.trim()) || [],
      };

      // Use upsert to handle both insert and update cases
      const { error: storeError } = await supabase
        .from('stores')
        .upsert(storePayload);

      if (storeError) throw storeError;

      toast({
        title: "¡Éxito!",
        description: "Los datos de la tienda se han guardado correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('store_discounts')
        .insert({
          ...newDiscount,
          store_id: storeData.id,
        });

      if (error) throw error;

      // Refresh discounts
      const { data: discountsData, error: discountsError } = await supabase
        .from('store_discounts')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (discountsError) throw discountsError;
      setDiscounts(discountsData?.map(d => ({
        ...d,
        type: d.type as 'order' | 'shipping',
        discount_type: d.discount_type as 'percentage' | 'fixed'
      })) || []);

      // Reset form
      setNewDiscount({
        id: '',
        type: 'order',
        code: '',
        discount_type: 'percentage',
        value: 0,
        valid_from: '',
        valid_until: '',
      });

      toast({
        title: "¡Éxito!",
        description: "El descuento se ha creado correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Store className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">Dashboard de Tienda</span>
              </div>
            </div>
            <div className="flex items-center">
              <Button onClick={handleLogout} variant="ghost">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="store" className="space-y-6">
            <TabsList>
              <TabsTrigger value="store">Datos de la Tienda</TabsTrigger>
              <TabsTrigger value="discounts">Descuentos</TabsTrigger>
            </TabsList>

            <TabsContent value="store" className="space-y-6">
              <form onSubmit={handleStoreSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nombre de la Tienda</Label>
                    <Input
                      id="name"
                      value={storeData?.name || ''}
                      onChange={(e) => setStoreData(prev => ({ ...prev!, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={storeData?.email || ''}
                      onChange={(e) => setStoreData(prev => ({ ...prev!, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Input
                      id="category"
                      value={storeData?.category || ''}
                      onChange={(e) => setStoreData(prev => ({ ...prev!, category: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      type="url"
                      value={storeData?.website || ''}
                      onChange={(e) => setStoreData(prev => ({ ...prev!, website: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="keywords">Palabras Clave (separadas por coma)</Label>
                    <Input
                      id="keywords"
                      value={storeData?.keywords?.join(', ') || ''}
                      onChange={(e) => setStoreData(prev => ({ ...prev!, keywords: e.target.value.split(',').map(k => k.trim()) }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="platform">Plataforma de E-commerce</Label>
                    <select
                      id="platform"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={storeData?.platform || 'shopify'}
                      onChange={(e) => setStoreData(prev => ({ ...prev!, platform: e.target.value as StoreData['platform'] }))}
                      required
                    >
                      <option value="shopify">Shopify</option>
                      <option value="vtex">Vtex</option>
                      <option value="jumpseller">Jumpseller</option>
                      <option value="wix">Wix</option>
                      <option value="woocommerce">WooCommerce</option>
                      <option value="magento">Magento</option>
                      <option value="tiendanube">TiendaNube</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="logo">Logo (formato 1:1)</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="w-24 h-24 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                        {(previewUrl || storeData?.logo_url) ? (
                          <img
                            src={previewUrl || storeData?.logo_url}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="discounts" className="space-y-6">
              <form onSubmit={handleDiscountSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="discount-type">Tipo de Descuento</Label>
                    <select
                      id="discount-type"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={newDiscount.type}
                      onChange={(e) => setNewDiscount(prev => ({ ...prev, type: e.target.value as 'order' | 'shipping' }))}
                      required
                    >
                      <option value="order">Descuento en Pedido</option>
                      <option value="shipping">Envío Gratis</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="discount-code">Código</Label>
                    <Input
                      id="discount-code"
                      value={newDiscount.code}
                      onChange={(e) => setNewDiscount(prev => ({ ...prev, code: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount-value-type">Tipo de Valor</Label>
                    <select
                      id="discount-value-type"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={newDiscount.discount_type}
                      onChange={(e) => setNewDiscount(prev => ({ ...prev, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                      required
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto Fijo ($)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="discount-value">Valor</Label>
                    <Input
                      id="discount-value"
                      type="number"
                      min="0"
                      value={newDiscount.value}
                      onChange={(e) => setNewDiscount(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="valid-from">Válido Desde</Label>
                    <Input
                      id="valid-from"
                      type="datetime-local"
                      value={newDiscount.valid_from}
                      onChange={(e) => setNewDiscount(prev => ({ ...prev, valid_from: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="valid-until">Válido Hasta</Label>
                    <Input
                      id="valid-until"
                      type="datetime-local"
                      value={newDiscount.valid_until}
                      onChange={(e) => setNewDiscount(prev => ({ ...prev, valid_until: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Creando..." : "Crear Descuento"}
                </Button>
              </form>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Descuentos Activos</h3>
                <div className="space-y-4">
                  {discounts.map((discount) => (
                    <div key={discount.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Código:</span> {discount.code}
                        </div>
                        <div>
                          <span className="font-medium">Tipo:</span>{' '}
                          {discount.type === 'order' ? 'Descuento en Pedido' : 'Envío Gratis'}
                        </div>
                        <div>
                          <span className="font-medium">Valor:</span>{' '}
                          {discount.value}{discount.discount_type === 'percentage' ? '%' : '$'}
                        </div>
                        <div>
                          <span className="font-medium">Vigencia:</span>{' '}
                          {new Date(discount.valid_from).toLocaleDateString()} - {new Date(discount.valid_until).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {discounts.length === 0 && (
                    <p className="text-gray-500">No hay descuentos activos</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default StoreDashboard;

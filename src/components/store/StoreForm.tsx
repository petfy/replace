
import { useState } from "react";
import { Store, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StoreFormProps {
  storeData: StoreData;
  setStoreData: (data: StoreData) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface StoreData {
  id?: string;
  name: string;
  email: string;
  category: string;
  keywords: string[];
  website: string;
  platform: 'shopify' | 'woocommerce' | 'wix' | 'tiendanube' | 'jumpseller' | 'vtex' | 'magento' | 'otro';
  logo_url?: string;
  description?: string;
}

export const StoreForm = ({ storeData, setStoreData, loading, setLoading }: StoreFormProps) => {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let logoUrl = storeData?.logo_url;

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

      if (!user.id) {
        throw new Error("Invalid user ID");
      }

      const { id, ...storeWithoutId } = storeData;
      const storePayload = {
        ...storeWithoutId,
        user_id: user.id,
        logo_url: logoUrl,
        keywords: storeData?.keywords?.join(',').split(',').map(k => k.trim()) || [],
      };

      const { error: storeError } = await supabase
        .from('stores')
        .upsert(id ? { id, ...storePayload } : storePayload);

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

  return (
    <form onSubmit={handleStoreSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Nombre de la Tienda</Label>
          <Input
            id="name"
            value={storeData?.name || ''}
            onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={storeData?.email || ''}
            onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Categoría</Label>
          <Input
            id="category"
            value={storeData?.category || ''}
            onChange={(e) => setStoreData({ ...storeData, category: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="website">Sitio Web</Label>
          <Input
            id="website"
            type="url"
            value={storeData?.website || ''}
            onChange={(e) => setStoreData({ ...storeData, website: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="keywords">Palabras Clave (separadas por coma)</Label>
          <Input
            id="keywords"
            value={storeData?.keywords?.join(', ') || ''}
            onChange={(e) => setStoreData({ ...storeData, keywords: e.target.value.split(',').map(k => k.trim()) })}
          />
        </div>

        <div>
          <Label htmlFor="platform">Plataforma de E-commerce</Label>
          <select
            id="platform"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={storeData?.platform || 'shopify'}
            onChange={(e) => setStoreData({ ...storeData, platform: e.target.value as StoreData['platform'] })}
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
          <Label htmlFor="description">Descripción de la Tienda</Label>
          <Textarea
            id="description"
            value={storeData?.description || ''}
            onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
            placeholder="Breve descripción de tu tienda y productos que ofreces..."
            rows={3}
            className="resize-none"
          />
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
  );
};

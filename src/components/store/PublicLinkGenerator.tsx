
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, ExternalLink } from "lucide-react";

interface PublicLinkGeneratorProps {
  storeId: string;
}

export const PublicLinkGenerator = ({ storeId }: PublicLinkGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");
  const [urlSlug, setUrlSlug] = useState("");
  const { toast } = useToast();
  const BASE_URL = window.location.origin; // Use dynamic origin instead of hardcoded URL

  useEffect(() => {
    const generateSlug = async () => {
      try {
        setLoading(true);
        // Get store website
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('website')
          .eq('id', storeId)
          .single();

        if (storeError) throw storeError;
        if (!storeData?.website) {
          toast({
            title: "Aviso",
            description: "Por favor, primero configura el sitio web de tu tienda.",
            variant: "default",
          });
          setLoading(false);
          return;
        }

        // Extract domain from website URL
        const url = new URL(storeData.website.startsWith('http') ? storeData.website : `https://${storeData.website}`);
        const domain = url.hostname.replace('www.', '');
        
        // Check if a link already exists
        const { data: existingLink, error: linkError } = await supabase
          .from('public_discount_links')
          .select('url_slug')
          .eq('store_id', storeId)
          .eq('is_active', true)
          .maybeSingle();

        if (linkError) throw linkError;

        if (existingLink) {
          setUrlSlug(existingLink.url_slug);
          setPublicUrl(`${BASE_URL}/discounts/${existingLink.url_slug}`);
          setLoading(false);
          return;
        }

        // Create new link with domain as slug
        const { error: insertError } = await supabase
          .from('public_discount_links')
          .insert({
            store_id: storeId,
            url_slug: domain,
            is_active: true,
          });

        if (insertError) throw insertError;

        setUrlSlug(domain);
        setPublicUrl(`${BASE_URL}/discounts/${domain}`);
        
        toast({
          title: "¡Éxito!",
          description: "URL pública generada automáticamente.",
        });
      } catch (error: any) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      generateSlug();
    }
  }, [storeId, toast, BASE_URL]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({
        title: "¡Copiado!",
        description: "URL copiada al portapapeles.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar la URL. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const openPublicDiscountsPage = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="space-y-6 bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium">URL Pública de Descuentos</h3>
      
      {loading ? (
        <div className="text-center py-4">Generando URL...</div>
      ) : publicUrl ? (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <Label>URL Pública</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input value={publicUrl} readOnly />
            <Button variant="outline" onClick={copyToClipboard} title="Copiar URL">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={openPublicDiscountsPage} title="Abrir en nueva pestaña">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Los clientes que visiten {urlSlug} verán automáticamente tus descuentos disponibles.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            La extensión de Chrome de RePlace detectará automáticamente cuando los usuarios estén navegando en {urlSlug}
            y les mostrará los descuentos disponibles.
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          Configura el sitio web de tu tienda para generar una URL pública.
        </div>
      )}
    </div>
  );
};

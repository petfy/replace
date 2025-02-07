
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy } from "lucide-react";

interface PublicLinkGeneratorProps {
  storeId: string;
}

export const PublicLinkGenerator = ({ storeId }: PublicLinkGeneratorProps) => {
  const [urlSlug, setUrlSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlSlug.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un identificador para la URL.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('public_discount_links')
        .insert({
          store_id: storeId,
          url_slug: urlSlug.trim(),
        });

      if (error) throw error;

      const newPublicUrl = `${window.location.origin}/discounts/${urlSlug}`;
      setPublicUrl(newPublicUrl);
      
      toast({
        title: "¡Éxito!",
        description: "URL pública generada correctamente.",
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

  return (
    <div className="space-y-6 bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium">Generar URL Pública de Descuentos</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="url-slug">Identificador para la URL</Label>
          <Input
            id="url-slug"
            value={urlSlug}
            onChange={(e) => setUrlSlug(e.target.value)}
            placeholder="mi-tienda-descuentos"
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Generando..." : "Generar URL Pública"}
        </Button>
      </form>

      {publicUrl && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <Label>URL Pública</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input value={publicUrl} readOnly />
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

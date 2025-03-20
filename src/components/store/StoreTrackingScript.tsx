
import { useState } from "react";
import { CopyIcon, CheckIcon, CodeIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StoreTrackingScriptProps {
  storeId: string;
}

export const StoreTrackingScript = ({ storeId }: StoreTrackingScriptProps) => {
  const [copied, setCopied] = useState(false);

  // Generate the tracking script with the store ID
  const generateTrackingScript = () => {
    return `<script>
  // RePlace Analytics Tracking Script
  (function() {
    // Store ID to track
    const storeId = "${storeId}";
    
    // Tracking function
    const trackEvent = async (eventType) => {
      try {
        await fetch("https://riclirqvaxqlvbhfsowh.supabase.co/functions/v1/track-store-analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            store_id: storeId,
            event_type: eventType
          })
        });
        console.log("RePlace tracking:", eventType);
      } catch (error) {
        console.error("RePlace tracking error:", error);
      }
    };
    
    // Track page view on load
    window.addEventListener("load", () => {
      trackEvent("view");
    });
    
    // Track clicks on links with data-replace-track attribute
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-replace-track]")) {
        trackEvent("click");
      }
    });
    
    // Track discount usage
    if (window.location.search.includes("replace_discount=")) {
      trackEvent("discount_usage");
    }
  })();
</script>`;
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(generateTrackingScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const storeUrl = `${window.location.origin}/stores?replace_store=${storeId}`;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CodeIcon className="mr-2 h-5 w-5" />
          Script de Seguimiento
        </CardTitle>
        <CardDescription>
          Agrega este script a tu sitio web para rastrear visitas y conversiones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="instructions">
          <TabsList className="mb-4">
            <TabsTrigger value="instructions">Instrucciones</TabsTrigger>
            <TabsTrigger value="code">Código</TabsTrigger>
          </TabsList>
          <TabsContent value="instructions" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Paso 1: Copia el script</h3>
              <p className="text-sm text-muted-foreground">
                Haz clic en la pestaña "Código" y copia el script de seguimiento.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Paso 2: Agrega el script a tu sitio</h3>
              <p className="text-sm text-muted-foreground">
                Pega el script justo antes del cierre de la etiqueta &lt;/body&gt; en todas las páginas de tu sitio web.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Paso 3: Agrega atributo a tus enlaces</h3>
              <p className="text-sm text-muted-foreground">
                Para rastrear los clics, agrega el atributo <code className="bg-muted px-1 py-0.5 rounded">data-replace-track</code> a los enlaces que deseas rastrear:
              </p>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                {`<a href="https://tutienda.com" data-replace-track>Visita mi tienda</a>`}
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Paso 4: Enlaza desde RePlace</h3>
              <p className="text-sm text-muted-foreground">
                Usa la siguiente URL para enlazar a tu tienda desde RePlace y trackear los descuentos:
              </p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-muted px-2 py-1 rounded text-xs overflow-x-auto">
                  {storeUrl}
                </code>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(storeUrl);
                    alert("URL copiada al portapapeles");
                  }}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="code">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md text-xs leading-relaxed overflow-x-auto" style={{ maxHeight: "300px" }}>
                {generateTrackingScript()}
              </pre>
              <Button
                size="sm"
                onClick={handleCopyClick}
                className="absolute top-2 right-2"
                variant="secondary"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4 mr-1" /> Copiado
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-4 w-4 mr-1" /> Copiar
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

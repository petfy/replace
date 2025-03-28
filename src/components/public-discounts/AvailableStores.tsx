
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Globe, SearchIcon, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface AvailableStoresProps {
  availableDiscountLinks: { domain: string; slug: string }[];
  currentBrowsingDomain: string | null;
  chromeApiAvailable: boolean;
}

export const AvailableStores = ({ availableDiscountLinks, currentBrowsingDomain, chromeApiAvailable }: AvailableStoresProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [manualDomainInput, setManualDomainInput] = useState("");
  const location = useLocation();
  
  // Check if we're on the root /discounts route (without a slug)
  const isRootDiscountsRoute = location.pathname === "/discounts";

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const handleManualDomainSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualDomainInput) {
      // Extract domain from URL if the user entered a full URL
      try {
        // Try to create a URL from the input to handle cases where the user enters a full URL
        const url = manualDomainInput.startsWith('http') 
          ? new URL(manualDomainInput).hostname.replace('www.', '')
          : manualDomainInput.replace('www.', '');
        
        console.log(`🔍 AvailableStores: Manual search for: ${url}`);
        
        // Check if this domain exists in available links
        const matchingLink = availableDiscountLinks.find(link => 
          link.domain.toLowerCase() === url.toLowerCase()
        );
        
        if (matchingLink) {
          navigate(`/discounts/${matchingLink.slug}`);
        } else {
          toast({
            title: "Tienda no encontrada",
            description: `No encontramos descuentos para ${url}`,
            variant: "destructive"
          });
        }
      } catch (error) {
        // If URL creation fails, just use the input as is
        const simpleInput = manualDomainInput.replace('www.', '');
        console.log(`🔍 AvailableStores: Manual search (not URL): ${simpleInput}`);
        
        // Check if this domain exists in available links
        const matchingLink = availableDiscountLinks.find(link => 
          link.domain.toLowerCase() === simpleInput.toLowerCase()
        );
        
        if (matchingLink) {
          navigate(`/discounts/${matchingLink.slug}`);
        } else {
          toast({
            title: "Tienda no encontrada",
            description: `No encontramos descuentos para ${simpleInput}`,
            variant: "destructive"
          });
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <img 
          src="/lovable-uploads/8135bb2c-9d94-4a47-8471-88383f309453.png"
          alt="RePlace Logo"
          className="h-16 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-primary-800">Descuentos de RePlace</h1>
        
        {!chromeApiAvailable && (
          <div className="flex items-center justify-center mt-3 gap-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Para detectar pestañas inactivas necesitas 
              <a 
                href="https://chromewebstore.google.com/detail/replace/plaafngekhmbngpcjjpflanpgcefbacl" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline ml-1"
              >
                instalar la extensión
              </a>
            </span>
          </div>
        )}
        
        {currentBrowsingDomain && (
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Estás navegando en: {currentBrowsingDomain}</span>
          </div>
        )}
        
        {/* Manual domain entry form */}
        <div className="mt-6 max-w-md mx-auto bg-sky-50 p-4 rounded-md border border-sky-200">
          <p className="text-sm font-medium mb-2">Busca descuentos por tienda:</p>
          <form onSubmit={handleManualDomainSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Ej: tiendapetfy.cl"
              value={manualDomainInput}
              onChange={(e) => setManualDomainInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <SearchIcon className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>
          <p className="text-xs text-sky-700 mt-2">
            Ingresa el dominio de la tienda (ej: tiendapetfy.cl) o la URL completa
          </p>
        </div>
      </div>

      {/* Available stores list */}
      {availableDiscountLinks.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Tiendas con descuentos disponibles</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {availableDiscountLinks.map((link) => (
              <Card 
                key={link.slug} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/discounts/${link.slug}`)}
              >
                <CardContent className="p-4 flex items-center justify-center h-24">
                  <p className="text-lg font-medium">{link.domain}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : availableDiscountLinks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">No hay tiendas con descuentos disponibles en este momento.</p>
          <Button variant="outline" className="mt-4" onClick={goToDashboard}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al dashboard
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Instala nuestra extensión de Chrome para detectar automáticamente pestañas abiertas con descuentos.</p>
          <Button className="mt-4">
            <a 
              href="https://chromewebstore.google.com/detail/replace/plaafngekhmbngpcjjpflanpgcefbacl" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center"
            >
              Instalar extensión de Chrome
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

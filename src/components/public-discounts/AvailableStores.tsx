
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Globe, SearchIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvailableStoresProps {
  availableDiscountLinks: { domain: string; slug: string }[];
  currentBrowsingDomain: string | null;
}

export const AvailableStores = ({ availableDiscountLinks, currentBrowsingDomain }: AvailableStoresProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [manualDomainInput, setManualDomainInput] = useState("");

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
        
        {currentBrowsingDomain && (
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Estás navegando en: {currentBrowsingDomain}</span>
          </div>
        )}
        
        {/* Manual domain entry form */}
        <div className="mt-6 max-w-md mx-auto">
          <p className="text-sm font-medium mb-2">Busca descuentos por tienda:</p>
          <form onSubmit={handleManualDomainSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="tiendapetfy.cl"
              value={manualDomainInput}
              onChange={(e) => setManualDomainInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <SearchIcon className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>
        </div>
      </div>

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
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">No hay tiendas con descuentos disponibles en este momento.</p>
          <Button variant="outline" className="mt-4" onClick={goToDashboard}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

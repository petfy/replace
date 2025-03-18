
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe } from "lucide-react";

interface AvailableStoresProps {
  availableDiscountLinks: { domain: string; slug: string }[];
  currentBrowsingDomain: string | null;
}

export const AvailableStores = ({ availableDiscountLinks, currentBrowsingDomain }: AvailableStoresProps) => {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/dashboard');
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


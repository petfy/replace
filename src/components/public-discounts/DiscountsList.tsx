
import { DiscountCard } from "./DiscountCard";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

interface DiscountsListProps {
  discounts: Discount[];
  urlSlug: string | undefined;
  currentBrowsingDomain: string | null;
}

export const DiscountsList = ({ discounts, urlSlug, currentBrowsingDomain }: DiscountsListProps) => {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img 
          src="/lovable-uploads/8135bb2c-9d94-4a47-8471-88383f309453.png"
          alt="RePlace Logo"
          className="h-16 mb-8"
        />
        <p className="text-lg text-gray-600">No hay descuentos activos en este momento para {urlSlug}.</p>
        <Button variant="outline" className="mt-4" onClick={goToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <img 
          src="/lovable-uploads/8135bb2c-9d94-4a47-8471-88383f309453.png"
          alt="RePlace Logo"
          className="h-16 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-primary-800">Descuentos Disponibles</h1>
        
        {currentBrowsingDomain && (
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Descuentos para: {urlSlug}</span>
          </div>
        )}
      </div>

      <div className={`grid gap-6 ${discounts.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2'}`}>
        {discounts.map((discount) => (
          <DiscountCard key={discount.id} discount={discount} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={goToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al dashboard
        </Button>
      </div>
    </div>
  );
};

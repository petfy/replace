
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Discount {
  id: string;
  code: string;
  type: 'order' | 'shipping';
  discount_type: 'percentage' | 'fixed';
  value: number;
  minimum_purchase_amount: number | null;
  valid_from: string;
  valid_until: string;
  store_id: string;
}

interface DiscountCardProps {
  discount: Discount;
  isCopied: boolean;
  onCopyCode: (code: string, storeId: string) => void;
}

export const DiscountCard = ({ discount, isCopied, onCopyCode }: DiscountCardProps) => {
  const isShippingDiscount = discount.type === 'shipping';
  
  const getDiscountValue = () => {
    if (isShippingDiscount) {
      return `Envío Gratis`;
    }
    
    if (discount.discount_type === 'percentage') {
      return `${discount.value}% de descuento`;
    }
    
    return `$${discount.value} de descuento`;
  };

  const getMinimumPurchase = () => {
    if (!discount.minimum_purchase_amount) return null;
    return `En compras desde $${discount.minimum_purchase_amount}`;
  };

  const getExpiryDate = () => {
    const date = new Date(discount.valid_until);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{getDiscountValue()}</CardTitle>
          <Badge variant={isShippingDiscount ? "secondary" : "default"}>
            {isShippingDiscount ? "Envío" : "Descuento"}
          </Badge>
        </div>
        <CardDescription className="pt-1">
          {getMinimumPurchase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
          <code className="font-mono text-sm font-semibold">{discount.code}</code>
          <Button 
            variant="ghost" 
            size="sm"
            className={isCopied ? "text-green-600" : ""}
            onClick={() => onCopyCode(discount.code, discount.store_id)}
            aria-label="Copiar código"
          >
            <Copy className="h-4 w-4 mr-1" />
            {isCopied ? "¡Copiado!" : "Copiar"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="pt-1 text-xs text-muted-foreground">
        Válido hasta {getExpiryDate()}
      </CardFooter>
    </Card>
  );
};


import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Copy, Info, ShoppingCart, Tag } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface DiscountCardProps {
  discount: any;
}

export const DiscountCard = ({ discount }: DiscountCardProps) => {
  const [copied, setCopied] = useState(false);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMMM yyyy', { locale: es });
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return 'Fecha inválida';
    }
  };
  
  const getDiscountLabel = () => {
    if (discount.discount_type === 'percentage') {
      return `${discount.value}% de descuento`;
    } else if (discount.discount_type === 'fixed_amount') {
      return `${formatCurrency(discount.value)} de descuento`;
    } else if (discount.type === 'shipping' && discount.value === 0) {
      return 'Envío Gratis';
    }
    return 'Descuento';
  };
  
  const getBadgeColor = () => {
    if (discount.type === 'shipping') {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(discount.code);
      setCopied(true);
      toast.success('¡Código copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
      
      // Track discount usage
      trackDiscountUsage();
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Error al copiar el código');
    }
  };
  
  const trackDiscountUsage = async () => {
    try {
      const storeId = discount.store_id;
      console.log('Tracking discount usage for store ID:', storeId);
      
      const response = await fetch("https://riclirqvaxqlvbhfsowh.supabase.co/functions/v1/track-store-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          event_type: "discount_usage"
        })
      });
      
      const data = await response.json();
      console.log('Discount usage tracking response:', data);
      
      if (!data.success) {
        console.error('Error tracking discount usage:', data.error);
      }
    } catch (error) {
      console.error("Error tracking discount usage:", error);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-1">
        <div className="flex justify-between items-start mb-3">
          <Badge className={getBadgeColor()} variant="secondary">
            <Tag className="h-3 w-3 mr-1" />
            {getDiscountLabel()}
          </Badge>
          {discount.minimum_purchase_amount > 0 && (
            <div className="ml-2 flex items-center text-xs text-gray-500" title={`Mínimo de compra: ${formatCurrency(discount.minimum_purchase_amount)}`}>
              <Info className="h-3 w-3 mr-1" />
              <span>Min. {formatCurrency(discount.minimum_purchase_amount)}</span>
            </div>
          )}
        </div>
        
        <div className="mb-1">
          <div className="font-mono text-lg font-bold text-center p-2 bg-gray-100 rounded-md">
            {discount.code}
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mt-3">
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>Válido hasta: {formatDate(discount.valid_until)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="default" 
          className="w-full" 
          onClick={copyToClipboard}
        >
          {copied ? (
            <span>¡Copiado!</span>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" /> CANJEAR DESCUENTO
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

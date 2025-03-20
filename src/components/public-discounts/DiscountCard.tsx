
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Copy, Info, ShoppingCart, Tag, Timer } from "lucide-react";
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { supabase } from "@/integrations/supabase/client";

interface DiscountCardProps {
  discount: any;
}

export const DiscountCard = ({ discount }: DiscountCardProps) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [revealed, setRevealed] = useState(false);
  
  useEffect(() => {
    // Set a random time between 5 and 15 minutes for the countdown
    const minutes = Math.floor(Math.random() * 10) + 5;
    const seconds = minutes * 60;
    let timeRemaining = seconds;
    
    const timer = setInterval(() => {
      timeRemaining -= 1;
      if (timeRemaining <= 0) {
        clearInterval(timer);
        setTimeLeft('¡Expirado!');
      } else {
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
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
  
  const getDiscountTitle = () => {
    if (discount.type === 'shipping') {
      return 'Envío Gratis';
    } else {
      return 'Descuento en tu compra';
    }
  };
  
  const getDiscountDescription = () => {
    if (discount.type === 'shipping' && discount.minimum_purchase_amount > 0) {
      return `Envío Gratis en compras mayores a ${formatCurrency(discount.minimum_purchase_amount)}`;
    } else if (discount.minimum_purchase_amount > 0) {
      return `${getDiscountLabel()} en compras mayores a ${formatCurrency(discount.minimum_purchase_amount)}`;
    }
    return getDiscountLabel();
  };

  const getRequirementsInfo = () => {
    if (discount.minimum_purchase_amount > 0) {
      return `Compra mínima: ${formatCurrency(discount.minimum_purchase_amount)}`;
    }
    return null;
  };
  
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  
  const trackDiscountUsage = async () => {
    if (!discount.store_id) return;
    
    try {
      const response = await fetch(`https://riclirqvaxqlvbhfsowh.supabase.co/functions/v1/track-store-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpY2xpcnF2YXhxbHZiaGZzb3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3ODI5NTIsImV4cCI6MjA1NDM1ODk1Mn0.P_BvOs4aqEI33sOI0OxofqtjiKVBn9sq_j0PF_23Kyo'}`
        },
        body: JSON.stringify({
          store_id: discount.store_id,
          event_type: 'discount_usage'
        })
      });
      
      if (!response.ok) {
        console.error('Failed to track discount usage:', await response.text());
      }
    } catch (error) {
      console.error('Error tracking discount usage:', error);
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(discount.code);
      setCopied(true);
      toast.success('¡Código copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
      setRevealed(true);
      triggerConfetti();
      
      // Track discount usage when code is copied
      await trackDiscountUsage();
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Error al copiar el código');
    }
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden relative">
      <CardContent className="pt-6 flex-1 z-10">
        <div className="flex items-center mb-3">
          {discount.type === 'shipping' ? (
            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M10 17h4V5H2v12h3m12 0h3V9h-5V5H9v2h3v10h3"/></svg>
            </div>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
              <Tag className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="ml-3">
            <h3 className="font-semibold text-lg text-primary">{getDiscountTitle()}</h3>
          </div>
        </div>
        
        <div className="text-center my-2">
          <p className="text-gray-700 mb-3 text-center font-medium">{getDiscountDescription()}</p>
        </div>
        
        <div className="mb-1">
          <div className={`font-mono text-lg font-bold text-center p-3 bg-gray-100 rounded-md transition-all ${revealed ? 'blur-none' : 'blur-sm'}`}>
            {discount.code}
          </div>
        </div>
        
        {timeLeft && (
          <div className="text-amber-600 text-center mt-3 flex items-center justify-center gap-1 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ¡Úsalo en los próximos {timeLeft}!
          </div>
        )}
        
        {getRequirementsInfo() && (
          <div className="text-gray-600 text-center mt-3 text-sm flex items-center justify-center gap-1">
            <Info className="h-4 w-4" />
            {getRequirementsInfo()}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="z-10">
        <Button 
          variant="default" 
          className="w-full" 
          onClick={copyToClipboard}
        >
          {copied ? (
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              ¡COPIADO!
            </span>
          ) : (
            <>
              {revealed ? (
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/></svg>
                  VOLVER A COPIAR
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  CANJEAR DESCUENTO
                </span>
              )}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Clock, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';

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

interface DiscountCardProps {
  discount: Discount;
}

export const DiscountCard = ({ discount }: DiscountCardProps) => {
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!timerActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C']
    });
  };

  const handleRedeemDiscount = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setIsRedeemed(true);
      setTimerActive(true);
      launchConfetti();
      
      toast({
        title: "¡Descuento copiado!",
        description: "El código ha sido copiado al portapapeles.",
      });
    } catch (err) {
      console.error('Error al copiar el código:', err);
      toast({
        title: "Error",
        description: "No se pudo copiar el código. Por favor, inténtalo manualmente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full mx-auto bg-white shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-center gap-2">
          {discount.type === 'shipping' ? (
            <>
              <Truck className="h-6 w-6 text-primary-600" />
              <span>Envío Gratis</span>
            </>
          ) : (
            'Descuento en el Pedido'
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-center">
          <p className="text-2xl font-bold text-primary-700">
            {discount.type === 'shipping' 
              ? `Envío Gratis en compras mayores a $${discount.minimum_purchase_amount}`
              : discount.discount_type === 'percentage' 
                ? `${discount.value}% de descuento`
                : `$${discount.value} de descuento`}
          </p>
          <div className="space-y-3">
            {isRedeemed ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  <code className="block w-full bg-gray-100 px-4 py-2 rounded-md text-lg font-mono">
                    {discount.code}
                  </code>
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                </div>
                <div className="flex items-center justify-center gap-2 text-amber-600 font-medium">
                  <Clock className="h-4 w-4" />
                  <span>¡Úsalo en los próximos {formatTime(timeLeft)}!</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-100 px-4 py-2 rounded-md text-lg font-mono h-10 flex items-center justify-center">
                  <span className="blur-sm select-none">••••••••••</span>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
                  onClick={() => handleRedeemDiscount(discount.code)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  CANJEAR DESCUENTO
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

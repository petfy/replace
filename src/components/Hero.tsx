
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const Hero = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-[70vh] px-4 animate-fadeIn">
      <div className={`container mx-auto ${!isMobile ? 'grid grid-cols-2 gap-8 items-center' : 'flex flex-col'}`}>
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-2xl font-bold text-primary flex items-center gap-2 mb-6">
            <img src="https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/replace-logo.png" alt="Replace Logo" className="w-6 h-6" />
            Re<span className="text-primary-700">Place</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-900">
            Tus direcciones de envío,
            <br />
            en un solo lugar
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
            Gestiona todas tus direcciones de envío en una plataforma y ahorra tiempo en tus compras online.
            Obtén descuentos exclusivos al usar RePlace.
          </p>
          <Link to="/auth">
            <Button className="text-lg px-8 py-6 bg-primary hover:bg-primary-700 transition-colors">
              Comenzar ahora <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className={`${isMobile ? 'mt-12' : ''}`}>
          <img 
            src="https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/intro%20(1).webp"
            alt="RePlace Dashboard Preview"
            className="w-full h-auto rounded-lg shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};

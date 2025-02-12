
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const Hero = () => {
  const isMobile = useIsMobile();

  const scrollToVideo = () => {
    const videoSection = document.getElementById('demo-video');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-[70vh] px-4 animate-fadeIn">
      <div className={`container mx-auto ${!isMobile ? 'grid grid-cols-2 gap-8 items-center' : 'flex flex-col'}`}>
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-xl md:text-2xl text-primary-700 font-medium mb-2">
            ¡Comprar online nunca fue tan fácil!
          </h2>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-900">
            Tus direcciones de envío,
            <br />
            en un solo lugar
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
            Gestiona todas tus direcciones de envío en una plataforma y ahorra tiempo en tus compras online.
            Obtén descuentos exclusivos al usar RePlace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth">
              <Button className="text-lg px-8 py-6 bg-primary hover:bg-primary-700 transition-colors">
                Comenzar ahora <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={scrollToVideo}
              className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary/10 transition-colors"
            >
              UN CLICK CHECKOUT LISTO <ArrowDown className="ml-2 animate-bounce" />
            </Button>
          </div>
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

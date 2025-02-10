
import { ArrowRight, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center animate-fadeIn">
      <div className="text-2xl font-bold text-primary flex items-center gap-2 mb-6">
        <Map className="w-6 h-6" />
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
  );
};

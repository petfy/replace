
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { PlatformsCarousel } from "@/components/PlatformsCarousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Map } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-primary flex items-center gap-2">
                <Map className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">RePlace</span>
          </div>
          <div>
            <Link to="/auth">
              <Button>Iniciar sesión</Button>
            </Link>
          </div>
        </div>
      </nav>
      <main>
        <Hero />
        <Features />
        <PlatformsCarousel />
      </main>
      <footer className="bg-gray-50 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Map className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">RePlace</span>
              </div>
              <p className="text-gray-600">
                Gestiona todas tus direcciones de envío en una plataforma y ahorra tiempo en tus compras online.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <p className="text-gray-600">Email: jony@jonytips.com</p>
              <p className="text-gray-600">Teléfono: +56 9 76614125</p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600">© 2024 RePlace. Todos los derechos reservados.</p>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Map } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-primary flex items-center gap-2">
            <Map className="w-6 h-6" />
            Re<span className="text-primary-700">Place</span>
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
      </main>
      <footer className="bg-gray-50 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Map className="w-6 h-6 text-primary" />
                <span className="text-2xl font-bold text-primary">Re<span className="text-primary-700">Place</span></span>
              </div>
              <p className="text-gray-600">
                Gestiona todas tus direcciones de envío en una plataforma y ahorra tiempo en tus compras online.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <p className="text-gray-600">Email: contacto@replace.com</p>
              <p className="text-gray-600">Teléfono: +56 2 2123 4567</p>
              <p className="text-gray-600">Dirección: Av. Apoquindo 4400, Las Condes, Santiago</p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600">
            <p>© 2024 RePlace. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
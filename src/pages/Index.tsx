import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { PlatformsCarousel } from "@/components/PlatformsCarousel";
import { ExtensionsCarousel } from "@/components/ExtensionsCarousel";
import { StoresBanner } from "@/components/store/StoresBanner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Index = () => {
  return <div className="min-h-screen bg-white">
      <nav className="py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-primary flex items-center gap-2 sm:mx-0 mx-auto">
            <img src="https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/replace-logo.png" alt="Replace Logo" className="h-6 w-6 text-primary mr-2" />
            <span className="text-2xl font-bold text-primary">RePlace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/stores" className="text-gray-700 hover:text-primary hidden sm:block">
              Ver Tiendas
            </Link>
            <Link to="/auth" className="hidden sm:block">
              <Button>Iniciar sesión</Button>
            </Link>
          </div>
        </div>
      </nav>
      <main>
        <Hero />
        <Features />
        <div className="container mx-auto py-8 px-[4px]">
          <StoresBanner />
        </div>
        <PlatformsCarousel />
        <div id="demo-video" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 text-primary-800">
                Ve cómo funciona RePlace
              </h2>
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">Video próximamente</p>
              </div>
            </div>
          </div>
        </div>
        <ExtensionsCarousel />
      </main>
      <footer className="bg-gray-50 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/replace-logo.png" alt="Replace Logo" className="h-6 w-6 text-primary mr-2" />
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
    </div>;
};
export default Index;
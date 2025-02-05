import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Replace</div>
          <div className="space-x-4">
            <a href="#features" className="text-gray-600 hover:text-primary transition-colors">
              Características
            </a>
            <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </nav>
      <main>
        <Hero />
        <Features />
      </main>
      <footer className="bg-gray-50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Replace. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Map, Chrome as ChromeIcon, Check, ArrowRight, Info, AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Chrome = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <Map className="h-6 w-6 text-primary mr-2" />
            <span className="text-2xl font-bold text-primary">RePlace</span>
          </Link>
          <div>
            <Link to="/auth">
              <Button>Iniciar sesión</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ChromeIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Configuración de RePlace en Chrome</h1>
          </div>

          <Alert className="mb-6 border-amber-500 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle>¿Por qué necesitas la extensión?</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Sin la extensión, RePlace no puede detectar las pestañas inactivas en Chrome.
                Esto significa que no podrá:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ver automáticamente descuentos cuando estás en un checkout</li>
                <li>Detectar páginas abiertas en otras pestañas</li>
                <li>Mostrar cupones relevantes sin búsqueda manual</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-8">
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">
                  1
                </span>
                Descargar e instalar la extensión
              </h2>
              <div className="flex items-start gap-4">
                <div className="flex-grow space-y-2">
                  <p className="text-gray-600">
                    Descarga la extensión oficial de RePlace desde la Chrome Web Store.
                  </p>
                  <div className="flex justify-start mt-2">
                    <a href="https://chromewebstore.google.com/detail/plaafngekhmbngpcjjpflanpgcefbacl?utm_source=item-share-cb" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="flex items-center gap-2">
                        <ChromeIcon className="h-4 w-4" />
                        Instalar desde Chrome Web Store
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">
                  2
                </span>
                Activar la extensión
              </h2>
              <div className="flex items-start gap-4">
                <div className="flex-grow space-y-2">
                  <p className="text-gray-600">
                    Una vez instalada la extensión, haz clic en el ícono de extensiones de Chrome 
                    (puzzle) en la barra de herramientas y busca RePlace.
                  </p>
                  <div className="flex items-center gap-2 text-primary">
                    <Info className="h-4 w-4" />
                    <span className="text-sm">Consejo: Fija la extensión para acceder más rápido</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">
                  3
                </span>
                Iniciar sesión
              </h2>
              <div className="flex items-start gap-4">
                <div className="flex-grow space-y-2">
                  <p className="text-gray-600">
                    Haz clic en el ícono de RePlace y selecciona "Iniciar sesión". 
                    Usa la misma cuenta que utilizas en la plataforma web.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">
                  4
                </span>
                ¡Listo para usar!
              </h2>
              <div className="flex items-start gap-4">
                <div className="flex-grow space-y-2">
                  <p className="text-gray-600">
                    Ya puedes usar RePlace en cualquier sitio de compras compatible. 
                    Verás el ícono de RePlace junto a los campos de dirección.
                  </p>
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">La extensión está lista para usar</span>
                  </div>
                  
                  <Alert className="mt-4 bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertTitle>Prueba de acceso</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>Para verificar que la extensión está funcionando correctamente:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Ve a <span className="font-medium">tiendapetfy.cl</span> en otra pestaña</li>
                        <li>Luego regresa a RePlace y comprueba si detecta automáticamente la pestaña</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Link to="/dashboard">
                <Button className="flex items-center gap-2">
                  Ir al dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
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

export default Chrome;

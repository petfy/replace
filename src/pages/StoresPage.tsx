
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Store as StoreIcon,
  Plus,
  Search,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "@/components/store/StoreCategories";

interface Store {
  id: string;
  name: string;
  email: string;
  category: string;
  keywords: string[];
  logo_url: string | null;
  description: string | null;
  website: string;
}

const StoresPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('stores')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          const typedStores = data.map(store => ({
            id: store.id,
            name: store.name,
            email: store.email || '',
            category: store.category || '',
            keywords: store.keywords || [],
            logo_url: store.logo_url,
            description: store.description,
            website: store.website || '',
          })) as Store[];

          setStores(typedStores);
          setFilteredStores(typedStores);

          // Extract unique categories
          const categories = typedStores
            .map(store => store.category)
            .filter((category, index, self) => 
              category && self.indexOf(category) === index
            ) as string[];
          
          setUniqueCategories(categories);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [toast, refreshKey]);

  useEffect(() => {
    let filtered = stores;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(term) ||
        store.category.toLowerCase().includes(term) ||
        store.keywords.some(keyword => keyword.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(store => 
        store.category === selectedCategory
      );
    }
    
    setFilteredStores(filtered);
  }, [searchTerm, selectedCategory, stores]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.value === categoryName);
    return category?.icon || StoreIcon;
  };

  const handleStoreClick = async (storeId: string, website: string) => {
    try {
      // Open store website in new tab
      window.open(website || '#', '_blank');
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error al abrir el sitio web de la tienda",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="py-4 px-6 bg-white border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-primary flex items-center gap-2">
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

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold">Tiendas Asociadas</h1>
          <Button onClick={() => navigate('/auth')} className="mt-2 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" /> ¿Tienes un Ecommerce? Registrate aquí
          </Button>
        </div>

        <p className="text-lg text-gray-600 mb-8">
          Descubre descuentos exclusivos en nuestras tiendas aliadas
        </p>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tiendas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="text-sm"
              >
                Todas
              </Button>
              {uniqueCategories.map((category) => {
                const CategoryIcon = getCategoryIcon(category);
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="text-sm"
                  >
                    <CategoryIcon className="h-4 w-4 mr-2" />
                    {category}
                  </Button>
                );
              })}
              <Button variant="outline" size="icon" onClick={handleRefresh} title="Actualizar listado">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-3 w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-4/6"></div>
                <div className="mt-4 flex justify-center">
                  <div className="h-10 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStores.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredStores.map((store) => (
              <div key={store.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col transition-transform hover:scale-105">
                <div className="mb-4 flex justify-center">
                  <div className="w-24 h-24 overflow-hidden rounded-lg border">
                    <AspectRatio ratio={1 / 1} className="bg-gray-100">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url}
                          alt={`${store.name} logo`}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <StoreIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </AspectRatio>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center mb-2">{store.name}</h2>
                <div className="mb-2 flex justify-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {store.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 text-center">
                  {store.description || "Sin descripción disponible"}
                </p>
                <div className="mt-auto flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => handleStoreClick(store.id, store.website)}
                    className="w-full"
                    data-replace-track
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Ver Tienda
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <StoreIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No hay tiendas disponibles</h3>
              <p className="mt-1 text-sm text-gray-500">No se encontraron tiendas que coincidan con tu búsqueda.</p>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="bg-white border-t mt-10 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} RePlace. Todos los derechos reservados.</p>
            </div>
            <div className="flex space-x-4">
              <a href="/privacy" className="text-sm text-gray-600 hover:text-primary">Política de Privacidad</a>
              <a href="/" className="text-sm text-gray-600 hover:text-primary">Términos de Servicio</a>
              <a href="/" className="text-sm text-gray-600 hover:text-primary">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoresPage;

